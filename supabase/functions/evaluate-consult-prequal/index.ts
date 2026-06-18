import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";
import {
  evaluateConsultPrequalScreening,
  type ConsultScreeningInput,
} from "../_shared/consult-prequal-screening.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const functionName = "evaluate-consult-prequal";

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const body = await req.json().catch(() => ({}));

    const email = String(body.email ?? "").trim().toLowerCase();
    const fullName = String(body.full_name ?? body.fullName ?? "").trim();
    const phone = String(body.phone ?? "").replace(/\D/g, "");
    const dob = String(body.dob ?? body.date_of_birth ?? "").trim();
    const gender = String(body.gender ?? "other") as ConsultScreeningInput["gender"];
    const visitReasons = Array.isArray(body.visit_reasons)
      ? body.visit_reasons.filter((r: unknown) => typeof r === "string")
      : [];

    if (!email || !fullName || !dob) {
      return new Response(JSON.stringify({ error: "email, full_name, and dob are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const screeningInput: ConsultScreeningInput = {
      gender: gender === "female" || gender === "male" ? gender : "other",
      pregnant_or_breastfeeding: !!body.pregnant_or_breastfeeding,
      breast_cancer_history: !!body.breast_cancer_history,
      uterine_cancer_history: !!body.uterine_cancer_history,
      prostate_cancer_history: !!body.prostate_cancer_history,
      active_blood_clot: !!body.active_blood_clot,
      polycythemia: !!body.polycythemia,
      active_cancer_treatment: !!body.active_cancer_treatment,
      severe_heart_failure: !!body.severe_heart_failure,
      acknowledged_disclaimer: body.acknowledged_disclaimer === true,
    };

    const outcome = evaluateConsultPrequalScreening(screeningInput);

    const { data: row, error: insertError } = await supabase
      .from("consult_prequal_sessions")
      .insert({
        email,
        full_name: fullName,
        phone: phone.length === 10 ? phone : null,
        dob,
        gender: screeningInput.gender,
        visit_reasons: visitReasons,
        screening_answers: screeningInput,
        screening_result: outcome.result,
        block_reasons: outcome.blockReasons,
      })
      .select("id, screening_result, block_reasons")
      .single();

    if (insertError) throw insertError;

    if (outcome.result === "blocked") {
      try {
        await supabase.from("eligibility_review_requests").insert({
          patient_name: fullName,
          patient_email: email,
          preferred_phone: phone.length === 10 ? phone : "0000000000",
          flag_reasons: outcome.blockReasons,
          treatment_type: visitReasons.join(", ") || "wellness_assessment",
          notes: "Blocked at pre-payment wellness consult screening.",
        });
      } catch (e) {
        console.warn("eligibility_review_requests insert failed", e);
      }
    }

    edgeStructuredLog(functionName, {
      session_id: row.id,
      screening_result: outcome.result,
      success: true,
    });

    return new Response(
      JSON.stringify({
        session_id: row.id,
        screening_result: outcome.result,
        block_reasons: outcome.blockReasons,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    edgeStructuredLog(functionName, { success: false, error_message: message }, "error");
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
