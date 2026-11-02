/**
 * Campaign attribution for top-up orders: drop-in helpers for the rechargeWeb
 * backend (europe-west1), which is not in this repository.
 * Implements Steps 4, 5 and 7 of "Campaign and Purchase Tracking Spec" (22 Oct 2026).
 *
 * Wiring (see README.md next to this file):
 *   POST /recharge/web/create-intent
 *     const tracking = orderTrackingFields(req.body)              // Step 4.1
 *     order = { ...existingFields, ...tracking, operator_group: operatorGroup(opName, countryName), ... }
 *     stripe.paymentIntents.create({ ..., metadata: stripeMetadata(order) })   // Step 4.2
 *   Stripe webhook payment_intent.succeeded
 *     status = "paid"; await sendPurchaseOnce(orderRef)          // Step 5, safe on webhook retries
 *   Every order write
 *     await mirrorOrderAnalytics(db, order)                      // Step 7, no personal data
 *
 * Env: GA4_MEASUREMENT_ID (G-XXXXXXX), GA4_API_SECRET (server only, never in the browser).
 */

import type { DocumentReference, Firestore } from "firebase-admin/firestore";

const ATTR_KEYS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "gclid", "gbraid", "wbraid", "fbclid", "landing_page", "referrer", "ts",
] as const;
const MAX_LEN = 200;

type Touch = Partial<Record<(typeof ATTR_KEYS)[number], string>>;
export interface Attribution { first: Touch; last: Touch }

/** Step 4 rule 4: only the known keys, strings only, max 200 characters. Anything else is dropped. */
function cleanTouch(raw: unknown): Touch {
  const out: Touch = {};
  if (!raw || typeof raw !== "object") return out;
  for (const k of ATTR_KEYS) {
    const v = (raw as Record<string, unknown>)[k];
    if (typeof v === "string" && v) out[k] = v.slice(0, MAX_LEN);
  }
  return out;
}

const shortString = (v: unknown, max = 64) => (typeof v === "string" && v ? v.slice(0, max) : null);

/** Fields the page sends with create-intent, validated, ready to merge into the order document. */
export function orderTrackingFields(body: Record<string, unknown>) {
  const raw = body.attribution as { first?: unknown; last?: unknown } | null | undefined;
  const attribution: Attribution = { first: cleanTouch(raw?.first), last: cleanTouch(raw?.last) };
  const gaClientId = shortString(body.ga_client_id);
  return {
    channel: "web" as const,
    // Step 4 rule 1: the field every report groups by.
    campaign: attribution.last.utm_campaign || "(none)",
    attribution,
    ga_client_id: gaClientId && /^\d+\.\d+$/.test(gaClientId) ? gaClientId : null,
    page_country: shortString(body.page_country),
    page_language: shortString(body.page_language, 8),
    ga4_sent: false,
    ads_sent: false,
  };
}

/**
 * Step 4 rule 2: normalized operator name so voice and data products group together.
 * "MTN Nigeria Data" -> "mtn", "9Mobile Data" -> "9mobile". Same rule as the browser
 * (public/tracking/integri-tracking.js in the web app).
 */
export function operatorGroup(name: string, country?: string): string {
  let s = String(name || "").toLowerCase();
  if (country) s = s.split(country.toLowerCase()).join(" ");
  s = s.replace(/\b(data|bundles?|airtime|internet|top ?up|pinless|voice|credit|mobile data|postpaid|prepaid)\b/g, " ").trim();
  const first = s.split(/\s+/)[0] || String(name || "").toLowerCase();
  return first.replace(/[^a-z0-9]/g, "") || "unknown";
}

/** The order fields the helpers below read (see the Step 4.1 document shape). */
export interface TrackedOrder {
  order_id: string;
  status: "pending" | "paid" | "delivered" | "failed" | "refunded";
  created_at?: unknown;
  country_iso: string;
  page_country?: string | null;
  page_language?: string | null;
  operator_code: string;
  operator_name: string;
  operator_group: string;
  product_sku: string;
  product_type: "airtime" | "data";
  price_eur: number;
  fee_eur: number;
  cost_eur: number;
  margin_eur: number; // Step 4 rule 3: stored, not computed in reports
  stripe_payment_intent_id?: string;
  campaign: string;
  attribution: Attribution;
  ga_client_id: string | null;
  ga4_sent: boolean;
  ads_sent: boolean;
}

