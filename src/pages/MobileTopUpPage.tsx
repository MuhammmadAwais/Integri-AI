import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { Check, ChevronDown, Loader2, Lock } from "lucide-react";
import Seo from "../Components/seo/Seo";
import { cn } from "../lib/utils";
import COUNTRIES from "../features/topup/countries.json";
import STRINGS from "../features/topup/strings.json";
import ALIASES from "../features/topup/aliases.json";
import FAQ from "../features/topup/faq.json";
import {
  TOPUP_BASE, TOPUP_LANGS, checkoutAttribution, cookieSettingsAvailable, countryName, fill, flag, initTracking, loadStripe,
  openCookieSettings, operatorGroup, preferredTopUpLang, trackEvent, type StripeClient, type StripeElements, type TopUpLang,
} from "../features/topup/shop";

/*
 * Mobile top-up shop: /shopping/mobile-top-up/{country}/{lang}
 *
 * One page per country (every country the app's recharge screen sells) and
 * page language. Everything about money happens on the server (rechargeWeb in
 * the backend): the page only names an operator, a Ding product and, for
 * free-amount products, the amount; the server prices it, DingConnect
 * validates the number, Stripe takes the payment (3-D Secure) and a failed
 * top-up is refunded automatically.
 */

type Lang = TopUpLang;
type Strings = (typeof STRINGS)["en"];
interface Country { iso: string; slug: string; name: string; dial: string; operators: string }
interface Operator { provider_code: string; name: string; logo: string | null }
interface Credit { sku_code: string; min: number; max: number; suggested_chips: number[]; currency: string; receive_rate: number | null }
interface Bundle { sku_code: string; name: string; description: string; price: number }
interface Products { credit: Credit | null; bundles: Bundle[]; serviceFeeEur: number }
type Choice = { kind: "credit"; sku: string; amount: number } | { kind: "bundle"; sku: string; price: number; name: string };
interface Intent { orderId: string; clientSecret: string; publishableKey: string; bundleEur: number; feeEur: number; totalEur: number }

const countries = COUNTRIES as Country[];
const API = "/recharge/web";



async function getJson<T>(url: string): Promise<T> {
  const r = await fetch(url);
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(body.error || `HTTP ${r.status}`), { status: r.status, code: body.code });
  return body as T;
}

// ── Page ────────────────────────────────────────────────────────────

const MobileTopUpPage: React.FC = () => {
  const { country: slug = "", lang: langParam } = useParams();
  // Redirects keep the query string, or the ad campaign (utm_*, gclid) is lost.
  const { search } = useLocation();
  const country = countries.find((c) => c.slug === slug.toLowerCase());
  // Common other names ("turkey", "uae") lead to the official address.
  const alias = (ALIASES as Record<string, string>)[slug.toLowerCase()];
  if (!country && alias) return <Navigate to={`${TOPUP_BASE}/${alias}${langParam ? `/${langParam}` : ""}${search}`} replace />;

  // /shopping/mobile-top-up/{country} -> the visitor's language
  if (country && !langParam) return <Navigate to={`${TOPUP_BASE}/${country.slug}/${preferredTopUpLang()}${search}`} replace />;
  const lang = (TOPUP_LANGS.includes(langParam as Lang) ? langParam : null) as Lang | null;
  if (!country || !lang) return <NotFound />;
  return <CountryShop key={`${country.iso}-${lang}`} country={country} lang={lang} />;
};

const NotFound: React.FC = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0A0A0A] p-6 text-center text-zinc-200">
    <Seo title="Page not found | Integri" description="This top-up page does not exist." noindex />
    <h1 className="text-2xl font-bold">Page not found</h1>
    <Link to="/" className="text-[#5EEAD4] underline-offset-2 hover:underline">integri.app</Link>
  </div>
);

