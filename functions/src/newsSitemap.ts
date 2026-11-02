/**
 * Sitemaps generated on request from Firestore, so they are never stale the
 * way a build-time file would be. Hosting rewrites these paths here:
 *
 *   /sitemap.xml                    index: static files + every day file
 *   /sitemaps/news/YYYY/MM/DD.xml   country stories published that UTC day
 *   /sitemaps/google-news.xml       Google News sitemap (brief 2f), last 48 h
 *
 * Hosting serves a static file before any rewrite, so the build must not write
 * dist/sitemap.xml. It writes dist/sitemaps/static-index.json instead (see
 * scripts/generate-sitemaps.mjs): the static child sitemaps, plus each past
 * day's newest story so the index does not read 70,000 documents per render.
 * https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap
 */

import { getFirestore, QueryDocumentSnapshot, Timestamp } from "firebase-admin/firestore";
import { GONE_NEWS_IDS } from "./gone";
import { COLLECTION_TO_SLUG } from "./newsCountries";
import { escapeHtml } from "./seo";

const ORIGIN = "https://www.integri.app";
const MANIFEST_URL = `${ORIGIN}/sitemaps/static-index.json`;
const MANIFEST_TIMEOUT_MS = 5000;
const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_MS = 2 * DAY_MS;
/** Google reads at most 1,000 URLs from a news sitemap. */
const MAX_URLS = 1000;

const CACHE_LIVE = "public, max-age=300, s-maxage=900";
const CACHE_SETTLED = "public, max-age=3600, s-maxage=86400";

const DAY_PATH = /^\/sitemaps\/news\/(\d{4})\/(\d{2})\/(\d{2})\.xml$/;

export interface SitemapPage {
  xml: string;
  cacheControl: string;
  lastModified?: Date;
}

interface StaticManifest {
  /** ISO time of the build: `days` is complete for every UTC day before it. */
  generatedAt: string;
  children: { loc: string; lastmod?: string }[];
  /** UTC day (YYYY-MM-DD) -> ISO time of its newest story. */
  days: Record<string, string>;
}

const isPublished = (d: QueryDocumentSnapshot) => {
  const status = d.get("status");
  return (
    !d.id.startsWith("_") &&
    !GONE_NEWS_IDS.has(d.id) &&
    (status === undefined || status === "Approved" || status === "Published")
  );
};

const startOfUtcDay = (ms: number) => ms - (ms % DAY_MS);
const dayKey = (ms: number) => new Date(ms).toISOString().slice(0, 10);
/** Some source dates run hours ahead; a sitemap must not claim a future time. */
const notFuture = (date: Date, now: number) => new Date(Math.min(date.getTime(), now));

/** Throws if any collection fails: a partial day file must not be cached for 24 h. */
async function fetchStories(startMs: number, endMs: number) {
  const perCountry = await Promise.all(
    Object.entries(COLLECTION_TO_SLUG).map(async ([collection, slug]) => {
      const snap = await getFirestore()
        .collection(collection)
        .where("date", ">=", Timestamp.fromMillis(startMs))
        .where("date", "<", Timestamp.fromMillis(endMs))
        .select("date", "status")
        .get();
      return snap.docs.filter(isPublished).map((d) => ({
        loc: `${ORIGIN}/news/${slug}/${d.id}`,
        date: (d.get("date") as Timestamp).toDate(),
      }));
    })
  );
  return perCountry.flat();
}

async function fetchManifest(): Promise<StaticManifest> {
  const res = await fetch(MANIFEST_URL, { signal: AbortSignal.timeout(MANIFEST_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`Failed to fetch ${MANIFEST_URL}: ${res.status}`);
  return (await res.json()) as StaticManifest;
}

function sitemapXml(children: { loc: string; lastmod?: string }[]): string {
  const items = children
    .map((c) =>
      ["  <sitemap>", `    <loc>${escapeHtml(c.loc)}</loc>`, c.lastmod ? `    <lastmod>${c.lastmod}</lastmod>` : null, "  </sitemap>"]
        .filter(Boolean)
        .join("\n")
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</sitemapindex>
`;
}

async function renderIndex(now: number): Promise<SitemapPage> {
  const manifest = await fetchManifest();
  const today = startOfUtcDay(now);

  // Everything the build could not have seen, and yesterday's late arrivals.
  const liveFrom = Math.min(startOfUtcDay(Date.parse(manifest.generatedAt)), today - DAY_MS);
  const stories = await fetchStories(liveFrom, today + WINDOW_MS);

  const days = new Map(Object.entries(manifest.days));
  for (let day = liveFrom; day <= today; day += DAY_MS) days.delete(dayKey(day));
  let newest = "";
  for (const story of stories) {
    // A future-dated story sits in today's file (see renderDay).
    const key = dayKey(Math.min(story.date.getTime(), today));
    const lastmod = notFuture(story.date, now).toISOString();
    if (lastmod > (days.get(key) ?? "")) days.set(key, lastmod);
    if (lastmod > newest) newest = lastmod;
  }

  const dayChildren = [...days.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([day, lastmod]) => ({ loc: `${ORIGIN}/sitemaps/news/${day.replace(/-/g, "/")}.xml`, lastmod }));

  const googleNews = { loc: `${ORIGIN}/sitemaps/google-news.xml`, lastmod: newest || undefined };
  return {
    xml: sitemapXml([...manifest.children, googleNews, ...dayChildren]),
    cacheControl: CACHE_LIVE,
    lastModified: new Date(now),
  };
}

/** Null when the path is not a real day that has stories. */
async function renderDay(path: string, now: number): Promise<SitemapPage | null> {
  const match = DAY_PATH.exec(path);
  if (!match) return null;
  const start = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (dayKey(start) !== `${match[1]}-${match[2]}-${match[3]}`) return null; // e.g. 02/31

  const today = startOfUtcDay(now);
  if (start > today) return null;

  // Today's file also holds stories dated ahead into tomorrow, so they are not
  // missing from every listed file until that day starts.
  const stories = await fetchStories(start, start === today ? start + WINDOW_MS : start + DAY_MS);
  if (stories.length === 0) return null;

  const entries = stories
    .map((s) => ({ loc: s.loc, date: notFuture(s.date, now) }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const urls = entries
    .map((e) => `  <url>\n    <loc>${escapeHtml(e.loc)}</loc>\n    <lastmod>${e.date.toISOString()}</lastmod>\n  </url>`)
    .join("\n");

  return {
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
    // Yesterday stays short: a story can be written with a slightly older source date.
    cacheControl: start >= today - DAY_MS ? CACHE_LIVE : CACHE_SETTLED,
    lastModified: entries[0].date,
  };
}

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

async function renderNewsSitemap(): Promise<string> {
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
        .filter(isPublished)
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

/** Null for a path that is not a sitemap. */
export async function renderSitemap(path: string, now = Date.now()): Promise<SitemapPage | null> {
  if (path === "/sitemap.xml") return renderIndex(now);
  if (path === "/sitemaps/google-news.xml") {
    return { xml: await renderNewsSitemap(), cacheControl: CACHE_LIVE };
  }
  return renderDay(path, now);
}
