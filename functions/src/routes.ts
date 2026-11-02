/**
 * Route parsing for the Open Graph pre-renderer.
 *
 * Canonical article routes (also real React Router routes in src/app/App.tsx):
 *   /news/:country/:id -> that country's collection (e.g. /news/germany/:id -> NewsGermany)
 *   /news/:id          -> News collection (legacy, pre-country stories)
 *   /articles/:id      -> Articles collection
 *   /blog/:slug        -> Blogs collection
 *
 * Legacy routes. The Flutter app shipped share links in these shapes before
 * they were pointed at the canonical routes, so links already out in the wild
 * still have to resolve. They render the same preview and declare the
 * canonical URL, plus a client-side hop so real browsers land on the SPA route.
 *   /News/:id                 (always News, even for articles — old default)
 *   /News/News/:id
 *   /News/Articles/:id
 *   /Article/:id , /Articles/:id
 *   /share/news/:id?collection=News|Articles|<country collection>
 *   /news/:id?collection=<country collection> , /articles/:id?collection=…
 */

import { COLLECTION_TO_SLUG, SLUG_TO_COLLECTION } from "./newsCountries";

export type Collection = "News" | "Articles" | "Blogs";

export interface Route {
  collection: Collection;
  /** Firestore collection to read: "News", "Articles", "Blogs" or a country one ("NewsGermany"). */
  firestoreCollection: string;
  /** Document id, or slug for Blogs. */
  key: string;
  /** Path this content canonically lives at. */
  canonicalPath: string;
  /** True when the request came in on an alias path; browsers get moved to canonicalPath. */
  legacy: boolean;
}

/** Firestore auto-ids and blog slugs. Anything else is not ours to resolve. */
const KEY_RE = /^[A-Za-z0-9_-]{1,160}$/;

/** Path a document canonically lives at. */
export function canonicalPathFor(firestoreCollection: string, key: string): string {
  const slug = COLLECTION_TO_SLUG[firestoreCollection];
  if (slug) return `/news/${slug}/${key}`;
  switch (firestoreCollection) {
    case "Articles":
      return `/articles/${key}`;
    case "Blogs":
      return `/blog/${key}`;
    default:
      return `/news/${key}`;
  }
}

function make(collection: Collection, key: string, legacy: boolean, firestoreCollection: string = collection): Route | null {
  if (!KEY_RE.test(key)) return null;
  const canonicalPath = canonicalPathFor(firestoreCollection, key);
  return { collection, firestoreCollection, key, canonicalPath, legacy };
}

/** A country collection named in ?collection=, if any. */
function queryCountryCollection(query: Record<string, unknown>): string | null {
  const raw = query.collection;
  const name = Array.isArray(raw) ? raw[0] : raw;
  return typeof name === "string" && COLLECTION_TO_SLUG[name] ? name : null;
}

/** Maps the `collection` value the app stores (Firestore `_collection`). */
function collectionFromName(name: string | undefined): Collection {
  return (name ?? "").toLowerCase().startsWith("article") ? "Articles" : "News";
}

/**
 * @param pathname  Request path, without query string.
 * @param query     Parsed query string (?collection=…).
 */
export function parseRoute(
  pathname: string,
  query: Record<string, unknown> = {}
): Route | null {
  const segments = pathname.split("/").filter(Boolean).map(decodeURIComponent);
  const countryCollection = queryCountryCollection(query);

  // ── Canonical: /news/:country/:id ─────────────────────────────────
  if (segments.length === 3 && segments[0] === "news") {
    const firestoreCollection = SLUG_TO_COLLECTION[segments[1].toLowerCase()];
    return firestoreCollection ? make("News", segments[2], false, firestoreCollection) : null;
  }

  // ── Canonical (or ?collection= alias of a country story) ──────────
  if (segments.length === 2) {
    const [head, key] = segments;
    if ((head === "news" || head === "articles") && countryCollection) {
      return make("News", key, true, countryCollection);
    }
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
    const named = COLLECTION_TO_SLUG[segments[1]] ? segments[1] : null;
    return named
      ? make("News", segments[2], true, named)
      : make(collectionFromName(segments[1]), segments[2], true);
  }

  // ── Legacy: /share/news/:id?collection=… ──────────────────────────
  if (segments.length === 3 && segments[0] === "share" && segments[1] === "news") {
    if (countryCollection) return make("News", segments[2], true, countryCollection);
    const raw = query.collection;
    const name = Array.isArray(raw) ? raw[0] : raw;
    return make(collectionFromName(typeof name === "string" ? name : undefined), segments[2], true);
  }

  return null;
}

/** The same document, found in a different (country) collection. */
export function relocate(route: Route, firestoreCollection: string): Route {
  return {
    ...route,
    collection: "News",
    firestoreCollection,
    canonicalPath: canonicalPathFor(firestoreCollection, route.key),
    legacy: true,
  };
}
