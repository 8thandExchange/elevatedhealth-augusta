/**
 * verify-alacarte-payment
 *
 * Server-side verification for à la carte purchases (testosterone cream,
 * Bi-Est, progesterone, follow-up consult, lab panel).
 *
 * AlaCartePaymentSuccess.tsx calls this with the Stripe session_id from the
 * URL. We:
 *   1. Confirm Stripe says the session is paid.
 *   2. Update the consultation_bookings row that create-alacarte-checkout
 *      pre-stamped from status='pending_payment' to status='paid'.
 *   3. Return the booking_id, product key, and product label so the page
 *      can render the correct post-payment surface (medication shipment
 *      confirmation OR a slot picker for follow-up / lab-draw bookings).
 *
 * AUTH POSTURE (security audit R-5, 2026-05-08):
 *   - verify_jwt = true in supabase/config.toml (existing — unchanged)
 *   - The actual auth credential for this function is the Stripe
 *     `session_id`, which is unguessable and held by the user who just
 *     completed checkout. We validate the session against Stripe before
 *     reading or writing any DB row, and only mutate the single
 *     consultation_bookings row that matches that session id.
 *   - Worst case if session_id is leaked: the leaker can re-run a
 *     verification that has no side-effects beyond marking an already-
 *     paid booking as paid (idempotent).
 *
 * This mirrors verify-consultation-payment for the alacarte flow. We do
 * NOT mutate inventory or fire fulfillment from here — that's
 * webhook-driven downstream of stripe-webhook.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: unknown) =>
  console.log(`[VERIFY-ALACARTE] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);

const PRODUCT_LABEL: Record<string, string> = {
  testosterone: "Testosterone Cream",
  biEst: "Bi-Est Cream",
  progesterone: "Progesterone",
  semaglutide: "Compounded Semaglutide Fill",
  tirzepatide: "Compounded Tirzepatide Fill",
  retatrutide: "Retatrutide Monthly (Gated)",
  bpc157: "BPC-157",
  tb500: "TB-500",
  followUp: "Follow-up Consultation",
  labPanel: "Comprehensive Wellness Panel",
  labPanelExpanded: "Expanded Lab Panel",
  labAdvanced: "Advanced Lab Add-on",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const { session_id } = await req.json();
    if (!session_id) throw new Error("session_id is required");
    log("Request", { session_id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["customer"],
    });

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ success: false, status: session.payment_status, message: "Payment not yet confirmed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    const productKey = (session.metadata?.product_key as string) || "";
    const productLabel = PRODUCT_LABEL[productKey] || session.metadata?.product_name || "Order";
    const customerEmail =
      session.customer_email ||
      (typeof session.customer === "object" && session.customer && "email" in session.customer
        ? (session.customer.email as string | null)
        : null);

    let bookingId: string | null = null;
    const { data: existing } = await supabase
      .from("consultation_bookings")
      .select("id, status")
      .eq("stripe_session_id", session_id)
      .maybeSingle();

    if (existing) {
      bookingId = existing.id;
      if (existing.status !== "paid" && existing.status !== "completed") {
        await supabase
          .from("consultation_bookings")
          .update({ status: "paid", calendar_booked_at: null })
          .eq("id", existing.id);
        log("Booking row marked paid", { bookingId });
      }
    } else if (customerEmail) {
      // create-alacarte-checkout normally pre-stamps the row, but if it
      // failed to (logged as non-critical) we backfill here so the slot
      // picker has a row to attach to.
      const amount = session.amount_total ?? 0;
      const { data: created } = await supabase
        .from("consultation_bookings")
        .insert({
          customer_email: customerEmail,
          customer_name: (session.metadata?.patient_name as string) || null,
          service_type: `alacarte_${productKey}`,
          status: "paid",
          stripe_session_id: session_id,
          amount_paid: amount,
          notes: `À la carte order: ${productLabel}`,
        })
        .select("id")
        .single();
      bookingId = created?.id || null;
      log("Booking row backfilled", { bookingId });
    }

    return new Response(
      JSON.stringify({
        success: true,
        booking_id: bookingId,
        product_key: productKey,
        product_label: productLabel,
        amount_total: session.amount_total,
        customer_email: customerEmail,
        customer_name: (session.metadata?.patient_name as string) || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log("ERROR", { message: msg });
    return new Response(JSON.stringify({ success: false, error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
