import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Share2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../lib/utils";
import { useNewsArticle } from "../features/news/hooks/useNews";
import { localised } from "../features/news/models/newsArticle";
import type { NewContent } from "../features/news/models/newsArticle";

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
    return date.toLocaleDateString();
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

// ── Main Detail Page ──────────────────────────────────────────────────

const NewsDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isDark = useAppSelector((state: any) => state.theme.isDark);
    const { i18n } = useTranslation();
    const lang = i18n.language;
    const { article, loading, error } = useNewsArticle(id);

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
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6"
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
                <div className="flex items-center gap-3">
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

                {/* ── Remaining Content Blocks ── */}
                <div className="space-y-5 pb-12">
                    {restContent.map((block, i) => (
                        <ContentBlock
                            key={i}
                            block={block}
                            isDark={isDark}
                            lang={lang}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default NewsDetailPage;
