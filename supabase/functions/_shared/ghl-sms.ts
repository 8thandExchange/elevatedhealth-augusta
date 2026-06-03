/**
 * Send transactional SMS via GoHighLevel (LC Phone).
 * Requires Supabase secrets: GHL_API_KEY, GHL_LOCATION_ID
 */
const GHL_BASE = "https://services.leadconnectorhq.com";
// GHL docs recommend 2021-07-28+ for contacts/upsert; older Version values can 401.
const GHL_VERSION = "2021-07-28";

export function formatPhoneE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length > 10) return `+${digits}`;
  throw new Error(`Invalid phone number: ${phone}`);
}

function ghlHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    Version: GHL_VERSION,
    "Content-Type": "application/json",
  };
}

export type SendGhlSmsResult = {
  success: boolean;
  contactId?: string;
  messageId?: string;
  error?: string;
};

export async function sendGhlSms(opts: {
  phone: string;
  message: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}): Promise<SendGhlSmsResult> {
  const apiKey = Deno.env.get("GHL_API_KEY");
  const locationId = Deno.env.get("GHL_LOCATION_ID");

  if (!apiKey || !locationId) {
    return {
      success: false,
      error: "GHL_API_KEY or GHL_LOCATION_ID not configured in Supabase secrets",
    };
  }

  let phone: string;
  try {
    phone = formatPhoneE164(opts.phone);
  } catch (e) {
    return { success: false, error: String(e) };
  }

  const upsertBody: Record<string, string> = {
    locationId,
    phone,
    source: "elevated_health_app",
  };
  if (opts.firstName) upsertBody.firstName = opts.firstName;
  if (opts.lastName) upsertBody.lastName = opts.lastName;
  if (opts.email) upsertBody.email = opts.email;

  const upsertRes = await fetch(`${GHL_BASE}/contacts/upsert`, {
    method: "POST",
    headers: ghlHeaders(apiKey),
    body: JSON.stringify(upsertBody),
  });

  const upsertText = await upsertRes.text();
  let upsertJson: Record<string, unknown> = {};
  try {
    upsertJson = JSON.parse(upsertText) as Record<string, unknown>;
  } catch {
    /* non-json */
  }

  if (!upsertRes.ok) {
    console.error("[ghl-sms] contact upsert failed", upsertRes.status, upsertText);
    const detail = upsertText.length > 200 ? `${upsertText.slice(0, 200)}…` : upsertText;
    return {
      success: false,
      error: `GHL contact upsert failed (${upsertRes.status})${detail ? `: ${detail}` : ""}`,
    };
  }

  const contact = upsertJson.contact as Record<string, unknown> | undefined;
  const contactId = (contact?.id ?? upsertJson.id ?? upsertJson.contactId) as
    | string
    | undefined;

  if (!contactId) {
    console.error("[ghl-sms] upsert ok but no contact id", upsertText);
    return { success: false, error: "GHL contact upsert returned no contact id" };
  }

  const msgRes = await fetch(`${GHL_BASE}/conversations/messages`, {
    method: "POST",
    headers: ghlHeaders(apiKey),
    body: JSON.stringify({
      type: "SMS",
      contactId,
      message: opts.message,
    }),
  });

  const msgText = await msgRes.text();
  let msgJson: Record<string, unknown> = {};
  try {
    msgJson = JSON.parse(msgText) as Record<string, unknown>;
  } catch {
    /* non-json */
  }

  if (!msgRes.ok) {
    console.error("[ghl-sms] send message failed", msgRes.status, msgText);
    return {
      success: false,
      contactId,
      error: `GHL SMS failed (${msgRes.status})`,
    };
  }

  const message = msgJson.message as Record<string, unknown> | undefined;
  const messageId = (msgJson.messageId ?? msgJson.id ?? message?.id) as
    | string
    | undefined;

  console.log("[ghl-sms] sent", { contactId, messageId: messageId ?? "ok" });
  return { success: true, contactId, messageId };
}

/** Legacy sendSMS(to, message) shape used across edge functions. */
export async function sendSmsViaGhl(
  to: string,
  message: string,
  contactName?: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const parts = (contactName || "").trim().split(/\s+/).filter(Boolean);
  const result = await sendGhlSms({
    phone: to,
    message,
    firstName: parts[0],
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : undefined,
  });
  return {
    success: result.success,
    messageId: result.messageId,
    error: result.error,
  };
}
