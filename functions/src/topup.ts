/**
 * Server HTML for the mobile top-up shop: /shopping/mobile-top-up/{country}/{lang}.
 *
 * The React page renders the shop; this gives crawlers (and link previews)
 * the localized title, description, canonical, hreflang alternates, FAQ
 * structured data and the page's own text before any JavaScript runs.
 * Countries and strings come from /shopping/mobile-top-up/data.json, written
 * at build time by scripts/refresh-topup-data.mjs.
 */

import { escapeHtml } from "./seo";

export const TOPUP_BASE = "/shopping/mobile-top-up";
const SITE = "https://www.integri.app";

interface Country { iso: string; slug: string; name: string; dial: string; operators: string }
type Strings = Record<string, string>;
interface Faq {
  faqTitle: Record<string, string>;
  faqs: Record<string, string[][]>;
  overrides: Record<string, Record<string, Record<string, string>>>;
  operators: Record<string, string[]>;
}
interface TopUpData {
  langs: string[];
  countries: Country[];
  strings: Record<string, Strings>;
  aliases?: Record<string, string>;
  faq: Faq;
}

let cached: { origin: string; etag: string | null; data: TopUpData } | null = null;

/**
 * data.json, revalidated on every request (ETag -> a cheap 304). A
 * time-based cache kept the previous deploy's file after a release.
 */
async function loadData(origin: string): Promise<TopUpData> {
  const headers: Record<string, string> = {};
  if (cached && cached.origin === origin && cached.etag) headers["If-None-Match"] = cached.etag;
  let res: Response;
  try {
    res = await fetch(`${origin}${TOPUP_BASE}/data.json`, { headers, signal: AbortSignal.timeout(5000) });
  } catch (err) {
    if (cached && cached.origin === origin) return cached.data;
    throw err;
  }
  if (res.status === 304 && cached) return cached.data;
  if (!res.ok) {
    if (cached && cached.origin === origin) return cached.data;
    throw new Error(`data.json: HTTP ${res.status}`);
  }
  const data = (await res.json()) as TopUpData;
  cached = { origin, etag: res.headers.get("etag"), data };
  return data;
}

const fill = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

function countryName(iso: string, lang: string, fallback: string): string {
  try {
    return new Intl.DisplayNames([lang, "en"], { type: "region" }).of(iso) ?? fallback;
  } catch {
    return fallback;
  }
}

/** First page language in Accept-Language, else English. */
function preferredLang(acceptLanguage: string | undefined, langs: string[]): string {
  for (const part of (acceptLanguage ?? "").split(",")) {
    const base = part.split(";")[0].trim().toLowerCase().split("-")[0];
    if (langs.includes(base)) return base;
  }
  return "en";
}

export type TopUpResponse =
  | { kind: "page"; html: string }
  | { kind: "redirect"; location: string; permanent?: boolean }
  | { kind: "notFound" };

