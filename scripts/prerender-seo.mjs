/**
 * Writes one static HTML file per marketing route into dist/, each carrying
 * that page's own title, description, canonical and Open Graph tags, plus its
 * copy inside the two crawler shells index.html already ships.
 *
 * Replaces the Vercel edge function api/home-preview.ts. Hosting serves these
 * files directly from the CDN — no function, no User-Agent matching, and the
 * React bundle still boots for real visitors because each file is the built
 * index.html with its <head> and shell copy swapped out.
 *
 * Runs after `vite build`. See the build script in package.json.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

import { pages, CANONICAL_ORIGIN } from "./seo-pages.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const OG_IMAGE = `${CANONICAL_ORIGIN}/dark-theme-logo.png`;

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Replaces the <head> tags that differ per page. */
function applyHead(html, page) {
  const canonical = page.route ? `${CANONICAL_ORIGIN}/${page.route}` : `${CANONICAL_ORIGIN}/`;
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);

  const replacements = [
    [/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`],
    [/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${description}" />`],
    [/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${canonical}" />`],
    [/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${canonical}" />`],
    [/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${title}" />`],
    [/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${description}" />`],
    [/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${OG_IMAGE}" />`],
    [/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${title}" />`],
    [/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${description}" />`],
    [/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${OG_IMAGE}" />`],
  ];

  let out = html;
  for (const [pattern, replacement] of replacements) {
    if (!pattern.test(out)) {
      throw new Error(`index.html has no tag matching ${pattern} — update prerender-seo.mjs`);
    }
    out = out.replace(pattern, replacement);
  }
  return out;
}

function bodyCopy(page) {
  const sections = page.sections
    .map((s) => `            <h2>${escapeHtml(s.heading)}</h2>\n            <p>${escapeHtml(s.body)}</p>`)
    .join("\n");
  return `\n            <h1>${escapeHtml(page.h1)}</h1>\n            <p>${escapeHtml(page.description)}</p>\n${sections}\n          `;
}

/**
 * Swaps the copy inside both crawler shells. React replaces all of #root on
 * mount, so none of this is ever shown to a visitor whose JS runs.
 */
function applyShells(html, page) {
  const copy = bodyCopy(page);
  let out = html;
  let replaced = 0;

  out = out.replace(
    /(<main data-seo-main="(?:noscript|shell)">)[\s\S]*?(<\/main>)/g,
    (_, open, close) => {
      replaced += 1;
      return `${open}${copy}${close}`;
    }
  );

  if (replaced !== 2) {
    throw new Error(
      `expected 2 <main data-seo-main="…"> shells in index.html, replaced ${replaced} — update index.html or prerender-seo.mjs`
    );
  }
  return out;
}

async function main() {
  const templatePath = join(dist, "index.html");
  const template = await readFile(templatePath, "utf8");

  for (const page of pages) {
    const html = applyShells(applyHead(template, page), page);
    const outPath = page.route ? join(dist, page.route, "index.html") : templatePath;
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, html, "utf8");
    console.log(`  prerendered /${page.route}  ->  dist/${page.route ? `${page.route}/` : ""}index.html`);
  }

  console.log(`[prerender-seo] wrote ${pages.length} page(s)`);
}

main().catch((err) => {
  console.error("[prerender-seo] failed:", err.message);
  process.exit(1);
});
