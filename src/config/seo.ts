/**
 * SEO configuration for Integri AI
 * Custom agents, chatbots, and all AI models in one place.
 */

export const SITE_NAME = "Integri AI";
export const SITE_DEFAULT_TITLE = "Integri AI – Custom AI Agents, Chatbots & All Models in One Place";
export const SITE_DEFAULT_DESCRIPTION =
  "Unified AI platform: GPT, Claude, Gemini, Grok, DeepSeek & more. Build custom agents and chatbots, chat with any model, voice, image gen, and PDF analysis—all in one place.";
export const SITE_DEFAULT_OG_IMAGE = "/dark-theme-logo.png";
export const SITE_TWITTER_HANDLE = "@IntegriAI";
export const SITE_KEYWORDS =
  "Integri AI, AI chatbot, custom AI agents, GPT, Claude, Gemini, Grok, DeepSeek, ChatGPT alternative, AI models, voice AI, image generation, PDF chat, unified AI";

const BASE_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_APP_SITE_URL) ||
  "https://www.integri.app";

export const getCanonicalUrl = (path: string) => {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL.replace(/\/$/, "")}${p}`;
};

export const getOgImageUrl = (path?: string) => {
  if (path?.startsWith("http")) return path;
  return getCanonicalUrl(path || SITE_DEFAULT_OG_IMAGE);
};

export type PageSEOConfig = {
  title: string;
  description: string;
  canonicalPath: string;
  noindex?: boolean;
  ogImage?: string;
  keywords?: string;
  /** Override for JSON-LD breadcrumb label */
  breadcrumbLabel?: string;
  /**
   * Article detail routes. The page itself (or, for crawlers that don't run
   * JS, the ssrPreview function) supplies the per-article title/description,
   * so the route-level defaults must not overwrite them.
   */
  isArticle?: boolean;
};

/**
 * Route → SEO config. Use pathname (e.g. /agents) or pattern for dynamic routes.
 * Most specific match wins; we match by pathname prefix/literal.
 */
const PAGE_SEO: Record<string, PageSEOConfig> = {
  "/": {
    title: `${SITE_NAME} – Custom AI Agents, Chatbots & All Models in One Place`,
    description: SITE_DEFAULT_DESCRIPTION,
    canonicalPath: "/",
    keywords: SITE_KEYWORDS,
    breadcrumbLabel: "Home",
  },
  "/login": {
    title: `Sign In | ${SITE_NAME}`,
    description: "Sign in to Integri AI to access your custom agents, chatbots, and all AI models in one place.",
    canonicalPath: "/login",
    noindex: true,
    breadcrumbLabel: "Sign In",
  },
  "/signup": {
    title: `Create Account | ${SITE_NAME}`,
    description: "Create your Integri AI account. Start building custom agents and chatting with GPT, Claude, Gemini, and more.",
    canonicalPath: "/signup",
    noindex: true,
    breadcrumbLabel: "Sign Up",
  },
  "/getting-started": {
    title: `Getting Started | ${SITE_NAME}`,
    description: "Set up your Integri AI profile and learn how to use custom agents, chatbots, and all AI models.",
    canonicalPath: "/getting-started",
    noindex: true,
    breadcrumbLabel: "Getting Started",
  },
  "/history": {
    title: `Chat History | ${SITE_NAME}`,
    description: "View and manage your Integri AI chat history across all models and custom agents.",
    canonicalPath: "/history",
    noindex: true,
    breadcrumbLabel: "History",
  },
  "/playground": {
    title: `Model Playground | ${SITE_NAME}`,
    description: "Compare and test GPT, Claude, Gemini, Grok, DeepSeek and more side-by-side in one playground.",
    canonicalPath: "/playground",
    breadcrumbLabel: "Playground",
  },
  "/voice": {
    title: `Voice AI | ${SITE_NAME}`,
    description: "Real-time voice conversations with AI. Talk to GPT and other models using Integri AI voice mode.",
    canonicalPath: "/voice",
    breadcrumbLabel: "Voice",
  },
  "/pdf": {
    title: `PDF Chat | ${SITE_NAME}`,
    description: "Chat with your PDFs using AI. Upload documents and ask questions with Integri AI.",
    canonicalPath: "/pdf",
    breadcrumbLabel: "PDF Chat",
  },
  "/settings": {
    title: `Settings | ${SITE_NAME}`,
    description: "Manage your Integri AI account, subscription, and app settings.",
    canonicalPath: "/settings",
    noindex: true,
    breadcrumbLabel: "Settings",
  },
  "/feedback": {
    title: `Send Feedback | ${SITE_NAME}`,
    description: "Share feedback about Integri AI. Help us improve custom agents, chatbots, and the unified AI experience.",
    canonicalPath: "/feedback",
    noindex: true,
    breadcrumbLabel: "Feedback",
  },
  "/help": {
    title: `Help & Support | ${SITE_NAME}`,
    description: "Get help with Integri AI: custom agents, chatbots, models, voice, image generation, and more.",
    canonicalPath: "/help",
    breadcrumbLabel: "Help",
  },
  "/agents": {
    title: `Custom AI Agents | ${SITE_NAME}`,
    description: "Create and manage custom AI agents. Build specialized chatbots with knowledge bases and recommended models.",
    canonicalPath: "/agents",
    keywords: "custom AI agents, AI chatbots, GPT agents, Claude agents, Integri agents",
    breadcrumbLabel: "Agents",
  },
  "/subscriptions": {
    title: `Plans & Pricing | ${SITE_NAME}`,
    description: "Integri AI Pro and Premium plans. Unlock more models, custom agents, voice, and image generation.",
    canonicalPath: "/subscriptions",
    breadcrumbLabel: "Subscriptions",
  },
  "/imageGen": {
    title: `AI Image Generation | ${SITE_NAME}`,
    description: "Generate images with AI. Create visuals using Integri AI image generation across multiple models.",
    canonicalPath: "/imageGen",
    breadcrumbLabel: "Image Gen",
  },
  "/contactUs": {
    title: `Contact Us | ${SITE_NAME}`,
    description: "Contact Integri AI support. Questions about custom agents, chatbots, or your account? We're here to help.",
    canonicalPath: "/contactUs",
    breadcrumbLabel: "Contact",
  },
  "/blog": {
    title: `Blog – AI Insights, Guides & Analysis | ${SITE_NAME}`,
    description: "In-depth articles on artificial intelligence: AI model comparisons, how-to guides, and analysis of the trends shaping the future of AI.",
    canonicalPath: "/blog",
    keywords: "AI blog, AI guides, GPT vs Claude, AI model comparison, prompt engineering, Integri AI",
    breadcrumbLabel: "Blog",
  },
  "/privacy-policy": {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: "How Integri AI collects, uses, and protects your personal data.",
    canonicalPath: "/privacy-policy",
    breadcrumbLabel: "Privacy Policy",
  },
  "/news": {
    title: `AI News & Articles | ${SITE_NAME}`,
    description: "Stay updated with the latest AI news, technology breakthroughs, in-depth articles, tutorials, and industry insights. Covering GPT, Claude, Gemini, and more.",
    canonicalPath: "/news",
    keywords: "AI news, artificial intelligence news, GPT news, Claude update, Gemini news, AI articles, technology news, Integri AI",
    breadcrumbLabel: "News & Articles",
  },
};

/** Match /agents/abc123 -> agents config; use agents config for breadcrumb parent. */
const DYNAMIC_PATTERNS: { pattern: RegExp; config: PageSEOConfig; basePath: string }[] = [
  {
    pattern: /^\/agents\/[^/]+$/,
    config: {
      title: `Agent Details | ${SITE_NAME}`,
      description: "View and manage your custom AI agent. Edit knowledge, starters, and start a chat.",
      canonicalPath: "/agents",
      noindex: true,
      breadcrumbLabel: "Agent Details",
    },
    basePath: "/agents",
  },
  {
    pattern: /^\/chat\/[^/]+$/,
    config: {
      title: `Chat | ${SITE_NAME}`,
      description: "Chat with AI using Integri. All models in one place.",
      canonicalPath: "/",
      noindex: true,
      breadcrumbLabel: "Chat",
    },
    basePath: "/",
  },
  {
    pattern: /^\/c\/[^/]+$/,
    config: {
      title: `Chat | ${SITE_NAME}`,
      description: "Chat with AI using Integri.",
      canonicalPath: "/",
      noindex: true,
      breadcrumbLabel: "Chat",
    },
    basePath: "/",
  },
  {
    pattern: /^\/pdf\/[^/]+$/,
    config: {
      title: `PDF Chat | ${SITE_NAME}`,
      description: "Chat with your PDF using Integri AI.",
      canonicalPath: "/pdf",
      noindex: true,
      breadcrumbLabel: "PDF Chat",
    },
    basePath: "/pdf",
  },
  {
    pattern: /^\/voice\/mobile-popup\/[^/]+$/,
    config: {
      title: `Voice | ${SITE_NAME}`,
      description: "Voice AI popup – talk to Integri AI.",
      canonicalPath: "/voice",
      noindex: true,
      breadcrumbLabel: "Voice",
    },
    basePath: "/voice",
  },
  {
    pattern: /^\/news\/[^/]+$/,
    config: {
      title: `News | ${SITE_NAME}`,
      description: "Read the latest AI news and technology updates on Integri AI.",
      canonicalPath: "/news",
      breadcrumbLabel: "News Detail",
      isArticle: true,
    },
    basePath: "/news",
  },
  {
    pattern: /^\/articles\/[^/]+$/,
    config: {
      title: `Article | ${SITE_NAME}`,
      description: "Read in-depth AI articles, tutorials, and guides on Integri AI.",
      canonicalPath: "/news",
      breadcrumbLabel: "Article Detail",
      isArticle: true,
    },
    basePath: "/news",
  },
  {
    pattern: /^\/blog\/[^/]+$/,
    config: {
      title: `Blog | ${SITE_NAME}`,
      description: "Read in-depth AI articles, guides, and analysis on the Integri AI blog.",
      canonicalPath: "/blog",
      breadcrumbLabel: "Blog Post",
      isArticle: true,
    },
    basePath: "/blog",
  },
];

function getConfigForPath(pathname: string): PageSEOConfig & { canonicalPath: string; basePath?: string } {
  const exact = PAGE_SEO[pathname];
  if (exact) return { ...exact, canonicalPath: exact.canonicalPath };

  for (const { pattern, config, basePath } of DYNAMIC_PATTERNS) {
    if (pattern.test(pathname)) {
      return {
        ...config,
        canonicalPath: config.isArticle ? pathname : config.canonicalPath ?? basePath,
        basePath,
      };
    }
  }

  // Unknown/junk routes (e.g. /recruit, /12345.htm, /siteinfo/...) — same SPA
  // HTML. noindex only; PageSEO emits no canonical for noindex pages.
  return {
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
    canonicalPath: "/",
    noindex: true,
    keywords: SITE_KEYWORDS,
    breadcrumbLabel: SITE_NAME,
  };
}

export function getSEOForPath(pathname: string) {
  const cfg = getConfigForPath(pathname);
  return {
    ...cfg,
    canonicalUrl: getCanonicalUrl(cfg.canonicalPath),
    ogImageUrl: getOgImageUrl(cfg.ogImage || SITE_DEFAULT_OG_IMAGE),
  };
}

/**
 * Indexable static routes. scripts/generate-sitemaps.mjs keeps its own copy
 * (it runs in Node, outside the Vite build) — update both together.
 */
export const SITEMAP_PATHS: { path: string; changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly"; priority?: number }[] = [
  { path: "/", changefreq: "daily", priority: 1 },
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

export { BASE_URL };
