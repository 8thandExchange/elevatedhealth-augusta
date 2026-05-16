import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";
import {
  computeIntakeLinkExpiry,
  generateMagicLinkToken,
} from "../_shared/magic-link-helpers.ts";
import {
  corsHeaders,
  createServiceClient,
  requireServiceRoleOnly,
} from "../_shared/intake-magic-link-auth.ts";
import { intakeConsentTypeDisplayLabel } from "../_shared/intake-magic-link-messages.ts";

const DAY_MS = 24 * 60 * 60 * 1000;
const TIER2_TYPES = ["hormone_therapy", "glp1", "off_label", "research_peptide"];

type ReminderWindow = "30_day" | "14_day" | "3_day";

interface PatientJoinRow {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  intake_link_email_opt_out: boolean | null;
  intake_link_sms_opt_out: boolean | null;
}

interface ConsentRow {
  id: string;
  patient_id: string;
  consent_type: string;
  expires_at: string;
  patients: PatientJoinRow | PatientJoinRow[] | null;
}

type ReconsentReminderWindow = "30_day" | "14_day" | "3_day" | "due_day";

interface ReconsentRow {
  id: string;
  patient_id: string;
  consent_type: string;
  reconsent_deadline: string;
  patients: PatientJoinRow | PatientJoinRow[] | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const functionName = "send-consent-expiration-reminders";

  // Auth: accept either service-role bearer (edge-to-edge) or X-Cron-Secret
  // header (pg_cron scheduled invocation, mirrors send-intake-reminder).
  const cronSecret = Deno.env.get("CRON_SECRET");
  const suppliedCronSecret = req.headers.get("X-Cron-Secret");
  const cronOk = Boolean(cronSecret && suppliedCronSecret && suppliedCronSecret === cronSecret);

