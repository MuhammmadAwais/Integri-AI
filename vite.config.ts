/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import type { IncomingMessage, ServerResponse } from 'http'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'

/**
 * Dev-only: serves the enterprise landing site (landing/) at /enterprise,
 * /enterprise/de, … and its images under /enterprise/assets, the way Hosting
 * does after `npm run build` (scripts/install-landing.mjs), with the same URL
 * rewriting. Absolute https://www.integri.app links are made relative so
 * they stay on localhost. Everything else falls through to the React app.
 */
function devLandingPlugin() {
  const landing = resolve(__dirname, 'landing')
  const types: Record<string, string> = {
    '.html': 'text/html; charset=utf-8', '.xml': 'application/xml', '.webp': 'image/webp',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  }
  const langs = () =>
    readdirSync(landing, { withFileTypes: true })
      .filter((e) => e.isDirectory() && existsSync(join(landing, e.name, 'index.html')))
      .map((e) => e.name)
  return {
    name: 'dev-landing',
    apply: 'serve' as const,
    configureServer(server: any) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const path = decodeURIComponent((req.url ?? '/').split('?')[0])
        if (path !== '/enterprise' && !path.startsWith('/enterprise/')) return next()
        const rest = path.slice('/enterprise'.length).replace(/^\/+|\/+$/g, '')
        const file = normalize(join(landing, rest, extname(rest) ? '' : 'index.html'))
        if (!file.startsWith(landing) || !existsSync(file) || !statSync(file).isFile()) return next()

        const { transformLanding } = await import('./scripts/landing-transform.mjs')
        const type = types[extname(file)] ?? 'application/octet-stream'
        res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' })
        if (!type.startsWith('text/html') && type !== 'application/xml') return res.end(readFileSync(file))
        const text = transformLanding(readFileSync(file, 'utf8'), langs())
        res.end(type.startsWith('text/html') ? text.replace(/https:\/\/www\.integri\.app\//g, '/') : text)
      })
    },
  }
}

/**
 * Dev-only Vite middleware that replicates api/proxy-repo.ts for local development.
 *
 * WHY THIS EXISTS:
 *  - api/proxy-repo.ts is a Vercel Edge Function — it only runs inside the Vercel
 *    runtime (production / `vercel dev`).
 *  - When running `vite dev`, Vite has no idea about Vercel functions and just
 *    serves the raw .ts source file when /api/proxy-repo is requested.
 *  - The browser then gets TypeScript source text instead of a binary ZIP, causing
 *    the "Invalid ZIP signature" error.
 *
 * This plugin intercepts /api/proxy-repo during `vite dev` and proxies the
 * request directly to GitHub (following the 302 redirect to S3 that GitHub
 * returns for zipball URLs), streaming the real ZIP back to the browser.
 *
 * In production, this plugin is NEVER active (apply: 'serve'), so the real
 * Vercel edge function handles everything as intended.
 */
function devRepoProxyPlugin() {
  return {
    name: 'dev-repo-proxy',
    apply: 'serve' as const, // active ONLY during `vite dev` — never in build/production
    configureServer(server: any) {
      server.middlewares.use(
        '/api/proxy-repo',
        async (req: IncomingMessage, res: ServerResponse) => {
          // ── CORS Preflight ──────────────────────────────────────────────────
          if (req.method === 'OPTIONS') {
            res.writeHead(204, {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
              'Access-Control-Allow-Headers': 'if-none-match, authorization',
            });
            res.end();
            return;
          }

          // ── Extract ?url= query param ───────────────────────────────────────
          let targetUrl: string | null = null;
          try {
            targetUrl = new URL(`http://localhost${req.url ?? ''}`).searchParams.get('url');
          } catch {
            // malformed URL — let it fall through to a 400
          }

          if (!targetUrl) {
            res.writeHead(400, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
            res.end('Missing url parameter');
            return;
          }

          try {
            // ── Build request headers for GitHub ─────────────────────────────
            const fetchHeaders: Record<string, string> = {
              'User-Agent': 'Integri-AI-App',
              // Accept header that GitHub requires for the API
              'Accept': 'application/vnd.github+json',
            };

            // Forward ETag so GitHub can return 304 Not Modified
            const ifNoneMatch = req.headers['if-none-match'];
            if (ifNoneMatch) {
              fetchHeaders['If-None-Match'] = Array.isArray(ifNoneMatch)
                ? ifNoneMatch[0]
                : ifNoneMatch;
            }

            // Boost rate limit from 60 → 5000 req/h if a token is available
            const githubToken = process.env.GITHUB_TOKEN;
            if (githubToken) {
              fetchHeaders['Authorization'] = `Bearer ${githubToken}`;
            }

            // ── Proxy to GitHub (redirect: follow handles the 302 → S3) ──────
            // GitHub's zipball API always returns a 302 redirect to a signed S3
            // URL. Node 18+ fetch() follows it automatically.
            const githubRes = await fetch(targetUrl, {
              method: req.method ?? 'GET',
              headers: fetchHeaders,
              redirect: 'follow',
            });

            // ── Build response headers ────────────────────────────────────────
            const outHeaders: Record<string, string | number> = {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
              'Content-Type': 'application/zip',
            };

            // Relay headers that the frontend relies on
            const headersToRelay = [
              'etag',
              'content-length',
              'x-ratelimit-remaining',
              'x-ratelimit-reset',
              'x-ratelimit-used',
              'x-ratelimit-limit',
            ];
            for (const h of headersToRelay) {
              const val = githubRes.headers.get(h);
              if (val) outHeaders[h] = val;
            }

            res.writeHead(githubRes.status, outHeaders);

            // ── Stream the body (the actual ZIP bytes) ────────────────────────
            // For HEAD requests there's no body — just end immediately.
            if (req.method === 'HEAD' || !githubRes.body) {
              res.end();
              return;
            }

            const reader = githubRes.body.getReader();
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                // value is a Uint8Array — wrap in Buffer for Node's http.ServerResponse
                res.write(Buffer.from(value));
              }
            } finally {
              reader.releaseLock();
              res.end();
            }

          } catch (err: any) {
            console.error('[dev-repo-proxy] Proxy error:', err?.message ?? err);
            if (!res.headersSent) {
              res.writeHead(500, {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*',
              });
            }
            res.end(err?.message ?? 'Internal dev proxy error');
          }
        }
      );
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [devLandingPlugin(), react(), tailwindcss(), devRepoProxyPlugin()],
  test: {
    environment: 'jsdom',
  },
  server: {
    proxy: {
      '/api/v1/chat': {
        target: 'https://integri.cloud',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
      // Top-up shop catalogue (dev only; checkout itself stays restricted to integri.app)
      '/recharge/web': {
        target: 'https://www.integri.app',
        changeOrigin: true,
        secure: true,
      },
      '/api/v1': {
        target: 'https://integri.cloud',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
