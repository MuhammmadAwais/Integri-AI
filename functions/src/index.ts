/**
 * ssrPreview — per-article Open Graph tags for integri.app.
 *
 * Firebase Hosting rewrites the article routes here (see firebase.json). The
 * same HTML goes to every client regardless of User-Agent: crawlers read the
 * injected og:/twitter: tags, browsers boot the React bundle exactly as they
 * would from the static index.html. That keeps the response CDN-cacheable
 * (Hosting cannot vary a cached response on User-Agent) and avoids serving
 * crawlers different markup than people.
 *
 * Replaces the Vercel edge function api/preview.ts, which Hosting could not
 * carry over because its rewrites matched on User-Agent.
 */

import { initializeApp } from "firebase-admin/app";
import { logger } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";

import { parseRoute, relocate } from "./routes";
import { fetchSeoData, findCountryCollection, renderPreview } from "./seo";
import { getTemplate } from "./template";
import { GONE_NEWS_IDS } from "./gone";
import { renderSitemap } from "./newsSitemap";
import { renderTopUp } from "./topup";

initializeApp();

/** 1 h at the CDN (bounds any stale HTML after a deploy), refreshed in the background for 10 min after that. */
const CACHE_HIT = "public, max-age=0, s-maxage=3600, stale-while-revalidate=600";
/** Unresolved or failed renders: short, so a fix shows up quickly. */
const CACHE_MISS = "public, max-age=0, s-maxage=60";

function originOf(req: { headers: Record<string, unknown>; protocol?: string }): string {
  const forwarded = req.headers["x-forwarded-host"];
  const host =
    (typeof forwarded === "string" && forwarded.split(",")[0].trim()) ||
    (typeof req.headers.host === "string" && req.headers.host) ||
    "www.integri.app";
  const protocol = /^(localhost|127\.0\.0\.1|\[::1\])(:|$)/.test(host) ? "http" : "https";
  return `${protocol}://${host}`;
}

/** The app shell, marked noindex and without the homepage's canonical/title. */
function notFoundPage(template: string): string {
  return template
    .replace(/<link\s+[^>]*rel="canonical"[^>]*>/gi, "")
    .replace(/<meta\s+[^>]*name="robots"[^>]*>/gi, "")
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, "")
    .replace(/<title>[\s\S]*?<\/title>/i, "<title>Article not found | Integri News</title>")
    .replace(/<head(\s[^>]*)?>/i, (head) => `${head}\n    <meta name="robots" content="noindex" />`);
}

