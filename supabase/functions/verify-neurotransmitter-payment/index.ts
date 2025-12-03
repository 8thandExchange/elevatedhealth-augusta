import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-NEUROTRANSMITTER-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) throw new Error("Supabase config missing");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Session ID required");

    logStep("Verifying session", { sessionId });

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Session retrieved", { 
      status: session.status, 
      paymentStatus: session.payment_status,
      metadata: session.metadata 
    });

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ 
        verified: false, 
        message: "Payment not completed" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const paymentRecordId = session.metadata?.payment_record_id;
    const patientId = session.metadata?.patient_id;

    if (paymentRecordId) {
      // Update the payment record
      const { error: updateError } = await supabase
        .from("neurotransmitter_payments")
        .update({
          payment_status: "paid",
          stripe_payment_intent_id: session.payment_intent as string,
          kit_status: "ordered",
        })
        .eq("id", paymentRecordId);

      if (updateError) {
        logStep("Error updating payment record", { error: updateError.message });
      } else {
        logStep("Payment record updated to paid", { paymentRecordId });
      }
    }

    // Create a task/order for provider to ship the kit
    if (patientId) {
      const { error: orderError } = await supabase
        .from("orders")
        .insert({
          patient_id: patientId,
          status: "pending_review",
          protocol_snapshot: {
            type: "neurotransmitter_kit",
            task: "Ship ZRT Neurotransmitter Dried Urine Kit",
            description: "Patient purchased Neurotransmitter Analysis ($399). Ship ZRT kit and generate requisition.",
            date_ordered: new Date().toISOString(),
          },
        });

      if (orderError) {
        logStep("Error creating order task", { error: orderError.message });
      } else {
        logStep("Order task created for provider");
      }
    }

    return new Response(JSON.stringify({ 
      verified: true, 
      message: "Payment verified and kit order created",
      paymentRecordId 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
