# Campaign and purchase tracking: top-up pages

Implements "Campaign and Purchase Tracking Spec" (22 Oct 2026) for
`/shopping/mobile-top-up/**`, `/syria` and `/sudan`.

## Done in this repo (frontend)

| Spec | Where |
|---|---|
| Step 1: redirects keep the query string | `functions/src/index.ts` (country/alias redirects), `MobileTopUpPage.tsx` (`<Navigate>`, language menu), Syria/Sudan language links (`lang` and Stripe return params are dropped, the campaign is kept) |
| Step 2: capture `first` / `last`, 30 days, 200 chars, allow-listed keys, try/catch | `public/tracking/integri-tracking.js` (`integri_attr` in localStorage). Loaded in `index.html` and the 4 Syria/Sudan pages; only acts on the top-up paths |
| Step 2: GA4 client ID from `_ga` | same file, `gaClientId()` |
| Step 3: `attribution`, `ga_client_id`, `page_country`, `page_language` in `POST /recharge/web/create-intent` | React shop, Syria, Sudan (`attribution: null` when there is no campaign) |
| Step 5.1 rule 4: browser never sends `purchase` | browser `purchase` / Ads `conversion` calls removed from Syria/Sudan |
| Step 6: dataLayer `view_item_list`, `select_item`, `add_to_cart`, `begin_checkout` | React shop, Syria, Sudan |
| Step 6: GTM + Consent Mode v2 + banner (10 languages, Accept/Reject equal, "Cookies" link in the shop footer) | `integri-tracking.js`, container `GTM-K6CLWQ8D` (`GTM_ID` at the top of the file). Do not also paste Google's GTM snippet: it would load GTM before the consent defaults |

## To switch on (Marketing / Admin)

1. GTM container `GTM-K6CLWQ8D` is set in `public/tracking/integri-tracking.js`.
   The `<noscript>` iframe is left out on purpose: it fires without consent.
2. In GTM: GA4 tag for the Integri GA4 property (web stream for integri.app),
   GA4 event tags for the four dataLayer events (ecommerce from the dataLayer).
   Leave consent checks on.
3. GA4 Admin: custom dimensions `country`, `operator_group`, `page_language`
   (event scope). Create a Measurement Protocol API secret (Data streams → web
   stream) for the backend.
4. Google Ads: import the GA4 `purchase` as the **primary** conversion, with
   value (option A). Do not also upload click conversions as primary.

## To do in the rechargeWeb backend (not in this repo)

**Use [backend-tasks.md](backend-tasks.md)**: written against the real backend
(`~/StudioProjects/Integri_backend/functions`), it supersedes the generic notes below.

`rechargeWeb-attribution.ts` in this folder is a drop-in module:

- **create-intent**: `orderTrackingFields(req.body)` → merge into the order
  (validated attribution, `campaign` = last `utm_campaign` or `(none)`,
  `ga4_sent` / `ads_sent` false). Also store `operator_group`
  (`operatorGroup(name, country)`), `product_type`, `price_eur`, `fee_eur`,
  `cost_eur`, `margin_eur`. Put `stripeMetadata(order)` on the PaymentIntent.
  The endpoint must accept the new body keys (ignore unknown keys rather than
  reject them).
- **Webhook `payment_intent.succeeded`**: `status = "paid"`, then
  `sendPurchaseOnce(orderRef)` (claims `ga4_sent` in a transaction, so retries
  never double count). Env: `GA4_MEASUREMENT_ID`, `GA4_API_SECRET`.
- **Refund / failed delivery**: update `status`; reports count only `paid` and
  `delivered`.
- **After every status change**: `mirrorOrderAnalytics(db, order)` writes
  `order_analytics` without email, phone or other personal data. Stream only
  that collection to BigQuery.

## Reporting (Step 7)

Link GA4 → BigQuery (daily), install "Stream Firestore to BigQuery" on
`order_analytics`, and the Google Ads Data Transfer for cost. Base report:

```sql
SELECT campaign, country_iso, operator_group,
       COUNT(*) AS orders, SUM(price_eur) AS revenue_eur, SUM(margin_eur) AS margin_eur
FROM `PROJECT.analytics.order_analytics`
WHERE status IN ('paid', 'delivered')
GROUP BY campaign, country_iso, operator_group
ORDER BY revenue_eur DESC
```

## Test checklist status

- [x] 1. Test link saves `integri_attr` (checked on the dev server)
- [x] 2. Record stays across language switch / other countries
- [x] 3. `/syria` → `/syria/en` keeps the parameters (the page's redirect already kept them; the language links now do too)
- [ ] 4. Firestore order + Stripe metadata (needs the backend part)
- [ ] 5./6. GA4 DebugView, webhook retry (needs GTM ID + backend)
- [x] 7. Campaign A then B → `first` = A, `last` = B in the create-intent body
- [x] 8. No parameters → `attribution: null` (backend then stores `(none)`)
- [ ] 9. Google Ads test conversion
