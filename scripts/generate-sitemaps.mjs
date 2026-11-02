/**
 * Writes the static child sitemaps into dist/ after `vite build`:
 *
 *   dist/sitemaps/pages.xml          indexable static routes
 *   dist/sitemaps/blog.xml           published Blogs        -> /blog/{id}
 *   dist/sitemaps/news-N.xml         live News              -> /news/{id}
 *   dist/sitemaps/articles-N.xml     live Articles          -> /articles/{id}
 *   dist/sitemaps/static-index.json  the files above + each past day's newest country story
 *
 * /sitemap.xml and the daily country story files are served live by the
 * newsSitemap function, which reads static-index.json. Do not write
 * dist/sitemap.xml: Hosting would serve it instead of the function.
 *
 * Firestore is read over its public REST API with the web API key, i.e. with
 * exactly the access the website itself has, so no service account is needed
 * on the build machine.
 *
 * Fails the build instead of writing a sitemap that only lists static routes:
 * a renamed collection or a lost API key must not silently ship a useless file.
 */

import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

// ── Config — confirm these against Firestore before changing ─────────────────

const ORIGIN = "https://www.integri.app";

/** Indexable static routes. Mirrors SITEMAP_PATHS in src/config/seo.ts. */
const STATIC_PAGES = [
  { path: "/", changefreq: "daily", priority: 1.0 },
  { path: "/news", changefreq: "daily", priority: 0.9 },
  { path: "/blog", changefreq: "daily", priority: 0.9 },
  { path: "/agents", changefreq: "weekly", priority: 0.9 },
  { path: "/playground", changefreq: "weekly", priority: 0.9 },
  { path: "/voice", changefreq: "weekly", priority: 0.8 },
  { path: "/pdf", changefreq: "weekly", priority: 0.8 },
  { path: "/imageGen", changefreq: "weekly", priority: 0.8 },
  { path: "/subscriptions", changefreq: "weekly", priority: 0.8 },
  { path: "/help", changefreq: "monthly", priority: 0.6 },
  { path: "/contactUs", changefreq: "monthly", priority: 0.5 },
  { path: "/privacy-policy", changefreq: "yearly", priority: 0.3 },
  { path: "/terms", changefreq: "yearly", priority: 0.3 },
  // Static landing pages in public/syria (Arabic + English, hreflang-linked)
  { path: "/syria", changefreq: "weekly", priority: 0.8 },
  { path: "/syria/en", changefreq: "weekly", priority: 0.8 },
  { path: "/sudan", changefreq: "weekly", priority: 0.8 },
  { path: "/sudan/en", changefreq: "weekly", priority: 0.8 },
];

/**
 * `isLive` decides what may be published to Google.
 *  - Blogs: `status` is "published" | "draft" (the blog page queries
 *    status == "published").
 *  - News / Articles: `status` is "Approved" | "Published" | "Pending" |
 *    "Draft", or absent on documents written before the review workflow
 *    existed. Pending and Draft are unreviewed and stay out.
 */
const COLLECTIONS = [
  {
    name: "Blogs",
    file: "blog",
    path: (id) => `/blog/${id}`,
    fields: ["status", "updatedAt", "createdAt"],
    isLive: (f) => f.status === "published",
    lastmod: (f) => f.updatedAt || f.createdAt,
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    name: "News",
    file: "news",
    path: (id) => `/news/${id}`,
    fields: ["status", "date", "updatedAt", "createdAt"],
    isLive: (f) => f.status === undefined || f.status === "Approved" || f.status === "Published",
    lastmod: (f) => f.updatedAt || f.date || f.createdAt,
    changefreq: "weekly",
    priority: 0.6,
  },
  {
    name: "Articles",
    file: "articles",
    path: (id) => `/articles/${id}`,
    fields: ["status", "date", "updatedAt", "createdAt"],
    isLive: (f) => f.status === undefined || f.status === "Approved" || f.status === "Published",
    lastmod: (f) => f.updatedAt || f.date || f.createdAt,
    changefreq: "monthly",
    priority: 0.7,
  },
];

/**
 * Country news collections (NewsGermany, NewsUR, …) and their URL slugs,
 * read from the ssrPreview function's map so the sitemap and the server
 * agree on every story's canonical path.
 */
async function readCountryCollections() {
  const text = await readFile(join(root, "functions/src/newsCountries.ts"), "utf8");
  const block = text.slice(text.indexOf("COLLECTION_TO_SLUG"), text.indexOf("};"));
  const map = [...block.matchAll(/"([^"]+)":\s*"([^"]+)"/g)].map(([, collection, slug]) => ({ collection, slug }));
  if (map.length === 0) throw new Error("No country collections found in functions/src/newsCountries.ts");
  return map;
}

