/**
 * One-shot: add a $449/mo tirzepatide price to the existing ELEVATED GLP-1
 * product so the GLP-1 lane can charge molecule-specific pricing
 * (semaglutide $349 stays on the existing price; tirzepatide = $449).
 *
 * Both prices map to the same `glp1` membership status in the webhook.
 * Service-role only. Idempotent via price metadata `eha_catalog_key`.
 *
 * Run once, capture the returned priceId, then wire it into:
 *   - src/lib/stripeConfig.ts
 *   - supabase/functions/_shared/live-prices.ts
 *   - supabase/functions/stripe-webhook/index.ts (price -> "glp1" map)
 * After wiring is deployed, this function can be deleted.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

// Existing live "ELEVATED GLP-1" product ($349/mo semaglutide price lives here).
const GLP1_PRODUCT_ID = "prod_UVdgUmNtkHxr3V";
const CATALOG_KEY = "glp1Tirzepatide";
const AMOUNT_CENTS = 44900;

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

  // Confirm the GLP-1 product exists and is active.
  const product = await stripe.products.retrieve(GLP1_PRODUCT_ID);
  if (!product || product.active === false) {
    return new Response(
      JSON.stringify({ error: `GLP-1 product ${GLP1_PRODUCT_ID} not found or inactive` }),
      { status: 500 },
    );
  }

  // Idempotent: reuse an existing $449/mo recurring price tagged for tirzepatide.
  const existing = await stripe.prices.list({ product: GLP1_PRODUCT_ID, active: true, limit: 100 });
  let price =
    existing.data.find(
      (p) =>
        p.unit_amount === AMOUNT_CENTS &&
        p.type === "recurring" &&
        p.recurring?.interval === "month" &&
        p.metadata?.eha_catalog_key === CATALOG_KEY,
    ) ?? null;

  let created = false;
  if (!price) {
    price = await stripe.prices.create({
      product: GLP1_PRODUCT_ID,
      currency: "usd",
      unit_amount: AMOUNT_CENTS,
      recurring: { interval: "month" },
      nickname: "ELEVATED GLP-1 — Tirzepatide",
      metadata: {
        eha_catalog_key: CATALOG_KEY,
        eha_clinic: "elevated_health_augusta",
        glp_med_variant: "tirzepatide",
        elevated_program: "glp1",
      },
    });
    created = true;
  }

  return new Response(
    JSON.stringify({
      ok: true,
      created,
      glp1Tirzepatide: { productId: GLP1_PRODUCT_ID, priceId: price.id, amountCents: AMOUNT_CENTS },
    }),
    { headers: { "Content-Type": "application/json" }, status: 200 },
  );
});
