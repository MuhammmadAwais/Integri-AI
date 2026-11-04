import STRINGS from "./strings.json";

/** Mobile top-up shop: /shopping/mobile-top-up/{country}/{lang} */
export const TOPUP_BASE = "/shopping/mobile-top-up";
export type TopUpLang = keyof typeof STRINGS;
export const TOPUP_LANGS = Object.keys(STRINGS) as TopUpLang[];

/** Maps a browser language tag ("pt-BR", "zh-Hant-TW", "de-AT") onto a page language, if any. */
function matchLang(tag: string): TopUpLang | undefined {
  const lower = tag.toLowerCase();
  const exact = TOPUP_LANGS.find((l) => l.toLowerCase() === lower);
  if (exact) return exact;
  const base = lower.split("-")[0];
  if (base === "zh") return /-(tw|hk|mo|hant)\b/.test(lower) ? "zh-TW" : "zh-CN";
  if (base === "pt") return "pt";
  return TOPUP_LANGS.find((l) => l === base);
}

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
export interface StripeClient {
  elements(options: Record<string, unknown>): StripeElements;
  confirmPayment(options: Record<string, unknown>): Promise<{ error?: { message?: string } }>;
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
