/**
 * recommend-lab-panel
 *
 * AI lab panel recommender — uses Lovable AI Gateway (Gemini) to suggest a
 * LabCorp panel based on patient intake, gender, age, symptoms, and meds.
 *
 * AUTH POSTURE (security audit R-5, 2026-05-08):
 *   - verify_jwt = true in supabase/config.toml
 *   - Caller MUST present a valid Supabase JWT
 *   - Caller MUST have role = 'staff' OR role = 'admin'
 *
 * Background: this is a clinical-decision-support tool that reads patient
 * PHI (full_name, dob, gender, primary_program, medical_history,
 * medications) and writes a recommendation snapshot back to the patient
 * row. It is for provider use, not patient self-service. Previously
 * anyone could submit any patient_id and get the AI's panel recommendation
 * for that patient, which both leaks PHI to the AI provider and lets a
 * caller exhaust the LOVABLE_API_KEY budget.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function requireStaffOrAdmin(req: Request): Promise<
  | { ok: true; user_id: string }
  | { ok: false; status: number; error: string }
> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return { ok: false, status: 401, error: "Missing Authorization header" };
  }
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await supabaseAuth.auth.getUser();
  if (userErr || !userData?.user) {
    return { ok: false, status: 401, error: "Invalid or expired session" };
  }
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: roles } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id);
  const isStaffOrAdmin = (roles || []).some(
    (r) => r.role === "staff" || r.role === "admin",
  );
  if (!isStaffOrAdmin) {
    return { ok: false, status: 403, error: "Staff or admin role required" };
  }
  return { ok: true, user_id: userData.user.id };
}

const LAB_CATALOG = `
Available LabCorp test codes (use these EXACTLY):
- 005009  CBC with Differential
- 322000  Comprehensive Metabolic Panel (CMP)
- 010322  PSA Total
- 070001  Testosterone Total + Free
- 004259  TSH
- 001974  Free T4
- 010363  Free T3
- 001297  Estradiol
- 004515  Progesterone
- 004309  DHEA-Sulfate
- 081950  Vitamin D, 25-Hydroxy
- 001453  Lipid Panel
- 001453  HbA1c
- 004333  Ferritin
- 001719  SHBG
- 010108  Hematocrit
- 010165  LH
- 010181  FSH
- 010363  Cortisol AM
`;

const SYSTEM = `You are a clinical lab ordering assistant for Elevated Health Augusta.
Recommend a focused LabCorp panel for this patient. Return ONLY structured data.
Rules:
- Male patients on TRT: ALWAYS include CBC, CMP, PSA, Testosterone Total+Free, Estradiol.
- Female patients on hormone therapy: include CMP, Estradiol, Progesterone, FSH, TSH.
- Weight loss / GLP-1: CMP, HbA1c, Lipid, TSH.
- Fatigue / low energy symptom: add Vitamin D, Ferritin, TSH, Free T4.
- Always include CMP for safety on any therapy.
- Choose ICD-10 codes that justify medical necessity.
${LAB_CATALOG}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  const authResult = await requireStaffOrAdmin(req);
  if (!authResult.ok) {
    return new Response(JSON.stringify({ error: authResult.error }), {
      status: authResult.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { patient_id } = await req.json();
    if (!patient_id) {
      return new Response(JSON.stringify({ error: "patient_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: patient, error: pErr } = await supabase
      .from("patients")
      .select(
        "id, full_name, dob, gender, primary_program, current_protocol, medical_history, treatment_request, service_interests",
      )
      .eq("id", patient_id)
      .maybeSingle();

    if (pErr || !patient) {
      return new Response(JSON.stringify({ error: "Patient not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: meds } = await supabase
      .from("medications")
      .select("medication_name, dosage, service_line, status")
      .eq("patient_id", patient_id)
      .eq("status", "active");

    const age = patient.dob
      ? Math.floor(
          (Date.now() - new Date(patient.dob).getTime()) /
            (365.25 * 24 * 3600 * 1000),
        )
      : null;

    const userPrompt = `Patient profile:
- Name: ${patient.full_name}
- Age: ${age ?? "unknown"}
- Gender: ${patient.gender ?? "unknown"}
- Primary program: ${patient.primary_program ?? "—"}
- Current protocol: ${patient.current_protocol ?? "—"}
- Treatment request: ${patient.treatment_request ?? "—"}
- Service interests: ${JSON.stringify(patient.service_interests ?? [])}
- Medical history: ${JSON.stringify(patient.medical_history ?? {})}
- Active medications: ${JSON.stringify(meds ?? [])}

Recommend the appropriate baseline / monitoring lab panel.`;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const aiResp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "recommend_panel",
                description: "Return the recommended lab panel.",
                parameters: {
                  type: "object",
                  properties: {
                    panel_name: { type: "string" },
                    rationale: { type: "string" },
                    urgency: {
                      type: "string",
                      enum: ["routine", "soon", "urgent"],
                    },
                    fasting_required: { type: "boolean" },
                    icd10_codes: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          code: { type: "string" },
                          description: { type: "string" },
                        },
                        required: ["code", "description"],
                      },
                    },
                    tests: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          code: { type: "string" },
                          name: { type: "string" },
                          reason: { type: "string" },
                        },
                        required: ["code", "name", "reason"],
                      },
                    },
                  },
                  required: [
                    "panel_name",
                    "rationale",
                    "urgency",
                    "fasting_required",
                    "icd10_codes",
                    "tests",
                  ],
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "recommend_panel" },
          },
        }),
      },
    );

    if (aiResp.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit — try again in a minute." }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    if (aiResp.status === 402) {
      return new Response(
        JSON.stringify({
          error: "AI credits exhausted. Add credits in workspace settings.",
        }),
        {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, errText);
      throw new Error(`AI gateway ${aiResp.status}`);
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call returned by AI");

    const recommendation = JSON.parse(toolCall.function.arguments);

    // Save to patients.lab_panel_recommendation for one-click approval later
    await supabase
      .from("patients")
      .update({
        lab_panel_recommendation: {
          ...recommendation,
          generated_at: new Date().toISOString(),
        },
      })
      .eq("id", patient_id);

    return new Response(JSON.stringify({ recommendation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("recommend-lab-panel error:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
