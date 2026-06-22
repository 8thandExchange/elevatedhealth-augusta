import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { resolveMemberCouponForCheckout } from "../_shared/member-discount.ts";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    edgeStructuredLog("create-iv-drip-checkout", {
      event_type: "request",
      success: true,
      action_taken: "started",
      product_recognition: "alacarte_fill",
    });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const body = await req.json().catch(() => ({}));
    const { therapy_id, addon_ids = [], patient_id: bodyPatientId, slot_token, intake_id, success_query } = body as {
      therapy_id?: string;
      addon_ids?: string[];
      patient_id?: string;
      slot_token?: string;
      intake_id?: string;
      success_query?: Record<string, string>;
    };

    if (!therapy_id) {
      throw new Error("therapy_id is required");
    }
    if (!slot_token) {
      throw new Error("slot_token is required before checkout");
    }
    if (!intake_id) {
      throw new Error("intake_id is required before checkout");
    }

    const authHeader = req.headers.get("Authorization");
    let userEmail: string | undefined;
    let userId: string | undefined;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseAnon.auth.getUser(token);
      if (userData.user?.email) {
        userEmail = userData.user.email;
        userId = userData.user.id;
      }
    }

    let resolvedPatientId: string | undefined;
    if (userId) {
      const { data: pat } = await supabaseAnon
        .from("patients")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();
      resolvedPatientId = pat?.id ?? undefined;
    }

    const patientId = (typeof bodyPatientId === "string" && bodyPatientId.trim())
      ? bodyPatientId.trim()
      : resolvedPatientId;
    const isGuest = !patientId;

    const discount = await resolveMemberCouponForCheckout(supabaseService, patientId ?? null, "iv_session");

    const { data: intake, error: intakeErr } = await supabaseService
      .from("iv_intake_responses")
      .select("id, screening_result")
      .eq("id", intake_id)
      .maybeSingle();
    if (intakeErr || !intake) {
      throw new Error("Invalid intake_id.");
    }
    if (!["cleared", "warned_acknowledged", "overridden"].includes(intake.screening_result)) {
      throw new Error("IV screening is not cleared for checkout.");
    }

    const { data: therapy, error: therapyError } = await supabaseAnon
      .from("iv_therapies")
      .select("*")
      .eq("id", therapy_id)
      .single();

    if (therapyError || !therapy) {
      throw new Error(`Therapy not found: ${therapy_id}`);
    }

    let addons: any[] = [];
    if (addon_ids.length > 0) {
      const { data: addonData, error: addonError } = await supabaseAnon
        .from("iv_addons")
        .select("*")
        .in("id", addon_ids);

      if (addonError) {
        throw new Error(`Failed to fetch add-ons: ${addonError.message}`);
      }
      addons = addonData || [];
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    let customerId: string | undefined;
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || "https://elevatedhealthaugusta.com";

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    if (therapy.stripe_price_id) {
      lineItems.push({ price: therapy.stripe_price_id, quantity: 1 });
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

    for (const addon of addons) {
      if (addon.stripe_price_id) {
        lineItems.push({ price: addon.stripe_price_id, quantity: 1 });
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

    // IMPORTANT: {CHECKOUT_SESSION_ID} must stay UNENCODED in success_url so
    // Stripe substitutes the real session id. URLSearchParams percent-encodes
    // the braces (%7B...%7D), which Stripe does NOT substitute — that left the
    // success page receiving the literal "{CHECKOUT_SESSION_ID}" and every IV
    // booking silently failing. Build the dynamic params separately, then
    // prepend the literal session_id token (matches every other checkout fn).
    const successParams = new URLSearchParams({
      therapy: therapy.name,
    });
    if (slot_token) successParams.set("slot_token", slot_token);
    if (intake_id) successParams.set("intake_id", intake_id);
    if (success_query && typeof success_query === "object") {
      for (const [key, value] of Object.entries(success_query)) {
        if (typeof value === "string" && value) successParams.set(key, value);
      }
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/iv-payment-success?session_id={CHECKOUT_SESSION_ID}&${successParams.toString()}`,
      cancel_url: `${origin}/iv-lounge`,
      metadata: {
        user_id: userId || "",
        product: "iv_drip",
        therapy_id: therapy_id,
        therapy_name: therapy.name,
        addon_ids: addon_ids.join(","),
        patient_id: patientId || "",
        is_guest_checkout: isGuest ? "true" : "false",
        applied_discount: discount.applied_discount,
        intake_id: intake_id || "",
        slot_token: slot_token || "",
      },
    };

    if (discount.discounts && discount.discounts.length > 0) {
      sessionParams.discounts = discount.discounts;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    edgeStructuredLog("create-iv-drip-checkout", {
      event_type: "checkout_created",
      success: true,
      action_taken: "stripe_checkout_session_created",
      patient_id: patientId || null,
      product_recognition: "alacarte_fill",
    });

    return new Response(JSON.stringify({ url: session.url, session_id: session.id, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    edgeStructuredLog(
      "create-iv-drip-checkout",
      {
        event_type: "error",
        success: false,
        action_taken: "checkout_failed",
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
