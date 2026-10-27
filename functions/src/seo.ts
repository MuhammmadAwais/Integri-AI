/**
 * Resolves a route to the metadata that goes into its Open Graph tags, and
 * injects that metadata into the built index.html.
 *
 * Ported from the Vercel edge functions api/preview.ts (which read Firestore
 * over the REST API with the public web API key). Here the function runs with
 * the project's service account, so it reads through firebase-admin and no
 * API key is involved.
 */

import { getFirestore } from "firebase-admin/firestore";
import type { Collection, Route } from "./routes";
import { COUNTRY_COLLECTIONS } from "./newsCountries";

export const DEFAULT_DESCRIPTION =
  "Unified AI platform: GPT, Claude, Gemini, Grok, DeepSeek & more.";

export const DEFAULT_IMAGE_PATH = "/dark-theme-logo.png";

export interface SeoData {
  title: string;
  description: string;
  /** Absolute or site-relative; made absolute before it reaches the template. */
  coverImage: string;
  /** The story's own text, for the crawler shell in <body>. */
  body?: { date?: string; paragraphs: string[]; headings?: Map<number, string> };
  /** Structured-data type: NewsArticle for news/articles, BlogPosting for the blog. */
  kind?: "NewsArticle" | "BlogPosting";
  /** Headline without the " | Integri News" suffix the <title> gets. */
  headline?: string;
  publishedAt?: string;
  modifiedAt?: string;
  /** BCP 47 language of the text served. */
  lang?: string;
  /** Every language the story is published in (news/articles only). */
  languages?: string[];
  /** The language the bare URL (no ?lang=) serves. */
  defaultLang?: string;
}

/** A localised field: either {en: "…", nl: "…"} or a bare string. */
type Localised = string | Record<string, string> | undefined | null;

