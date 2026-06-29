import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { LIVE_CORE_SERVICES } from "../_shared/live-prices.ts";
import {
  checkoutCorsHeaders,
  serveOnetimePriceCheckoutFromBody,
} from "../_shared/onetime-checkout-shared.ts";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: checkoutCorsHeaders });
  }

  try {
    const body = await req.json();
    const panel_type = body.panel_type as string | undefined;
    if (panel_type !== "comprehensive" && panel_type !== "expanded") {
      throw new Error("panel_type must be 'comprehensive' or 'expanded'");
    }
    const productKey = panel_type === "comprehensive" ? "lab_comprehensive" : "lab_expanded";
    const stripePriceId = panel_type === "comprehensive"
      ? LIVE_CORE_SERVICES.comprehensivePanel
      : LIVE_CORE_SERVICES.expandedPanel;

    const origin = req.headers.get("origin") || "https://elevatedhealthaugusta.com";

    edgeStructuredLog("create-lab-panel-checkout", {
      event_type: "panel_selected",
      success: true,
      action_taken: "create_session",
      product_recognition: productKey,
    });

    return serveOnetimePriceCheckoutFromBody(body, {
      functionName: "create-lab-panel-checkout",
      stripePriceId,
      productKey,
      success_url: `${origin}/patient/dashboard?baseline_labs=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/patient/dashboard`,
      logConsultationBooking: true,
      baselineLabsOnboarding: body.baseline_labs_onboarding === true || body.baseline_labs_onboarding !== false,
    }, req.headers.get("Authorization"));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    edgeStructuredLog(
      "create-lab-panel-checkout",
      {
        event_type: "error",
        success: false,
        action_taken: "validation_failed",
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
