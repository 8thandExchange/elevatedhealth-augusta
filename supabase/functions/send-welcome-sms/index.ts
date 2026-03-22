import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SEND-WELCOME-SMS] ${step}${detailsStr}`);
};

interface WelcomeSMSRequest {
  patient_id?: string;
  patient_name: string;
  patient_phone: string;
  patient_email?: string;
  first_name?: string;
  primary_program?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const sinchAccessKey = Deno.env.get("SINCH_ACCESS_KEY");
    const sinchSecretKey = Deno.env.get("SINCH_SECRET_KEY");

    if (!sinchAccessKey || !sinchSecretKey) {
      throw new Error("Sinch API credentials not configured");
    }

    const { patient_name, patient_phone, first_name, primary_program }: WelcomeSMSRequest = await req.json();

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
    
    const programText = primary_program === 'ketamine' 
      ? 'mental wellness'
      : primary_program === 'weight_loss'
      ? 'weight loss'
      : 'personalized wellness';
    
    const message = `Hi ${firstName}! 🌟 Your Réveil patient portal is ready. Log in anytime at reveil.health/patient/login. Your next step: complete your health intake. Questions? (706) 426-7383`;

    const sinchUrl = `https://us.sms.api.sinch.com/xms/v1/${sinchAccessKey}/batches`;
    
    const response = await fetch(sinchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sinchSecretKey}`,
      },
      body: JSON.stringify({
        from: "12029533545",
        to: [formattedPhone],
        body: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logStep("Sinch API error", { status: response.status, error: errorText });
      throw new Error(`SMS send failed: ${errorText}`);
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
