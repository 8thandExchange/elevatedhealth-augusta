import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tier-based pricing configuration
const SEMAGLUTIDE_PRICES = {
  full: { priceId: "price_1SlZnwEOtKRY99puaBhrh2iB", amount: 39900 },
  vitality: { priceId: "price_1Soo27EOtKRY99punKCdKBDe", amount: 35900 },
  concierge: { priceId: "price_1Soo29EOtKRY99pulu8UKUJt", amount: 33900 },
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEMAGLUTIDE-CHECKOUT] ${step}${detailsStr}`);
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

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { email, name, patientId } = await req.json();
    logStep("Request body parsed", { email, name, patientId });

    // Check for hormone membership tier to apply discount
    let membershipTier: string | null = null;
    
    if (patientId) {
      const { data: patient } = await supabaseClient
        .from("patients")
        .select("membership_tier, email")
        .eq("id", patientId)
        .single();
      
      if (patient?.membership_tier) {
        membershipTier = patient.membership_tier;
        logStep("Patient membership tier found", { tier: membershipTier });
      }
    } else if (email) {
      // Check by email if no patientId
      const { data: patient } = await supabaseClient
        .from("patients")
        .select("membership_tier")
        .eq("email", email)
        .single();
      
      if (patient?.membership_tier) {
        membershipTier = patient.membership_tier;
        logStep("Patient membership tier found by email", { tier: membershipTier });
      }
    }

    // Determine which price to use based on hormone membership tier
    let priceConfig = SEMAGLUTIDE_PRICES.full;
    if (membershipTier === "vitality") {
      priceConfig = SEMAGLUTIDE_PRICES.vitality;
      logStep("Applying VITALITY discount (10% off)", { priceId: priceConfig.priceId });
    } else if (membershipTier === "concierge") {
      priceConfig = SEMAGLUTIDE_PRICES.concierge;
      logStep("Applying CONCIERGE discount (15% off)", { priceId: priceConfig.priceId });
    } else {
      logStep("No hormone membership - using full price", { priceId: priceConfig.priceId });
    }

    // Check if customer exists
    let customerId: string | undefined;
    if (email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing customer", { customerId });
      }
    }

    const origin = req.headers.get("origin") || "https://reveil.health";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [
        {
          price: priceConfig.priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/payment-success?type=semaglutide`,
      cancel_url: `${origin}/weight-loss`,
      metadata: {
        service_type: "semaglutide_membership",
        patient_name: name || "",
        patient_email: email || "",
        patient_id: patientId || "",
        hormone_tier: membershipTier || "none",
      },
      subscription_data: {
        metadata: {
          service_type: "semaglutide_membership",
          patient_name: name || "",
          hormone_tier: membershipTier || "none",
        },
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url, priceUsed: priceConfig.priceId });

    // Record pending subscription in database
    if (email) {
      await supabaseClient.from("consultation_bookings").insert({
        customer_email: email,
        customer_name: name || null,
        service_type: "semaglutide_membership",
        status: "pending_payment",
        stripe_session_id: session.id,
        notes: membershipTier 
          ? `Semaglutide Membership - ${membershipTier.toUpperCase()} member discount applied`
          : "Semaglutide Membership subscription - $399/month",
      });
      logStep("Pending subscription recorded in database");
    }

    return new Response(JSON.stringify({ url: session.url }), {
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