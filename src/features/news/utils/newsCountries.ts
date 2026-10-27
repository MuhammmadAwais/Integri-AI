/**
 * Countries the news API serves (GET /api/v1/news/country-collections),
 * with the API key, display name and ISO code (for the flag).
 */
export interface NewsCountry {
  key: string;
  name: string;
  iso: string;
  /** Firestore / API collection holding this country's stories. */
  collection: string;
}

export const NEWS_COUNTRIES: NewsCountry[] = [
  { key: "Afghanistan", name: "Afghanistan", iso: "AF", collection: "NewsAF" },
  { key: "Albania", name: "Albania", iso: "AL", collection: "NewsSQ" },
  { key: "Algeria", name: "Algeria", iso: "DZ", collection: "NewsAlgeria" },
  { key: "Argentina", name: "Argentina", iso: "AR", collection: "NewsArgentina" },
  { key: "Armenia", name: "Armenia", iso: "AM", collection: "NewsHY" },
  { key: "Australia", name: "Australia", iso: "AU", collection: "NewsAustralia" },
  { key: "Austria", name: "Austria", iso: "AT", collection: "NewsAustria" },
  { key: "Bahrain", name: "Bahrain", iso: "BH", collection: "NewsBahrain" },
  { key: "Belarus", name: "Belarus", iso: "BY", collection: "NewsBelarus" },
  { key: "Belgium", name: "Belgium", iso: "BE", collection: "NewsBelgium" },
  { key: "Bolivia", name: "Bolivia", iso: "BO", collection: "NewsBolivia" },
  { key: "Brazil", name: "Brazil", iso: "BR", collection: "NewsBR" },
  { key: "Bulgaria", name: "Bulgaria", iso: "BG", collection: "NewsBG" },
  { key: "Canada", name: "Canada", iso: "CA", collection: "NewsCanada" },
  { key: "Chile", name: "Chile", iso: "CL", collection: "NewsChile" },
  { key: "China", name: "China", iso: "CN", collection: "NewsZH" },
  { key: "Colombia", name: "Colombia", iso: "CO", collection: "NewsColombia" },
  { key: "Croatia", name: "Croatia", iso: "HR", collection: "NewsCroatia" },
  { key: "Czechia", name: "Czechia", iso: "CZ", collection: "NewsCzechia" },
  { key: "Denmark", name: "Denmark", iso: "DK", collection: "NewsDenmark" },
  { key: "Ecuador", name: "Ecuador", iso: "EC", collection: "NewsEcuador" },
  { key: "Egypt", name: "Egypt", iso: "EG", collection: "NewsEgypt" },
  { key: "Finland", name: "Finland", iso: "FI", collection: "NewsFinland" },
  { key: "France", name: "France", iso: "FR", collection: "NewsFrance" },
  { key: "Georgia", name: "Georgia", iso: "GE", collection: "NewsKA" },
  { key: "Germany", name: "Germany", iso: "DE", collection: "NewsGermany" },
  { key: "Greece", name: "Greece", iso: "GR", collection: "NewsEL" },
  { key: "Honduras", name: "Honduras", iso: "HN", collection: "NewsHonduras" },
  { key: "HongKong", name: "Hong Kong", iso: "HK", collection: "NewsHK" },
  { key: "Hungary", name: "Hungary", iso: "HU", collection: "NewsHU" },
  { key: "India", name: "India", iso: "IN", collection: "NewsIndia" },
  { key: "Indonesia", name: "Indonesia", iso: "ID", collection: "NewsIndonesia" },
  { key: "Iran", name: "Iran", iso: "IR", collection: "NewsIR" },
  { key: "Iraq", name: "Iraq", iso: "IQ", collection: "NewsIraq" },
  { key: "Ireland", name: "Ireland", iso: "IE", collection: "NewsIreland" },
  { key: "Israel", name: "Israel", iso: "IL", collection: "NewsIsrael" },
  { key: "Italy", name: "Italy", iso: "IT", collection: "NewsIT" },
  { key: "Japan", name: "Japan", iso: "JP", collection: "NewsJA" },
  { key: "Jordan", name: "Jordan", iso: "JO", collection: "NewsJordan" },
  { key: "Kuwait", name: "Kuwait", iso: "KW", collection: "NewsKuwait" },
  { key: "Lebanon", name: "Lebanon", iso: "LB", collection: "NewsLebanon" },
  { key: "Malaysia", name: "Malaysia", iso: "MY", collection: "NewsMalaysia" },
  { key: "Mexico", name: "Mexico", iso: "MX", collection: "NewsMexico" },
  { key: "Morocco", name: "Morocco", iso: "MA", collection: "NewsMorocco" },
  { key: "Netherlands", name: "Netherlands", iso: "NL", collection: "NewsNetherlands" },
  { key: "NewZealand", name: "New Zealand", iso: "NZ", collection: "NewsNewZealand" },
  { key: "Nicaragua", name: "Nicaragua", iso: "NI", collection: "NewsNicaragua" },
  { key: "Norway", name: "Norway", iso: "NO", collection: "NewsNorway" },
  { key: "Oman", name: "Oman", iso: "OM", collection: "NewsOman" },
  { key: "Pakistan", name: "Pakistan", iso: "PK", collection: "NewsUR" },
  { key: "Palestine", name: "Palestine", iso: "PS", collection: "NewsPalestine" },
  { key: "Panama", name: "Panama", iso: "PA", collection: "NewsPanama" },
  { key: "Peru", name: "Peru", iso: "PE", collection: "NewsPeru" },
  { key: "Poland", name: "Poland", iso: "PL", collection: "NewsPoland" },
  { key: "Portugal", name: "Portugal", iso: "PT", collection: "NewsPT" },
  { key: "Qatar", name: "Qatar", iso: "QA", collection: "NewsQatar" },
  { key: "Romania", name: "Romania", iso: "RO", collection: "NewsRO" },
  { key: "Russia", name: "Russia", iso: "RU", collection: "NewsRU" },
  { key: "SaudiArabia", name: "Saudi Arabia", iso: "SA", collection: "NewsAR" },
  { key: "Serbia", name: "Serbia", iso: "RS", collection: "NewsSR" },
  { key: "Singapore", name: "Singapore", iso: "SG", collection: "NewsSingapore" },
  { key: "Slovakia", name: "Slovakia", iso: "SK", collection: "NewsSlovakia" },
  { key: "Slovenia", name: "Slovenia", iso: "SI", collection: "NewsSlovenia" },
  { key: "Somalia", name: "Somalia", iso: "SO", collection: "NewsSO" },
  { key: "SouthAfrica", name: "South Africa", iso: "ZA", collection: "NewsSouthAfrica" },
  { key: "SouthKorea", name: "South Korea", iso: "KR", collection: "NewsKO" },
  { key: "Spain", name: "Spain", iso: "ES", collection: "NewsES" },
  { key: "Sudan", name: "Sudan", iso: "SD", collection: "NewsSudan" },
  { key: "Sweden", name: "Sweden", iso: "SE", collection: "NewsSweden" },
  { key: "Switzerland", name: "Switzerland", iso: "CH", collection: "NewsSwitzerland" },
  { key: "Syria", name: "Syria", iso: "SY", collection: "NewsSyria" },
  { key: "Taiwan", name: "Taiwan", iso: "TW", collection: "NewsZHTW" },
  { key: "Thailand", name: "Thailand", iso: "TH", collection: "NewsThailand" },
  { key: "Tunisia", name: "Tunisia", iso: "TN", collection: "NewsTunisia" },
  { key: "Turkey", name: "Türkiye", iso: "TR", collection: "NewsTR" },
  { key: "Ukraine", name: "Ukraine", iso: "UA", collection: "NewsUK" },
  { key: "UnitedArabEmirates", name: "United Arab Emirates", iso: "AE", collection: "NewsUnitedArabEmirates" },
  { key: "UnitedKingdom", name: "United Kingdom", iso: "GB", collection: "NewsUnitedKingdom" },
  { key: "UnitedStates", name: "United States", iso: "US", collection: "NewsEN" },
  { key: "Uruguay", name: "Uruguay", iso: "UY", collection: "NewsUruguay" },
  { key: "Venezuela", name: "Venezuela", iso: "VE", collection: "NewsVenezuela" },
];

