// ── Models matching the Integri backend API: GET /api/v1/news/articles ──

export interface PublicNewsArticle {
  id: string;
  country: string;
  topic: string;
  collection: string;
  /** Multilingual headline map e.g. { "en": "...", "ar": "..." } */
  headline: Record<string, string>;
  /** Pre-resolved English headline for convenience */
  headline_en?: string;
  coverImage: string;
  isAiCompiled: boolean;
  views: number;
  markAsTrending: boolean;
  date: string; // ISO 8601
  sources_count: number;
}

export interface PublicNewsResponse {
  total: number;
  days_back: number;
  country: string;
  collection: string;
  articles: PublicNewsArticle[];
}

/** Daily summary returned by GET /api/v1/news/articles/daily-summary */
export interface DailySummaryResponse {
  summary: string;
  date: string;
  country: string;
  articles_count: number;
}

/** News article detail from GET /api/v1/news/admin/articles/{id} */
export interface NewsArticleDetail {
  id: string;
  country: string;
  topic: string;
  collection: string;
  headline: Record<string, string>;
  coverImage: string;
  video?: string;
  thumbnailOfVideo?: string;
  date: string;
  tags: string[];
  content: Array<{
    type: "description" | "image" | "video";
    value: Record<string, string>;
    videoThumbnail?: string;
    caption?: Record<string, string>;
  }>;
  markAsTrending: boolean;
  /** Writer's SEO title / meta description (localised), when the pipeline provides them. */
  seo_title?: Record<string, string> | string;
  meta_description?: Record<string, string> | string;
  /** Last real content change (ISO 8601). */
  updatedAt?: string;
  compiledAt?: string;
  sources?: Array<{
    title: string;
    image: string;
    source: string;
    url: string;
  }>;
  newsSource?: {
    url: string;
    companyName: string;
    company: Record<string, string>;
    image: string;
  };
  grammar?: Array<{
    title: Record<string, string>;
    description: Record<string, string>;
    example: Record<string, string>;
    rules: Record<string, string[]>;
  }>;
  keywords?: Array<{
    title: Record<string, string>;
    nouns: Record<string, string>;
    description: Record<string, string>;
  }>;
}

/** Helper: resolve multilingual content to the best available language */
export function localised(
  field: string | Record<string, string> | undefined,
  lang = "en",
): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field[lang] ?? field["en"] ?? Object.values(field)[0] ?? "";
}

export const resolveHeadline = localised; // Alias for backward compatibility
