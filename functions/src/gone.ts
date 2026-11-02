/**
 * Pages removed on purpose: answered with 410 Gone and left out of the
 * sitemap (scripts/generate-sitemaps.mjs reads this list).
 *
 * 2025 news stories Google reported as soft 404s (too thin to index).
 */
export const GONE_NEWS_IDS = new Set<string>([
  "WW5ZuQjcT5bLJPOfmpNW",
  "m49bHpUbA0YL9nYTI4Tu",
  "1t5l8FvltbGFoZrObUYn",
  "Vpb6FF29oStpREH0Ro27",
]);