const COUNTRY_NEWS = {
  fields: ["status", "date"],
  // Stories always carry a date; this also drops settings docs such as `_meta`.
  isLive: (f, id) =>
    !id.startsWith("_") && Boolean(f.date) && (f.status === undefined || f.status === "Approved" || f.status === "Published"),
};

/** Google's limit is 50,000 URLs per sitemap file. */
const MAX_URLS_PER_FILE = 45_000;

// ── Environment ──────────────────────────────────────────────────────────────

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

/** Reads KEY from process.env, then from the Vite env files in priority order. */
async function readEnv(key) {
  if (process.env[key]) return process.env[key].trim();
  for (const file of [".env.production.local", ".env.local", ".env.production", ".env"]) {
    const path = join(root, file);
    if (!existsSync(path)) continue;
    const text = await readFile(path, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(new RegExp(`^\\s*${key}\\s*=\\s*(.*)$`));
      if (m) return m[1].trim().replace(/^["']|["']$/g, "");
    }
  }
  return undefined;
}

async function readProjectId() {
  const fromEnv = await readEnv("VITE_FIREBASE_PROJECT_ID");
  if (fromEnv) return fromEnv;
  const rc = JSON.parse(await readFile(join(root, ".firebaserc"), "utf8"));
  return rc.projects.default;
}

// ── Firestore REST ───────────────────────────────────────────────────────────

/** Unwraps the subset of Firestore REST value types these fields use. */
function plain(value) {
  if (!value) return undefined;
  if ("stringValue" in value) return value.stringValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("booleanValue" in value) return value.booleanValue;
  if ("nullValue" in value) return undefined;
  return undefined;
}

async function listCollection({ projectId, apiKey, name, fields }) {
  const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${name}`;
  const docs = [];
  let pageToken;

  do {
    const params = new URLSearchParams({ pageSize: "1000", key: apiKey });
    for (const f of fields) params.append("mask.fieldPaths", f);
    if (pageToken) params.set("pageToken", pageToken);

    const res = await fetch(`${base}?${params}`);
    if (!res.ok) {
      throw new Error(`Firestore ${name}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
    }
    const body = await res.json();
    for (const doc of body.documents ?? []) {
      const data = {};
      for (const [k, v] of Object.entries(doc.fields ?? {})) data[k] = plain(v);
      docs.push({ id: doc.name.split("/").pop(), data });
    }
    pageToken = body.nextPageToken;
  } while (pageToken);

  return docs;
}

// ── XML ──────────────────────────────────────────────────────────────────────

