/**
 * create-alacarte-checkout — dispatcher for legacy `product_key` values.
 *
 * Routes medication fills, phone follow-up, and lab panels to live Stripe
 * Price IDs + server-side ELEVATED member coupon (see `_shared/member-discount.ts`).
 * Prefer dedicated functions (`create-medication-fill-checkout`, etc.) for new UI.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { LIVE_CORE_SERVICES, LIVE_MEDICATION_FILLS, LIVE_RECOVERY_PEPTIDES } from "../_shared/live-prices.ts";
import { checkoutCorsHeaders, serveOnetimePriceCheckoutFromBody } from "../_shared/onetime-checkout-shared.ts";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: checkoutCorsHeaders });
  }

  try {
    const body = await req.json();
    const product_key = body.product_key as string | undefined;
    if (!product_key) throw new Error("product_key is required");

    const origin = req.headers.get("origin") || "https://elevatedhealthaugusta.com";

    edgeStructuredLog("create-alacarte-checkout", {
      event_type: "dispatch",
      success: true,
      action_taken: `route:${product_key}`,
      product_recognition: "alacarte_fill",
    });

    if (product_key in LIVE_MEDICATION_FILLS) {
      const stripePriceId = LIVE_MEDICATION_FILLS[product_key as keyof typeof LIVE_MEDICATION_FILLS];
      return serveOnetimePriceCheckoutFromBody(body, {
        functionName: "create-alacarte-checkout",
        stripePriceId,
        productKey: product_key,
        success_url:
          `${origin}/alacarte-success?product=${encodeURIComponent(product_key)}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pricing`,
        logConsultationBooking: true,
      });
    }

    if (product_key in LIVE_RECOVERY_PEPTIDES) {
      const stripePriceId = LIVE_RECOVERY_PEPTIDES[product_key as keyof typeof LIVE_RECOVERY_PEPTIDES];
      return serveOnetimePriceCheckoutFromBody(body, {
        functionName: "create-alacarte-checkout",
        stripePriceId,
        productKey: product_key,
        success_url:
          `${origin}/alacarte-success?product=${encodeURIComponent(product_key)}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pricing`,
        logConsultationBooking: true,
      });
    }

    if (product_key === "followUp") {
      return serveOnetimePriceCheckoutFromBody(body, {
        functionName: "create-alacarte-checkout",
        stripePriceId: LIVE_CORE_SERVICES.phoneFollowUp,
        productKey: "phone_followup",
        success_url: `${origin}/alacarte-success?product=followUp&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pricing`,
        logConsultationBooking: true,
      });
    }

    if (product_key === "labPanel" || product_key === "labPanelExpanded") {
      const comprehensive = product_key === "labPanel";
      return serveOnetimePriceCheckoutFromBody(body, {
        functionName: "create-alacarte-checkout",
        stripePriceId: comprehensive
          ? LIVE_CORE_SERVICES.comprehensivePanel
          : LIVE_CORE_SERVICES.expandedPanel,
        productKey: comprehensive ? "lab_comprehensive" : "lab_expanded",
        success_url: `${origin}/alacarte-success?product=labPanel&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pricing`,
        logConsultationBooking: true,
      });
    }

    throw new Error(
      `Invalid product key: ${product_key}. Valid: ${[
        ...Object.keys(LIVE_MEDICATION_FILLS),
        ...Object.keys(LIVE_RECOVERY_PEPTIDES),
        "followUp",
        "labPanel",
        "labPanelExpanded",
      ].join(", ")}`,
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    edgeStructuredLog(
      "create-alacarte-checkout",
      {
        event_type: "error",
        success: false,
        action_taken: "dispatch_failed",
        error_message: errorMessage,
      },
      "error",
    );
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...checkoutCorsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
