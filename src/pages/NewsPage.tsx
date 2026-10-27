import React, { useEffect, useMemo, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../lib/utils";
import { useNewsFeed } from "../features/news/hooks/useNews";
import Seo from "../Components/seo/Seo";
import { resolveHeadline, type PublicNewsArticle } from "../features/news/models/publicNewsArticle";
import NewsCountryPicker from "../features/news/components/NewsCountryPicker";
import NewsLanguagePicker from "../features/news/components/NewsLanguagePicker";
import { articleLanguages, pickLanguage, sortLanguages, useNewsLanguage } from "../features/news/utils/newsLanguage";
import {
    NEWS_COUNTRY_BY_KEY,
    newsPath,
    getStoredNewsCountry,
    storeNewsCountry,
    TOPIC_MIN_ARTICLES,
} from "../features/news/utils/newsCountries";
import { detectVisitorNewsCountry, toNewsApiCountryKey } from "../features/news/utils/countryHelper";

/*
 * News front page, laid out like a newspaper site (Dawn): lead story with
 * secondary stories, section links, a story list with "Most read", and
 * numbered pages. Country, section and page live in the URL
 * (/news?country=Pakistan&topic=tech&page=2) so every page can be shared.
 */

const PAGE_SIZE = 20;
const LEAD_COUNT = 4; // lead + 3 secondary stories on page 1

// ── Helpers ───────────────────────────────────────────────────────────

const articleHref = (a: PublicNewsArticle, lang: string) =>
    `${newsPath(a.id, a.collection)}?lang=${encodeURIComponent(lang)}`;

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function timeAgo(iso: string, lang: string): string {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return "";
    // Some stories are stamped slightly ahead of now; show those as "now".
    const diff = Math.min(0, (then - Date.now()) / 1000);
    const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
    const abs = Math.abs(diff);
    if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
    if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
    if (abs < 86400 * 7) return rtf.format(Math.round(diff / 86400), "day");
    return new Date(iso).toLocaleDateString(lang, { day: "numeric", month: "short", year: "numeric" });
}

/** 1 … 4 5 [6] 7 8 … 12 */
function pageNumbers(current: number, total: number): Array<number | "gap"> {
    const pages = new Set([1, total, current - 1, current, current + 1]);
    if (current <= 3) [2, 3, 4].forEach((p) => pages.add(p));
    if (current >= total - 2) [total - 1, total - 2, total - 3].forEach((p) => pages.add(p));
    const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
    const out: Array<number | "gap"> = [];
    sorted.forEach((p, i) => {
        if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
        out.push(p);
    });
    return out;
}

// ── Pieces ────────────────────────────────────────────────────────────

const Meta: React.FC<{ article: PublicNewsArticle; lang: string; className?: string }> = ({ article, lang, className }) => (
    <p className={cn("flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider", className)}>
        <span className="text-(--integri-accent-600)">{article.topic}</span>
        <span aria-hidden className="opacity-40">·</span>
        <time dateTime={article.date} className="text-zinc-500 dark:text-zinc-400">{timeAgo(article.date, lang)}</time>
    </p>
);

const Thumb: React.FC<{ article: PublicNewsArticle; lang: string; className?: string; eager?: boolean }> = ({
    article,
    lang,
    className,
    eager,
}) => (
    <div className={cn("overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-900", className)}>
        {article.coverImage && (
            <img
                src={article.coverImage}
                alt={resolveHeadline(article.headline, lang)}
                loading={eager ? "eager" : "lazy"}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
        )}
    </div>
);

const LeadStory: React.FC<{ article: PublicNewsArticle; lang: string }> = ({ article, lang }) => (
    <Link to={articleHref(article, lang)} state={{ collection: article.collection }} className="group block">
        <Thumb article={article} lang={lang} eager className="aspect-[16/9]" />
        <Meta article={article} lang={lang} className="mt-4" />
        <h2 dir="auto" className="mt-2 text-2xl font-bold leading-tight tracking-tight text-zinc-900 group-hover:underline decoration-2 underline-offset-4 dark:text-white sm:text-[32px]">
            {resolveHeadline(article.headline, lang)}
        </h2>
    </Link>
);

const SecondaryStory: React.FC<{ article: PublicNewsArticle; lang: string }> = ({ article, lang }) => (
    <Link to={articleHref(article, lang)} state={{ collection: article.collection }} className="group flex gap-4 py-4 first:pt-0">
        <div className="min-w-0 flex-1">
            <Meta article={article} lang={lang} />
            <h3 dir="auto" className="mt-1.5 text-base font-semibold leading-snug text-zinc-900 group-hover:underline underline-offset-2 dark:text-zinc-100">
                {resolveHeadline(article.headline, lang)}
            </h3>
        </div>
        <Thumb article={article} lang={lang} className="aspect-[4/3] w-28 shrink-0" />
    </Link>
);

const StoryRow: React.FC<{ article: PublicNewsArticle; lang: string }> = ({ article, lang }) => (
    <li>
        <Link to={articleHref(article, lang)} state={{ collection: article.collection }} className="group flex gap-4 py-5 sm:gap-5">
            <Thumb article={article} lang={lang} className="aspect-[16/10] w-32 shrink-0 sm:w-48" />
            <div className="min-w-0 flex-1">
                <Meta article={article} lang={lang} />
                <h3 dir="auto" className="mt-1.5 text-base font-semibold leading-snug text-zinc-900 group-hover:underline underline-offset-2 dark:text-zinc-100 sm:text-lg">
                    {resolveHeadline(article.headline, lang)}
                </h3>
            </div>
        </Link>
    </li>
);

const MostRead: React.FC<{ articles: PublicNewsArticle[]; lang: string }> = ({ articles, lang }) => (
    <section aria-labelledby="most-read">
        <h2 id="most-read" className="border-b-2 border-zinc-900 pb-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-900 dark:border-zinc-100 dark:text-zinc-100">
            Most read
        </h2>
        <ol className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {articles.map((a, i) => (
                <li key={a.id}>
                    <Link to={articleHref(a, lang)} state={{ collection: a.collection }} className="group flex gap-3 py-3.5">
                        <span className="w-6 shrink-0 text-2xl font-bold leading-none text-zinc-300 dark:text-zinc-700">{i + 1}</span>
                        <span dir="auto" className="text-sm font-medium leading-snug text-zinc-800 group-hover:underline underline-offset-2 dark:text-zinc-200">
                            {resolveHeadline(a.headline, lang)}
                        </span>
                    </Link>
                </li>
            ))}
        </ol>
    </section>
);

const Pagination: React.FC<{ page: number; total: number; hrefFor: (p: number) => string }> = ({ page, total, hrefFor }) => {
    if (total <= 1) return null;
    const base =
        "flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--integri-accent-600)";
    const idle = "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/[0.06]";
    const disabled = "pointer-events-none text-zinc-300 dark:text-zinc-700";
    return (
        <nav aria-label="News pages" className="flex flex-col items-center gap-3 pt-8">
            <div className="flex flex-wrap items-center justify-center gap-1">
                <Link
                    to={hrefFor(Math.max(1, page - 1))}
                    aria-disabled={page === 1}
                    tabIndex={page === 1 ? -1 : undefined}
                    className={cn(base, "gap-1", page === 1 ? disabled : idle)}
                >
                    <ChevronLeft size={16} aria-hidden /> Previous
                </Link>
                {pageNumbers(page, total).map((p, i) =>
                    p === "gap" ? (
                        <span key={`gap-${i}`} className="px-1 text-zinc-400">…</span>
                    ) : (
                        <Link
                            key={p}
                            to={hrefFor(p)}
                            aria-current={p === page ? "page" : undefined}
                            className={cn(
                                base,
                                p === page
                                    ? "bg-zinc-900 text-white dark:bg-[#F2F4F7] dark:text-[#07060A]"
                                    : idle
                            )}
                        >
                            {p}
                        </Link>
                    )
                )}
                <Link
                    to={hrefFor(Math.min(total, page + 1))}
                    aria-disabled={page === total}
                    tabIndex={page === total ? -1 : undefined}
                    className={cn(base, "gap-1", page === total ? disabled : idle)}
                >
                    Next <ChevronRight size={16} aria-hidden />
                </Link>
            </div>
            <p className="text-xs text-zinc-500">
                Page {page} of {total}
            </p>
        </nav>
    );
};

const Skeleton: React.FC = () => (
    <div className="animate-pulse space-y-8" aria-hidden>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="space-y-4">
                <div className="aspect-[16/9] rounded-lg bg-zinc-200 dark:bg-zinc-900" />
                <div className="h-7 w-3/4 rounded bg-zinc-200 dark:bg-zinc-900" />
            </div>
            <div className="space-y-6">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="flex gap-4">
                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-900" />
                            <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-900" />
                        </div>
                        <div className="aspect-[4/3] w-28 rounded-lg bg-zinc-200 dark:bg-zinc-900" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// ── Page ──────────────────────────────────────────────────────────────

const NewsPage: React.FC = () => {
    const user = useAppSelector((state) => state.auth.user);
    const isDark = useAppSelector((state) => state.theme.isDark);
    const { i18n } = useTranslation();
    const uiLang = i18n.language;
    const [params, setParams] = useSearchParams();
    const { preferred: preferredLangs, setLanguage } = useNewsLanguage();
    const rootRef = useRef<HTMLDivElement>(null);

    // Country: URL, then the visitor's saved pick, then profile, then a guess.
    const urlCountry = params.get("country");
    const country =
        (urlCountry && NEWS_COUNTRY_BY_KEY[urlCountry] ? urlCountry : null) ??
        getStoredNewsCountry() ??
        (user?.country ? toNewsApiCountryKey(user.country) : detectVisitorNewsCountry() ?? "Germany");
    const topic = params.get("topic");

    const { articles, loading, error } = useNewsFeed(country);

    // Languages this country's stories are published in, A–Z by English name.
    const feedLanguages = useMemo(() => {
        const codes = new Set<string>();
        articles.forEach((a) => articleLanguages(a).forEach((l) => codes.add(l)));
        return sortLanguages([...codes]);
    }, [articles]);
    const lang = pickLanguage(feedLanguages, ...preferredLangs);

    const topics = useMemo(() => [...new Set(articles.map((a) => a.topic).filter(Boolean))].sort(), [articles]);
    const filtered = useMemo(() => (topic ? articles.filter((a) => a.topic === topic) : articles), [articles, topic]);
    const mostRead = useMemo(() => {
        const viewed = articles.filter((a) => a.views > 0);
        return viewed.length >= 3 ? [...viewed].sort((a, b) => b.views - a.views).slice(0, 5) : [];
    }, [articles]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const requested = parseInt(params.get("page") ?? "1", 10);
    const page = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), totalPages) : 1;
    const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const lead = page === 1 ? pageItems.slice(0, LEAD_COUNT) : [];
    const rows = page === 1 ? pageItems.slice(LEAD_COUNT) : pageItems;

    // Build a URL keeping the other params; page 1 / no topic stay out of the URL.
    const hrefWith = (changes: Record<string, string | null>) => {
        const next = new URLSearchParams(params);
        Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
        if (next.get("page") === "1") next.delete("page");
        const qs = next.toString();
        return qs ? `/news?${qs}` : "/news";
    };

    const pickCountry = (key: string) => {
        storeNewsCountry(key);
        const next = new URLSearchParams(params);
        next.set("country", key);
        next.delete("page");
        next.delete("topic");
        setParams(next);
    };

    // New page / section / country → back to the top of the scroll area.
    useEffect(() => {
        rootRef.current?.scrollTo({ top: 0 });
    }, [page, topic, country]);

    const today = new Date().toLocaleDateString(uiLang, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const countryName = NEWS_COUNTRY_BY_KEY[country]?.name ?? country;

    const sectionLink = (value: string | null, label: string) => {
        const active = (topic ?? null) === value;
        return (
            <Link
                key={label}
                to={hrefWith({ topic: value, page: null })}
                aria-current={active ? "page" : undefined}
                className={cn(
                    "relative whitespace-nowrap py-3 text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
                    active
                        ? "text-zinc-900 dark:text-white after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-(--integri-accent-600)"
                        : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                )}
            >
                {label}
            </Link>
        );
    };

    // A country edition or topic section is its own page once it holds enough
    // stories; until then it stays out of the index (thin tag pages).
    const sectionSeo = urlCountry && !loading && (
        <Seo
            title={`${topic ? `${titleCase(topic)} news` : "News"} in ${countryName} | Integri News`}
            description={`The latest ${topic ? `${topic} ` : ""}stories from ${countryName}, updated daily on Integri News.`}
            canonicalPath={hrefWith({})}
            noindex={filtered.length < TOPIC_MIN_ARTICLES}
        />
    );

    return (
        <div ref={rootRef} id="news-page-root" className="h-full w-full overflow-y-auto bg-white dark:bg-[#07060A]">
            {sectionSeo}
            <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
                {/* Masthead */}
                <header className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">News</h1>
                        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                            {today} · {countryName} edition
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <NewsLanguagePicker languages={feedLanguages} value={lang} onChange={setLanguage} isDark={isDark} align="right" />
                        <NewsCountryPicker value={country} onChange={pickCountry} isDark={isDark} />
                    </div>
                </header>

                {/* Sections */}
                <nav aria-label="Sections" className="mt-6 flex gap-6 overflow-x-auto border-y border-zinc-200 dark:border-zinc-800">
                    {sectionLink(null, "Latest")}
                    {topics.map((t) => sectionLink(t, titleCase(t)))}
                </nav>

                <div className="mt-8">
                    {loading && <Skeleton />}

                    {!loading && error && (
                        <p className="py-24 text-center text-sm font-medium text-red-500">{error}</p>
                    )}

                    {!loading && !error && filtered.length === 0 && (
                        <p className="py-24 text-center text-sm text-zinc-500">
                            No news for {countryName} in the last 30 days. Try another country.
                        </p>
                    )}

                    {!loading && !error && filtered.length > 0 && (
                        <>
                            {/* Lead + secondary stories (page 1) */}
                            {lead.length > 0 && (
                                <section className="grid gap-8 border-b border-zinc-200 pb-8 dark:border-zinc-800 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                                    <LeadStory article={lead[0]} lang={lang} />
                                    {lead.length > 1 && (
                                        <div className="divide-y divide-zinc-200 dark:divide-zinc-800 lg:border-l lg:border-zinc-200 lg:pl-8 dark:lg:border-zinc-800">
                                            {lead.slice(1).map((a) => (
                                                <SecondaryStory key={a.id} article={a} lang={lang} />
                                            ))}
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* Story list + most read */}
                            <div className={cn("grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]", lead.length > 0 && "mt-8")}>
                                <div>
                                    {rows.length > 0 && (
                                        <>
                                            <h2 className="border-b-2 border-zinc-900 pb-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-900 dark:border-zinc-100 dark:text-zinc-100">
                                                {topic ? titleCase(topic) : "Latest stories"}
                                            </h2>
                                            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                                {rows.map((a) => (
                                                    <StoryRow key={a.id} article={a} lang={lang} />
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                    <Pagination page={page} total={totalPages} hrefFor={(p) => hrefWith({ page: String(p) })} />
                                </div>

                                {mostRead.length > 0 && (
                                    <aside className="lg:sticky lg:top-6 lg:self-start">
                                        <MostRead articles={mostRead} lang={lang} />
                                    </aside>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewsPage;
