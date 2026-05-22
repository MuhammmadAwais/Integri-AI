import { useState, useEffect, useCallback, useMemo } from "react";
import type { BlogPost, BlogMetadata } from "../models/blog";
import { fetchBlogsMetadata, fetchBlogBySlug } from "../services/blogService";

/**
 * Hook for managing the complete blog catalog, including upfront global fetching,
 * real-time client-side search and multi-dropdown filtering, and local pagination.
 */
export function useBlogMetadata(initialPageSize = 12) {
  const [metadata, setMetadata] = useState<BlogMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [topicFilter, setTopicFilter] = useState<string>("");

  // Client-side Pagination State
  const [visibleCount, setVisibleCount] = useState(initialPageSize);

  // Fetch all metadata upfront
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchBlogsMetadata()
      .then((data) => {
        if (!cancelled) {
          setMetadata(data);
        }
      })
      .catch((err) => {
        console.error("useBlogMetadata error:", err);
        if (!cancelled) {
          setError(err.message ?? "Failed to load blogs");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Reset pagination when filter criteria change
  useEffect(() => {
    setVisibleCount(initialPageSize);
  }, [searchQuery, categoryFilter, topicFilter, initialPageSize]);

  // Client-side search and filtering logic
  const filteredBlogs = useMemo(() => {
    return metadata.filter((blog) => {
      // 1. Search Query (Title, slug, tags, topic)
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        blog.title.toLowerCase().includes(q) ||
        blog.slug.toLowerCase().includes(q) ||
        blog.topic.toLowerCase().includes(q) ||
        blog.tags.some((tag) => tag.toLowerCase().includes(q));

      // 2. Category Dropdown Filter
      const matchesCategory =
        categoryFilter === "" || blog.category === categoryFilter;

      // 3. Topic Dropdown Filter
      const matchesTopic =
        topicFilter === "" || blog.topic.toLowerCase() === topicFilter.toLowerCase();

      return matchesSearch && matchesCategory && matchesTopic;
    });
  }, [metadata, searchQuery, categoryFilter, topicFilter]);

  // Extract unique categories & topics for dropdown options
  const uniqueCategories = useMemo(() => {
    const categories = metadata.map((b) => b.category);
    return Array.from(new Set(categories));
  }, [metadata]);

  const uniqueTopics = useMemo(() => {
    const topics = metadata.map((b) => b.topic);
    return Array.from(new Set(topics)).filter(Boolean);
  }, [metadata]);

  // Slice visible items for client-side pagination
  const visibleBlogs = useMemo(() => {
    return filteredBlogs.slice(0, visibleCount);
  }, [filteredBlogs, visibleCount]);

  const hasMore = visibleCount < filteredBlogs.length;

  const loadMore = useCallback(() => {
    if (hasMore) {
      setVisibleCount((prev) => prev + initialPageSize);
    }
  }, [hasMore, initialPageSize]);

  return {
    blogs: visibleBlogs,
    allFilteredBlogs: filteredBlogs,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    topicFilter,
    setTopicFilter,
    categories: uniqueCategories,
    topics: uniqueTopics,
    hasMore,
    loadMore,
  };
}

/**
 * Hook for lazy-loading a full blog post by its slug (strictly on details page view).
 */
export function useBlogPost(slug: string | undefined) {
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchBlogBySlug(slug)
      .then((data) => {
        if (!cancelled) {
          setBlog(data);
        }
      })
      .catch((err) => {
        console.error("useBlogPost error:", err);
        if (!cancelled) {
          setError(err.message ?? "Failed to load blog post");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { blog, loading, error };
}
