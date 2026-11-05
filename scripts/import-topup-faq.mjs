/**
 * Imports the per-country FAQ from the client's country-pages project into
 * the mobile top-up shop:
 *
 *   node scripts/import-topup-faq.mjs ~/Downloads/integri-country-pages
 *
 * Writes src/features/topup/faq.json:
 *   faqTitle  {lang: "Frequently asked questions"}
 *   faqs      {lang: [[question, answer] x 8]}   with {country} {operator} {operators}
 *   overrides {ISO: {lang: {faq7_a: "..."}}}     country-specific answers (e.g. Germany)
 *   operators {ISO: ["Jazz", "Telenor", ...]}     the client's operator names per country
 *
 * Only the shop's page languages (src/features/topup/strings.json) are imported.
 * Re-run after the client updates their texts, then rebuild.
 */

import { readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const client = resolve(process.argv[2] ?? join(process.env.HOME ?? "", "Downloads/integri-country-pages"));
const read = async (p) => JSON.parse(await readFile(p, "utf8"));

const langs = Object.keys(await read(join(root, "src/features/topup/strings.json")));
const out = { faqTitle: {}, faqs: {}, overrides: {}, operators: {} };

const faqPath = join(root, "src/features/topup/faq.json");
const previous = existsSync(faqPath) ? await read(faqPath) : { faqTitle: {}, faqs: {} };

for (const lang of langs) {
  const file = join(client, "src/strings", `${lang}.json`);
  if (!existsSync(file)) {
    // pt-BR, zh-CN and zh-TW have no client file (the client has "pt" and "zh"): keep what the shop has.
    if (!previous.faqs[lang]) throw new Error(`client has no ${lang}.json and the shop has no FAQ for it`);
    out.faqTitle[lang] = previous.faqTitle[lang];
    out.faqs[lang] = previous.faqs[lang];
    continue;
  }
  const s = await read(file);
  const faqs = [1, 2, 3, 4, 5, 6, 7, 8].map((i) => [s[`faq${i}_q`], s[`faq${i}_a`]]);
  if (faqs.some(([q, a]) => !q || !a)) throw new Error(`${lang}.json is missing FAQ entries`);
  out.faqTitle[lang] = s.faq_h ?? "FAQ";
  out.faqs[lang] = faqs;
}

const ovrDir = join(client, "src/overrides");
if (existsSync(ovrDir)) {
  for (const f of await readdir(ovrDir)) {
    if (!f.endsWith(".json")) continue;
    const iso = f.replace(".json", "").toUpperCase();
    for (const [lang, texts] of Object.entries(await read(join(ovrDir, f)))) {
      if (!langs.includes(lang)) continue;
      const faqOnly = Object.fromEntries(Object.entries(texts).filter(([k]) => /^faq\d_[qa]$/.test(k)));
      if (Object.keys(faqOnly).length) (out.overrides[iso] ??= {})[lang] = faqOnly;
    }
  }
}

for (const c of await read(join(client, "data/countries.json"))) {
  out.operators[c.iso] = c.operators.map((o) => o.name);
}

await writeFile(faqPath, JSON.stringify(out, null, 1) + "\n", "utf8");
console.log(`[import-topup-faq] ${langs.length} languages x 8 questions, ${Object.keys(out.overrides).length} country override(s), operators for ${Object.keys(out.operators).length} countries`);
