import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return `+${digits}`;
}

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
    const message = `Hi ${patientName.split(" ")[0]}, your Elevated Health appointment has been rescheduled to ${when} ET with ${providerName}. Reply HELP or call us with questions.`;

    const accessKey = Deno.env.get("SINCH_ACCESS_KEY");
    const secretKey = Deno.env.get("SINCH_SECRET_KEY");
    if (!accessKey || !secretKey) {
      console.warn("[reschedule-notif] Sinch keys missing — would send:", message);
      return new Response(JSON.stringify({ ok: true, skipped: "no sinch keys" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const auth = btoa(`${accessKey}:${secretKey}`);
    const projectId = "elevatedhealth"; // not used; Sinch SMS is via REST below
    const sinchRes = await fetch("https://us.sms.api.sinch.com/xms/v1/default/batches", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: Deno.env.get("STAFF_NOTIFICATION_PHONE") || undefined,
        to: [formatPhone(phone)],
        body: message,
      }),
    });
    const result = await sinchRes.text();
    console.log("[reschedule-notif] Sinch:", sinchRes.status, result);
    return new Response(JSON.stringify({ ok: sinchRes.ok }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: sinchRes.ok ? 200 : 500,
    });
  } catch (e: any) {
    console.error("[reschedule-notif]", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
