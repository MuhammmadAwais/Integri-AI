# Social / SEO previews on Firebase Hosting

When the site moved from Vercel to Firebase Hosting, the crawler-facing preview
routes were lost. `vercel.json` matched on `user-agent` and rewrote ~15 paths to
two edge functions (`api/preview.ts`, `api/home-preview.ts`); `firebase.json`
arrived with only `** -> /index.html`, so every crawler got the site-wide
Open Graph card. Firebase Hosting cannot condition a rewrite on User-Agent, so
the two functions are replaced by two different mechanisms.

## Article routes -> `ssrPreview` (this function)

`/news/:id`, `/articles/:id` and `/blog/:slug` are rewritten to `ssrPreview`,
which reads the document from Firestore and injects that article's
`title`/`description`/`og:`/`twitter:` tags into the built `index.html`.

The same HTML goes to **every** client regardless of User-Agent. Crawlers read
the injected tags; browsers boot the React bundle exactly as they would from the
static file. This matters for two reasons:

- Hosting's CDN cannot vary a cached response on User-Agent, so a UA-conditional
  response would have to be `no-store` — every visitor would pay a function
  round-trip. As it is, responses are cacheable (`s-maxage=86400`).
- Serving crawlers different markup than people is cloaking, which Google
  penalises.

Firestore is read through `firebase-admin` using the function's own service
account, so unlike the Vercel version no web API key is embedded anywhere.

### Legacy share links

Older builds of the Flutter app shared `/News/:id`, `/News/:collection/:id`,
`/Article/:id` and `/share/news/:id?collection=…`. None of those are real React
Router routes, so they fell through the SPA catch-all to `/`. `ssrPreview` still
resolves them, declares the canonical lowercase URL, and emits a small inline
script that moves browsers to the real route. The app now shares canonical URLs
(`lib/utills/share_links.dart` in the Integri_backend repo), and
`parseNewsLink` there accepts the same legacy shapes for universal links.

## Marketing routes -> static files at build time

`/`, `/agents`, `/subscriptions`, `/help`, `/news`, `/blog`, `/playground`,
`/voice`, `/pdf` and `/imageGen` have no dynamic content, so there is no reason
to run a function for them. `scripts/prerender-seo.mjs` runs after `vite build`
and writes `dist/<route>/index.html` for each, with that page's own `<head>` and
its copy inside the two crawler shells in `index.html`. Hosting serves them from
the CDN at zero function cost.

The metadata lives in `scripts/seo-pages.mjs`, ported from `api/home-preview.ts`.

`"trailingSlash": false` in `firebase.json` is required: without it Hosting
301-redirects `/agents` to `/agents/` because a directory index now exists,
which rewrites every shared marketing URL.

## Deploying

The function and the Hosting config must both be live for previews to work —
the rewrites that route to `ssrPreview` are part of the Hosting config.

```bash
# 1. the function (safe on its own; nothing routes to it until hosting ships)
firebase deploy --only functions:previews

# 2. the site
npm run build
firebase deploy --only hosting
```

Always scope function deploys to `functions:previews`. The Flutter backend
deploys a separate `recharge` codebase into the same Firebase project from the
`Integri_backend` repo; an unscoped `firebase deploy --only functions` from
either repo risks the CLI offering to delete the other codebase's functions.

To check a change before it reaches production:

```bash
firebase hosting:channel:deploy seo-previews --expires 7d
curl -s -A "Twitterbot/1.0" <channel-url>/news/<real-doc-id> | grep -E 'og:(title|image)'
```

Use a document id that actually exists. A missing id makes `ssrPreview` fall
back to the static shell with the site-wide card, which looks identical to the
bug it fixes — that is what made the original regression report ambiguous.
