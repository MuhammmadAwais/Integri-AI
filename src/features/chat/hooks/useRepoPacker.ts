/**
 * useRepoPacker.ts
 *
 * The Logic Engine — performs a "Forensic Crawl" of a GitHub repository.
 *
 * Architecture:
 *  1. Parses the GitHub URL → owner, repo, branch
 *  2. Fetches the full recursive tree (1 API call for the entire repo)
 *  3. Filters noise: node_modules, .git, lockfiles, images, binaries
 *  4. Fetches raw file content in parallel batches of 10 (rate-limit friendly)
 *  5. Packs everything into a single XML-tagged repo_context.txt blob
 *  6. Counts tokens via js-tiktoken (cl100k_base)
 *  7. Dispatches setAttachedRepo to Redux with metadata + File blob
 *
 * Bottleneck mitigations:
 *  - Parallel batching (10 concurrent) with 100ms inter-batch delay
 *  - 900K token soft cap (truncates low-priority files beyond the cap)
 *  - 100KB per-file size limit
 *  - Single recursive tree call avoids per-directory API calls
 */

import { useState, useCallback } from "react";
import { useAppDispatch } from "../../../hooks/useRedux";
import { setAttachedRepo } from "../chatSlice";
import { useGitHubOAuth } from "./useGitHubOAuth";
import { getEncoding } from "js-tiktoken";
import { repoBlobStore } from "../services/repoBlobStore";
import { jsPDF } from "jspdf";

// ── Constants ──────────────────────────────────────────────────────────────

const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 100;
const MAX_FILE_BYTES = 100_000; // 100KB per file
const TOKEN_SOFT_CAP = 900_000; // Stop packing at 900K tokens
const TOKEN_WARN_LIMIT = 1_000_000; // Show warning banner above 1M

// File extensions we actively WANT
const ALLOWED_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".py", ".pyw",
  ".go",
  ".rs",
  ".java", ".kt", ".kts",
  ".cs",
  ".rb",
  ".php",
  ".swift",
  ".c", ".cpp", ".cc", ".h", ".hpp",
  ".html", ".htm",
  ".css", ".scss", ".sass", ".less",
  ".md", ".mdx",
  ".sql",
  ".sh", ".bash", ".zsh",
  ".yaml", ".yml",
  ".json",
  ".toml",
  ".env.example",
  ".graphql", ".gql",
  ".vue", ".svelte",
]);

// Directories + files to always skip (noise)
const BLOCKED_PATHS = new Set([
  "node_modules",
  ".git",
  ".svn",
  "dist",
  "build",
  "out",
  "coverage",
  ".next",
  ".nuxt",
  ".cache",
  "__pycache__",
  ".pytest_cache",
  "venv",
  ".venv",
  "env",
  ".env",
  "vendor",
  ".DS_Store",
]);

// Lockfiles and generated files to skip
const BLOCKED_FILENAMES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "composer.lock",
  "Gemfile.lock",
  "Cargo.lock",
  "poetry.lock",
  "bun.lockb",
  ".gitignore",
  ".npmignore",
  ".dockerignore",
]);

// Image / binary extensions to skip
const BLOCKED_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp", ".svg", ".ico",
  ".mp4", ".mp3", ".mov", ".avi", ".mkv", ".webm",
  ".pdf", ".zip", ".tar", ".gz", ".rar", ".7z",
  ".woff", ".woff2", ".ttf", ".eot", ".otf",
  ".exe", ".bin", ".dll", ".so", ".dylib",
  ".pyc", ".pyo",
  ".min.js", ".min.css",
  ".map",
]);

// ── Types ──────────────────────────────────────────────────────────────────

export type PackerStatus =
  | "idle"
  | "fetching_tree"
  | "crawling"
  | "packing"
  | "done"
  | "error";

