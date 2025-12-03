import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-NEUROTRANSMITTER-CHECKOUT] ${step}${detailsStr}`);
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

    const { email, name, patientId } = await req.json();
    logStep("Request parsed", { email, name, patientId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer exists
    let customerId: string | undefined;
    if (email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing customer", { customerId });
      }
    }

    // Create payment record first
    const { data: paymentRecord, error: insertError } = await supabase
      .from("neurotransmitter_payments")
      .insert({
        patient_id: patientId || null,
        customer_email: email || "unknown@email.com",
        payment_status: "pending",
        amount_paid: 39900,
        kit_status: "not_ordered",
      })
      .select()
      .single();

    if (insertError) {
      logStep("Error creating payment record", { error: insertError.message });
      throw new Error(`Failed to create payment record: ${insertError.message}`);
    }

    logStep("Payment record created", { paymentId: paymentRecord.id });

    // Create checkout session for Neurotransmitter Analysis ($399)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "ZRT Neurotransmitter Profile",
              description: "Comprehensive brain chemistry analysis - Serotonin, Dopamine, GABA, Glutamate, Cortisol. At-home dried urine collection kit included.",
            },
            unit_amount: 39900, // $399.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/patient/dashboard?neurotransmitter=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/patient/dashboard`,
      metadata: {
        type: "neurotransmitter_analysis",
        payment_record_id: paymentRecord.id,
        patient_id: patientId || "",
        patient_email: email || "",
        patient_name: name || "",
      },
    });

    // Update payment record with session ID
    await supabase
      .from("neurotransmitter_payments")
      .update({ stripe_session_id: session.id })
      .eq("id", paymentRecord.id);

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
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