export const ssrPreview = onRequest(
  {
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 20,
    maxInstances: 20,
    invoker: "public",
  },
  async (req, res) => {
    const origin = originOf(req);
    const lang = typeof req.query.lang === "string" ? req.query.lang : "en";

    const send = (html: string, cacheControl: string) => {
      res.set("Content-Type", "text/html; charset=utf-8");
      res.set("Cache-Control", cacheControl);
      res.status(200).send(html);
    };

    // Removed on purpose (thin 2025 stories): 410 tells Google to drop them.
    const goneId = req.path.split("/").filter(Boolean).pop();
    if (goneId && GONE_NEWS_IDS.has(goneId)) {
      res.set("Cache-Control", "public, max-age=3600, s-maxage=86400");
      res.set("X-Robots-Tag", "noindex");
      res.status(410).send(
        '<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex">' +
        "<title>Gone | Integri News</title><p>This article has been removed. " +
        '<a href="/news">Read the latest news</a></p>'
      );
      return;
    }

    // The static shell is the fallback for every failure path below: the page
    // still works, it just carries the site-wide preview instead of the
    // article's. Only a template fetch failure is fatal, and it is retried:
    // during a Hosting deploy /index.html can briefly be unavailable.
    let template: string;
    try {
      template = await getTemplate(origin).catch(async () => {
        await new Promise((r) => setTimeout(r, 700));
        return getTemplate(origin);
      });
    } catch (err) {
      logger.error("Could not load index.html template", err);
      // 503 + Retry-After: a temporary condition Google retries, unlike a 500.
      res.set("Retry-After", "120");
      res.set("Cache-Control", "no-store");
      res.status(503).send("Service temporarily unavailable, please retry shortly.");
      return;
    }

    // Mobile top-up shop pages (/shopping/mobile-top-up/{country}/{lang}).
    if (req.path.startsWith("/shopping/")) {
      try {
        const accept = typeof req.headers["accept-language"] === "string" ? req.headers["accept-language"] : undefined;
        const topup = await renderTopUp(req.path, origin, template, accept);
        if (topup?.kind === "page") {
          send(topup.html, CACHE_HIT);
          return;
        }
        if (topup?.kind === "redirect") {
          // Keep the query string: utm_* / gclid on an ad link must survive the redirect.
          const q = req.originalUrl.indexOf("?");
          const location = topup.location + (q >= 0 ? req.originalUrl.slice(q) : "");
          if (topup.permanent) {
            res.set("Cache-Control", "public, max-age=3600, s-maxage=86400");
            res.redirect(301, location);
          } else {
            // Language depends on the visitor: never cached at the CDN.
            res.set("Cache-Control", "private, no-store");
            res.set("Vary", "Accept-Language");
            res.redirect(302, location);
          }
          return;
        }
        if (topup?.kind === "notFound") {
          res.set("Content-Type", "text/html; charset=utf-8");
          res.set("Cache-Control", "public, max-age=0, s-maxage=600");
          res.set("X-Robots-Tag", "noindex");
          res.status(404).send(notFoundPage(template));
          return;
        }
      } catch (err) {
        logger.error(`Top-up page render failed for ${req.path}`, err);
      }
      send(template, CACHE_MISS);
      return;
    }

    let route = parseRoute(req.path, req.query as Record<string, unknown>);
    if (!route) {
      logger.info(`No article route matched ${req.path}; serving static shell`);
      send(template, CACHE_MISS);
      return;
    }

    try {
      let seo = await fetchSeoData(route, lang);
      // Bare /news/<id> of a country story: find its collection, then point
      // the canonical (and browsers) at /news/<country>/<id>.
      if (!seo && route.firestoreCollection === "News") {
        const found = await findCountryCollection(route.key);
        if (found) {
          route = relocate(route, found);
          seo = await fetchSeoData(route, lang);
        }
      }
      if (!seo) {
        // A deleted (or never existing) story. Answering 200 with the
        // homepage's title and canonical made Google file thousands of these
        // as copies of the homepage. 404 + noindex lets it drop them cleanly;
        // the app still loads and shows its own "not found" screen.
        logger.info(`${route.collection}/${route.key} not found; 404`);
        res.set("Content-Type", "text/html; charset=utf-8");
        res.set("Cache-Control", "public, max-age=0, s-maxage=600");
        res.set("X-Robots-Tag", "noindex");
        res.status(404).send(notFoundPage(template));
        return;
      }

      logger.info(
        `Rendered ${route.collection}/${route.key} (lang=${lang}, legacy=${route.legacy}): "${seo.title}"`
      );
      send(renderPreview({ seo, route, origin, template }), CACHE_HIT);
    } catch (err) {
      logger.error(`Preview render failed for ${req.path}`, err);
      send(template, CACHE_MISS);
    }
  }
);

/** Live sitemaps (see newsSitemap.ts); Hosting rewrites /sitemap.xml and /sitemaps/news/** and google-news.xml here. */
export const newsSitemap = onRequest(
  { region: "us-central1", memory: "256MiB", timeoutSeconds: 60, maxInstances: 5, invoker: "public" },
  async (req, res) => {
    try {
      const page = await renderSitemap(req.path);
      if (!page) {
        res.set("Cache-Control", "public, max-age=0, s-maxage=600");
        res.status(404).send("Not found");
        return;
      }
      res.set("Content-Type", "application/xml; charset=utf-8");
      res.set("Cache-Control", page.cacheControl);
      if (page.lastModified) res.set("Last-Modified", page.lastModified.toUTCString());
      res.status(200).send(page.xml);
    } catch (err) {
      logger.error(`Sitemap failed for ${req.path}`, err);
      res.set("Retry-After", "300");
      res.status(503).send("Temporarily unavailable");
    }
  }
);
