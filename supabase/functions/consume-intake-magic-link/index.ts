import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";
import { corsHeaders } from "../_shared/intake-magic-link-auth.ts";
import { resolvePatientAuthUserId } from "../_shared/resolve-patient-auth-user.ts";

function createAdminAuthClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Supabase service configuration missing");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const functionName = "consume-intake-magic-link";

  try {
    const { token } = await req.json();
    if (!token || typeof token !== "string") {
      return new Response(JSON.stringify({ error: "invalid_token", reason: "missing_token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createAdminAuthClient();

    const { data: link, error: linkError } = await supabase
      .from("intake_magic_links")
      .select(
        "id, patient_id, expires_at, revoked_at, use_count, first_used_at, pending_consent_types, pending_reconsent_request_id, pending_substance_id",
      )
      .eq("token", token)
      .maybeSingle();

    if (linkError || !link) {
      return new Response(JSON.stringify({ error: "invalid_token", reason: "not_found" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (link.revoked_at) {
      return new Response(JSON.stringify({ error: "revoked", reason: "revoked" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (new Date(link.expires_at).getTime() <= Date.now()) {
      return new Response(JSON.stringify({ error: "expired", reason: "expired" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("id, full_name, email, user_id")
      .eq("id", link.patient_id)
      .maybeSingle();

    if (patientError || !patient?.email) {
      return new Response(JSON.stringify({ error: "invalid_token", reason: "patient_not_found" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authUserId = await resolvePatientAuthUserId(supabase, {
      id: patient.id,
      full_name: patient.full_name,
      email: patient.email.trim().toLowerCase(),
      user_id: patient.user_id,
    });

    const redirectTo = `${Deno.env.get("APP_BASE_URL") || "https://elevatedhealthaugusta.com"}/intake/consents`;
    const linkEmail = patient.email.trim();

    let linkData: Awaited<ReturnType<typeof supabase.auth.admin.generateLink>>["data"] | null = null;
    let genError: Error | null = null;

    for (const linkType of ["magiclink", "recovery"] as const) {
      for (const emailCandidate of [linkEmail, linkEmail.toLowerCase()]) {
        const result = await supabase.auth.admin.generateLink({
          type: linkType,
          email: emailCandidate,
          options: { redirectTo },
        });
        linkData = result.data;
        genError = result.error;
        if (!genError && linkData?.properties?.hashed_token) {
          break;
        }
      }
      if (linkData?.properties?.hashed_token) {
        break;
      }
    }

    const nowIso = new Date().toISOString();
    await supabase
      .from("intake_magic_links")
      .update({
        use_count: (link.use_count ?? 0) + 1,
        first_used_at: link.first_used_at ?? nowIso,
        last_used_at: nowIso,
      })
      .eq("id", link.id);

    if (genError || !linkData?.properties?.hashed_token) {
      edgeStructuredLog(functionName, {
        event: "token_consumed_existing_account",
        patient_id: patient.id,
        auth_user_id: authUserId,
        success: true,
        error_message: genError?.message ?? "generate_link_failed",
      });

      return new Response(
        JSON.stringify({
          patient_id: patient.id,
          patient_name: patient.full_name,
          email: patient.email,
          auth_user_id: authUserId,
          use_existing_account: true,
          pending_consent_types: link.pending_consent_types ?? null,
          pending_reconsent_request_id: link.pending_reconsent_request_id ?? null,
          pending_substance_id: link.pending_substance_id ?? null,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    edgeStructuredLog(functionName, {
      event: "token_consumed",
      patient_id: patient.id,
      success: true,
    });

    return new Response(
      JSON.stringify({
        patient_id: patient.id,
        patient_name: patient.full_name,
        email: patient.email,
        pending_consent_types: link.pending_consent_types ?? null,
        pending_reconsent_request_id: link.pending_reconsent_request_id ?? null,
        pending_substance_id: link.pending_substance_id ?? null,
        token_hash: linkData.properties.hashed_token,
        verification_type: linkData.properties.verification_type || "magiclink",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    edgeStructuredLog(functionName, {
      event: "handler_error",
      success: false,
      error_message: message,
    }, "error");
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
