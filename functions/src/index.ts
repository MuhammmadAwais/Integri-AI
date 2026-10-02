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

import { parseRoute } from "./routes";
import { fetchSeoData, renderPreview } from "./seo";
import { getTemplate } from "./template";

initializeApp();

/** 24h at the CDN, refreshed in the background for an hour after that. */
const CACHE_HIT = "public, max-age=0, s-maxage=86400, stale-while-revalidate=3600";
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

    // The static shell is the fallback for every failure path below: the page
    // still works, it just carries the site-wide preview instead of the
    // article's. Only a template fetch failure can produce a 500.
    let template: string;
    try {
      template = await getTemplate(origin);
    } catch (err) {
      logger.error("Could not load index.html template", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const route = parseRoute(req.path, req.query as Record<string, unknown>);
    if (!route) {
      logger.info(`No article route matched ${req.path}; serving static shell`);
      send(template, CACHE_MISS);
      return;
    }

    try {
      const seo = await fetchSeoData(route, lang);
      if (!seo) {
        logger.info(`${route.collection}/${route.key} not found; serving static shell`);
        send(template, CACHE_MISS);
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
