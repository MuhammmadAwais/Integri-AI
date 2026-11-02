/**
 * Rewrites the enterprise landing site's URLs for where it is hosted:
 * integri.app/enterprise (languages at /enterprise/de, /enterprise/ar, …).
 *
 * The client's files assume they sit at the site root:
 *   https://www.integri.app/          -> https://www.integri.app/enterprise
 *   https://www.integri.app/de/       -> https://www.integri.app/enterprise/de
 *   /assets/… , …integri.app/assets/  -> /enterprise/assets/…
 * Links into the app (/signup, /news, /subscriptions, …) are left alone, as are
 * the Organization / WebSite ids in the JSON-LD, which describe the whole site.
 * Language URLs also lose their trailing slash: Hosting runs with
 * trailingSlash: false, and a canonical/hreflang that redirects is ignored.
 *
 * Used by scripts/install-landing.mjs (build) and vite.config.ts (dev).
 */

export const LANDING_BASE = "/enterprise";

const ORIGIN = "https://www.integri.app";

/** "Chat on the web" button text per landing language (html lang attribute). */
const CHAT_NOW = {
  en: "Chat on the web now", ar: "دردش الآن على الويب", bg: "Чат в браузъра сега",
  cs: "Chatuj hned na webu", da: "Chat på nettet nu", de: "Jetzt im Web chatten",
  el: "Συνομίλησε τώρα στο web", es: "Chatea ahora en la web", et: "Vestle kohe veebis",
  fi: "Keskustele nyt verkossa", fr: "Discuter maintenant sur le web", hr: "Razgovaraj odmah na webu",
  hu: "Csevegj most a weben", it: "Chatta ora sul web", ja: "今すぐWebでチャット",
  ko: "지금 웹에서 채팅하기", lt: "Kalbėkis dabar internete", lv: "Tērzē tagad tīmeklī",
  nb: "Chat på nettet nå", nl: "Nu chatten op het web", pl: "Czatuj teraz w przeglądarce",
  pt: "Converse agora na web", ro: "Chat acum pe web", ru: "Начать чат в браузере",
  sk: "Chatuj hneď na webe", sl: "Klepetaj zdaj na spletu", sr: "Ćaskaj odmah na vebu",
  sv: "Chatta på webben nu", tr: "Hemen web'de sohbet et", uk: "Почати чат у браузері",
  ur: "ابھی ویب پر چیٹ کریں",
};

/**
 * Link changes on top of the client's copy:
 *  - a "chat on the web" button in the hero, next to "Start free", so a
 *    visitor can try Integri without an account (the chat is at "/");
 *  - Terms and Privacy point to integri.app instead of the old Google Sites.
 */
function applyLinks(text) {
  const lang = (text.match(/<html[^>]*\slang="([a-zA-Z-]+)"/)?.[1] ?? "en").toLowerCase().split("-")[0];
  const label = CHAT_NOW[lang] ?? CHAT_NOW.en;
  return text
    .replace(/https:\/\/sites\.google\.com\/view\/integriterms/g, `${ORIGIN}/terms`)
    .replace(/https:\/\/sites\.google\.com\/view\/integriapps/g, `${ORIGIN}/privacy-policy`)
    .replace(
      /(<div class="cta-row">\s*<a [^>]*class="btn btn-mint"[^>]*>[^<]*<\/a>)/,
      `$1\n        <a href="${ORIGIN}/" class="btn btn-ghost">${label}</a>`
    );
}

export function transformLanding(text, langs) {
  const langAlt = langs.join("|");
  const langUrl = new RegExp(`(${ORIGIN.replace(/\./g, "\\.")})?/(${langAlt})/(?=["'#?<\\s])`, "g");
  const rootUrl = new RegExp(`${ORIGIN.replace(/\./g, "\\.")}/(?=["'?<\\s])`, "g");

  const fix = (chunk, { root }) => {
    let out = chunk
      .replace(langUrl, (_, origin = "", lang) => `${origin}${LANDING_BASE}/${lang}`)
      .replace(/(https:\/\/www\.integri\.app)?\/assets\//g, (_, origin = "") => `${origin}${LANDING_BASE}/assets/`);
    if (root) out = out.replace(rootUrl, `${ORIGIN}${LANDING_BASE}`);
    return out.replace(`${ORIGIN}/#webpage`, `${ORIGIN}${LANDING_BASE}#webpage`);
  };

  // JSON-LD keeps site-level urls (Organization, WebSite); everything else is page-level.
  const moved = text
    .split(/(<script type="application\/ld\+json">[\s\S]*?<\/script>)/g)
    .map((part) => fix(part, { root: !part.startsWith('<script type="application/ld+json">') }))
    .join("");
  // After the move to /enterprise, so the chat button keeps pointing at "/".
  return moved.includes("<html") ? applyLinks(moved) : moved;
}
