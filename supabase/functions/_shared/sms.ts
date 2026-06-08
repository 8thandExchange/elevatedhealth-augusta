/**
 * Canonical SMS module for all edge functions.
 * Sends via Twilio and logs outbound messages to sms_messages when Supabase is available.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import {
  formatPhoneE164,
  phoneLast10,
  sendTwilioSms,
} from "./twilio-sms.ts";

export { formatPhoneE164, phoneLast10 };

export type SendSmsResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

export type SendSmsOptions = {
  /** Patient UUID when known — enables sms_messages logging */
  patientId?: string;
  /** Staff user UUID for manual replies */
  sentBy?: string;
  /** Edge function name for audit trail */
  sourceFunction?: string;
  /** Contact name (unused by Twilio; kept for API compatibility) */
  contactName?: string;
};

async function logOutboundSms(opts: {
  patientId?: string;
  fromNumber: string;
  toNumber: string;
  body: string;
  twilioSid?: string;
  sentBy?: string;
  sourceFunction?: string;
}): Promise<void> {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return;

  try {
    const supabase = createClient(url, key);
    await supabase.from("sms_messages").insert({
      patient_id: opts.patientId ?? null,
      direction: "outbound",
      from_number: opts.fromNumber,
      to_number: opts.toNumber,
      body: opts.body,
      twilio_sid: opts.twilioSid ?? null,
      delivery_status: "queued",
      sent_by: opts.sentBy ?? null,
      source_function: opts.sourceFunction ?? null,
    });
  } catch (e) {
    console.error("[sms] failed to log outbound message", e);
  }
}

function clinicFromNumber(): string {
  return (
    Deno.env.get("TWILIO_SMS_FROM_NUMBER") ||
    Deno.env.get("TWILIO_CLINIC_PHONE") ||
    "+17067603470"
  );
}

/** Send an outbound SMS via Twilio. */
export async function sendSms(
  to: string,
  message: string,
  options: SendSmsOptions = {},
): Promise<SendSmsResult> {
  const result = await sendTwilioSms(to, message);
  if (!result.success) return result;

  let formattedTo: string;
  try {
    formattedTo = formatPhoneE164(to);
  } catch {
    formattedTo = to;
  }

  await logOutboundSms({
    patientId: options.patientId,
    fromNumber: clinicFromNumber(),
    toNumber: formattedTo,
    body: message,
    twilioSid: result.messageId,
    sentBy: options.sentBy,
    sourceFunction: options.sourceFunction,
  });

  return result;
}

/** @deprecated Legacy GHL alias — use sendSms() */
export async function sendSmsViaGhl(
  to: string,
  message: string,
  contactName?: string,
): Promise<SendSmsResult> {
  return sendSms(to, message, { contactName });
}
