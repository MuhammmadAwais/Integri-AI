import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { languageMetadata } from "../../../i18n";

/*
 * News language, kept apart from the site's UI language: every story carries
 * its own set of translations (headline/content maps keyed by language code),
 * so readers can read news in any language the story has without switching
 * the whole interface. The pick lives in ?lang= (shareable) and is remembered
 * in this browser.
 */

const RTL = new Set(["ar", "fa", "ur", "ps", "he", "ku", "sd", "yi", "dv"]);
const STORAGE_KEY = "integri_news_lang";

const base = (code: string) => code.toLowerCase().split("-")[0];

export const isRtl = (code: string) => RTL.has(base(code));

/** Native name, e.g. "ur" → "اردو", "de" → "Deutsch". */
export function nativeLanguageName(code: string): string {
  // The site's own list first: it has names some browsers lack (پښتو, Soomaali).
  const known = (languageMetadata as Record<string, { name: string } | undefined>)[code];
  if (known) return known.name;
  try {
    const name = new Intl.DisplayNames([code], { type: "language" }).of(code);
    if (name && name !== code) return name.charAt(0).toLocaleUpperCase(code) + name.slice(1);
  } catch {
    // Unknown code — fall through.
  }
  return code.toUpperCase();
}

/** A–Z by English name, so the list reads the same for every story. */
export function sortLanguages(codes: string[]): string[] {
  let names: Intl.DisplayNames | null = null;
  try {
    names = new Intl.DisplayNames(["en"], { type: "language" });
  } catch {
    // Fall back to the codes.
  }
  const label = (c: string) => names?.of(c) ?? c;
  return [...codes].sort((a, b) => label(a).localeCompare(label(b)));
}

/** Language codes a story is published in (its headline translations). */
export function articleLanguages(article: { headline?: Record<string, string> } | null | undefined): string[] {
  const h = article?.headline;
  if (!h || typeof h !== "object") return [];
  return Object.keys(h).filter((k) => typeof h[k] === "string" && h[k].trim());
}

/**
 * Best language to show from `available`: the first of `preferred` that the
 * story has (exact, then base code: "pt-BR" → "pt"), else English, else the
 * first one.
 */
export function pickLanguage(available: string[], ...preferred: Array<string | null | undefined>): string {
  if (available.length === 0) return preferred.find(Boolean) ?? "en";
  for (const p of preferred) {
    if (!p) continue;
    if (available.includes(p)) return p;
    const match = available.find((a) => base(a) === base(p));
    if (match) return match;
  }
  return available.includes("en") ? "en" : available[0];
}

function readStored(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * The reader's preferred news language, in priority order: ?lang=, their
 * saved pick, the site UI language. `setLanguage` updates the URL and
 * remembers the pick.
 */
export function useNewsLanguage() {
  const [params, setParams] = useSearchParams();
  const { i18n } = useTranslation();
  const urlLang = params.get("lang");
  const preferred = [urlLang, readStored(), i18n.language];

  const setLanguage = useCallback(
    (code: string) => {
      try {
        localStorage.setItem(STORAGE_KEY, code);
      } catch {
        // Storage blocked — the URL still carries the pick.
      }
      const next = new URLSearchParams(params);
      next.set("lang", code);
      setParams(next, { replace: true });
    },
    [params, setParams]
  );

  return { preferred, setLanguage };
}
