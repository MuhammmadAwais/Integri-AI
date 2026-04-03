import JSZip from "jszip";
import { getEncoding } from "js-tiktoken";

// Define priorities
const LOGIC_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py", ".pyw", ".go", ".rs",
  ".java", ".kt", ".kts", ".cs", ".rb", ".php", ".swift", ".c", ".cpp", ".cc", ".h", ".hpp",
  ".css", ".scss", ".sass", ".less", ".vue", ".svelte", ".sql", ".sh", ".bash", ".zsh",
  ".graphql", ".gql"
]);
const CONFIG_EXTENSIONS = new Set([
  ".json", ".yaml", ".yml", ".toml", ".env.example"
]);
const DOCS_EXTENSIONS = new Set([
  ".md", ".mdx", ".html", ".htm", ".txt", ".csv"
]);

const BLOCKED_PATHS = new Set([
  "node_modules", ".git", ".svn", "dist", "build", "out", "coverage", ".next", ".nuxt",
  ".cache", "__pycache__", ".pytest_cache", "venv", ".venv", "env", ".env", "vendor", ".DS_Store"
]);

const BLOCKED_FILENAMES = new Set([
  "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "composer.lock", "Gemfile.lock",
  "Cargo.lock", "poetry.lock", "bun.lockb", ".gitignore", ".npmignore", ".dockerignore"
]);

const BLOCKED_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp", ".svg", ".ico",
  ".mp4", ".mp3", ".mov", ".avi", ".mkv", ".webm",
  ".pdf", ".zip", ".tar", ".gz", ".rar", ".7z",
  ".woff", ".woff2", ".ttf", ".eot", ".otf",
  ".exe", ".bin", ".dll", ".so", ".dylib",
  ".pyc", ".pyo", ".min.js", ".min.css", ".map",
]);

interface ExtractedFile {
  path: string;
  category: "logic" | "config" | "docs";
  text: string;
  tokens: number;
}

function getExtension(path: string): string {
  const lower = path.toLowerCase();
  const doubleExt = lower.match(/(?:\.\w+){2}$/);
  if (doubleExt && BLOCKED_EXTENSIONS.has(doubleExt[0])) return doubleExt[0];
  const singleExt = lower.match(/\.\w+$/);
  return singleExt ? singleExt[0] : "";
}

function isPathBlocked(filePath: string): boolean {
  const segments = filePath.split("/");
  const filename = segments[segments.length - 1];

  for (const seg of segments) {
    if (BLOCKED_PATHS.has(seg)) return true;
  }
  if (BLOCKED_FILENAMES.has(filename)) return true;
  const ext = getExtension(filename);
  if (BLOCKED_EXTENSIONS.has(ext)) return true;

  return false;
}

function getCategory(filePath: string): "logic" | "config" | "docs" | null {
  const ext = getExtension(filePath);
  if (LOGIC_EXTENSIONS.has(ext)) return "logic";
  if (CONFIG_EXTENSIONS.has(ext)) return "config";
  if (DOCS_EXTENSIONS.has(ext)) return "docs";
  return null;
}

self.onmessage = async (e: MessageEvent) => {
  const { buffer, repoUrl } = e.data;
  const MAX_TOKEN_BUDGET = 1_000_000;

  try {
    self.postMessage({ type: "progress", phase: "Packing Logic...", indexed: 0, total: 100 });
    
    const zip = await JSZip.loadAsync(buffer);
    const enc = getEncoding("cl100k_base");
    
    let totalFilesCount = Object.keys(zip.files).length;
    let indexed = 0;

    const logicFiles: ExtractedFile[] = [];
    const configFiles: ExtractedFile[] = [];
    const docsFiles: ExtractedFile[] = [];

    for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
      indexed++;
      if (indexed % 100 === 0) {
        self.postMessage({ type: "progress", phase: "Packing Logic...", indexed, total: totalFilesCount });
      }

      if (zipEntry.dir) continue;

      // Extract the top level folder from the zip structure since github zips include a root wrapper folder
      const actualPathMatch = relativePath.match(/^[^/]+\/(.*)/);
      const cleanPath = actualPathMatch ? actualPathMatch[1] : relativePath;

      if (!cleanPath || isPathBlocked(cleanPath)) continue;

      const category = getCategory(cleanPath);
      if (!category) continue;

      const text = await zipEntry.async("string");
      const tokens = enc.encode(text).length;
      
      const extractedInfo = { path: cleanPath, category, text, tokens };
      if (category === "logic") logicFiles.push(extractedInfo);
      else if (category === "config") configFiles.push(extractedInfo);
      else docsFiles.push(extractedInfo);
    }
    
    self.postMessage({ type: "progress", phase: "Counting Tokens...", indexed: totalFilesCount, total: totalFilesCount });

    // Truncate logic based on priorities
    let totalTokens = 0;
    let finalFiles: ExtractedFile[] = [];
    let isOverLimit = false;

    // Sort files by directory depth to prioritize root/main files, then alphabetically
    const sorter = (a: ExtractedFile, b: ExtractedFile) => {
      const depthA = a.path.split("/").length;
      const depthB = b.path.split("/").length;
      if (depthA !== depthB) return depthA - depthB;
      return a.path.localeCompare(b.path);
    };

    logicFiles.sort(sorter);
    configFiles.sort(sorter);
    docsFiles.sort(sorter);

    const checkAndPush = (files: ExtractedFile[]) => {
      for (const file of files) {
        if (totalTokens + file.tokens > MAX_TOKEN_BUDGET) {
          isOverLimit = true;
          // We don't partial truncate file content here for simplicity, just skip the file entirely
          continue;
        }
        totalTokens += file.tokens;
        finalFiles.push(file);
      }
    };

    checkAndPush(logicFiles);
    checkAndPush(configFiles);
    checkAndPush(docsFiles);

    // Build the final XML
    const xmlLines: string[] = [`<repository url="${repoUrl}">`];
    for (const file of finalFiles) {
      xmlLines.push(`<file path="${file.path}">\n${file.text}\n</file>`);
    }
    xmlLines.push("</repository>");
    const compiledXml = xmlLines.join("\n");

    self.postMessage({
      type: "done",
      compiledXml,
      totalTokens,
      fileCount: finalFiles.length,
      isOverLimit
    });
    
  } catch (err: any) {
    self.postMessage({ type: "error", message: err.message || "Unknown worker error" });
  }
};
