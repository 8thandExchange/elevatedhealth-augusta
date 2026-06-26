import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { resolveAuthorizedDiscountPatientId, resolveMemberCouponForCheckout } from "./member-discount.ts";
import { edgeStructuredLog } from "./edge-structured-log.ts";

export const checkoutCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export type OnetimeCheckoutOpts = {
  functionName: string;
  stripePriceId: string;
  productKey: string;
  /** Prefer camelCase; snake_case accepted for legacy callers. */
  successUrl?: string;
  cancelUrl?: string;
  success_url?: string;
  cancel_url?: string;
  logConsultationBooking?: boolean;
};

function resolveCheckoutUrls(opts: OnetimeCheckoutOpts): { successUrl: string; cancelUrl: string } {
  const successUrl = opts.successUrl ?? opts.success_url;
  const cancelUrl = opts.cancelUrl ?? opts.cancel_url;
  if (!successUrl?.trim() || !cancelUrl?.trim()) {
    throw new Error("Checkout successUrl and cancelUrl are required");
  }
  return { successUrl: successUrl.trim(), cancelUrl: cancelUrl.trim() };
}

export async function serveOnetimePriceCheckoutFromBody(
  body: Record<string, unknown>,
  opts: OnetimeCheckoutOpts,
  authHeader?: string | null,
): Promise<Response> {
  const { functionName, stripePriceId, productKey, logConsultationBooking } = opts;
  const { successUrl, cancelUrl } = resolveCheckoutUrls(opts);

  try {
    edgeStructuredLog(functionName, {
      event_type: "request",
      success: true,
      action_taken: "started",
      product_recognition: "alacarte_fill",
    });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const patient_email = body.patient_email as string | undefined;
    const patient_name = body.patient_name as string | undefined | null;
    const patient_id = body.patient_id as string | undefined | null;
    const quantity = typeof body.quantity === "number" && body.quantity > 0 ? body.quantity : 1;

    if (!patient_email) throw new Error("Patient email is required");

    const supabaseService: SupabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Member discount only applies to a patient_id that the authenticated caller
    // is allowed to act for (the patient themselves, or staff/admin). A raw
    // client-supplied patient_id no longer grants someone else's discount.
    // We still keep the supplied patient_id in metadata for webhook attribution.
    const discountPatientId = await resolveAuthorizedDiscountPatientId(
      supabaseService,
      authHeader,
      patient_id ?? null,
    );
    const discount = await resolveMemberCouponForCheckout(
      supabaseService,
      discountPatientId,
      productKey,
      { stripe },
    );
    const isGuest = !patient_id || String(patient_id).trim() === "";

    const customers = await stripe.customers.list({ email: patient_email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) customerId = customers.data[0].id;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : patient_email,
      line_items: [{ price: stripePriceId, quantity }],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        patient_id: patient_id ? String(patient_id) : "",
        patient_name: patient_name || "",
        product_key: productKey,
        is_guest_checkout: isGuest ? "true" : "false",
        applied_discount: discount.applied_discount,
        ...(typeof body.panel_slug === "string" && body.panel_slug
          ? { lab_panel_slug: body.panel_slug }
          : {}),
      },
    };

    if (discount.discounts && discount.discounts.length > 0) {
      sessionParams.discounts = discount.discounts;
    }

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create(sessionParams);
    } catch (stripeErr) {
      const stripeMessage = stripeErr instanceof Error ? stripeErr.message : String(stripeErr);
      if (!sessionParams.discounts?.length) {
        throw stripeErr;
      }

      edgeStructuredLog(functionName, {
        event_type: "coupon_retry",
        success: false,
        action_taken: "retry_without_member_coupon",
        error_message: stripeMessage,
      });

      const retryParams: Stripe.Checkout.SessionCreateParams = { ...sessionParams };
      delete retryParams.discounts;
      retryParams.metadata = {
        ...(sessionParams.metadata ?? {}),
        applied_discount: "none",
        coupon_retry_reason: stripeMessage.slice(0, 120),
      };
      session = await stripe.checkout.sessions.create(retryParams);
    }

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL");
    }

    edgeStructuredLog(functionName, {
      event_type: "checkout_created",
      success: true,
      action_taken: "stripe_checkout_session_created",
      patient_id: patient_id || null,
      stripe_customer_id: customerId ?? null,
      product_recognition: "alacarte_fill",
    });

    if (logConsultationBooking) {
      try {
        await supabaseService.from("consultation_bookings").insert({
          customer_email: patient_email,
          customer_name: patient_name || null,
          service_type: `alacarte_${productKey}`,
          status: "pending_payment",
          stripe_session_id: session.id,
          notes: `À la carte order: ${productKey}`,
        });
      } catch (e) {
        edgeStructuredLog(functionName, {
          event_type: "booking_log_skipped",
          success: true,
          action_taken: "consultation_bookings_insert_failed_nonfatal",
          error_message: String(e),
        });
      }
    }

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id, sessionId: session.id }),
      { headers: { ...checkoutCorsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    edgeStructuredLog(
      functionName,
      {
        event_type: "error",
        success: false,
        action_taken: "checkout_failed",
        error_message: errorMessage,
      },
      "error",
    );
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...checkoutCorsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
}

export async function serveOnetimePriceCheckout(
  req: Request,
  opts: OnetimeCheckoutOpts,
): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: checkoutCorsHeaders });
  }
  const body = await req.json();
  return serveOnetimePriceCheckoutFromBody(body, opts, req.headers.get("Authorization"));
}
