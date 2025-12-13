import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { patientId, patientEmail, patientName } = await req.json();

    if (!patientEmail) {
      throw new Error("Patient email is required");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: patientEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create checkout session for The Elevated Architecture Protocol - $999
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : patientEmail,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "The Elevated Architecture™ Protocol",
              description: "Complete Analysis: Saliva Profile III + Weight Management Panel + Toxic Elements. Unlocks all 5 biological pillars.",
            },
            unit_amount: 99900, // $999
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/patient/dashboard?architecture_payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/patient/dashboard?architecture_payment=cancelled`,
      metadata: {
        patient_id: patientId || "",
        patient_email: patientEmail,
        patient_name: patientName || "",
        payment_type: "elevated_architecture",
      },
    });

    // Create pending payment record
    const { error: insertError } = await supabaseClient
      .from("elevated_architecture_payments")
      .insert({
        patient_id: patientId || null,
        customer_email: patientEmail,
        customer_name: patientName || null,
        stripe_session_id: session.id,
        payment_status: "pending",
        kit_status: "not_ordered",
      });

    if (insertError) {
      console.error("Error creating payment record:", insertError);
    }

    console.log("Elevated Architecture checkout session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating total body checkout:", error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
