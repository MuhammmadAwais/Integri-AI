/**
 * Refreshes the mobile top-up shop's country list from the live catalogue
 * (the same list the app's recharge screen shows) before `vite build`:
 *
 *   src/features/topup/countries.json        bundled into the React page (routing, names, dial codes)
 *   public/shopping/mobile-top-up/data.json  countries + page strings, read by the ssrPreview
 *                                            function (SEO head) and generate-sitemaps.mjs
 *
 * If the catalogue can't be reached the last committed list is kept, so a
 * build never fails or ships an empty shop because of a network hiccup.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "src/features/topup/countries.json");
const PUBLIC = join(root, "public/shopping/mobile-top-up/data.json");
const STRINGS = join(root, "src/features/topup/strings.json");
const API = process.env.TOPUP_API ?? "https://www.integri.app";

/** "Côte d'Ivoire" -> "cote-divoire" */
const slugOf = (name) =>
  name.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function main() {
  let countries = existsSync(SRC) ? JSON.parse(await readFile(SRC, "utf8")) : [];
  try {
    const res = await fetch(`${API}/recharge/web/catalog/countries?lang=en`, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const live = (await res.json()).countries ?? [];
    if (live.length < 20) throw new Error(`only ${live.length} countries`);
    countries = live
      .map((c) => ({ iso: c.iso, slug: slugOf(c.name), name: c.name, dial: c.dial_code, operators: c.operators }))
      .sort((a, b) => a.slug.localeCompare(b.slug));
    console.log(`[topup-data] ${countries.length} countries from the live catalogue`);
  } catch (e) {
    if (!countries.length) throw new Error(`catalogue unreachable and no saved list: ${e.message}`);
    console.warn(`[topup-data] catalogue unreachable (${e.message}); keeping the saved list of ${countries.length}`);
  }

  const strings = JSON.parse(await readFile(STRINGS, "utf8"));
  const aliases = JSON.parse(await readFile(join(root, "src/features/topup/aliases.json"), "utf8"));
  const faq = JSON.parse(await readFile(join(root, "src/features/topup/faq.json"), "utf8"));
  await writeFile(SRC, JSON.stringify(countries, null, 1) + "\n", "utf8");
  await mkdir(dirname(PUBLIC), { recursive: true });
  await writeFile(PUBLIC, JSON.stringify({ langs: Object.keys(strings), countries, strings, aliases, faq }), "utf8");
}

main().catch((err) => {
  console.error("[topup-data] failed:", err.message);
  process.exit(1);
});
