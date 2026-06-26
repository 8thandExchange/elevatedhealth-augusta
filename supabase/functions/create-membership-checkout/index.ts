/**
 * create-membership-checkout (deprecated umbrella)
 *
 * Prefer dedicated program checkouts: `create-trt-checkout`, `create-hrt-checkout`,
 * `create-glp1-checkout`, `create-wellness-membership-checkout`.
 *
 * This function remains for backward-compatible callers; it resolves a program from
 * optional JSON `{ program?: "trt"|"hrt"|"glp1"|"wellness" }` or infers from the
 * patient's `treatment_request` / `primary_program`, defaulting to **wellness**.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { LIVE_ELEVATED_PROGRAMS, type LiveElevatedProgramKey } from "../_shared/live-prices.ts";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";
import { hasClinicStaffRole } from "../_shared/staff-auth.ts";

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

function inferProgramFromPatient(p: {
  treatment_request?: string | null;
  primary_program?: string | null;
}): LiveElevatedProgramKey {
  const t = `${p.treatment_request || ""} ${p.primary_program || ""}`.toLowerCase();
  if (/weight|glp|semaglutide|tirzepatide|obes|ozempic|mounjaro/.test(t)) return "glp1";
  if (/trt|testosterone|androgen|male/.test(t)) return "trt";
  if (/hrt|bhrt|bi-?est|estrogen|progesterone|female|women/.test(t)) return "hrt";
  return "wellness";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    edgeStructuredLog("create-membership-checkout", {
      event_type: "request",
      success: true,
      action_taken: "started",
      product_recognition: "legacy_elevated_membership",
    });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    // Service-role client: lets an authorized staff/admin caller resolve and
    // charge a DIFFERENT patient (the one selected in QuickPaymentModal) rather
    // than themselves. Patient self-serve still resolves their own record.
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authentication required");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    if (!userData.user?.id) throw new Error("User not authenticated");

    const callerId = userData.user.id;

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    let bodyProgram: LiveElevatedProgramKey | undefined;
    if (typeof body?.program === "string" && (body.program as string) in LIVE_ELEVATED_PROGRAMS) {
      bodyProgram = body.program as LiveElevatedProgramKey;
    }
    const targetPatientId =
      typeof body?.patientId === "string"
        ? (body.patientId as string)
        : typeof body?.patient_id === "string"
          ? (body.patient_id as string)
          : null;
    const targetEmail =
      typeof body?.email === "string"
        ? (body.email as string)
        : typeof body?.patient_email === "string"
          ? (body.patient_email as string)
          : null;

    // Is the caller staff/admin acting on behalf of a selected patient?
    const { data: callerRoles } = await supabaseService
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId);
    const callerIsStaff = hasClinicStaffRole(
      (callerRoles ?? []).map((r: { role: string }) => String(r.role)),
    );
    const actingOnBehalf = callerIsStaff && Boolean(targetPatientId || targetEmail);

    const patientSelect =
      "id, user_id, onboarding_status, full_name, email, treatment_request, primary_program";
    let patientQuery = supabaseService.from("patients").select(patientSelect);
    if (actingOnBehalf) {
      patientQuery = targetPatientId
        ? patientQuery.eq("id", targetPatientId)
        : patientQuery.eq("email", targetEmail as string);
    } else {
      // Self-serve: the caller pays for their own membership.
      patientQuery = patientQuery.eq("user_id", callerId);
    }

    const { data: patient, error: patientError } = await patientQuery.maybeSingle();

    if (patientError) throw new Error("Failed to fetch patient record");
    if (!patient) throw new Error("Patient record not found");

    if (!ALLOWED_ONBOARDING.includes(patient.onboarding_status || "")) {
      throw new Error(
        "LAB_REVIEW_REQUIRED: This patient's lab results must be reviewed by a provider before purchasing a membership. Please complete the Lab Review first.",
      );
    }

    const billingEmail = patient.email || targetEmail;
    if (!billingEmail) throw new Error("Patient has no email on file to send the membership invoice to.");

    const program = bodyProgram ?? inferProgramFromPatient(patient);
    const priceId = LIVE_ELEVATED_PROGRAMS[program];

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    let customerId: string | undefined;
    const customers = await stripe.customers.list({ email: billingEmail, limit: 1 });
    if (customers.data.length > 0) customerId = customers.data[0].id;

    const origin = req.headers.get("origin") || "https://elevatedhealthaugusta.com";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : billingEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/patient/dashboard?subscription=success`,
      cancel_url: `${origin}/membership`,
      metadata: {
        user_id: patient.user_id ?? "",
        patient_id: patient.id,
        product_key: `elevated_${program}`,
        elevated_program: program,
        is_guest_checkout: "false",
        applied_discount: "none",
        created_on_behalf: actingOnBehalf ? "true" : "false",
      },
    });

    edgeStructuredLog("create-membership-checkout", {
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
      "create-membership-checkout",
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
