/**
 * Writes the sitemap index and its child sitemaps into dist/ after `vite build`:
 *
 *   dist/sitemap.xml                 sitemap index
 *   dist/sitemaps/pages.xml          indexable static routes
 *   dist/sitemaps/blog.xml           published Blogs        -> /blog/{id}
 *   dist/sitemaps/news-N.xml         live News              -> /news/{id}
 *   dist/sitemaps/articles-N.xml     live Articles          -> /articles/{id}
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

function urlset(entries) {
  const urls = entries
    .map(({ loc, lastmod, changefreq, priority }) =>
      [
        "  <url>",
        `    <loc>${escapeXml(loc)}</loc>`,
        lastmod ? `    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : null,
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

function sitemapIndex(children) {
  const items = children
    .map(({ loc, lastmod }) =>
      ["  <sitemap>", `    <loc>${escapeXml(loc)}</loc>`, lastmod ? `    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : null, "  </sitemap>"]
        .filter(Boolean)
        .join("\n")
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>\n`;
}

const latest = (dates) => dates.filter(Boolean).sort().at(-1);

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(dist)) throw new Error("dist/ not found — run vite build first");

  const apiKey = await readEnv("VITE_FIREBASE_API_KEY");
  if (!apiKey) throw new Error("VITE_FIREBASE_API_KEY is not set (env or .env files)");
  const projectId = await readProjectId();

  const outDir = join(dist, "sitemaps");
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const today = new Date().toISOString();
  const children = [];

  const write = async (file, entries) => {
    await writeFile(join(outDir, file), urlset(entries), "utf8");
    children.push({ loc: `${ORIGIN}/sitemaps/${file}`, lastmod: latest(entries.map((e) => e.lastmod)) ?? today });
  };

  await write(
    "pages.xml",
    STATIC_PAGES.map((p) => ({ loc: `${ORIGIN}${p.path}`, lastmod: today, changefreq: p.changefreq, priority: p.priority }))
  );
  console.log(`  pages      ${STATIC_PAGES.length} URL(s)`);

  for (const c of COLLECTIONS) {
    const docs = await listCollection({ projectId, apiKey, name: c.name, fields: c.fields });
    const live = docs.filter((d) => c.isLive(d.data));
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

  await writeFile(join(dist, "sitemap.xml"), sitemapIndex(children), "utf8");
  console.log(`[generate-sitemaps] wrote dist/sitemap.xml with ${children.length} child sitemap(s)`);
}

main().catch((err) => {
  console.error("[generate-sitemaps] failed:", err.message);
  process.exit(1);
});
