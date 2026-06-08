import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { sendSms } from "../_shared/sms.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const patientName = body.patient_name || body.patientName || "there";
    const phone = body.patient_phone || body.patientPhone;
    const newAt = body.new_scheduled_at || body.newScheduledAt;
    const providerName = body.new_provider_name || body.newProviderName || "your provider";

    if (!phone || !newAt) {
      return new Response(JSON.stringify({ ok: true, skipped: "missing phone or time" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const when = new Date(newAt).toLocaleString("en-US", {
      weekday: "short", month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit", timeZone: "America/New_York",
    });
    const message = `Hi ${String(patientName).split(" ")[0]}, your Elevated Health appointment has been rescheduled to ${when} ET with ${providerName}. Reply HELP or call us with questions.`;

    const result = await sendSms(phone, message, { contactName: patientName });
    return new Response(JSON.stringify({ ok: result.success, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: result.success ? 200 : 500,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
