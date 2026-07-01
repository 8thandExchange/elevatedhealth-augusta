import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { legacyProgramDisplayLabels } from "../_shared/therapy-catalog.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SEND-CONSULTATION-INVITE-SMS] ${step}${detailsStr}`);
};

interface ConsultationInviteSMSRequest {
  patient_name: string;
  patient_phone: string;
  service_type: string;
  payment_url: string;
  invite_type?: "needs_booking" | "already_booked";
  scheduled_date?: string | null;
}

const SERVICE_LABELS: Record<string, string> = {
  hormone: "Hormone Therapy",
  weight_loss: "Weight Loss",
  general: "your consultation",
  ...legacyProgramDisplayLabels(),
};

async function sendSMS(to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { sendSms } = await import("../_shared/sms.ts");
  return sendSms(to, message);
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { 
      patient_name, 
      patient_phone, 
      service_type, 
      payment_url,
      invite_type = "needs_booking",
      scheduled_date = null
    }: ConsultationInviteSMSRequest = await req.json();

    if (!patient_phone || !payment_url) {
      throw new Error("Missing required fields: patient_phone and payment_url");
    }

    logStep("Preparing SMS", { patient_phone, service_type, invite_type });

    // Clean and format phone number to E.164
    let formattedPhone = patient_phone.replace(/\D/g, "");
    if (formattedPhone.length === 10) {
      formattedPhone = "1" + formattedPhone;
    }
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+" + formattedPhone;
    }

    logStep("Formatted phone", { formattedPhone });

    const serviceLabel = SERVICE_LABELS[service_type] || "your consultation";
    const firstName = patient_name?.split(" ")[0] || "there";
    
    let message: string;
    
    if (invite_type === "already_booked") {
      // Payment-only message for already booked patients
      const dateDisplay = scheduled_date 
        ? new Date(scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : "your upcoming appointment";
      
      message = `Hi ${firstName}! Please complete your $79 payment to confirm your ${serviceLabel} Wellness Assessment${scheduled_date ? ` on ${dateDisplay}` : ''}. Pay here: ${payment_url} - Elevated Health Augusta`;
    } else {
      // Standard invite message - needs to book
      message = `Hi ${firstName}! Thanks for your interest in ${serviceLabel} at Elevated Health Augusta. Book your $79 Wellness Assessment here: ${payment_url} Questions? Call (706) 760-3470`;
    }
    const smsResult = await sendSMS(formattedPhone, message);
    if (!smsResult.success) {
      throw new Error(smsResult.error || "SMS send failed");
    }

    logStep("SMS sent successfully", { messageId: smsResult.messageId });

    return new Response(
      JSON.stringify({ success: true, messageId: smsResult.messageId }),
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
