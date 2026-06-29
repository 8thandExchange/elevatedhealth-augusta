// redeem-onboarding-credit
// ----------------------------------------------------------------------------
// Validates a patient's live onboarding credit, computes the capped amount,
// creates a one-time Stripe coupon, and atomically marks the credit redeemed.
// The app then applies the returned couponId when it creates the membership
// subscription.
//
// Sequence (avoids burning the credit on a failed enrollment):
//   1. App calls this with the patient and the chosen plan's first-month price.
//   2. This returns { redeemable, couponId, appliedAmountCents }.
//   3. App creates the subscription WITH couponId.
//   4. If subscription creation fails, app calls void-... to roll back.
//
// cap_mode = first_month  -> applied = min(credit, firstMonthPriceCents)
// cap_mode = uncapped     -> applied = credit (one invoice only, via duration=once)
//
// Body: { "patientUserId": "...", "firstMonthPriceCents": 19900, "againstRef": "sub_..."? }
//
// DEPLOY (new function): supabase functions deploy redeem-onboarding-credit --no-verify-jwt
// ----------------------------------------------------------------------------

import { corsHeaders, json } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/supabase.ts";
import { stripe } from "../_shared/stripe.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let couponId: string | null = null;
  try {
    const { patientUserId, firstMonthPriceCents, againstRef } = await req.json();
    if (!patientUserId) return json({ error: "missing_patient" }, 400);

    const db = serviceClient();

    // Live eligibility check (status=issued AND inside window).
    const { data: credit, error: probeErr } = await db
      .rpc("get_redeemable_credit", { p_patient: patientUserId })
      .maybeSingle();
    if (probeErr) throw probeErr;
    if (!credit) return json({ redeemable: false, reason: "no_live_credit" }, 200);

    // Compute the capped amount.
    let applied = credit.credit_amount_cents as number;
    if (credit.cap_mode === "first_month") {
      const cap = Number(firstMonthPriceCents);
      if (!cap || cap <= 0) return json({ error: "missing_first_month_price" }, 400);
      applied = Math.min(applied, cap);
    }
    if (applied <= 0) return json({ redeemable: false, reason: "zero_after_cap" }, 200);

    // Create the one-time coupon BEFORE locking the credit, so a failure here
    // leaves the credit untouched.
    const coupon = await stripe.createOnceCoupon(applied);
    couponId = coupon.id;

    // Atomically claim the credit. Loses the race -> throws -> we clean up the coupon.
    const { data: redeemed, error: redErr } = await db
      .rpc("redeem_onboarding_credit", {
        p_credit_id: credit.id,
        p_applied_cents: applied,
        p_coupon_id: coupon.id,
        p_against_ref: againstRef ?? null,
      })
      .single();

    if (redErr) {
      await stripe.deleteCoupon(coupon.id).catch(() => {});
      couponId = null;
      return json({ redeemable: false, reason: "claim_failed" }, 200);
    }

    return json({
      redeemable: true,
      creditId: redeemed.id,
      couponId: coupon.id,
      appliedAmountCents: applied,
    });
  } catch (err) {
    if (couponId) await stripe.deleteCoupon(couponId).catch(() => {});
    return json({ error: String(err?.message ?? err) }, 500);
  }
});
