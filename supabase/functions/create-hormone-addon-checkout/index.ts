import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[HORMONE-ADDON-CHECKOUT] ${step}${detailsStr}`);
};

// Hormone Add-On for GLP-1 Members - $149/mo
const HORMONE_ADDON_PRICE_ID = "price_1SmMlOEOtKRY99puBAxTpw99";

// GLP-1 Price IDs (Semaglutide and Tirzepatide)
const GLP1_PRICE_IDS = [
  "price_1SlZnwEOtKRY99puaBhrh2iB", // Semaglutide $399/mo
  "price_1SlZnyEOtKRY99puE9JNOrTR", // Tirzepatide $499/mo
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Get patient_id from query params or body
    const url = new URL(req.url);
    let patientId = url.searchParams.get("patient_id");
    let patientEmail: string | null = null;

    if (!patientId && req.method === "POST") {
      const body = await req.json();
      patientId = body.patient_id;
      patientEmail = body.patient_email;
    }

    if (!patientId) {
      throw new Error("patient_id is required");
    }
    logStep("Patient ID received", { patientId });

    // Get patient email from database if not provided
    if (!patientEmail) {
      const { data: patient, error: patientError } = await supabaseClient
        .from("patients")
        .select("email, full_name")
        .eq("id", patientId)
        .single();

      if (patientError || !patient?.email) {
        throw new Error("Patient not found or has no email");
      }
      patientEmail = patient.email;
    }
    logStep("Patient email found", { patientEmail });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer exists in Stripe
    const customers = await stripe.customers.list({ email: patientEmail!, limit: 1 });
    let customerId: string | undefined;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });

      // Verify they have an active GLP-1 subscription
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 100,
      });

      const hasGlp1Subscription = subscriptions.data.some((sub: any) =>
        sub.items.data.some((item: any) =>
          GLP1_PRICE_IDS.includes(item.price.id)
        )
      );

      if (!hasGlp1Subscription) {
        logStep("No active GLP-1 subscription found");
        return new Response(
          JSON.stringify({
            error: "Hormone add-on is only available for Semaglutide or Tirzepatide members. Please start a GLP-1 membership first.",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      logStep("Active GLP-1 subscription verified");
    } else {
      logStep("No Stripe customer found - cannot add hormone add-on without GLP-1 subscription");
      return new Response(
        JSON.stringify({
          error: "Hormone add-on is only available for existing GLP-1 members. Please start a Semaglutide or Tirzepatide membership first.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create checkout session for hormone add-on subscription
    const origin = req.headers.get("origin") || "https://reveil.health";
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: HORMONE_ADDON_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/payment-success?type=hormone-addon`,
      cancel_url: `${origin}/?canceled=true`,
      metadata: {
        patient_id: patientId,
        type: "hormone_addon",
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
