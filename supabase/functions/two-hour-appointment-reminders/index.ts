import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[2H-REMINDER-CRON] ${step}${detailsStr}`);
};

const CLINIC_PHONE = "(706) 760-3470";
const SMS_SENDER = "ElevatedHealth";

function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return `+${digits}`;
}

async function sendSMS(to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { sendSmsViaGhl } = await import("../_shared/ghl-sms.ts");
  return sendSmsViaGhl(to, message);
}

interface AppointmentRow {
  id: string;
  scheduled_at: string;
  service_line: string | null;
  reason: string | null;
  patients?: {
    full_name: string | null;
    phone: string | null;
  } | null;
}

const SERVICE_DESCRIPTIONS: Record<string, string> = {
  iv: "IV session",
  consult: "wellness assessment",
  hormone: "hormone consultation",
  weight_loss: "weight loss consultation",
  peptide: "peptide consultation",
  follow_up: "follow-up visit",
};

// Two-hour reminder. Designed to be invoked every 15 minutes by an external
// scheduler (Lovable Cloud / Supabase scheduled functions). For each pending
// appointment whose scheduled_at falls into the next [105, 135] minute window
// and whose reminder_2h_sent_at is NULL, send a single SMS and stamp the
// column to prevent re-sends.
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("2h reminder pass started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    // Window centred at +2h, ±15 min, so a cron running every 15 min covers
    // every appointment exactly once between 1h45 and 2h15 out.
    const windowStart = new Date(now.getTime() + 105 * 60_000);
    const windowEnd = new Date(now.getTime() + 135 * 60_000);

    logStep("Window", {
      start: windowStart.toISOString(),
      end: windowEnd.toISOString(),
    });

    const { data: appointments, error: apptErr } = await supabase
      .from("appointments")
      .select(
        `
          id,
          scheduled_at,
          service_line,
          reason,
          patients:patients ( full_name, phone )
        `,
      )
      .gte("scheduled_at", windowStart.toISOString())
      .lte("scheduled_at", windowEnd.toISOString())
      .neq("status", "cancelled")
      .neq("status", "completed")
      .neq("status", "no_show")
      .is("reminder_2h_sent_at", null);

    if (apptErr) {
      throw new Error(`Failed to fetch appointments: ${apptErr.message}`);
    }

    logStep("Eligible appointments", { count: appointments?.length || 0 });

    const results: Array<{ appointmentId: string; success: boolean; error?: string }> = [];

    for (const appt of (appointments || []) as AppointmentRow[]) {
      const phone = appt.patients?.phone;
      if (!phone) continue;

      const firstName = appt.patients?.full_name?.split(/\s+/)[0] || "Hi";
      const apptDate = new Date(appt.scheduled_at);
      const timeStr = apptDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "America/New_York",
      });
      const serviceDescription =
        appt.reason ||
        SERVICE_DESCRIPTIONS[appt.service_line || ""] ||
        "appointment";

      const message =
        `${firstName}: see you in 2 hours. ${serviceDescription} at ${timeStr}, ` +
        `7013 Evans Town Center Blvd Ste 203, Evans GA. Reschedule: ${CLINIC_PHONE}.`;

      const result = await sendSMS(phone, message);
      results.push({
        appointmentId: appt.id,
        success: result.success,
        error: result.error,
      });

      if (result.success) {
        await supabase
          .from("appointments")
          .update({ reminder_2h_sent_at: new Date().toISOString() })
          .eq("id", appt.id);
      }

      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    logStep("2h reminders complete", {
      total: results.length,
      success: successCount,
      failed: failCount,
    });

    return new Response(
      JSON.stringify({
        success: true,
        summary: { total: results.length, sent: successCount, failed: failCount },
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
