import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
  const accessKey = Deno.env.get("SINCH_ACCESS_KEY");
  const secretKey = Deno.env.get("SINCH_SECRET_KEY");
  
  if (!accessKey || !secretKey) {
    throw new Error("Sinch credentials not configured");
  }

  const formattedPhone = formatPhoneNumber(to);
  logStep("Sending SMS", { to: formattedPhone, messageLength: message.length });

  // Sinch SMS API endpoint
  const url = "https://us.sms.api.sinch.com/xms/v1/" + accessKey + "/batches";
  
  const payload = {
    from: "ElevatedHealth", // Sinch sender ID (alphanumeric or phone number)
    to: [formattedPhone],
    body: message,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    
    if (!response.ok) {
      logStep("Sinch API error", { status: response.status, result });
      return { success: false, error: result.text || "Failed to send SMS" };
    }

    logStep("SMS sent successfully", { batchId: result.id });
    return { success: true, messageId: result.id };
  } catch (error) {
    logStep("SMS send error", { error: String(error) });
    return { success: false, error: String(error) };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { 
      patient_id,
      patient_phone,
      patient_name,
      appointment_date,
      appointment_time,
      appointment_type,
      custom_message,
      send_to_all_tomorrow // If true, send reminders to all patients with appointments tomorrow
    } = body;

    logStep("Request received", { patient_id, patient_phone, appointment_type, send_to_all_tomorrow });

    const results: Array<{ patient_id?: string; phone: string; success: boolean; error?: string }> = [];

    // Mode 1: Send reminder to a specific patient
    if (patient_phone && !send_to_all_tomorrow) {
      const name = patient_name || "there";
      const type = appointment_type || "appointment";
      const date = appointment_date || "your scheduled date";
      const time = appointment_time || "";
      
      const message = custom_message || 
        `Hi ${name}! This is a reminder from Réveil about your ${type} on ${date}${time ? ` at ${time}` : ''}. ` +
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
          ketamine: "ketamine consultation",
          weightloss: "weight loss consultation",
          peptide: "peptide therapy consultation",
        };
        const programName = programMap[patient.primary_program || "hormone"] || "consultation";

        const message = 
          `Hi ${patient.full_name?.split(" ")[0] || "there"}! This is a reminder from Réveil about your upcoming ${programName}. ` +
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
