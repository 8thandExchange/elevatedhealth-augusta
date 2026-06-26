/**
 * One-shot bootstrap: create live Stripe products/prices for the Recovery peptide line
 * (BPC-157 and TB-500). Invoke with service-role Authorization only.
 * Idempotent via product metadata `eha_catalog_key` — safe to re-run.
 *
 * Priced as one-time à la carte fills (per the Launch Offer Order System per-vial pricing).
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

type CatalogEntry = {
  key: string;
  name: string;
  description: string;
  amountCents: number;
  mode: "subscription" | "one_time";
};

const CATALOG: CatalogEntry[] = [
  {
    key: "bpc157",
    name: "BPC-157",
    description: "Recovery peptide — provider-reviewed, consent-gated à la carte fill",
    amountCents: 24900,
    mode: "one_time",
  },
  {
    key: "tb500",
    name: "TB-500 (Thymosin Beta-4)",
    description: "Recovery peptide — provider-reviewed, consent-gated à la carte fill",
    amountCents: 24900,
    mode: "one_time",
  },
];

async function findProductByKey(stripe: Stripe, catalogKey: string): Promise<Stripe.Product | null> {
  const search = await stripe.products.search({
    query: `metadata['eha_catalog_key']:'${catalogKey}'`,
    limit: 1,
  });
  return search.data[0] ?? null;
}

async function findActivePrice(
  stripe: Stripe,
  productId: string,
  amountCents: number,
  mode: CatalogEntry["mode"],
): Promise<Stripe.Price | null> {
  const prices = await stripe.prices.list({ product: productId, active: true, limit: 100 });
  return (
    prices.data.find((p) => {
      if (p.unit_amount !== amountCents) return false;
      if (mode === "subscription") return p.type === "recurring" && p.recurring?.interval === "month";
      return p.type === "one_time";
    }) ?? null
  );
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405 });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

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
  const results: Record<string, { productId: string; priceId: string; created: boolean }> = {};

  for (const item of CATALOG) {
    let product = await findProductByKey(stripe, item.key);
    let productCreated = false;

    if (!product) {
      product = await stripe.products.create({
        name: item.name,
        description: item.description,
        metadata: { eha_catalog_key: item.key, eha_clinic: "elevated_health_augusta" },
      });
      productCreated = true;
    } else if (product.name !== item.name || product.description !== item.description) {
      // Keep patient-facing name/description in sync on re-run.
      product = await stripe.products.update(product.id, {
        name: item.name,
        description: item.description,
      });
    }

    let price = await findActivePrice(stripe, product.id, item.amountCents, item.mode);
    let priceCreated = false;

    if (!price) {
      price = await stripe.prices.create({
        product: product.id,
        currency: "usd",
        unit_amount: item.amountCents,
        ...(item.mode === "subscription" ? { recurring: { interval: "month" } } : {}),
        metadata: { eha_catalog_key: item.key },
      });
      priceCreated = true;
    }

    results[item.key] = {
      productId: product.id,
      priceId: price.id,
      created: productCreated || priceCreated,
    };
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
