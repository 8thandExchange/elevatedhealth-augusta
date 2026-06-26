/**
 * One-shot: verify (or create) the ELEVATED Member 20% Stripe coupon and ensure
 * STRIPE_ELEVATED_MEMBER_COUPON_ID is set. Service-role only.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { ELEVATED_MEMBER_COUPON_ENV_KEY } from "../_shared/member-discount.ts";

const COUPON_NAME = "ELEVATED Member 20% Discount";
const COUPON_METADATA_KEY = "eha_coupon_key";
const COUPON_METADATA_VALUE = "elevated_member_20pct";

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

async function findExistingCoupon(stripe: Stripe): Promise<Stripe.Coupon | null> {
  const configured = Deno.env.get(ELEVATED_MEMBER_COUPON_ENV_KEY)?.trim();
  if (configured) {
    try {
      const c = await stripe.coupons.retrieve(configured);
      if (c.valid) return c;
    } catch {
      // fall through to search/create
    }
  }

  const search = await stripe.coupons.search({
    query: `metadata['${COUPON_METADATA_KEY}']:'${COUPON_METADATA_VALUE}'`,
    limit: 1,
  });
  return search.data.find((c) => c.valid) ?? null;
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405 });
  }
  if (!requireServiceRole(req.headers.get("Authorization"))) {
    return new Response(JSON.stringify({ error: "Unauthorized — service_role required" }), { status: 401 });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    return new Response(JSON.stringify({ error: "STRIPE_SECRET_KEY is not set" }), { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  let coupon = await findExistingCoupon(stripe);
  let created = false;

  if (!coupon) {
    coupon = await stripe.coupons.create({
      name: COUPON_NAME,
      percent_off: 20,
      duration: "forever",
      metadata: {
        [COUPON_METADATA_KEY]: COUPON_METADATA_VALUE,
        eha_purpose: "member_alacarte_checkout_only",
      },
    });
    created = true;
  }

  const configuredId = Deno.env.get(ELEVATED_MEMBER_COUPON_ENV_KEY)?.trim() ?? null;
  const needsSecretUpdate = configuredId !== coupon.id;

  return new Response(
    JSON.stringify({
      ok: true,
      coupon_id: coupon.id,
      coupon_name: coupon.name,
      percent_off: coupon.percent_off,
      valid: coupon.valid,
      created,
      configured_secret_matches: !needsSecretUpdate,
      action_required: needsSecretUpdate
        ? `Run: supabase secrets set ${ELEVATED_MEMBER_COUPON_ENV_KEY}=${coupon.id} --project-ref jiiparpfkjytdcuelcns`
        : null,
    }),
    { headers: { "Content-Type": "application/json" } },
  );
});
