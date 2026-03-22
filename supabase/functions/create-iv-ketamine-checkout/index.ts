import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-IV-KETAMINE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { patientName, patientEmail, patientPhone, sessionNumber, bundle, name, email, patientId } = await req.json();
    
    // Support both naming conventions from different callers
    const finalEmail = patientEmail || email;
    const finalName = patientName || name;
    
    if (!finalEmail) {
      throw new Error("Patient email is required");
    }
    logStep("Request data received", { finalName, finalEmail, patientPhone, sessionNumber, bundle });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer already exists
    const customers = await stripe.customers.list({ email: finalEmail, limit: 1 });
    let customerId: string | undefined;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: finalEmail,
        name: finalName || undefined,
        phone: patientPhone || undefined,
        metadata: {
          service: bundle ? "iv_ketamine_bundle" : "iv_ketamine_infusion"
        }
      });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    // Determine price based on bundle or single session
    const priceId = bundle 
      ? "price_1SwlYrEOtKRY99puuA7PwoYc" // 6-Session Bundle - $2,200
      : "price_1SaYv3EOtKRY99pulkr4H1At"; // Single IV Ketamine Infusion - $400

    // Create checkout session
    const origin = req.headers.get("origin") || "https://reveil.health";
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/ketamine-payment-success?session_id={CHECKOUT_SESSION_ID}&type=${bundle ? "bundle" : "infusion"}`,
      cancel_url: `${origin}/ketamine`,
      metadata: {
        service: bundle ? "iv_ketamine_bundle" : "iv_ketamine_infusion",
        patient_name: finalName || "",
        patient_email: finalEmail,
        patient_phone: patientPhone || "",
        patient_id: patientId || "",
        session_number: bundle ? "1-6" : (sessionNumber?.toString() || "1"),
        sessions_total: bundle ? "6" : "1"
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
