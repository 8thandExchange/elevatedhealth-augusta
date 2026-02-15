import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const hormoneCheckoutSchema = z.object({
  mappingType: z.enum(["hormone", "metabolic"]).optional(),
});

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-HORMONE-CHECKOUT] ${step}${detailsStr}`);
};

// Flat $250 pricing — no credit codes
const MAPPING_TIERS = {
  hormone: {
    priceId: "price_1T1AbVEOtKRY99pumPdgj1k3",
    name: "Hormone Mapping Panel",
    zrtPanel: "saliva_iii",
    amount: 25000, // $250
  },
  metabolic: {
    priceId: "price_1Sa4bNEOtKRY99pulS73hT1V",
    name: "Metabolic Mapping",
    zrtPanel: "weight_management",
    amount: 25000, // $250
  },
};

// Membership tier lab discounts (in cents, based on $250)
const TIER_LAB_DISCOUNTS = {
  access: { percent: 20, amount: 5000 },   // 20% off = $50 discount
  vitality: { percent: 30, amount: 7500 },  // 30% off = $75 discount
  concierge: { percent: 40, amount: 10000 }, // 40% off = $100 discount
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

    const rawBody = await req.json().catch(() => ({}));
    
    const validationResult = hormoneCheckoutSchema.safeParse(rawBody);
    if (!validationResult.success) {
      logStep("Validation error", { errors: validationResult.error.errors });
      return new Response(
        JSON.stringify({ error: "Invalid request format" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    const { mappingType = "hormone" } = validationResult.data;
    
    const tier = MAPPING_TIERS[mappingType as keyof typeof MAPPING_TIERS] || MAPPING_TIERS.hormone;
    logStep("Mapping tier selected", { mappingType, tier: tier.name, priceId: tier.priceId });

    // Check for authenticated user (optional - supports guest checkout)
    const authHeader = req.headers.get("Authorization");
    let userEmail: string | undefined;
    let userId: string | undefined;
    let membershipTier: string | null = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseClient.auth.getUser(token);
      if (userData.user?.email) {
        userEmail = userData.user.email;
        userId = userData.user.id;
        logStep("Authenticated user found", { email: userEmail });

        const { data: patient } = await supabaseClient
          .from("patients")
          .select("membership_tier")
          .eq("email", userEmail)
          .maybeSingle();
        
        if (patient?.membership_tier) {
          membershipTier = patient.membership_tier;
          logStep("Patient membership tier found", { membershipTier });
        }
      }
    }

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

    // Calculate membership discount only
    let totalDiscount = 0;
    const discountDescriptions: string[] = [];

    if (membershipTier && membershipTier in TIER_LAB_DISCOUNTS) {
      const tierDiscount = TIER_LAB_DISCOUNTS[membershipTier as keyof typeof TIER_LAB_DISCOUNTS];
      totalDiscount += tierDiscount.amount;
      discountDescriptions.push(`${tierDiscount.percent}% ${membershipTier.toUpperCase()} member discount`);
    }

    const finalAmount = Math.max(tier.amount - totalDiscount, 0);
    logStep("Discount calculation", { 
      originalAmount: tier.amount, 
      totalDiscount, 
      finalAmount, 
      discounts: discountDescriptions 
    });

    // Use price ID directly if no discount, otherwise use price_data
    const lineItems = totalDiscount > 0
      ? [{
          price_data: {
            currency: "usd",
            product_data: {
              name: `${tier.name} (Discounted)`,
              description: `At-home ${tier.name.toLowerCase()} test kit + follow-up consultation. ${discountDescriptions.join(", ")}`,
            },
            unit_amount: finalAmount,
          },
          quantity: 1,
        }]
      : [{
          price: tier.priceId,
          quantity: 1,
        }];

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: lineItems,
      mode: "payment",
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      success_url: `${origin}/schedule-consult?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/hormones-women`,
      metadata: {
        user_id: userId || "",
        product: mappingType === "metabolic" ? "metabolic_mapping_package" : "hormone_mapping_package",
        zrt_panel: tier.zrtPanel,
        membership_tier: membershipTier || "",
        discount_applied: String(totalDiscount / 100),
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url, tier: tier.name });

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
