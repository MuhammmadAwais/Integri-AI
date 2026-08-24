import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight,
    Clock,
    Loader2,
    ChevronDown,
    Newspaper,
    BookOpen,
    TrendingUp,
    Lock,
    LogIn,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../lib/utils";
import { useNewsList, useArticlesList } from "../features/news/hooks/useNews";
import { localised } from "../features/news/models/newsArticle";
import type { NewsArticle } from "../features/news/models/newsArticle";
import AdUnit from "../Components/ads/AdUnit";
import { AD_SLOTS, IN_FEED_AD_INTERVAL } from "../config/ads";

// ── Helpers ───────────────────────────────────────────────────────────



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

// ── Tab Types ─────────────────────────────────────────────────────────

type TabType = "news" | "articles";

// ── Featured Article ──────────────────────────────────────────────────

const FeaturedArticle: React.FC<{
    article: NewsArticle;
    isDark: boolean;
    lang: string;
    type: TabType;
}> = ({ article, isDark, lang, type }) => (
    <Link
        to={type === "news" ? `/news/${article.id}` : `/articles/${article.id}`}
        className="block group"
        id={`featured-${type}-${article.id}`}
    >
        <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn(
                "flex flex-col md:flex-row gap-0 rounded-2xl overflow-hidden transition-all duration-300",
                isDark
                    ? "bg-[#0a0a0a] hover:bg-[#111] border border-white/5"
                    : "bg-white hover:bg-gray-50/80 shadow-sm hover:shadow-lg",
            )}
        >
            {/* Image */}
            <div className="md:w-[48%] aspect-[16/10] md:aspect-auto overflow-hidden flex-shrink-0 relative">
                <img
                    src={article.coverImage}
                    alt={localised(article.headline, lang)}
                    loading="eager"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className={cn(
                    "absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md",
                    isDark ? "bg-white/15 text-white" : "bg-black/10 text-white",
                )}>
                    <TrendingUp size={10} />
                    Featured
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-center py-5 px-5 md:px-6 gap-3">
                {/* Source + Time */}
                <div className="flex items-center gap-2 text-xs">
                    {article.newsSource?.image && (
                        <img
                            src={article.newsSource.image}
                            alt=""
                            className="w-4 h-4 rounded-full object-cover ring-1 ring-black/10"
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
                </div>

                {/* Title */}
                <h2
                    className={cn(
                        "text-xl sm:text-2xl md:text-3xl font-bold leading-tight tracking-tight group-hover:underline decoration-2 underline-offset-4",
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
                            "text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full",
                            isDark ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-700",
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
        </motion.article>
    </Link>
);

// ── News Card ─────────────────────────────────────────────────────────

const NewsCard: React.FC<{
    article: NewsArticle;
    isDark: boolean;
    lang: string;
    index: number;
    type: TabType;
}> = ({ article, isDark, lang, index, type }) => (
    <Link
        to={type === "news" ? `/news/${article.id}` : `/articles/${article.id}`}
        className="block group"
        id={`${type}-card-${article.id}`}
    >
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(0.1 * index, 0.8) }}
            className={cn(
                "rounded-xl overflow-hidden transition-all duration-300 h-full flex flex-col",
                isDark
                    ? "bg-[#0a0a0a] hover:bg-[#111] border border-white/5"
                    : "bg-white hover:bg-gray-50 shadow-sm hover:shadow-md",
            )}
        >
            {/* Image */}
            <div className="aspect-[16/10] overflow-hidden relative">
                <img
                    src={article.coverImage}
                    alt={localised(article.headline, lang)}
                    loading="lazy"
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
                            "text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded",
                            isDark ? "bg-white/10 text-gray-400" : "bg-gray-100 text-gray-600",
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
        </motion.article>
    </Link>
);

// ── Compact Side Card (for sidebar lists) ─────────────────────────────

const CompactCard: React.FC<{
    article: NewsArticle;
    isDark: boolean;
    lang: string;
    type: TabType;
}> = ({ article, isDark, lang, type }) => (
    <Link
        to={type === "news" ? `/news/${article.id}` : `/articles/${article.id}`}
        className="block group"
    >
        <div className={cn(
            "flex gap-3 p-3 rounded-xl transition-all duration-200",
            isDark ? "hover:bg-[#111]" : "hover:bg-gray-50",
        )}>
            <img
                src={article.coverImage}
                alt={localised(article.headline, lang)}
                loading="lazy"
                className="w-20 h-14 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex flex-col justify-center gap-1 min-w-0">
                <h4 className={cn(
                    "text-xs font-semibold leading-snug line-clamp-2 group-hover:underline",
                    isDark ? "text-gray-200" : "text-gray-900",
                )}>
                    {localised(article.headline, lang)}
                </h4>
            </div>
        </div>
    </Link>
);

// ── Loading Skeleton ──────────────────────────────────────────────────

const CardSkeleton: React.FC<{ isDark: boolean }> = ({ isDark }) => (
    <div
        className={cn(
            "rounded-xl overflow-hidden animate-pulse",
            isDark ? "bg-[#0a0a0a] border border-white/5" : "bg-white shadow-sm",
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

const CompactSkeleton: React.FC<{ isDark: boolean }> = ({ isDark }) => (
    <div className="flex gap-3 p-3 animate-pulse">
        <div className={cn(
            "w-20 h-14 rounded-lg flex-shrink-0",
            isDark ? "bg-[#1a1a1a]" : "bg-gray-200",
        )} />
        <div className="flex flex-col justify-center gap-2 flex-1">
            <div className={cn(
                "h-3 w-full rounded",
                isDark ? "bg-[#1a1a1a]" : "bg-gray-200",
            )} />
            <div className={cn(
                "h-2.5 w-16 rounded",
                isDark ? "bg-[#1a1a1a]" : "bg-gray-200",
            )} />
        </div>
    </div>
);

// ── Load More Button ──────────────────────────────────────────────────

const LoadMoreButton: React.FC<{
    onClick: () => void;
    loading: boolean;
    isDark: boolean;
}> = ({ onClick, loading, isDark }) => (
    <motion.button
        onClick={onClick}
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
            "mx-auto flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300",
            loading && "opacity-70 cursor-not-allowed",
            isDark
                ? "bg-white/10 text-white hover:bg-white/15 border border-white/10"
                : "bg-gray-900 text-white hover:bg-gray-800 shadow-sm hover:shadow-md",
        )}
        id="load-more-button"
    >
        {loading ? (
            <>
                <Loader2 size={16} className="animate-spin" />
                Loading…
            </>
        ) : (
            <>
                <ChevronDown size={16} />
                Load More
            </>
        )}
    </motion.button>
);

// ── Main Page ─────────────────────────────────────────────────────────

const NewsPage: React.FC = () => {
    const isDark = useAppSelector((state: any) => state.theme.isDark);
    const user = useAppSelector((state: any) => state.auth.user);
    const { i18n } = useTranslation();
    const lang = i18n.language;

    const [activeTab, setActiveTab] = useState<TabType>("news");

    // News data
    const {
        articles: newsArticles,
        loading: newsLoading,
        loadingMore: newsLoadingMore,
        error: newsError,
        hasMore: newsHasMore,
        loadMore: loadMoreNews,
    } = useNewsList(12, user?.country);

    // Articles data
    const {
        articles: articlesData,
        loading: articlesLoading,
        loadingMore: articlesLoadingMore,
        error: articlesError,
        hasMore: articlesHasMore,
        loadMore: loadMoreArticles,
    } = useArticlesList(12, user?.country);

    // Pick the active data set
    const articles = activeTab === "news" ? newsArticles : articlesData;
    const loading = activeTab === "news" ? newsLoading : articlesLoading;
    const loadingMore = activeTab === "news" ? newsLoadingMore : articlesLoadingMore;
    const error = activeTab === "news" ? newsError : articlesError;
    const hasMore = activeTab === "news" ? newsHasMore : articlesHasMore;
    const loadMore = activeTab === "news" ? loadMoreNews : loadMoreArticles;

    const featured = articles[0];
    const grid = articles.slice(1);

    // Cross-content: show articles in the news tab sidebar, and vice versa
    const crossContent = activeTab === "news" ? articlesData.slice(0, 5) : newsArticles.slice(0, 5);
    const crossLabel = activeTab === "news" ? "Latest Articles" : "Latest News";
    const crossType: TabType = activeTab === "news" ? "articles" : "news";
    const crossLoading = activeTab === "news" ? articlesLoading : newsLoading;

    if (!user) {
        return (
            <div
                className={cn(
                    "h-full w-full flex flex-col items-center justify-center p-6 text-center",
                    isDark ? "bg-[#000]" : "bg-gray-50",
                )}
            >
                <div className={cn(
                    "max-w-md w-full p-8 rounded-2xl flex flex-col items-center gap-6",
                    isDark ? "bg-[#0a0a0a] border border-white/10 shadow-2xl" : "bg-white shadow-xl border border-gray-100"
                )}>
                    <div className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center",
                        isDark ? "bg-white/5 text-gray-400" : "bg-gray-50 text-gray-400"
                    )}>
                        <Lock size={32} />
                    </div>
                    <div className="space-y-2">
                        <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                            Personalized News
                        </h2>
                        <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                            Sign in to read the latest global news and updates tailored to your country and language preferences.
                        </p>
                    </div>
                    <Link
                        to="/login"
                        className={cn(
                            "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all",
                            isDark ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"
                        )}
                    >
                        <LogIn size={18} />
                        Sign In Now
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "h-full w-full overflow-y-auto",
                isDark ? "bg-[#000]" : "bg-gray-50",
            )}
            id="news-page-root"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

                {/* ── Page Header ── */}
                <header className="space-y-4">
                    <h1 className={cn(
                        "text-3xl sm:text-4xl font-bold tracking-tight",
                        isDark ? "text-white" : "text-gray-900",
                    )}>
                        {activeTab === "news" ? "Latest News" : "Articles"}
                    </h1>
                    <p className={cn(
                        "text-sm max-w-2xl leading-relaxed",
                        isDark ? "text-gray-400" : "text-gray-600",
                    )}>
                        {activeTab === "news"
                            ? "Stay updated with the latest AI news, technology breakthroughs, and industry insights from around the world."
                            : "In-depth articles, tutorials, and guides on AI, technology, and innovation."
                        }
                    </p>
                </header>

                {/* ── Tab Navigation ── */}
                <nav
                    className={cn(
                        "flex gap-1 p-1 rounded-xl w-fit",
                        isDark ? "bg-[#111] border border-white/5" : "bg-gray-100",
                    )}
                    aria-label="Content type"
                    id="content-tabs"
                >
                    <button
                        onClick={() => setActiveTab("news")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                            activeTab === "news"
                                ? isDark
                                    ? "bg-white text-black shadow-sm"
                                    : "bg-white text-gray-900 shadow-sm"
                                : isDark
                                    ? "text-gray-400 hover:text-white hover:bg-white/5"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                        )}
                        id="tab-news"
                    >
                        <Newspaper size={15} />
                        News
                    </button>
                    <button
                        onClick={() => setActiveTab("articles")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                            activeTab === "articles"
                                ? isDark
                                    ? "bg-white text-black shadow-sm"
                                    : "bg-white text-gray-900 shadow-sm"
                                : isDark
                                    ? "text-gray-400 hover:text-white hover:bg-white/5"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                        )}
                        id="tab-articles"
                    >
                        <BookOpen size={15} />
                        Articles
                    </button>
                </nav>

                {/* ── Loading State ── */}
                <AnimatePresence mode="wait">
                    {loading && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-24 gap-3"
                        >
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
                                Loading {activeTab}…
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

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
                            No {activeTab} found.
                        </span>
                    </div>
                )}

                {/* ── Content Layout ── */}
                {!loading && !error && articles.length > 0 && (
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8"
                    >
                        {/* Featured Article */}
                        <FeaturedArticle
                            article={featured}
                            isDark={isDark}
                            lang={lang}
                            type={activeTab}
                        />

                        {/* ── Ad: Top Banner (below featured) ── */}
                        <AdUnit
                            slot={AD_SLOTS.NEWS_LIST_TOP}
                            format="auto"
                            responsive
                            isDark={isDark}
                            testId="ad-news-list-top"
                        />

                        {/* Main Content + Sidebar */}
                        {grid.length > 0 && (
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Main Grid */}
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2
                                            className={cn(
                                                "text-xl font-bold",
                                                isDark ? "text-white" : "text-gray-900",
                                            )}
                                        >
                                            {activeTab === "news" ? "Latest News" : "More Articles"}
                                        </h2>
                                    </div>

                                    {/* Card Grid with In-Feed Ads */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                        {grid.map((article, i) => (
                                            <React.Fragment key={article.id}>
                                                <NewsCard
                                                    article={article}
                                                    isDark={isDark}
                                                    lang={lang}
                                                    index={i}
                                                    type={activeTab}
                                                />
                                                {/* Insert in-feed ad after every N cards */}
                                                {(i + 1) % IN_FEED_AD_INTERVAL === 0 && (
                                                    <div className="sm:col-span-2 xl:col-span-3">
                                                        <AdUnit
                                                            slot={AD_SLOTS.NEWS_LIST_IN_FEED}
                                                            format="fluid"
                                                            layout="in-feed"
                                                            isDark={isDark}
                                                            testId={`ad-in-feed-${i}`}
                                                        />
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>

                                    {/* Load More */}
                                    {hasMore && (
                                        <div className="flex justify-center pt-4 pb-4">
                                            <LoadMoreButton
                                                onClick={loadMore}
                                                loading={loadingMore}
                                                isDark={isDark}
                                            />
                                        </div>
                                    )}

                                    {/* End of content indicator */}
                                    {!hasMore && grid.length > 0 && (
                                        <p className={cn(
                                            "text-center text-xs py-6",
                                            isDark ? "text-gray-600" : "text-gray-400",
                                        )}>
                                            You've reached the end. Check back later for more!
                                        </p>
                                    )}
                                </div>

                                {/* Sidebar - Cross Content */}
                                <aside className="lg:w-72 xl:w-80 flex-shrink-0 space-y-4">
                                    <div className={cn(
                                        "rounded-2xl overflow-hidden",
                                        isDark ? "bg-[#0a0a0a] border border-white/5" : "bg-white shadow-sm",
                                    )}>
                                        <div className={cn(
                                            "px-4 py-3 flex items-center justify-between",
                                            isDark ? "border-b border-white/5" : "border-b border-gray-100",
                                        )}>
                                            <h3 className={cn(
                                                "text-sm font-bold",
                                                isDark ? "text-white" : "text-gray-900",
                                            )}>
                                                {crossLabel}
                                            </h3>
                                            <button
                                                onClick={() => setActiveTab(crossType)}
                                                className={cn(
                                                    "flex items-center gap-1 text-xs font-medium transition-colors",
                                                    isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900",
                                                )}
                                            >
                                                See all <ArrowRight size={12} />
                                            </button>
                                        </div>

                                        {crossLoading ? (
                                            <div className="p-1">
                                                {[0, 1, 2, 3].map((i) => (
                                                    <CompactSkeleton key={i} isDark={isDark} />
                                                ))}
                                            </div>
                                        ) : crossContent.length > 0 ? (
                                            <div className="p-1">
                                                {crossContent.map((article) => (
                                                    <CompactCard
                                                        key={article.id}
                                                        article={article}
                                                        isDark={isDark}
                                                        lang={lang}
                                                        type={crossType}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <p className={cn(
                                                "text-xs p-4",
                                                isDark ? "text-gray-500" : "text-gray-400",
                                            )}>
                                                No {crossType} available yet.
                                            </p>
                                        )}
                                    </div>

                                    {/* ── Ad: Sidebar ── */}
                                    <AdUnit
                                        slot={AD_SLOTS.NEWS_LIST_SIDEBAR}
                                        format="auto"
                                        responsive
                                        isDark={isDark}
                                        testId="ad-news-sidebar"
                                    />

                                    {/* Quick Topics / Tags */}
                                    <div className={cn(
                                        "rounded-2xl p-4 space-y-3",
                                        isDark ? "bg-[#0a0a0a] border border-white/5" : "bg-white shadow-sm",
                                    )}>
                                        <h3 className={cn(
                                            "text-sm font-bold",
                                            isDark ? "text-white" : "text-gray-900",
                                        )}>
                                            Trending Topics
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {Array.from(new Set(articles.flatMap(a => a.tags).filter(Boolean))).slice(0, 12).map((tag) => (
                                                <span
                                                    key={tag}
                                                    className={cn(
                                                        "text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors cursor-default",
                                                        isDark
                                                            ? "bg-white/5 text-gray-400 hover:bg-white/10"
                                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                                                    )}
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </aside>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ── Skeleton while loading ── */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-8">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <CardSkeleton key={i} isDark={isDark} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsPage;
