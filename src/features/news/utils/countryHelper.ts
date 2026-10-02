/**
 * CountryHelper — ported from the Flutter mobile app's country_helper.dart
 *
 * The Integri backend news API expects country keys like "Pakistan", "UnitedStates",
 * NOT ISO-2 codes ("PK", "US"). This utility converts any form of country identifier
 * to the correct API key.
 */

import { NEWS_COUNTRY_BY_KEY } from "./newsCountries";

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

  // 0. Any key the API serves (incl. ones missing from the maps below, e.g. "Serbia")
  if (NEWS_COUNTRY_BY_KEY[trimmed]) return trimmed;

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

// ── Visitor country (guests) ───────────────────────────────────────────────────
// Guessed from the browser's time zone, which needs no network call and sends
// the visitor's IP nowhere. Only countries the news API supports are listed.
const TIMEZONE_TO_API_KEY: Record<string, string> = {
  "Europe/Berlin": "Germany", "Europe/Busingen": "Germany",
  "Europe/Vienna": "Austria", "Europe/Paris": "France", "Europe/Brussels": "Belgium",
  "Europe/Amsterdam": "Netherlands", "Europe/Stockholm": "Sweden", "Europe/Kyiv": "Ukraine",
  "Europe/Kiev": "Ukraine", "Europe/Istanbul": "Turkey", "Europe/Bucharest": "Romania",
  "Europe/Madrid": "Spain", "Atlantic/Canary": "Spain", "Europe/Rome": "Italy",
  "Europe/Lisbon": "Portugal", "Atlantic/Madeira": "Portugal", "Atlantic/Azores": "Portugal",
  "Europe/Moscow": "Russia", "Europe/Budapest": "Hungary", "Europe/Sofia": "Bulgaria",
  "Europe/Belgrade": "Serbia", "Europe/Tirane": "Albania", "Europe/Athens": "Greece",
  "Europe/London": "UnitedKingdom", "Europe/Dublin": "Ireland", "Europe/Zurich": "Switzerland",
  "Europe/Zagreb": "Croatia", "Europe/Prague": "Czechia", "Europe/Warsaw": "Poland",
  "Europe/Minsk": "Belarus", "Europe/Oslo": "Norway", "Europe/Copenhagen": "Denmark",
  "Europe/Helsinki": "Finland", "Europe/Bratislava": "Slovakia", "Europe/Ljubljana": "Slovenia",
  "Asia/Riyadh": "SaudiArabia", "Asia/Tehran": "Iran", "Asia/Kabul": "Afghanistan",
  "Asia/Karachi": "Pakistan", "Asia/Yerevan": "Armenia", "Asia/Tbilisi": "Georgia",
  "Asia/Shanghai": "China", "Asia/Urumqi": "China", "Asia/Taipei": "Taiwan",
  "Asia/Hong_Kong": "HongKong", "Asia/Seoul": "SouthKorea", "Asia/Tokyo": "Japan",
  "Asia/Kolkata": "India", "Asia/Calcutta": "India", "Asia/Jakarta": "Indonesia",
  "Asia/Makassar": "Indonesia", "Asia/Jayapura": "Indonesia", "Asia/Bangkok": "Thailand",
  "Asia/Jerusalem": "Israel", "Asia/Tel_Aviv": "Israel", "Asia/Baghdad": "Iraq",
  "Asia/Amman": "Jordan", "Asia/Kuwait": "Kuwait", "Asia/Beirut": "Lebanon",
  "Asia/Muscat": "Oman", "Asia/Gaza": "Palestine", "Asia/Hebron": "Palestine",
  "Asia/Dubai": "UnitedArabEmirates", "Asia/Bahrain": "Bahrain", "Asia/Qatar": "Qatar",
  "Asia/Damascus": "Syria", "Asia/Kuala_Lumpur": "Malaysia", "Asia/Kuching": "Malaysia",
  "Asia/Singapore": "Singapore",
  "Africa/Mogadishu": "Somalia", "Africa/Johannesburg": "SouthAfrica", "Africa/Cairo": "Egypt",
  "Africa/Algiers": "Algeria", "Africa/Casablanca": "Morocco", "Africa/Khartoum": "Sudan",
  "Africa/Tunis": "Tunisia",
  "America/Sao_Paulo": "Brazil", "America/Argentina/Buenos_Aires": "Argentina",
  "America/La_Paz": "Bolivia", "America/Santiago": "Chile", "America/Bogota": "Colombia",
  "America/Guayaquil": "Ecuador", "America/Tegucigalpa": "Honduras",
  "America/Mexico_City": "Mexico", "America/Cancun": "Mexico", "America/Monterrey": "Mexico",
  "America/Tijuana": "Mexico", "America/Managua": "Nicaragua", "America/Panama": "Panama",
  "America/Lima": "Peru", "America/Montevideo": "Uruguay", "America/Caracas": "Venezuela",
  "America/Toronto": "Canada", "America/Vancouver": "Canada", "America/Edmonton": "Canada",
  "America/Winnipeg": "Canada", "America/Halifax": "Canada", "America/St_Johns": "Canada",
  "America/Regina": "Canada", "America/Montreal": "Canada",
  "America/New_York": "UnitedStates", "America/Chicago": "UnitedStates",
  "America/Denver": "UnitedStates", "America/Los_Angeles": "UnitedStates",
  "America/Phoenix": "UnitedStates", "America/Anchorage": "UnitedStates",
  "America/Detroit": "UnitedStates", "America/Boise": "UnitedStates",
  "Pacific/Honolulu": "UnitedStates", "Pacific/Auckland": "NewZealand",
};

const TIMEZONE_PREFIX_TO_API_KEY: Array<[string, string]> = [
  ["Australia/", "Australia"],
  ["America/Argentina/", "Argentina"],
  ["America/Indiana/", "UnitedStates"],
  ["America/Kentucky/", "UnitedStates"],
  ["America/North_Dakota/", "UnitedStates"],
];

/**
 * Best-guess news country for a visitor without a profile: browser time
 * zone first, then the region of their browser language (e.g. "ur-PK").
 * Returns null when neither maps to a supported country.
 */
export function detectVisitorNewsCountry(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
      if (TIMEZONE_TO_API_KEY[tz]) return TIMEZONE_TO_API_KEY[tz];
      const prefix = TIMEZONE_PREFIX_TO_API_KEY.find(([p]) => tz.startsWith(p));
      if (prefix) return prefix[1];
    }
  } catch {
    // Intl unavailable — fall through to the language region.
  }
  const languages = typeof navigator !== "undefined" ? navigator.languages ?? [navigator.language] : [];
  for (const lang of languages) {
    const region = lang?.split("-")[1]?.toUpperCase();
    const name = region && ISO_CODE_TO_NAME[region];
    if (name && COUNTRY_NAME_TO_API_KEY[name]) return COUNTRY_NAME_TO_API_KEY[name];
  }
  return null;
}
