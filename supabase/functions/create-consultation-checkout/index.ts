import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CONSULTATION-CHECKOUT] ${step}${detailsStr}`);
};

// Service-specific configuration for Stripe checkout
const SERVICE_CONFIG: Record<string, { name: string; description: string }> = {
  ketamine: {
    name: "Ketamine Therapy Consultation",
    description: "30-minute in-person consultation at our Evans clinic to discuss IV ketamine infusions & SPRAVATO® for depression, PTSD, and anxiety. Includes $99 credit toward treatment."
  },
  weight_loss: {
    name: "Medical Weight Loss Consultation",
    description: "30-minute in-person consultation at our Evans clinic to discuss physician-supervised semaglutide (GLP-1) therapy. Includes $99 credit toward treatment."
  },
  hormone: {
    name: "Hormone Replacement Consultation",
    description: "30-minute in-person consultation at our Evans clinic to discuss bioidentical hormone therapy. Receive your diagnostic kit directly from Lauren. Includes $99 credit toward Hormone Mapping."
  },
  peptide: {
    name: "Peptide Therapy Consultation",
    description: "30-minute in-person consultation at our Evans clinic to discuss Sermorelin, NAD+, PT-141 & GHK-Cu for cellular optimization. Includes $99 credit toward treatment."
  },
  hair: {
    name: "Hair Restoration Consultation",
    description: "30-minute in-person consultation at our Evans clinic to discuss finasteride, minoxidil & PRP therapy for hair regrowth. Includes $99 credit toward treatment."
  },
  sexual: {
    name: "Sexual Wellness Consultation",
    description: "30-minute discreet in-person consultation at our Evans clinic for ED, low libido & intimate health solutions. Includes $99 credit toward treatment."
  }
};

// Generate a unique credit code
const generateCreditCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'EH-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
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

    // Parse request body
    const body = await req.json().catch(() => ({}));
    const serviceType = body.serviceType || "hormone"; // hormone, weight_loss, ketamine, peptide
    logStep("Service type", { serviceType });

    // Validate service type
    const validServiceTypes = ["hormone", "weight_loss", "ketamine", "peptide", "hair", "sexual"];
    if (!validServiceTypes.includes(serviceType)) {
      throw new Error(`Invalid service type: ${serviceType}`);
    }

    // Get service-specific config
    const config = SERVICE_CONFIG[serviceType];

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

    // Check if customer already exists
    let customerId: string | undefined;
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Existing Stripe customer found", { customerId });
      }
    }

    const origin = req.headers.get("origin") || "https://reveil.health";

    // Generate credit code for future mapping discount
    const creditCode = generateCreditCode();
    logStep("Generated credit code", { creditCode });

    // $99 Discovery Consultation - use service-specific config
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: config.name,
              description: config.description,
            },
            unit_amount: 9900, // $99
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      shipping_address_collection: undefined, // No shipping needed for consultation
      success_url: `${origin}/consultation-confirmed?session_id={CHECKOUT_SESSION_ID}&credit=${creditCode}&service=${serviceType}`,
      cancel_url: `${origin}/hormones-women`,
      metadata: {
        user_id: userId || "",
        product: "discovery_consultation",
        service_type: serviceType,
        credit_code: creditCode,
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url, creditCode });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id, creditCode }), {
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
