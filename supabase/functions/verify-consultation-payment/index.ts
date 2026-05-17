import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { LIVE_CORE_SERVICES } from "../_shared/live-prices.ts";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";

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

// Brand tokens — kept in sync with .cursorrules.
const BRAND_CHARCOAL = "#2A2826";
const BRAND_CAMEL = "#B8956A";
const BRAND_BONE = "#F2EBDC";

const CONSULT_FEE_USD = 79;
const WELLNESS_ASSESSMENT_PRICE_ID = LIVE_CORE_SERVICES.wellnessAssessment;

/** Legacy Discovery-era list price (cents) — recognize for ~90-day sunset window. */
const LEGACY_DISCOVERY_AMOUNT_CENTS = 9900;

const generateCreditCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "EH-";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

async function recognizeConsultationProduct(
  stripe: Stripe,
  sessionId: string,
  session: Stripe.Checkout.Session,
): Promise<{ product_recognized: string; legacy_path: boolean }> {
  const items = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 10 });
  const li0 = items.data[0];
  const priceId = li0?.price?.id ?? null;
  const desc = (li0?.description || "").toLowerCase();
  const nickname = ((li0?.price as { nickname?: string } | null)?.nickname || "").toLowerCase();
  const blob = `${desc} ${nickname}`;

  if (priceId === WELLNESS_ASSESSMENT_PRICE_ID) {
    return { product_recognized: "wellness_assessment_live_price", legacy_path: false };
  }

  const total = session.amount_total ?? 0;
  if (total === 7900) {
    return { product_recognized: "wellness_assessment_amount_7900", legacy_path: false };
  }
  if (total === LEGACY_DISCOVERY_AMOUNT_CENTS) {
    return { product_recognized: "legacy_discovery_9900_cents", legacy_path: true };
  }

  if (blob.includes("wellness assessment")) {
    return { product_recognized: "wellness_assessment_line_name", legacy_path: false };
  }
  if (blob.includes("discovery consultation") || blob.includes("discovery")) {
    return { product_recognized: "legacy_discovery_consultation_name", legacy_path: true };
  }

  return { product_recognized: "consult_checkout_unknown_line", legacy_path: false };
}