/**
 * Step 4.2: PaymentIntent metadata (or Checkout Session payment_intent_data.metadata).
 * Stripe: max 50 keys, key <= 40 chars, value <= 500 chars, strings only.
 */
export function stripeMetadata(o: TrackedOrder): Record<string, string> {
  const last = o.attribution.last;
  const meta: Record<string, string | undefined> = {
    order_id: o.order_id,
    campaign: o.campaign,
    utm_source: last.utm_source,
    utm_medium: last.utm_medium,
    utm_content: last.utm_content,
    gclid: last.gclid,
    country_iso: o.country_iso,
    operator_code: o.operator_code,
  };
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(meta)) if (v) out[k] = String(v).slice(0, 500);
  return out;
}

/** Step 5.1: GA4 purchase through the Measurement Protocol. The browser never sends purchase. */
async function sendGa4Purchase(o: TrackedOrder): Promise<void> {
  const id = process.env.GA4_MEASUREMENT_ID;
  const secret = process.env.GA4_API_SECRET;
  if (!id || !secret) throw new Error("GA4_MEASUREMENT_ID / GA4_API_SECRET not set");
  // Without the visitor's client ID the sale still counts, just not linked to the campaign in GA4.
  const clientId = o.ga_client_id ?? `${Math.floor(Math.random() * 2 ** 31)}.${Math.floor(Date.now() / 1000)}`;
  const res = await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(id)}&api_secret=${encodeURIComponent(secret)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        events: [{
          name: "purchase",
          params: {
            transaction_id: o.order_id, // GA4 deduplicates on it
            value: o.price_eur,
            currency: "EUR",
            campaign: o.campaign,
            country: o.country_iso,
            operator_group: o.operator_group,
            page_language: o.page_language ?? undefined,
            items: [{ item_id: o.product_sku, item_name: o.operator_name, item_brand: o.operator_name, item_category: o.country_iso, price: o.price_eur, quantity: 1 }],
          },
        }],
      }),
      signal: AbortSignal.timeout(5000),
    },
  );
  if (!res.ok) throw new Error(`GA4 MP: HTTP ${res.status}`);
}

/**
 * Step 5: call from the payment_intent.succeeded webhook after setting status = "paid".
 * A transaction claims the ga4_sent flag first, so a retried (or parallel) webhook
 * never sends the purchase twice; a failed send releases the claim for the next retry.
 * Google Ads uses option A (the imported GA4 purchase), so nothing else is sent here.
 */
export async function sendPurchaseOnce(ref: DocumentReference): Promise<void> {
  const db = ref.firestore;
  const order = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const o = snap.data() as TrackedOrder | undefined;
    if (!o || o.ga4_sent || (o.status !== "paid" && o.status !== "delivered")) return null;
    tx.update(ref, { ga4_sent: true });
    return o;
  });
  if (!order) return;
  try {
    await sendGa4Purchase(order);
  } catch (err) {
    await ref.update({ ga4_sent: false });
    throw err;
  }
}

/**
 * Step 7: mirror of the order without buyer email, phone number or any other personal
 * data, in order_analytics. Stream only this collection to BigQuery
 * ("Stream Firestore to BigQuery" extension). Call after every status change
 * (paid, delivered, failed, refunded: Step 5.4).
 */
export async function mirrorOrderAnalytics(db: Firestore, o: TrackedOrder): Promise<void> {
  const { first, last } = o.attribution;
  await db.collection("order_analytics").doc(o.order_id).set({
    order_id: o.order_id,
    created_at: o.created_at ?? null,
    status: o.status,
    channel: "web",
    country_iso: o.country_iso,
    page_country: o.page_country ?? null,
    page_language: o.page_language ?? null,
    operator_code: o.operator_code,
    operator_name: o.operator_name,
    operator_group: o.operator_group,
    product_sku: o.product_sku,
    product_type: o.product_type,
    price_eur: o.price_eur,
    fee_eur: o.fee_eur,
    cost_eur: o.cost_eur,
    margin_eur: o.margin_eur,
    campaign: o.campaign,
    // referrer / landing page are not personal; click IDs are needed to join ad clicks
    attribution: { first, last },
    updated_at: new Date().toISOString(),
  });
}
