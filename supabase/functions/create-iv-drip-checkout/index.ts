import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-IV-DRIP-CHECKOUT] ${step}${detailsStr}`);
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
    const { therapy_id, addon_ids = [] } = body;
    
    if (!therapy_id) {
      throw new Error("therapy_id is required");
    }
    logStep("Request parsed", { therapy_id, addon_ids });

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

    // Fetch therapy from database
    const { data: therapy, error: therapyError } = await supabaseClient
      .from("iv_therapies")
      .select("*")
      .eq("id", therapy_id)
      .single();

    if (therapyError || !therapy) {
      throw new Error(`Therapy not found: ${therapy_id}`);
    }
    logStep("Therapy fetched", { name: therapy.name, price: therapy.price });

    // Fetch add-ons if any
    let addons: any[] = [];
    if (addon_ids.length > 0) {
      const { data: addonData, error: addonError } = await supabaseClient
        .from("iv_addons")
        .select("*")
        .in("id", addon_ids);

      if (addonError) {
        throw new Error(`Failed to fetch add-ons: ${addonError.message}`);
      }
      addons = addonData || [];
      logStep("Add-ons fetched", { count: addons.length });
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

    // Build line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    // Add therapy
    if (therapy.stripe_price_id) {
      lineItems.push({
        price: therapy.stripe_price_id,
        quantity: 1,
      });
    } else {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: therapy.name,
            description: therapy.description || undefined,
          },
          unit_amount: Math.round(therapy.price * 100),
        },
        quantity: 1,
      });
    }

    // Add add-ons
    for (const addon of addons) {
      if (addon.stripe_price_id) {
        lineItems.push({
          price: addon.stripe_price_id,
          quantity: 1,
        });
      } else {
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: addon.name,
              description: addon.description || undefined,
            },
            unit_amount: Math.round(addon.price * 100),
          },
          quantity: 1,
        });
      }
    }

    logStep("Line items built", { count: lineItems.length });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/iv-payment-success?session_id={CHECKOUT_SESSION_ID}&therapy=${encodeURIComponent(therapy.name)}`,
      cancel_url: `${origin}/iv-lounge`,
      metadata: {
        user_id: userId || "",
        product: "iv_drip",
        therapy_id: therapy_id,
        therapy_name: therapy.name,
        addon_ids: addon_ids.join(","),
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
