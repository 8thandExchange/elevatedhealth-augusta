import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { LIVE_CORE_SERVICES } from "../_shared/live-prices.ts";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CANONICAL_SERVICE_TYPE = "wellness_assessment";
const LEGACY_SERVICE_TYPES = ["hormone", "weight_loss", "peptide"] as const;
type LegacyServiceType = (typeof LEGACY_SERVICE_TYPES)[number];

const ALLOWED_REASON_IDS = new Set([
  "hormone",
  "weight_loss",
  "peptide",
  "iv",
  "sexual_wellness",
  "hair_restoration",
  "general_wellness",
  "exploring",
]);

function isLegacyServiceType(v: string): v is LegacyServiceType {
  return (LEGACY_SERVICE_TYPES as readonly string[]).includes(v);
}

/** Booking lane for success URL + metadata.service_type (verify-consultation / confirmation UI). */
function deriveBookingLane(reasons: string[], legacy?: string): LegacyServiceType {
  if (legacy && isLegacyServiceType(legacy)) return legacy;
  const priority: LegacyServiceType[] = ["hormone", "weight_loss", "peptide"];
  for (const k of priority) {
    if (reasons.includes(k)) return k;
  }
  return "hormone";
}

function normalizeReasons(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((r): r is string =>
    typeof r === "string" && ALLOWED_REASON_IDS.has(r)
  );
}

const generateCreditCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "EH-";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    let serviceTypeIn = typeof body.serviceType === "string"
      ? body.serviceType
      : CANONICAL_SERVICE_TYPE;
    const reasons = normalizeReasons(body.reasons);

    let serviceTypeLegacy: string | undefined;
    if (isLegacyServiceType(serviceTypeIn)) {
      serviceTypeLegacy = serviceTypeIn;
      console.warn(
        `[create-consultation-checkout] Legacy serviceType "${serviceTypeIn}" received; treating as ${CANONICAL_SERVICE_TYPE}.`,
      );
      edgeStructuredLog("create-consultation-checkout", {
        event_type: "legacy_service_type_warning",
        success: true,
        action_taken: "normalized_legacy_service_type",
        legacy_service_type: serviceTypeIn,
        reasons,
      });
      serviceTypeIn = CANONICAL_SERVICE_TYPE;
    }

    if (serviceTypeIn !== CANONICAL_SERVICE_TYPE) {
      throw new Error(`Invalid service type: ${serviceTypeIn}`);
    }

    const derivedLane = deriveBookingLane(reasons, serviceTypeLegacy);
    const reasonsMetadata = reasons.length > 0 ? reasons.join(",") : "unspecified";

    edgeStructuredLog("create-consultation-checkout", {
      event_type: "request",
      success: true,
      action_taken: "started",
      product_recognition: "consultation",
      reasons,
      service_type_in: body.serviceType ?? null,
    });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const authHeader = req.headers.get("Authorization");
    let userEmail: string | undefined;
    let userId: string | undefined;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseClient.auth.getUser(token);
      if (userData.user?.email) {
        userEmail = userData.user.email;
        userId = userData.user.id;
      }
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    let customerId: string | undefined;
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || "https://elevatedhealthaugusta.com";
    const creditCode = generateCreditCode();

    const metadata: Record<string, string> = {
      user_id: userId || "",
      product: "wellness_assessment",
      product_lane: "wellness_assessment",
      payment_type: "consultation",
      service_type: derivedLane,
      reasons: reasonsMetadata,
      credit_code: creditCode,
      product_display_lane: "Wellness Assessment",
    };
    if (serviceTypeLegacy) {
      metadata.service_type_legacy = serviceTypeLegacy;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [
        {
          price: LIVE_CORE_SERVICES.wellnessAssessment,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url:
        `${origin}/consultation-confirmed?session_id={CHECKOUT_SESSION_ID}&credit=${creditCode}&service=${derivedLane}`,
      cancel_url: `${origin}/pricing`,
      metadata,
    });

    edgeStructuredLog("create-consultation-checkout", {
      event_type: "checkout_created",
      success: true,
      action_taken: "stripe_checkout_session_created",
      product_recognition: "consultation",
      stripe_customer_id: customerId ?? null,
      reasons,
      derived_booking_lane: derivedLane,
    });

    return new Response(JSON.stringify({ url: session.url, session_id: session.id, sessionId: session.id, creditCode }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    edgeStructuredLog(
      "create-consultation-checkout",
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