export const NEWS_COUNTRY_BY_KEY: Record<string, NewsCountry> = Object.fromEntries(
  NEWS_COUNTRIES.map((c) => [c.key, c])
);

export const NEWS_COUNTRY_BY_COLLECTION: Record<string, NewsCountry> = Object.fromEntries(
  NEWS_COUNTRIES.map((c) => [c.collection, c])
);

/** URL segment for a country: "UnitedStates" → "united-states". */
export const countrySlug = (key: string) => key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

const COUNTRY_BY_SLUG: Record<string, NewsCountry> = Object.fromEntries(
  NEWS_COUNTRIES.map((c) => [countrySlug(c.key), c])
);

export const countryBySlug = (slug: string | undefined): NewsCountry | undefined =>
  slug ? COUNTRY_BY_SLUG[slug.toLowerCase()] : undefined;

/**
 * Canonical path of a story. Country stories live at /news/<country>/<id>
 * (e.g. /news/germany/TvRl…), so the address alone identifies the story;
 * the legacy "News" collection keeps /news/<id>.
 */
export function newsPath(id: string, collection?: string | null): string {
  const country = collection ? NEWS_COUNTRY_BY_COLLECTION[collection] : undefined;
  return country ? `/news/${countrySlug(country.key)}/${id}` : `/news/${id}`;
}

/** A country/topic section is linked from stories and indexable only once it holds this many. */
export const TOPIC_MIN_ARTICLES = 5;

/** "PK" → 🇵🇰 */
export function flagEmoji(iso: string): string {
  return String.fromCodePoint(...[...iso.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

// The visitor's own pick on the news page, remembered in this browser.
const STORAGE_KEY = "integri_news_country";

export function getStoredNewsCountry(): string | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v && NEWS_COUNTRY_BY_KEY[v] ? v : null;
  } catch {
    return null;
  }
}

export function storeNewsCountry(key: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, key);
  } catch {
    // Storage blocked (private mode) — the pick just won't be remembered.
  }
}
