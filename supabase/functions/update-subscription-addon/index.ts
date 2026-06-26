import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";
import { hasClinicStaffRole } from "../_shared/staff-auth.ts";
import {
  addonStripePrice,
  allComboAddonPriceIds,
  LEGACY_HORMONE_ADDON_PRICE_ID,
  parseComboAddonKey,
  type ComboAddonPriceKey,
} from "../_shared/elevated-combo-prices.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[UPDATE-SUBSCRIPTION-ADDON] ${step}${detailsStr}`);
};

function findAddonItem(subscription: Stripe.Subscription): Stripe.SubscriptionItem | undefined {
  return subscription.items.data.find((item) =>
    allComboAddonPriceIds().includes(item.price.id)
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    edgeStructuredLog("update-subscription-addon", {
      event_type: "request",
      success: true,
      action_taken: "started",
      product_recognition: "elevated_combo_addon",
    });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Invalid authorization");

    const { data: roles } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id);

    if (!hasClinicStaffRole((roles ?? []).map((r) => String(r.role)))) {
      throw new Error("Unauthorized - clinic staff access required");
    }

    const body = await req.json();
    const {
      customer_email,
      patient_id,
      combo_addon,
      /** @deprecated use combo_addon */
      include_hormone_addon,
    } = body as {
      customer_email?: string;
      patient_id?: string;
      combo_addon?: string | null;
      include_hormone_addon?: boolean;
      combo_slug?: string;
    };

    if (!customer_email) throw new Error("Customer email is required");

    let addonKey: ComboAddonPriceKey | null = parseComboAddonKey(combo_addon);
    if (!addonKey && include_hormone_addon === true) {
      addonKey = "trt";
    }
    if (!addonKey && include_hormone_addon === false) {
      addonKey = null;
    }

    logStep("Request received", { customer_email, combo_addon: addonKey, patient_id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const customers = await stripe.customers.list({ email: customer_email, limit: 1 });
    if (customers.data.length === 0) {
      throw new Error(`No Stripe customer found for email: ${customer_email}`);
    }
    const customerId = customers.data[0].id;

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      throw new Error("No active subscription found for this customer");
    }

    const subscription = subscriptions.data[0];
    const existingAddonItem = findAddonItem(subscription);
    const targetPriceId = addonKey ? addonStripePrice(addonKey) : null;

    const items: Stripe.SubscriptionUpdateParams.Item[] = [];

    if (addonKey && !existingAddonItem) {
      items.push({ price: targetPriceId!, quantity: 1 });
      logStep("Adding combo add-on", { addonKey, priceId: targetPriceId });
    } else if (addonKey && existingAddonItem && existingAddonItem.price.id !== targetPriceId) {
      items.push({ id: existingAddonItem.id, deleted: true });
      items.push({ price: targetPriceId!, quantity: 1 });
      logStep("Swapping combo add-on", { from: existingAddonItem.price.id, to: targetPriceId });
    } else if (!addonKey && existingAddonItem) {
      items.push({ id: existingAddonItem.id, deleted: true });
      logStep("Removing combo add-on", { itemId: existingAddonItem.id });
    }

    if (items.length > 0) {
      await stripe.subscriptions.update(subscription.id, {
        items,
        proration_behavior: "create_prorations",
      });
    } else {
      logStep("No subscription changes needed");
    }

    const refreshedSub = await stripe.subscriptions.retrieve(subscription.id);
    let monthlyTotal = 0;
    for (const item of refreshedSub.items.data) {
      monthlyTotal += (item.price.unit_amount || 0) * (item.quantity || 1);
    }

    if (patient_id) {
      const { data: patientData } = await supabaseClient
        .from("patients")
        .select("medical_history")
        .eq("id", patient_id)
        .single();

      const hormoneLegacy =
        addonKey === "trt" || addonKey === "hrt" || refreshedSub.items.data.some(
          (i) => i.price.id === LEGACY_HORMONE_ADDON_PRICE_ID,
        );

      await supabaseClient
        .from("patients")
        .update({
          elevated_program_addon: addonKey,
          medical_history: {
            ...(patientData?.medical_history as Record<string, unknown> || {}),
            has_hormone_addon: hormoneLegacy,
            combo_addon: addonKey,
          },
        })
        .eq("id", patient_id);
    }

    edgeStructuredLog("update-subscription-addon", {
      event_type: "complete",
      success: true,
      action_taken: "subscription_addon_updated",
      product_recognition: "elevated_combo_addon",
    });

    return new Response(
      JSON.stringify({
        success: true,
        combo_addon: addonKey,
        has_hormone_addon: addonKey === "trt" || addonKey === "hrt",
        monthly_total_cents: monthlyTotal,
        monthly_total_formatted: `$${(monthlyTotal / 100).toFixed(2)}/mo`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
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
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