function localise(value: Localised, lang: string): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value !== "object") return "";
  return value[lang] ?? value.en ?? Object.values(value).find((v) => typeof v === "string") ?? "";
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function stripMarkdown(text: string): string {
  return text.replace(/[*_`#~]/g, "").replace(/\s+/g, " ").trim();
}

function truncate(str: string, maxLength = 160): string {
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength).trim()}...`;
}

/** Firestore Timestamp, ISO string or millis → ISO string. */
function dateString(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "number") return new Date(value).toISOString();
  const ts = value as { toDate?: () => Date };
  return typeof ts.toDate === "function" ? ts.toDate().toISOString() : undefined;
}

function summarise(text: string): string {
  return truncate(stripMarkdown(text));
}

// ── Firestore lookups ────────────────────────────────────────────────

/** News and Articles: localised `headline`, `content[]` of typed blocks. */
async function fetchNewsOrArticle(
  collection: Extract<Collection, "News" | "Articles">,
  firestoreCollection: string,
  id: string,
  lang: string
): Promise<SeoData | null> {
  const snap = await getFirestore().collection(firestoreCollection).doc(id).get();
  if (!snap.exists) return null;

  const data = snap.data() ?? {};
  const title = localise(data.headline as Localised, lang);

  const paragraphs: string[] = [];
  if (Array.isArray(data.content)) {
    for (const block of data.content) {
      if (block && block.type === "description") {
        const text = localise(block.value as Localised, lang).trim();
        if (text) paragraphs.push(text);
      }
    }
  }

  const headline = title || (collection === "News" ? "Integri AI News" : "Integri AI Article");
  // Brief 2d: "<seo_title> | Integri News"; the meta description is the
  // writer's meta_description when the pipeline provides one, never a cut paragraph.
  const seoTitle = localise(data.seo_title as Localised, lang) || headline;
  const metaDescription = localise(data.meta_description as Localised, lang);
  const publishedAt = dateString(data.date) ?? dateString(data.createdTime);
  const languages = storyLanguages(data.headline);
  const defaultLang = languages.includes("en") ? "en" : languages[0] ?? "en";
  const textLang = languages.length === 0 || languages.includes(lang) ? lang : defaultLang;
  return {
    title: `${seoTitle} | Integri News`,
    headline,
    // Never the site-wide default: every article needs its own description.
    description: metaDescription || summarise(paragraphs[0] ?? "") || headline,
    coverImage: typeof data.coverImage === "string" ? data.coverImage : "",
    body: { date: publishedAt, paragraphs },
    kind: "NewsArticle",
    publishedAt,
    modifiedAt: dateString(data.updatedAt) ?? dateString(data.compiledAt) ?? publishedAt,
    lang: textLang,
    languages,
    defaultLang,
  };
}

/** ISO 639-1 (or -2) language, optional ISO 3166-1 region. "UK" is not a region code. */
const HREFLANG_RE = /^[a-z]{2,3}(-(?!UK$)[A-Z]{2}|-[A-Z][a-z]{3})?$/;

/** Language codes with a non-empty headline, in a valid hreflang shape. */
function storyLanguages(headline: unknown): string[] {
  if (!headline || typeof headline !== "object") return [];
  return Object.entries(headline as Record<string, unknown>)
    .filter(([code, text]) => typeof text === "string" && text.trim() && HREFLANG_RE.test(code))
    .map(([code]) => code)
    .sort();
}

/** Blogs: looked up by `slug`, falling back to the document id. */
async function fetchBlogPost(slug: string): Promise<SeoData | null> {
  const blogs = getFirestore().collection("Blogs");

  let data: Record<string, unknown> | undefined;

  const bySlug = await blogs.where("slug", "==", slug).limit(1).get();
  if (!bySlug.empty) {
    data = bySlug.docs[0].data();
  } else {
    const byId = await blogs.doc(slug).get();
    if (byId.exists) data = byId.data();
  }
  if (!data) return null;

  const title =
    (typeof data.headline === "string" && data.headline) ||
    (typeof data.title === "string" && data.title) ||
    "Integri AI Blog";

  let description = "";
  const paragraphs: string[] = [];
  const headings = new Map<number, string>();
  if (Array.isArray(data.blocks)) {
    const blocks = data.blocks
      .filter((b) => b && typeof b === "object")
      .map((b) => ({
        type: String(b.type ?? ""),
        value: typeof b.value === "string" ? b.value : "",
        order: Number(b.order ?? 0),
      }))
      .sort((a, b) => a.order - b.order);
    description = blocks.find((b) => b.type === "paragraph")?.value ?? "";
    for (const b of blocks) {
      const text = stripMarkdown(b.value);
      if (!text) continue;
      if (b.type === "heading") headings.set(paragraphs.length, text);
      else if (b.type === "paragraph") paragraphs.push(text);
    }
  }

  const coverImage =
    (typeof data.coverImage === "string" && data.coverImage) ||
    (typeof data.thumbnail === "string" && data.thumbnail) ||
    "";

  const publishedAt = dateString(data.publishedAt ?? data.createdAt);
  return {
    title,
    headline: title,
    description: summarise(description),
    coverImage,
    body: { date: publishedAt, paragraphs, headings },
    kind: "BlogPosting",
    publishedAt,
    modifiedAt: dateString(data.updatedAt) ?? publishedAt,
    lang: "en",
  };
}

export function fetchSeoData(route: Route, lang: string): Promise<SeoData | null> {
  if (route.collection === "Blogs") return fetchBlogPost(route.key);
  return fetchNewsOrArticle(route.collection, route.firestoreCollection, route.key, lang);
}

/**
 * Which country collection holds `id`, if any. One batched read across all
 * of them; used for bare /news/<id> links to country stories, which carry no
 * collection of their own.
 */
export async function findCountryCollection(id: string): Promise<string | null> {
  const db = getFirestore();
  const refs = COUNTRY_COLLECTIONS.map((c) => db.collection(c).doc(id));
  const snaps = await db.getAll(...refs, { fieldMask: ["date"] });
  const hit = snaps.find((snap) => snap.exists);
  return hit ? hit.ref.parent.id : null;
}

// ── Template injection ───────────────────────────────────────────────

/**
 * Strips the tags the built index.html ships with so the per-article ones are
 * the only title/description/og/twitter tags in the document, then injects the
 * replacements at the top of <head>.
 */
function replaceHeadTags(html: string, injected: string): string {
  const stripped = html
    .replace(/<title>[\s\S]*?<\/title>/gi, "")
    .replace(/<meta\s+[^>]*name="description"[^>]*>/gi, "")
    .replace(/<meta\s+[^>]*property="og:[^>]*>/gi, "")
    .replace(/<meta\s+[^>]*name="twitter:[^>]*>/gi, "")
    .replace(/<link\s+[^>]*rel="canonical"[^>]*>/gi, "")
    .replace(/<meta\s+[^>]*name="robots"[^>]*>/gi, "")
    // The template is the prerendered homepage: drop its Organization graph,
    // the article gets its own structured data.
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");

  return stripped.replace(/<head(\s[^>]*)?>/i, (head) => `${head}\n${injected}`);
}

export interface RenderOptions {
  seo: SeoData;
  route: Route;
  /** Origin the request arrived on, e.g. https://www.integri.app */
  origin: string;
  /** The built index.html to inject into. */
  template: string;
}

export function renderPreview({ seo, route, origin, template }: RenderOptions): string {
  const description = seo.description || DEFAULT_DESCRIPTION;

  // The story's own picture, or none: the logo never stands in for it in the
  // structured data (it does for social cards, which need some image).
  let coverUrl = seo.coverImage;
  if (coverUrl && !/^https?:\/\//i.test(coverUrl)) {
    coverUrl = `${origin}/${coverUrl.replace(/^\//, "")}`;
  }
  const imageUrl = coverUrl || `${origin}${DEFAULT_IMAGE_PATH}`;

  // Each language version is its own URL: the default language at the bare
  // path, the others at ?lang=<code>. Each one is its own canonical, and
  // every version lists every other one (and itself) as an alternate.
  const versionUrl = (code: string) =>
    `${origin}${route.canonicalPath}${code === seo.defaultLang ? "" : `?lang=${encodeURIComponent(code)}`}`;
  const languages = seo.languages ?? [];
  const canonicalUrl = seo.lang && languages.includes(seo.lang) ? versionUrl(seo.lang) : `${origin}${route.canonicalPath}`;
  const alternates = languages.length > 1 ?
    [
      ...languages.map((code) => `    <link rel="alternate" hreflang="${code}" href="${escapeHtml(versionUrl(code))}" />`),
      `    <link rel="alternate" hreflang="x-default" href="${escapeHtml(versionUrl(seo.defaultLang ?? "en"))}" />`,
    ].join("\n") + "\n" :
    "";

  const tags = `
    <!-- Open Graph tags rendered per article by the ssrPreview function -->
    <title>${escapeHtml(seo.title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Integri AI" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:title" content="${escapeHtml(seo.title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:locale" content="${escapeHtml(ogLocale(seo.lang ?? "en"))}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@IntegriAI" />
    <meta name="twitter:title" content="${escapeHtml(seo.title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
${alternates}\
${seo.publishedAt ? `    <meta property="article:published_time" content="${escapeHtml(seo.publishedAt)}" />\n` : ""}\
${seo.modifiedAt ? `    <meta property="article:modified_time" content="${escapeHtml(seo.modifiedAt)}" />\n` : ""}\
    <script type="application/ld+json">${articleJsonLd(seo, canonicalUrl, coverUrl)}</script>
${route.legacy ? legacyRedirectScript(route.canonicalPath) : ""}`;

  return replaceBodyShells(replaceHeadTags(template, tags), shellCopy(seo, imageUrl), description);
}

/**
 * The story itself, for the crawler shells in index.html (the <main
 * data-seo-main> blocks). Without this every story's first HTML carries the
 * home page's copy, which reads as a duplicate of the home page. React
 * replaces all of #root on mount, so visitors only ever see the app.
 */
function shellCopy(seo: SeoData, imageUrl: string): string {
  const parts = [`<h1>${escapeHtml(seo.headline ?? seo.title)}</h1>`];
  // The same dates the structured data declares, visible.
  if (seo.body?.date) {
    const day = seo.body.date.slice(0, 10);
    let line = `Published <time datetime="${escapeHtml(seo.body.date)}">${escapeHtml(day)}</time>`;
    if (seo.modifiedAt && seo.modifiedAt.slice(0, 10) !== day) {
      line += ` · Updated <time datetime="${escapeHtml(seo.modifiedAt)}">${escapeHtml(seo.modifiedAt.slice(0, 10))}</time>`;
    }
    parts.push(`<p>${line}</p>`);
  }
  if (imageUrl) parts.push(`<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(seo.title)}" />`);
  const paragraphs = seo.body?.paragraphs.length ? seo.body.paragraphs : [seo.description];
  paragraphs.forEach((text, i) => {
    const heading = seo.body?.headings?.get(i);
    if (heading) parts.push(`<h2>${escapeHtml(heading)}</h2>`);
    if (text) parts.push(`<p>${escapeHtml(text)}</p>`);
  });
  return `\n          ${parts.join("\n          ")}\n        `;
}

/**
 * The story goes into ONE crawler shell (the hidden one Google renders); the
 * <noscript> one gets a one-line summary. Filling both printed the body twice
 * and gave the page two H1s.
 */
function replaceBodyShells(html: string, copy: string, summary: string): string {
  return html.replace(
    /(<main data-seo-main="(noscript|shell)">)[\s\S]*?(<\/main>)/g,
    (_, open: string, kind: string, close: string) =>
      `${open}${kind === "shell" ? copy : `\n          <p>${escapeHtml(summary)}</p>\n        `}${close}`
  );
}

/** NewsArticle / BlogPosting structured data (brief 2c). */
function articleJsonLd(seo: SeoData, canonicalUrl: string, coverUrl: string): string {
  const data = {
    "@context": "https://schema.org",
    "@type": seo.kind ?? "NewsArticle",
    headline: (seo.headline ?? seo.title).slice(0, 110),
    description: seo.description || DEFAULT_DESCRIPTION,
    ...(coverUrl ? {image: [coverUrl]} : {}),
    ...(seo.publishedAt ? {datePublished: seo.publishedAt} : {}),
    ...(seo.modifiedAt ? {dateModified: seo.modifiedAt} : {}),
    inLanguage: seo.lang ?? "en",
    mainEntityOfPage: canonicalUrl,
    author: [{"@type": "Organization", name: "Integri", url: "https://www.integri.app/"}],
    publisher: {
      "@type": "Organization",
      name: "Integri",
      url: "https://www.integri.app/",
      logo: {"@type": "ImageObject", url: "https://www.integri.app/light-theme-logo.png"},
    },
  };
  // JSON inside <script>: escape "<" so text can never close the tag.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** "de" → "de_DE"-style og:locale; a bare language where no region is known. */
function ogLocale(lang: string): string {
  const [language, region] = lang.split("-");
  const regions: Record<string, string> = {
    en: "US", de: "DE", fr: "FR", es: "ES", it: "IT", pt: "PT", nl: "NL", ar: "SA",
    ur: "PK", ja: "JP", ko: "KR", zh: "CN", ru: "RU", tr: "TR", pl: "PL", sv: "SE",
  };
  const r = region ?? regions[language];
  return r ? `${language}_${r.toUpperCase()}` : language;
}

/**
 * Legacy alias paths are not React Router routes, so a browser landing on one
 * would hit the SPA's catch-all and get bounced to "/". Crawlers get the OG
 * tags above and the canonical link; browsers get moved to the real route
 * before the bundle runs.
 */
function legacyRedirectScript(canonicalPath: string): string {
  // Keeps ?lang= (the reader's news language); drops ?collection=, which the
  // canonical path now encodes.
  return `    <script>(function(){var p=${JSON.stringify(
    canonicalPath
  )};if(location.pathname!==p){var l=new URLSearchParams(location.search).get("lang");location.replace(p+(l?"?lang="+encodeURIComponent(l):"")+location.hash);}})();</script>\n`;
}
