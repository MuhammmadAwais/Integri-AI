/**
 * Countries the news API serves (GET /api/v1/news/country-collections),
 * with the API key, display name and ISO code (for the flag).
 */
export interface NewsCountry {
  key: string;
  name: string;
  iso: string;
}

export const NEWS_COUNTRIES: NewsCountry[] = [
  { key: "Afghanistan", name: "Afghanistan", iso: "AF" },
  { key: "Albania", name: "Albania", iso: "AL" },
  { key: "Algeria", name: "Algeria", iso: "DZ" },
  { key: "Argentina", name: "Argentina", iso: "AR" },
  { key: "Armenia", name: "Armenia", iso: "AM" },
  { key: "Australia", name: "Australia", iso: "AU" },
  { key: "Austria", name: "Austria", iso: "AT" },
  { key: "Bahrain", name: "Bahrain", iso: "BH" },
  { key: "Belarus", name: "Belarus", iso: "BY" },
  { key: "Belgium", name: "Belgium", iso: "BE" },
  { key: "Bolivia", name: "Bolivia", iso: "BO" },
  { key: "Brazil", name: "Brazil", iso: "BR" },
  { key: "Bulgaria", name: "Bulgaria", iso: "BG" },
  { key: "Canada", name: "Canada", iso: "CA" },
  { key: "Chile", name: "Chile", iso: "CL" },
  { key: "China", name: "China", iso: "CN" },
  { key: "Colombia", name: "Colombia", iso: "CO" },
  { key: "Croatia", name: "Croatia", iso: "HR" },
  { key: "Czechia", name: "Czechia", iso: "CZ" },
  { key: "Denmark", name: "Denmark", iso: "DK" },
  { key: "Ecuador", name: "Ecuador", iso: "EC" },
  { key: "Egypt", name: "Egypt", iso: "EG" },
  { key: "Finland", name: "Finland", iso: "FI" },
  { key: "France", name: "France", iso: "FR" },
  { key: "Georgia", name: "Georgia", iso: "GE" },
  { key: "Germany", name: "Germany", iso: "DE" },
  { key: "Greece", name: "Greece", iso: "GR" },
  { key: "Honduras", name: "Honduras", iso: "HN" },
  { key: "HongKong", name: "Hong Kong", iso: "HK" },
  { key: "Hungary", name: "Hungary", iso: "HU" },
  { key: "India", name: "India", iso: "IN" },
  { key: "Indonesia", name: "Indonesia", iso: "ID" },
  { key: "Iran", name: "Iran", iso: "IR" },
  { key: "Iraq", name: "Iraq", iso: "IQ" },
  { key: "Ireland", name: "Ireland", iso: "IE" },
  { key: "Israel", name: "Israel", iso: "IL" },
  { key: "Italy", name: "Italy", iso: "IT" },
  { key: "Japan", name: "Japan", iso: "JP" },
  { key: "Jordan", name: "Jordan", iso: "JO" },
  { key: "Kuwait", name: "Kuwait", iso: "KW" },
  { key: "Lebanon", name: "Lebanon", iso: "LB" },
  { key: "Malaysia", name: "Malaysia", iso: "MY" },
  { key: "Mexico", name: "Mexico", iso: "MX" },
  { key: "Morocco", name: "Morocco", iso: "MA" },
  { key: "Netherlands", name: "Netherlands", iso: "NL" },
  { key: "NewZealand", name: "New Zealand", iso: "NZ" },
  { key: "Nicaragua", name: "Nicaragua", iso: "NI" },
  { key: "Norway", name: "Norway", iso: "NO" },
  { key: "Oman", name: "Oman", iso: "OM" },
  { key: "Pakistan", name: "Pakistan", iso: "PK" },
  { key: "Palestine", name: "Palestine", iso: "PS" },
  { key: "Panama", name: "Panama", iso: "PA" },
  { key: "Peru", name: "Peru", iso: "PE" },
  { key: "Poland", name: "Poland", iso: "PL" },
  { key: "Portugal", name: "Portugal", iso: "PT" },
  { key: "Qatar", name: "Qatar", iso: "QA" },
  { key: "Romania", name: "Romania", iso: "RO" },
  { key: "Russia", name: "Russia", iso: "RU" },
  { key: "SaudiArabia", name: "Saudi Arabia", iso: "SA" },
  { key: "Serbia", name: "Serbia", iso: "RS" },
  { key: "Singapore", name: "Singapore", iso: "SG" },
  { key: "Slovakia", name: "Slovakia", iso: "SK" },
  { key: "Slovenia", name: "Slovenia", iso: "SI" },
  { key: "Somalia", name: "Somalia", iso: "SO" },
  { key: "SouthAfrica", name: "South Africa", iso: "ZA" },
  { key: "SouthKorea", name: "South Korea", iso: "KR" },
  { key: "Spain", name: "Spain", iso: "ES" },
  { key: "Sudan", name: "Sudan", iso: "SD" },
  { key: "Sweden", name: "Sweden", iso: "SE" },
  { key: "Switzerland", name: "Switzerland", iso: "CH" },
  { key: "Syria", name: "Syria", iso: "SY" },
  { key: "Taiwan", name: "Taiwan", iso: "TW" },
  { key: "Thailand", name: "Thailand", iso: "TH" },
  { key: "Tunisia", name: "Tunisia", iso: "TN" },
  { key: "Turkey", name: "Türkiye", iso: "TR" },
  { key: "Ukraine", name: "Ukraine", iso: "UA" },
  { key: "UnitedArabEmirates", name: "United Arab Emirates", iso: "AE" },
  { key: "UnitedKingdom", name: "United Kingdom", iso: "GB" },
  { key: "UnitedStates", name: "United States", iso: "US" },
  { key: "Uruguay", name: "Uruguay", iso: "UY" },
  { key: "Venezuela", name: "Venezuela", iso: "VE" },
];

export const NEWS_COUNTRY_BY_KEY: Record<string, NewsCountry> = Object.fromEntries(
  NEWS_COUNTRIES.map((c) => [c.key, c])
);

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
