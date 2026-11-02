import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronDown, Search } from "lucide-react";
import Seo from "../Components/seo/Seo";
import COUNTRIES from "../features/topup/countries.json";
import STRINGS from "../features/topup/strings.json";
import FAQ from "../features/topup/faq.json";
import ALIASES from "../features/topup/aliases.json";
import { TOPUP_BASE, TOPUP_LANGS, countryName, fill, flag, initTracking, preferredTopUpLang, type TopUpLang } from "../features/topup/shop";

/*
 * /shopping/mobile-top-up — every country the shop sells, searchable, in the
 * visitor's language (?lang= or the browser language). Each tile links to
 * /shopping/mobile-top-up/{country}/{lang}.
 */

interface Country { iso: string; slug: string; name: string; operators: string }
const countries = COUNTRIES as Country[];

/** Shown first: where most of Integri's top-ups go. */
const POPULAR = ["SY", "SD", "PK", "TR", "EG", "MA", "DZ", "AF", "IQ", "NG", "IN", "BD"];

/** Other names a country is searched by ("turkey" -> Türkiye, "uae"). */
const otherNames: Record<string, string[]> = {};
for (const [alias, slug] of Object.entries(ALIASES as Record<string, string>)) {
  (otherNames[slug] ??= []).push(alias.replace(/-/g, " "));
}

/** Lower case, no accents, for matching "turkiye" to "Türkiye". */
const norm = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();

const MobileTopUpIndexPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const fromUrl = params.get("lang") as TopUpLang | null;
  const lang: TopUpLang = fromUrl && TOPUP_LANGS.includes(fromUrl) ? fromUrl : preferredTopUpLang();
  const t = STRINGS[lang];
  const [query, setQuery] = useState("");

  // Campaign capture (and GTM) when the hub is reached inside the app.
  useEffect(() => initTracking(), []);

  const count = new Intl.NumberFormat(lang).format(countries.length);
  const operatorsOf = (c: Country) =>
    ((FAQ.operators as Record<string, string[]>)[c.iso] ?? c.operators.split(", ")).slice(0, 3).join(", ");

  // Localized names, sorted the way the language sorts.
  const list = countries
    .map((c) => ({ ...c, local: countryName(c.iso, lang, c.name) }))
    .sort((a, b) => a.local.localeCompare(b.local, lang));

  const q = norm(query.trim());
  const shown = q
    ? list.filter((c) =>
        [c.local, c.name, c.slug, c.iso, countryName(c.iso, "ar", c.name), c.operators, ...(otherNames[c.slug] ?? [])].some((s) =>
          norm(s).includes(q)
        )
      )
    : list;
  const popular = POPULAR.map((iso) => list.find((c) => c.iso === iso)).filter(Boolean) as typeof list;

  // A–Z groups by the first letter of the localized name.
  const groupMap = new Map<string, typeof list>();
  for (const c of shown) {
    const letter = c.local.charAt(0).toLocaleUpperCase(lang);
    groupMap.set(letter, [...(groupMap.get(letter) ?? []), c]);
  }
  const groups = [...groupMap.entries()];

  const tile = (c: (typeof list)[number]) => (
    <li key={c.iso}>
      <Link
        to={`${TOPUP_BASE}/${c.slug}/${lang}`}
        className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#141414] p-3 transition-colors hover:border-[#5EEAD4]/60 hover:bg-[#5EEAD4]/5"
      >
        <span className="text-2xl leading-none" aria-hidden>{flag(c.iso)}</span>
        <span className="min-w-0">
          <span className="block truncate font-semibold text-white">{c.local}</span>
          <span className="block truncate text-xs text-zinc-500" dir="auto">{operatorsOf(c)}</span>
        </span>
      </Link>
    </li>
  );

  return (
    <div dir={t.dir} lang={lang} className="w-full overflow-y-auto bg-[#0A0A0A] text-zinc-100" style={{ height: "100vh" }}>
      <Seo
        title={fill(t.indexTitle, { count })}
        description={fill(t.indexDescription, { count })}
        canonicalPath={TOPUP_BASE}
      />

      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <a href="/" className="text-lg font-extrabold tracking-tight text-white">integri</a>
          <label className="relative flex items-center text-sm text-zinc-300">
            <span className="sr-only">{t.language}</span>
            <select
              value={lang}
              onChange={(e) => setParams({ lang: e.target.value }, { replace: true })}
              className="appearance-none rounded-full border border-white/15 bg-transparent py-1.5 pe-8 ps-3 hover:cursor-pointer focus:outline-none"
            >
              {TOPUP_LANGS.map((l) => <option key={l} value={l} className="bg-[#141414]">{STRINGS[l].langName}</option>)}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute end-3" />
          </label>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-10">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{t.indexH1}</h1>
          <p className="mx-auto mt-3 max-w-xl text-zinc-400">{fill(t.indexSub, { count })}</p>
        </div>

        <div className="relative mx-auto mt-8 max-w-xl">
          <Search size={18} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-zinc-500" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search}
            aria-label={t.search}
            autoComplete="off"
            className="w-full rounded-full border border-white/15 bg-[#141414] py-3.5 pe-4 ps-11 text-white placeholder:text-zinc-500 focus:border-[#5EEAD4] focus:outline-none"
          />
        </div>

        {!q && popular.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">{t.popular}</h2>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">{popular.map(tile)}</ul>
          </section>
        )}

        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            {t.allCountries} <span className="text-zinc-600">({new Intl.NumberFormat(lang).format(shown.length)})</span>
          </h2>
          {shown.length === 0 && <p className="py-10 text-center text-zinc-500">{t.noResults}</p>}
          <div className="space-y-6">
            {groups.map(([letter, items]) => (
              <div key={letter}>
                <h3 className="mb-2 text-lg font-bold text-[#5EEAD4]">{letter}</h3>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">{items.map(tile)}</ul>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-14 text-center text-xs text-zinc-500">
          <a href="/terms" className="hover:text-zinc-300">{t.terms}</a> · <a href="/privacy-policy" className="hover:text-zinc-300">{t.privacy}</a> · support@integri.app
        </footer>
      </main>
    </div>
  );
};

export default MobileTopUpIndexPage;
