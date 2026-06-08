/**
 * Twilio inbound SMS webhook.
 * Configure in Twilio Console → Phone Number → Messaging → "A message comes in":
 *   https://<project-ref>.supabase.co/functions/v1/twilio-inbound-sms
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { phoneLast10 } from "../_shared/twilio-sms.ts";
import { sendSms } from "../_shared/sms.ts";
import {
  twimlResponse,
  validateTwilioSignature,
} from "../_shared/twilio-webhook.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function findPatientByPhone(
  supabase: ReturnType<typeof createClient>,
  phone: string,
): Promise<{ id: string; full_name: string } | null> {
  const last10 = phoneLast10(phone);
  const { data } = await supabase
    .from("patients")
    .select("id, full_name, phone")
    .not("phone", "is", null)
    .limit(500);

  const match = (data || []).find(
    (p) => p.phone && phoneLast10(p.phone) === last10,
  );
  return match ? { id: match.id, full_name: match.full_name } : null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  if (!authToken) {
    console.error("[twilio-inbound-sms] TWILIO_AUTH_TOKEN missing");
    return new Response("Server misconfigured", { status: 500 });
  }

  const webhookUrl =
    Deno.env.get("TWILIO_INBOUND_SMS_WEBHOOK_URL") || new URL(req.url).toString();

  const rawBody = await req.text();
  const params = Object.fromEntries(new URLSearchParams(rawBody));
  const signature = req.headers.get("X-Twilio-Signature");

  const valid = await validateTwilioSignature(authToken, signature, webhookUrl, params);
  if (!valid) {
    console.error("[twilio-inbound-sms] invalid Twilio signature");
    return new Response("Forbidden", { status: 403 });
  }

  const from = params.From || "";
  const to = params.To || "";
  const body = (params.Body || "").trim();
  const messageSid = params.MessageSid || null;

  if (!from || !body) {
    return twimlResponse("<Response></Response>");
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const patient = await findPatientByPhone(supabase, from);

  const { error: insertErr } = await supabase.from("sms_messages").insert({
    patient_id: patient?.id ?? null,
    direction: "inbound",
    from_number: from,
    to_number: to,
    body,
    twilio_sid: messageSid,
    delivery_status: "received",
    is_read: false,
  });

  if (insertErr) {
    console.error("[twilio-inbound-sms] insert failed", insertErr);
  }

  // Notify staff for new inbound texts (best-effort)
  const staffPhones = (Deno.env.get("STAFF_NOTIFICATION_PHONES") || "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  if (staffPhones.length > 0) {
    const who = patient?.full_name || from;
    const preview = body.length > 120 ? `${body.slice(0, 117)}…` : body;
    const alert = `📱 SMS from ${who}: "${preview}" — reply in Office Dashboard`;
    for (const staffPhone of staffPhones) {
      await sendSms(staffPhone, alert, { sourceFunction: "twilio-inbound-sms" });
    }
  }

  // Optional auto-reply (disable by setting TWILIO_INBOUND_AUTO_REPLY=false)
  const autoReply = Deno.env.get("TWILIO_INBOUND_AUTO_REPLY");
  if (autoReply !== "false") {
    const reply =
      autoReply ||
      "Thanks for texting Elevated Health Augusta! Our team will reply shortly. For urgent needs call (706) 760-3470.";
    return twimlResponse(`<Response><Message>${escapeXml(reply)}</Message></Response>`);
  }

  return twimlResponse("<Response></Response>");
});

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
