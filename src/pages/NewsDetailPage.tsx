import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Share2, Loader2, Newspaper } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../lib/utils";
import { useNewsArticle, useArticlesList } from "../features/news/hooks/useNews";
import { localised } from "../features/news/models/newsArticle";
import type { NewContent, NewsArticle } from "../features/news/models/newsArticle";
import AdUnit from "../Components/ads/AdUnit";
import { AD_SLOTS, IN_ARTICLE_AD_INTERVAL } from "../config/ads";

// ── Helpers ───────────────────────────────────────────────────────────

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
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function readTime(
    content: NewContent[],
    lang: string,
): string {
    const text = content
        .filter((c) => c.type === "description")
        .map((c) => localised(c.value, lang))
        .join(" ");
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return `${minutes} min read`;
}

// ── Content Block Renderer ────────────────────────────────────────────

const ContentBlock: React.FC<{
    block: NewContent;
    isDark: boolean;
    lang: string;
}> = ({ block, isDark, lang }) => {
    if (block.type === "description") {
        return (
            <p
                className={cn(
                    "text-base leading-[1.85] whitespace-pre-line",
                    isDark ? "text-gray-300" : "text-gray-700",
                )}
            >
                {localised(block.value, lang)}
            </p>
        );
    }

    if (block.type === "image") {
        const imgUrl = localised(block.value, lang) || Object.values(block.value)[0];
        return (
            <figure className="my-4">
                <img
                    src={imgUrl}
                    alt={block.caption ? localised(block.caption, lang) : ""}
                    className="w-full rounded-xl object-cover"
                    loading="lazy"
                />
                {block.caption && (
                    <figcaption
                        className={cn(
                            "text-xs mt-2 text-center",
                            isDark ? "text-gray-500" : "text-gray-400",
                        )}
                    >
                        {localised(block.caption, lang)}
                    </figcaption>
                )}
            </figure>
        );
    }

    if (block.type === "video") {
        const videoUrl = localised(block.value, lang) || Object.values(block.value)[0];
        return (
            <div className="my-4 rounded-xl overflow-hidden">
                <video
                    src={videoUrl}
                    poster={block.videoThumbnail || undefined}
                    controls
                    className="w-full"
                />
            </div>
        );
    }

    return null;
};

// ── Related Card ──────────────────────────────────────────────────────

const RelatedCard: React.FC<{
    article: NewsArticle;
    isDark: boolean;
    lang: string;
    linkPrefix: string;
}> = ({ article, isDark, lang, linkPrefix }) => (
    <Link to={`${linkPrefix}/${article.id}`} className="block group">
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
                <span className={cn(
                    "text-[10px]",
                    isDark ? "text-gray-500" : "text-gray-400",
                )}>
                    {timeAgo(article.date)}
                </span>
            </div>
        </div>
    </Link>
);

// ── Main Detail Page ──────────────────────────────────────────────────

const NewsDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isDark = useAppSelector((state: any) => state.theme.isDark);
    const { i18n } = useTranslation();
    const lang = i18n.language;
    const { article, loading, error } = useNewsArticle(id);

    // Fetch related articles for cross-content sidebar
    const { articles: relatedArticles, loading: relatedLoading } = useArticlesList(6);

    // ── Loading ──
    if (loading) {
        return (
            <div
                className={cn(
                    "h-full w-full flex flex-col items-center justify-center gap-3",
                    isDark ? "bg-[#000]" : "bg-gray-50",
                )}
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
                    Loading article…
                </span>
            </div>
        );
    }

    // ── Error / Not found ──
    if (error || !article) {
        return (
            <div
                className={cn(
                    "h-full w-full flex flex-col items-center justify-center gap-4",
                    isDark ? "bg-[#000] text-white" : "bg-gray-50 text-gray-900",
                )}
            >
                <h2 className="text-2xl font-bold">
                    {error ?? "Article not found"}
                </h2>
                <button
                    onClick={() => navigate("/news")}
                    className="text-red-500 hover:text-red-400 font-medium flex items-center gap-2"
                >
                    <ArrowLeft size={16} /> Back to News
                </button>
            </div>
        );
    }

    const headline = localised(article.headline, lang);

    // Separate first description block for the excerpt pull-quote
    const firstDesc = article.content.find((c) => c.type === "description");
    const restContent = firstDesc
        ? article.content.filter((c) => c !== firstDesc)
        : article.content;

    return (
        <div
            className={cn(
                "h-full w-full overflow-y-auto",
                isDark ? "bg-[#000]" : "bg-gray-50",
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <motion.article
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="flex-1 max-w-3xl space-y-6"
                    >
                        {/* ── Back button ── */}
                        <button
                            onClick={() => navigate("/news")}
                            className={cn(
                                "flex items-center gap-2 text-sm font-medium transition-colors rounded-lg px-3 py-2 -ml-3",
                                isDark
                                    ? "text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                            )}
                        >
                            <ArrowLeft size={16} />
                            Back to News
                        </button>

                        {/* ── Category Badge ── */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <span
                                className={cn(
                                    "flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full",
                                    isDark
                                        ? "bg-emerald-500/15 text-emerald-400"
                                        : "bg-emerald-50 text-emerald-700",
                                )}
                            >
                                <Newspaper size={11} />
                                News
                            </span>
                            <span
                                className={cn(
                                    "text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full",
                                    isDark
                                        ? "bg-white/10 text-white"
                                        : "bg-gray-900/10 text-gray-900",
                                )}
                            >
                                {article.topic}
                            </span>
                            {article.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className={cn(
                                        "text-[11px] px-2 py-0.5 rounded-full",
                                        isDark
                                            ? "bg-[#1a1a1a] text-gray-400"
                                            : "bg-gray-100 text-gray-600",
                                    )}
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        {/* ── Title ── */}
                        <motion.h1
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className={cn(
                                "text-3xl sm:text-4xl font-bold leading-tight tracking-tight",
                                isDark ? "text-white" : "text-gray-900",
                            )}
                        >
                            {headline}
                        </motion.h1>

                        {/* ── Meta ── */}
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                            {article.newsSource && (
                                <>
                                    {article.newsSource.image && (
                                        <img
                                            src={article.newsSource.image}
                                            alt=""
                                            className="w-5 h-5 rounded-full object-cover"
                                        />
                                    )}
                                    <span
                                        className={cn(
                                            "font-semibold",
                                            isDark ? "text-gray-300" : "text-gray-700",
                                        )}
                                    >
                                        {localised(article.newsSource.company, lang) ||
                                            article.newsSource.companyName}
                                    </span>
                                    <span className={isDark ? "text-gray-600" : "text-gray-400"}>
                                        ·
                                    </span>
                                </>
                            )}
                            <span className={isDark ? "text-gray-500" : "text-gray-500"}>
                                {timeAgo(article.date)}
                            </span>
                            <span className={isDark ? "text-gray-600" : "text-gray-400"}>·</span>
                            <span
                                className={cn(
                                    "flex items-center gap-1",
                                    isDark ? "text-gray-500" : "text-gray-500",
                                )}
                            >
                                <Clock size={13} />
                                {readTime(article.content, lang)}
                            </span>
                            <button
                                className={cn(
                                    "ml-auto flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors",
                                    isDark
                                        ? "bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                                )}
                            >
                                <Share2 size={12} />
                                Share
                            </button>
                        </div>

                        {/* ── Hero Image ── */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                            className="rounded-2xl overflow-hidden"
                        >
                            <img
                                src={article.coverImage}
                                alt={headline}
                                className="w-full aspect-[16/9] object-cover"
                            />
                        </motion.div>

                        {/* ── Excerpt (first description block) ── */}
                        {firstDesc && (
                            <p
                                className={cn(
                                    "text-lg leading-relaxed font-medium border-l-4 pl-4",
                                    isDark
                                        ? "text-gray-300 border-white/40"
                                        : "text-gray-700 border-gray-900/30",
                                )}
                            >
                                {localised(firstDesc.value, lang)}
                            </p>
                        )}

                        {/* ── Ad: Top of article (below excerpt) ── */}
                        <AdUnit
                            slot={AD_SLOTS.NEWS_DETAIL_TOP}
                            format="auto"
                            responsive
                            isDark={isDark}
                            testId="ad-news-detail-top"
                        />

                        {/* ── Remaining Content Blocks ── */}
                        <div className="space-y-5 pb-12">
                            {restContent.map((block, i) => (
                                <React.Fragment key={i}>
                                    <ContentBlock
                                        block={block}
                                        isDark={isDark}
                                        lang={lang}
                                    />
                                    {/* Insert in-article ad every N content blocks */}
                                    {(i + 1) % IN_ARTICLE_AD_INTERVAL === 0 && i < restContent.length - 1 && (
                                        <AdUnit
                                            slot={AD_SLOTS.NEWS_DETAIL_IN_ARTICLE}
                                            format="fluid"
                                            layout="in-article"
                                            isDark={isDark}
                                            testId={`ad-news-in-article-${i}`}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </motion.article>

                    {/* Sidebar - Related Articles */}
                    <aside className="lg:w-72 xl:w-80 flex-shrink-0 space-y-4">
                        <div className={cn(
                            "rounded-2xl overflow-hidden sticky top-6",
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
                                    Related Articles
                                </h3>
                                <Link
                                    to="/news"
                                    className={cn(
                                        "text-xs font-medium transition-colors",
                                        isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900",
                                    )}
                                >
                                    See all →
                                </Link>
                            </div>
                            {relatedLoading ? (
                                <div className="p-4 space-y-3">
                                    {[0, 1, 2, 3].map((i) => (
                                        <div key={i} className="flex gap-3 animate-pulse">
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
                                    ))}
                                </div>
                            ) : (
                                <div className="p-1">
                                    {relatedArticles.slice(0, 5).map((a) => (
                                        <RelatedCard
                                            key={a.id}
                                            article={a}
                                            isDark={isDark}
                                            lang={lang}
                                            linkPrefix="/articles"
                                        />
                                    ))}
                                    {relatedArticles.length === 0 && (
                                        <p className={cn(
                                            "text-xs p-4",
                                            isDark ? "text-gray-500" : "text-gray-400",
                                        )}>
                                            No articles available yet.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ── Ad: Sidebar ── */}
                        <AdUnit
                            slot={AD_SLOTS.NEWS_DETAIL_SIDEBAR}
                            format="auto"
                            responsive
                            isDark={isDark}
                            testId="ad-news-detail-sidebar"
                        />
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default NewsDetailPage;
