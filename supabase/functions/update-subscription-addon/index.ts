import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Hormone add-on price tiers
const ADDON_PRICES = {
  none: null,
  tier1: "price_1SZijiEOtKRY99puzJbPH0H0", // $75/mo - Single Hormone
  tier2: "price_1SZj9tEOtKRY99pujZd5xMd9", // $125/mo - Dual Hormone
  tier3: "price_1SZjAAEOtKRY99puFwqI2CTV", // $175/mo - Trifecta
};

// Base membership prices (for reference)
const BASE_PRICES = {
  metabolic: "price_1SZiXTEOtKRY99puR7PQUExU", // $399/mo
  vitality: "price_1SZickEOtKRY99pu7j2PtWZm",  // $199/mo
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[UPDATE-SUBSCRIPTION-ADDON] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify admin/staff authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Invalid authorization");

    // Check for admin/staff role
    const { data: roles } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id);

    const hasAccess = roles?.some(r => r.role === "admin" || r.role === "staff");
    if (!hasAccess) throw new Error("Unauthorized - admin/staff access required");

    logStep("Admin authorized", { userId: userData.user.id });

    const { customer_email, addon_tier, patient_id } = await req.json();
    
    if (!customer_email) throw new Error("Customer email is required");
    logStep("Request received", { customer_email, addon_tier, patient_id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Find customer by email
    const customers = await stripe.customers.list({ email: customer_email, limit: 1 });
    if (customers.data.length === 0) {
      throw new Error(`No Stripe customer found for email: ${customer_email}`);
    }
    const customerId = customers.data[0].id;
    logStep("Found customer", { customerId });

    // Get active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      throw new Error("No active subscription found for this customer");
    }

    const subscription = subscriptions.data[0];
    logStep("Found subscription", { subscriptionId: subscription.id });

    // Find existing addon item (if any) - items that are NOT the base membership
    const existingAddonItem = subscription.items.data.find((item: any) => {
      const priceId = item.price.id;
      return Object.values(ADDON_PRICES).includes(priceId);
    });

    const newAddonPriceId = ADDON_PRICES[addon_tier as keyof typeof ADDON_PRICES];

    // Build items array for subscription update
    const items: any[] = [];

    // If there's an existing addon, mark it for deletion
    if (existingAddonItem) {
      items.push({ id: existingAddonItem.id, deleted: true });
      logStep("Removing existing addon", { itemId: existingAddonItem.id });
    }

    // If new tier is not "none", add the new addon
    if (newAddonPriceId) {
      items.push({ price: newAddonPriceId, quantity: 1 });
      logStep("Adding new addon", { priceId: newAddonPriceId });
    }

    // Update subscription if there are changes
    if (items.length > 0) {
      const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
        items,
        proration_behavior: "create_prorations",
      });
      logStep("Subscription updated", { 
        subscriptionId: updatedSubscription.id,
        itemCount: updatedSubscription.items.data.length
      });
    } else {
      logStep("No changes needed");
    }

    // Calculate new total
    const refreshedSub = await stripe.subscriptions.retrieve(subscription.id);
    let monthlyTotal = 0;
    for (const item of refreshedSub.items.data) {
      monthlyTotal += (item.price.unit_amount || 0) * (item.quantity || 1);
    }

    // Update patient record with addon tier (optional tracking)
    if (patient_id) {
      await supabaseClient
        .from("patients")
        .update({ 
          medical_history: {
            ...((await supabaseClient.from("patients").select("medical_history").eq("id", patient_id).single()).data?.medical_history || {}),
            hormone_addon_tier: addon_tier,
          }
        })
        .eq("id", patient_id);
      logStep("Patient record updated", { patient_id, addon_tier });
    }

    return new Response(JSON.stringify({ 
      success: true,
      addon_tier,
      monthly_total_cents: monthlyTotal,
      monthly_total_formatted: `$${(monthlyTotal / 100).toFixed(2)}/mo`
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
