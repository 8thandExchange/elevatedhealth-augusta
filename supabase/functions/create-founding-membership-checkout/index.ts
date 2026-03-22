import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FOUNDING-MEMBERSHIP-CHECKOUT] ${step}${detailsStr}`);
};

// Founding member tier → Stripe price ID mapping
const TIER_PRICES: Record<string, { priceId: string; name: string }> = {
  wellnessPass: {
    priceId: "price_1TDovoEOtKRY99pus14I47X3",
    name: "Wellness Pass — Founding Member",
  },
  longevityProtocol: {
    priceId: "price_1TDovpEOtKRY99pu8sW2tl9N",
    name: "Longevity Protocol — Founding Member",
  },
  executiveConcierge: {
    priceId: "price_1TDovsEOtKRY99puPtteAgOu",
    name: "Executive Concierge — Founding Member",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const body = await req.json().catch(() => ({}));
    const tier = body.tier as string;
    logStep("Requested tier", { tier });

    if (!tier || !TIER_PRICES[tier]) {
      throw new Error(`Invalid membership tier: ${tier}. Valid: ${Object.keys(TIER_PRICES).join(", ")}`);
    }

    const tierConfig = TIER_PRICES[tier];

    // Check for authenticated user (optional — supports guest checkout)
    const authHeader = req.headers.get("Authorization");
    let userEmail: string | undefined;
    let userId: string | undefined;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseClient.auth.getUser(token);
      if (userData.user?.email) {
        userEmail = userData.user.email;
        userId = userData.user.id;
        logStep("Authenticated user", { email: userEmail });
      }
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    let customerId: string | undefined;
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Existing Stripe customer", { customerId });
      }
    }

    const origin = req.headers.get("origin") || "https://reveil.health";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [
        {
          price: tierConfig.priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/membership?success=true&tier=${tier}`,
      cancel_url: `${origin}/membership`,
      metadata: {
        user_id: userId || "",
        product: "founding_membership",
        tier: tier,
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
