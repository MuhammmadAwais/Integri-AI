/**
 * Supplies the built index.html that previews are injected into.
 *
 * The function and Hosting deploy independently and index.html references
 * content-hashed bundles, so a copy bundled with the function would go stale
 * on the next site deploy. It is fetched from Hosting instead and held in
 * instance memory. /index.html is a real static file, so Hosting serves it
 * directly and the rewrites that route here never apply to it — no loop.
 *
 * Every request revalidates the copy (If-None-Match / If-Modified-Since, a
 * cheap 304 from the CDN). A time-based cache used to keep serving the
 * previous deploy's index.html for minutes after a release; its JavaScript
 * file no longer exists then, so those pages could not start, and the CDN
 * kept the broken HTML.
 */

import { logger } from "firebase-functions";

const FETCH_TIMEOUT_MS = 5000;

let cached: { html: string; origin: string; etag: string | null; lastModified: string | null } | null = null;

export async function getTemplate(origin: string): Promise<string> {
  const url = `${origin}/index.html`;
  const headers: Record<string, string> = { "User-Agent": "Integri-AI-Preview-Renderer/1.0" };
  if (cached && cached.origin === origin) {
    if (cached.etag) headers["If-None-Match"] = cached.etag;
    if (cached.lastModified) headers["If-Modified-Since"] = cached.lastModified;
  }

  let res: Response;
  try {
    res = await fetch(url, { headers, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  } catch (err) {
    if (cached && cached.origin === origin) {
      logger.warn("index.html revalidation failed; serving cached template", err);
      return cached.html;
    }
    throw err;
  }

  if (res.status === 304 && cached) return cached.html;
  if (!res.ok) {
    // A stale template still renders correct OG tags, so prefer it over failing.
    if (cached && cached.origin === origin) {
      logger.warn(`index.html fetch failed (${res.status}); serving cached template`);
      return cached.html;
    }
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();
  cached = { html, origin, etag: res.headers.get("etag"), lastModified: res.headers.get("last-modified") };
  return html;
}

/** Test seam / cache reset. */
export function clearTemplateCache(): void {
  cached = null;
}
