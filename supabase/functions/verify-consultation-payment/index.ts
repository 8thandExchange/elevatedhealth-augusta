import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-CONSULTATION-PAYMENT] ${step}${detailsStr}`);
};

// Brand tokens — kept in sync with .cursorrules.
const BRAND_CHARCOAL = "#2A2826";
const BRAND_CAMEL = "#B8956A";
const BRAND_BONE = "#F2EBDC";

const CONSULT_FEE_USD = 79;

// Generate a unique credit code for the $79 consultation credit applied
// against treatment if the patient enrolls in a program.
const generateCreditCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "EH-";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Helper to send SMS via Sinch
async function sendSMS(to: string, message: string): Promise<boolean> {
  const sinchAccessKey = Deno.env.get("SINCH_ACCESS_KEY");
  const sinchSecretKey = Deno.env.get("SINCH_SECRET_KEY");
  
  if (!sinchAccessKey || !sinchSecretKey) {
    logStep("SMS credentials not configured");
    return false;
  }

  try {
    const response = await fetch("https://us.sms.api.sinch.com/xms/v1/" + sinchAccessKey + "/batches", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + sinchSecretKey,
      },
      body: JSON.stringify({
        from: "+18339765929",
        to: [to.replace(/\D/g, '')],
        body: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logStep("SMS send failed", { status: response.status, error: errorText });
      return false;
    }

    logStep("SMS sent successfully", { to });
    return true;
  } catch (error) {
    logStep("SMS error", { error: error instanceof Error ? error.message : String(error) });
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { session_id } = await req.json();
    if (!session_id) {
      throw new Error("session_id is required");
    }
    logStep("Session ID received", { session_id });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const resend = resendKey ? new Resend(resendKey) : null;

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    logStep("Session retrieved", { 
      status: session.payment_status, 
      email: session.customer_email,
      metadata: session.metadata 
    });

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Payment not completed" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const customerEmail = session.customer_email || session.customer_details?.email;
    const customerName = session.customer_details?.name || session.metadata?.patient_name;
    const serviceType = session.metadata?.service_type || "hormone";

    if (!customerEmail) {
      throw new Error("Customer email not found in session");
    }

    // Check if already recorded (with credit code)
    const { data: existing } = await supabaseClient
      .from("consultation_bookings")
      .select("id, credit_code, customer_name")
      .eq("stripe_session_id", session_id)
      .maybeSingle();

    if (existing?.credit_code) {
      logStep("Payment already recorded with credit code", { existingId: existing.id, creditCode: existing.credit_code });
      return new Response(JSON.stringify({ 
        success: true, 
        already_recorded: true,
        credit_code: existing.credit_code 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Generate credit code NOW (after payment confirmed)
    const creditCode = generateCreditCode();
    logStep("Generated credit code after payment", { creditCode });

    // Update or insert the consultation booking with credit code
    if (existing) {
      // Update existing record with credit code
      const { error: updateError } = await supabaseClient
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
        .eq("id", existing.id);

      if (updateError) {
        logStep("Update error", { error: updateError });
        throw updateError;
      }
      logStep("Updated existing booking with credit code", { bookingId: existing.id });
    } else {
      // Create new record
      const { data: booking, error: insertError } = await supabaseClient
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
        .select()
        .single();

      if (insertError) {
        logStep("Insert error", { error: insertError });
        throw insertError;
      }
      logStep("Created new consultation booking with credit code", { bookingId: booking.id });
    }

    // Update patient onboarding status
    const { error: patientUpdateError } = await supabaseClient
      .from("patients")
      .update({ onboarding_status: "consultation_paid" })
      .eq("email", customerEmail);

    if (patientUpdateError) {
      logStep("Patient status update warning", { error: patientUpdateError.message });
    } else {
      logStep("Patient status updated to consultation_paid");
    }

    // Service-specific email configuration. Ketamine and any "Hormone
    // Mapping ($349→$250)" / ZRT-era branches removed — those products
    // are no longer offered (see .cursorrules). The credit applies toward
    // whichever treatment program the patient enrolls in.
    const SERVICE_EMAIL_CONFIG: Record<string, { title: string; creditUse: string }> = {
      hormone: {
        title: "Hormone Optimization Consultation",
        creditUse: "your hormone optimization protocol",
      },
      weight_loss: {
        title: "Medical Weight Loss Consultation",
        creditUse: "your medical weight loss protocol",
      },
      peptide: {
        title: "Peptide Protocols Consultation",
        creditUse: "your peptide therapy protocol",
      },
    };

    const emailConfig =
      SERVICE_EMAIL_CONFIG[serviceType] || SERVICE_EMAIL_CONFIG.hormone;
    const firstName = customerName ? customerName.split(" ")[0] : "there";

    // Send receipt + credit code email to patient (only sent AFTER payment).
    // Brand-aligned with the Charcoal/Camel/Bone palette and Playfair display
    // type so this matches what patients see on the storefront.
    if (resend) {
      try {
        await resend.emails.send({
          from: "Elevated Health Augusta <noreply@stripe.elevatedhealthaugusta.com>",
          to: [customerEmail],
          subject: `Your $${CONSULT_FEE_USD} consult is paid · pick a time inside`,
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
                        <p style="margin:0 0 24px;color:${BRAND_CHARCOAL};font-size:15px;line-height:1.6;">Your $${CONSULT_FEE_USD} consultation is paid. The next step is choosing a time — head back to the confirmation page (or check the link we just sent) and pick the slot that works for you.</p>
                        <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="margin:0 0 24px;background-color:${BRAND_BONE};border-left:3px solid ${BRAND_CAMEL};border-radius:6px;">
                          <tr><td style="padding:18px 20px;">
                            <p style="margin:0 0 4px;color:${BRAND_CHARCOAL}99;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">Your credit code</p>
                            <p style="margin:0 0 6px;color:${BRAND_CHARCOAL};font-size:22px;font-weight:600;letter-spacing:0.18em;font-family:'SF Mono',Menlo,monospace;">${creditCode}</p>
                            <p style="margin:0;color:${BRAND_CHARCOAL}99;font-size:13px;">Worth $${CONSULT_FEE_USD} toward ${emailConfig.creditUse}, applied automatically when you enroll.</p>
                          </td></tr>
                        </table>
                        <p style="margin:0 0 8px;color:${BRAND_CHARCOAL}99;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">What happens next</p>
                        <ol style="margin:0 0 24px;padding-left:20px;color:${BRAND_CHARCOAL};font-size:14px;line-height:1.7;">
                          <li>Pick your visit time on the confirmation page</li>
                          <li>Get a confirmation with calendar invite + pre-visit instructions</li>
                          <li>Show up — we'll meet you in person at the Evans clinic, draw any needed labs at the visit, and walk through the plan</li>
                          <li>If you enroll in a program, your $${CONSULT_FEE_USD} credit comes off the first invoice</li>
                        </ol>
                        <p style="margin:0 0 24px;color:${BRAND_CHARCOAL};font-size:14px;">Questions before then? Call us at <a href="tel:+17067603470" style="color:${BRAND_CAMEL};text-decoration:none;">(706) 760-3470</a>.</p>
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

      // Send admin notification
      try {
        await resend.emails.send({
          from: "Elevated Health Augusta <noreply@stripe.elevatedhealthaugusta.com>",
          to: ["booking@elevatedhealthaugusta.com"],
          subject: `New ${emailConfig.title} paid — ${customerName || customerEmail}`,
          html: `
            <h2>New ${emailConfig.title} payment</h2>
            <p><strong>Customer:</strong> ${customerEmail}</p>
            <p><strong>Name:</strong> ${customerName || "Not provided"}</p>
            <p><strong>Service type:</strong> ${serviceType}</p>
            <p><strong>Credit code:</strong> ${creditCode}</p>
            <p><strong>Amount:</strong> $${(session.amount_total || 0) / 100}</p>
            <hr/>
            <p>The patient is currently on the in-app confirmation page picking a time slot via the native scheduler.</p>
            <p>Their $${CONSULT_FEE_USD} credit code <strong>${creditCode}</strong> applies toward ${emailConfig.creditUse}.</p>
          `,
        });
        logStep("Admin notification sent");
      } catch (emailError) {
        logStep("Admin email failed", { error: emailError });
      }
    }

    // Send SMS alerts to staff
    const staffPhoneNumbers = Deno.env.get("STAFF_NOTIFICATION_PHONE");
    if (staffPhoneNumbers) {
      const smsMessage = `NEW CONSULT PAID\n${customerName || customerEmail}\nService: ${emailConfig.title}\nCredit: ${creditCode}\nPatient is on the confirmation page picking a time.`;

      const phoneNumbers = staffPhoneNumbers.split(",").map(p => p.trim());

      for (const phone of phoneNumbers) {
        if (phone) {
          sendSMS(phone, smsMessage).catch(err => {
            logStep("SMS send error (non-blocking)", { phone, error: err });
          });
        }
      }
      logStep("SMS notifications queued", { phones: phoneNumbers });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      credit_code: creditCode 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
