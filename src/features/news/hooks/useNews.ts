import { useState, useEffect, useCallback, useRef } from "react";
import type { QueryDocumentSnapshot } from "firebase/firestore";
import type { NewsArticle } from "../models/newsArticle";
import {
    fetchNews,
    fetchNewsById,
    fetchArticles,
    fetchArticleById,
} from "../services/newsService";

// ── Paginated news list ─────────────────────────────────────────────

export function useNewsList(pageSize = 12) {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const lastDocRef = useRef<QueryDocumentSnapshot | null>(null);
    const initialLoadDone = useRef(false);

    // Initial load
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchNews(pageSize)
            .then((result) => {
                if (!cancelled) {
                    setArticles(result.articles);
                    lastDocRef.current = result.lastDoc;
                    setHasMore(result.hasMore);
                    initialLoadDone.current = true;
                }
            })
            .catch((err) => {
                console.error("useNewsList error:", err);
                if (!cancelled) setError(err.message ?? "Failed to load news");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [pageSize]);

    // Load more
    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore || !initialLoadDone.current) return;
        setLoadingMore(true);
        try {
            const result = await fetchNews(pageSize, lastDocRef.current);
            setArticles((prev) => [...prev, ...result.articles]);
            lastDocRef.current = result.lastDoc;
            setHasMore(result.hasMore);
        } catch (err: any) {
            console.error("useNewsList loadMore error:", err);
            setError(err.message ?? "Failed to load more news");
        } finally {
            setLoadingMore(false);
        }
    }, [hasMore, loadingMore, pageSize]);

    return { articles, loading, loadingMore, error, hasMore, loadMore };
}

// ── Single news article ─────────────────────────────────────────────

export function useNewsArticle(id: string | undefined) {
    const [article, setArticle] = useState<NewsArticle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        fetchNewsById(id)
            .then((data) => {
                if (!cancelled) setArticle(data);
            })
            .catch((err) => {
                console.error("useNewsArticle error:", err);
                if (!cancelled) setError(err.message ?? "Failed to load article");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [id]);

    return { article, loading, error };
}

// ── Paginated articles list ─────────────────────────────────────────

export function useArticlesList(pageSize = 12) {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const lastDocRef = useRef<QueryDocumentSnapshot | null>(null);
    const initialLoadDone = useRef(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchArticles(pageSize)
            .then((result) => {
                if (!cancelled) {
                    setArticles(result.articles);
                    lastDocRef.current = result.lastDoc;
                    setHasMore(result.hasMore);
                    initialLoadDone.current = true;
                }
            })
            .catch((err) => {
                console.error("useArticlesList error:", err);
                if (!cancelled) setError(err.message ?? "Failed to load articles");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [pageSize]);

    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore || !initialLoadDone.current) return;
        setLoadingMore(true);
        try {
            const result = await fetchArticles(pageSize, lastDocRef.current);
            setArticles((prev) => [...prev, ...result.articles]);
            lastDocRef.current = result.lastDoc;
            setHasMore(result.hasMore);
        } catch (err: any) {
            console.error("useArticlesList loadMore error:", err);
            setError(err.message ?? "Failed to load more articles");
        } finally {
            setLoadingMore(false);
        }
    }, [hasMore, loadingMore, pageSize]);

    return { articles, loading, loadingMore, error, hasMore, loadMore };
}

// ── Single article by ID ────────────────────────────────────────────

export function useArticle(id: string | undefined) {
    const [article, setArticle] = useState<NewsArticle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        fetchArticleById(id)
            .then((data) => {
                if (!cancelled) setArticle(data);
            })
            .catch((err) => {
                console.error("useArticle error:", err);
                if (!cancelled) setError(err.message ?? "Failed to load article");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [id]);

    return { article, loading, error };
}