export interface PackerProgress {
  indexed: number;
  total: number;
  phase: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function parseGitHubUrl(url: string): {
  owner: string;
  repo: string;
  branch: string | null;
} | null {
  try {
    const cleaned = url.replace(/\/$/, "");
    // Handles: https://github.com/owner/repo
    //          https://github.com/owner/repo/tree/main
    //          https://github.com/owner/repo/tree/feat/some-branch
    const match = cleaned.match(
      /github\.com\/([^/]+)\/([^/]+?)(?:\/tree\/(.+))?$/
    );
    if (!match) return null;
    return {
      owner: match[1],
      repo: match[2].replace(/\.git$/, ""),
      branch: match[3] ?? null,
    };
  } catch {
    return null;
  }
}

function getExtension(path: string): string {
  const lower = path.toLowerCase();
  // Check double extensions first (e.g. .min.js)
  const doubleExt = lower.match(/(\.\w+\.\w+)$/);
  if (doubleExt && BLOCKED_EXTENSIONS.has(doubleExt[1])) return doubleExt[1];
  const singleExt = lower.match(/(\.\w+)$/);
  return singleExt ? singleExt[1] : "";
}

function isPathBlocked(filePath: string): boolean {
  const segments = filePath.split("/");
  const filename = segments[segments.length - 1];

  // Block if any path segment is in the blocked set
  for (const seg of segments) {
    if (BLOCKED_PATHS.has(seg)) return true;
  }

  // Block by filename
  if (BLOCKED_FILENAMES.has(filename)) return true;

  // Block by extension
  const ext = getExtension(filename);
  if (BLOCKED_EXTENSIONS.has(ext)) return true;

  // Allow only whitelisted extensions
  if (!ALLOWED_EXTENSIONS.has(ext)) return true;

  return false;
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * Process an array of async tasks in parallel batches.
 * @param items  Array of items to process
 * @param fn     Async function to call for each item
 * @param size   Batch size (default = BATCH_SIZE)
 */
async function batchProcess<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  size = BATCH_SIZE
): Promise<(R | null)[]> {
  const results: (R | null)[] = [];
  for (let i = 0; i < items.length; i += size) {
    const batch = items.slice(i, i + size);
    const batchResults = await Promise.all(
      batch.map((item) => fn(item).catch(() => null))
    );
    results.push(...batchResults);
    if (i + size < items.length) await sleep(BATCH_DELAY_MS);
  }
  return results;
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useRepoPacker() {
  const dispatch = useAppDispatch();
  const { getOctokit, isConnected } = useGitHubOAuth();

  const [status, setStatus] = useState<PackerStatus>("idle");
  const [progress, setProgress] = useState<PackerProgress>({
    indexed: 0,
    total: 0,
    phase: "",
  });
  const [error, setError] = useState<string | null>(null);

  const packRepo = useCallback(
    async (repoUrl: string) => {
      setStatus("idle");
      setError(null);
      setProgress({ indexed: 0, total: 0, phase: "" });

      // ── Step 1: Parse URL ──────────────────────────────────────────────
      const parsed = parseGitHubUrl(repoUrl.trim());
      if (!parsed) {
        setError("Invalid GitHub URL. Try: https://github.com/owner/repo");
        setStatus("error");
        return;
      }

      const { owner, repo } = parsed;
      const octokit = getOctokit();

      try {
        // ── Step 2: Get default branch if not in URL ───────────────────
        setStatus("fetching_tree");
        setProgress({ indexed: 0, total: 0, phase: "Fetching repo info..." });

        let branch = parsed.branch;
        if (!branch) {
          const { data: repoData } = await octokit.rest.repos.get({
            owner,
            repo,
          });
          branch = repoData.default_branch;
        }

        // ── Step 3: Fetch the FULL recursive tree (1 API call) ─────────
        setProgress({ indexed: 0, total: 0, phase: "Fetching file tree..." });

        const { data: treeData } = await octokit.rest.git.getTree({
          owner,
          repo,
          tree_sha: branch,
          recursive: "1",
        });

        // Filter to blobs (files) only, excluding noise
        const allFiles = (treeData.tree || []).filter(
          (item) =>
            item.type === "blob" &&
            item.path &&
            !isPathBlocked(item.path) &&
            (item.size ?? 0) <= MAX_FILE_BYTES
        );

        if (allFiles.length === 0) {
          setError("No relevant source files found in this repository.");
          setStatus("error");
          return;
        }

        setProgress({
          indexed: 0,
          total: allFiles.length,
          phase: "Indexed 0 / " + allFiles.length + " files",
        });

        // ── Step 4: Fetch file contents in parallel batches ────────────
        setStatus("crawling");
        let indexedCount = 0;
        const enc = getEncoding("cl100k_base");
        let totalTokens = 0;
        let truncated = false;

        // We'll accumulate packed XML content
        const packedChunks: string[] = [
          `<repository owner="${owner}" repo="${repo}" branch="${branch}">\n`,
        ];

        await batchProcess(
          allFiles,
          async (item) => {
            if (truncated) return; // Stop fetching once token cap is hit

            try {
              const { data: fileData } =
                await octokit.rest.repos.getContent({
                  owner,
                  repo,
                  path: item.path!,
                  ref: branch!,
                });

              // getContent returns base64 for files
              if (
                "content" in fileData &&
                fileData.content &&
                fileData.encoding === "base64"
              ) {
                const raw = atob(fileData.content.replace(/\n/g, ""));

                // Token accounting
                const fileTokens = enc.encode(raw).length;
                if (totalTokens + fileTokens > TOKEN_SOFT_CAP) {
                  truncated = true;
                  return;
                }
                totalTokens += fileTokens;

                const chunk = `<file path="${item.path}">\n${raw}\n</file>\n`;
                packedChunks.push(chunk);
              }
            } catch {
              // Skip files that 404 or error (e.g., submodules, symlinks)
            } finally {
              indexedCount++;
              setProgress({
                indexed: indexedCount,
                total: allFiles.length,
                phase: `Indexed ${indexedCount} / ${allFiles.length} files`,
              });
            }
          },
          BATCH_SIZE
        );

        // ── Step 5: Finalise the XML pack ──────────────────────────────
        setStatus("packing");
        setProgress({
          indexed: indexedCount,
          total: allFiles.length,
          phase: "Packing context file...",
        });

        packedChunks.push("</repository>");
        const fullPack = packedChunks.join("");

        // ── Step 5b: Render XML content into a multi-page PDF ─────────
        // Backend requires application/pdf — we use jsPDF with Courier monospace
        // and tight margins so the AI receives dense, readable code context.
        setProgress({
          indexed: indexedCount,
          total: allFiles.length,
          phase: "Rendering PDF...",
        });

        const doc = new jsPDF({
          orientation: "portrait",
          unit: "pt",
          format: "a4",
        });

        const PAGE_WIDTH  = doc.internal.pageSize.getWidth();
        const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
        const MARGIN_X    = 20;   // pt — minimal left/right margin
        const MARGIN_TOP  = 20;   // pt
        const MARGIN_BOT  = 20;   // pt
        const FONT_SIZE   = 7;    // pt — dense but legible for AI parsing
        const LINE_HEIGHT = FONT_SIZE * 1.25; // 8.75pt
        const MAX_WIDTH   = PAGE_WIDTH - MARGIN_X * 2;

        doc.setFont("Courier");
        doc.setFontSize(FONT_SIZE);

        // splitTextToSize handles long lines by wrapping at MAX_WIDTH
        const lines = doc.splitTextToSize(fullPack, MAX_WIDTH);

        let y = MARGIN_TOP + FONT_SIZE; // baseline of the first line
        for (const line of lines) {
          if (y + LINE_HEIGHT > PAGE_HEIGHT - MARGIN_BOT) {
            doc.addPage();
            doc.setFont("Courier");
            doc.setFontSize(FONT_SIZE);
            y = MARGIN_TOP + FONT_SIZE;
          }
          doc.text(line, MARGIN_X, y);
          y += LINE_HEIGHT;
        }

        const pdfBlob = doc.output("blob");
        const packFile = new File([pdfBlob], "repo_context.pdf", {
          type: "application/pdf",
        });

        const fileCount = packedChunks.length - 2; // minus opening + closing tags
        const isOverLimit = totalTokens > TOKEN_WARN_LIMIT;

        // ── Step 6: Store blob out-of-band, dispatch only serializable metadata ─
        repoBlobStore.set(packFile);

        dispatch(
          setAttachedRepo({
            owner,
            repo,
            branch,
            tokenCount: totalTokens,
            fileCount: Math.max(fileCount, 0),
            isOverLimit,
          })
        );

        setStatus("done");
      } catch (err: any) {
        console.error("[useRepoPacker] Error:", err);

        if (err?.status === 404) {
          setError(
            "Repository not found. Check the URL, or connect your GitHub account for private repos."
          );
        } else if (err?.status === 403 || err?.status === 429) {
          setError(
            "GitHub API rate limit reached. Connect your GitHub account for a higher limit, or try again in a minute."
          );
        } else if (err?.status === 401) {
          setError(
            "GitHub authentication expired. Please reconnect your account."
          );
        } else {
          setError(err?.message || "An unexpected error occurred.");
        }

        setStatus("error");
      }
    },
    [dispatch, getOctokit]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setProgress({ indexed: 0, total: 0, phase: "" });
  }, []);

  return {
    packRepo,
    reset,
    status,
    progress,
    error,
    isConnected,
  };
}
