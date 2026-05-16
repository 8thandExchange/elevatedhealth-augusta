import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";
import { corsHeaders, createServiceClient } from "../_shared/intake-magic-link-auth.ts";

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

    const supabase = createServiceClient();

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

    let authUserId = patient.user_id as string | null;

    if (!authUserId) {
      const tempPassword = crypto.randomUUID() + crypto.randomUUID();
      const { data: created, error: createError } = await supabase.auth.admin.createUser({
        email: patient.email,
        email_confirm: true,
        password: tempPassword,
        user_metadata: { full_name: patient.full_name, patient_id: patient.id },
      });

      if (createError || !created.user) {
        throw new Error(createError?.message ?? "Could not create auth user for patient");
      }

      authUserId = created.user.id;
      await supabase.from("patients").update({ user_id: authUserId }).eq("id", patient.id);
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authUserId)
        .eq("role", "user")
        .maybeSingle();
      if (!existingRole) {
        await supabase.from("user_roles").insert({ user_id: authUserId, role: "user" });
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

    const { data: linkData, error: genError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: patient.email,
      options: {
        redirectTo: `${Deno.env.get("APP_BASE_URL") || "https://elevatedhealthaugusta.com"}/intake/consents`,
      },
    });

    if (genError || !linkData?.properties?.hashed_token) {
      throw new Error(genError?.message ?? "Failed to generate auth session");
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
