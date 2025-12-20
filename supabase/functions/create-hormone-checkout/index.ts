import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-HORMONE-CHECKOUT] ${step}${detailsStr}`);
};

// Two diagnostic tiers - both now $349 (comprehensive Saliva + Blood Spot)
const MAPPING_TIERS = {
  hormone: {
    priceId: "price_1SZiRMEOtKRY99pua6QMu12h", // Hormone Mapping $349
    name: "Hormone Mapping",
    zrtPanel: "saliva_iii",
    amount: 34900, // cents - $349
  },
  metabolic: {
    priceId: "price_1Sa4bNEOtKRY99pulS73hT1V", // Metabolic Mapping $349
    name: "Metabolic Mapping",
    zrtPanel: "weight_management",
    amount: 34900, // cents - $349
  },
};

// $99 credit discount
const CONSULTATION_CREDIT_DISCOUNT = 9900; // $99 in cents

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

    // Parse request body for mapping type and credit code
    const body = await req.json().catch(() => ({}));
    const mappingType = body.mappingType || "hormone"; // Default to hormone mapping
    const creditCode = body.creditCode || null;
    
    const tier = MAPPING_TIERS[mappingType as keyof typeof MAPPING_TIERS] || MAPPING_TIERS.hormone;
    logStep("Mapping tier selected", { mappingType, tier: tier.name, priceId: tier.priceId, creditCode });

    // Check for authenticated user (optional - supports guest checkout)
    const authHeader = req.headers.get("Authorization");
    let userEmail: string | undefined;
    let userId: string | undefined;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseClient.auth.getUser(token);
      if (userData.user?.email) {
        userEmail = userData.user.email;
        userId = userData.user.id;
        logStep("Authenticated user found", { email: userEmail });
      }
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if credit code is valid
    let validCreditCode = false;
    if (creditCode) {
      const { data: creditRecord } = await supabaseClient
        .from("consultation_bookings")
        .select("id, credit_used_at")
        .eq("credit_code", creditCode)
        .is("credit_used_at", null)
        .maybeSingle();
      
      if (creditRecord) {
        validCreditCode = true;
        logStep("Valid credit code found", { creditCode, recordId: creditRecord.id });
      } else {
        logStep("Invalid or already used credit code", { creditCode });
      }
    }

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

    // Calculate final amount with discount if credit code is valid
    const discountAmount = validCreditCode ? CONSULTATION_CREDIT_DISCOUNT : 0;
    const finalAmount = tier.amount - discountAmount;

    // Create checkout session - use price_data if discount applied, otherwise use price ID
    const lineItems = validCreditCode
      ? [{
          price_data: {
            currency: "usd",
            product_data: {
              name: `${tier.name} (with $99 credit applied)`,
              description: `At-home ${tier.name.toLowerCase()} test kit + lab review consultation. Credit code: ${creditCode}`,
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
        credit_code: validCreditCode ? creditCode : "",
        discount_applied: validCreditCode ? "99" : "0",
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