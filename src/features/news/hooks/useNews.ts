import { useState, useEffect, useCallback, useRef } from "react";
import type { PublicNewsArticle, NewsArticleDetail } from "../models/publicNewsArticle";
import {
    fetchNews,
    fetchNewsById,
    fetchArticles,
    fetchArticleById,
} from "../services/newsService";
import { useAppSelector } from "../../../hooks/useRedux";

// ── Paginated news list ─────────────────────────────────────────────

export function useNewsList(pageSize = 12, countryOverride?: string | null) {
    const token = useAppSelector((state: any) => state.auth.accessToken);
    const preferredCountry = useAppSelector(
        (state: any) => state.userPreferences.preferences?.country
    );
    // Use explicit override first, then user's preference, then undefined (global)
    const country = countryOverride !== undefined ? countryOverride : preferredCountry;

    const [articles, setArticles] = useState<PublicNewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const offsetRef = useRef(0);
    const initialLoadDone = useRef(false);

    // Initial load — re-runs when country or token changes
    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }
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
        if (!hasMore || loadingMore || !initialLoadDone.current || !token) return;
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
        if (!token) {
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
    const country = countryOverride !== undefined ? countryOverride : preferredCountry;

    const [articles, setArticles] = useState<PublicNewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const offsetRef = useRef(0);
    const initialLoadDone = useRef(false);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }
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
        if (!hasMore || loadingMore || !initialLoadDone.current || !token) return;
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
        if (!token) {
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
