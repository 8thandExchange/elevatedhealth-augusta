import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { LIVE_MEDICATION_FILLS, type LiveMedicationFillKey } from "../_shared/live-prices.ts";
import {
  checkoutCorsHeaders,
  serveOnetimePriceCheckoutFromBody,
} from "../_shared/onetime-checkout-shared.ts";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";

const KEYS = new Set<string>(Object.keys(LIVE_MEDICATION_FILLS));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: checkoutCorsHeaders });
  }

  try {
    const body = await req.json();
    const medication_key = body.medication_key as string | undefined;
    if (!medication_key || !KEYS.has(medication_key)) {
      throw new Error(
        `Invalid medication_key. Expected one of: ${Object.keys(LIVE_MEDICATION_FILLS).join(", ")}`,
      );
    }
    const mk = medication_key as LiveMedicationFillKey;
    const stripePriceId = LIVE_MEDICATION_FILLS[mk];

    const origin = req.headers.get("origin") || "https://elevatedhealthaugusta.com";

    edgeStructuredLog("create-medication-fill-checkout", {
      event_type: "medication_selected",
      success: true,
      action_taken: "create_session",
      product_recognition: "alacarte_fill",
    });

    return serveOnetimePriceCheckoutFromBody(body, {
      functionName: "create-medication-fill-checkout",
      stripePriceId,
      productKey: medication_key,
      success_url: `${origin}/alacarte-success?product=${encodeURIComponent(medication_key)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      logConsultationBooking: true,
    }, req.headers.get("Authorization"));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    edgeStructuredLog(
      "create-medication-fill-checkout",
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
