/**
 * run-cds-assessment
 *
 * Deterministic Clinical Decision Support engine run. Staff+ may invoke;
 * writes cds_assessment_results via service role. Does NOT finalize
 * recommendations — provider_review (Task 3+) is prescriber-only.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  CDS_ENGINE_VERSION,
  deriveAssessmentStatus,
  matchPathwayIds,
  runCdsEngine,
  selectCandidatesForAssessment,
  type AssessmentStatus,
  type CdsCandidateInput,
  type CdsEngineContext,
  type CdsEngineResultRow,
} from "../_shared/cds-engine.ts";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const FUNCTION_NAME = "run-cds-assessment";

type AuthResult =
  | { ok: true; user_id: string; roles: string[] }
  | { ok: false; status: number; error: string };

type RunRequest = {
  assessment_id?: string;
};

async function requireClinicStaff(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return { ok: false, status: 401, error: "Missing Authorization header" };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userErr } = await supabaseAuth.auth.getUser();
  if (userErr || !userData?.user) {
    return { ok: false, status: 401, error: "Invalid or expired session" };
  }

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAdmin = createClient(supabaseUrl, serviceKey);
  const { data: rolesRows } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id);

  const roles = (rolesRows ?? []).map((r) => r.role as string);
  const allowed = roles.some((r) =>
    r === "admin" || r === "staff" || r === "provider" || r === "business_admin"
  );
  if (!allowed) {
    return { ok: false, status: 403, error: "Clinic staff role required" };
  }

  return { ok: true, user_id: userData.user.id, roles };
}

function isPrescriberRole(roles: string[]): boolean {
  return roles.includes("provider");
}

async function loadEngineContext(
  supabaseAdmin: ReturnType<typeof createClient>,
  patientId: string,
): Promise<CdsEngineContext> {
  const { count: labCount } = await supabaseAdmin
    .from("lab_results")
    .select("id", { count: "exact", head: true })
    .eq("patient_id", patientId);

  const nowIso = new Date().toISOString();

  const { data: consentRows } = await supabaseAdmin
    .from("consent_records")
    .select("consent_type, expires_at")
    .eq("patient_id", patientId)
    .is("revoked_at", null)
    .gt("expires_at", nowIso);

  const validConsentTypes = [
    ...new Set((consentRows ?? []).map((r) => r.consent_type as string)),
  ];

  const { data: substanceRows } = await supabaseAdmin
    .from("substance_addition_acknowledgments")
    .select("substance_id")
    .eq("patient_id", patientId);

  const substanceAcknowledgmentIds = (substanceRows ?? []).map(
    (r) => r.substance_id as string,
  );

  return {
    hasResultedLabs: (labCount ?? 0) > 0,
    validConsentTypes,
    substanceAcknowledgmentIds,
  };
}

function toResultInsert(
  assessmentId: string,
  row: CdsEngineResultRow,
) {
  return {
    assessment_id: assessmentId,
    candidate_id: row.candidate_id,
    candidate_key: row.candidate_key,
    display_name: row.display_name,
    regulatory_status: row.regulatory_status,
    gate_state: row.gate_state,
    requires_labs: row.requires_labs,
    blocked_reason: row.blocked_reason,
    rank_score: row.rank_score,
    engine_version: CDS_ENGINE_VERSION,
    metadata: row.metadata,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = await requireClinicStaff(req);
  if (!auth.ok) {
    return new Response(JSON.stringify({ error: auth.error }), {
      status: auth.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as RunRequest;
    const assessmentId = body.assessment_id?.trim();
    if (!assessmentId) {
      return new Response(JSON.stringify({ error: "assessment_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: assessment, error: assessmentErr } = await supabaseAdmin
      .from("cds_assessments")
      .select(
        "id, patient_id, pathway_id, created_by, status, goal_key, symptoms_selected",
      )
      .eq("id", assessmentId)
      .maybeSingle();

    if (assessmentErr) throw assessmentErr;
    if (!assessment) {
      return new Response(JSON.stringify({ error: "Assessment not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const canRun =
      assessment.created_by === auth.user_id || isPrescriberRole(auth.roles);
    if (!canRun) {
      return new Response(
        JSON.stringify({ error: "Not authorized to run this assessment" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (assessment.status === "reviewed") {
      return new Response(
        JSON.stringify({ error: "Reviewed assessments cannot be re-run" }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const symptomsSelected = Array.isArray(assessment.symptoms_selected)
      ? (assessment.symptoms_selected as string[])
      : [];

    const [{ data: pathways }, { data: pathwaySymptoms }, { data: candidates }] =
      await Promise.all([
        supabaseAdmin
          .from("cds_pathways")
          .select(
            "id, slug, name, goal_key, is_sample, active, recommended_lab_slug, elevated_program_key, staff_redirect_notes",
          )
          .eq("is_sample", false),
        supabaseAdmin
          .from("cds_pathway_symptoms")
          .select("pathway_id, symptom_key, weight"),
        supabaseAdmin
          .from("cds_candidates")
          .select(
            "id, pathway_id, candidate_key, display_name, regulatory_status, requires_labs, required_lab_slugs, required_consent_types, rank_weight, is_sample, active",
          )
          .eq("active", true)
          .eq("is_sample", false),
      ]);

    const pathwayIds = matchPathwayIds(
      (pathways ?? []).map((p) => ({
        id: p.id as string,
        goal_key: p.goal_key as string,
        is_sample: p.is_sample as boolean,
      })),
      (pathwaySymptoms ?? []).map((s) => ({
        pathway_id: s.pathway_id as string,
        symptom_key: s.symptom_key as string,
        weight: Number(s.weight),
      })),
      assessment.goal_key as string | null,
      symptomsSelected,
      assessment.pathway_id as string | null,
    );

    const selectedCandidates = selectCandidatesForAssessment(
      (candidates ?? []).map((c) => ({
        id: c.id as string,
        pathway_id: c.pathway_id as string | null,
        candidate_key: c.candidate_key as string,
        display_name: c.display_name as string,
        regulatory_status: c.regulatory_status as CdsCandidateInput["regulatory_status"],
        requires_labs: c.requires_labs as boolean,
        required_lab_slugs: (c.required_lab_slugs ?? []) as string[],
        required_consent_types: (c.required_consent_types ?? []) as string[],
        rank_weight: Number(c.rank_weight),
        is_sample: c.is_sample as boolean,
      })),
      pathwayIds,
    );

    const engineCtx = await loadEngineContext(
      supabaseAdmin,
      assessment.patient_id as string,
    );
    const results = runCdsEngine(selectedCandidates, engineCtx);
    const nextStatus = deriveAssessmentStatus(
      results,
      assessment.status as AssessmentStatus,
    );

    const pathwayById = new Map(
      (pathways ?? []).map((p) => [p.id as string, p]),
    );
    const matchedPathways = pathwayIds
      .map((id) => pathwayById.get(id))
      .filter(Boolean)
      .map((p) => ({
        pathway_id: p!.id,
        slug: p!.slug,
        name: p!.name,
        goal_key: p!.goal_key,
        active: p!.active,
        recommended_lab_slug: p!.recommended_lab_slug ?? null,
        elevated_program_key: p!.elevated_program_key ?? null,
        staff_redirect_notes: p!.staff_redirect_notes ?? null,
      }));

    const primaryPathwayId = pathwayIds[0] ?? null;

    const { error: deleteErr } = await supabaseAdmin
      .from("cds_assessment_results")
      .delete()
      .eq("assessment_id", assessmentId);
    if (deleteErr) throw deleteErr;

    if (results.length > 0) {
      const { error: insertErr } = await supabaseAdmin
        .from("cds_assessment_results")
        .insert(results.map((row) => toResultInsert(assessmentId, row)));
      if (insertErr) throw insertErr;
    }

    const { error: updateErr } = await supabaseAdmin
      .from("cds_assessments")
      .update({
        status: nextStatus,
        pathway_id: primaryPathwayId,
      })
      .eq("id", assessmentId);
    if (updateErr) throw updateErr;

    edgeStructuredLog(FUNCTION_NAME, {
      success: true,
      assessment_id: assessmentId,
      actor_user_id: auth.user_id,
      result_count: results.length,
      next_status: nextStatus,
      engine_version: CDS_ENGINE_VERSION,
    });

    return new Response(
      JSON.stringify({
        assessment_id: assessmentId,
        status: nextStatus,
        engine_version: CDS_ENGINE_VERSION,
        pathway_ids: pathwayIds,
        matched_pathways: matchedPathways,
        primary_pathway: matchedPathways[0] ?? null,
        results,
        context: {
          has_resulted_labs: engineCtx.hasResultedLabs,
          valid_consent_types: engineCtx.validConsentTypes,
          substance_acknowledgment_ids: engineCtx.substanceAcknowledgmentIds,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    edgeStructuredLog(FUNCTION_NAME, {
      success: false,
      error_message: message,
      actor_user_id: auth.user_id,
    }, "error");

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
