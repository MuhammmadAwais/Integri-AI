import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../lib/utils";
import { useNewsList } from "../features/news/hooks/useNews";
import { localised } from "../features/news/models/newsArticle";
import type { NewsArticle } from "../features/news/models/newsArticle";

// ── Helpers ───────────────────────────────────────────────────────────

/** Human-friendly relative time string. */
function timeAgo(date: Date): string {
    const now = Date.now();
    const diff = now - date.getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

/** Estimate read time from description content blocks. */
function readTime(article: NewsArticle, lang: string): string {
    const text = article.content
        .filter((c) => c.type === "description")
        .map((c) => localised(c.value, lang))
        .join(" ");
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return `${minutes} min read`;
}


// ── Featured Article ──────────────────────────────────────────────────

const FeaturedArticle: React.FC<{
    article: NewsArticle;
    isDark: boolean;
    lang: string;
}> = ({ article, isDark, lang }) => (
    <Link to={`/news/${article.id}`} className="block group">
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn(
                "flex flex-col md:flex-row gap-6 rounded-2xl overflow-hidden transition-all duration-300",
                isDark
                    ? "bg-[#111] hover:bg-[#1a1a1a]"
                    : "bg-white hover:bg-gray-50 shadow-sm hover:shadow-md",
            )}
        >
            {/* Image */}
            <div className="md:w-[45%] aspect-[16/10] md:aspect-auto overflow-hidden flex-shrink-0">
                <img
                    src={article.coverImage}
                    alt={localised(article.headline, lang)}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-center py-4 px-5 md:px-2 md:pr-6 gap-3">
                {/* Source + Time */}
                <div className="flex items-center gap-2 text-xs">
                    {article.newsSource?.image && (
                        <img
                            src={article.newsSource.image}
                            alt=""
                            className="w-4 h-4 rounded-full object-cover"
                        />
                    )}
                    <span
                        className={cn(
                            "font-semibold",
                            isDark ? "text-gray-300" : "text-gray-700",
                        )}
                    >
                        {article.newsSource
                            ? localised(article.newsSource.company, lang) ||
                            article.newsSource.companyName
                            : article.topic}
                    </span>
                    <span className={isDark ? "text-gray-600" : "text-gray-400"}>·</span>
                    <span className={isDark ? "text-gray-500" : "text-gray-500"}>
                        {timeAgo(article.date)}
                    </span>
                </div>

                {/* Title */}
                <h2
                    className={cn(
                        "text-2xl md:text-3xl font-bold leading-tight tracking-tight group-hover:underline decoration-2 underline-offset-4",
                        isDark ? "text-white" : "text-gray-900",
                    )}
                >
                    {localised(article.headline, lang)}
                </h2>

                {/* Excerpt */}
                <p
                    className={cn(
                        "text-sm leading-relaxed line-clamp-3",
                        isDark ? "text-gray-400" : "text-gray-600",
                    )}
                >
                    {localised(
                        article.content.find((c) => c.type === "description")?.value,
                        lang,
                    )}
                </p>

                {/* Category + Read time */}
                <div className="flex items-center gap-3 mt-1">
                    <span
                        className={cn(
                            "text-xs font-bold",
                            isDark ? "text-white" : "text-gray-900",
                        )}
                    >
                        {article.topic}
                    </span>
                    <span
                        className={cn(
                            "flex items-center gap-1 text-xs",
                            isDark ? "text-gray-500" : "text-gray-500",
                        )}
                    >
                        <Clock size={12} />
                        {readTime(article, lang)}
                    </span>
                </div>
            </div>
        </motion.div>
    </Link>
);

// ── News Card ─────────────────────────────────────────────────────────

const NewsCard: React.FC<{
    article: NewsArticle;
    isDark: boolean;
    lang: string;
    index: number;
}> = ({ article, isDark, lang, index }) => (
    <Link to={`/news/${article.id}`} className="block group">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
            className={cn(
                "rounded-xl overflow-hidden transition-all duration-300 h-full flex flex-col",
                isDark
                    ? "bg-[#111] hover:bg-[#1a1a1a]"
                    : "bg-white hover:bg-gray-50 shadow-sm hover:shadow-md",
            )}
        >
            {/* Image */}
            <div className="aspect-[16/10] overflow-hidden">
                <img
                    src={article.coverImage}
                    alt={localised(article.headline, lang)}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-2 p-4 flex-1">
                {/* Source + Time */}
                <div className="flex items-center gap-2 text-[11px]">
                    {article.newsSource?.image && (
                        <img
                            src={article.newsSource.image}
                            alt=""
                            className="w-3.5 h-3.5 rounded-full object-cover"
                        />
                    )}
                    <span
                        className={cn(
                            "font-semibold",
                            isDark ? "text-gray-300" : "text-gray-700",
                        )}
                    >
                        {article.newsSource
                            ? localised(article.newsSource.company, lang) ||
                            article.newsSource.companyName
                            : article.topic}
                    </span>
                    <span className={isDark ? "text-gray-600" : "text-gray-400"}>·</span>
                    <span className={isDark ? "text-gray-500" : "text-gray-500"}>
                        {timeAgo(article.date)}
                    </span>
                </div>

                {/* Title */}
                <h3
                    className={cn(
                        "text-sm font-bold leading-snug line-clamp-2 group-hover:underline decoration-1 underline-offset-2",
                        isDark ? "text-white" : "text-gray-900",
                    )}
                >
                    {localised(article.headline, lang)}
                </h3>

                {/* Excerpt */}
                <p
                    className={cn(
                        "text-xs leading-relaxed line-clamp-3 flex-1",
                        isDark ? "text-gray-400" : "text-gray-600",
                    )}
                >
                    {localised(
                        article.content.find((c) => c.type === "description")?.value,
                        lang,
                    )}
                </p>

                {/* Category + Read time */}
                <div className="flex items-center gap-3 mt-auto pt-2">
                    <span
                        className={cn(
                            "text-[11px] font-bold",
                            isDark ? "text-white" : "text-gray-900",
                        )}
                    >
                        {article.topic}
                    </span>
                    <span
                        className={cn(
                            "flex items-center gap-1 text-[11px]",
                            isDark ? "text-gray-500" : "text-gray-500",
                        )}
                    >
                        <Clock size={11} />
                        {readTime(article, lang)}
                    </span>
                </div>
            </div>
        </motion.div>
    </Link>
);

