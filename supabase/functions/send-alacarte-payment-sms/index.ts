import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-ALACARTE-PAYMENT-SMS] ${step}${detailsStr}`);
};

interface PaymentSMSRequest {
  patient_phone: string;
  patient_name: string;
  payment_url: string;
  product_name: string;
  amount: string;
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
      throw new Error("Sinch credentials not configured");
    }

    const { patient_phone, patient_name, payment_url, product_name, amount }: PaymentSMSRequest = await req.json();

    logStep("Request data", { patient_phone, patient_name, product_name, amount });

    if (!patient_phone || !payment_url) {
      throw new Error("Patient phone and payment URL are required");
    }

    // Clean and format phone number to E.164 format
    let cleanPhone = patient_phone.replace(/\D/g, "");
    if (cleanPhone.length === 10) {
      cleanPhone = "1" + cleanPhone;
    }
    if (!cleanPhone.startsWith("+")) {
      cleanPhone = "+" + cleanPhone;
    }

    logStep("Formatted phone", { original: patient_phone, formatted: cleanPhone });

    const firstName = patient_name?.split(" ")[0] || "";
    const greeting = firstName ? `Hi ${firstName}! ` : "";

    // Create short, clear SMS message
    const smsMessage = `${greeting}Your ${product_name} (${amount}) from Réveil is ready for payment. Complete here: ${payment_url}`;

    logStep("SMS message created", { length: smsMessage.length });

    // Send SMS via Sinch
    const sinchUrl = "https://us.sms.api.sinch.com/xms/v1/5ab91e9cd05e4dd6a2a2c5d2d9b5b48d/batches";
    
    const sinchResponse = await fetch(sinchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sinchAccessKey}`,
      },
      body: JSON.stringify({
        from: "12029317706", // Sinch sender ID
        to: [cleanPhone],
        body: smsMessage,
      }),
    });

    const sinchResult = await sinchResponse.json();
    logStep("Sinch response", { status: sinchResponse.status, result: sinchResult });

    if (!sinchResponse.ok) {
      throw new Error(`SMS send failed: ${JSON.stringify(sinchResult)}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message_id: sinchResult.id,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
