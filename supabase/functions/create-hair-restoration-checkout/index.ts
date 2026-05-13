import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { LIVE_HAIR_RESTORATION } from "../_shared/live-prices.ts";
import { resolveMemberCouponForCheckout } from "../_shared/member-discount.ts";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const KEY_ALIASES: Record<string, keyof typeof LIVE_HAIR_RESTORATION> = {
  minoxidil_finasteride: "minoxidilFinasteride",
  ghk_cu_scalp: "ghkCuScalp",
  dutasteride: "dutasteride",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    edgeStructuredLog("create-hair-restoration-checkout", {
      event_type: "request",
      success: true,
      action_taken: "started",
      product_recognition: "alacarte_fill",
    });

    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authentication required");

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseAnon.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { product_key, patient_id: bodyPatientId } = await req.json();

    const mapped = KEY_ALIASES[product_key] ||
      (product_key in LIVE_HAIR_RESTORATION ? product_key as keyof typeof LIVE_HAIR_RESTORATION : null);
    if (!mapped) throw new Error(`Invalid product key: ${product_key}`);

    const { data: patientRow } = await supabaseAnon
      .from("patients")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    const patientId = (typeof bodyPatientId === "string" && bodyPatientId.trim())
      ? bodyPatientId.trim()
      : patientRow?.id;

    const discount = await resolveMemberCouponForCheckout(supabaseService, patientId ?? null, mapped);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) customerId = customers.data[0].id;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: LIVE_HAIR_RESTORATION[mapped], quantity: 1 }],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/patient/dashboard?hair_success=true`,
      cancel_url: `${req.headers.get("origin")}/patient/dashboard?hair_canceled=true`,
      metadata: {
        patient_id: patientId || "",
        product_key: mapped,
        service_type: "hair_restoration",
        is_guest_checkout: patientId ? "false" : "true",
        applied_discount: discount.applied_discount,
      },
    };

    if (discount.discounts && discount.discounts.length > 0) {
      sessionParams.discounts = discount.discounts;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    edgeStructuredLog("create-hair-restoration-checkout", {
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    edgeStructuredLog(
      "create-hair-restoration-checkout",
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
