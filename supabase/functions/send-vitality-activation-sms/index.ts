import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SEND-VITALITY-ACTIVATION-SMS] ${step}${detailsStr}`);
};

// Vitality Membership - $249/mo
const VITALITY_PRICE_ID = "price_1Sga64EOtKRY99pu6NpP45Qq";

interface VitalityActivationSMSRequest {
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

    const sinchAccessKey = Deno.env.get("SINCH_ACCESS_KEY");
    const sinchSecretKey = Deno.env.get("SINCH_SECRET_KEY");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!sinchAccessKey || !sinchSecretKey) {
      throw new Error("Sinch API credentials not configured");
    }
    if (!stripeKey) {
      throw new Error("Stripe API key not configured");
    }

    const { patient_name, patient_phone, patient_email, first_name }: VitalityActivationSMSRequest = await req.json();

    if (!patient_phone) {
      throw new Error("Missing required field: patient_phone");
    }

    logStep("Preparing SMS", { patient_phone, patient_name });

    // Generate Stripe checkout link
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = "https://reveil.health";

    const session = await stripe.checkout.sessions.create({
      customer_email: patient_email || undefined,
      line_items: [{ price: VITALITY_PRICE_ID, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/payment-success?type=vitality`,
      cancel_url: `${origin}/?canceled=true`,
      metadata: { patient_name, type: "vitality_membership" },
    });

    logStep("Checkout session created", { sessionId: session.id });

    // Clean and format phone number to E.164
    let formattedPhone = patient_phone.replace(/\D/g, "");
    if (formattedPhone.length === 10) {
      formattedPhone = "1" + formattedPhone;
    }
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+" + formattedPhone;
    }

    const firstName = first_name || patient_name?.split(" ")[0] || "there";
    
    const message = `Hi ${firstName}! Your Vitality Membership ($249/mo) from Réveil is ready to activate. Start here: ${session.url} Questions? (706) 760-3470`;

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
      JSON.stringify({ success: true, batchId: result.id, checkoutUrl: session.url }),
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
