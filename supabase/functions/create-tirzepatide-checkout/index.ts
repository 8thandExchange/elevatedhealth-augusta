/**
 * create-tirzepatide-checkout — **ELEVATED GLP-1 · Tirzepatide** ($449/mo).
 * Tirzepatide is priced higher than semaglutide ($349) because the compounded
 * drug costs ~2x; both enroll the patient in the same `glp1` membership.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { LIVE_GLP1_TIRZEPATIDE_PRICE_ID } from "../_shared/live-prices.ts";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    edgeStructuredLog("create-tirzepatide-checkout", {
      event_type: "request",
      success: true,
      action_taken: "started",
      product_recognition: "elevated_glp1",
    });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { email, name, patientId } = await req.json().catch(() => ({}));

    let customerId: string | undefined;
    if (email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || "https://elevatedhealthaugusta.com";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [{ price: LIVE_GLP1_TIRZEPATIDE_PRICE_ID, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/medication-confirmed?med=tirzepatide&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/weight-loss`,
      metadata: {
        service_type: "tirzepatide_membership",
        patient_name: name || "",
        patient_email: email || "",
        patient_id: patientId || "",
        glp_med_variant: "tirzepatide",
        elevated_program: "glp1",
        is_guest_checkout: patientId ? "false" : "true",
        applied_discount: "none",
      },
      subscription_data: {
        metadata: {
          service_type: "tirzepatide_membership",
          glp_med_variant: "tirzepatide",
        },
      },
    });

    if (email) {
      await supabaseClient.from("consultation_bookings").insert({
        customer_email: email,
        customer_name: name || null,
        service_type: "tirzepatide_membership",
        status: "pending_payment",
        stripe_session_id: session.id,
        notes: "ELEVATED GLP-1 enrollment (tirzepatide path)",
      });
    }

    edgeStructuredLog("create-tirzepatide-checkout", {
      event_type: "checkout_created",
      success: true,
      action_taken: "stripe_checkout_session_created",
      patient_id: patientId || null,
      product_recognition: "elevated_glp1",
    });

    return new Response(JSON.stringify({ url: session.url, session_id: session.id, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    edgeStructuredLog(
      "create-tirzepatide-checkout",
      {
        event_type: "error",
        success: false,
        action_taken: "checkout_failed",
        error_message: msg,
      },
      "error",
    );
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
