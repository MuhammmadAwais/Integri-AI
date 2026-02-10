import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";
import ar from "../locales/ar.json";
import de from "../locales/de.json";
import nl from "../locales/nl.json";
import fr from "../locales/fr.json";
import hu from "../locales/hu.json";
import fa from "../locales/fa.json";
import ur from "../locales/ur.json";
import uk from "../locales/uk.json";
import ps from "../locales/ps.json";
import tr from "../locales/tr.json";
import ro from "../locales/ro.json";
import ru from "../locales/ru.json";
import es from "../locales/es.json";
import sr from "../locales/sr.json";
import so from "../locales/so.json";
import sv from "../locales/sv.json";
import pt from "../locales/pt.json";
import ptBR from "../locales/pt-BR.json";
import zhCN from "../locales/zh-CN.json";
import zhTW from "../locales/zh-TW.json";
import ko from "../locales/ko.json";
import ja from "../locales/ja.json";
import bg from "../locales/bg.json";
import sq from "../locales/sq.json";
import hy from "../locales/hy.json";
import ka from "../locales/ka.json";
import it from "../locales/it.json";
import el from "../locales/el.json";

const STORAGE_KEY = "integri_locale";

export const defaultNS = "translation";
export const resources = {
  en: { [defaultNS]: en },
  ar: { [defaultNS]: ar },
  de: { [defaultNS]: de },
  nl: { [defaultNS]: nl },
  fr: { [defaultNS]: fr },
  hu: { [defaultNS]: hu },
  fa: { [defaultNS]: fa },
  ur: { [defaultNS]: ur },
  uk: { [defaultNS]: uk },
  ps: { [defaultNS]: ps },
  tr: { [defaultNS]: tr },
  ro: { [defaultNS]: ro },
  ru: { [defaultNS]: ru },
  es: { [defaultNS]: es },
  sr: { [defaultNS]: sr },
  so: { [defaultNS]: so },
  sv: { [defaultNS]: sv },
  pt: { [defaultNS]: pt },
  "pt-BR": { [defaultNS]: ptBR },
  "zh-CN": { [defaultNS]: zhCN },
  "zh-TW": { [defaultNS]: zhTW },
  ko: { [defaultNS]: ko },
  ja: { [defaultNS]: ja },
  bg: { [defaultNS]: bg },
  sq: { [defaultNS]: sq },
  hy: { [defaultNS]: hy },
  ka: { [defaultNS]: ka },
  it: { [defaultNS]: it },
  el: { [defaultNS]: el },
} as const;

export const supportedLngs = [
  "en",
  "ar",
  "de",
  "nl",
  "fr",
  "hu",
  "fa",
  "ur",
  "uk",
  "ps",
  "tr",
  "ro",
  "ru",
  "es",
  "sr",
  "so",
  "sv",
  "pt",
  "pt-BR",
  "zh-CN",
  "zh-TW",
  "ko",
  "ja",
  "bg",
  "sq",
  "hy",
  "ka",
  "it",
  "el",
] as const;

export type SupportedLocale = (typeof supportedLngs)[number];

// RTL languages
const rtlLanguages = ["ar", "fa", "ur", "ps"];

const saved = localStorage.getItem(STORAGE_KEY) as SupportedLocale | null;
const initialLng = saved && supportedLngs.includes(saved) ? saved : "en";

i18n.use(initReactI18next).init({
  resources,
  defaultNS,
  lng: initialLng,
  fallbackLng: "en",
  supportedLngs: [...supportedLngs],
  interpolation: {
    escapeValue: false,
  },
});

// Apply RTL and lang attribute when language changes
const applyDocumentDirection = (lng: string) => {
  const dir = rtlLanguages.includes(lng) ? "rtl" : "ltr";
  const html = document.documentElement;
  html.setAttribute("dir", dir);
  html.setAttribute("lang", lng);
};

applyDocumentDirection(i18n.language);
i18n.on("languageChanged", applyDocumentDirection);

export function persistLocale(lng: string) {
  if (supportedLngs.includes(lng as SupportedLocale)) {
    localStorage.setItem(STORAGE_KEY, lng);
  }
}

// Language metadata for display
export const languageMetadata: Record<
  SupportedLocale,
  { name: string; flag: string }
> = {
  en: { name: "English", flag: "🇺🇸" },
  ar: { name: "عربي", flag: "🇸🇦" },
  de: { name: "Deutsch", flag: "🇩🇪" },
  nl: { name: "Nederlands", flag: "🇳🇱" },
  fr: { name: "Français", flag: "🇫🇷" },
  hu: { name: "Magyar", flag: "🇭🇺" },
  fa: { name: "فارسی", flag: "🇮🇷" },
  ur: { name: "اردو", flag: "🇵🇰" },
  uk: { name: "Українська", flag: "🇺🇦" },
  ps: { name: "پښتو", flag: "🇦🇫" },
  tr: { name: "Türkçe", flag: "🇹🇷" },
  ro: { name: "Română", flag: "🇷🇴" },
  ru: { name: "Русский", flag: "🇷🇺" },
  es: { name: "Español", flag: "🇪🇸" },
  sr: { name: "Српски", flag: "🇷🇸" },
  so: { name: "Soomaali", flag: "🇸🇴" },
  sv: { name: "Svenska", flag: "🇸🇪" },
  pt: { name: "Português", flag: "🇵🇹" },
  "pt-BR": { name: "Português (Brasil)", flag: "🇧🇷" },
  "zh-CN": { name: "中文 (简体)", flag: "🇨🇳" },
  "zh-TW": { name: "中文 (繁體)", flag: "🇹🇼" },
  ko: { name: "한국어", flag: "🇰🇷" },
  ja: { name: "日本語", flag: "🇯🇵" },
  bg: { name: "Български", flag: "🇧🇬" },
  sq: { name: "Shqip", flag: "🇦🇱" },
  hy: { name: "Հայերեն", flag: "🇦🇲" },
  ka: { name: "ქართული", flag: "🇬🇪" },
  it: { name: "Italiano", flag: "🇮🇹" },
  el: { name: "Ελληνικά", flag: "🇬🇷" },
};

export default i18n;
