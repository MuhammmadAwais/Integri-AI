/**
 * Adds the client's extra page languages to the mobile top-up shop:
 *
 *   node scripts/import-topup-languages.mjs ~/Downloads/integri-country-pages
 *
 * The client's country-pages project (src/strings/{lang}.json, 78 keys) and the
 * shop (src/features/topup/strings.json, its own key set) are two different
 * schemas. For every client language the shop doesn't have yet, this builds a
 * complete shop entry:
 *
 *   - shop keys that have a client equivalent are mapped (MAP below), the SEO
 *     text (seo_p1 + seo_p2) and the FAQ come over as written;
 *   - the shop-only keys the client's files don't have (amount chips, fee/total
 *     rows, card error messages, the country hub texts ...) come from
 *     scripts/topup-extra-strings.json, translated for this import;
 *   - dir is rtl for the RTL languages, langName is the language's own name.
 *
 * Writes src/features/topup/strings.json and faq.json. Languages already in the
 * shop are left exactly as they are (pass nothing to re-import: delete the
 * language from strings.json and faq.json first). New languages are appended
 * after the existing ones, sorted by English name. Then run `npm run topup-data`
 * (or any build) to refresh public/shopping/mobile-top-up/data.json.
 */

import { readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const client = resolve(process.argv[2] ?? join(process.env.HOME ?? "", "Downloads/integri-country-pages"));
const STRINGS = join(root, "src/features/topup/strings.json");
const FAQ = join(root, "src/features/topup/faq.json");
const EXTRA = join(root, "scripts/topup-extra-strings.json");
const read = async (p) => JSON.parse(await readFile(p, "utf8"));

/** Languages the client already covers under another code in the shop (client "zh" is the shop's zh-CN, "pt" is "pt"). */
const SHOP_CODE = { zh: "zh-CN" };
/** Same RTL set as the client's build.mjs. */
const RTL = new Set(["ar", "fa", "ps", "ur", "he", "sd", "ug"]);

/** shop key <- client key */
const MAP = {
  title: "meta_title_many",
  description: "meta_desc",
  h1: "h1_many",
  sub: "sub",
  stepOperator: "operator",
  stepAmount: "amount",
  stepNumber: "number",
  email: "email",
  emailHint: "email_hint",
  consent: "consent",
  terms: "terms",
  privacy: "privacy",
  footerTerms: "footer_terms",
  footerPrivacy: "footer_privacy",
  continue: "proceed",
  change: "edit_order",
  processing: "wait_h",
  doneTitle: "ok_h",
  doneText: "ok_p",
  pendingTitle: "late_h",
  pendingText: "late_p",
  failTitle: "fail_h",
  failText: "fail_p",
  again: "another",
  order: "order",
  errEmail: "need_email",
  errConsent: "need_consent",
  loading: "loading",
  secure: "secure",
  language: "language",
  popular: "popular",
};

/** Names Intl.DisplayNames gets wrong or in the wrong form for a language picker. */
const NATIVE_NAME = {
  ht: "Kreyòl ayisyen",
  id: "Bahasa Indonesia",
  ms: "Bahasa Melayu",
  ny: "Chichewa",
  no: "Norsk",
  ku: "Kurdî",
  xh: "isiXhosa",
  yo: "Yorùbá",
  tl: "Filipino",
  zu: "isiZulu",
  sn: "chiShona",
};

const upperFirst = (s, lang) => (s ? s.charAt(0).toLocaleUpperCase(lang) + s.slice(1) : s);
const nativeName = (code) => NATIVE_NAME[code] ?? upperFirst(new Intl.DisplayNames([code], { type: "language" }).of(code), code);

const strings = await read(STRINGS);
const faq = await read(FAQ);
const extra = await read(EXTRA);
const shopKeys = Object.keys(strings.en).filter((k) => !k.startsWith("footer"));
const allKeys = [...shopKeys, "footerTerms", "footerPrivacy"];
const englishName = new Intl.DisplayNames(["en"], { type: "language" });

const files = (await readdir(join(client, "src/strings"))).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5));
const fresh = files
  .filter((c) => !(c in strings) && !(SHOP_CODE[c] && SHOP_CODE[c] in strings))
  .sort((a, b) => englishName.of(a).localeCompare(englishName.of(b)));

// Every shop language gets footerTerms / footerPrivacy: the sentence form of "Terms of Use" (consent) isn't always the link text.
for (const lang of Object.keys(strings)) {
  strings[lang].footerTerms ??= strings[lang].terms;
  strings[lang].footerPrivacy ??= strings[lang].privacy;
}

const extraKeys = Object.keys(Object.values(extra)[0]);
const problems = [];
for (const code of fresh) {
  const s = await read(join(client, "src/strings", `${code}.json`));
  const x = extra[code];
  if (!x) { problems.push(`${code}: no entry in topup-extra-strings.json`); continue; }
  const entry = { dir: RTL.has(code) ? "rtl" : "ltr", langName: nativeName(code) };
  for (const key of allKeys) {
    if (key in entry) continue;
    if (key in MAP) entry[key] = s[MAP[key]];
    else if (key === "seo") entry[key] = `${s.seo_p1} ${s.seo_p2}`;
    else if (key in x) entry[key] = x[key];
  }
  const missing = allKeys.filter((k) => typeof entry[k] !== "string" || !entry[k].trim());
  if (missing.length) { problems.push(`${code}: missing ${missing.join(", ")}`); continue; }
  for (const k of extraKeys) if (!shopKeys.includes(k)) problems.push(`${code}: extra key ${k} not used`);

  // Keep the same key order as the existing entries.
  strings[code] = Object.fromEntries(allKeys.map((k) => [k, entry[k]]));

  const qa = [1, 2, 3, 4, 5, 6, 7, 8].map((i) => [s[`faq${i}_q`], s[`faq${i}_a`]]);
  if (qa.some(([q, a]) => !q || !a)) { problems.push(`${code}: FAQ incomplete`); continue; }
  faq.faqTitle[code] = s.faq_h;
  faq.faqs[code] = qa;
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}

// Country-specific FAQ answers the client wrote for the new languages (if any).
const ovrDir = join(client, "src/overrides");
if (existsSync(ovrDir)) {
  for (const f of await readdir(ovrDir)) {
    if (!f.endsWith(".json")) continue;
    const iso = f.replace(".json", "").toUpperCase();
    for (const [lang, texts] of Object.entries(await read(join(ovrDir, f)))) {
      if (!fresh.includes(lang)) continue;
      const faqOnly = Object.fromEntries(Object.entries(texts).filter(([k]) => /^faq\d_[qa]$/.test(k)));
      if (Object.keys(faqOnly).length) (faq.overrides[iso] ??= {})[lang] = faqOnly;
    }
  }
}

await writeFile(STRINGS, JSON.stringify(strings, null, 2) + "\n", "utf8");
await writeFile(FAQ, JSON.stringify(faq, null, 1) + "\n", "utf8");
console.log(`[import-topup-languages] added ${fresh.length} language(s): ${fresh.join(" ")}`);
console.log(`[import-topup-languages] the shop now has ${Object.keys(strings).length} languages`);
