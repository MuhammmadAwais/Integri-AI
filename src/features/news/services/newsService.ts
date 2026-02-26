import {
    collection,
    getDocs,
    doc,
    getDoc,
    query,
    orderBy,
    limit,
    Timestamp,
} from "firebase/firestore";
import { db } from "../../../app/firebase";
import type {
    NewsArticle,
    NewContent,
    NewsSource,
    GrammarPointModel,
    Keywords,
} from "../models/newsArticle";

const COLLECTION = "News";

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

// ── Public API ──────────────────────────────────────────────────────

/** Fetch the latest news articles (default 20). */
export async function fetchNews(count = 20): Promise<NewsArticle[]> {
    const q = query(
        collection(db, COLLECTION),
        orderBy("date", "desc"),
        limit(count),
    );
    const snap = await getDocs(q);
    return snap.docs.map(mapDoc);
}

/** Fetch a single article by document ID. */
export async function fetchNewsById(
    id: string,
): Promise<NewsArticle | null> {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return mapDoc(docSnap);
}
