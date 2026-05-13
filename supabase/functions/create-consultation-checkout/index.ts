import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { LIVE_CORE_SERVICES } from "../_shared/live-prices.ts";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SERVICE_CONFIG: Record<string, { name: string; description: string }> = {
  hormone: {
    name: "Wellness Assessment — Hormone Optimization",
    description:
      "30-minute in-person visit at Elevated Health Augusta (Evans, GA). RN intake, vitals, and provider pathway for physician-prescribed HRT/TRT. Labs and program pricing reviewed separately if you enroll.",
  },
  weight_loss: {
    name: "Wellness Assessment — Medical Weight Loss",
    description:
      "30-minute in-person visit at Elevated Health Augusta (Evans, GA). RN intake and GLP-1 eligibility review with physician-supervised semaglutide/tirzepatide options.",
  },
  peptide: {
    name: "Wellness Assessment — Peptide Protocols",
    description:
      "30-minute in-person visit at Elevated Health Augusta (Evans, GA). RN intake and consult-gated pathway for Sermorelin, NAD+, GHK-Cu, and related protocols.",
  },
};

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
    edgeStructuredLog("create-consultation-checkout", {
      event_type: "request",
      success: true,
      action_taken: "started",
      product_recognition: "consultation",
    });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const body = await req.json().catch(() => ({}));
    const serviceType = body.serviceType || "hormone";

    const validServiceTypes = ["hormone", "weight_loss", "peptide"];
    if (!validServiceTypes.includes(serviceType)) {
      throw new Error(`Invalid service type: ${serviceType}`);
    }

    const config = SERVICE_CONFIG[serviceType];

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
        `${origin}/consultation-confirmed?session_id={CHECKOUT_SESSION_ID}&credit=${creditCode}&service=${serviceType}`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        user_id: userId || "",
        product: "wellness_assessment",
        payment_type: "consultation",
        service_type: serviceType,
        credit_code: creditCode,
        product_display_lane: config.name,
      },
    });

    edgeStructuredLog("create-consultation-checkout", {
      event_type: "checkout_created",
      success: true,
      action_taken: "stripe_checkout_session_created",
      product_recognition: "consultation",
      stripe_customer_id: customerId ?? null,
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
