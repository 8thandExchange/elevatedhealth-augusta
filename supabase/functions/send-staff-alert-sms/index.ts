import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STAFF-ALERT-SMS] ${step}${detailsStr}`);
};

type AlertType = 
  | "intake_completed"
  | "payment_received"
  | "high_risk_patient"
  | "new_signup"
  | "consultation_booked"
  | "labs_received"
  | "custom";

interface StaffAlertRequest {
  alert_type: AlertType;
  patient_name: string;
  patient_email?: string;
  amount?: number;
  payment_type?: string;
  custom_message?: string;
  is_high_risk?: boolean;
  program?: string;
}

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


async function sendSMS(to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { sendSmsViaGhl } = await import("../_shared/ghl-sms.ts");
  return sendSmsViaGhl(to, message);
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const sinchAccessKey = Deno.env.get("SINCH_ACCESS_KEY");
    const sinchSecretKey = Deno.env.get("SINCH_SECRET_KEY");
    const staffPhone = Deno.env.get("STAFF_NOTIFICATION_PHONE");

    if (!sinchAccessKey || !sinchSecretKey) {
      throw new Error("Sinch API credentials not configured");
    }

    if (!staffPhone) {
      throw new Error("STAFF_NOTIFICATION_PHONE not configured");
    }

    const data: StaffAlertRequest = await req.json();
    const { alert_type, patient_name, amount, payment_type, custom_message, is_high_risk, program } = data;

    logStep("Processing alert", { alert_type, patient_name });

    // Build message based on alert type
    let message = "";
    const riskFlag = is_high_risk ? " ⚠️ HIGH RISK" : "";
    const firstName = patient_name?.split(" ")[0] || "Patient";

    switch (alert_type) {
      case "intake_completed":
        message = `📋 INTAKE COMPLETE${riskFlag}: ${patient_name} has finished their medical intake. Ready for provider review.`;
        break;
      
      case "payment_received":
        const amountStr = amount ? `$${amount}` : "";
        const typeStr = payment_type || "payment";
        message = `💰 PAYMENT: ${patient_name} - ${amountStr} ${typeStr} received. Check dashboard for details.`;
        break;
      
      case "high_risk_patient":
        message = `⚠️ HIGH RISK ALERT: ${patient_name} flagged as high risk during intake. Requires immediate provider review.`;
        break;
      
      case "new_signup":
        const programStr = program === "ketamine" ? "Ketamine" : "Hormone/Weight";
        message = `🆕 NEW PATIENT: ${patient_name} registered for ${programStr} program. Awaiting intake completion.`;
        break;
      
      case "consultation_booked":
        message = `📅 CONSULT BOOKED: ${patient_name} has scheduled their consultation. Check calendar for details.`;
        break;
      
      case "labs_received":
        message = `🧪 LABS RECEIVED: ${patient_name}'s lab results are ready for review in the provider dashboard.`;
        break;
      
      case "custom":
        message = custom_message || `Alert for ${patient_name}`;
        break;
      
      default:
        message = `📢 ALERT: ${patient_name} - Action required. Check provider dashboard.`;
    }

    // Send SMS to staff
    const formattedPhone = formatPhoneNumber(staffPhone);
    const smsResult = await sendSMS(formattedPhone, message);
    if (!smsResult.success) {
      throw new Error(smsResult.error || "SMS send failed");
    }

    const result = await response.json();
    logStep("Staff alert sent successfully", { batchId: result.id, alertType: alert_type });

    return new Response(
      JSON.stringify({ success: true, batchId: result.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
