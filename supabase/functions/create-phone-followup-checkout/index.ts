import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { LIVE_CORE_SERVICES } from "../_shared/live-prices.ts";
import { serveOnetimePriceCheckout } from "../_shared/onetime-checkout-shared.ts";

serve(async (req) => {
  const origin = req.headers.get("origin") || "https://elevatedhealthaugusta.com";
  return serveOnetimePriceCheckout(req, {
    functionName: "create-phone-followup-checkout",
    stripePriceId: LIVE_CORE_SERVICES.phoneFollowUp,
    productKey: "phone_followup",
    success_url: `${origin}/alacarte-success?product=followUp&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing`,
    logConsultationBooking: true,
  });
});
