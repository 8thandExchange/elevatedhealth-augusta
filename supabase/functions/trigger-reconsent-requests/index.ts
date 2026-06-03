import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";
import {
  computeIntakeLinkExpiry,
  generateMagicLinkToken,
} from "../_shared/magic-link-helpers.ts";
import {
  corsHeaders,
  createServiceClient,
  requireBusinessAdminJwt,
} from "../_shared/intake-magic-link-auth.ts";

const DAY_MS = 24 * 60 * 60 * 1000;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const functionName = "trigger-reconsent-requests";
  const errors: string[] = [];

  try {
    const supabase = createServiceClient();
    const auth = await requireBusinessAdminJwt(supabase, req);
    if (!auth.ok) {
      return new Response(JSON.stringify({ error: auth.message }), {
        status: auth.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const prior_version_id = body.prior_version_id as string | undefined;
    const new_version_id = body.new_version_id as string | undefined;

    if (!prior_version_id || !new_version_id) {
      return new Response(JSON.stringify({ error: "prior_version_id and new_version_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: prior, error: priorErr } = await supabase
      .from("consent_versions")
      .select("id, is_active, force_re_consent_required, consent_type")
      .eq("id", prior_version_id)
      .maybeSingle();

    if (priorErr || !prior) {
      return new Response(JSON.stringify({ error: "prior version not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (prior.is_active !== false || prior.force_re_consent_required !== true) {
      return new Response(
        JSON.stringify({
          error: "prior version must be inactive with force_re_consent_required=true",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: nextV, error: nextErr } = await supabase
      .from("consent_versions")
      .select("id, is_active, consent_type, legal_review_status")
      .eq("id", new_version_id)
      .maybeSingle();

    if (nextErr || !nextV || nextV.is_active !== true) {
      return new Response(JSON.stringify({ error: "new version must exist and be active" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (nextV.legal_review_status !== "approved") {
      return new Response(
        JSON.stringify({ error: "new version must have legal_review_status = approved" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (prior.consent_type !== nextV.consent_type) {
      return new Response(JSON.stringify({ error: "consent_type mismatch between versions" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const nowIso = new Date().toISOString();
    const deadlineIso = new Date(Date.now() + 30 * DAY_MS).toISOString();

    const { data: records, error: recErr } = await supabase
      .from("consent_records")
      .select("id, patient_id, consent_type")
      .eq("consent_version_id", prior_version_id)
      .is("revoked_at", null)
      .gt("expires_at", nowIso);

    if (recErr) throw recErr;

    const processed = records?.length ?? 0;
    let requests_created = 0;
    let links_sent = 0;

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    type Created = { id: string; patient_id: string; consent_type: string };
    const createdRows: Created[] = [];

    for (const rec of records ?? []) {
      const { data: dup } = await supabase
        .from("consent_reconsent_requests")
        .select("id")
        .eq("prior_consent_record_id", rec.id)
        .eq("new_version_id", new_version_id)
        .maybeSingle();

      if (dup) continue;

      const { data: inserted, error: insErr } = await supabase
        .from("consent_reconsent_requests")
        .insert({
          patient_id: rec.patient_id,
          consent_type: rec.consent_type,
          prior_consent_record_id: rec.id,
          prior_version_id,
          new_version_id,
          triggered_at: nowIso,
          reconsent_deadline: deadlineIso,
        })
        .select("id")
        .single();

      if (insErr || !inserted) {
        errors.push(`insert ${rec.id}: ${insErr?.message ?? "unknown"}`);
        continue;
      }

      requests_created++;
      createdRows.push({
        id: inserted.id as string,
        patient_id: rec.patient_id as string,
        consent_type: rec.consent_type as string,
      });
    }

    for (const row of createdRows) {
      const { data: patient, error: pErr } = await supabase
        .from("patients")
        .select("id, email, phone")
        .eq("id", row.patient_id)
        .maybeSingle();

      if (pErr || !patient?.email) {
        errors.push(`patient ${row.patient_id}: missing patient or email`);
        continue;
      }

      const token = generateMagicLinkToken();
      const expiresAt = computeIntakeLinkExpiry(null, new Date(Date.now() + 35 * DAY_MS).toISOString());

      const { error: linkErr } = await supabase.from("intake_magic_links").insert({
        token,
        patient_id: row.patient_id,
        email_address: patient.email,
        phone_number: patient.phone,
        expires_at: expiresAt,
        pending_consent_types: [row.consent_type],
        pending_reconsent_request_id: row.id,
      });

      if (linkErr) {
        errors.push(`magic link ${row.id}: ${linkErr.message}`);
        continue;
      }

      const channels: ("email" | "sms")[] = [];
      channels.push("email");
      if (patient.phone) channels.push("sms");

      const resp = await fetch(`${supabaseUrl}/functions/v1/send-intake-magic-link`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_id: row.patient_id,
          magic_link_token: token,
          context: "reconsent_request",
          consent_types: [row.consent_type],
          channels,
        }),
      });

      const sendJson = await resp.json().catch(() => ({}));
      if (!resp.ok || sendJson?.success !== true) {
        errors.push(`send ${row.patient_id}: ${sendJson?.error ?? resp.status}`);
        continue;
      }

      links_sent++;
    }

    edgeStructuredLog(functionName, {
      event: "complete",
      processed,
      requests_created,
      links_sent,
      error_count: errors.length,
      success: errors.length === 0,
    });

    return new Response(
      JSON.stringify({
        processed,
        requests_created,
        links_sent,
        errors,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    edgeStructuredLog(functionName, { event: "handler_error", error_message: message, success: false }, "error");
    return new Response(JSON.stringify({ error: message, errors }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
