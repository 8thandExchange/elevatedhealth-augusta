import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  evaluateIvScreening,
  type IvScreeningIntake,
} from "../_shared/iv-screening-engine.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type EvaluateRequest = IvScreeningIntake & {
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  selected_therapy_id?: string;
  selected_service_id?: string;
  iv_allergies_text?: string;
  current_medications?: string;
  known_allergies?: string;
  recent_surgeries?: string;
  acknowledged_disclaimer?: boolean;
  referral_source?: string;
  referral_source_detail?: string;
};

type IntakeResponseRow = {
  id: string;
  screening_result: string;
  block_reasons: string[] | null;
  warn_reasons: string[] | null;
  block_severity: "hard" | "service_specific" | null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = (await req.json().catch(() => ({}))) as EvaluateRequest;

    const requiredFields = [
      "email",
      "phone",
      "first_name",
      "last_name",
      "date_of_birth",
      "acknowledged_disclaimer",
    ] as const;

    for (const field of requiredFields) {
      if (
        body[field] === undefined ||
        body[field] === null ||
        (typeof body[field] === "string" && !String(body[field]).trim())
      ) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    if (body.acknowledged_disclaimer !== true) {
      return new Response(
        JSON.stringify({ error: "acknowledged_disclaimer must be true" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const selectedTherapyId = body.selected_therapy_id || body.selected_service_id;
    if (!selectedTherapyId?.trim()) {
      return new Response(
        JSON.stringify({ error: "Missing required field: selected_therapy_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const boolFields = [
      "has_chf",
      "has_esrd",
      "is_pregnant",
      "has_anaphylaxis_history",
      "has_g6pd_deficiency",
      "has_ckd",
      "on_anticoagulants",
      "has_hypertension_uncontrolled",
      "has_diabetes",
      "has_thyroid_disorder",
      "currently_breastfeeding",
      "has_sesame_allergy",
      "has_iv_allergies",
    ] as const;

    for (const field of boolFields) {
      if (typeof body[field] !== "boolean") {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    const { data: therapy, error: therapyErr } = await supabase
      .from("iv_therapies")
      .select("id, name, requires_g6pd_clearance, contraindicates_sesame_allergy")
      .eq("id", selectedTherapyId)
      .maybeSingle();

    if (therapyErr) {
      console.error("[evaluate-iv-screening] therapy lookup error:", therapyErr);
      return new Response(
        JSON.stringify({ error: "Could not validate selected IV therapy" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!therapy) {
      return new Response(
        JSON.stringify({ error: "Selected IV therapy not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const evaluation = evaluateIvScreening(body, {
      id: therapy.id,
      name: therapy.name,
      requires_g6pd_clearance: therapy.requires_g6pd_clearance,
      contraindicates_sesame_allergy: therapy.contraindicates_sesame_allergy,
    });

    const screeningResult = evaluation.screening_result;
    const blockReasons = evaluation.block_reasons;
    const warnReasons = evaluation.warn_reasons;
    const blockSeverity = evaluation.block_severity;

    const sixtyMinutesAgoIso = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: existingIntake, error: existingIntakeErr } = await supabase
      .from("iv_intake_responses")
      .select("id, screening_result, block_reasons, warn_reasons, block_severity")
      .eq("email", body.email)
      .gt("created_at", sixtyMinutesAgoIso)
      .neq("screening_result", "cleared")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<IntakeResponseRow>();

    if (existingIntakeErr) {
      console.error("[evaluate-iv-screening] idempotency lookup error:", existingIntakeErr);
      return new Response(
        JSON.stringify({ error: "Failed to process intake screening" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (existingIntake) {
      return new Response(
        JSON.stringify({
          intake_id: existingIntake.id,
          screening_result: existingIntake.screening_result,
          block_reasons: existingIntake.block_reasons ?? [],
          warn_reasons: existingIntake.warn_reasons ?? [],
          block_severity: existingIntake.block_severity,
          staff_actions: evaluation.staff_actions,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: intake, error: intakeErr } = await supabase
      .from("iv_intake_responses")
      .insert({
        email: body.email,
        phone: body.phone,
        first_name: body.first_name,
        last_name: body.last_name,
        date_of_birth: body.date_of_birth,
        selected_therapy_id: therapy.id,

        has_chf: body.has_chf,
        has_esrd: body.has_esrd,
        is_pregnant: body.is_pregnant,
        has_anaphylaxis_history: body.has_anaphylaxis_history,
        has_g6pd_deficiency: body.has_g6pd_deficiency,
        has_ckd: body.has_ckd,
        on_anticoagulants: body.on_anticoagulants,
        has_hypertension_uncontrolled: body.has_hypertension_uncontrolled,
        has_diabetes: body.has_diabetes,
        has_thyroid_disorder: body.has_thyroid_disorder,
        currently_breastfeeding: body.currently_breastfeeding,
        has_sesame_allergy: body.has_sesame_allergy,
        has_iv_allergies: body.has_iv_allergies,

        iv_allergies_text: body.iv_allergies_text || null,
        current_medications: body.current_medications || null,
        known_allergies: body.known_allergies || null,
        recent_surgeries: body.recent_surgeries || null,
        acknowledged_disclaimer: body.acknowledged_disclaimer,
        screening_result: screeningResult,
        block_reasons: blockReasons,
        warn_reasons: warnReasons,
        block_severity: blockSeverity,
      })
      .select("id, screening_result, block_reasons, warn_reasons, block_severity")
      .single();

    if (intakeErr || !intake) {
      console.error("[evaluate-iv-screening] insert error:", intakeErr);
      return new Response(
        JSON.stringify({ error: "Failed to save intake screening" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Unified marketing attribution log (best-effort; never blocks screening).
    const referralSource = (body.referral_source || "").trim() || null;
    if (referralSource) {
      const { error: mrError } = await supabase.from("marketing_referrals").insert({
        channel: "iv_screening",
        referral_source: referralSource,
        referral_source_detail: (body.referral_source_detail || "").trim() || null,
        contact_name: [body.first_name, body.last_name].filter(Boolean).join(" ") || null,
        contact_email: body.email ?? null,
      });
      if (mrError) {
        console.warn("[evaluate-iv-screening] marketing_referrals insert skipped (non-fatal):", mrError.message);
      }
    }

    if (screeningResult === "blocked") {
      try {
        await supabase.functions.invoke("send-blocked-intake-notifications", {
          body: { intake_id: intake.id },
        });
      } catch (notifyErr) {
        console.error("[evaluate-iv-screening] blocked notification call failed:", notifyErr);
      }
    }

    return new Response(
      JSON.stringify({
        intake_id: intake.id,
        screening_result: intake.screening_result,
        block_reasons: intake.block_reasons ?? [],
        warn_reasons: intake.warn_reasons ?? [],
        block_severity: intake.block_severity,
        staff_actions: evaluation.staff_actions,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[evaluate-iv-screening] unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
