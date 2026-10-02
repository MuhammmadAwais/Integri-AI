/**
 * Supplies the built index.html that previews are injected into.
 *
 * The function and Hosting deploy independently and index.html references
 * content-hashed bundles, so a copy bundled with the function would go stale
 * on the next site deploy. It is fetched from Hosting instead and held in
 * instance memory. /index.html is a real static file, so Hosting serves it
 * directly and the rewrites that route here never apply to it — no loop.
 */

import { logger } from "firebase-functions";

const TTL_MS = 5 * 60 * 1000;
const FETCH_TIMEOUT_MS = 5000;

let cached: { html: string; origin: string; at: number } | null = null;

export async function getTemplate(origin: string): Promise<string> {
  const now = Date.now();
  if (cached && cached.origin === origin && now - cached.at < TTL_MS) {
    return cached.html;
  }

  const url = `${origin}/index.html`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Integri-AI-Preview-Renderer/1.0" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!res.ok) {
    // A stale template still renders correct OG tags, so prefer it over failing.
    if (cached) {
      logger.warn(`index.html fetch failed (${res.status}); serving cached template`);
      return cached.html;
    }
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();
  cached = { html, origin, at: now };
  return html;
}

/** Test seam / cache reset. */
export function clearTemplateCache(): void {
  cached = null;
}
