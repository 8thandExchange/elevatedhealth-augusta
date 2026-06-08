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
    const smsMessage = `${greeting}Your ${product_name} (${amount}) from Elevated Health Augusta is ready for payment. Complete here: ${payment_url}`;

    logStep("SMS message created", { length: smsMessage.length });

    const smsResult = await sendSMS(cleanPhone, smsMessage);
    if (!smsResult.success) {
      throw new Error(smsResult.error || "SMS send failed");
    }
    logStep("Twilio SMS sent");
    return new Response(JSON.stringify({
      success: true,
      message_id: smsResult.messageId,
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
