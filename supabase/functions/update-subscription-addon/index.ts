import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";
import { hasClinicStaffRole } from "../_shared/staff-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Legacy hormone subscription add-on SKU (pre–ELEVATED program catalog).
 * Retained for existing Stripe subscriptions that still reference this item.
 * New enrollments should use program-specific checkouts instead of stacking this add-on.
 */
const HORMONE_ADDON_PRICE_ID = "price_1SmMlOEOtKRY99puBAxTpw99"; // $149/mo

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[UPDATE-SUBSCRIPTION-ADDON] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    edgeStructuredLog("update-subscription-addon", {
      event_type: "request",
      success: true,
      action_taken: "started",
      product_recognition: "unknown",
    });
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

    const hasAccess = hasClinicStaffRole((roles ?? []).map((r) => String(r.role)));
    if (!hasAccess) throw new Error("Unauthorized - clinic staff access required");

    logStep("Admin authorized", { userId: userData.user.id });

    const { customer_email, include_hormone_addon, patient_id } = await req.json();
    
    if (!customer_email) throw new Error("Customer email is required");
    logStep("Request received", { customer_email, include_hormone_addon, patient_id });

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

    // Find existing addon item (if any)
    const existingAddonItem = subscription.items.data.find((item: any) => {
      return item.price.id === HORMONE_ADDON_PRICE_ID;
    });

    // Build items array for subscription update
    const items: any[] = [];

    if (include_hormone_addon && !existingAddonItem) {
      // Add the hormone addon
      items.push({ price: HORMONE_ADDON_PRICE_ID, quantity: 1 });
      logStep("Adding hormone addon", { priceId: HORMONE_ADDON_PRICE_ID });
    } else if (!include_hormone_addon && existingAddonItem) {
      // Remove the hormone addon
      items.push({ id: existingAddonItem.id, deleted: true });
      logStep("Removing hormone addon", { itemId: existingAddonItem.id });
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

    // Update patient record with addon status
    if (patient_id) {
      const { data: patientData } = await supabaseClient
        .from("patients")
        .select("medical_history")
        .eq("id", patient_id)
        .single();
      
      await supabaseClient
        .from("patients")
        .update({ 
          medical_history: {
            ...(patientData?.medical_history || {}),
            has_hormone_addon: include_hormone_addon,
          }
        })
        .eq("id", patient_id);
      logStep("Patient record updated", { patient_id, has_hormone_addon: include_hormone_addon });
    }

    edgeStructuredLog("update-subscription-addon", {
      event_type: "complete",
      success: true,
      action_taken: "subscription_addon_updated",
      product_recognition: "unknown",
    });

    return new Response(JSON.stringify({ 
      success: true,
      has_hormone_addon: include_hormone_addon,
      monthly_total_cents: monthlyTotal,
      monthly_total_formatted: `$${(monthlyTotal / 100).toFixed(2)}/mo`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    edgeStructuredLog(
      "update-subscription-addon",
      {
        event_type: "error",
        success: false,
        action_taken: "handler_failed",
        error_message: errorMessage,
      },
      "error",
    );
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});