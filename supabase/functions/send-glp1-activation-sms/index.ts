import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SEND-GLP1-ACTIVATION-SMS] ${step}${detailsStr}`);
};

interface GLP1ActivationSMSRequest {
  patient_id?: string;
  patient_name: string;
  patient_phone: string;
  patient_email?: string;
  first_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { patient_name, patient_phone, first_name }: GLP1ActivationSMSRequest = await req.json();

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
    const origin = "https://elevatedhealthaugusta.com";
    
    // Link to weight loss page where they can choose Semaglutide or Tirzepatide
    const message = `Hi ${firstName}! Your GLP-1 weight loss membership from Elevated Health Augusta is ready. Semaglutide $399/mo or Tirzepatide $499/mo. Start here: ${origin}/weight-loss Questions? (706) 760-3470`;
    const smsResult = await sendSMS(formattedPhone, message);
    if (!smsResult.success) {
      throw new Error(smsResult.error || "SMS send failed");
    }

    const result = await response.json();
    logStep("SMS sent successfully", { batchId: result.id });

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
