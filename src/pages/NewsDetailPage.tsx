import React, { useState } from "react";
import { useParams, useNavigate, Link, useLocation, useSearchParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Share2, Loader2, Newspaper } from "lucide-react";
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../lib/utils";
import { useNewsArticle, useArticlesList, useNewsFeed } from "../features/news/hooks/useNews";
import {
    type NewsArticleDetail,
    type PublicNewsArticle,
    localised,
} from "../features/news/models/publicNewsArticle";
import ShareModal from "../Components/ui/ShareModal";
import { NEWS_COUNTRY_BY_COLLECTION, TOPIC_MIN_ARTICLES, countryBySlug, newsPath } from "../features/news/utils/newsCountries";
import { getCanonicalUrl } from "../config/seo";
import NewsLanguagePicker from "../features/news/components/NewsLanguagePicker";
import { articleLanguages, isRtl, pickLanguage, sortLanguages, useNewsLanguage } from "../features/news/utils/newsLanguage";
import Seo, { toMetaDescription } from "../Components/seo/Seo";

// ── Helpers ───────────────────────────────────────────────────────────



function readTime(
    content: NewsArticleDetail["content"],
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
    block: NewsArticleDetail["content"][0];
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

/** Country stories go to their /news/<country>/<id> page; legacy Articles keep /articles/<id>. */
/** Same check as functions/src/seo.ts: ISO 639 language, optional region, never "-UK". */
const HREFLANG_RE = /^[a-z]{2,3}(-(?!UK$)[A-Z]{2}|-[A-Z][a-z]{3})?$/;

const OG_REGIONS: Record<string, string> = {
    en: "US", de: "DE", fr: "FR", es: "ES", it: "IT", pt: "PT", nl: "NL", ar: "SA",
    ur: "PK", ja: "JP", ko: "KR", zh: "CN", ru: "RU", tr: "TR", pl: "PL", sv: "SE",
};

function ogLocale(lang: string): string {
    const [language, region] = lang.split("-");
    const r = region ?? OG_REGIONS[language];
    return r ? `${language}_${r.toUpperCase()}` : language;
}

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1); // as on the news page

/**
 * Links for the "Related topics" block: the story's topic section and its
 * country edition, each only when that page is a real, filled section.
 */
function topicLinks(
    topic: string | undefined,
    edition: { key: string; name: string } | undefined,
    feed: PublicNewsArticle[],
): Array<{ label: string; href: string }> {
    if (!edition || feed.length < TOPIC_MIN_ARTICLES) return [];
    // Same encoding as the news page's own section links (URLSearchParams).
    const href = (q: Record<string, string>) => `/news?${new URLSearchParams(q)}`;
    const links = [{ label: `${edition.name} news`, href: href({ country: edition.key }) }];
    if (topic && feed.filter((a) => a.topic === topic).length >= TOPIC_MIN_ARTICLES) {
        links.unshift({ label: `${titleCase(topic)} in ${edition.name}`, href: href({ country: edition.key, topic }) });
    }
    return links;
}

function relatedHref(article: PublicNewsArticle, linkPrefix: string, lang: string): string {
    const q = `lang=${encodeURIComponent(lang)}`;
    if (linkPrefix === "/articles" && !NEWS_COUNTRY_BY_COLLECTION[article.collection]) {
        return `/articles/${article.id}?collection=${encodeURIComponent(article.collection || "Articles")}&${q}`;
    }
    return `${newsPath(article.id, article.collection)}?${q}`;
}

const RelatedCard: React.FC<{
    article: PublicNewsArticle;
    isDark: boolean;
    lang: string;
    linkPrefix: string;
}> = ({ article, isDark, lang, linkPrefix }) => (
    <Link
        to={relatedHref(article, linkPrefix, lang)}
        state={{ collection: article.collection }}
        className="block group"
    >
        <div className={cn(
            "flex gap-3 p-3 rounded-xl transition-all duration-200",
            isDark ? "hover:bg-[#18161C]" : "hover:bg-gray-50",
        )}>
            <img
                src={article.coverImage}
                alt={localised(article.headline, lang)}
                loading="lazy"
                className="w-20 h-14 rounded-lg object-cover shrink-0"
            />
            <div className="flex flex-col justify-center gap-1 min-w-0">
                <h4 dir="auto" className={cn(
                    "text-xs font-semibold leading-snug line-clamp-2 group-hover:underline",
                    isDark ? "text-gray-200" : "text-gray-900",
                )}>
                    {localised(article.headline, lang)}
                </h4>
            </div>
        </div>
    </Link>
);