const escapeXml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Full date, time and timezone, or undefined for a missing or unreadable value. */
function isoTime(value) {
  const date = new Date(value ?? NaN);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function urlset(entries) {
  const urls = entries
    .map(({ loc, lastmod, changefreq, priority }) =>
      [
        "  <url>",
        `    <loc>${escapeXml(loc)}</loc>`,
        isoTime(lastmod) ? `    <lastmod>${isoTime(lastmod)}</lastmod>` : null,
        changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
        priority !== undefined ? `    <priority>${priority.toFixed(1)}</priority>` : null,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n")
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

const latest = (dates) => dates.map(isoTime).filter(Boolean).sort().at(-1);

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(dist)) throw new Error("dist/ not found — run vite build first");

  const apiKey = await readEnv("VITE_FIREBASE_API_KEY");
  if (!apiKey) throw new Error("VITE_FIREBASE_API_KEY is not set (env or .env files)");
  const projectId = await readProjectId();

  // Pages answered with 410 Gone by the ssrPreview function stay out too.
  const goneSrc = await readFile(join(root, "functions/src/gone.ts"), "utf8");
  const gone = new Set([...goneSrc.matchAll(/"([A-Za-z0-9]{20})"/g)].map((m) => m[1]));

  const outDir = join(dist, "sitemaps");
  await rm(outDir, { recursive: true, force: true });
  await rm(join(dist, "sitemap.xml"), { force: true });
  await mkdir(outDir, { recursive: true });

  const today = new Date().toISOString();
  const children = [];

  const write = async (file, entries) => {
    await writeFile(join(outDir, file), urlset(entries), "utf8");
    children.push({ loc: `${ORIGIN}/sitemaps/${file}`, lastmod: latest(entries.map((e) => e.lastmod)) });
  };

  // No lastmod: a build does not change these pages, and Google stops trusting a date that always moves.
  await write(
    "pages.xml",
    STATIC_PAGES.map((p) => ({ loc: `${ORIGIN}${p.path}`, changefreq: p.changefreq, priority: p.priority }))
  );
  console.log(`  pages      ${STATIC_PAGES.length} URL(s)`);

  for (const c of COLLECTIONS) {
    const docs = await listCollection({ projectId, apiKey, name: c.name, fields: c.fields });
    const live = docs.filter((d) => c.isLive(d.data) && !(c.name === "News" && gone.has(d.id)));
    if (live.length === 0) {
      throw new Error(
        `${c.name}: 0 publishable documents out of ${docs.length} — check the collection name and isLive() in generate-sitemaps.mjs`
      );
    }

    const entries = live
      .map((d) => ({ loc: `${ORIGIN}${c.path(d.id)}`, lastmod: c.lastmod(d.data), changefreq: c.changefreq, priority: c.priority }))
      .sort((a, b) => (b.lastmod ?? "").localeCompare(a.lastmod ?? ""));

    if (entries.length <= MAX_URLS_PER_FILE) {
      await write(`${c.file}.xml`, entries);
    } else {
      for (let i = 0; i * MAX_URLS_PER_FILE < entries.length; i++) {
        await write(`${c.file}-${i + 1}.xml`, entries.slice(i * MAX_URLS_PER_FILE, (i + 1) * MAX_URLS_PER_FILE));
      }
    }
    console.log(`  ${c.file.padEnd(10)} ${live.length} URL(s)  (${docs.length - live.length} unpublished skipped)`);
  }

  // ── Country stories: served live, one file per day. Only the day list is built here. ──
  const countries = await readCountryCollections();
  const perCountry = await Promise.all(
    countries.map(async ({ collection }) => {
      const docs = await listCollection({ projectId, apiKey, name: collection, fields: COUNTRY_NEWS.fields });
      return docs.filter((d) => COUNTRY_NEWS.isLive(d.data, d.id) && !gone.has(d.id)).map((d) => isoTime(d.data.date));
    })
  );
  const storyTimes = perCountry.flat().filter(Boolean);
  if (storyTimes.length === 0) throw new Error("Country news: 0 publishable stories across all country collections");
  // The function reads the build day onward itself, so only finished days are listed.
  const days = {};
  for (const time of storyTimes) {
    const day = time.slice(0, 10);
    if (day < today.slice(0, 10) && time > (days[day] ?? "")) days[day] = time;
  }
  console.log(`  country    ${storyTimes.length} stories over ${Object.keys(days).length} past day(s) from ${countries.length} collections`);

  // ── Mobile top-up shop: every country x page language, hreflang-linked ──
  const topupPath = join(dist, "shopping/mobile-top-up/data.json");
  if (existsSync(topupPath)) {
    const { langs, countries } = JSON.parse(await readFile(topupPath, "utf8"));
    const base = `${ORIGIN}/shopping/mobile-top-up`;
    const urls = countries.flatMap((c) => {
      const alternates = [...langs.map((l) => [l, `${base}/${c.slug}/${l}`]), ["x-default", `${base}/${c.slug}/en`]]
        .map(([l, href]) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${escapeXml(href)}"/>`)
        .join("\n");
      return langs.map((l) =>
        ["  <url>", `    <loc>${escapeXml(`${base}/${c.slug}/${l}`)}</loc>`, `    <lastmod>${today.slice(0, 10)}</lastmod>`, "    <changefreq>weekly</changefreq>", alternates, "  </url>"].join("\n")
      );
    });
    // The overview of all countries.
    urls.unshift(["  <url>", `    <loc>${escapeXml(base)}</loc>`, `    <lastmod>${today.slice(0, 10)}</lastmod>`, "    <changefreq>weekly</changefreq>", "  </url>"].join("\n"));
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`;
    await writeFile(join(outDir, "mobile-top-up.xml"), xml, "utf8");
    children.push({ loc: `${ORIGIN}/sitemaps/mobile-top-up.xml`, lastmod: today });
    console.log(`  top-up     ${urls.length} URL(s) (${countries.length} countries x ${langs.length} languages)`);
  }

  // Enterprise landing site (landing/ -> /enterprise): its own hreflang sitemap.
  if (existsSync(join(dist, "enterprise", "sitemap-languages.xml"))) {
    children.push({ loc: `${ORIGIN}/enterprise/sitemap-languages.xml`, lastmod: today });
    console.log("  enterprise landing sitemap-languages.xml included");
  }

  await writeFile(join(outDir, "static-index.json"), JSON.stringify({ generatedAt: today, children, days }), "utf8");
  console.log(`[generate-sitemaps] wrote dist/sitemaps/static-index.json with ${children.length} static sitemap(s)`);
}

main().catch((err) => {
  console.error("[generate-sitemaps] failed:", err.message);
  process.exit(1);
});
