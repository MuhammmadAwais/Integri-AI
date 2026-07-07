export const config = {
  runtime: "edge",
};

// ── Firestore JSON parser helpers ────────────────────────────────────

function getFirestoreString(val: any): string {
  if (!val) return "";
  return typeof val.stringValue === "string" ? val.stringValue : "";
}

function getFirestoreMap(val: any): Record<string, string> {
  if (!val || !val.mapValue || !val.mapValue.fields) return {};
  const res: Record<string, string> = {};
  const fields = val.mapValue.fields;
  for (const key of Object.keys(fields)) {
    res[key] = typeof fields[key].stringValue === "string" ? fields[key].stringValue : "";
  }
  return res;
}

function localise(map: Record<string, string> | undefined, lang: string): string {
  if (!map) return "";
  return map[lang] ?? map["en"] ?? Object.values(map)[0] ?? "";
}

function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function stripMarkdown(text: string): string {
  if (!text) return "";
  // Strip simple markdown bold/italic tags and extra whitespaces
  return text
    .replace(/[\*_`#~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(str: string, maxLength = 160): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength).trim() + "...";
}

// ── Firestore REST API Query Implementations ─────────────────────────

interface SEOData {
  title: string;
  description: string;
  coverImage: string;
  canonicalPath: string;
}

/**
 * Fetch News or Articles by document ID
 */
async function fetchNewsOrArticle(
  collectionName: "News" | "Articles",
  id: string,
  projectId: string,
  apiKey: string,
  lang: string
): Promise<SEOData> {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}/${id}?key=${apiKey}`;
  
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Firestore fetch failed for ${collectionName}/${id}: ${res.statusText}`);
  }

  const data = await res.json();
  const fields = data.fields || {};

  const headlineMap = getFirestoreMap(fields.headline);
  const title = localise(headlineMap, lang) || `${collectionName} Details`;
  const coverImage = getFirestoreString(fields.coverImage);

  // Extract description (first paragraph description block)
  let description = "";
  if (fields.content?.arrayValue?.values) {
    for (const val of fields.content.arrayValue.values) {
      const itemFields = val.mapValue?.fields;
      if (itemFields && getFirestoreString(itemFields.type) === "description") {
        const descMap = getFirestoreMap(itemFields.value);
        description = localise(descMap, lang);
        if (description) break;
      }
    }
  }

  return {
    title,
    description: truncate(stripMarkdown(description)),
    coverImage,
    canonicalPath: `/${collectionName.toLowerCase()}/${id}`,
  };
}

/**
 * Fetch Blog Post by slug (structuredQuery) with direct document ID fallback
 */
async function fetchBlogPost(
  slug: string,
  projectId: string,
  apiKey: string
): Promise<SEOData> {
  const queryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`;
  const queryBody = {
    structuredQuery: {
      from: [{ collectionId: "Blogs" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "slug" },
          op: "EQUAL",
          value: { stringValue: slug }
        }
      },
      limit: 1
    }
  };

  let fields: any = null;
  let docId = slug;

  try {
    const res = await fetch(queryUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(queryBody)
    });

    if (res.ok) {
      const results = await res.json();
      const firstResult = results.find((r: any) => r.document);
      if (firstResult && firstResult.document) {
        fields = firstResult.document.fields || {};
        const pathParts = firstResult.document.name?.split("/");
        docId = pathParts?.[pathParts.length - 1] || slug;
      }
    }
  } catch (err) {
    console.error("Firestore structured query failed for blog slug:", err);
  }

  // Fallback: Query by Document ID directly (slug as doc ID)
  if (!fields) {
    const fallbackUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/Blogs/${slug}?key=${apiKey}`;
    const fbRes = await fetch(fallbackUrl);
    if (!fbRes.ok) {
      throw new Error(`Blog post slug/ID not found: ${slug}`);
    }
    const fbData = await fbRes.json();
    fields = fbData.fields || {};
  }

  const title = getFirestoreString(fields.headline) || getFirestoreString(fields.title) || "Blog Details";
  const coverImage = getFirestoreString(fields.coverImage) || getFirestoreString(fields.thumbnail);

  // Extract description (first paragraph block)
  let description = "";
  if (fields.blocks?.arrayValue?.values) {
    const blocks: { type: string; value: string; order: number }[] = [];
    for (const val of fields.blocks.arrayValue.values) {
      const itemFields = val.mapValue?.fields;
      if (itemFields) {
        blocks.push({
          type: getFirestoreString(itemFields.type),
          value: getFirestoreString(itemFields.value),
          order: parseInt(itemFields.order?.integerValue || "0", 10),
        });
      }
    }
    // Sort blocks sequentially
    blocks.sort((a, b) => a.order - b.order);
    const firstPara = blocks.find(b => b.type === "paragraph");
    if (firstPara) {
      description = firstPara.value;
    }
  }

  return {
    title,
    description: truncate(stripMarkdown(description)),
    coverImage,
    canonicalPath: `/blog/${slug}`,
  };
}

// ── Default Export Handler ───────────────────────────────────────────

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const id = url.searchParams.get("id");
  const slug = url.searchParams.get("slug");
  const lang = url.searchParams.get("lang") || "en";

  const host = request.headers.get("host") || "integri.app";
  const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  // Helper to fetch baseline index.html served statically
  const fetchIndexHtml = async (): Promise<string> => {
    // Force direct fetch of index.html from static resources
    // Pass clean headers to prevent circular rewrite matching
    const indexUrl = `${origin}/index.html`;
    const res = await fetch(indexUrl, {
      headers: {
        "User-Agent": "Integri-AI-Preview-Bot/1.0",
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch static index.html template: ${res.statusText}`);
    }
    return res.text();
  };

  try {
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID || "integri-957a2";
    const apiKey = process.env.VITE_FIREBASE_API_KEY || "AIzaSyAIYRCpE3gdcbk13tnVMQL_Vnq4CBHZj_8";

    console.log(`[Preview Pre-renderer] Fetching ${type} resource. ID: ${id || "none"}, Slug: ${slug || "none"}. Lang: ${lang}`);

    let seoData: SEOData | null = null;

    if (type === "news" && id) {
      seoData = await fetchNewsOrArticle("News", id, projectId, apiKey, lang);
    } else if (type === "article" && id) {
      seoData = await fetchNewsOrArticle("Articles", id, projectId, apiKey, lang);
    } else if (type === "blog" && slug) {
      seoData = await fetchBlogPost(slug, projectId, apiKey);
    }

    if (!seoData) {
      throw new Error("Invalid request arguments or unable to identify resource context.");
    }

    console.log(`[Preview Pre-renderer] Resolved SEO data: Title="${seoData.title}", Image="${seoData.coverImage}"`);

    // Process absolute paths for OG images
    let imageUrl = seoData.coverImage;
    if (imageUrl) {
      if (!imageUrl.startsWith("http")) {
        imageUrl = `${origin}/${imageUrl.replace(/^\//, "")}`;
      }
    } else {
      imageUrl = `${origin}/dark-theme-logo.png`;
    }

    const canonicalUrl = `${origin}${seoData.canonicalPath}`;

    // Get the base HTML file
    const baseHtml = await fetchIndexHtml();

    // Construct the crawler meta tags
    const metaTags = `
    <!-- Dynamic Open Graph / Twitter Tags (Edge Pre-renderer) -->
    <title>${escapeHtml(seoData.title)}</title>
    <meta name="description" content="${escapeHtml(seoData.description || "Unified AI platform: GPT, Claude, Gemini, Grok, DeepSeek & more.")}" />
    <meta property="og:title" content="${escapeHtml(seoData.title)}" />
    <meta property="og:description" content="${escapeHtml(seoData.description || "Unified AI platform: GPT, Claude, Gemini, Grok, DeepSeek & more.")}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:type" content="article" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(seoData.title)}" />
    <meta name="twitter:description" content="${escapeHtml(seoData.description || "Unified AI platform: GPT, Claude, Gemini, Grok, DeepSeek & more.")}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
    `;

    // Strip out default title and description meta tags from original index.html
    let finalHtml = baseHtml;
    finalHtml = finalHtml.replace(/<title>.*?<\/title>/gi, "");
    finalHtml = finalHtml.replace(/<meta\s+[^>]*name="description"[^>]*>/gi, "");
    finalHtml = finalHtml.replace(/<meta\s+[^>]*property="og:[^>]*>/gi, "");
    finalHtml = finalHtml.replace(/<meta\s+[^>]*name="twitter:[^>]*>/gi, "");

    // Inject tags into head
    finalHtml = finalHtml.replace("<head>", `<head>\n${metaTags}`);

    // Return the response with Edge CDN caching headers
    // s-maxage=86400 (24h) cached by Vercel Edge; stale-while-revalidate=3600 background refreshes after 24h
    return new Response(finalHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=3600",
      },
    });

  } catch (err: any) {
    console.error("Preview pre-render function error:", err?.message || err);
    try {
      // Direct fallback to static baseline HTML template
      const defaultHtml = await fetchIndexHtml();
      return new Response(defaultHtml, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          // Avoid caching error fallbacks for too long
          "Cache-Control": "public, max-age=0, s-maxage=60",
        },
      });
    } catch (fallbackErr) {
      return new Response("Internal Server Error", { status: 500 });
    }
  }
}
