import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tier configuration
const MEMBERSHIP_TIERS = {
  access: {
    priceId: "price_1Sonn4EOtKRY99puEv2aLJ7U",
    name: "ACCESS",
    amount: 9900,
  },
  vitality: {
    priceId: "price_1Sonn6EOtKRY99puceDBRyq4",
    name: "VITALITY",
    amount: 14900,
  },
  concierge: {
    priceId: "price_1Sonn7EOtKRY99pu1jcQC9Dz",
    name: "CONCIERGE",
    amount: 24900,
  },
} as const;

// Input validation schema
const checkoutSchema = z.object({
  tier: z.enum(["access", "vitality", "concierge"]),
  patientId: z.string().uuid().optional(),
});

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-HORMONE-MEMBERSHIP-CHECKOUT] ${step}${detailsStr}`);
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

    // Parse and validate request body
    const rawBody = await req.json().catch(() => ({}));
    
    const validationResult = checkoutSchema.safeParse(rawBody);
    if (!validationResult.success) {
      logStep("Validation error", { errors: validationResult.error.errors });
      return new Response(
        JSON.stringify({ error: "Invalid request format. Tier must be 'access', 'vitality', or 'concierge'" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    const { tier, patientId } = validationResult.data;
    const tierConfig = MEMBERSHIP_TIERS[tier];
    logStep("Tier selected", { tier, tierConfig });

    // Check for authenticated user
    const authHeader = req.headers.get("Authorization");
    let userEmail: string | undefined;
    let userId: string | undefined;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseClient.auth.getUser(token);
      if (userData.user?.email) {
        userEmail = userData.user.email;
        userId = userData.user.id;
        logStep("Authenticated user found", { email: userEmail, userId });
      }
    }

    // If patientId provided, fetch patient email
    if (patientId && !userEmail) {
      const { data: patient } = await supabaseClient
        .from("patients")
        .select("email, full_name")
        .eq("id", patientId)
        .single();
      
      if (patient?.email) {
        userEmail = patient.email;
        logStep("Patient email fetched", { email: userEmail });
      }
    }

    if (!userEmail) {
      throw new Error("User email is required. Please log in or provide a patient ID.");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer already exists
    let customerId: string | undefined;
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing Stripe customer found", { customerId });
    }

    const origin = req.headers.get("origin") || "https://elevatedhealthaugusta.com";

    // Create subscription checkout session
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
      success_url: `${origin}/patient-dashboard?membership=activated&tier=${tier}`,
      cancel_url: `${origin}/hormones-women`,
      metadata: {
        user_id: userId || "",
        patient_id: patientId || "",
        product: "hormone_membership",
        tier: tier,
        tier_name: tierConfig.name,
      },
      subscription_data: {
        metadata: {
          tier: tier,
          tier_name: tierConfig.name,
          product: "hormone_membership",
        },
      },
    });

    logStep("Checkout session created", { 
      sessionId: session.id, 
      url: session.url, 
      tier: tierConfig.name 
    });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id, tier: tier }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