async function sendSMS(to: string, message: string): Promise<boolean> {
  const { sendSmsViaGhl } = await import("../_shared/ghl-sms.ts");
  const r = await sendSmsViaGhl(to, message);
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

    vcpLog("entry", {
      session_id,
      patient_id_resolved: null,
      product_recognized: null,
      success: true,
      error_message: null,
    });

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

    const customerEmail = session.customer_email || session.customer_details?.email;
    if (customerEmail) {
      const { data: pat } = await supabaseClient
        .from("patients")
        .select("id")
        .eq("email", customerEmail)
        .maybeSingle();
      patientIdResolved = pat?.id ?? null;
    }

    productRecognizedForLog = recognition.product_recognized;

    vcpLog("session_retrieved", {
      session_id,
      patient_id_resolved: patientIdResolved,
      product_recognized: recognition.product_recognized,
      success: true,
      error_message: null,
    });

    logStep("Session retrieved", {
      status: session.payment_status,
      email: session.customer_email,
      metadata: session.metadata,
      product_recognized: recognition.product_recognized,
      legacy_path: recognition.legacy_path,
    });

    if (session.payment_status !== "paid") {
      vcpLog("payment_incomplete", {
        session_id,
        patient_id_resolved: patientIdResolved,
        product_recognized: recognition.product_recognized,
        success: false,
        error_message: "Payment not completed",
      }, "error");
      return new Response(JSON.stringify({
        success: false,
        error: "Payment not completed",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const customerName = session.customer_details?.name || session.metadata?.patient_name;
    const serviceType = session.metadata?.service_type || "hormone";

    if (!customerEmail) {
      vcpLog("missing_email", {
        session_id,
        patient_id_resolved: patientIdResolved,
        product_recognized: recognition.product_recognized,
        success: false,
        error_message: "Customer email not found in session",
      }, "error");
      throw new Error("Customer email not found in session");
    }

    const { data: existing } = await supabaseClient
      .from("consultation_bookings")
      .select("id, credit_code, customer_name")
      .eq("stripe_session_id", session_id)
      .maybeSingle();

    if (existing?.credit_code) {
      logStep("Payment already recorded with credit code", { existingId: existing.id, creditCode: existing.credit_code });
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
        credit_code: existing.credit_code,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const creditCode = generateCreditCode();
    logStep("Generated credit code after payment", { creditCode });

    let bookingCreditCode = creditCode;
    let shouldSendNotifications = false;

    if (existing) {
      const { data: updatedRow, error: updateError } = await supabaseClient
        .from("consultation_bookings")
        .update({
          credit_code: creditCode,
          stripe_payment_intent_id: session.payment_intent as string,
          amount_paid: session.amount_total
            ? session.amount_total / 100
            : CONSULT_FEE_USD,
          status: "paid",
          customer_name: customerName || existing.customer_name,
        })
        .eq("id", existing.id)
        .is("credit_code", null)
        .select("id, credit_code")
        .maybeSingle();

      if (updateError) {
        logStep("Update error", { error: updateError });
        vcpLog("booking_update_failed", {
          session_id,
          patient_id_resolved: patientIdResolved,
          product_recognized: recognition.product_recognized,
          success: false,
          error_message: updateError.message,
        }, "error");
        throw updateError;
      }

      if (updatedRow?.credit_code) {
        shouldSendNotifications = true;
        bookingCreditCode = updatedRow.credit_code;
        logStep("Updated existing booking with credit code", { bookingId: updatedRow.id });
      } else {
        const { data: peer } = await supabaseClient
          .from("consultation_bookings")
          .select("credit_code")
          .eq("stripe_session_id", session_id)
          .maybeSingle();
        if (peer?.credit_code) {
          logStep("Concurrent claim: peer set credit first", { creditCode: peer.credit_code });
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
            credit_code: peer.credit_code,
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      }
    } else {
      const { data: inserted, error: insertError } = await supabaseClient
        .from("consultation_bookings")
        .insert({
          customer_email: customerEmail,
          customer_name: customerName || null,
          stripe_session_id: session_id,
          stripe_payment_intent_id: session.payment_intent as string,
          amount_paid: session.amount_total
            ? session.amount_total / 100
            : CONSULT_FEE_USD,
          status: "paid",
          credit_code: creditCode,
          service_type: serviceType,
          booking_source: "self_service",
        })
        .select("id, credit_code")
        .maybeSingle();

      if (insertError) {
        const pgCode = (insertError as { code?: string }).code;
        const msg = insertError.message || "";
        if (pgCode === "23505" || msg.includes("duplicate") || msg.includes("unique")) {
          const { data: peer } = await supabaseClient
            .from("consultation_bookings")
            .select("credit_code")
            .eq("stripe_session_id", session_id)
            .maybeSingle();
          if (peer?.credit_code) {
            logStep("Insert lost race; using peer booking", { creditCode: peer.credit_code });
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
              credit_code: peer.credit_code,
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            });
          }
        }
        logStep("Insert error", { error: insertError });
        vcpLog("booking_insert_failed", {
          session_id,
          patient_id_resolved: patientIdResolved,
          product_recognized: recognition.product_recognized,
          success: false,
          error_message: insertError.message,
        }, "error");
        throw insertError;
      }

      if (inserted?.credit_code) {
        shouldSendNotifications = true;
        bookingCreditCode = inserted.credit_code;
        logStep("Created new consultation booking with credit code", { bookingId: inserted.id });
      }
    }

    if (!shouldSendNotifications) {
      const { data: snap } = await supabaseClient
        .from("consultation_bookings")
        .select("credit_code")
        .eq("stripe_session_id", session_id)
        .maybeSingle();
      if (snap?.credit_code) {
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
          credit_code: snap.credit_code,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      vcpLog("booking_claim_failed", {
        session_id,
        patient_id_resolved: patientIdResolved,
        product_recognized: recognition.product_recognized,
        success: false,
        error_message: "no credit_code after insert/update attempt",
      }, "error");
      throw new Error("Consultation booking was not recorded after successful payment");
    }

    const { error: patientUpdateError } = await supabaseClient
      .from("patients")
      .update({ onboarding_status: "consultation_paid" })
      .eq("email", customerEmail);

    if (patientUpdateError) {
      logStep("Patient status update warning", { error: patientUpdateError.message });
    } else {
      logStep("Patient status updated to consultation_paid");
    }

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

    const emailConfig =
      SERVICE_EMAIL_CONFIG[serviceType] || SERVICE_EMAIL_CONFIG.hormone;
    const firstName = customerName ? customerName.split(" ")[0] : "there";

    if (shouldSendNotifications && resend) {
      try {
        await resend.emails.send({
          from: "Elevated Health Augusta <noreply@stripe.elevatedhealthaugusta.com>",
          to: [customerEmail],
          subject: `Your $${CONSULT_FEE_USD} Wellness Assessment is paid · pick a time inside`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin:0;padding:0;background-color:${BRAND_BONE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:${BRAND_CHARCOAL};">
              <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="background-color:${BRAND_BONE};">
                <tr><td align="center" style="padding:32px 16px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 6px 24px rgba(42,40,38,0.08);">
                    <tr>
                      <td style="background-color:${BRAND_CHARCOAL};padding:40px 32px;text-align:center;">
                        <p style="margin:0;color:${BRAND_CAMEL};font-size:12px;letter-spacing:0.2em;text-transform:uppercase;">Elevated Health Augusta</p>
                        <h1 style="margin:12px 0 0;color:#ffffff;font-size:28px;font-weight:400;font-style:italic;font-family:Georgia,'Times New Roman',serif;">Thank you, ${firstName}.</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:36px 32px 8px;">
                        <h2 style="margin:0 0 12px;color:${BRAND_CHARCOAL};font-size:20px;font-weight:400;font-family:Georgia,'Times New Roman',serif;">${emailConfig.title}</h2>
                        <p style="margin:0 0 24px;color:${BRAND_CHARCOAL};font-size:15px;line-height:1.6;">Your $${CONSULT_FEE_USD} Wellness Assessment is paid. The next step is choosing a time — return to the confirmation page and pick the slot that works for you.</p>
                        <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="margin:0 0 24px;background-color:${BRAND_BONE};border-left:3px solid ${BRAND_CAMEL};border-radius:6px;">
                          <tr><td style="padding:18px 20px;">
                            <p style="margin:0 0 4px;color:${BRAND_CHARCOAL}99;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">Your enrollment code</p>
                            <p style="margin:0 0 6px;color:${BRAND_CHARCOAL};font-size:22px;font-weight:600;letter-spacing:0.18em;font-family:'SF Mono',Menlo,monospace;">${bookingCreditCode}</p>
                            <p style="margin:0;color:${BRAND_CHARCOAL}99;font-size:13px;">Good for $${CONSULT_FEE_USD} off your first program invoice when you enroll in ${emailConfig.programPhrase}.</p>
                          </td></tr>
                        </table>
                        <p style="margin:0 0 8px;color:${BRAND_CHARCOAL}99;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">What happens next</p>
                        <ol style="margin:0 0 24px;padding-left:20px;color:${BRAND_CHARCOAL};font-size:14px;line-height:1.7;">
                          <li>Pick your visit time on the confirmation page</li>
                          <li>Receive confirmation with calendar invite and pre-visit instructions</li>
                          <li>In-person visit at our Evans clinic; LabCorp blood draws in-office when your provider orders them</li>
                          <li>If you enroll in a program, we apply this $${CONSULT_FEE_USD} to your first invoice</li>
                        </ol>
                        <p style="margin:0 0 24px;color:${BRAND_CHARCOAL};font-size:14px;">Questions? Call <a href="tel:+17067603470" style="color:${BRAND_CAMEL};text-decoration:none;">(706) 760-3470</a>.</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="background-color:${BRAND_BONE};padding:20px 32px;text-align:center;border-top:1px solid #e7dfd0;">
                        <p style="margin:0;color:${BRAND_CHARCOAL}99;font-size:12px;">Elevated Health Augusta · 7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809 · (706) 760-3470</p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
          `,
        });
        logStep("Patient credit code email sent");
      } catch (emailError) {
        logStep("Patient email failed", { error: emailError });
      }

      try {
        await resend.emails.send({
          from: "Elevated Health Augusta <noreply@stripe.elevatedhealthaugusta.com>",
          to: ["booking@elevatedhealthaugusta.com"],
          subject: `New ${emailConfig.title} paid — ${customerName || customerEmail}`,
          html: `
            <h2>New Wellness Assessment payment</h2>
            <p><strong>Customer:</strong> ${customerEmail}</p>
            <p><strong>Name:</strong> ${customerName || "Not provided"}</p>
            <p><strong>Service type:</strong> ${serviceType}</p>
            <p><strong>Product recognition:</strong> ${recognition.product_recognized}${recognition.legacy_path ? " (legacy path)" : ""}</p>
            <p><strong>Enrollment code:</strong> ${bookingCreditCode}</p>
            <p><strong>Amount:</strong> $${(session.amount_total || 0) / 100}</p>
            <hr/>
            <p>The patient is on the in-app confirmation page picking a time slot.</p>
            <p>Code <strong>${bookingCreditCode}</strong> reduces the first program invoice by $${CONSULT_FEE_USD} when they enroll in ${emailConfig.programPhrase}.</p>
          `,
        });
        logStep("Admin notification sent");
      } catch (emailError) {
        logStep("Admin email failed", { error: emailError });
      }
    }

    const staffPhoneNumbers = Deno.env.get("STAFF_NOTIFICATION_PHONE");
    if (shouldSendNotifications && staffPhoneNumbers) {
      const smsMessage = `NEW WELLNESS ASSESSMENT PAID\n${customerName || customerEmail}\nService: ${emailConfig.title}\nCode: ${bookingCreditCode}\nPatient is on the confirmation page picking a time.`;

      const phoneNumbers = staffPhoneNumbers.split(",").map((p) => p.trim());

      for (const phone of phoneNumbers) {
        if (phone) {
          sendSMS(phone, smsMessage).catch((err) => {
            logStep("SMS send error (non-blocking)", { phone, error: err });
          });
        }
      }
      logStep("SMS notifications queued", { phones: phoneNumbers });
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
