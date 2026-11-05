/** Provided by topupI18nPlugin in vite.config.ts; used through ./i18n.ts. */
declare module "virtual:topup-i18n" {
  export const TOPUP_LANGS: string[];
  export const LANG_NAMES: Record<string, string>;
  /** ISO country code -> the client's operator names. */
  export const OPERATORS: Record<string, string[]>;
  /** One lazy chunk per page language. */
  export const loaders: Record<string, () => Promise<{ default: unknown }>>;
}
