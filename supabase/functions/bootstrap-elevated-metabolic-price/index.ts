/**
 * One-shot: retire the $1,199 Metabolic Recomposition stack product and create
 * the $599/mo tirzepatide-anchored "ELEVATED Metabolic" program. Service-role only.
 * Idempotent via product metadata `eha_catalog_key`.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const NEW_KEY = "elevatedMetabolic";
const NEW_NAME = "ELEVATED Metabolic";
const NEW_DESCRIPTION =
  "Premium physician-directed metabolic & body-recomposition program — compounded tirzepatide anchor with lean-mass support, intensive labs, and monthly oversight.";
const NEW_AMOUNT_CENTS = 59900;

// Legacy $1,199 Metabolic Recomposition stack product to archive.
const OLD_PRODUCT_ID = "prod_UhqS2sWj7JenEp";

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

  const out: Record<string, unknown> = {};

  // 1) Create (or find) the new ELEVATED Metabolic product + $599/mo price.
  const search = await stripe.products.search({
    query: `metadata['eha_catalog_key']:'${NEW_KEY}'`,
    limit: 1,
  });
  let product = search.data[0] ?? null;
  if (!product) {
    product = await stripe.products.create({
      name: NEW_NAME,
      description: NEW_DESCRIPTION,
      metadata: { eha_catalog_key: NEW_KEY, eha_clinic: "elevated_health_augusta" },
    });
  } else if (product.name !== NEW_NAME || product.description !== NEW_DESCRIPTION) {
    product = await stripe.products.update(product.id, { name: NEW_NAME, description: NEW_DESCRIPTION });
  }

  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 100 });
  let price =
    prices.data.find(
      (p) => p.unit_amount === NEW_AMOUNT_CENTS && p.type === "recurring" && p.recurring?.interval === "month",
    ) ?? null;
  if (!price) {
    price = await stripe.prices.create({
      product: product.id,
      currency: "usd",
      unit_amount: NEW_AMOUNT_CENTS,
      recurring: { interval: "month" },
      metadata: { eha_catalog_key: NEW_KEY },
    });
  }
  out.elevatedMetabolic = { productId: product.id, priceId: price.id };

  // 2) Archive the legacy $1,199 stack product + deactivate its prices.
  try {
    const oldPrices = await stripe.prices.list({ product: OLD_PRODUCT_ID, active: true, limit: 100 });
    for (const p of oldPrices.data) {
      await stripe.prices.update(p.id, { active: false });
    }
    await stripe.products.update(OLD_PRODUCT_ID, { active: false });
    out.archivedOld = { productId: OLD_PRODUCT_ID, pricesDeactivated: oldPrices.data.length };
  } catch (e) {
    out.archiveError = e instanceof Error ? e.message : String(e);
  }

  return new Response(JSON.stringify({ ok: true, ...out }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