// ── Loading Skeleton ──────────────────────────────────────────────────

const CardSkeleton: React.FC<{ isDark: boolean }> = ({ isDark }) => (
    <div
        className={cn(
            "rounded-xl overflow-hidden animate-pulse",
            isDark ? "bg-[#111]" : "bg-white shadow-sm",
        )}
    >
        <div
            className={cn(
                "aspect-[16/10]",
                isDark ? "bg-[#1a1a1a]" : "bg-gray-200",
            )}
        />
        <div className="p-4 space-y-3">
            <div
                className={cn(
                    "h-3 w-24 rounded",
                    isDark ? "bg-[#1a1a1a]" : "bg-gray-200",
                )}
            />
            <div
                className={cn(
                    "h-4 w-full rounded",
                    isDark ? "bg-[#1a1a1a]" : "bg-gray-200",
                )}
            />
            <div
                className={cn(
                    "h-3 w-3/4 rounded",
                    isDark ? "bg-[#1a1a1a]" : "bg-gray-200",
                )}
            />
        </div>
    </div>
);

// ── Main Page ─────────────────────────────────────────────────────────

const NewsPage: React.FC = () => {
    const isDark = useAppSelector((state: any) => state.theme.isDark);
    const { i18n } = useTranslation();
    const lang = i18n.language;
    const { articles, loading, error } = useNewsList(20);

    const featured = articles[0];
    const latest = articles.slice(1);

    return (
        <div
            className={cn(
                "h-full w-full overflow-y-auto",
                isDark ? "bg-[#000]" : "bg-gray-50",
            )}
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
                {/* ── Loading State ── */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <Loader2
                            size={32}
                            className={cn(
                                "animate-spin",
                                isDark ? "text-gray-500" : "text-gray-400",
                            )}
                        />
                        <span
                            className={cn(
                                "text-sm",
                                isDark ? "text-gray-500" : "text-gray-400",
                            )}
                        >
                            Loading news…
                        </span>
                    </div>
                )}

                {/* ── Error State ── */}
                {error && !loading && (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <span className="text-red-500 text-sm font-medium">{error}</span>
                    </div>
                )}

                {/* ── Empty State ── */}
                {!loading && !error && articles.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <span
                            className={cn(
                                "text-sm",
                                isDark ? "text-gray-500" : "text-gray-400",
                            )}
                        >
                            No news articles found.
                        </span>
                    </div>
                )}

                {/* ── Content ── */}
                {!loading && !error && articles.length > 0 && (
                    <>
                        {/* Featured Article */}
                        <FeaturedArticle
                            article={featured}
                            isDark={isDark}
                            lang={lang}
                        />

                        {/* Latest News Header */}
                        {latest.length > 0 && (
                            <>
                                <div className="flex items-center justify-between">
                                    <h2
                                        className={cn(
                                            "text-xl font-bold",
                                            isDark ? "text-white" : "text-gray-900",
                                        )}
                                    >
                                        Latest News
                                    </h2>
                                    <button
                                        className={cn(
                                            "flex items-center gap-1.5 text-sm font-semibold transition-colors",
                                            isDark ? "text-white hover:text-gray-300" : "text-gray-900 hover:text-gray-700",
                                        )}
                                    >
                                        See all <ArrowRight size={15} />
                                    </button>
                                </div>

                                {/* Card Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pb-8">
                                    {latest.map((article, i) => (
                                        <NewsCard
                                            key={article.id}
                                            article={article}
                                            isDark={isDark}
                                            lang={lang}
                                            index={i}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* ── Skeleton while loading ── */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pb-8">
                        {[0, 1, 2, 3].map((i) => (
                            <CardSkeleton key={i} isDark={isDark} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsPage;
