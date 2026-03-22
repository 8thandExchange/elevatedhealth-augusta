import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const checkoutRequestSchema = z.object({
  name: z.string().max(100, "Name too long").optional(),
  email: z.string().email("Invalid email format").max(255, "Email too long"),
  phone: z.string().max(20, "Phone too long").optional(),
});

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-KETAMINE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const rawBody = await req.json();
    
    // Validate input against schema
    const validationResult = checkoutRequestSchema.safeParse(rawBody);
    if (!validationResult.success) {
      logStep("Validation error", { errors: validationResult.error.errors });
      return new Response(
        JSON.stringify({ error: "Invalid request format: " + validationResult.error.errors[0]?.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    const { name, email, phone } = validationResult.data;
    logStep("Validated request data received", { name, email: email.substring(0, 5) + "***", phone });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer already exists
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId: string | undefined;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email,
        name: name || undefined,
        phone: phone || undefined,
        metadata: {
          service: "ketamine_therapy"
        }
      });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    // Create checkout session
    const origin = req.headers.get("origin") || "https://reveil.health";
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: "price_1Sa5jwEOtKRY99puYK2lpDw5", // Ketamine Therapy Deposit - $150
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/ketamine-payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/ketamine`,
      metadata: {
        service: "ketamine_therapy",
        patient_name: name || "",
        patient_email: email,
        patient_phone: phone || ""
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
