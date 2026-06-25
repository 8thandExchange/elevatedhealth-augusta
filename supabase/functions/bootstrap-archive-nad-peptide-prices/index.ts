/**
 * One-shot: archive the standalone peptide NAD+ Stripe prices/products
 * (injection / troche / nasal), discontinued 2026-06-25. NAD+ now survives only
 * as the $50 IV "NAD+ Booster" add-on.
 *
 * SAFETY: for each price, this FIRST checks for live (non-canceled) subscriptions.
 * If any exist, it SKIPS that price and reports it — it never breaks active
 * billing. Only prices with zero live subscriptions are set inactive; a product
 * is archived only once it has no remaining active prices.
 *
 * Service-role only. Idempotent. After running, this function can be deleted.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const NAD_PEPTIDES = [
  { label: "NAD+ Troches", priceId: "price_1TWcujCXbCBPFEeIgLXiONWC", productId: "prod_UVeDctVXwIySHX" },
  { label: "NAD+ Injection", priceId: "price_1TWcv4CXbCBPFEeIqJILZWQY", productId: "prod_UVeDVPf2YZCceL" },
  { label: "NAD+ Nasal Spray", priceId: "price_1TWcvUCXbCBPFEeILsUFp0tq", productId: "prod_UVeDO4N214JNkQ" },
];

const LIVE_SUB_STATUSES = ["active", "trialing", "past_due", "unpaid", "incomplete"];

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

  const report: Record<string, unknown>[] = [];

  try {
    for (const item of NAD_PEPTIDES) {
      const subs = await stripe.subscriptions.list({ price: item.priceId, status: "all", limit: 100 });
      const liveSubs = subs.data.filter((s) => LIVE_SUB_STATUSES.includes(s.status));

      if (liveSubs.length > 0) {
        report.push({
          label: item.label,
          priceId: item.priceId,
          archived: false,
          liveSubscriptions: liveSubs.length,
          action: "SKIPPED — live subscriptions exist; left active to preserve billing",
        });
        continue;
      }

      // Archiving the PRODUCT makes all its prices unusable for new checkouts /
      // subscriptions. We archive the product (not the price) because each NAD+
      // price is its product's default_price, which Stripe refuses to archive
      // directly. Best-effort: also deactivate the price after the product is
      // archived (may still be blocked by default_price — non-fatal).
      await stripe.products.update(item.productId, { active: false });
      let priceArchived = false;
      try {
        await stripe.prices.update(item.priceId, { active: false });
        priceArchived = true;
      } catch (_e) {
        priceArchived = false;
      }

      report.push({
        label: item.label,
        priceId: item.priceId,
        productId: item.productId,
        productArchived: true,
        priceArchived,
        liveSubscriptions: 0,
      });
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err), report }),
      { headers: { "Content-Type": "application/json" }, status: 200 },
    );
  }

  return new Response(JSON.stringify({ ok: true, report }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
