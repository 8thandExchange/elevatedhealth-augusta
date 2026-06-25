/**
 * One-shot: rename the existing "ELEVATED WELLNESS" Stripe product to
 * "ELEVATED IV" (cosmetic — affects dashboard + receipts only). The price ID
 * (price_1TWcPNCXbCBPFEeIXo6IDpPf) and product ID are unchanged, so existing
 * subscriptions and the internal `wellness` program key are untouched.
 *
 * Service-role only. Idempotent (renaming to the same name is a no-op).
 * After running, this function can be deleted.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const IV_PRODUCT_ID = "prod_UVdg37MnW1puuK";
const NEW_NAME = "ELEVATED IV";

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

  const before = await stripe.products.retrieve(IV_PRODUCT_ID);
  const updated = await stripe.products.update(IV_PRODUCT_ID, { name: NEW_NAME });

  return new Response(
    JSON.stringify({
      ok: true,
      productId: IV_PRODUCT_ID,
      previousName: before.name,
      newName: updated.name,
    }),
    { headers: { "Content-Type": "application/json" }, status: 200 },
  );
});
