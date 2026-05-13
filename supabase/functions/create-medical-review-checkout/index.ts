import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { LIVE_CORE_SERVICES } from "../_shared/live-prices.ts";
import { checkoutCorsHeaders, serveOnetimePriceCheckout } from "../_shared/onetime-checkout-shared.ts";

serve(async (req) => {
  const origin = req.headers.get("origin") || "https://elevatedhealthaugusta.com";
  return serveOnetimePriceCheckout(req, {
    functionName: "create-medical-review-checkout",
    stripePriceId: LIVE_CORE_SERVICES.medicalReview,
    productKey: "medical_review",
    success_url: `${origin}/patient/dashboard?medical_review=success`,
    cancel_url: `${origin}/patient/dashboard`,
    logConsultationBooking: false,
  });
});
