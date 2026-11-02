# Backend tasks: campaign and purchase tracking

For: the `Integri_backend` Cloud Functions (`functions/src`, codebase `recharge`, region `europe-west1`).
From: "Campaign and Purchase Tracking Spec" (22 Oct 2026). The website side is finished
and waiting to deploy; it depends on task 1 below.

## What the website now sends

`POST /recharge/web/create-intent` gets these extra keys in the body, for the
shop (`provider` + `sku`) and the Syria / Sudan pages (`operator` + `bundle` / `amount`) alike:

```json
{
  "attribution": {
    "first": { "utm_source": "google", "utm_medium": "cpc", "utm_campaign": "ng_mtn_en_uk",
               "utm_content": "ad1", "gclid": "EAIaIQ...", "landing_page": "/shopping/mobile-top-up/nigeria/en",
               "referrer": "", "ts": "2026-10-26T10:00:00.000Z" },
    "last":  { "...same keys..." }
  },
  "ga_client_id": "123456789.1700000000",
  "page_country": "nigeria",
  "page_language": "en"
}
```

- `attribution` is `null` when the visitor came without campaign parameters.
- Possible touch keys: `utm_source utm_medium utm_campaign utm_content utm_term gclid gbraid wbraid fbclid landing_page referrer ts`, each value at most 200 characters.
- `ga_client_id` may be `null`. `page_country` is `syria`, `sudan` or a shop country slug (`nigeria`).
- The browser no longer sends a `purchase` event. The server must send it (task 5).

## Current state (checked 26 Oct 2026)

| Spec item | Today in the backend |
|---|---|
| Accepts the new fields | **No, with long values.** `web.ts:79` caps the body at 2048 bytes. A typical payload is ~930 bytes, but a long `utm_content` / referrer / `fbclid` reaches ~2,080 bytes and production answers `{"error":"Request too large."}`, so the buyer cannot pay. Otherwise unknown keys are ignored, nothing else rejects them |
| Campaign on the Firestore order | Not stored |
| Stripe metadata | Only `kind`, `order_id`, `uid` (`orders.ts:329`) and `channel` (`web.ts:358`) |
| `operator_name`, `product_type`, cost / margin | Operator name is only inside `title`; product type not stored; cost is `send_value_eur + ding_fee_eur`, not stored as such |
| GA4 purchase from the server | None |
| `order_analytics` for BigQuery | None |

Order states stay as they are (`created → paid → submitting → submitted → delivered | failed → refunded`, `expired`).
Do **not** rename `state` to `status`; the mapping to the spec's statuses is done only in `order_analytics` (task 4).

---

## Task 1 (blocker, ship first): raise the body limit

`functions/src/web.ts:79`

```ts
// Order fields (~0.5 KB) + campaign attribution (up to ~5 KB: two touches x 12 keys x 200 chars).
const MAX_BODY_BYTES = 8192;
```

Deploy this before the website goes live. With only this change, checkout keeps working and the new keys are ignored.

## Task 2: store the campaign on the order (`web.ts`)

Add next to the other helpers:

```ts
/** Campaign keys the page may send (tracking spec, Step 2). Anything else is dropped. */
const ATTR_KEYS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "gclid", "gbraid", "wbraid", "fbclid", "landing_page", "referrer", "ts",
];

function cleanTouch(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
  for (const k of ATTR_KEYS) {
    const v = (raw as Record<string, unknown>)[k];
    if (typeof v === "string" && v) out[k] = v.slice(0, 200);
  }
  return out;
}

/** Validated campaign fields for the order (spec Step 4.1, rules 1 and 4). */
function webTracking(body: Record<string, unknown>) {
  const raw = body.attribution as {first?: unknown; last?: unknown} | null | undefined;
  const first = cleanTouch(raw?.first);
  const last = cleanTouch(raw?.last);
  const ga = typeof body.ga_client_id === "string" && /^\d{1,20}\.\d{1,20}$/.test(body.ga_client_id) ?
    body.ga_client_id : null;
  const pageCountry = typeof body.page_country === "string" && /^[a-z0-9-]{2,64}$/.test(body.page_country) ?
    body.page_country : null;
  return {
    campaign: last.utm_campaign || "(none)",
    attribution: {first, last},
    ga_client_id: ga,
    page_country: pageCountry,
    ga4_sent: false,
    ads_sent: false,
  };
}
```

