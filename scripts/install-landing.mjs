/**
 * Copies the enterprise landing site (landing/, as the client delivers it)
 * into dist/enterprise after the React build:
 *
 *   landing/index.html          -> /enterprise        (English)
 *   landing/<lang>/index.html   -> /enterprise/<lang>  (30 languages)
 *   landing/assets/*            -> /enterprise/assets/*
 *   landing/sitemap-languages.xml -> /enterprise/sitemap-languages.xml
 *
 * URLs inside the HTML/XML are rewritten for that location by
 * landing-transform.mjs; landing/ itself stays exactly as delivered, so a new
 * version from the client can simply replace the folder.
 */

import { readdir, readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve, relative, extname } from "node:path";
import { LANDING_BASE, transformLanding } from "./landing-transform.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const landing = join(root, "landing");
const out = join(root, "dist", LANDING_BASE.slice(1));

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

export async function landingLanguages() {
  return (await readdir(landing, { withFileTypes: true }))
    .filter((e) => e.isDirectory() && /^[a-z]{2}(-[a-z]+)?$/i.test(e.name) && existsSync(join(landing, e.name, "index.html")))
    .map((e) => e.name);
}

async function main() {
  if (!existsSync(join(root, "dist"))) throw new Error("dist/ not found — run vite build first");
  if (!existsSync(join(landing, "index.html"))) throw new Error("landing/index.html not found");

  const langs = await landingLanguages();
  let copied = 0;
  for await (const src of walk(landing)) {
    const dest = join(out, relative(landing, src));
    await mkdir(dirname(dest), { recursive: true });
    if ([".html", ".xml"].includes(extname(src))) {
      await writeFile(dest, transformLanding(await readFile(src, "utf8"), langs), "utf8");
    } else {
      await copyFile(src, dest);
    }
    copied++;
  }
  console.log(`[install-landing] copied ${copied} file(s) to dist${LANDING_BASE} (${langs.length} languages + English)`);
}

main().catch((err) => {
  console.error("[install-landing] failed:", err.message);
  process.exit(1);
});
