/**
 * One-shot bootstrap: create live Stripe products/prices for the Metabolic Recomposition stack.
 * Invoke with service role Authorization only. Idempotent via product metadata `eha_catalog_key`.
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
    key: "metabolicRecomposition",
    name: "ELEVATED Metabolic Recomposition Stack",
    description:
      "90-day phased protocol: retatrutide anchor, SS-31/NAD+, CJC/Tesamorelin, physician oversight",
    amountCents: 119900,
    mode: "subscription",
  },
  {
    key: "retatrutideFill",
    name: "Retatrutide Monthly (Gated)",
    description: "Compounded retatrutide — physician-gated GLP-1 lane (monthly fill)",
    amountCents: 49900,
    mode: "one_time",
  },
  {
    key: "ss31",
    name: "SS-31 (Elamipretide)",
    description: "Mitochondrial peptide — metabolic stack à la carte",
    amountCents: 24900,
    mode: "subscription",
  },
  {
    key: "aod9604",
    name: "AOD-9604",
    description: "Lipolytic peptide fragment — metabolic stack à la carte",
    amountCents: 12900,
    mode: "subscription",
  },
  {
    key: "sluPp332",
    name: "SLU-PP-332",
    description: "Experimental PPARδ agonist — metabolic stack à la carte",
    amountCents: 9900,
    mode: "subscription",
  },
  {
    key: "fiveAmino1mq",
    name: "5-Amino-1MQ",
    description: "NNMT inhibitor — metabolic stack à la carte",
    amountCents: 11900,
    mode: "subscription",
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
    }

    let price = await findActivePrice(stripe, product.id, item.amountCents, item.mode);
    let priceCreated = false;

    if (!price) {
      price = await stripe.prices.create({
        product: product.id,
        currency: "usd",
        unit_amount: item.amountCents,
        ...(item.mode === "subscription"
          ? { recurring: { interval: "month" } }
          : {}),
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
