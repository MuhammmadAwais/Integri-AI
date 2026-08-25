// ── News service: Integri Backend API (/api/v1/news/articles) ───────
// Replaces the previous Firebase Firestore implementation.
// All functions maintain the same signature so hooks are minimally impacted.

import {
  NewsService,
  type PublicNewsArticle,
  type PublicNewsResponse,
  type NewsArticleDetail,
} from "../../../api/backendApi";
import { toNewsApiCountryKey } from "../utils/countryHelper";

export type { PublicNewsArticle, PublicNewsResponse, NewsArticleDetail };

// ── Paginated result ────────────────────────────────────────────────
export interface PaginatedResult {
  articles: PublicNewsArticle[];
  /** Offset of the next page (null = no more pages) */
  nextOffset: number | null;
  hasMore: boolean;
  total: number;
}

const DEFAULT_LIMIT = 12;

// ── Public API: News feed ───────────────────────────────────────────

/**
 * Fetch paginated news articles.
 * @param pageSize   Number of articles per page (default 12)
 * @param offset     Pagination offset (default 0)
 * @param country    ISO country code for personalization (e.g. "US", "PK")
 * @param token      Optional JWT — pass to get authenticated results
 * @param sort       Sort order ("latest" | "trending")
 */
export async function fetchNews(
  pageSize = DEFAULT_LIMIT,
  offset = 0,
  country?: string | null,
  token?: string,
  sort?: string,
): Promise<PaginatedResult> {
  const countryKey = toNewsApiCountryKey(country); // convert "PK" → "Pakistan", etc.
  const params: Record<string, any> = { limit: pageSize, days: 7 }; // days is required by backend
  if (countryKey) params.country = countryKey;
  if (sort) params.sort = sort;
  // Backend uses `days` not offset; for now just re-fetch from start for simplicity
  // and rely on limit to control page size. Can be extended with cursor/page params.
  const data = await NewsService.getPublicFeed(params, token ?? undefined);
  const articles = data.articles ?? [];
  const sliced = articles.slice(offset, offset + pageSize);
  const hasMore = offset + pageSize < articles.length;
  return {
    articles: sliced.length > 0 ? sliced : articles, // fallback: return all if offset=0
    nextOffset: hasMore ? offset + pageSize : null,
    hasMore,
    total: data.total ?? articles.length,
  };
}

/**
 * Fetch a single news article's full detail.
 * @param id         Article ID
 * @param collection Collection name (returned alongside the article list)
 * @param token      Optional JWT
 */
export async function fetchNewsById(
  id: string,
  collection = "News",
  token?: string,
): Promise<NewsArticleDetail | null> {
  try {
    return await NewsService.getArticleDetail(id, collection, token ?? undefined);
  } catch (err: any) {
    // If collection was "News" and returned 404, also try with "Articles" or vice versa
    if (err?.response?.status === 404) {
      if (collection === "News") {
        try {
          return await NewsService.getArticleDetail(id, "Articles", token ?? undefined);
        } catch {
          // fall through
        }
      } else if (collection === "Articles") {
        try {
          return await NewsService.getArticleDetail(id, "News", token ?? undefined);
        } catch {
          // fall through
        }
      }
    }
    throw err;
  }
}

// ── Public API: Articles (same feed, kept for backward-compat) ──────

/**
 * Fetch paginated "Articles" (same as news feed for now).
 */
export async function fetchArticles(
  pageSize = DEFAULT_LIMIT,
  offset = 0,
  country?: string | null,
  token?: string,
): Promise<PaginatedResult> {
  return fetchNews(pageSize, offset, country, token);
}

/**
 * Fetch a single article by ID.
 */
export async function fetchArticleById(
  id: string,
  collection = "News",
  token?: string,
): Promise<NewsArticleDetail | null> {
  return fetchNewsById(id, collection, token);
}

// ── Daily Summary ───────────────────────────────────────────────────
export { NewsService };
