import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-MEMBERSHIP-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Check for authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authentication required");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    if (!userData.user?.email) throw new Error("User not authenticated");
    
    const userEmail = userData.user.email;
    const userId = userData.user.id;
    logStep("Authenticated user found", { email: userEmail });

    // LAB REVIEW GATE: Check patient onboarding status
    const { data: patient, error: patientError } = await supabaseClient
      .from("patients")
      .select("id, onboarding_status, full_name")
      .eq("user_id", userId)
      .maybeSingle();

    if (patientError) throw new Error("Failed to fetch patient record");
    if (!patient) throw new Error("Patient record not found");

    // Only allow membership purchase if labs have been reviewed
    const allowedStatuses = ["labs_reviewed", "protocol_approved", "treatment_active", "pending_pharmacy_order"];
    if (!allowedStatuses.includes(patient.onboarding_status || "")) {
      logStep("Membership blocked - labs not reviewed", { 
        status: patient.onboarding_status,
        allowed: allowedStatuses 
      });
      throw new Error("LAB_REVIEW_REQUIRED: Your lab results must be reviewed by a provider before purchasing a membership. Please schedule your Lab Review appointment.");
    }
    
    logStep("Lab review gate passed", { status: patient.onboarding_status });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer already exists
    let customerId: string | undefined;
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Existing Stripe customer found", { customerId });
      }
    }

    const origin = req.headers.get("origin") || "https://elevatedhealthaugusta.com";

    // Create checkout session for Elevated Concierge Membership ($399/mo)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [
        {
          price: "price_1SZiXTEOtKRY99puR7PQUExU", // Elevated Concierge Membership $399/mo
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/patient/dashboard?subscription=success`,
      cancel_url: `${origin}/hormones-women`,
      metadata: {
        user_id: userId || "",
        product: "elevated_concierge_membership",
      },
    });

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