/** Null when [path] isn't a top-up country page (e.g. the overview, left to the app). */
export async function renderTopUp(
  path: string,
  origin: string,
  template: string,
  acceptLanguage: string | undefined
): Promise<TopUpResponse | null> {
  const parts = path.replace(/\/+$/, "").split("/").filter(Boolean).map(decodeURIComponent);
  // ["shopping", "mobile-top-up", slug?, lang?]
  if (parts.length < 2 || parts.length > 4 || parts[0] !== "shopping" || parts[1] !== "mobile-top-up") return null;

  const data = await loadData(origin);
  if (parts.length === 2) return { kind: "page", html: renderIndex(data, template) };
  const country = data.countries.find((c) => c.slug === parts[2].toLowerCase());
  if (!country) {
    // Common other names ("turkey", "uae") move permanently to the official address.
    const alias = data.aliases?.[parts[2].toLowerCase()];
    if (alias) return { kind: "redirect", permanent: true, location: `${TOPUP_BASE}/${alias}${parts[3] ? `/${parts[3]}` : ""}` };
    return { kind: "notFound" };
  }
  if (parts.length === 3) {
    return { kind: "redirect", location: `${TOPUP_BASE}/${country.slug}/${preferredLang(acceptLanguage, data.langs)}` };
  }
  const lang = parts[3];
  const t = data.strings[lang];
  if (!t) return { kind: "notFound" };

  const name = countryName(country.iso, lang, country.name);
  const faqData: Faq = data.faq ?? { faqTitle: {}, faqs: {}, overrides: {}, operators: {} };
  const opNames = faqData.operators[country.iso] ?? country.operators.split(", ");
  const vars = { country: name, operator: opNames[0] ?? "", operators: opNames.slice(0, 6).join(", ") };
  const title = fill(t.title, vars);
  const description = fill(t.description, vars);
  const canonical = `${SITE}${TOPUP_BASE}/${country.slug}/${lang}`;
  // The client's FAQ (8 questions per language) with country-specific overrides.
  const override = faqData.overrides[country.iso]?.[lang] ?? {};
  const faq = (faqData.faqs[lang] ?? []).map(([q, a], i) => ({
    q: fill(override[`faq${i + 1}_q`] ?? q, vars),
    a: fill(override[`faq${i + 1}_a`] ?? a, vars),
  }));
  const ld = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  }).replace(/</g, "\\u003c");

  const alternates = data.langs
    .map((l) => `    <link rel="alternate" hreflang="${l}" href="${SITE}${TOPUP_BASE}/${country.slug}/${l}" />`)
    .join("\n");

  const head = `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
    <link rel="canonical" href="${canonical}" />
${alternates}
    <link rel="alternate" hreflang="x-default" href="${SITE}${TOPUP_BASE}/${country.slug}/en" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Integri" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${SITE}/icon-512.png" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="@IntegriAI" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <script type="application/ld+json">${ld}</script>
`;

  const copy = [
    `<h1>${escapeHtml(fill(t.h1, vars))}</h1>`,
    `<p>${escapeHtml(fill(t.sub, vars))}</p>`,
    `<h2>${escapeHtml(faqData.faqTitle[lang] ?? "FAQ")}</h2>`,
    ...faq.flatMap((f) => [`<h3>${escapeHtml(f.q)}</h3>`, `<p>${escapeHtml(f.a)}</p>`]),
    `<p>${escapeHtml(fill(t.seo, vars))}</p>`,
  ].join("\n          ");

  const html = template
    .replace(/<title>[\s\S]*?<\/title>/gi, "")
    .replace(/<meta\s+[^>]*name="(description|robots)"[^>]*>/gi, "")
    .replace(/<meta\s+[^>]*property="og:[^>]*>/gi, "")
    .replace(/<meta\s+[^>]*name="twitter:[^>]*>/gi, "")
    .replace(/<link\s+[^>]*rel="canonical"[^>]*>/gi, "")
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, "")
    .replace(/<html([^>]*)\slang="[^"]*"/i, `<html$1 lang="${lang}"`)
    .replace(/<html(?![^>]*\sdir=)([^>]*)>/i, `<html$1 dir="${t.dir}">`)
    .replace(/<head(\s[^>]*)?>/i, (h) => `${h}\n${head}`)
    .replace(
      /(<main data-seo-main="(noscript|shell)">)[\s\S]*?(<\/main>)/g,
      (_m, open: string, kind: string, close: string) =>
        `${open}\n          ${kind === "shell" ? copy : `<p>${escapeHtml(description)}</p>`}\n        ${close}`
    );
  return { kind: "page", html };
}

/** /shopping/mobile-top-up: every country, linked (server HTML in English, the canonical version). */
function renderIndex(data: TopUpData, template: string): string {
  const t = data.strings.en;
  const count = String(data.countries.length);
  const title = fill(t.indexTitle, { count });
  const description = fill(t.indexDescription, { count });
  const canonical = `${SITE}${TOPUP_BASE}`;
  const head = `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Integri" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${SITE}/icon-512.png" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="@IntegriAI" />
`;
  const links = data.countries
    .map((c) => `<li><a href="${TOPUP_BASE}/${c.slug}/en">${escapeHtml(c.name)} mobile top-up</a></li>`)
    .join("");
  const copy = [
    `<h1>${escapeHtml(t.indexH1)}</h1>`,
    `<p>${escapeHtml(fill(t.indexSub, { count }))}</p>`,
    `<h2>${escapeHtml(t.allCountries)}</h2>`,
    `<ul>${links}</ul>`,
  ].join("\n          ");
  return template
    .replace(/<title>[\s\S]*?<\/title>/gi, "")
    .replace(/<meta\s+[^>]*name="(description|robots)"[^>]*>/gi, "")
    .replace(/<meta\s+[^>]*property="og:[^>]*>/gi, "")
    .replace(/<meta\s+[^>]*name="twitter:[^>]*>/gi, "")
    .replace(/<link\s+[^>]*rel="canonical"[^>]*>/gi, "")
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, "")
    .replace(/<head(\s[^>]*)?>/i, (h) => `${h}\n${head}`)
    .replace(
      /(<main data-seo-main="(noscript|shell)">)[\s\S]*?(<\/main>)/g,
      (_m, open: string, kind: string, close: string) =>
        `${open}\n          ${kind === "shell" ? copy : `<p>${escapeHtml(description)}</p>`}\n        ${close}`
    );
}
