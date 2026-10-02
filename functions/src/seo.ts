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

export const DEFAULT_DESCRIPTION =
  "Unified AI platform: GPT, Claude, Gemini, Grok, DeepSeek & more.";

export const DEFAULT_IMAGE_PATH = "/dark-theme-logo.png";

export interface SeoData {
  title: string;
  description: string;
  /** Absolute or site-relative; made absolute before it reaches the template. */
  coverImage: string;
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

function summarise(text: string): string {
  return truncate(stripMarkdown(text));
}

// ── Firestore lookups ────────────────────────────────────────────────

/** News and Articles: localised `headline`, `content[]` of typed blocks. */
async function fetchNewsOrArticle(
  collection: Extract<Collection, "News" | "Articles">,
  id: string,
  lang: string
): Promise<SeoData | null> {
  const snap = await getFirestore().collection(collection).doc(id).get();
  if (!snap.exists) return null;

  const data = snap.data() ?? {};
  const title = localise(data.headline as Localised, lang);

  let description = "";
  if (Array.isArray(data.content)) {
    for (const block of data.content) {
      if (block && block.type === "description") {
        description = localise(block.value as Localised, lang);
        if (description) break;
      }
    }
  }

  return {
    title: title || (collection === "News" ? "Integri AI News" : "Integri AI Article"),
    description: summarise(description),
    coverImage: typeof data.coverImage === "string" ? data.coverImage : "",
  };
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
  }

  const coverImage =
    (typeof data.coverImage === "string" && data.coverImage) ||
    (typeof data.thumbnail === "string" && data.thumbnail) ||
    "";

  return { title, description: summarise(description), coverImage };
}

export function fetchSeoData(route: Route, lang: string): Promise<SeoData | null> {
  if (route.collection === "Blogs") return fetchBlogPost(route.key);
  return fetchNewsOrArticle(route.collection, route.key, lang);
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
    .replace(/<link\s+[^>]*rel="canonical"[^>]*>/gi, "");

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

  let imageUrl = seo.coverImage;
  if (!imageUrl) {
    imageUrl = `${origin}${DEFAULT_IMAGE_PATH}`;
  } else if (!/^https?:\/\//i.test(imageUrl)) {
    imageUrl = `${origin}/${imageUrl.replace(/^\//, "")}`;
  }

  const canonicalUrl = `${origin}${route.canonicalPath}`;

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
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@integri_ai" />
    <meta name="twitter:title" content="${escapeHtml(seo.title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
${route.legacy ? legacyRedirectScript(route.canonicalPath) : ""}`;

  return replaceHeadTags(template, tags);
}

/**
 * Legacy alias paths are not React Router routes, so a browser landing on one
 * would hit the SPA's catch-all and get bounced to "/". Crawlers get the OG
 * tags above and the canonical link; browsers get moved to the real route
 * before the bundle runs.
 */
function legacyRedirectScript(canonicalPath: string): string {
  return `    <script>(function(){var p=${JSON.stringify(
    canonicalPath
  )};if(location.pathname!==p){location.replace(p+location.hash);}})();</script>\n`;
}