  if (!cronOk) {
    const auth = requireServiceRoleOnly(req);
    if (!auth.ok) {
      return new Response(JSON.stringify({ error: auth.message }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const supabase = createServiceClient();
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  const now = Date.now();

  const windows: { key: ReminderWindow; start: string; end: string }[] = [
    {
      key: "30_day",
      start: new Date(now + 28 * DAY_MS).toISOString(),
      end: new Date(now + 32 * DAY_MS).toISOString(),
    },
    {
      key: "14_day",
      start: new Date(now + 12 * DAY_MS).toISOString(),
      end: new Date(now + 16 * DAY_MS).toISOString(),
    },
    {
      key: "3_day",
      start: new Date(now + 1 * DAY_MS).toISOString(),
      end: new Date(now + 5 * DAY_MS).toISOString(),
    },
  ];

  let candidates = 0;
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  let reconsent_candidates = 0;
  let reconsent_sent = 0;
  let reconsent_skipped = 0;
  let reconsent_failed = 0;

  try {
    for (const w of windows) {
      const { data: rows, error: qErr } = await supabase
        .from("consent_records")
        .select(
          `
          id,
          patient_id,
          consent_type,
          expires_at,
          patients!inner (
            full_name,
            email,
            phone,
            intake_link_email_opt_out,
            intake_link_sms_opt_out
          )
        `,
        )
        .is("revoked_at", null)
        .in("consent_type", TIER2_TYPES)
        .gte("expires_at", w.start)
        .lte("expires_at", w.end);

      if (qErr) throw qErr;

      for (const raw of rows ?? []) {
        const row = raw as ConsentRow;
        candidates++;

        const { data: already } = await supabase
          .from("consent_expiration_reminders_sent")
          .select("id")
          .eq("consent_record_id", row.id)
          .eq("reminder_window", w.key)
          .maybeSingle();

        if (already) {
          skipped++;
          continue;
        }

        const patientJoin = Array.isArray(row.patients) ? row.patients[0] : row.patients;
        if (!patientJoin?.email) {
          skipped++;
          continue;
        }

        const expiryMs = new Date(row.expires_at).getTime();
        const daysRemaining = Math.max(1, Math.ceil((expiryMs - now) / DAY_MS));
        const expiryFormatted = new Date(row.expires_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        const token = generateMagicLinkToken();
        const expiresAt = computeIntakeLinkExpiry(null, new Date(now + 7 * DAY_MS).toISOString());

        const { error: insErr } = await supabase.from("intake_magic_links").insert({
          token,
          patient_id: row.patient_id,
          email_address: patientJoin.email,
          phone_number: patientJoin.phone,
          expires_at: expiresAt,
          pending_consent_types: [row.consent_type],
        });

        if (insErr) {
          failed++;
          edgeStructuredLog(functionName, {
            event: "link_insert_failed",
            consent_record_id: row.id,
            error_message: insErr.message,
          }, "error");
          continue;
        }

        const sendPayload = {
          patient_id: row.patient_id,
          magic_link_token: token,
          context: "consent_expiration_reminder",
          consent_types: [row.consent_type],
          expiration_consent_label: intakeConsentTypeDisplayLabel(row.consent_type),
          expiration_expiry_formatted: expiryFormatted,
          expiration_days_remaining: daysRemaining,
          channels: ["email", "sms"],
        };

        const resp = await fetch(`${supabaseUrl}/functions/v1/send-intake-magic-link`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${serviceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sendPayload),
        });

        const sendJson = await resp.json().catch(() => ({}));

        if (!resp.ok || sendJson?.success !== true) {
          failed++;
          edgeStructuredLog(functionName, {
            event: "send_failed",
            consent_record_id: row.id,
            reminder_window: w.key,
            status: resp.status,
          }, "error");
          continue;
        }

        const delivered = (sendJson.delivered_channels as string[]) ?? [];

        const { error: trackErr } = await supabase.from("consent_expiration_reminders_sent").insert({
          consent_record_id: row.id,
          reminder_window: w.key,
          channels_delivered: delivered,
        });

        if (trackErr) {
          edgeStructuredLog(functionName, {
            event: "dedupe_insert_failed",
            consent_record_id: row.id,
            error_message: trackErr.message,
            success: false,
          }, "error");
        }

        sent++;
      }
    }

    const reconsentWindows: { key: ReconsentReminderWindow; start: string; end: string }[] = [
      {
        key: "30_day",
        start: new Date(now + 28 * DAY_MS).toISOString(),
        end: new Date(now + 32 * DAY_MS).toISOString(),
      },
      {
        key: "14_day",
        start: new Date(now + 12 * DAY_MS).toISOString(),
        end: new Date(now + 16 * DAY_MS).toISOString(),
      },
      {
        key: "3_day",
        start: new Date(now + 1 * DAY_MS).toISOString(),
        end: new Date(now + 5 * DAY_MS).toISOString(),
      },
      {
        key: "due_day",
        start: new Date(now).toISOString(),
        end: new Date(now + 36 * 60 * 60 * 1000).toISOString(),
      },
    ];

    for (const w of reconsentWindows) {
      const { data: rrows, error: rErr } = await supabase
        .from("consent_reconsent_requests")
        .select(
          `
          id,
          patient_id,
          consent_type,
          reconsent_deadline,
          patients!inner (
            full_name,
            email,
            phone,
            intake_link_email_opt_out,
            intake_link_sms_opt_out
          )
        `,
        )
        .is("fulfilled_at", null)
        .gte("reconsent_deadline", w.start)
        .lte("reconsent_deadline", w.end);

      if (rErr) throw rErr;

      for (const raw of rrows ?? []) {
        const row = raw as ReconsentRow;
        reconsent_candidates++;

        const { data: already } = await supabase
          .from("consent_reconsent_reminders_sent")
          .select("id")
          .eq("reconsent_request_id", row.id)
          .eq("reminder_window", w.key)
          .maybeSingle();

        if (already) {
          reconsent_skipped++;
          continue;
        }

        const patientJoin = Array.isArray(row.patients) ? row.patients[0] : row.patients;
        if (!patientJoin?.email) {
          reconsent_skipped++;
          continue;
        }

        const deadlineMs = new Date(row.reconsent_deadline).getTime();
        const daysRemaining = Math.max(1, Math.ceil((deadlineMs - now) / DAY_MS));
        const deadlineFormatted = new Date(row.reconsent_deadline).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        const token = generateMagicLinkToken();
        const expiresAt = computeIntakeLinkExpiry(null, new Date(now + 7 * DAY_MS).toISOString());

        const { error: rcLinkErr } = await supabase.from("intake_magic_links").insert({
          token,
          patient_id: row.patient_id,
          email_address: patientJoin.email,
          phone_number: patientJoin.phone,
          expires_at: expiresAt,
          pending_consent_types: [row.consent_type],
          pending_reconsent_request_id: row.id,
        });

        if (rcLinkErr) {
          reconsent_failed++;
          edgeStructuredLog(functionName, {
            event: "reconsent_link_insert_failed",
            reconsent_request_id: row.id,
            error_message: rcLinkErr.message,
          }, "error");
          continue;
        }

        const rcSendPayload = {
          patient_id: row.patient_id,
          magic_link_token: token,
          context: "reconsent_reminder",
          consent_types: [row.consent_type],
          reconsent_consent_label: intakeConsentTypeDisplayLabel(row.consent_type),
          reconsent_deadline_formatted: deadlineFormatted,
          reconsent_days_remaining: daysRemaining,
          channels: ["email", "sms"],
        };

        const rcResp = await fetch(`${supabaseUrl}/functions/v1/send-intake-magic-link`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${serviceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(rcSendPayload),
        });

        const rcSendJson = await rcResp.json().catch(() => ({}));

        if (!rcResp.ok || rcSendJson?.success !== true) {
          reconsent_failed++;
          edgeStructuredLog(functionName, {
            event: "reconsent_send_failed",
            reconsent_request_id: row.id,
            reminder_window: w.key,
            status: rcResp.status,
          }, "error");
          continue;
        }

        const rcDelivered = (rcSendJson.delivered_channels as string[]) ?? [];

        const { error: rcTrackErr } = await supabase.from("consent_reconsent_reminders_sent").insert({
          reconsent_request_id: row.id,
          reminder_window: w.key,
          channels_delivered: rcDelivered,
        });

        if (rcTrackErr) {
          edgeStructuredLog(functionName, {
            event: "reconsent_dedupe_insert_failed",
            reconsent_request_id: row.id,
            error_message: rcTrackErr.message,
            success: false,
          }, "error");
        }

        reconsent_sent++;
      }
    }

    edgeStructuredLog(functionName, {
      event: "batch_complete",
      candidates,
      sent,
      skipped,
      failed,
      reconsent_candidates,
      reconsent_sent,
      reconsent_skipped,
      reconsent_failed,
      success: failed === 0 && reconsent_failed === 0,
    });

    return new Response(
      JSON.stringify({
        success: true,
        candidates,
        sent,
        skipped,
        failed,
        reconsent_candidates,
        reconsent_sent,
        reconsent_skipped,
        reconsent_failed,
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
