// ── TypeScript models matching the Firestore "News" collection ──────

export interface NewsSource {
    url: string;
    companyName: string;
    company: Record<string, string>;
    companyDescription: string;
    description: Record<string, string>;
    image: string;
}

export interface NewContent {
    type: "description" | "image" | "video";
    value: Record<string, string>;     // multilingual: { en: "...", ar: "..." }
    videoThumbnail: string;
    caption?: Record<string, string>;
}

export interface Keywords {
    title: Record<string, string>;
    nouns: Record<string, string>;
    description: Record<string, string>;
}

export interface GrammarPointModel {
    title: Record<string, string>;
    description: Record<string, string>;
    example: Record<string, string>;
    rules: Record<string, string[]>;
}

export interface NewsArticle {
    id: string;
    coverImage: string;
    video: string;
    thumbnailOfVideo: string;
    headline: Record<string, string>;   // multilingual
    date: Date;
    topic: string;
    tags: string[];
    content: NewContent[];
    markAsTrending: boolean;
    addToGeneralTopic: boolean;
    newsSource?: NewsSource;
    userWhoPaidForTranslation: string[];
    forCountries: string[];
    grammar: GrammarPointModel[];
    keywords: Keywords[];
}

// ── Helper: resolve multilingual field ──────────────────────────────
export function localised(
    map: Record<string, string> | undefined,
    lang: string,
): string {
    if (!map) return "";
    return map[lang] ?? map["en"] ?? Object.values(map)[0] ?? "";
}
