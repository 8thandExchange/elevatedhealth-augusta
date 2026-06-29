/**
 * One-shot: add a $499/mo retatrutide price on the existing retatrutide product.
 * Service-role only. Idempotent via price metadata `eha_catalog_key`.
 *
 * Run once, capture the returned priceId, then wire it into:
 *   - src/lib/stripeConfig.ts (MEDICATION_FILLS.retatrutide.priceId)
 *   - supabase/functions/_shared/live-prices.ts
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const RETATRUTIDE_PRODUCT_ID = "prod_UhqSeeHiiHdqHr";
const CATALOG_KEY = "retatrutideMonthly";
const AMOUNT_CENTS = 49900;

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405 });
  }
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
    if (payload.role !== "service_role") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
  } catch {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    return new Response(JSON.stringify({ error: "STRIPE_SECRET_KEY not configured" }), { status: 500 });
  }
  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

  const product = await stripe.products.retrieve(RETATRUTIDE_PRODUCT_ID);
  if (!product || product.active === false) {
    return new Response(
      JSON.stringify({ error: `Retatrutide product ${RETATRUTIDE_PRODUCT_ID} not found or inactive` }),
      { status: 500 },
    );
  }

  const existing = await stripe.prices.list({ product: RETATRUTIDE_PRODUCT_ID, active: true, limit: 100 });
  let price =
    existing.data.find(
      (p) =>
        p.unit_amount === AMOUNT_CENTS &&
        p.metadata?.eha_catalog_key === CATALOG_KEY,
    ) ?? null;

  let created = false;
  if (!price) {
    price = await stripe.prices.create({
      product: RETATRUTIDE_PRODUCT_ID,
      currency: "usd",
      unit_amount: AMOUNT_CENTS,
      nickname: "Retatrutide Monthly (Gated)",
      metadata: {
        eha_catalog_key: CATALOG_KEY,
        eha_clinic: "elevated_health_augusta",
        gated: "true",
        billing: "monthly_fill",
      },
    });
    created = true;
  }

  // Retire superseded $449 price so staff cannot accidentally charge the old rate.
  const LEGACY_PRICE_ID = "price_1TiQlECXbCBPFEeIzhCHuRhj";
  let legacyArchived = false;
  try {
    const legacy = await stripe.prices.retrieve(LEGACY_PRICE_ID);
    if (legacy.active) {
      await stripe.prices.update(LEGACY_PRICE_ID, { active: false });
      legacyArchived = true;
    }
  } catch {
    // Legacy price may already be removed — non-fatal.
  }

  return new Response(
    JSON.stringify({
      ok: true,
      created,
      legacyArchived,
      retatrutide: { productId: RETATRUTIDE_PRODUCT_ID, priceId: price.id, amountCents: AMOUNT_CENTS },
    }),
    { headers: { "Content-Type": "application/json" }, status: 200 },
  );
});
