import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[DAILY-REMINDER-CRON] ${step}${detailsStr}`);
};

const CLINIC_PHONE = "(706) 760-3470";
// Sender ID is unified across all booking SMS (booking confirmation, daily
// reminder, 2h reminder). Sinch alphanumeric senders aren't billable as
// separate phone numbers and they're consistent for receivers.
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
  duration_minutes: number;
  service_line: string | null;
  reason: string | null;
  patient_id: string;
  patients?: {
    full_name: string | null;
    phone: string | null;
    email: string | null;
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Daily reminder cron started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Compute the [tomorrow 00:00, tomorrow 23:59] window in clinic local time
    // (America/New_York). We approximate by anchoring on UTC and letting the
    // database TZ-naive timestamp comparison filter; final formatting uses
    // toLocaleString with timeZone for SMS body.
    const now = new Date();
    const tomorrowStart = new Date(now);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    logStep("Looking for appointments", {
      tomorrowStart: tomorrowStart.toISOString(),
      tomorrowEnd: tomorrowEnd.toISOString(),
    });

    // Read from appointments (the source of truth) instead of
    // consultation_bookings.booked_for, which is no longer the authoritative
    // place for visit time. This single query covers IV bookings, consults,
    // and any other appointment_type without a special-cased ketamine branch.
    const { data: appointments, error: apptErr } = await supabase
      .from("appointments")
      .select(
        `
          id,
          scheduled_at,
          duration_minutes,
          service_line,
          reason,
          patient_id,
          patients:patients ( full_name, phone, email )
        `,
      )
      .gte("scheduled_at", tomorrowStart.toISOString())
      .lte("scheduled_at", tomorrowEnd.toISOString())
      .neq("status", "cancelled")
      .is("reminder_sent_at", null);

    if (apptErr) {
      logStep("Error fetching appointments", { error: apptErr.message });
      throw new Error(`Failed to fetch appointments: ${apptErr.message}`);
    }

    logStep("Found appointments for tomorrow", {
      count: appointments?.length || 0,
    });

    const results: Array<{ appointmentId: string; phone: string; success: boolean; error?: string }> = [];

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
      const dateStr = apptDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: "America/New_York",
      });

      const serviceDescription =
        appt.reason ||
        SERVICE_DESCRIPTIONS[appt.service_line || ""] ||
        "appointment";

      const message =
        `${firstName}: reminder — your ${serviceDescription} at Elevated Health Augusta ` +
        `is ${dateStr} at ${timeStr}. Arrive 10 min early. ` +
        `Reschedule: ${CLINIC_PHONE}.`;

      const result = await sendSMS(phone, message);
      results.push({
        appointmentId: appt.id,
        phone,
        success: result.success,
        error: result.error,
      });

      if (result.success) {
        await supabase
          .from("appointments")
          .update({ reminder_sent_at: new Date().toISOString() })
          .eq("id", appt.id);
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    logStep("Daily reminders complete", {
      total: results.length,
      success: successCount,
      failed: failCount,
    });

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total: results.length,
          sent: successCount,
          failed: failCount,
        },
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
