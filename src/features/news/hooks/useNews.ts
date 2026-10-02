import { useState, useEffect, useCallback, useRef } from "react";
import type { PublicNewsArticle, NewsArticleDetail } from "../models/publicNewsArticle";
import {
    fetchNews,
    fetchNewsById,
    fetchArticles,
    fetchArticleById,
} from "../services/newsService";
import { useAppSelector } from "../../../hooks/useRedux";
import { NewsService } from "../../../api/backendApi";
import { detectVisitorNewsCountry } from "../utils/countryHelper";

// Guests have no profile country; guess theirs once from the browser.
const visitorCountry = detectVisitorNewsCountry();

// ── Paginated news list ─────────────────────────────────────────────

export function useNewsList(pageSize = 12, countryOverride?: string | null) {
    const token = useAppSelector((state: any) => state.auth.accessToken);
    const preferredCountry = useAppSelector(
        (state: any) => state.userPreferences.preferences?.country
    );
    // Explicit override first, then the user's preference, then the visitor's guessed country
    const country = (countryOverride !== undefined ? countryOverride : preferredCountry) || visitorCountry;

    const [articles, setArticles] = useState<PublicNewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const offsetRef = useRef(0);
    const initialLoadDone = useRef(false);

    // Initial load — re-runs when country or token changes. The feed is public,
    // so guests load it too; the token (when present) is passed along.
    useEffect(() => {
        let cancelled = false;
        offsetRef.current = 0;
        initialLoadDone.current = false;
        setLoading(true);
        setError(null);
        fetchNews(pageSize, 0, country, token)
            .then((result) => {
                if (!cancelled) {
                    setArticles(result.articles);
                    offsetRef.current = result.articles.length;
                    setHasMore(result.hasMore);
                    initialLoadDone.current = true;
                }
            })
            .catch((err) => {
                console.error("useNewsList error:", err);
                if (!cancelled) setError(err.response?.data?.detail || err.message || "Failed to load news");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [pageSize, country, token]);

    // Load more
    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore || !initialLoadDone.current) return;
        setLoadingMore(true);
        try {
            const result = await fetchNews(pageSize, offsetRef.current, country, token);
            setArticles((prev) => [...prev, ...result.articles]);
            offsetRef.current += result.articles.length;
            setHasMore(result.hasMore);
        } catch (err: any) {
            console.error("useNewsList loadMore error:", err);
            setError(err.response?.data?.detail || err.message || "Failed to load more news");
        } finally {
            setLoadingMore(false);
        }
    }, [hasMore, loadingMore, pageSize, country, token]);

    return { articles, loading, loadingMore, error, hasMore, loadMore };
}

// ── Single news article ─────────────────────────────────────────────

export function useNewsArticle(id: string | undefined, collection?: string) {
    const token = useAppSelector((state: any) => state.auth.accessToken);
    const [article, setArticle] = useState<NewsArticleDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetchNewsById(id, collection ?? "News", token)
            .then((data) => {
                if (!cancelled) {
                    if (data) {
                        setArticle(data);
                    } else {
                        setError("Article not found");
                    }
                }
            })
            .catch((err) => {
                console.error("useNewsArticle error:", err);
                if (!cancelled) setError(err.response?.data?.detail || err.message || "Failed to load article");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [id, collection, token]);

    return { article, loading, error };
}

// ── Paginated articles list ─────────────────────────────────────────

export function useArticlesList(pageSize = 12, countryOverride?: string | null) {
    const token = useAppSelector((state: any) => state.auth.accessToken);
    const preferredCountry = useAppSelector(
        (state: any) => state.userPreferences.preferences?.country
    );
    const country = (countryOverride !== undefined ? countryOverride : preferredCountry) || visitorCountry;

    const [articles, setArticles] = useState<PublicNewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const offsetRef = useRef(0);
    const initialLoadDone = useRef(false);

    useEffect(() => {
        let cancelled = false;
        offsetRef.current = 0;
        initialLoadDone.current = false;
        setLoading(true);
        setError(null);
        fetchArticles(pageSize, 0, country, token)
            .then((result) => {
                if (!cancelled) {
                    setArticles(result.articles);
                    offsetRef.current = result.articles.length;
                    setHasMore(result.hasMore);
                    initialLoadDone.current = true;
                }
            })
            .catch((err) => {
                console.error("useArticlesList error:", err);
                if (!cancelled) setError(err.response?.data?.detail || err.message || "Failed to load articles");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [pageSize, country, token]);

    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore || !initialLoadDone.current) return;
        setLoadingMore(true);
        try {
            const result = await fetchArticles(pageSize, offsetRef.current, country, token);
            setArticles((prev) => [...prev, ...result.articles]);
            offsetRef.current += result.articles.length;
            setHasMore(result.hasMore);
        } catch (err: any) {
            console.error("useArticlesList loadMore error:", err);
            setError(err.response?.data?.detail || err.message || "Failed to load more articles");
        } finally {
            setLoadingMore(false);
        }
    }, [hasMore, loadingMore, pageSize, country, token]);

    return { articles, loading, loadingMore, error, hasMore, loadMore };
}

// ── Single article by ID ────────────────────────────────────────────

export function useArticle(id: string | undefined, collection?: string) {
    const token = useAppSelector((state: any) => state.auth.accessToken);
    const [article, setArticle] = useState<NewsArticleDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetchArticleById(id, collection ?? "News", token)
            .then((data) => {
                if (!cancelled) {
                    if (data) {
                        setArticle(data);
                    } else {
                        setError("Article not found");
                    }
                }
            })
            .catch((err) => {
                console.error("useArticle error:", err);
                if (!cancelled) setError(err.response?.data?.detail || err.message || "Failed to load article");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [id, collection, token]);

    return { article, loading, error };
}

// ── Whole country feed (news page with numbered pages) ──────────────
// The API has no offset/page parameter, so the page loads the country's
// last 30 days in one request (API max: 200) and pages through it locally.

const FEED_DAYS = 30;
const FEED_LIMIT = 200;
const feedCache = new Map<string, PublicNewsArticle[]>();

export function useNewsFeed(country: string) {
    const token = useAppSelector((state: any) => state.auth.accessToken);
    // Result tagged with its country, so switching country never shows stale rows.
    const [result, setResult] = useState<{ country: string; error: string | null } | null>(null);

    useEffect(() => {
        let cancelled = false;
        NewsService.getPublicFeed({ country, days: FEED_DAYS, limit: FEED_LIMIT }, token ?? undefined)
            .then((data) => {
                feedCache.set(country, data.articles ?? []);
                if (!cancelled) setResult({ country, error: null });
            })
            .catch((err) => {
                console.error("useNewsFeed error:", err);
                if (!cancelled) {
                    setResult({ country, error: err.response?.data?.detail || err.message || "Failed to load news" });
                }
            });
        return () => { cancelled = true; };
    }, [country, token]);

    const cached = feedCache.get(country);
    const settled = result?.country === country;
    return {
        articles: cached ?? [],
        loading: !cached && !settled,
        error: !cached && settled ? result.error : null,
    };
}
