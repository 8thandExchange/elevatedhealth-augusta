import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SEND-KIT-PAYMENT-SMS] ${step}${detailsStr}`);
};

interface KitPaymentSMSRequest {
  patient_name: string;
  patient_phone: string;
  kit_type: string;
  payment_url: string;
  amount: number;
  has_credit: boolean;
  patient_id?: string;
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

    const { patient_name, patient_phone, kit_type, payment_url, amount, has_credit, patient_id }: KitPaymentSMSRequest = await req.json();

    if (!patient_phone || !payment_url) {
      throw new Error("Missing required fields: patient_phone and payment_url");
    }

    logStep("Preparing SMS", { patient_phone, kit_type, amount, patient_id });

    // Clean and format phone number to E.164
    let formattedPhone = patient_phone.replace(/\D/g, "");
    if (formattedPhone.length === 10) {
      formattedPhone = "1" + formattedPhone;
    }
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+" + formattedPhone;
    }

    logStep("Formatted phone", { formattedPhone });

    const kitName = kit_type === "hormone" ? "Hormone Mapping Kit" : "Metabolic Mapping Kit";
    const creditNote = has_credit ? " (with your $149 credit applied)" : "";
    
    const message = `Hi ${patient_name || "there"}! Your ${kitName}${creditNote} from Réveil is ready ($${amount}). Complete payment here: ${payment_url}`;

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

    // Log to communication_logs if patient_id provided
    if (patient_id) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        await supabase.from("communication_logs").insert({
          patient_id,
          template_key: "kit_payment_sms",
          subject: `${kitName} Payment Link`,
          body_preview: `SMS sent to ${formattedPhone}: ${kitName} payment link ($${amount})${creditNote}`,
          delivery_method: "sms",
          status: "sent",
        });
        logStep("Communication logged");
      } catch (logError) {
        logStep("Failed to log communication", { error: logError });
      }
    }

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
