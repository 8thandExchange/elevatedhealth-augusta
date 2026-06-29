import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";
import { buildIntakeMagicLinkUrl } from "../_shared/magic-link-helpers.ts";
import {
  buildIntakeLinkMessages,
  firstNameFromFullName,
  sendIntakeSms,
  intakeConsentTypeDisplayLabel,
  type IntakeLinkContext,
} from "../_shared/intake-magic-link-messages.ts";
import { MAIL_FROM } from "../_shared/mail-config.ts";
import {
  corsHeaders,
  createServiceClient,
  requireStaffOrServiceRole,
} from "../_shared/intake-magic-link-auth.ts";


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const functionName = "send-intake-magic-link";

  try {
    const supabase = createServiceClient();
    const auth = await requireStaffOrServiceRole(supabase, req);
    if (!auth.ok) {
      return new Response(JSON.stringify({ error: auth.message }), {
        status: auth.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const patientId = body.patient_id as string;
    const magicLinkToken = body.magic_link_token as string;
    const context = (body.context || "initial_booking") as IntakeLinkContext;
    const channelOverride = body.channels as ("email" | "sms")[] | undefined;
    const appointmentDate = body.appointment_date as string | undefined;
    const appointmentTime = body.appointment_time as string | undefined;

    if (!patientId || !magicLinkToken) {
      return new Response(JSON.stringify({ error: "patient_id and magic_link_token are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("id, full_name, email, phone, intake_link_email_opt_out, intake_link_sms_opt_out")
      .eq("id", patientId)
      .maybeSingle();

    if (patientError || !patient) {
      return new Response(JSON.stringify({ error: "Patient not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: linkRow, error: linkError } = await supabase
      .from("intake_magic_links")
      .select("id, expires_at, revoked_at")
      .eq("token", magicLinkToken)
      .eq("patient_id", patientId)
      .maybeSingle();

    if (linkError || !linkRow) {
      return new Response(JSON.stringify({ error: "Magic link not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (linkRow.revoked_at) {
      return new Response(JSON.stringify({ error: "Magic link revoked" }), {
        status: 410,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (new Date(linkRow.expires_at).getTime() <= Date.now()) {
      return new Response(JSON.stringify({ error: "Magic link expired" }), {
        status: 410,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const magicLinkUrl = buildIntakeMagicLinkUrl(magicLinkToken);
    const firstName = firstNameFromFullName(patient.full_name || "Patient");
    const consentTypesRaw = body.consent_types as string[] | undefined;
    const consentDocumentLabels =
      consentTypesRaw?.map((t) => intakeConsentTypeDisplayLabel(t)) ?? [];

    const messages = buildIntakeLinkMessages({
      context,
      firstName,
      magicLinkUrl,
      appointmentDate,
      appointmentTime,
      consentDocumentLabels:
        context === "tier2_consent_request" || context === "reconsent_request"
          ? consentDocumentLabels
          : undefined,
      expirationReminder:
        context === "consent_expiration_reminder"
          ? {
              consentLabel: (body.expiration_consent_label as string) || "Treatment",
              expiryFormatted: (body.expiration_expiry_formatted as string) || "",
              daysRemaining: Number(body.expiration_days_remaining ?? 0),
            }
          : undefined,
      reconsentReminder:
        context === "reconsent_reminder"
          ? {
              consentLabel: (body.reconsent_consent_label as string) || "Treatment",
              deadlineFormatted: (body.reconsent_deadline_formatted as string) || "",
              daysRemaining: Number(body.reconsent_days_remaining ?? 0),
            }
          : undefined,
      substanceLabel:
        context === "substance_acknowledgment_request"
          ? ((body.substance_label as string) || undefined)
          : undefined,
    });

    const wantEmail = channelOverride?.includes("email") ?? true;
    const wantSms = channelOverride?.includes("sms") ?? true;

    const delivered: string[] = [];
    const skipped: { channel: string; reason: string }[] = [];

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const resend = resendKey ? new Resend(resendKey) : null;

    if (wantEmail && patient.email && !patient.intake_link_email_opt_out) {
      if (!resend) {
        skipped.push({ channel: "email", reason: "RESEND_API_KEY not configured" });
      } else {
        try {
          await resend.emails.send({
            from: MAIL_FROM,
            to: [patient.email],
            subject: messages.emailSubject,
            text: messages.emailText,
            html: messages.emailHtml,
          });
          delivered.push("email");
        } catch (e) {
          skipped.push({
            channel: "email",
            reason: e instanceof Error ? e.message : String(e),
          });
        }
      }
    } else if (wantEmail) {
      skipped.push({
        channel: "email",
        reason: !patient.email ? "no_email" : "opted_out",
      });
    }

    if (wantSms && patient.phone && !patient.intake_link_sms_opt_out) {
      const sms = await sendIntakeSms(patient.phone, messages.smsBody);
      if (sms.ok) delivered.push("sms");
      else skipped.push({ channel: "sms", reason: sms.error ?? "send_failed" });
    } else if (wantSms) {
      skipped.push({
        channel: "sms",
        reason: !patient.phone ? "no_phone" : "opted_out",
      });
    }

    edgeStructuredLog(functionName, {
      event: "delivery_complete",
      patient_id: patientId,
      context,
      success: delivered.length > 0,
      delivered_channels: delivered.join(","),
    });

    return new Response(
      JSON.stringify({
        success: delivered.length > 0,
        delivered_channels: delivered,
        skipped_channels: skipped,
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