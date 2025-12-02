import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-HORMONE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { session_id } = await req.json();
    if (!session_id) {
      throw new Error("session_id is required");
    }
    logStep("Session ID received", { session_id });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['payment_intent', 'customer'],
    });
    logStep("Checkout session retrieved", { 
      status: session.payment_status,
      customerEmail: session.customer_details?.email 
    });

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Payment not completed" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerEmail = session.customer_details?.email || session.customer_email;
    const paymentIntentId = typeof session.payment_intent === 'string' 
      ? session.payment_intent 
      : session.payment_intent?.id;

    // Check if payment record already exists
    const { data: existingPayment } = await supabaseClient
      .from('hormone_mapping_payments')
      .select('id')
      .eq('stripe_session_id', session_id)
      .single();

    if (existingPayment) {
      logStep("Payment already recorded", { id: existingPayment.id });
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Payment verified",
        email: customerEmail,
        already_recorded: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Find patient by email if they exist
    let patientId: string | null = null;
    if (customerEmail) {
      const { data: patient } = await supabaseClient
        .from('patients')
        .select('id')
        .eq('user_id', session.metadata?.user_id)
        .single();
      
      if (patient) {
        patientId = patient.id;
        logStep("Patient found", { patientId });
      }
    }

    // Insert payment record
    const { data: paymentRecord, error: insertError } = await supabaseClient
      .from('hormone_mapping_payments')
      .insert({
        patient_id: patientId,
        stripe_session_id: session_id,
        stripe_payment_intent_id: paymentIntentId,
        customer_email: customerEmail,
        payment_status: 'paid',
        zrt_kit_status: 'ready_to_ship',
        amount_paid: session.amount_total,
      })
      .select()
      .single();

    if (insertError) {
      logStep("Error inserting payment record", { error: insertError.message });
      throw insertError;
    }

    logStep("Payment record created", { id: paymentRecord.id });

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Payment verified and recorded",
      email: customerEmail,
      payment_id: paymentRecord.id
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
