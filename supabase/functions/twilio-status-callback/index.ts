/**
 * Twilio SMS delivery status callback.
 * Set TWILIO_STATUS_CALLBACK_URL to this function URL in Supabase secrets.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { validateTwilioSignature } from "../_shared/twilio-webhook.ts";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  if (!authToken) {
    return new Response("Server misconfigured", { status: 500 });
  }

  const webhookUrl =
    Deno.env.get("TWILIO_STATUS_CALLBACK_WEBHOOK_URL") || new URL(req.url).toString();

  const rawBody = await req.text();
  const params = Object.fromEntries(new URLSearchParams(rawBody));
  const signature = req.headers.get("X-Twilio-Signature");

  const valid = await validateTwilioSignature(authToken, signature, webhookUrl, params);
  if (!valid) {
    return new Response("Forbidden", { status: 403 });
  }

  const messageSid = params.MessageSid;
  const messageStatus = params.MessageStatus;

  if (messageSid && messageStatus) {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    await supabase
      .from("sms_messages")
      .update({ delivery_status: messageStatus })
      .eq("twilio_sid", messageSid);
  }

  return new Response("OK", { status: 200 });
});
