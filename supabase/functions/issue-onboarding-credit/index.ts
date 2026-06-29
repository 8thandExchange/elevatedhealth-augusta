// issue-onboarding-credit
// ----------------------------------------------------------------------------
// Issues an onboarding credit when a baseline-labs charge is confirmed paid.
//
// Trigger: call this from the Stripe webhook handler on payment_intent.succeeded
// (preferred, so issuance happens exactly when funds clear), or directly after a
// confirmed baseline-labs payment. It re-verifies the charge against Stripe, so
// it cannot be spoofed by a client.
//
// The baseline-labs checkout MUST set these on the PaymentIntent metadata:
//   metadata.eha_purpose         = "baseline_labs_onboarding"
//   metadata.eha_patient_user_id = <auth.users.id of the patient>
//
// Body: { "paymentIntentId": "pi_..." }
//
// DEPLOY (new function, never auto-deploys):
//   supabase functions deploy issue-onboarding-credit --no-verify-jwt
// Then confirm it in the Supabase dashboard /functions before testing.
// ----------------------------------------------------------------------------

import { corsHeaders, json } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/supabase.ts";
import { stripe } from "../_shared/stripe.ts";

const WINDOW_DAYS = Number(Deno.env.get("ONBOARDING_CREDIT_WINDOW_DAYS") ?? "30");
const CAP_MODE = Deno.env.get("ONBOARDING_CREDIT_CAP_MODE") ?? "first_month";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const { paymentIntentId } = await req.json();
    if (!paymentIntentId) return json({ error: "missing_payment_intent" }, 400);

    const pi = await stripe.getPaymentIntent(paymentIntentId);

    if (pi.status !== "succeeded") {
      return json({ error: "payment_not_succeeded", status: pi.status }, 409);
    }
    if (pi.metadata?.eha_purpose !== "baseline_labs_onboarding") {
      // Not a baseline-labs charge. Nothing to issue. Ack so webhooks stop retrying.
      return json({ issued: false, reason: "not_onboarding_charge" }, 200);
    }

    const patientUserId = pi.metadata?.eha_patient_user_id;
    if (!patientUserId) return json({ error: "missing_patient_metadata" }, 400);

    const amountCents = Number(pi.amount_received ?? pi.amount ?? 0);
    if (!amountCents || amountCents < 0) return json({ error: "invalid_amount" }, 400);

    const expiresAt = new Date(Date.now() + WINDOW_DAYS * 86_400_000).toISOString();
    const db = serviceClient();

    // Idempotent: unique index on onboarding_charge_ref. A duplicate webhook is a no-op.
    const { data: inserted, error: insErr } = await db
      .from("onboarding_credits")
      .upsert(
        {
          patient_user_id: patientUserId,
          stripe_customer_id: pi.customer ?? null,
          onboarding_charge_ref: pi.id,
          credit_amount_cents: amountCents,
          window_days: WINDOW_DAYS,
          cap_mode: CAP_MODE,
          expires_at: expiresAt,
          status: "issued",
        },
        { onConflict: "onboarding_charge_ref", ignoreDuplicates: true },
      )
      .select()
      .maybeSingle();

    if (insErr) throw insErr;

    // Advance the journey regardless (idempotent, forward-only).
    await db.rpc("advance_journey", {
      p_patient: patientUserId,
      p_stage: "baseline_labs_ordered",
      p_note: "Baseline labs paid; onboarding credit issued",
    });

    return json({
      issued: true,
      duplicate: !inserted,
      credit: inserted ?? null,
      windowDays: WINDOW_DAYS,
    });
  } catch (err) {
    return json({ error: String(err?.message ?? err) }, 500);
  }
});
