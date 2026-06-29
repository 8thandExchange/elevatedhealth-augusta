import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";
import {
import { MAIL_FROM } from "../_shared/mail-config.ts";
  CONSULT_FEE_USD,
  fulfillConsultationPayment,
  recognizeConsultationProduct,
} from "../_shared/fulfill-consultation-payment.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[VERIFY-CONSULTATION-PAYMENT] ${step}${detailsStr}`);
};

function vcpLog(
  event: string,
  fields: {
    product_recognized?: string | null;
    patient_id_resolved?: string | null;
    session_id?: string | null;
    success: boolean;
    error_message?: string | null;
  },
  level: "info" | "error" = "info",
) {
  edgeStructuredLog(
    "verify-consultation-payment",
    {
      event,
      product_recognized: fields.product_recognized ?? null,
      patient_id_resolved: fields.patient_id_resolved ?? null,
      session_id: fields.session_id ?? null,
      success: fields.success,
      error_message: fields.error_message ?? null,
    },
    level,
  );
}

const BRAND_CHARCOAL = "#2A2826";
const BRAND_CAMEL = "#B8956A";
const BRAND_BONE = "#F2EBDC";

async function sendSMS(to: string, message: string): Promise<boolean> {
  const { sendSms } = await import("../_shared/sms.ts");
  const r = await sendSms(to, message);
  return r.success;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let sessionIdForLog: string | null = null;
  let patientIdResolved: string | null = null;
  let productRecognizedForLog: string | null = null;

  try {
    logStep("Function started");

    const { session_id } = await req.json();
    sessionIdForLog = session_id ?? null;
    if (!session_id) {
      vcpLog("validation_error", {
        session_id: null,
        patient_id_resolved: null,
        product_recognized: null,
        success: false,
        error_message: "session_id is required",
      }, "error");
      return new Response(JSON.stringify({ error: "session_id is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const resend = resendKey ? new Resend(resendKey) : null;

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const session = await stripe.checkout.sessions.retrieve(session_id);
    const recognition = await recognizeConsultationProduct(stripe, session_id, session);
    productRecognizedForLog = recognition.product_recognized;

    const customerEmail = session.customer_email || session.customer_details?.email;
    if (customerEmail) {
      const { data: pat } = await supabaseClient
        .from("patients")
        .select("id")
        .eq("email", customerEmail)
        .maybeSingle();
      patientIdResolved = pat?.id ?? null;
    }

    logStep("Session retrieved", {
      status: session.payment_status,
      email: customerEmail,
      product_recognized: recognition.product_recognized,
    });

    const result = await fulfillConsultationPayment(supabaseClient, stripe, session);
    patientIdResolved = result.patient_id ?? patientIdResolved;

    if (!result.success) {
      vcpLog("fulfill_failed", {
        session_id,
        patient_id_resolved: patientIdResolved,
        product_recognized: recognition.product_recognized,
        success: false,
        error_message: result.error ?? "fulfill failed",
      }, "error");
      return new Response(JSON.stringify({
        success: false,
        error: result.error ?? "Payment not completed",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (result.already_recorded) {
      vcpLog("already_recorded", {
        session_id,
        patient_id_resolved: patientIdResolved,
        product_recognized: recognition.product_recognized,
        success: true,
        error_message: null,
      });
      return new Response(JSON.stringify({
        success: true,
        already_recorded: true,
        credit_code: result.credit_code,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const bookingCreditCode = result.credit_code!;
    const serviceType = session.metadata?.service_type || "hormone";
    const customerName = session.customer_details?.name || session.metadata?.patient_name;

    const SERVICE_EMAIL_CONFIG: Record<string, { title: string; programPhrase: string }> = {
      hormone: {
        title: "Wellness Assessment — Hormone Optimization",
        programPhrase: "your hormone optimization protocol",
      },
      weight_loss: {
        title: "Wellness Assessment — Medical Weight Loss",
        programPhrase: "your medical weight loss protocol",
      },
      peptide: {
        title: "Wellness Assessment — Peptide Protocols",
        programPhrase: "your peptide therapy protocol",
      },
    };

    const emailConfig = SERVICE_EMAIL_CONFIG[serviceType] || SERVICE_EMAIL_CONFIG.hormone;
    const firstName = customerName ? String(customerName).split(" ")[0] : "there";

    if (resend && customerEmail) {
      try {
        await resend.emails.send({
          from: MAIL_FROM,
          to: [customerEmail],
          subject: `Your $${CONSULT_FEE_USD} Wellness Assessment is paid · pick a time inside`,
          html: `<p>Hi ${firstName}, your Wellness Assessment is paid. Your enrollment code is <strong>${bookingCreditCode}</strong>. Return to the confirmation page to pick a visit time.</p>`,
        });
        logStep("Patient credit code email sent");
      } catch (emailError) {
        logStep("Patient email failed", { error: emailError });
      }

      try {
        await resend.emails.send({
          from: MAIL_FROM,
          to: ["appointments@elevatedhealthaugusta.com"],
          subject: `New ${emailConfig.title} paid — ${customerName || customerEmail}`,
          html: `
            <h2>New Wellness Assessment payment</h2>
            <p><strong>Customer:</strong> ${customerEmail}</p>
            <p><strong>Name:</strong> ${customerName || "Not provided"}</p>
            <p><strong>Enrollment code:</strong> ${bookingCreditCode}</p>
            <p><strong>Amount:</strong> $${(session.amount_total || 0) / 100}</p>
          `,
        });
        logStep("Admin notification sent");
      } catch (emailError) {
        logStep("Admin email failed", { error: emailError });
      }
    }

    const staffPhoneNumbers = Deno.env.get("STAFF_NOTIFICATION_PHONE");
    if (staffPhoneNumbers && customerEmail) {
      const smsMessage = `NEW WELLNESS ASSESSMENT PAID\n${customerName || customerEmail}\nCode: ${bookingCreditCode}`;
      for (const phone of staffPhoneNumbers.split(",").map((p) => p.trim())) {
        if (phone) sendSMS(phone, smsMessage).catch(() => undefined);
      }
    }

    vcpLog("verify_complete", {
      session_id,
      patient_id_resolved: patientIdResolved,
      product_recognized: recognition.product_recognized,
      success: true,
      error_message: null,
    });

    return new Response(JSON.stringify({
      success: true,
      credit_code: bookingCreditCode,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    vcpLog("handler_error", {
      session_id: sessionIdForLog,
      patient_id_resolved: patientIdResolved,
      product_recognized: productRecognizedForLog,
      success: false,
      error_message: errorMessage,
    }, "error");
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});