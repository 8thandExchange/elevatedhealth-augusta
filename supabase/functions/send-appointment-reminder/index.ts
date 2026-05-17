/**
 * send-appointment-reminder
 *
 * Sends an SMS appointment reminder via Sinch. Two modes:
 *   - Single patient (patient_phone supplied)
 *   - Batch (send_to_all_tomorrow=true) — texts all patients with
 *     scheduled status
 *
 * AUTH POSTURE (security audit R-5, 2026-05-08):
 *   - verify_jwt = true in supabase/config.toml
 *   - Caller MUST present a valid Supabase JWT
 *   - Caller MUST have role = 'staff' OR role = 'admin'
 *
 * Background: previously anyone could trigger SMS to any phone number
 * (single mode) or to every scheduled patient (batch mode). Lock down to
 * staff/admin since this is a staff-triggered operational tool, not a
 * patient-facing surface.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function requireStaffOrAdmin(req: Request): Promise<
  | { ok: true; user_id: string }
  | { ok: false; status: number; error: string }
> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return { ok: false, status: 401, error: "Missing Authorization header" };
  }
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await supabaseAuth.auth.getUser();
  if (userErr || !userData?.user) {
    return { ok: false, status: 401, error: "Invalid or expired session" };
  }
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: roles } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id);
  const isStaffOrAdmin = (roles || []).some(
    (r) => r.role === "staff" || r.role === "admin",
  );
  if (!isStaffOrAdmin) {
    return { ok: false, status: 403, error: "Staff or admin role required" };
  }
  return { ok: true, user_id: userData.user.id };
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SMS-REMINDER] ${step}${detailsStr}`);
};

// Format phone number for Sinch (E.164 format)
function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If 10 digits, assume US and add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // If 11 digits starting with 1, add +
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  // If already has country code, just add +
  if (digits.length > 10) {
    return `+${digits}`;
  }
  
  throw new Error(`Invalid phone number format: ${phone}`);
}

// Send SMS via Sinch
async function sendSMS(to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { sendSmsViaGhl } = await import("../_shared/ghl-sms.ts");
  return sendSmsViaGhl(to, message);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authResult = await requireStaffOrAdmin(req);
  if (!authResult.ok) {
    return new Response(JSON.stringify({ error: authResult.error }), {
      status: authResult.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    logStep("Function started", { triggered_by: authResult.user_id });

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    let { 
      patient_id,
      patient_phone,
      patient_name,
      appointment_date,
      appointment_time,
      appointment_type,
      custom_message,
      send_to_all_tomorrow,
      appointment_id,
    } = body;

    if (appointment_id && !patient_phone) {
      const { data: appt, error: apptErr } = await supabase
        .from("appointments")
        .select(
          `id, scheduled_at, service_line, reason, patient_id, patients:patients ( full_name, phone )`,
        )
        .eq("id", appointment_id)
        .maybeSingle();
      if (apptErr || !appt) {
        throw new Error(apptErr?.message || "Appointment not found");
      }
      const scheduled = new Date(appt.scheduled_at);
      patient_id = appt.patient_id;
      patient_phone = appt.patients?.phone;
      patient_name = appt.patients?.full_name;
      appointment_date = scheduled.toLocaleDateString("en-US", {
        weekday: "short", month: "short", day: "numeric", timeZone: "America/New_York",
      });
      appointment_time = scheduled.toLocaleTimeString("en-US", {
        hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/New_York",
      });
      appointment_type = appt.reason || appt.service_line || "appointment";
    }

    logStep("Request received", { patient_id, patient_phone, appointment_type, send_to_all_tomorrow, appointment_id });

    const results: Array<{ patient_id?: string; phone: string; success: boolean; error?: string }> = [];

    // Mode 1: Send reminder to a specific patient
    if (patient_phone && !send_to_all_tomorrow) {
      const name = patient_name || "there";
      const type = appointment_type || "appointment";
      const date = appointment_date || "your scheduled date";
      const time = appointment_time || "";
      
      const message = custom_message || 
        `Hi ${name}! This is a reminder from Elevated Health Augusta about your ${type} on ${date}${time ? ` at ${time}` : ''}. ` +
        `If you need to reschedule, please call us at (706) 760-3470. We look forward to seeing you!`;

      const result = await sendSMS(patient_phone, message);
      results.push({ 
        patient_id, 
        phone: patient_phone, 
        success: result.success, 
        error: result.error 
      });
    }
    
    // Mode 2: Send batch reminders to all patients with phone numbers (manual trigger)
    else if (send_to_all_tomorrow) {
      // Fetch all patients with phone numbers and scheduled consultations
      const { data: patients, error: fetchError } = await supabase
        .from("patients")
        .select("id, full_name, phone, onboarding_status, primary_program")
        .not("phone", "is", null)
        .in("onboarding_status", ["consult_scheduled", "needs_consult"]);

      if (fetchError) {
        throw new Error(`Failed to fetch patients: ${fetchError.message}`);
      }

      logStep("Found patients with scheduled appointments", { count: patients?.length || 0 });

      for (const patient of patients || []) {
        if (!patient.phone) continue;

        const programMap: Record<string, string> = {
          hormone: "hormone consultation",
          weightloss: "weight loss consultation",
          peptide: "peptide therapy consultation",
          iv: "IV therapy appointment",
        };
        const programName = programMap[patient.primary_program || "hormone"] || "consultation";

        const message = 
          `Hi ${patient.full_name?.split(" ")[0] || "there"}! This is a reminder from Elevated Health Augusta about your upcoming ${programName}. ` +
          `Please arrive 10 minutes early. If you need to reschedule, call (706) 760-3470. See you soon!`;

        const result = await sendSMS(patient.phone, message);
        results.push({
          patient_id: patient.id,
          phone: patient.phone,
          success: result.success,
          error: result.error,
        });

        // Small delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    else {
      throw new Error("Either patient_phone or send_to_all_tomorrow must be provided");
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    logStep("Batch complete", { total: results.length, success: successCount, failed: failCount });

    return new Response(JSON.stringify({
      success: true,
      summary: {
        total: results.length,
        sent: successCount,
        failed: failCount,
      },
      results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
