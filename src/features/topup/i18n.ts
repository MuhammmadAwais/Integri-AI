import { useEffect, useState } from "react";
import { TOPUP_LANGS as LANG_CODES, LANG_NAMES, OPERATORS, loaders } from "virtual:topup-i18n";
// Types only: the texts themselves are loaded one language at a time (see loadLangPack).
import type STRINGS from "./strings.json";

/*
 * The shop's page texts for 100+ languages are ~650 KB. Each language is its own
 * chunk (vite.config.ts, topupI18nPlugin), fetched when a page in that language
 * opens. The list of languages and their names (for the language menu) and the
 * operator names are small and always bundled.
 */

export type Strings = (typeof STRINGS)["en"];
export type TopUpLang = keyof typeof STRINGS;

/** One language's texts as the pages use them. */
export interface LangPack {
  t: Strings;
  faqTitle: string;
  /** 8 x [question, answer] */
  faqs: string[][];
  /** Country-specific FAQ answers: { ISO: { faq7_a: "..." } } */
  overrides: Record<string, Record<string, string>>;
}

export const TOPUP_LANGS = LANG_CODES as TopUpLang[];
/** Each language's own name, for the language menu. */
export { LANG_NAMES, OPERATORS };

const loaded = new Map<string, LangPack>();
const loading = new Map<string, Promise<LangPack>>();

export function loadLangPack(lang: TopUpLang): Promise<LangPack> {
  const done = loaded.get(lang);
  if (done) return Promise.resolve(done);
  let promise = loading.get(lang);
  if (!promise) {
    promise = loaders[lang]()
      .then((m) => {
        const pack = m.default as LangPack;
        loaded.set(lang, pack);
        return pack;
      })
      .finally(() => loading.delete(lang));
    loading.set(lang, promise);
  }
  return promise;
}

/**
 * The texts of [lang]: null until its chunk has arrived. When the language changes
 * (hub page) the previous texts stay on screen until the new ones are there.
 * `failed` when the chunk could not be fetched (offline, a deploy replaced it).
 */
export function useLangPack(lang: TopUpLang): { pack: LangPack | null; failed: boolean } {
  const [pack, setPack] = useState<LangPack | null>(() => loaded.get(lang) ?? null);
  const [failedLang, setFailedLang] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadLangPack(lang).then(
      (p) => !cancelled && setPack(p),
      () => !cancelled && setFailedLang(lang)
    );
    return () => {
      cancelled = true;
    };
  }, [lang]);
  return { pack, failed: failedLang === lang };
}