In `createIntent`, after `const lang = ...`:

```ts
const tracking = webTracking(body);
```

and extend the existing order update (`web.ts:351`):

```ts
getFirestore().collection(COLLECTIONS.orders).doc(order.order_id).update({
  channel: "web",
  web_page: page,
  email,
  page_language: lang,
  ...tracking,
  updated_at: FieldValue.serverTimestamp(),
}),
```

## Task 3: Stripe metadata (`orders.ts` + `web.ts`)

Spec: `order_id, campaign, utm_source, utm_medium, utm_content, gclid, country_iso, operator_code` on the PaymentIntent.

`orders.ts` `createOrder`: add an optional third parameter and two always-useful keys:

```ts
export async function createOrder(uid: string, data: Record<string, unknown>, extraMetadata: Record<string, string> = {}) {
  ...
  metadata: {
    kind: PAYMENT_KIND, order_id: orderRef.id, uid,
    country_iso: order.country_iso, operator_code: order.provider_code,
    ...extraMetadata,
  },
```

(The app's callable passes nothing, so app orders only gain `country_iso` / `operator_code`.)

`web.ts` `createIntent`: build the web metadata and pass it in; drop `metadata` from the later `paymentIntents.update` (keep `receipt_email`):

```ts
const last = tracking.attribution.last;
const meta: Record<string, string> = {channel: "web", campaign: tracking.campaign};
for (const k of ["utm_source", "utm_medium", "utm_content", "gclid"] as const) if (last[k]) meta[k] = last[k];
const order = await createOrder(uid, {quote_id: quote.quote_id}, meta);
...
stripe().paymentIntents.update(intentId, {receipt_email: email})
```

Values are already ≤ 200 chars and keys ≤ 40, inside Stripe's limits (50 keys, 500-char values).

## Task 4: operator, product type, cost and margin on the order (`orders.ts`)

In `createQuote`, add to the quote document (`orders.ts:243`):

```ts
operator_name: providerName,
product_type: isDataOnly(product) ? "data" : "airtime",
```

with a helper (Ding's `Benefits` are e.g. `["Mobile", "Minutes"]`, `["Data"]`):

```ts
const isDataOnly = (p: ding.DingProduct) => {
  const b = (p.Benefits ?? []).map((x) => x.toLowerCase());
  return b.includes("data") && !b.some((x) => ["mobile", "minutes", "sms", "talk", "airtime"].includes(x));
};
```

In `createOrder`, copy them onto the order (`orders.ts:292` doc):

```ts
operator_name: q.operator_name ?? null,
product_type: q.product_type ?? null,
```

Money fields: keep the existing ones, and let the analytics mirror (task 5) derive the spec fields:

| Spec field | From the order |
|---|---|
| `price_eur` | `total_eur` (what the buyer paid) |
| `fee_eur` | `service_fee_eur + ding_fee_eur` (the fee line the buyer sees) |
| `cost_eur` | `send_value_eur + ding_fee_eur` (what Ding takes from our balance); after delivery prefer `ding_price.SendValue + ding_price.DistributorFee` |
| `margin_eur` | `price_eur - cost_eur` (= our service fee; Stripe's processing fee is not included) |

## Task 5: one new function for GA4 purchase + BigQuery mirror

`recordPayment` runs from the webhook **and** from the fallbacks in `getOrder` and `reconcileOrders`,
so do not put the GA4 call there (each caller would need the secret). Use one Firestore trigger on
`recharge_orders` that reacts to every state change:

```ts
// functions/src/tracking.ts
import {onDocumentWritten} from "firebase-functions/v2/firestore";
import {defineSecret, defineString} from "firebase-functions/params";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import {logger} from "firebase-functions";
import {COLLECTIONS, REGION} from "./config";

const GA4_MEASUREMENT_ID = defineString("GA4_MEASUREMENT_ID");   // G-XXXXXXX
const GA4_API_SECRET = defineSecret("GA4_API_SECRET");          // GA4 Admin > Data streams > web > Measurement Protocol API secrets

const PAID_STATES = ["paid", "submitting", "submitted", "delivered"];

/** Spec status: pending | paid | delivered | failed | refunded (+ expired, never paid). */
function specStatus(state: string): string {
  if (state === "created") return "pending";
  if (state === "paid" || state === "submitting" || state === "submitted") return "paid";
  return state; // delivered, failed, refunded, expired
}

/** "MTN Nigeria Data" -> "mtn" (same rule as the website's dataLayer). */
function operatorGroup(name: string, countryIso: string): string {
  let s = String(name || "").toLowerCase();
  let country = "";
  try { country = new Intl.DisplayNames(["en"], {type: "region"}).of(countryIso) ?? ""; } catch { /* keep "" */ }
  if (country) s = s.split(country.toLowerCase()).join(" ");
  s = s.replace(/\b(data|bundles?|airtime|internet|top ?up|pinless|voice|credit|postpaid|prepaid)\b/g, " ").trim();
  return (s.split(/\s+/)[0] || String(name || "").toLowerCase()).replace(/[^a-z0-9]/g, "") || "unknown";
}

export const rechargeOrderTracking = onDocumentWritten(
  {document: `${COLLECTIONS.orders}/{orderId}`, region: REGION, secrets: [GA4_API_SECRET]},
  async (event) => {
    const after = event.data?.after;
    const o = after?.data();
    if (!after || !o || o.channel !== "web") return; // spec scope: website orders only

    const id = after.id;
    const price = Number(o.total_eur ?? 0);
    const dp = o.ding_price as {SendValue?: number; DistributorFee?: number} | null | undefined;
    const cost = dp?.SendValue !== undefined ?
      Number(dp.SendValue) + Number(dp.DistributorFee ?? 0) :
      Number(o.send_value_eur ?? 0) + Number(o.ding_fee_eur ?? 0);
    const group = operatorGroup(o.operator_name ?? "", o.country_iso ?? "");
    const status = specStatus(o.state);

    // 1. BigQuery mirror: no email, phone, msisdn, uid or any other personal data.
    await getFirestore().collection("order_analytics").doc(id).set({
      order_id: id,
      created_at: o.created_at ?? null,
      paid_at: o.paid_at ?? null,
      status,
      channel: "web",
      country_iso: o.country_iso ?? null,
      page_country: o.page_country ?? null,
      page_language: o.page_language ?? null,
      operator_code: o.provider_code ?? null,
      operator_name: o.operator_name ?? null,
      operator_group: group,
      product_sku: o.sku_code ?? null,
      product_type: o.product_type ?? null,
      price_eur: price,
      fee_eur: Number(o.service_fee_eur ?? 0) + Number(o.ding_fee_eur ?? 0),
      cost_eur: Math.round(cost * 100) / 100,
      margin_eur: Math.round((price - cost) * 100) / 100,
      stripe_payment_intent_id: o.stripe_payment_intent_id ?? null,
      campaign: o.campaign ?? "(none)",
      attribution: o.attribution ?? {first: {}, last: {}},
      updated_at: FieldValue.serverTimestamp(),
    });

    // 2. GA4 purchase, once per paid order (triggers are at-least-once).
    if (!PAID_STATES.includes(o.state) || o.ga4_sent) return;
    const claimed = await getFirestore().runTransaction(async (tx) => {
      const fresh = (await tx.get(after.ref)).data();
      if (!fresh || fresh.ga4_sent) return false;
      tx.update(after.ref, {ga4_sent: true});
      return true;
    });
    if (!claimed) return;
    try {
      // No client ID: the sale still counts, just not joined to the campaign in GA4.
      const clientId = o.ga_client_id ?? `${Math.floor(Math.random() * 2 ** 31)}.${Math.floor(Date.now() / 1000)}`;
      const res = await fetch(
        "https://www.google-analytics.com/mp/collect" +
        `?measurement_id=${encodeURIComponent(GA4_MEASUREMENT_ID.value())}&api_secret=${encodeURIComponent(GA4_API_SECRET.value())}`,
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            client_id: clientId,
            events: [{
              name: "purchase",
              params: {
                transaction_id: id, // GA4 deduplicates on it
                value: price,
                currency: "EUR",
                campaign: o.campaign ?? "(none)",
                country: o.country_iso,
                operator_group: group,
                page_language: o.page_language,
                items: [{
                  item_id: o.sku_code, item_name: o.operator_name ?? o.provider_code,
                  item_brand: o.operator_name ?? o.provider_code, item_category: o.country_iso,
                  price, quantity: 1,
                }],
              },
            }],
          }),
          signal: AbortSignal.timeout(5000),
        },
      );
      if (!res.ok) throw new Error(`GA4 HTTP ${res.status}`);
      logger.info("GA4 purchase sent", {orderId: id, campaign: o.campaign});
    } catch (e) {
      // Release the claim; the next write to the order (or a manual retry) sends it.
      await after.ref.update({ga4_sent: false});
      logger.error("GA4 purchase failed", {orderId: id, error: String(e)});
    }
  },
);
```

Export it from `index.ts`: `export {rechargeOrderTracking} from "./tracking";`

Notes:
- The trigger's own writes (`ga4_sent`) re-fire it; the second run finds `ga4_sent: true` and only rewrites the mirror. That is expected.
- Refunds and failed deliveries (spec 5.4) need nothing extra: the state change re-fires the trigger and the mirror gets `refunded` / `failed`. Reports count only `paid` and `delivered`.
- `ads_sent` stays `false`: Google Ads uses option A (it imports the GA4 `purchase`). Only build option B (Google Ads API click upload) later, and then make it the only primary conversion.
- Firestore triggers must run in a region compatible with the Firestore database location. If the database is not in `europe-west1` / `eur3`, set the trigger's `region` accordingly.
- `firestore.rules`: `order_analytics` must not be readable by clients (deny all; only the Admin SDK writes it).

Setup:

```bash
firebase functions:secrets:set GA4_API_SECRET
```

and `GA4_MEASUREMENT_ID=G-XXXXXXX` in `functions/.env` (get both from GA4 Admin; the website's GA4 web stream).

## Task 6: BigQuery (after launch, spec Step 7)

1. Install the "Stream Firestore to BigQuery" extension on collection **`order_analytics` only** (never `recharge_orders`, it holds email and phone numbers).
2. Link GA4 to BigQuery (daily export) and add the Google Ads Data Transfer.
3. Base report:

```sql
SELECT campaign, country_iso, operator_group,
       COUNT(*) AS orders, SUM(price_eur) AS revenue_eur, SUM(margin_eur) AS margin_eur
FROM `PROJECT.analytics.order_analytics`   -- the extension's *_raw_latest view
WHERE status IN ('paid', 'delivered')
GROUP BY campaign, country_iso, operator_group
ORDER BY revenue_eur DESC
```

## Release order

1. Task 1 → `npm run deploy` (functions:recharge). **Website must not deploy before this.**
2. Website deploy (tracking script, GTM `GTM-K6CLWQ8D`).
3. Tasks 2–5 → deploy.
4. Test (below), then start campaigns.

## Acceptance test

1. Open `https://www.integri.app/shopping/mobile-top-up/nigeria/en?utm_source=test&utm_medium=cpc&utm_campaign=test_campaign&gclid=TEST123` and buy the smallest product (or use Stripe test mode).
2. Firestore `recharge_orders/{id}`: `campaign = "test_campaign"`, `attribution.first` / `.last` filled, `page_country = "nigeria"`, `page_language = "en"`, `operator_name`, `product_type`, `ga4_sent = true` after payment.
3. Stripe dashboard → the PaymentIntent → Metadata shows `order_id, campaign, utm_source, utm_medium, gclid, country_iso, operator_code`.
4. `order_analytics/{id}` exists, has no `email` / `msisdn` / `uid`, `status` goes `pending → paid → delivered`.
5. GA4 → DebugView / Realtime: one `purchase` with `transaction_id = {order id}`.
6. Stripe → Webhooks → resend `payment_intent.succeeded` for that payment: no second GA4 purchase, order unchanged.
7. In a private window (the saved campaign lasts 30 days), repeat once from `https://www.integri.app/syria/en` with no parameters: `campaign = "(none)"`, `attribution.first = {}`.
8. A body over 2 KB (long `utm_content`) must now succeed instead of "Request too large".
9. A Sudani (`B2E4B9SD`) purchase shows `operator_group = "sudani"` in both the dataLayer and `order_analytics`.
10. After deploy, `rechargeOrderTracking` is listed under `us-central1` (Firestore is in `nam5`); every other function stays in `europe-west1`. That is expected.
