import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CLINIC_PHONE = "(706) 760-3470";

function smsWelcomeLog(
  event: string,
  fields: {
    patient_id?: string | null;
    phone_last4?: string | null;
    success: boolean;
    error_message?: string | null;
  },
  level: "info" | "error" = "info",
) {
  edgeStructuredLog("send-welcome-sms", {
    event,
    patient_id: fields.patient_id ?? null,
    phone_last4: fields.phone_last4 ?? null,
    success: fields.success,
    error_message: fields.error_message ?? null,
  }, level);
}


async function sendSMS(to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { sendSms } = await import("../_shared/sms.ts");
  return sendSms(to, message);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let patientIdForLog: string | null = null;
  let phoneLast4: string | null = null;

  try {

    const { phone, first_name, primary_program, patient_id } = await req.json();

    smsWelcomeLog("entry", {
      patient_id: patient_id ?? null,
      phone_last4: phone?.length >= 4 ? String(phone).replace(/\D/g, "").slice(-4) : null,
      success: true,
      error_message: null,
    });

    if (!phone) {
      smsWelcomeLog("validation_error", {
        patient_id: patient_id ?? null,
        phone_last4: null,
        success: false,
        error_message: "phone is required",
      }, "error");
      throw new Error("phone is required");
    }

    patientIdForLog = patient_id ?? null;
    const digits = String(phone).replace(/\D/g, "");
    phoneLast4 = digits.length >= 4 ? digits.slice(-4) : null;

    const firstName = first_name || "there";
    const rawProgram = primary_program || "general";
    const programKey = rawProgram === "ketamine" ? "general" : rawProgram;

    const programHints: Record<string, string> = {
      hormone: "Hormone Optimization",
      weight_loss: "Medical Weight Loss",
      peptide: "Peptide Protocols",
      general: "Elevated Health",
    };
    const programLabel = programHints[programKey] || programHints.general;

    const message =
      `Hi ${firstName}! Welcome to Elevated Health Augusta (${programLabel}). ` +
      `Book your $79 Wellness Assessment; LabCorp draws in-office when ordered. ` +
      `ELEVATED programs from $199/mo. Portal: elevatedhealthaugusta.com/patient/login ` +
      `Questions: ${CLINIC_PHONE}`;

    const smsResult = await sendSMS(phone, message);
    if (!smsResult.success) {
      smsWelcomeLog("ghl_error", {
        patient_id: patientIdForLog,
        phone_last4: phoneLast4,
        success: false,
        error_message: smsResult.error || "SMS failed",
      }, "error");
      throw new Error(smsResult.error || "SMS send failed");
    }

    smsWelcomeLog("send_complete", {
      patient_id: patientIdForLog,
      phone_last4: phoneLast4,
      success: true,
      error_message: null,
    });

    return new Response(
      JSON.stringify({ success: true, message: "Welcome SMS sent" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Welcome SMS error:", error);
    smsWelcomeLog("handler_error", {
      patient_id: patientIdForLog,
      phone_last4: phoneLast4,
      success: false,
      error_message: message,
    }, "error");
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
