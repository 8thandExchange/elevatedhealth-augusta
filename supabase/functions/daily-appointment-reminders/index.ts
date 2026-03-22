import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DAILY-REMINDER-CRON] ${step}${detailsStr}`);
};

// Format phone number for Sinch (E.164 format)
function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  return `+${digits}`;
}

// Send SMS via Sinch
async function sendSMS(to: string, message: string): Promise<{ success: boolean; error?: string }> {
  const accessKey = Deno.env.get("SINCH_ACCESS_KEY");
  const secretKey = Deno.env.get("SINCH_SECRET_KEY");
  
  if (!accessKey || !secretKey) {
    throw new Error("Sinch credentials not configured");
  }

  const formattedPhone = formatPhoneNumber(to);

  const url = `https://us.sms.api.sinch.com/xms/v1/${accessKey}/batches`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "12029533545",
        to: [formattedPhone],
        body: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: errorText };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

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

    // Calculate tomorrow's date range (in EST/EDT timezone)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const tomorrowStart = new Date(tomorrow);
    tomorrowStart.setHours(0, 0, 0, 0);
    
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    logStep("Looking for appointments", { 
      tomorrowStart: tomorrowStart.toISOString(),
      tomorrowEnd: tomorrowEnd.toISOString()
    });

    // Fetch consultation bookings scheduled for tomorrow
    const { data: bookings, error: bookingError } = await supabase
      .from("consultation_bookings")
      .select("id, customer_name, customer_phone, customer_email, service_type, booked_for")
      .gte("booked_for", tomorrowStart.toISOString())
      .lte("booked_for", tomorrowEnd.toISOString())
      .eq("status", "paid")
      .not("customer_phone", "is", null);

    if (bookingError) {
      logStep("Error fetching bookings", { error: bookingError.message });
      throw new Error(`Failed to fetch bookings: ${bookingError.message}`);
    }

    logStep("Found bookings for tomorrow", { count: bookings?.length || 0 });

    const results: Array<{ name: string; phone: string; success: boolean; error?: string }> = [];

    for (const booking of bookings || []) {
      if (!booking.customer_phone) continue;

      const firstName = booking.customer_name?.split(" ")[0] || "there";
      const appointmentDate = new Date(booking.booked_for);
      const timeStr = appointmentDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/New_York'
      });
      
      const serviceType = booking.service_type || "consultation";

      const message = 
        `Hi ${firstName}! 📅 Reminder: Your ${serviceType} at Réveil is tomorrow at ${timeStr}. ` +
        `Please arrive 10 mins early. Address: 7013 Evans Town Center Blvd, Suite 203, Evans GA. ` +
        `Need to reschedule? Call (706) 426-7383. See you soon!`;

      const result = await sendSMS(booking.customer_phone, message);
      
      results.push({
        name: booking.customer_name || "Unknown",
        phone: booking.customer_phone,
        success: result.success,
        error: result.error,
      });

      // Small delay between messages
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Also check patients table for anyone with consult_scheduled status
    const { data: patients, error: patientError } = await supabase
      .from("patients")
      .select("id, full_name, phone, primary_program")
      .eq("onboarding_status", "consult_scheduled")
      .not("phone", "is", null);

    if (!patientError && patients) {
      logStep("Found patients with scheduled consultations", { count: patients.length });

      for (const patient of patients) {
        if (!patient.phone) continue;

        // Check if we already sent to this phone
        const alreadySent = results.some(r => r.phone === patient.phone);
        if (alreadySent) continue;

        const firstName = patient.full_name?.split(" ")[0] || "there";
        const programType = patient.primary_program === "ketamine" ? "mental wellness" : "hormone optimization";

        const message = 
          `Hi ${firstName}! 📅 Reminder: You have an upcoming ${programType} consultation at Réveil. ` +
          `Please arrive 10 mins early. Questions? (706) 426-7383`;

        const result = await sendSMS(patient.phone, message);
        
        results.push({
          name: patient.full_name || "Unknown",
          phone: patient.phone,
          success: result.success,
          error: result.error,
        });

        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    logStep("Daily reminders complete", { 
      total: results.length, 
      success: successCount, 
      failed: failCount 
    });

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
