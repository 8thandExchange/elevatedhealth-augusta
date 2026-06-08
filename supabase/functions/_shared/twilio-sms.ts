/**
 * Low-level Twilio Programmable SMS.
 *
 * Supabase secrets:
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_MESSAGING_SERVICE_SID  (preferred — attach your number + 10DLC campaign)
 *   TWILIO_SMS_FROM_NUMBER        (fallback if no messaging service)
 *   TWILIO_STATUS_CALLBACK_URL    (optional delivery status webhook)
 */

export function formatPhoneE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length > 10) return `+${digits}`;
  throw new Error(`Invalid phone number: ${phone}`);
}

export function phoneLast10(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

export type SendTwilioSmsResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

function twilioConfig():
  | { ok: true; accountSid: string; authToken: string; from: string }
  | { ok: false; error: string } {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const messagingServiceSid = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID");
  const fromNumber = Deno.env.get("TWILIO_SMS_FROM_NUMBER");

  if (!accountSid || !authToken) {
    return { ok: false, error: "TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN not configured" };
  }
  if (!messagingServiceSid && !fromNumber) {
    return {
      ok: false,
      error: "Configure TWILIO_MESSAGING_SERVICE_SID or TWILIO_SMS_FROM_NUMBER",
    };
  }

  return {
    ok: true,
    accountSid,
    authToken,
    from: messagingServiceSid ? `MessagingServiceSid:${messagingServiceSid}` : fromNumber!,
  };
}

export async function sendTwilioSms(
  to: string,
  message: string,
): Promise<SendTwilioSmsResult> {
  const cfg = twilioConfig();
  if (!cfg.ok) {
    return { success: false, error: cfg.error };
  }

  let formattedTo: string;
  try {
    formattedTo = formatPhoneE164(to);
  } catch (e) {
    return { success: false, error: String(e) };
  }

  const body = new URLSearchParams();
  body.set("To", formattedTo);
  body.set("Body", message);

  if (cfg.from.startsWith("MessagingServiceSid:")) {
    body.set("MessagingServiceSid", cfg.from.replace("MessagingServiceSid:", ""));
  } else {
    body.set("From", cfg.from);
  }

  const statusCallback = Deno.env.get("TWILIO_STATUS_CALLBACK_URL");
  if (statusCallback) {
    body.set("StatusCallback", statusCallback);
  }

  const url =
    `https://api.twilio.com/2010-04-01/Accounts/${cfg.accountSid}/Messages.json`;
  const basicAuth = btoa(`${cfg.accountSid}:${cfg.authToken}`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const text = await res.text();
  let json: Record<string, unknown> = {};
  try {
    json = JSON.parse(text) as Record<string, unknown>;
  } catch {
    /* non-json */
  }

  if (!res.ok) {
    const detail = (json.message as string) || text.slice(0, 200);
    console.error("[twilio-sms] send failed", res.status, detail);
    return { success: false, error: `Twilio SMS failed (${res.status}): ${detail}` };
  }

  const messageId = (json.sid as string) || undefined;
  console.log("[twilio-sms] sent", { to: formattedTo, messageId });
  return { success: true, messageId };
}
