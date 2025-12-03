import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADD-PEPTIDE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify admin/staff authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);

    const userId = userData.user?.id;
    if (!userId) throw new Error("User not authenticated");

    // Check if user has admin or staff role
    const { data: roles } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const hasAccess = roles?.some((r) => r.role === "admin" || r.role === "staff");
    if (!hasAccess) throw new Error("Unauthorized: admin or staff role required");
    logStep("Authorization verified");

    const { patient_email, price_id, peptide_type, is_recurring } = await req.json();
    logStep("Request body", { patient_email, price_id, peptide_type, is_recurring });

    if (!patient_email || !price_id) {
      throw new Error("Missing required fields: patient_email, price_id");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Find customer in Stripe
    const customers = await stripe.customers.list({ email: patient_email, limit: 1 });
    
    if (is_recurring) {
      // For recurring items, add to existing subscription or create checkout
      if (customers.data.length > 0) {
        const customerId = customers.data[0].id;
        logStep("Found existing customer", { customerId });

        // Check for active subscription
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: "active",
          limit: 1,
        });

        if (subscriptions.data.length > 0) {
          // Add item to existing subscription
          const subscription = subscriptions.data[0];
          logStep("Adding to existing subscription", { subscriptionId: subscription.id });

          const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
            items: [
              ...subscription.items.data.map((item: { id: string }) => ({ id: item.id })),
              { price: price_id },
            ],
            proration_behavior: "create_prorations",
          });

          logStep("Subscription updated", { newItemCount: updatedSubscription.items.data.length });

          return new Response(
            JSON.stringify({
              success: true,
              message: "Peptide added to subscription",
              subscription_id: updatedSubscription.id,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        }
      }

      // No existing subscription - create a checkout session for new subscription
      logStep("No active subscription, creating checkout session");

      const session = await stripe.checkout.sessions.create({
        customer: customers.data[0]?.id,
        customer_email: customers.data.length === 0 ? patient_email : undefined,
        line_items: [{ price: price_id, quantity: 1 }],
        mode: "subscription",
        success_url: `${req.headers.get("origin")}/provider/dashboard?peptide_added=true`,
        cancel_url: `${req.headers.get("origin")}/provider/dashboard`,
        metadata: {
          peptide_type,
          patient_email,
        },
      });

      return new Response(
        JSON.stringify({ url: session.url }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    } else {
      // One-time payment - always create a checkout session
      logStep("Creating one-time payment session");

      const session = await stripe.checkout.sessions.create({
        customer: customers.data[0]?.id,
        customer_email: customers.data.length === 0 ? patient_email : undefined,
        line_items: [{ price: price_id, quantity: 1 }],
        mode: "payment",
        success_url: `${req.headers.get("origin")}/provider/dashboard?peptide_purchased=true`,
        cancel_url: `${req.headers.get("origin")}/provider/dashboard`,
        metadata: {
          peptide_type,
          patient_email,
        },
      });

      return new Response(
        JSON.stringify({ url: session.url }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
