import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-ACTIVATION-SMS] ${step}${detailsStr}`);
};

// Stripe price IDs for memberships and add-ons
const PRICE_IDS = {
  // Base memberships
  metabolic: "price_1SZiXTEOtKRY99puR7PQUExU", // $399/mo Metabolic Membership
  vitality: "price_1SZickEOtKRY99pu7j2PtWZm", // $199/mo Vitality Membership
  // Hormone add-on tiers
  tier1: "price_1SZijiEOtKRY99puzJbPH0H0", // $75/mo Tier 1 - Single Hormone
  tier2: "price_1SZj9tEOtKRY99pujZd5xMd9", // $125/mo Tier 2 - Dual Hormone
  tier3: "price_1SZjAAEOtKRY99puFwqI2CTV", // $175/mo Tier 3 - Trifecta
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

    const body = await req.json();
    const { 
      first_name, 
      phone, 
      base_membership = "metabolic", 
      addon_tier = "none",
      patient_email 
    } = body;

    logStep("Request body received", { first_name, phone, base_membership, addon_tier });

    if (!first_name) {
      throw new Error("Missing required field: first_name is required");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Build line items based on selected membership and tier
    const lineItems: Array<{ price: string; quantity: number }> = [];

    // Add base membership
    const basePriceId = PRICE_IDS[base_membership as keyof typeof PRICE_IDS];
    if (!basePriceId) {
      throw new Error(`Invalid base membership: ${base_membership}`);
    }
    lineItems.push({ price: basePriceId, quantity: 1 });
    logStep("Added base membership", { base_membership, price_id: basePriceId });

    // Add hormone add-on tier if selected (not "none")
    if (addon_tier && addon_tier !== "none") {
      const addonPriceId = PRICE_IDS[addon_tier as keyof typeof PRICE_IDS];
      if (addonPriceId) {
        lineItems.push({ price: addonPriceId, quantity: 1 });
        logStep("Added hormone addon tier", { addon_tier, price_id: addonPriceId });
      }
    }

    // Create Stripe Checkout session for subscription
    const origin = req.headers.get("origin") || "https://elevatedhealthaugusta.com";
    
    const session = await stripe.checkout.sessions.create({
      customer_email: patient_email || undefined,
      line_items: lineItems,
      mode: "subscription",
      success_url: `${origin}/patient/dashboard?subscription=activated`,
      cancel_url: `${origin}/`,
      metadata: {
        first_name,
        phone: phone || "",
        base_membership,
        addon_tier,
      },
    });

    logStep("Stripe Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ 
      success: true, 
      payment_link: session.url,
      message: "Activation link generated successfully."
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
