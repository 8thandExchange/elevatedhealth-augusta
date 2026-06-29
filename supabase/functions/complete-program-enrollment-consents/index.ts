// complete-program-enrollment-consents — verify Tier-2 consents then advance to consent_completed.
import { corsHeaders, json } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/supabase.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const { consentTypes } = await req.json();
    if (!Array.isArray(consentTypes) || consentTypes.length === 0) {
      return json({ error: "missing_consent_types" }, 400);
    }

    const db = serviceClient();
    const { data: patient } = await db
      .from("patients")
      .select("id")
      .eq("user_id", callerId)
      .maybeSingle();
    if (!patient) return json({ error: "patient_not_found" }, 404);

    const now = new Date().toISOString();
    for (const consentType of consentTypes) {
      const { data: rec } = await db
        .from("consent_records")
        .select("id, expires_at")
        .eq("patient_id", patient.id)
        .eq("consent_type", consentType)
        .is("revoked_at", null)
        .order("signed_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!rec || new Date(rec.expires_at).getTime() <= Date.now()) {
        return json({ error: "consent_incomplete", consentType }, 409);
      }
    }

    await db.rpc("advance_journey", {
      p_patient: callerId,
      p_stage: "consent_completed",
      p_note: `Program enrollment consents signed: ${consentTypes.join(", ")} at ${now}`,
    });

    return json({ ok: true });
  } catch (err) {
    return json({ error: String(err?.message ?? err) }, 500);
  }
});
