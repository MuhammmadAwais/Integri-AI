import { TOPUP_LANGS, type TopUpLang } from "./i18n";

/** Mobile top-up shop: /shopping/mobile-top-up/{country}/{lang} */
export const TOPUP_BASE = "/shopping/mobile-top-up";
/** The page languages. Their texts are loaded one language at a time: see ./i18n. */
export { TOPUP_LANGS };
export type { TopUpLang };

/** Other codes browsers send for a page language: Norwegian Bokmål/Nynorsk, Filipino, old Hebrew/Indonesian/Javanese codes. */
const LANG_ALIASES: Record<string, string> = { nb: "no", nn: "no", fil: "tl", iw: "he", in: "id", jw: "jv" };

/** Maps a browser language tag ("pt-BR", "zh-Hant-TW", "de-AT", "nb-NO") onto a page language, if any. */
function matchLang(tag: string): TopUpLang | undefined {
  const lower = tag.toLowerCase();
  const exact = TOPUP_LANGS.find((l) => l.toLowerCase() === lower);
  if (exact) return exact;
  const base = lower.split("-")[0];
  if (base === "zh") return /-(tw|hk|mo|hant)\b/.test(lower) ? "zh-TW" : "zh-CN";
  if (base === "pt") return "pt";
  const code = LANG_ALIASES[base] ?? base;
  return TOPUP_LANGS.find((l) => l === code);
}

/**
 * Stripe.js only localizes its payment form (and its own error texts) for a short list of
 * languages; anything else, passed as `locale`, is not guaranteed to be accepted. Our page
 * language when Stripe has it, else "auto" (the browser's language).
 */
const STRIPE_LOCALES = new Set([
  "ar", "bg", "cs", "da", "de", "el", "en", "es", "et", "fi", "fil", "fr", "he", "hr", "hu", "id", "it", "ja", "ko", "lt", "lv", "ms", "mt",
  "nb", "nl", "pl", "pt", "pt-BR", "ro", "ru", "sk", "sl", "sv", "th", "tr", "vi", "zh", "zh-TW",
]);
/** Our page code -> Stripe's code, where they differ. */
const STRIPE_LOCALE_OF: Record<string, string> = { no: "nb", tl: "fil", "zh-CN": "zh" };
export const stripeLocale = (lang: string): string => {
  const l = STRIPE_LOCALE_OF[lang] ?? lang;
  return STRIPE_LOCALES.has(l) ? l : "auto";
};

/** First supported page language among the browser's languages, else English. */
export function preferredTopUpLang(): TopUpLang {
  for (const l of navigator.languages ?? [navigator.language]) {
    const hit = matchLang(String(l));
    if (hit) return hit;
  }
  return "en";
}

// ── Campaign attribution + dataLayer (public/tracking/integri-tracking.js) ──
interface IntegriTracking {
  init(): void;
  checkoutPayload(pageCountry: string, pageLanguage: string): Record<string, unknown>;
  event(name: string, params?: Record<string, unknown>, ecommerce?: Record<string, unknown>): void;
  operatorGroup(name: string, countryIso?: string): string;
  openConsent(): void;
  gtmEnabled(): boolean;
}
const tracker = () => (window as unknown as { IntegriTracking?: IntegriTracking }).IntegriTracking;

/** Captures the campaign (and starts GTM) for a client-side visit to a top-up page. */
export const initTracking = () => tracker()?.init();
/** attribution, ga_client_id, page_country, page_language for create-intent. */
export const checkoutAttribution = (pageCountry: string, pageLanguage: string) =>
  tracker()?.checkoutPayload(pageCountry, pageLanguage) ?? { attribution: null, ga_client_id: null, page_country: pageCountry, page_language: pageLanguage };
export const trackEvent: IntegriTracking["event"] = (name, params, ecommerce) => tracker()?.event(name, params, ecommerce);
export const operatorGroup = (name: string, countryIso?: string) => tracker()?.operatorGroup(name, countryIso) ?? name.toLowerCase().replace(/[^a-z0-9]/g, "");
export const cookieSettingsAvailable = () => !!tracker()?.gtmEnabled();
export const openCookieSettings = () => tracker()?.openConsent();

// ── Stripe.js (loaded on demand from js.stripe.com) ─────────────────
export interface StripeElements {
  create(type: "payment", options?: Record<string, unknown>): { mount(el: HTMLElement): void };
}
export interface StripeError {
  type?: string;
  code?: string;
  decline_code?: string;
  message?: string;
  payment_intent?: { last_payment_error?: { decline_code?: string; network_decline_code?: string } };
}
export interface StripeClient {
  elements(options: Record<string, unknown>): StripeElements;
  confirmPayment(options: Record<string, unknown>): Promise<{ error?: StripeError }>;
}
type StripeFactory = (key: string, options?: Record<string, unknown>) => StripeClient;

let stripeLoader: Promise<StripeFactory> | null = null;
export function loadStripe(): Promise<StripeFactory> {
  const w = window as unknown as { Stripe?: StripeFactory };
  if (w.Stripe) return Promise.resolve(w.Stripe);
  stripeLoader ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://js.stripe.com/v3/";
    s.onload = () => (w.Stripe ? resolve(w.Stripe) : reject(new Error("stripe")));
    s.onerror = () => {
      stripeLoader = null;
      reject(new Error("stripe"));
    };
    document.head.appendChild(s);
  });
  return stripeLoader;
}

/** "PK" -> 🇵🇰 */
export const flag = (iso: string) => String.fromCodePoint(...[...iso.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

/** The country's name in [lang], e.g. ("DE", "ar") -> "ألمانيا". */
export function countryName(iso: string, lang: string, fallback: string): string {
  try {
    return new Intl.DisplayNames([lang, "en"], { type: "region" }).of(iso) ?? fallback;
  } catch {
    return fallback;
  }
}

/** "{a} and {b}" style placeholders. */
export const fill = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

/** Card-network decline codes 59 / 05 / 9G (and Stripe's names for them): blocked for online or international use. */
const BLOCKED = new Set(["59", "05", "9G", "do_not_honor", "fraudulent", "transaction_not_allowed", "restricted_card", "card_not_supported", "call_issuer", "no_action_taken", "merchant_blacklist"]);
const NO_FUNDS = new Set(["51", "insufficient_funds"]);

/** Which localized message key fits a Stripe failure, or null for non-card errors (use Stripe's own text). */
export function declineKey(err: StripeError): "errFunds" | "errBlocked" | "errDeclined" | null {
  if (err.type !== "card_error" && err.code !== "card_declined") return null;
  const last = err.payment_intent?.last_payment_error;
  const codes = [err.decline_code, last?.network_decline_code, last?.decline_code].filter(Boolean) as string[];
  if (codes.some((c) => NO_FUNDS.has(c))) return "errFunds";
  if (codes.some((c) => BLOCKED.has(c.toUpperCase()) || BLOCKED.has(c))) return "errBlocked";
  return "errDeclined";
}
