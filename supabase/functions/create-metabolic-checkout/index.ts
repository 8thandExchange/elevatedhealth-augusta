import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-METABOLIC-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, name, patientId } = await req.json();
    logStep("Request data", { email, name, patientId });

    if (!email) throw new Error("Email is required");

    // Create pending payment record
    const { data: paymentRecord, error: insertError } = await supabase
      .from('metabolic_payments')
      .insert({
        customer_email: email,
        customer_name: name,
        patient_id: patientId,
        payment_status: 'pending',
        kit_status: 'not_ordered'
      })
      .select()
      .single();

    if (insertError) {
      logStep("Error creating payment record", insertError);
      throw new Error("Failed to create payment record");
    }
    logStep("Payment record created", { id: paymentRecord.id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check for existing customer
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    const origin = req.headers.get("origin") || "https://reveil.health";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'The Metabolic Architecture Kit',
              description: 'Comprehensive analysis of Thyroid, Insulin, Cardiac Health, and Hormones. ZRT Weight Management + Thyroid + Cardio Panel.',
            },
            unit_amount: 59900, // $599.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/patient/dashboard?metabolic=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/patient/dashboard?metabolic=canceled`,
      metadata: {
        payment_id: paymentRecord.id,
        patient_id: patientId || '',
        product: 'metabolic_architecture_kit',
        patient_name: name || '',
        patient_email: email
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // Update payment record with session ID
    await supabase
      .from('metabolic_payments')
      .update({ stripe_session_id: session.id })
      .eq('id', paymentRecord.id);

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
