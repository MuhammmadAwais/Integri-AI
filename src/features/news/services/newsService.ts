import {
    collection,
    getDocs,
    doc,
    getDoc,
    query,
    orderBy,
    limit,
    startAfter,
    Timestamp,
    QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../../../app/firebase";
import type {
    NewsArticle,
    NewContent,
    NewsSource,
    GrammarPointModel,
    Keywords,
} from "../models/newsArticle";

const NEWS_COLLECTION = "News";
const ARTICLES_COLLECTION = "Articles";

// ── Map a single Firestore document → NewsArticle ───────────────────
function mapDoc(docSnap: any): NewsArticle {
    const d = docSnap.data();

    return {
        id: docSnap.id,
        coverImage: d.coverImage ?? "",
        video: d.video ?? "",
        thumbnailOfVideo: d.thumbnailOfVideo ?? "",
        headline: (d.headline as Record<string, string>) ?? {},
        date:
            d.date instanceof Timestamp
                ? d.date.toDate()
                : new Date(d.date ?? Date.now()),
        topic: d.topic ?? "",
        tags: Array.isArray(d.tags) ? d.tags : [],
        content: Array.isArray(d.content)
            ? d.content.map(
                (c: any): NewContent => ({
                    type: c.type ?? "description",
                    value: c.value ?? {},
                    videoThumbnail: c.videoThumbnail ?? "",
                    caption: c.caption ?? undefined,
                }),
            )
            : [],
        markAsTrending: d.markAsTrending ?? false,
        addToGeneralTopic: d.addToGeneralTopic ?? true,
        newsSource: d.newsSource ? mapNewsSource(d.newsSource) : undefined,
        userWhoPaidForTranslation: Array.isArray(d.userWhoPaidForTranslation)
            ? d.userWhoPaidForTranslation.map(String)
            : [],
        forCountries: Array.isArray(d.forCountries) ? d.forCountries : [],
        grammar: Array.isArray(d.grammar)
            ? d.grammar.map(
                (g: any): GrammarPointModel => ({
                    title: g.title ?? {},
                    description: g.description ?? {},
                    example: g.example ?? {},
                    rules: g.rules
                        ? Object.fromEntries(
                            Object.entries(g.rules).map(([k, v]) => [
                                k,
                                Array.isArray(v) ? v : [],
                            ]),
                        )
                        : {},
                }),
            )
            : [],
        keywords: Array.isArray(d.keywords)
            ? d.keywords.map(
                (k: any): Keywords => ({
                    title: k.title ?? {},
                    nouns: k.nouns ?? {},
                    description: k.description ?? {},
                }),
            )
            : [],
    };
}

function mapNewsSource(src: any): NewsSource {
    return {
        url: src.url ?? "",
        companyName:
            typeof src.companyName === "object"
                ? src.companyName.ar ?? src.companyName.en ?? ""
                : src.companyName ?? "",
        company: src.company ?? { en: src.companyName ?? "" },
        companyDescription:
            typeof src.companyDescription === "object"
                ? src.companyDescription.ar ?? src.companyDescription.en ?? ""
                : src.companyDescription ?? "",
        description: src.description ?? { en: src.companyDescription ?? "" },
        image: src.image ?? "",
    };
}

// ── Paginated result type ───────────────────────────────────────────
export interface PaginatedResult {
    articles: NewsArticle[];
    lastDoc: QueryDocumentSnapshot | null;
    hasMore: boolean;
}

// ── Generic paginated fetch (works for both News and Articles) ──────
async function fetchPaginated(
    collectionName: string,
    pageSize: number,
    afterDoc?: QueryDocumentSnapshot | null,
    country?: string | null, // Kept in signature so hooks don't break, but unused to prevent empty screens
): Promise<PaginatedResult> {
    const constraints: any[] = [
        orderBy("date", "desc"),
        limit(pageSize + 1), // Fetch 1 extra to check if there are more
    ];

    if (afterDoc) {
        constraints.splice(1, 0, startAfter(afterDoc));
    }

    const q = query(collection(db, collectionName), ...constraints);
    const snap = await getDocs(q);
    const docs = snap.docs;

    const hasMore = docs.length > pageSize;
    const resultDocs = hasMore ? docs.slice(0, pageSize) : docs;

    return {
        articles: resultDocs.map(mapDoc),
        lastDoc: resultDocs.length > 0 ? resultDocs[resultDocs.length - 1] : null,
        hasMore,
    };
}

// ── Public API: News ────────────────────────────────────────────────

/** Fetch paginated news articles. */
export async function fetchNews(
    pageSize = 12,
    afterDoc?: QueryDocumentSnapshot | null,
    country?: string | null,
): Promise<PaginatedResult> {
    return fetchPaginated(NEWS_COLLECTION, pageSize, afterDoc, country);
}

/** Fetch a single news article by document ID. */
export async function fetchNewsById(
    id: string,
): Promise<NewsArticle | null> {
    const docRef = doc(db, NEWS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return mapDoc(docSnap);
}

// ── Public API: Articles ────────────────────────────────────────────

/** Fetch paginated articles. */
export async function fetchArticles(
    pageSize = 12,
    afterDoc?: QueryDocumentSnapshot | null,
    country?: string | null,
): Promise<PaginatedResult> {
    return fetchPaginated(ARTICLES_COLLECTION, pageSize, afterDoc, country);
}

/** Fetch a single article by document ID. */
export async function fetchArticleById(
    id: string,
): Promise<NewsArticle | null> {
    const docRef = doc(db, ARTICLES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return mapDoc(docSnap);
}
