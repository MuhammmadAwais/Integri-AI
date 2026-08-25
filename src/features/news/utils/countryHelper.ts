/**
 * CountryHelper — ported from the Flutter mobile app's country_helper.dart
 *
 * The Integri backend news API expects country keys like "Pakistan", "UnitedStates",
 * NOT ISO-2 codes ("PK", "US"). This utility converts any form of country identifier
 * to the correct API key.
 */

// ── ISO 2-letter code → full country name ──────────────────────────────────────
const ISO_CODE_TO_NAME: Record<string, string> = {
  US: "United States Of America",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  IT: "Italy",
  ES: "Spain",
  NL: "Netherlands",
  BE: "Belgium",
  AT: "Austria",
  CH: "Switzerland",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  PL: "Poland",
  CZ: "Czechia",
  SK: "Slovakia",
  PT: "Portugal",
  GR: "Greece",
  IE: "Ireland",
  CA: "Canada",
  AU: "Australia",
  NZ: "New Zealand",
  JP: "Japan",
  CN: "China",
  IN: "India",
  BR: "Brazil",
  MX: "Mexico",
  ZA: "South Africa",
  SG: "Singapore",
  HK: "Hong Kong",
  RU: "Russia",
  TR: "Turkey",
  KR: "South Korea",
  TH: "Thailand",
  ID: "Indonesia",
  MY: "Malaysia",
  PH: "Philippines",
  VN: "Vietnam",
  AE: "United Arab Emirates",
  SA: "Saudi Arabia",
  EG: "Egypt",
  NG: "Nigeria",
  UA: "Ukraine",
  RO: "Romania",
  BG: "Bulgaria",
  HR: "Croatia",
  HU: "Hungary",
  PK: "Pakistan",
  LB: "Lebanon",
  QA: "Qatar",
  PS: "Palestine",
  SY: "Syria",
  TN: "Tunisia",
  MA: "Morocco",
  IQ: "Iraq",
  SD: "Sudan",
  DZ: "Algeria",
  BH: "Bahrain",
  JO: "Jordan",
  AR: "Argentina",
  IL: "Israel",
  AL: "Albania",
  AF: "Afghanistan",
  AM: "Armenia",
  IR: "Iran",
};

// ── Full country name → backend API key ────────────────────────────────────────
const COUNTRY_NAME_TO_API_KEY: Record<string, string> = {
  "United States Of America": "UnitedStates",
  "United Kingdom": "UnitedKingdom",
  Germany: "Germany",
  France: "France",
  Italy: "Italy",
  Spain: "Spain",
  Netherlands: "Netherlands",
  Belgium: "Belgium",
  Austria: "Austria",
  Switzerland: "Switzerland",
  Sweden: "Sweden",
  Norway: "Norway",
  Denmark: "Denmark",
  Finland: "Finland",
  Poland: "Poland",
  Czechia: "Czechia",
  Slovakia: "Slovakia",
  Portugal: "Portugal",
  Greece: "Greece",
  Ireland: "Ireland",
  Canada: "Canada",
  Australia: "Australia",
  "New Zealand": "NewZealand",
  Japan: "Japan",
  China: "China",
  India: "India",
  Brazil: "Brazil",
  Mexico: "Mexico",
  "South Africa": "SouthAfrica",
  Singapore: "Singapore",
  "Hong Kong": "HongKong",
  Russia: "Russia",
  Turkey: "Turkey",
  "South Korea": "SouthKorea",
  Thailand: "Thailand",
  Indonesia: "Indonesia",
  Malaysia: "Malaysia",
  Philippines: "Philippines",
  Vietnam: "Vietnam",
  "United Arab Emirates": "UnitedArabEmirates",
  "Saudi Arabia": "SaudiArabia",
  Egypt: "Egypt",
  Nigeria: "Nigeria",
  Ukraine: "Ukraine",
  Romania: "Romania",
  Bulgaria: "Bulgaria",
  Croatia: "Croatia",
  Hungary: "Hungary",
  Pakistan: "Pakistan",
  Lebanon: "Lebanon",
  Qatar: "Qatar",
  Palestine: "Palestine",
  Syria: "Syria",
  Tunisia: "Tunisia",
  Morocco: "Morocco",
  Iraq: "Iraq",
  Sudan: "Sudan",
  Algeria: "Algeria",
  Bahrain: "Bahrain",
  Jordan: "Jordan",
  Argentina: "Argentina",
  Israel: "Israel",
  Albania: "Albania",
  Afghanistan: "Afghanistan",
  Armenia: "Armenia",
  Iran: "Iran",
};

const DEFAULT_API_KEY = "Germany";

/**
 * Convert any country identifier (ISO-2 code, full name, or API key)
 * to the backend API key format expected by GET /news/articles.
 *
 * Examples:
 *   "PK"                       → "Pakistan"
 *   "Pakistan"                 → "Pakistan"
 *   "United States Of America" → "UnitedStates"
 *   null / undefined           → "Germany" (default fallback)
 */
export function toNewsApiCountryKey(country: string | null | undefined): string {
  if (!country) return DEFAULT_API_KEY;

  const trimmed = country.trim();

  // 1. Already an API key (no spaces, title-case — e.g. "Pakistan", "UnitedStates")
  const directMatch = COUNTRY_NAME_TO_API_KEY[trimmed];
  if (directMatch) return directMatch;

  // 2. ISO 2-letter code → full name → API key
  const fromIso = ISO_CODE_TO_NAME[trimmed.toUpperCase()];
  if (fromIso) {
    return COUNTRY_NAME_TO_API_KEY[fromIso] ?? DEFAULT_API_KEY;
  }

  // 3. If it looks like it might already be an API key (no spaces, starts uppercase)
  // e.g. "Pakistan" stored directly in preferences
  if (!/\s/.test(trimmed) && trimmed[0] === trimmed[0].toUpperCase()) {
    // Check if it's a value in the API key map
    const isApiKey = Object.values(COUNTRY_NAME_TO_API_KEY).includes(trimmed);
    if (isApiKey) return trimmed;
  }

  // 4. Fallback
  console.warn(`[CountryHelper] Unknown country "${country}" — defaulting to ${DEFAULT_API_KEY}`);
  return DEFAULT_API_KEY;
}
