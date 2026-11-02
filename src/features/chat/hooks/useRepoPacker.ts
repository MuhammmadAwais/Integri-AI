/**
 * useRepoPacker.ts
 *
 * The Logic Engine — performs a "Forensic Crawl" of a GitHub repository via zipball.
 *
 * Architecture:
 *  1. Parses the GitHub URL → owner, repo, branch
 *  2. "Pre-flight" HEAD request for Content-Length (100MB limit) and ETag checking.
 *  3. Fetches the zipball (1 API call).
 *  4. Off-Main-Thread extraction via `repoPackerWorker`.
 *  5. Render the returned XML string into a multi-page PDF with 6pt Courier font.
 *  6. Dispatches to Redux.
 */

import { useState, useCallback, useRef } from "react";
import { useAppDispatch } from "../../../hooks/useRedux";
import { setAttachedRepo } from "../chatSlice";
import { repoBlobStore } from "../services/repoBlobStore";
import PackWorker from "../services/repoPackerWorker?worker";

const MAX_ZIP_BYTES = 50 * 1024 * 1024; // 50MB

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

function parseGitHubUrl(url: string): { owner: string; repo: string; branch: string | null } | null {
  try {
    const cleaned = url.replace(/\/$/, "");
    const match = cleaned.match(/github\.com\/([^/]+)\/([^/]+?)(?:\/tree\/(.+))?$/);
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

function handleRateLimit(headers: Headers): string | null {
  const remaining = headers.get("x-ratelimit-remaining");
  if (remaining === "0") {
    const reset = headers.get("x-ratelimit-reset");
    if (reset) {
      const resetDate = new Date(parseInt(reset, 10) * 1000);
      const minutes = Math.ceil((resetDate.getTime() - Date.now()) / 60000);
      return `GitHub Rate Limit Reached! Resets in ${minutes} minutes.`;
    }
    return "GitHub Rate Limit Reached! Please try again later.";
  }
  return null;
}

export function useRepoPacker() {
  const dispatch = useAppDispatch();
  const workerRef = useRef<Worker | null>(null);

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

      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }

      const parsed = parseGitHubUrl(repoUrl.trim());
      if (!parsed) {
        setError("Invalid GitHub URL. Try: https://github.com/owner/repo");
        setStatus("error");
        return;
      }

      const { owner, repo, branch } = parsed;
      const refAttr = branch ? `/${branch}` : "";
      const targetZipUrl = `https://api.github.com/repos/${owner}/${repo}/zipball${refAttr}`;
      const zipUrl = `/api/proxy-repo?url=${encodeURIComponent(targetZipUrl)}`;
      const etagKey = `gh-etag-${owner}-${repo}-${branch || "default"}`;
      const cacheKey = `gh-cache-${owner}-${repo}-${branch || "default"}`;

      try {
        setStatus("fetching_tree");
        setProgress({ indexed: 0, total: 0, phase: "Waking Edge Proxy..." });

        const cachedEtag = localStorage.getItem(etagKey);
        
        // 1. Pre-flight HEAD Request
        const fetchOptions: RequestInit = {
          method: "HEAD",
        };
        if (cachedEtag) {
          fetchOptions.headers = { "If-None-Match": cachedEtag };
        }

        const headRes = await fetch(zipUrl, fetchOptions).catch((err) => {
          console.error("Proxy HEAD request failed:", err);
          return null;
        });

        if (headRes === null) {
          throw new Error("Unable to connect to the proxy. Is the server running?");
        }

        if (!headRes.ok && headRes.status !== 304) {
          if (headRes.status === 403 || headRes.status === 429) {
            const limitMsg = handleRateLimit(headRes.headers);
            if (limitMsg) throw new Error(limitMsg);
            throw new Error("GitHub API rate limit exceeded.");
          }
          if (headRes.status === 404) {
            throw new Error("Repository not found. Ensure it is public.");
          }
          throw new Error(`GitHub Error: ${headRes.status} - ${headRes.statusText}`);
        }

        let arrayBuffer: ArrayBuffer;

        // 1.1 ETag Cache Logic — Fast-path
        if (headRes.status === 304) {
          const cachedPayload = localStorage.getItem(cacheKey);
          if (cachedPayload) {
            try {
              const parsed = JSON.parse(cachedPayload);
              // Directly reconstruct from cache
              compilePdfAndDispatch(parsed, owner, repo, branch || "default");
              return; 
            } catch (e) {
              // Cache corruption? Fall back to full download
              localStorage.removeItem(cacheKey);
              localStorage.removeItem(etagKey);
            }
          }
        }

        const contentLengthStr = headRes.headers.get("content-length");
        if (contentLengthStr) {
          const bytes = parseInt(contentLengthStr, 10);
          if (bytes > MAX_ZIP_BYTES) {
            throw new Error(`Repository zip is too large (${(bytes/1024/1024).toFixed(1)}MB). Limit is 100MB.`);
          }
        }

        // 2. Fetch the actual zip
        setProgress({ indexed: 0, total: 0, phase: "Downloading Archive..." });
        const getRes = await fetch(zipUrl, { method: "GET" });
        if (!getRes.ok) throw new Error("Failed to download repository archive.");
        
        const newEtag = getRes.headers.get("etag");
        arrayBuffer = await getRes.arrayBuffer();

        // Binary Zip Signature Validation (PK\x03\x04)
        if (arrayBuffer.byteLength < 4) {
          throw new Error("Invalid ZIP format received from proxy (too small).");
        }
        const signature = new Uint8Array(arrayBuffer.slice(0, 4));
        if (signature[0] !== 0x50 || signature[1] !== 0x4B || signature[2] !== 0x03 || signature[3] !== 0x04) {
          // It's likely a text-based error message (HTML/JSON) from the proxy instead of a binary zip
          const decoder = new TextDecoder();
          const textPreview = decoder.decode(arrayBuffer.slice(0, 100));
          console.error("Invalid ZIP signature. Content preview:", textPreview);
          throw new Error("Invalid ZIP format received from proxy.");
        }

        if (newEtag) localStorage.setItem(etagKey, newEtag);

        // 3. Initiate Web Worker
        setStatus("crawling");
        
        workerRef.current = new PackWorker();
        workerRef.current.onmessage = (e) => {
          const { type, phase, indexed, total, compiledXml, totalTokens, fileCount, isOverLimit, message } = e.data;
          
          if (type === "progress") {
            setProgress({ indexed, total, phase });
          } else if (type === "error") {
            setError(message);
            setStatus("error");
            workerRef.current?.terminate();
          } else if (type === "done") {
            setStatus("packing");
            setProgress({ indexed: total, total, phase: "Compiling PDF..." });

            // Store compilation in localstorage for instant 304 handling next time
            const payload = { compiledXml, totalTokens, fileCount, isOverLimit };
            try { localStorage.setItem(cacheKey, JSON.stringify(payload)); } catch {}

            compilePdfAndDispatch(payload, owner, repo, branch || "default");
            workerRef.current?.terminate();
          }
        };

        workerRef.current.postMessage({ buffer: arrayBuffer, repoUrl }, [arrayBuffer]);
        
      } catch (err: any) {
        setError(err?.message || "An unexpected error occurred.");
        setStatus("error");
      }
    },
    [dispatch]
  );

  const compilePdfAndDispatch = async (payload: any, owner: string, repo: string, branch: string) => {
    try {
      // jsPDF (+ PNG and zip helpers, ~700 KB) loads only when a repo is packed.
      const { jsPDF } = await import("jspdf");
      const { compiledXml, totalTokens, fileCount, isOverLimit } = payload;
      
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const PAGE_WIDTH  = doc.internal.pageSize.getWidth();
      const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
      const MARGIN_X    = 20; 
      const MARGIN_TOP  = 20;
      const MARGIN_BOT  = 20;
      const FONT_SIZE   = 6;  // Courier 6pt per strict AI instruction
      const LINE_HEIGHT = FONT_SIZE * 1.25; 
      const MAX_WIDTH   = PAGE_WIDTH - MARGIN_X * 2;

      doc.setFont("Courier");
      doc.setFontSize(FONT_SIZE);

      const lines = doc.splitTextToSize(compiledXml, MAX_WIDTH);
      let y = MARGIN_TOP + FONT_SIZE;
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
      const packFile = new File([pdfBlob], "Repo_Context.pdf", {
        type: "application/pdf",
      });

      repoBlobStore.set(packFile);

      dispatch(
        setAttachedRepo({
          owner,
          repo,
          branch,
          tokenCount: totalTokens,
          fileCount,
          isOverLimit,
        })
      );

      setStatus("done");
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      setError("Failed to compile PDF context.");
      setStatus("error");
    }
  };

  const reset = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setStatus("idle");
    setError(null);
    setProgress({ indexed: 0, total: 0, phase: "" });
  }, []);

  return { packRepo, reset, status, progress, error, isConnected: false }; // isConnected mock since we only do public repos now
}
