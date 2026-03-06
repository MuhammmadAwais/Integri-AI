/**
 * Google AdSense Configuration
 * ─────────────────────────────
 * Centralised ad slot IDs and settings.
 * Replace the dummy slot IDs below with your real AdSense ad-unit IDs.
 *
 * How to find your slot ID:
 *   1. Go to https://www.google.com/adsense → Ads → By ad unit
 *   2. Create or select an ad unit
 *   3. Copy the data-ad-slot value from the generated code
 */

// ── Publisher ID (from your AdSense account) ────────────────────────
// This is already loaded in index.html via the adsbygoogle script tag.
export const AD_CLIENT = "ca-pub-2692304161225754";

// ── Ad Slot IDs ─────────────────────────────────────────────────────
// Replace these dummy values with real ad-unit slot IDs from AdSense.

export const AD_SLOTS = {
    /** Banner ad shown at the top of the news/articles listing page (Horizontal Display) */
    NEWS_LIST_TOP: "8330712581",

    /** Ad inserted between news cards in the grid (every N cards) (In-feed) */
    NEWS_LIST_IN_FEED: "3984273463",

    /** Ad shown in the sidebar of the news/articles listing page (Vertical Display) */
    NEWS_LIST_SIDEBAR: "1956875929",

    /** Banner ad at the top of the news detail page (below excerpt) (Horizontal Display) */
    NEWS_DETAIL_TOP: "6610436808",

    /** Ad inserted between content blocks in the news detail page (In-article) */
    NEWS_DETAIL_IN_ARTICLE: "2671191795",

    /** Ad shown in the sidebar of the news/article detail page (Square Display) */
    NEWS_DETAIL_SIDEBAR: "2933751957",

    /** Banner ad at the top of the article detail page (Horizontal Display) */
    ARTICLE_DETAIL_TOP: "7923518470",

    /** Ad inserted between content blocks in the article detail page (In-article) */
    ARTICLE_DETAIL_IN_ARTICLE: "1358110126",

    /** Ad shown in the sidebar of the article detail page (Square Display) */
    ARTICLE_DETAIL_SIDEBAR: "8381519757",
} as const;

// ── Ad display configuration ────────────────────────────────────────

/** How many cards to show before inserting an in-feed ad */
export const IN_FEED_AD_INTERVAL = 4;

/** How many content blocks to show before inserting an in-article ad */
export const IN_ARTICLE_AD_INTERVAL = 3;

// ── Ad formats ──────────────────────────────────────────────────────

export type AdFormat = "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
export type AdLayout = "in-article" | "in-feed" | undefined;

export interface AdConfig {
    slot: string;
    format: AdFormat;
    layout?: AdLayout;
    responsive?: boolean;
    style?: React.CSSProperties;
}

// ── Pre-built ad configurations ─────────────────────────────────────

export const AD_CONFIGS: Record<string, AdConfig> = {
    /** Full-width responsive banner */
    banner: {
        slot: AD_SLOTS.NEWS_LIST_TOP,
        format: "auto",
        responsive: true,
        style: { display: "block" },
    },

    /** In-feed ad (between cards in a grid) */
    inFeed: {
        slot: AD_SLOTS.NEWS_LIST_IN_FEED,
        format: "fluid",
        layout: "in-feed",
        style: { display: "block" },
    },

    /** In-article ad (between content blocks) */
    inArticle: {
        slot: AD_SLOTS.NEWS_DETAIL_IN_ARTICLE,
        format: "fluid",
        layout: "in-article",
        style: { display: "block", textAlign: "center" },
    },

    /** Sidebar ad (rectangle) */
    sidebar: {
        slot: AD_SLOTS.NEWS_LIST_SIDEBAR,
        format: "auto",
        responsive: true,
        style: { display: "block" },
    },
};