// ── Main Detail Page ──────────────────────────────────────────────────

const NewsDetailPage: React.FC = () => {
    const { id, country } = useParams<{ id: string; country?: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const isDark = useAppSelector((state: any) => state.theme.isDark);
    const { preferred: preferredLangs, setLanguage } = useNewsLanguage();
    
    // /news/<country>/<id> names the collection; older links carry ?collection=.
    const countryCollection = countryBySlug(country)?.collection;
    const legacyCollection = searchParams.get("collection") || location.state?.collection;
    const collection = countryCollection || legacyCollection || "News";
    // Old /news/<id>?collection=NewsGermany links move to /news/germany/<id>.
    const redirectTo =
        !country && id && legacyCollection && newsPath(id, legacyCollection) !== `/news/${id}`
            ? newsPath(id, legacyCollection)
            : null;
    const { article, loading, error } = useNewsArticle(id, collection);

    // Fetch related articles for cross-content sidebar
    const { articles: relatedArticles, loading: relatedLoading } = useArticlesList(7, article?.country ?? null);

    // The edition's 30-day feed: tells which topic sections are real pages.
    const edition = NEWS_COUNTRY_BY_COLLECTION[collection];
    const { articles: editionArticles } = useNewsFeed(edition?.key ?? "");

    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    if (redirectTo) {
        const lang = searchParams.get("lang");
        return <Navigate to={lang ? `${redirectTo}?lang=${encodeURIComponent(lang)}` : redirectTo} replace />;
    }

    // ── Loading ──
    if (loading) {
        return (
            <div
                className={cn(
                    "h-full w-full flex flex-col items-center justify-center gap-3",
                    isDark ? "bg-black" : "bg-gray-50",
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
        // Deleted story (API 404): keep it out of the index. A network error
        // must not, or a hiccup would de-index a live story.
        const notFound = !error || /not found/i.test(error);
        return (
            <div
                className={cn(
                    "h-full w-full flex flex-col items-center justify-center gap-4",
                    isDark ? "bg-black text-white" : "bg-gray-50 text-gray-900",
                )}
            >
                {notFound && <Seo title="Article not found | Integri News" description="This article is no longer available." noindex />}
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

    // Show the story in the reader's language when it has that translation.
    const languages = sortLanguages(articleLanguages(article));
    const lang = pickLanguage(languages, ...preferredLangs);
    const headline = localised(article.headline, lang);
    const field = (v: Record<string, string> | string | undefined) =>
        typeof v === "string" ? v : localised(v, lang);

    // One URL per language, matching the ssrPreview function: the default
    // language (English, else the first code) at the bare path, the others
    // at ?lang=. Each is its own canonical and lists all the others.
    const path = newsPath(id!, collection);
    const codes = languages.filter((c) => HREFLANG_RE.test(c)).sort();
    const defaultLang = codes.includes("en") ? "en" : codes[0] ?? "en";
    const versionUrl = (code: string) =>
        getCanonicalUrl(code === defaultLang ? path : `${path}?lang=${encodeURIComponent(code)}`);
    const canonicalUrl = codes.includes(lang) ? versionUrl(lang) : getCanonicalUrl(path);
    const alternates = codes.length > 1
        ? [...codes.map((c) => ({ hreflang: c, href: versionUrl(c) })), { hreflang: "x-default", href: versionUrl(defaultLang) }]
        : undefined;

    const published = article.date;
    const modified = article.updatedAt ?? article.compiledAt;
    const relatedTopics = topicLinks(article.topic, edition, editionArticles);

    const content = article.content || [];
    // Separate first description block for the excerpt pull-quote
    const firstDesc = content.find((c) => c.type === "description");
    const restContent = firstDesc
        ? content.filter((c) => c !== firstDesc)
        : content;
    const tags = article.tags || [];
    // Same title and description the ssrPreview function serves.
    const summary =
        field(article.meta_description) ||
        toMetaDescription((firstDesc && localised(firstDesc.value, lang)) || headline);
    const seoTitle = field(article.seo_title) || headline;

    return (
        <div
            className={cn(
                "h-full w-full overflow-y-auto",
                isDark ? "bg-black" : "bg-gray-50",
            )}
        >
            <Seo
                title={`${seoTitle} | Integri News`}
                description={summary}
                canonicalUrl={canonicalUrl}
                alternates={alternates}
                locale={ogLocale(lang)}
                type="article"
                image={article.coverImage || undefined}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <motion.article
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        lang={lang}
                        dir={isRtl(lang) ? "rtl" : "ltr"}
                        className="flex-1 max-w-3xl space-y-6"
                    >
                        {/* ── Back button ── */}
                        <button
                            onClick={() => navigate("/news")}
                            className={cn(
                                "flex items-center gap-2 text-sm font-medium transition-colors rounded-lg px-3 py-2 -ml-3 cursor-pointer",
                                isDark
                                    ? "text-gray-400 hover:text-white hover:bg-[#18161C]"
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
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className={cn(
                                        "text-[11px] px-2 py-0.5 rounded-full",
                                        isDark
                                            ? "bg-[#18161C] text-gray-400"
                                            : "bg-gray-100 text-gray-600",
                                    )}
                                >
                                    #{tag}
                                </span>
                            ))}
                            <div className="ms-auto">
                                <NewsLanguagePicker
                                    languages={languages}
                                    value={lang}
                                    onChange={setLanguage}
                                    isDark={isDark}
                                    align={isRtl(lang) ? "left" : "right"}
                                />
                            </div>
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
                            <span
                                className={cn(
                                    "flex items-center gap-1",
                                    isDark ? "text-gray-500" : "text-gray-500",
                                )}
                            >
                                <Clock size={13} />
                                {readTime(content, lang)}
                            </span>
                            {published && (
                                <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                                    Published <time dateTime={published}>{published.slice(0, 10)}</time>
                                    {modified && modified.slice(0, 10) !== published.slice(0, 10) && (
                                        <> · Updated <time dateTime={modified}>{modified.slice(0, 10)}</time></>
                                    )}
                                </span>
                            )}
                            <button
                                onClick={() => setIsShareModalOpen(true)}
                                className={cn(
                                    "ml-auto flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors cursor-pointer",
                                    isDark
                                        ? "bg-[#18161C] text-gray-300 hover:bg-[#252525]"
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
                                className="w-full aspect-video object-cover"
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
                                <React.Fragment key={i}>
                                    <ContentBlock
                                        block={block}
                                        isDark={isDark}
                                        lang={lang}
                                    />
                                </React.Fragment>
                            ))}
                        </div>

                        {/* ── Related topics: real section pages only ── */}
                        {relatedTopics.length > 0 && (
                            <nav aria-labelledby="related-topics" className="pb-12">
                                <h2
                                    id="related-topics"
                                    className={cn("text-base font-bold mb-3", isDark ? "text-white" : "text-gray-900")}
                                >
                                    Related topics
                                </h2>
                                <ul className="flex flex-wrap gap-2">
                                    {relatedTopics.map((t) => (
                                        <li key={t.href}>
                                            <Link
                                                to={t.href}
                                                className={cn(
                                                    "inline-block text-sm px-3 py-1.5 rounded-full transition-colors",
                                                    isDark
                                                        ? "bg-[#18161C] text-gray-200 hover:bg-[#252525]"
                                                        : "bg-gray-100 text-gray-800 hover:bg-gray-200",
                                                )}
                                            >
                                                {t.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        )}
                    </motion.article>

                    {/* Sidebar - Related Articles */}
                    <aside className="lg:w-72 xl:w-80 shrink-0 space-y-4">
                        <div className={cn(
                            "rounded-2xl overflow-hidden sticky top-6",
                            isDark ? "bg-[#07060A] border border-white/5" : "bg-white shadow-sm",
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
                                                "w-20 h-14 rounded-lg shrink-0",
                                                isDark ? "bg-[#18161C]" : "bg-gray-200",
                                            )} />
                                            <div className="flex flex-col justify-center gap-2 flex-1">
                                                <div className={cn(
                                                    "h-3 w-full rounded",
                                                    isDark ? "bg-[#18161C]" : "bg-gray-200",
                                                )} />
                                                <div className={cn(
                                                    "h-2.5 w-16 rounded",
                                                    isDark ? "bg-[#18161C]" : "bg-gray-200",
                                                )} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-1">
                                    {relatedArticles.filter((a) => a.id !== id).slice(0, 5).map((a) => (
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

                    </aside>
                </div>
            </div>

            <ShareModal 
                isOpen={isShareModalOpen} 
                onClose={() => setIsShareModalOpen(false)} 
                isDark={isDark}
                shareData={{ title: headline }}
            />
        </div>
    );
};

export default NewsDetailPage;
