import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { LIVE_ELEVATED_PROGRAMS, type LiveElevatedProgramKey } from "./live-prices.ts";
import { edgeStructuredLog } from "./edge-structured-log.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_ONBOARDING = [
  "labs_reviewed",
  "protocol_approved",
  "treatment_active",
  "pending_pharmacy_order",
];

/**
 * Fixed-program ELEVATED subscription checkout (TRT / HRT / GLP-1 / WELLNESS).
 * Each edge function passes its own program key — price ID is deterministic.
 */
export async function serveFixedElevatedProgramCheckout(
  program: LiveElevatedProgramKey,
  req: Request,
  functionName: string,
): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    edgeStructuredLog(functionName, {
      event_type: "request",
      success: true,
      action_taken: "started",
      product_recognition: `elevated_${program}`,
    });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authentication required");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseAnon.auth.getUser(token);
    if (!userData.user?.email) throw new Error("User not authenticated");

    const userEmail = userData.user.email;
    const userId = userData.user.id;

    const { data: patient, error: patientError } = await supabaseAnon
      .from("patients")
      .select("id, onboarding_status, full_name")
      .eq("user_id", userId)
      .maybeSingle();

    if (patientError) throw new Error("Failed to fetch patient record");
    if (!patient) throw new Error("Patient record not found");

    if (!ALLOWED_ONBOARDING.includes(patient.onboarding_status || "")) {
      throw new Error(
        "LAB_REVIEW_REQUIRED: Your lab results must be reviewed by a provider before purchasing a membership. Please schedule your Lab Review appointment.",
      );
    }

    const priceId = LIVE_ELEVATED_PROGRAMS[program];
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    let customerId: string | undefined;
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    if (customers.data.length > 0) customerId = customers.data[0].id;

    const origin = req.headers.get("origin") || "https://elevatedhealthaugusta.com";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/patient/dashboard?subscription=success`,
      cancel_url: `${origin}/membership`,
      metadata: {
        user_id: userId,
        patient_id: patient.id,
        product_key: `elevated_${program}`,
        elevated_program: program,
        is_guest_checkout: "false",
        applied_discount: "none",
      },
    });

    edgeStructuredLog(functionName, {
      event_type: "checkout_created",
      success: true,
      action_taken: "stripe_checkout_session_created",
      product_recognition: `elevated_${program}`,
      patient_id: patient.id,
      stripe_customer_id: customerId ?? null,
    });

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id, sessionId: session.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
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
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
}
