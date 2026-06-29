// advance-patient-journey — forward-only patient_journey updates (staff or gated patient paths).
import { corsHeaders, json } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/supabase.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { hasClinicStaffRole } from "../_shared/staff-auth.ts";

const PATIENT_SELF_STAGES = new Set(["consent_completed"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseAuth = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await supabaseAuth.auth.getUser();
    const callerId = userData.user?.id;
    if (!callerId) return json({ error: "unauthorized" }, 401);

    const body = await req.json();
    const stage = body.stage as string | undefined;
    const note = typeof body.note === "string" ? body.note : null;
    const patientId = typeof body.patientId === "string" ? body.patientId : null;

    if (!stage) return json({ error: "missing_stage" }, 400);

    const db = serviceClient();

    const { data: roles } = await db.from("user_roles").select("role").eq("user_id", callerId);
    const isStaff = hasClinicStaffRole((roles ?? []).map((r) => String(r.role)));

    let patientUserId: string | null = null;

    if (isStaff && patientId) {
      const { data: patient } = await db
        .from("patients")
        .select("user_id")
        .eq("id", patientId)
        .maybeSingle();
      patientUserId = patient?.user_id ?? null;
    } else {
      const { data: ownPatient } = await db
        .from("patients")
        .select("user_id, id")
        .eq("user_id", callerId)
        .maybeSingle();
      if (patientId && ownPatient?.id !== patientId) {
        return json({ error: "forbidden" }, 403);
      }
      patientUserId = callerId;
    }

    if (!patientUserId) return json({ error: "patient_not_found" }, 404);

    if (!isStaff && !PATIENT_SELF_STAGES.has(stage)) {
      return json({ error: "forbidden_stage" }, 403);
    }

    await db.rpc("advance_journey", {
      p_patient: patientUserId,
      p_stage: stage,
      p_note: note,
    });

    return json({ ok: true, stage, patientUserId });
  } catch (err) {
    return json({ error: String(err?.message ?? err) }, 500);
  }
});
