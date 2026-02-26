import { useState, useEffect } from "react";
import type { NewsArticle } from "../models/newsArticle";
import { fetchNews, fetchNewsById } from "../services/newsService";

/** Fetch all news (latest first). */
export function useNewsList(count = 20) {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchNews(count)
            .then((data) => {
                if (!cancelled) setArticles(data);
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
    }, [count]);

    return { articles, loading, error };
}

/** Fetch a single article by ID. */
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
