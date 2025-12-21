import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-ALACARTE-CHECKOUT] ${step}${detailsStr}`);
};

// À La Carte Price IDs
const ALACARTE_PRICES: Record<string, { priceId: string; name: string; amount: number }> = {
  testosterone: {
    priceId: "price_1Sga66EOtKRY99puQgPWACIy",
    name: "Testosterone Cream",
    amount: 14900,
  },
  biEst: {
    priceId: "price_1Sga67EOtKRY99puoS8b5U6h",
    name: "Bi-Est Cream",
    amount: 8900,
  },
  progesterone: {
    priceId: "price_1Sga69EOtKRY99puO8NJ5bpx",
    name: "Progesterone",
    amount: 7900,
  },
  followUp: {
    priceId: "price_1Sga6AEOtKRY99puEx0mC3jx",
    name: "Follow-up Consultation",
    amount: 9900,
  },
  labPanel: {
    priceId: "price_1Sga6CEOtKRY99puOXGAaRwh",
    name: "Lab Panel",
    amount: 14900,
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
    logStep("Stripe key verified");

    const body = await req.json();
    const { product_key, patient_email, patient_name, patient_id, quantity = 1 } = body;

    logStep("Request body", { product_key, patient_email, patient_name, patient_id });

    if (!product_key || !ALACARTE_PRICES[product_key]) {
      throw new Error(`Invalid product key: ${product_key}. Valid keys: ${Object.keys(ALACARTE_PRICES).join(", ")}`);
    }

    if (!patient_email) {
      throw new Error("Patient email is required");
    }

    const product = ALACARTE_PRICES[product_key];
    logStep("Product selected", { product });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer already exists
    const customers = await stripe.customers.list({ email: patient_email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing Stripe customer found", { customerId });
    }

    const origin = req.headers.get("origin") || "https://elevatedhealthaugusta.com";

    // Create one-time payment checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : patient_email,
      line_items: [
        {
          price: product.priceId,
          quantity: quantity,
        },
      ],
      mode: "payment",
      success_url: `${origin}/alacarte-success?product=${product_key}`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        patient_id: patient_id || "",
        patient_name: patient_name || "",
        product_key: product_key,
        product_name: product.name,
        type: "alacarte",
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // Store the payment link for tracking
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Optionally log the à la carte order attempt
    try {
      await supabaseClient.from("consultation_bookings").insert({
        customer_email: patient_email,
        customer_name: patient_name || null,
        service_type: `alacarte_${product_key}`,
        status: "pending",
        stripe_session_id: session.id,
        amount_paid: product.amount,
        notes: `À la carte order: ${product.name}`,
      });
      logStep("Order logged in consultation_bookings");
    } catch (dbError) {
      logStep("Failed to log order (non-critical)", { error: dbError });
    }

    return new Response(JSON.stringify({ 
      url: session.url, 
      sessionId: session.id,
      product: product.name,
      amount: product.amount,
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
