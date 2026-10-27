/**
 * Google News sitemap (brief 2f): country stories published in the last
 * 48 hours, at /sitemaps/google-news.xml (Hosting rewrite). Generated on
 * request from Firestore and cached at the CDN for 15 minutes, so it is
 * never stale the way a build-time file would be.
 * https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap
 */

import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { COLLECTION_TO_SLUG } from "./newsCountries";
import { escapeHtml } from "./seo";

const ORIGIN = "https://www.integri.app";
const WINDOW_MS = 48 * 60 * 60 * 1000;
/** Google reads at most 1,000 URLs from a news sitemap. */
const MAX_URLS = 1000;

const isLive = (status: unknown) => status === undefined || status === "Approved" || status === "Published";

/**
 * The headline the bare URL serves and its language: English when the story
 * has it, else its first language (the same pick ssrPreview makes), so
 * <news:language> always matches the title.
 */
function defaultHeadline(value: unknown): { title: string; lang: string } {
  if (typeof value === "string") return { title: value, lang: "en" };
  if (value && typeof value === "object") {
    const map = value as Record<string, unknown>;
    const codes = Object.keys(map).filter((k) => typeof map[k] === "string" && (map[k] as string).trim()).sort();
    const lang = codes.includes("en") ? "en" : codes[0];
    if (lang) return { title: map[lang] as string, lang };
  }
  return { title: "", lang: "en" };
}

export async function renderNewsSitemap(): Promise<string> {
  const since = Timestamp.fromMillis(Date.now() - WINDOW_MS);
  const db = getFirestore();

  const perCountry = await Promise.all(
    Object.entries(COLLECTION_TO_SLUG).map(async ([collection, slug]) => {
      const snap = await db
        .collection(collection)
        .where("date", ">=", since)
        .select("date", "headline", "status")
        .get()
        .catch(() => null); // One collection failing must not empty the whole sitemap.
      if (!snap) return [];
      return snap.docs
        .filter((d) => !d.id.startsWith("_") && isLive(d.get("status")))
        .map((d) => ({
          loc: `${ORIGIN}/news/${slug}/${d.id}`,
          date: (d.get("date") as Timestamp).toDate(),
          ...defaultHeadline(d.get("headline")),
        }))
        .filter((e) => e.title);
    })
  );

  const entries = perCountry
    .flat()
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, MAX_URLS);

  const urls = entries
    .map(
      (e) => `  <url>
    <loc>${escapeHtml(e.loc)}</loc>
    <news:news>
      <news:publication><news:name>Integri News</news:name><news:language>${escapeHtml(e.lang)}</news:language></news:publication>
      <news:publication_date>${e.date.toISOString()}</news:publication_date>
      <news:title>${escapeHtml(e.title)}</news:title>
    </news:news>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>
`;
}
