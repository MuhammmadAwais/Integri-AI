/**
 * Route parsing for the Open Graph pre-renderer.
 *
 * Canonical article routes (also real React Router routes in src/app/App.tsx):
 *   /news/:id        -> News collection
 *   /articles/:id    -> Articles collection
 *   /blog/:slug      -> Blogs collection
 *
 * Legacy routes. The Flutter app shipped share links in these shapes before
 * they were pointed at the canonical routes, so links already out in the wild
 * still have to resolve. They render the same preview and declare the
 * canonical URL, plus a client-side hop so real browsers land on the SPA route.
 *   /News/:id                 (always News, even for articles — old default)
 *   /News/News/:id
 *   /News/Articles/:id
 *   /Article/:id , /Articles/:id
 *   /share/news/:id?collection=News|Articles
 */

export type Collection = "News" | "Articles" | "Blogs";

export interface Route {
  collection: Collection;
  /** Document id, or slug for Blogs. */
  key: string;
  /** Path this content canonically lives at. */
  canonicalPath: string;
  /** True when the request came in on a legacy alias path. */
  legacy: boolean;
}

/** Firestore auto-ids and blog slugs. Anything else is not ours to resolve. */
const KEY_RE = /^[A-Za-z0-9_-]{1,160}$/;

function canonicalPathFor(collection: Collection, key: string): string {
  switch (collection) {
    case "News":
      return `/news/${key}`;
    case "Articles":
      return `/articles/${key}`;
    case "Blogs":
      return `/blog/${key}`;
  }
}

function make(collection: Collection, key: string, legacy: boolean): Route | null {
  if (!KEY_RE.test(key)) return null;
  return { collection, key, canonicalPath: canonicalPathFor(collection, key), legacy };
}

/** Maps the `collection` value the app stores (Firestore `_collection`). */
function collectionFromName(name: string | undefined): Collection {
  return (name ?? "").toLowerCase().startsWith("article") ? "Articles" : "News";
}

/**
 * @param pathname  Request path, without query string.
 * @param query     Parsed query string, for /share/news/:id?collection=…
 */
export function parseRoute(
  pathname: string,
  query: Record<string, unknown> = {}
): Route | null {
  const segments = pathname.split("/").filter(Boolean).map(decodeURIComponent);

  // ── Canonical ──────────────────────────────────────────────────────
  if (segments.length === 2) {
    const [head, key] = segments;
    if (head === "news") return make("News", key, false);
    if (head === "articles") return make("Articles", key, false);
    if (head === "blog") return make("Blogs", key, false);
  }

  // ── Legacy: /News/:id, /Article/:id, /Articles/:id ─────────────────
  if (segments.length === 2) {
    const [head, key] = segments;
    if (head === "News") return make("News", key, true);
    if (head === "Article" || head === "Articles") return make("Articles", key, true);
  }

  // ── Legacy: /News/<collection>/:id ────────────────────────────────
  if (segments.length === 3 && segments[0] === "News") {
    return make(collectionFromName(segments[1]), segments[2], true);
  }

  // ── Legacy: /share/news/:id?collection=News|Articles ──────────────
  if (segments.length === 3 && segments[0] === "share" && segments[1] === "news") {
    const raw = query.collection;
    const name = Array.isArray(raw) ? raw[0] : raw;
    return make(collectionFromName(typeof name === "string" ? name : undefined), segments[2], true);
  }

  return null;
}
