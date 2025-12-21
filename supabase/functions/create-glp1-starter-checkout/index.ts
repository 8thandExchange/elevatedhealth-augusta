import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-GLP1-STARTER-CHECKOUT] ${step}${detailsStr}`);
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // GLP-1 Starter Month price ID (created in Stripe)
    const GLP1_STARTER_PRICE_ID = "price_1SgcM9EOtKRY99puXlVr5s6o";

    // Parse request body
    const { customerEmail, customerName } = await req.json().catch(() => ({}));
    logStep("Request parsed", { customerEmail, customerName });

    // Get origin for success/cancel URLs
    const origin = req.headers.get("origin") || "https://elevatedhealthaugusta.com";

    // Check if customer exists in Stripe
    let customerId: string | undefined;
    if (customerEmail) {
      const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing Stripe customer", { customerId });
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: [
        {
          price: GLP1_STARTER_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/payment-success?type=glp1_starter`,
      cancel_url: `${origin}/weight-loss`,
      payment_method_types: ["card", "klarna", "affirm"],
      metadata: {
        service_type: "glp1_starter",
        customer_name: customerName || "",
      },
    });
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // Record the pending booking in consultation_bookings
    const { error: insertError } = await supabase
      .from("consultation_bookings")
      .insert({
        customer_email: customerEmail || "guest@pending.com",
        customer_name: customerName || null,
        status: "pending_payment",
        service_type: "glp1_starter",
        stripe_session_id: session.id,
        amount_paid: 349,
      });

    if (insertError) {
      logStep("Warning: Failed to insert booking record", { error: insertError.message });
    } else {
      logStep("Booking record created");
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
