import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";
import {
  assertConsultPaidForGfe,
  formatPhoneE164,
  hasValidGfeClearance,
  splitFullName,
} from "../_shared/gfe-clearance.ts";
import { buildGfeLinkMessages } from "../_shared/gfe-clearance-messages.ts";
import {
  corsHeaders,
  createServiceClient,
  requireStaffOrServiceRole,
} from "../_shared/intake-magic-link-auth.ts";
import {
  createQualiphyExamInvite,
  getQualiphyExamIds,
  qualiphyWebhookUrl,
} from "../_shared/qualiphy-client.ts";

const FROM_EMAIL = "Elevated Health Augusta <noreply@elevatedhealthaugusta.com>";
const DEFAULT_PATIENT_STATE = "GA";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const functionName = "qualiphy-send-gfe-invite";

  try {
    const supabase = createServiceClient();
    const auth = await requireStaffOrServiceRole(supabase, req);
    if (!auth.ok) {
      return new Response(JSON.stringify({ error: auth.message }), {
        status: auth.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("QUALIPHY_API_KEY");
    const examIds = getQualiphyExamIds();
    if (!apiKey || examIds.length === 0) {
      return new Response(
        JSON.stringify({
          error:
            "Qualiphy is not configured. Set QUALIPHY_API_KEY and QUALIPHY_GFE_EXAM_ID(S) in Supabase secrets.",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json();
    const patientId = body.patient_id as string;
    const channels = (body.channels as ("email" | "sms")[]) ?? ["email"];
    const serviceCategory = (body.service_category as string) || "general";
    const teleState = (body.tele_state as string) || DEFAULT_PATIENT_STATE;

    if (!patientId) {
      return new Response(JSON.stringify({ error: "patient_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("id, full_name, email, phone, dob, state, onboarding_status")
      .eq("id", patientId)
      .maybeSingle();

    if (patientError || !patient) {
      return new Response(JSON.stringify({ error: "Patient not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!patient.email) {
      return new Response(JSON.stringify({ error: "Patient email is required for Qualiphy GFE" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!patient.dob) {
      return new Response(
        JSON.stringify({ error: "Patient date of birth is required before sending a remote GFE link." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const paidCheck = await assertConsultPaidForGfe(
      supabase,
      patientId,
      patient.email,
      patient.onboarding_status,
    );
    if (!paidCheck.ok) {
      return new Response(JSON.stringify({ error: paidCheck.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (await hasValidGfeClearance(supabase, patientId)) {
      return new Response(
        JSON.stringify({
          error: "Patient already has a valid GFE clearance on file (valid for 12 months).",
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const phone = formatPhoneE164(patient.phone);
    if (channels.includes("sms") && !phone) {
      return new Response(JSON.stringify({ error: "Valid patient phone required for SMS delivery" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
        sent_by: auth.userId ?? null,
      })
      .select("id")
      .single();

    if (insertError || !clearanceRow) {
      throw insertError ?? new Error("Failed to create clearance row");
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

    const firstName = first_name;
    const messages = buildGfeLinkMessages({
      firstName,
      meetingUrl: qualiphyResponse.meeting_url!,
    });

    const delivered: string[] = [];
    const resend = new Resend(Deno.env.get("RESEND_API_KEY") ?? "");

    if (channels.includes("email") && patient.email) {
      const { error: emailError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [patient.email],
        subject: messages.emailSubject,
        html: messages.emailHtml,
        text: messages.emailText,
      });
      if (emailError) throw emailError;
      delivered.push("email");
    }

    if (channels.includes("sms") && phone) {
      const { sendSms } = await import("../_shared/sms.ts");
      const smsResult = await sendSms(phone, messages.smsBody);
      if (!smsResult.success) {
        throw new Error(smsResult.error ?? "SMS delivery failed");
      }
      delivered.push("sms");
    }

    edgeStructuredLog(functionName, {
      patient_id: patientId,
      clearance_id: clearanceRow.id,
      delivered,
      success: true,
    });

    return new Response(
      JSON.stringify({
        success: true,
        clearance_id: clearanceRow.id,
        meeting_url: qualiphyResponse.meeting_url,
        delivered_channels: delivered,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    edgeStructuredLog(functionName, { success: false, error_message: message });
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
