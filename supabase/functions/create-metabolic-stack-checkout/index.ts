/**
 * create-metabolic-stack-checkout
 *
 * Public storefront — ELEVATED METABOLIC RECOMPOSITION ($1,199/mo phased stack).
 * Uses STRIPE_METABOLIC_STACK_PRICE_ID when set; otherwise price_data fallback for staging.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { LIVE_ELEVATED_PROGRAMS } from "../_shared/live-prices.ts";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";

const STACK_AMOUNT_CENTS = 119900;
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    edgeStructuredLog("create-metabolic-stack-checkout", {
      event_type: "request",
      success: true,
      action_taken: "started",
      product_recognition: "elevated_metabolic_recomposition",
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
    const priceId = LIVE_ELEVATED_PROGRAMS.metabolicRecomposition;
    const useLivePrice = priceId && !priceId.startsWith("price_TODO");

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = useLivePrice
      ? [{ price: priceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: "usd",
              unit_amount: STACK_AMOUNT_CENTS,
              recurring: { interval: "month" },
              product_data: {
                name: "ELEVATED Body Recomposition Program",
                description:
                  "Physician-supervised phased metabolic protocol — enrolled after in-clinic assessment and labs",
              },
            },
            quantity: 1,
          },
        ];

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: lineItems,
      mode: "subscription",
      success_url: `${origin}/medication-confirmed?med=metabolic-stack`,
      cancel_url: `${origin}/weight-loss#body-recomposition`,
      metadata: {
        service_type: "metabolic_recomposition_stack",
        patient_name: name || "",
        patient_email: email || "",
        patient_id: patientId || "",
        elevated_program: "metabolicRecomposition",
        is_guest_checkout: patientId ? "false" : "true",
        applied_discount: "none",
      },
      subscription_data: {
        metadata: {
          service_type: "metabolic_recomposition_stack",
          elevated_program: "metabolicRecomposition",
        },
      },
    });

    if (email) {
      await supabaseClient.from("consultation_bookings").insert({
        customer_email: email,
        customer_name: name || null,
        service_type: "metabolic_recomposition_stack",
        status: "pending_payment",
        stripe_session_id: session.id,
        notes: "ELEVATED Metabolic Recomposition Stack enrollment",
      });
    }

    edgeStructuredLog("create-metabolic-stack-checkout", {
      event_type: "checkout_created",
      success: true,
      action_taken: "stripe_checkout_session_created",
      patient_id: patientId || null,
      product_recognition: "elevated_metabolic_recomposition",
    });

    return new Response(JSON.stringify({ url: session.url, session_id: session.id, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    edgeStructuredLog(
      "create-metabolic-stack-checkout",
      { event_type: "error", success: false, action_taken: "checkout_failed", error_message: msg },
      "error",
    );
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
