/**
 * One-shot bootstrap: live Stripe recurring prices for ELEVATED medication-only add-ons.
 * Idempotent via product metadata `eha_catalog_key`. Service-role POST only.
 *
 * Catalog keys match `src/lib/elevatedComboPrograms.ts` add-on keys.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

type CatalogEntry = {
  key: string;
  name: string;
  description: string;
  amountCents: number;
};

const CATALOG: CatalogEntry[] = [
  {
    key: "elevated_addon_trt",
    name: "ELEVATED TRT Medication Add-On",
    description:
      "Testosterone cream (medication + pharmacy only). Requires an active ELEVATED anchor program that includes clinical monitoring.",
    amountCents: 14900,
  },
  {
    key: "elevated_addon_hrt",
    name: "ELEVATED HRT Medication Add-On",
    description:
      "Bi-Est + progesterone as prescribed (medication + pharmacy only). Requires an active ELEVATED anchor program.",
    amountCents: 12900,
  },
  {
    key: "elevated_addon_glp1_sema",
    name: "ELEVATED GLP-1 Semaglutide Medication Add-On",
    description:
      "Compounded semaglutide (medication only). Dose titration and monitoring included in your anchor ELEVATED program.",
    amountCents: 24900,
  },
  {
    key: "elevated_addon_glp1_tirz",
    name: "ELEVATED GLP-1 Tirzepatide Medication Add-On",
    description:
      "Compounded tirzepatide (medication only). Dose titration and monitoring included in your anchor ELEVATED program.",
    amountCents: 34900,
  },
];

function requireServiceRole(authHeader: string | null): boolean {
  const token = (authHeader ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
    return payload.role === "service_role";
  } catch {
    return false;
  }
}

async function findProductByKey(stripe: Stripe, catalogKey: string): Promise<Stripe.Product | null> {
  const search = await stripe.products.search({
    query: `metadata['eha_catalog_key']:'${catalogKey}'`,
    limit: 1,
  });
  return search.data[0] ?? null;
}

async function findActiveMonthlyPrice(
  stripe: Stripe,
  productId: string,
  amountCents: number,
): Promise<Stripe.Price | null> {
  const prices = await stripe.prices.list({ product: productId, active: true, limit: 100 });
  return (
    prices.data.find(
      (p) =>
        p.unit_amount === amountCents &&
        p.type === "recurring" &&
        p.recurring?.interval === "month",
    ) ?? null
  );
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405 });
  }
  if (!requireServiceRole(req.headers.get("Authorization"))) {
    return new Response(JSON.stringify({ error: "Unauthorized — service_role required" }), {
      status: 401,
    });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    return new Response(JSON.stringify({ error: "STRIPE_SECRET_KEY not configured" }), { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const results: Record<
    string,
    { productId: string; priceId: string; amountCents: number; created: boolean }
  > = {};

  for (const item of CATALOG) {
    let product = await findProductByKey(stripe, item.key);
    let created = false;

    if (!product) {
      product = await stripe.products.create({
        name: item.name,
        description: item.description,
        metadata: {
          eha_catalog_key: item.key,
          eha_clinic: "elevated_health_augusta",
          eha_combo_addon: "medication_only",
        },
      });
      created = true;
    } else {
      product = await stripe.products.update(product.id, {
        name: item.name,
        description: item.description,
      });
    }

    let price = await findActiveMonthlyPrice(stripe, product.id, item.amountCents);
    if (!price) {
      price = await stripe.prices.create({
        product: product.id,
        currency: "usd",
        unit_amount: item.amountCents,
        recurring: { interval: "month" },
        metadata: { eha_catalog_key: item.key, eha_combo_addon: "medication_only" },
      });
      created = true;
    }

    results[item.key] = {
      productId: product.id,
      priceId: price.id,
      amountCents: item.amountCents,
      created,
    };
  }

  return new Response(
    JSON.stringify({
      ok: true,
      results,
      code_update_hint: "Copy priceId values into live-prices.ts LIVE_COMBO_ADDON_PRICE_IDS and stripeConfig ELEVATED_COMBO_ADDONS",
    }),
    { headers: { "Content-Type": "application/json" } },
  );
});
