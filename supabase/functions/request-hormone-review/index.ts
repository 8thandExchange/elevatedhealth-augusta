/**
 * request-hormone-review
 *
 * Patient-initiated request for a provider to review the patient's latest
 * symptom_log and approve a hormone protocol. Replaces a direct
 * `orders.insert` from the patient client (which was previously enabled by
 * an open INSERT policy on public.orders — security audit R-10).
 *
 * AUTH POSTURE (security audit R-10, 2026-05-08):
 *   - verify_jwt = true in supabase/config.toml
 *   - Caller MUST present a valid Supabase JWT
 *   - Caller MUST be the patient who owns the supplied symptom_log_id
 *     (patients.user_id = auth.uid() AND patients.id = symptom_log.patient_id)
 *   - Anonymous, mismatched-patient, or staff/admin callers are rejected
 *     (this endpoint is patient-self-only by design — staff create orders
 *     via the provider dashboard, not via this URL)
 *
 * Logic:
 *   1. Look up the symptom_log by id (service role)
 *   2. Validate the symptom_log.patient_id belongs to the JWT user
 *   3. Construct the orders row server-side using ONLY the symptom_scores
 *      copied from the symptom_log (no patient-supplied protocol_snapshot
 *      fields — the patient cannot smuggle clinical content into the row)
 *   4. Insert via service role with status='pending_review'
 *   5. Return { order_id }
 *
 * Rejects: missing JWT, missing/extra body fields, mismatched ownership,
 * non-existent symptom_log_id.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: unknown) =>
  console.log(
    `[REQUEST-HORMONE-REVIEW] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`,
  );

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const user_id = userData.user.id;

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const rawBody = await req.json().catch(() => null);
    if (!rawBody || typeof rawBody !== "object") {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const allowedKeys = new Set(["symptom_log_id"]);
    const extraKeys = Object.keys(rawBody).filter((k) => !allowedKeys.has(k));
    if (extraKeys.length > 0) {
      return new Response(
        JSON.stringify({
          error: `Unexpected fields in request body: ${extraKeys.join(", ")}`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const symptom_log_id = (rawBody as { symptom_log_id?: unknown }).symptom_log_id;
    if (
      typeof symptom_log_id !== "string" ||
      !UUID_RE.test(symptom_log_id)
    ) {
      return new Response(
        JSON.stringify({ error: "symptom_log_id must be a valid uuid" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: symptomLog, error: logErr } = await supabaseAdmin
      .from("symptom_logs")
      .select(
        "id, patient_id, estrogen_score, progesterone_score, androgen_score, cortisol_score, date_logged",
      )
      .eq("id", symptom_log_id)
      .maybeSingle();
    if (logErr) {
      log("ERROR loading symptom_log", { error: logErr.message });
      return new Response(
        JSON.stringify({ error: "Failed to load symptom log" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!symptomLog) {
      return new Response(
        JSON.stringify({ error: "symptom_log not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: patientRow, error: patientErr } = await supabaseAdmin
      .from("patients")
      .select("id")
      .eq("id", symptomLog.patient_id)
      .eq("user_id", user_id)
      .maybeSingle();
    if (patientErr) {
      log("ERROR loading patient", { error: patientErr.message });
      return new Response(
        JSON.stringify({ error: "Failed to verify patient ownership" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!patientRow) {
      log("Mismatched ownership", { user_id, patient_id: symptomLog.patient_id });
      return new Response(
        JSON.stringify({ error: "symptom_log does not belong to this patient" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const protocol_snapshot = {
      symptom_scores: {
        estrogen: symptomLog.estrogen_score,
        progesterone: symptomLog.progesterone_score,
        androgen: symptomLog.androgen_score,
        cortisol: symptomLog.cortisol_score,
      },
      date_requested: new Date().toISOString(),
      source: "patient_self_request_v1",
      symptom_log_id: symptomLog.id,
    };

    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        patient_id: symptomLog.patient_id,
        status: "pending_review",
        protocol_snapshot,
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      log("ERROR inserting order", { error: orderErr?.message });
      return new Response(
        JSON.stringify({ error: "Failed to create review request" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    log("Review request created", { order_id: order.id, patient_id: symptomLog.patient_id });

    return new Response(
      JSON.stringify({ success: true, order_id: order.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
