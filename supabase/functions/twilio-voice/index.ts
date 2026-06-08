/**
 * Twilio Voice webhook — clinic line routing.
 *
 * Configure in Twilio Console → Phone Number → Voice → "A call comes in":
 *   https://<project-ref>.supabase.co/functions/v1/twilio-voice
 *
 * Secrets:
 *   TWILIO_VOICE_FORWARD_NUMBERS — comma-separated E.164 numbers (Kristen, Caroline, etc.)
 *   TWILIO_CLINIC_PHONE — caller ID for outbound leg (default +17067603470)
 *   TWILIO_VOICE_GREETING — optional custom greeting
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { validateTwilioSignature, twimlResponse } from "../_shared/twilio-webhook.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function isBusinessHours(): boolean {
  // Mon–Fri 9am–5pm America/New_York
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "numeric",
    hour12: false,
  }).formatToParts(now);

  const weekday = parts.find((p) => p.type === "weekday")?.value || "";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const isWeekday = !["Sat", "Sun"].includes(weekday);
  return isWeekday && hour >= 9 && hour < 17;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  if (authToken) {
    const webhookUrl =
      Deno.env.get("TWILIO_VOICE_WEBHOOK_URL") || new URL(req.url).toString();
    const rawBody = await req.text();
    const params = Object.fromEntries(new URLSearchParams(rawBody));
    const signature = req.headers.get("X-Twilio-Signature");
    const valid = await validateTwilioSignature(authToken, signature, webhookUrl, params);
    if (!valid) {
      return new Response("Forbidden", { status: 403 });
    }
  }

  const greeting =
    Deno.env.get("TWILIO_VOICE_GREETING") ||
    "Thank you for calling Elevated Health Augusta, your physician-owned wellness clinic in Evans, Georgia.";

  const forwardNumbers = (Deno.env.get("TWILIO_VOICE_FORWARD_NUMBERS") || "")
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);

  const callerId = Deno.env.get("TWILIO_CLINIC_PHONE") || "+17067603470";

  let twiml = `<Response><Say voice="Polly.Joanna">${escapeXml(greeting)}</Say>`;

  if (isBusinessHours() && forwardNumbers.length > 0) {
    twiml += `<Dial timeout="25" callerId="${escapeXml(callerId)}">`;
    for (const num of forwardNumbers) {
      twiml += `<Number>${escapeXml(num)}</Number>`;
    }
    twiml += `</Dial>`;
    twiml +=
      `<Say voice="Polly.Joanna">We're sorry we missed your call. Please leave a message after the tone, or text us at this number.</Say>`;
  } else {
    twiml +=
      `<Say voice="Polly.Joanna">Our office is currently closed. Please leave a message after the tone and we'll return your call on the next business day.</Say>`;
  }

  twiml += `<Record maxLength="120" transcribe="true" playBeep="true" />`;
  twiml += `</Response>`;

  return twimlResponse(twiml);
});
