import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SEND-LABS-REVIEWED-SMS] ${step}${detailsStr}`);
};

interface LabsReviewedSMSRequest {
  patient_id?: string;
  patient_name: string;
  patient_phone: string;
  first_name?: string;
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

    const { patient_name, patient_phone, first_name }: LabsReviewedSMSRequest = await req.json();

    if (!patient_phone) {
      throw new Error("Missing required field: patient_phone");
    }

    logStep("Preparing SMS", { patient_phone, patient_name });

    // Clean and format phone number to E.164
    let formattedPhone = patient_phone.replace(/\D/g, "");
    if (formattedPhone.length === 10) {
      formattedPhone = "1" + formattedPhone;
    }
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+" + formattedPhone;
    }

    const firstName = first_name || patient_name?.split(" ")[0] || "there";
    
    const message = `Hi ${firstName}! Great news—your lab results from Elevated Health Augusta are ready for review. Log in to your patient portal to see your results, or call us at (706) 760-3470 to schedule a follow-up.`;
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
