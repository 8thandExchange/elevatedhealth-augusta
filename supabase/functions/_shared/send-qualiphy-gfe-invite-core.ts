import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import {
  assertConsultPaidForGfe,
  formatPhoneE164,
  hasValidGfeClearance,
  splitFullName,
} from "./gfe-clearance.ts";
import { buildGfeLinkMessages } from "./gfe-clearance-messages.ts";
import {
  createQualiphyExamInvite,
  getQualiphyExamIds,
  qualiphyWebhookUrl,
} from "./qualiphy-client.ts";

const FROM_EMAIL = "Elevated Health Augusta <noreply@elevatedhealthaugusta.com>";
const DEFAULT_PATIENT_STATE = "GA";

export type GfeInviteErrorCode =
  | "qualiphy_not_configured"
  | "patient_not_found"
  | "email_required"
  | "dob_required"
  | "consult_not_paid"
  | "gfe_already_valid"
  | "phone_required"
  | "clearance_insert_failed"
  | "delivery_failed";

export type SendGfeInviteResult =
  | { ok: true; clearance_id: string; meeting_url: string | null; delivered: string[] }
  | { ok: false; error: string; error_code: GfeInviteErrorCode; skipped?: boolean };

/** Send Qualiphy remote GFE invite (service-role only). */
export async function sendQualiphyGfeInvite(
  supabase: SupabaseClient,
  args: {
    patientId: string;
    channels?: ("email" | "sms")[];
    serviceCategory?: string;
    teleState?: string;
    sentByUserId?: string | null;
  },
): Promise<SendGfeInviteResult> {
  const apiKey = Deno.env.get("QUALIPHY_API_KEY");
  const examIds = getQualiphyExamIds();
  if (!apiKey || examIds.length === 0) {
    return {
      ok: false,
      error:
        "Qualiphy is not configured. Set QUALIPHY_API_KEY and QUALIPHY_GFE_EXAM_ID(S) in Supabase secrets.",
      error_code: "qualiphy_not_configured",
      skipped: true,
    };
  }

  const patientId = args.patientId;
  const channels = args.channels ?? ["email", "sms"];
  const serviceCategory = args.serviceCategory ?? "general";
  const teleState = args.teleState ?? DEFAULT_PATIENT_STATE;

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id, full_name, email, phone, dob, state, onboarding_status")
    .eq("id", patientId)
    .maybeSingle();

  if (patientError || !patient) {
    return { ok: false, error: "Patient not found", error_code: "patient_not_found" };
  }
  if (!patient.email) {
    return {
      ok: false,
      error: "Patient email is required for Qualiphy GFE",
      error_code: "email_required",
    };
  }
  if (!patient.dob) {
    return {
      ok: false,
      error: "Patient date of birth is required before sending a remote GFE link.",
      error_code: "dob_required",
      skipped: true,
    };
  }

  const paidCheck = await assertConsultPaidForGfe(
    supabase,
    patientId,
    patient.email,
    patient.onboarding_status,
  );
  if (!paidCheck.ok) {
    return { ok: false, error: paidCheck.message, error_code: "consult_not_paid" };
  }

  if (await hasValidGfeClearance(supabase, patientId)) {
    return {
      ok: false,
      error: "Patient already has a valid GFE clearance on file (valid for 12 months).",
      error_code: "gfe_already_valid",
      skipped: true,
    };
  }

  const phone = formatPhoneE164(patient.phone);
  if (channels.includes("sms") && !phone) {
    return {
      ok: false,
      error: "Valid patient phone required for SMS delivery",
      error_code: "phone_required",
    };
  }

  await supabase
    .from("gfe_clearances")
    .update({ status: "cancelled" })
    .eq("patient_id", patientId)
    .eq("status", "pending");

  const { data: clearanceRow, error: insertError } = await supabase
    .from("gfe_clearances")
    .insert({
      patient_id: patientId,
      service_category: serviceCategory,
      clearance_source: "qualiphy",
      status: "pending",
      consultation_booking_id: paidCheck.consultation_booking_id ?? null,
      sent_by: args.sentByUserId ?? null,
    })
    .select("id")
    .single();

  if (insertError || !clearanceRow) {
    return {
      ok: false,
      error: insertError?.message ?? "Failed to create clearance row",
      error_code: "clearance_insert_failed",
    };
  }

  const { first_name, last_name } = splitFullName(patient.full_name);
  const patientState =
    (typeof patient.state === "string" && patient.state.trim().length === 2
      ? patient.state.trim().toUpperCase()
      : null) ?? teleState;

  const qualiphyResponse = await createQualiphyExamInvite({
    api_key: apiKey,
    exams: examIds,
    first_name,
    last_name,
    email: patient.email,
    dob: patient.dob,
    phone_number: phone ?? patient.phone ?? "",
    state: patientState,
    tele_state: patientState,
    webhook_url: qualiphyWebhookUrl(),
    additional_data: JSON.stringify({
      patient_id: patientId,
      clearance_id: clearanceRow.id,
    }),
  });

  const patientExam = qualiphyResponse.patient_exams?.[0];

  await supabase
    .from("gfe_clearances")
    .update({
      qualiphy_patient_exam_id: patientExam?.patient_exam_id?.toString() ?? null,
      qualiphy_meeting_uuid: qualiphyResponse.meeting_uuid ?? null,
      qualiphy_exam_id: patientExam?.exam_id ?? examIds[0] ?? null,
      exam_name: patientExam?.exam_title ?? null,
      meeting_url: qualiphyResponse.meeting_url ?? null,
      sent_at: new Date().toISOString(),
    })
    .eq("id", clearanceRow.id);

  const messages = buildGfeLinkMessages({
    firstName: first_name,
    meetingUrl: qualiphyResponse.meeting_url!,
  });

  const delivered: string[] = [];
  const resendKey = Deno.env.get("RESEND_API_KEY");

  if (channels.includes("email") && patient.email && resendKey) {
    const { Resend } = await import("https://esm.sh/resend@2.0.0");
    const resend = new Resend(resendKey);
    const { error: emailError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [patient.email],
      subject: messages.emailSubject,
      html: messages.emailHtml,
      text: messages.emailText,
    });
    if (emailError) {
      return {
        ok: false,
        error: emailError.message ?? "Email delivery failed",
        error_code: "delivery_failed",
      };
    }
    delivered.push("email");
  }

  if (channels.includes("sms") && phone) {
    const { sendSms } = await import("./sms.ts");
    const smsResult = await sendSms(phone, messages.smsBody);
    if (!smsResult.success) {
      return {
        ok: false,
        error: smsResult.error ?? "SMS delivery failed",
        error_code: "delivery_failed",
      };
    }
    delivered.push("sms");
  }

  await supabase
    .from("patients")
    .update({ onboarding_status: "gfe_pending" })
    .eq("id", patientId)
    .in("onboarding_status", ["consultation_paid", "consultation_pending", "prequal_consents_complete"]);

  return {
    ok: true,
    clearance_id: clearanceRow.id,
    meeting_url: qualiphyResponse.meeting_url ?? null,
    delivered,
  };
}