const CountryShop: React.FC<{ country: Country; lang: Lang }> = ({ country, lang }) => {
  const t = STRINGS[lang] as Strings;
  const name = countryName(country.iso, lang, country.name);
  // The client's operator names (cleaner than Ding's), first six, else the catalogue's.
  const opNames = (FAQ.operators as Record<string, string[]>)[country.iso] ?? country.operators.split(", ");
  const vars = { country: name, operator: opNames[0] ?? "", operators: opNames.slice(0, 6).join(", ") };
  const money = useMemo(() => new Intl.NumberFormat(lang, { style: "currency", currency: "EUR" }), [lang]);
  const eur = (n: number) => money.format(n);

  const [operators, setOperators] = useState<Operator[] | null>(null);
  const [opError, setOpError] = useState<string | null>(null);
  const [op, setOp] = useState<Operator | null>(null);
  const [products, setProducts] = useState<Products | null>(null);
  const [prodState, setProdState] = useState<"idle" | "loading" | "error" | "busy">("idle");
  const [choice, setChoice] = useState<Choice | null>(null);
  const [customAmt, setCustomAmt] = useState("");
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"form" | "pay" | "result">("form");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [intent, setIntent] = useState<Intent | null>(null);
  const [result, setResult] = useState<{ status: string; orderId: string } | null>(null);
  const stripeRef = useRef<{ stripe: StripeClient; elements: StripeElements } | null>(null);
  const payRef = useRef<HTMLDivElement>(null);

  // Funnel events for GA4 through GTM (page view -> operator -> amount -> checkout).
  const opParams = (o: Operator) => ({
    country: country.iso, operator_code: o.provider_code, operator_group: operatorGroup(o.name, country.iso), page_language: lang,
  });
  const ecommerce = (o: Operator, sku: string, value: number) => ({
    currency: "EUR", value,
    items: [{ item_id: sku, item_name: o.name, item_brand: o.name, item_category: country.iso, price: value, quantity: 1 }],
  });
  function trackAmount(sku: string, value: number) {
    if (op && value > 0) trackEvent("add_to_cart", opParams(op), ecommerce(op, sku, value));
  }

  useEffect(() => {
    initTracking();
    trackEvent("view_item_list", { country: country.iso, page_language: lang, item_list_id: country.slug });
  }, [country.iso, country.slug, lang]);

  // Operators of this country
  useEffect(() => {
    getJson<{ operators: Operator[] }>(`${API}/catalog/operators?country=${country.iso}`)
      .then((d) => {
        setOperators(d.operators);
        if (d.operators.length === 1) setOp(d.operators[0]);
      })
      .catch(() => setOpError(t.errGeneric));
  }, [country.iso, t.errGeneric]);

  // Products of the chosen operator
  useEffect(() => {
    if (!op) return;
    let cancelled = false;
    setProducts(null);
    setChoice(null);
    setProdState("loading");
    getJson<Products>(`${API}/catalog/products?provider=${op.provider_code}`)
      .then((d) => {
        if (cancelled) return;
        setProducts(d);
        setProdState("idle");
        if (d.credit) setChoice({ kind: "credit", sku: d.credit.sku_code, amount: d.credit.suggested_chips[0] ?? d.credit.min });
      })
      .catch((e) => !cancelled && setProdState(e.status === 503 ? "busy" : "error"));
    return () => { cancelled = true; };
  }, [op]);

  // Back from a redirect-based payment method: ?order=…&payment_intent=…
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const order = q.get("order");
    if (order && q.get("payment_intent")) {
      history.replaceState(null, "", location.pathname);
      setStep("result");
      poll(order);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const credit = products?.credit ?? null;
  const fee = products?.serviceFeeEur ?? 0.29;
  const price = choice ? (choice.kind === "credit" ? choice.amount : choice.price) : 0;
  const receive = choice?.kind === "credit" && credit?.receive_rate
    ? new Intl.NumberFormat(lang, { style: "currency", currency: credit.currency, maximumFractionDigits: 0 }).format(choice.amount * credit.receive_rate)
    : null;

  function pickCustom(v: string) {
    setCustomAmt(v);
    const n = Math.round(Number(v.replace(",", ".")) * 100) / 100;
    if (credit && Number.isFinite(n)) setChoice({ kind: "credit", sku: credit.sku_code, amount: n });
  }

  function msisdn() {
    const dial = country.dial.replace(/\D/g, "");
    let d = number.replace(/\D/g, "");
    if (d.startsWith("00" + dial)) d = d.slice(2 + dial.length);
    else if (d.startsWith(dial) && d.length > dial.length + 6) d = d.slice(dial.length);
    d = d.replace(/^0+/, "");
    return d ? `+${dial}${d}` : "";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!op) errs.op = t.errOperator;
    if (!choice || (choice.kind === "credit" && credit && (choice.amount < credit.min || choice.amount > credit.max)))
      errs.amount = credit ? fill(t.between, { min: eur(credit.min), max: eur(credit.max) }) : t.errAmount;
    if (!msisdn()) errs.number = t.errNumber;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) errs.email = t.errEmail;
    if (!consent) errs.consent = t.errConsent;
    setErrors(errs);
    setFormError(null);
    if (Object.keys(errs).length || !op || !choice) return;

    setBusy(true);
    trackEvent("begin_checkout", opParams(op), ecommerce(op, choice.sku, price));
    try {
      const r = await fetch(`${API}/create-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: op.provider_code,
          sku: choice.sku,
          ...(choice.kind === "credit" ? { amount: choice.amount } : {}),
          msisdn: msisdn(),
          email: email.trim(),
          lang,
          // The campaign that brought the buyer; the order record is the source of truth for reports.
          ...checkoutAttribution(country.slug, lang),
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (d.code === "invalid_number") setErrors({ number: d.error || t.errNumber });
        else setFormError(d.code === "rate_limited" ? t.errBusy : d.error || t.errGeneric);
        return;
      }
      setIntent(d);
      const Stripe = await loadStripe();
      const stripe = Stripe(d.publishableKey, { locale: lang });
      const elements = stripe.elements({
        clientSecret: d.clientSecret,
        appearance: { theme: "night", variables: { colorPrimary: "#5EEAD4", colorBackground: "#161616", colorText: "#F4F4F5", borderRadius: "12px" } },
      });
      stripeRef.current = { stripe, elements };
      setStep("pay");
      requestAnimationFrame(() => {
        if (payRef.current) elements.create("payment", { layout: "tabs" }).mount(payRef.current);
      });
    } catch {
      setFormError(t.errGeneric);
    } finally {
      setBusy(false);
    }
  }

  async function pay() {
    if (!stripeRef.current || !intent) return;
    setBusy(true);
    setFormError(null);
    const { stripe, elements } = stripeRef.current;
    const res = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        receipt_email: email.trim(),
        return_url: `${location.origin}${location.pathname}?order=${encodeURIComponent(intent.orderId)}`,
      },
    });
    if (res.error) {
      setBusy(false);
      setFormError(res.error.message || t.errGeneric);
      return;
    }
    setStep("result");
    poll(intent.orderId);
  }

  function poll(orderId: string, tries = 0) {
    setResult({ status: "processing", orderId });
    getJson<{ status: string }>(`${API}/order/${encodeURIComponent(orderId)}`)
      .then((o) => {
        if (o.status === "delivered" || o.status === "failed" || tries > 30) {
          setBusy(false);
          setResult({ status: o.status === "delivered" || o.status === "failed" ? o.status : "pending", orderId });
        } else setTimeout(() => poll(orderId, tries + 1), 2000);
      })
      .catch(() => (tries > 30 ? setResult({ status: "pending", orderId }) : setTimeout(() => poll(orderId, tries + 1), 2000)));
  }

  function restart() {
    setStep("form");
    setIntent(null);
    setResult(null);
    setNumber("");
    stripeRef.current = null;
  }

  const canonical = `${TOPUP_BASE}/${country.slug}/${lang}`;
  // The client's FAQ (8 questions per language), with country-specific overrides.
  const faqOverride = ((FAQ.overrides as Record<string, Record<string, Record<string, string>>>)[country.iso] ?? {})[lang] ?? {};
  const faq = (FAQ.faqs as Record<string, string[][]>)[lang].map(([q, a], i) => ({
    q: fill(faqOverride[`faq${i + 1}_q`] ?? q, vars),
    a: fill(faqOverride[`faq${i + 1}_a`] ?? a, vars),
  }));
  const card = "rounded-2xl border border-white/10 bg-[#141414]";
  const label = "mb-3 text-sm font-semibold text-zinc-300";

  return (
    <div dir={t.dir} lang={lang} className="min-h-screen w-full overflow-y-auto bg-[#0A0A0A] text-zinc-100" style={{ height: "100vh" }}>
      <Seo title={fill(t.title, vars)} description={fill(t.description, vars)} canonicalPath={canonical}>
        {TOPUP_LANGS.map((l) => (
          <link key={l} rel="alternate" hrefLang={l} href={`https://www.integri.app${TOPUP_BASE}/${country.slug}/${l}`} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`https://www.integri.app${TOPUP_BASE}/${country.slug}/en`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          })}
        </script>
      </Seo>

      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <a href="/" className="text-lg font-extrabold tracking-tight text-white">integri</a>
          <LanguageMenu country={country} lang={lang} label={t.language} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-8">
        {/* Hero */}
        <div className="mb-6 text-center">
          <div className="text-5xl leading-none" aria-hidden>{flag(country.iso)}</div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{fill(t.h1, vars)}</h1>
          <p className="mx-auto mt-3 max-w-xl text-zinc-400">{fill(t.sub, vars)}</p>
        </div>

        {step === "form" && (
          <form onSubmit={submit} noValidate className={cn(card, "space-y-7 p-5 sm:p-6")}>
            {/* 1. Operator */}
            <section>
              <h2 className={label}>1 · {t.stepOperator}</h2>
              {!operators && !opError && <Loading text={t.loading} />}
              {opError && <p className="text-sm text-red-400">{opError}</p>}
              {operators && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {operators.map((o) => (
                    <button
                      key={o.provider_code}
                      type="button"
                      onClick={() => { setOp(o); setErrors((e) => ({ ...e, op: "" })); trackEvent("select_item", opParams(o)); }}
                      aria-pressed={op?.provider_code === o.provider_code}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border p-3 transition-colors hover:cursor-pointer",
                        op?.provider_code === o.provider_code ? "border-[#5EEAD4] bg-[#5EEAD4]/10" : "border-white/10 hover:border-white/25",
                      )}
                    >
                      <span className="flex h-10 w-full items-center justify-center rounded-lg bg-white px-2">
                        <OperatorLogo name={o.name} src={o.logo} />
                      </span>
                      <span className="text-sm font-semibold" dir="auto">{o.name}</span>
                    </button>
                  ))}
                </div>
              )}
              <FieldError msg={errors.op} />
            </section>

            {/* 2. Amount */}
            {!op && (
              <section>
                <h2 className={label}>2 · {t.stepAmount}</h2>
                <p className="text-sm text-zinc-500">↑ {t.errOperator}</p>
              </section>
            )}
            {op && (
              <section>
                <h2 className={label}>2 · {t.stepAmount}</h2>
                {prodState === "loading" && <Loading text={t.loading} />}
                {(prodState === "error" || prodState === "busy") && (
                  <p className="text-sm text-red-400">{prodState === "busy" ? t.errBusy : t.errGeneric}</p>
                )}
                {products && !credit && products.bundles.length === 0 && <p className="text-sm text-zinc-400">{t.noProducts}</p>}

                {credit && (
                  <div className="mb-4">
                    <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">{t.credit}</p>
                    <div className="flex flex-wrap gap-2">
                      {credit.suggested_chips.map((v) => {
                        const on = choice?.kind === "credit" && choice.amount === v && !customAmt;
                        return (
                          <button key={v} type="button" aria-pressed={on}
                            onClick={() => { setCustomAmt(""); setChoice({ kind: "credit", sku: credit.sku_code, amount: v }); trackAmount(credit.sku_code, v); }}
                            className={cn("rounded-full border px-4 py-2 text-sm font-semibold hover:cursor-pointer", on ? "border-[#5EEAD4] bg-[#5EEAD4]/10 text-white" : "border-white/15 text-zinc-300 hover:border-white/30")}>
                            {eur(v)}
                          </button>
                        );
                      })}
                      <input
                        inputMode="decimal"
                        dir="ltr"
                        value={customAmt}
                        onChange={(e) => pickCustom(e.target.value)}
                        onBlur={() => choice?.kind === "credit" && customAmt && choice.amount >= credit.min && choice.amount <= credit.max && trackAmount(choice.sku, choice.amount)}
                        placeholder={t.otherAmount}
                        aria-label={t.otherAmount}
                        className="w-36 rounded-full border border-white/15 bg-transparent px-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#5EEAD4] focus:outline-none"
                      />
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">
                      {fill(t.between, { min: eur(credit.min), max: eur(credit.max) })}
                      {receive && <> · {fill(t.receives, { value: receive })}</>}
                    </p>
                  </div>
                )}

                {products && products.bundles.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">{t.bundles}</p>
                    <div className="grid max-h-80 gap-2 overflow-y-auto sm:grid-cols-2">
                      {products.bundles.map((b) => {
                        const on = choice?.kind === "bundle" && choice.sku === b.sku_code;
                        return (
                          <button key={b.sku_code} type="button" aria-pressed={on}
                            onClick={() => { setCustomAmt(""); setChoice({ kind: "bundle", sku: b.sku_code, price: b.price, name: b.name }); trackAmount(b.sku_code, b.price); }}
                            className={cn("flex items-center justify-between gap-3 rounded-xl border p-3 text-start hover:cursor-pointer", on ? "border-[#5EEAD4] bg-[#5EEAD4]/10" : "border-white/10 hover:border-white/25")}>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold" dir="auto">{b.name}</span>
                              {b.description && <span className="block truncate text-xs text-zinc-500" dir="auto">{b.description}</span>}
                            </span>
                            <span className="shrink-0 text-sm font-bold text-[#5EEAD4]" dir="ltr">{eur(b.price)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <FieldError msg={errors.amount} />
              </section>
            )}

            {/* 3. Number + email */}
            <section className="space-y-4">
              <div>
                <label htmlFor="tu-num" className={cn(label, "block")}>3 · {fill(t.stepNumber, vars)}</label>
                <div dir="ltr" className={cn("flex overflow-hidden rounded-xl border bg-transparent", errors.number ? "border-red-400" : "border-white/15 focus-within:border-[#5EEAD4]")}>
                  <span className="flex items-center gap-1.5 border-e border-white/10 px-3 text-sm font-semibold text-zinc-300">
                    <span aria-hidden>{flag(country.iso)}</span>{country.dial}
                  </span>
                  <input id="tu-num" type="tel" inputMode="tel" autoComplete="tel-national" value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="min-w-0 flex-1 bg-transparent px-3 py-3 text-white focus:outline-none" />
                </div>
                <FieldError msg={errors.number} />
              </div>
              <div>
                <label htmlFor="tu-email" className="mb-2 block text-sm font-semibold text-zinc-300">{t.email}</label>
                <input id="tu-email" type="email" dir="ltr" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={cn("w-full rounded-xl border bg-transparent px-3 py-3 text-white placeholder:text-zinc-600 focus:outline-none", errors.email ? "border-red-400" : "border-white/15 focus:border-[#5EEAD4]")} />
                <p className="mt-1 text-xs text-zinc-500">{t.emailHint}</p>
                <FieldError msg={errors.email} />
              </div>
              <label className="flex items-start gap-3 text-sm text-zinc-400">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#5EEAD4]" />
                <span>
                  {t.consent.split(/(\{terms\}|\{privacy\})/).map((part, i) =>
                    part === "{terms}" ? <a key={i} href="/terms" target="_blank" rel="noopener" className="underline">{t.terms}</a>
                      : part === "{privacy}" ? <a key={i} href="/privacy-policy" target="_blank" rel="noopener" className="underline">{t.privacy}</a>
                      : part)}
                </span>
              </label>
              <FieldError msg={errors.consent} />
            </section>

            <div>
              <button type="submit" disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5EEAD4] py-3.5 font-bold text-[#0A0A0A] transition-opacity hover:cursor-pointer hover:opacity-90 disabled:opacity-60">
                {busy && <Loader2 size={18} className="animate-spin" />}
                {t.continue}{choice && price > 0 ? <span dir="ltr"> · {eur(price)}</span> : null}
              </button>
              {choice && price > 0 && (
                <p className="mt-2 text-center text-xs text-zinc-500">
                  + {t.fee} <span dir="ltr">{eur(fee)}</span> = {t.total} <span dir="ltr">{eur(Math.round((price + fee) * 100) / 100)}</span>
                </p>
              )}
              {formError && <p className="mt-3 text-center text-sm text-red-400">{formError}</p>}
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-zinc-500"><Lock size={12} /> {t.secure}</p>
            </div>
          </form>
        )}

        {step === "pay" && intent && (
          <div className={cn(card, "space-y-5 p-5 sm:p-6")}>
            <dl className="space-y-2 rounded-xl border border-white/10 bg-black/30 p-4 text-sm">
              <Row label={`${t.price} · ${op?.name ?? ""}`} value={eur(intent.bundleEur)} />
              <Row label={t.fee} value={eur(intent.feeEur)} />
              <div className="border-t border-white/10 pt-2"><Row label={t.total} value={eur(intent.totalEur)} strong /></div>
              <p className="pt-1 text-xs text-zinc-500" dir="ltr">{msisdn()}</p>
            </dl>
            <div ref={payRef} />
            <button type="button" onClick={pay} disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5EEAD4] py-3.5 font-bold text-[#0A0A0A] hover:cursor-pointer hover:opacity-90 disabled:opacity-60">
              {busy && <Loader2 size={18} className="animate-spin" />}
              {busy ? t.processing : fill(t.pay, { total: eur(intent.totalEur) })}
            </button>
            {formError && <p className="text-center text-sm text-red-400">{formError}</p>}
            <button type="button" onClick={() => { setStep("form"); setFormError(null); }} className="mx-auto block text-sm text-zinc-400 underline-offset-2 hover:cursor-pointer hover:underline">{t.change}</button>
          </div>
        )}

        {step === "result" && result && (
          <div className={cn(card, "space-y-3 p-6 text-center")} aria-live="polite">
            {result.status === "processing" ? (
              <Loading text={t.processing} />
            ) : (
              <>
                <div className={cn("mx-auto flex h-12 w-12 items-center justify-center rounded-full", result.status === "delivered" ? "bg-[#5EEAD4] text-black" : result.status === "failed" ? "bg-red-500/20 text-red-300" : "bg-white/10 text-zinc-200")}>
                  {result.status === "delivered" ? <Check /> : result.status === "failed" ? "!" : "…"}
                </div>
                <h2 className="text-xl font-bold">{result.status === "delivered" ? t.doneTitle : result.status === "failed" ? t.failTitle : t.pendingTitle}</h2>
                <p className="text-zinc-400">
                  {result.status === "delivered" ? fill(t.doneText, { number: msisdn() || "" }) : result.status === "failed" ? t.failText : t.pendingText}
                </p>
                <p className="text-xs text-zinc-500">{t.order}: {result.orderId}</p>
                <button type="button" onClick={restart} className="mt-2 rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold hover:cursor-pointer hover:border-white/30">{t.again}</button>
              </>
            )}
          </div>
        )}

        {/* FAQ + text */}
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold">{(FAQ.faqTitle as Record<string, string>)[lang]}</h2>
          <div className="divide-y divide-white/10 rounded-2xl border border-white/10">
            {faq.map((f) => (
              <details key={f.q} className="group p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold">
                  {f.q}<ChevronDown size={16} className="shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-sm leading-relaxed text-zinc-400">{fill(t.seo, vars)}</p>
        </section>

        {/* Other countries (internal links) */}
        <details className="mt-8 rounded-2xl border border-white/10 p-4">
          <summary className="cursor-pointer font-semibold">{t.otherCountries}</summary>
          <Link to={`${TOPUP_BASE}?lang=${lang}`} className="mt-3 inline-block text-sm font-semibold text-[#5EEAD4] hover:underline">
            {t.allCountries} →
          </Link>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-3">
            {countries.filter((c) => c.iso !== country.iso).map((c) => (
              <li key={c.iso}>
                <Link to={`${TOPUP_BASE}/${c.slug}/${lang}`} className="text-zinc-400 hover:text-white">
                  <span aria-hidden>{flag(c.iso)}</span> {countryName(c.iso, lang, c.name)}
                </Link>
              </li>
            ))}
          </ul>
        </details>

        <footer className="mt-10 text-center text-xs text-zinc-500">
          <a href="/terms" className="hover:text-zinc-300">{t.terms}</a> · <a href="/privacy-policy" className="hover:text-zinc-300">{t.privacy}</a> · support@integri.app
          {cookieSettingsAvailable() && (
            <> · <button type="button" onClick={openCookieSettings} className="hover:cursor-pointer hover:text-zinc-300">Cookies</button></>
          )}
        </footer>
      </main>
    </div>
  );
};

// ── Bits ────────────────────────────────────────────────────────────

/** Ding's operator logo; its name when Ding has no image (or it fails to load). */
const OperatorLogo: React.FC<{ name: string; src: string | null }> = ({ name, src }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <span className="truncate text-sm font-bold text-zinc-900" dir="auto">{name}</span>;
  return <img src={src} alt="" className="max-h-8 max-w-full object-contain" loading="lazy" onError={() => setFailed(true)} />;
};

const Loading: React.FC<{ text: string }> = ({ text }) => (
  <p className="flex items-center gap-2 text-sm text-zinc-400"><Loader2 size={16} className="animate-spin" /> {text}</p>
);

const FieldError: React.FC<{ msg?: string }> = ({ msg }) => (msg ? <p className="mt-2 text-sm text-red-400">{msg}</p> : null);

const Row: React.FC<{ label: string; value: string; strong?: boolean }> = ({ label, value, strong }) => (
  <div className="flex items-center justify-between gap-3">
    <dt className={strong ? "font-bold text-white" : "text-zinc-400"}>{label}</dt>
    <dd className={strong ? "font-extrabold text-[#5EEAD4]" : "font-semibold"} dir="ltr">{value}</dd>
  </div>
);

const LanguageMenu: React.FC<{ country: Country; lang: Lang; label: string }> = ({ country, lang, label }) => (
  <label className="relative flex items-center gap-2 text-sm text-zinc-300">
    <span className="sr-only">{label}</span>
    <select
      value={lang}
      onChange={(e) => { window.location.href = `${TOPUP_BASE}/${country.slug}/${e.target.value}${window.location.search}`; }}
      className="appearance-none rounded-full border border-white/15 bg-transparent py-1.5 pe-8 ps-3 hover:cursor-pointer focus:outline-none"
    >
      {TOPUP_LANGS.map((l) => <option key={l} value={l} className="bg-[#141414]">{STRINGS[l].langName}</option>)}
    </select>
    <ChevronDown size={14} className="pointer-events-none absolute end-3" />
  </label>
);

export default MobileTopUpPage;
