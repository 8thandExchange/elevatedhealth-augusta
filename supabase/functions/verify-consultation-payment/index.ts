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

// Generate a unique credit code for the $99 consultation credit
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
          amount_paid: session.amount_total ? session.amount_total / 100 : 99,
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
          amount_paid: session.amount_total ? session.amount_total / 100 : 99,
          status: "paid",
          credit_code: creditCode,
          service_type: serviceType,
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

    // Service-specific email configuration
    const SERVICE_EMAIL_CONFIG: Record<string, { title: string; creditUse: string }> = {
      ketamine: {
        title: "Ketamine Therapy Consultation",
        creditUse: "your first IV ketamine infusion session"
      },
      weight_loss: {
        title: "Medical Weight Loss Consultation",
        creditUse: "your weight loss treatment protocol"
      },
      hormone: {
        title: "Hormone Replacement Consultation",
        creditUse: "Hormone Mapping ($349 → $250)"
      },
      peptide: {
        title: "Peptide Therapy Consultation",
        creditUse: "your peptide therapy protocol"
      },
      hair: {
        title: "Hair Restoration Consultation",
        creditUse: "your hair restoration protocol"
      },
      sexual: {
        title: "Sexual Wellness Consultation",
        creditUse: "your treatment protocol"
      }
    };

    const emailConfig = SERVICE_EMAIL_CONFIG[serviceType] || SERVICE_EMAIL_CONFIG.hormone;
    const firstName = customerName ? customerName.split(" ")[0] : "there";

    // Send credit code email to patient (only sent AFTER payment)
    if (resend) {
      try {
        await resend.emails.send({
          from: "Elevated Health <noreply@stripe.elevatedhealthaugusta.com>",
          to: [customerEmail],
          subject: `Your $99 Credit Code is Here! - Elevated Health`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2C3E50; margin: 0; padding: 0; background: #f8f9fa; }
                .wrapper { background: #f8f9fa; padding: 40px 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
                .header { background: linear-gradient(135deg, #2C3E50 0%, #1a252f 100%); padding: 40px 30px; text-align: center; }
                .logo { font-size: 28px; font-weight: 300; color: white; letter-spacing: 0.5px; margin: 0; }
                .content { padding: 40px 30px; }
                .greeting { font-size: 24px; font-weight: 600; color: #2C3E50; margin-bottom: 16px; }
                
                .credit-box { background: linear-gradient(135deg, #F9F9F7 0%, #f0ebe3 100%); border: 2px solid #D4A017; border-radius: 12px; padding: 32px; margin: 24px 0; text-align: center; }
                .credit-label { font-size: 14px; color: #7F8C8D; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
                .credit-code { font-size: 36px; font-weight: 700; color: #D4A017; letter-spacing: 3px; margin: 0; font-family: monospace; }
                .credit-value { font-size: 14px; color: #155724; margin-top: 12px; background: #d4edda; padding: 8px 16px; border-radius: 20px; display: inline-block; }
                
                .steps { background: #f0f9ff; border-radius: 12px; padding: 24px; margin: 24px 0; }
                .steps-title { font-weight: 600; color: #0369a1; margin-bottom: 16px; font-size: 16px; }
                .step { display: flex; gap: 12px; margin: 16px 0; }
                .step-num { width: 28px; height: 28px; background: #0ea5e9; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; flex-shrink: 0; }
                .step-content { flex: 1; color: #0369a1; font-size: 14px; }
                
                .tip { background: #f7fafc; border-left: 4px solid #D4A017; padding: 16px; margin: 24px 0; }
                .tip-text { color: #2C3E50; font-size: 14px; margin: 0; }
                
                .footer { background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
                .footer-text { color: #7F8C8D; font-size: 14px; margin: 8px 0; }
              </style>
            </head>
            <body>
              <div class="wrapper">
                <div class="container">
                  <div class="header">
                    <h1 class="logo">Elevated Health</h1>
                  </div>
                  <div class="content">
                    <h2 class="greeting">Thank You, ${firstName}!</h2>
                    <p style="color: #4a5568; font-size: 16px;">Your ${emailConfig.title} payment has been confirmed. Here's your exclusive credit code:</p>
                    
                    <div class="credit-box">
                      <p class="credit-label">Your Credit Code</p>
                      <p class="credit-code">${creditCode}</p>
                      <span class="credit-value">Worth $99 toward ${emailConfig.creditUse}</span>
                    </div>
                    
                    <div class="steps">
                      <p class="steps-title">📋 Next Steps</p>
                      <div class="step">
                        <span class="step-num">1</span>
                        <div class="step-content"><strong>Schedule your consultation</strong> - Use the calendar on the confirmation page</div>
                      </div>
                      <div class="step">
                        <span class="step-num">2</span>
                        <div class="step-content"><strong>Visit our Evans clinic</strong> for your 30-minute in-person consultation with Lauren</div>
                      </div>
                      <div class="step">
                        <span class="step-num">3</span>
                        <div class="step-content"><strong>Receive your diagnostic kit</strong> - Lauren will hand it to you and explain how to use it</div>
                      </div>
                      <div class="step">
                        <span class="step-num">4</span>
                        <div class="step-content"><strong>When ready to proceed</strong>, use your credit code for $99 off</div>
                      </div>
                    </div>
                    
                    <div class="tip">
                      <p class="tip-text"><strong>💡 Save this email!</strong> Your credit code <strong>${creditCode}</strong> never expires and can be applied when you're ready to move forward with treatment.</p>
                    </div>
                    
                    <p style="color: #4a5568; font-size: 16px; margin-top: 32px;">
                      We're excited to meet you in person!<br/><br/>
                      Warmly,<br/>
                      <strong>The Elevated Health Team</strong><br/>
                      <span style="color: #718096;">(706) 821-7354 | 7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809</span>
                    </p>
                  </div>
                  <div class="footer">
                    <p class="footer-text">Questions? Reply to this email or call us.</p>
                  </div>
                </div>
              </div>
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
          from: "Elevated Health <noreply@stripe.elevatedhealthaugusta.com>",
          to: ["booking@elevatedhealthaugusta.com"],
          subject: `New ${emailConfig.title} Booked - ${customerName || customerEmail}`,
          html: `
            <h2>New ${emailConfig.title} Payment</h2>
            <p><strong>Customer:</strong> ${customerEmail}</p>
            <p><strong>Name:</strong> ${customerName || "Not provided"}</p>
            <p><strong>Service Type:</strong> ${serviceType}</p>
            <p><strong>Credit Code:</strong> ${creditCode}</p>
            <p><strong>Amount:</strong> $${(session.amount_total || 0) / 100}</p>
            <hr/>
            <p>The patient has been instructed to book their 30-minute in-person consultation via Google Calendar.</p>
            <p>Their credit code <strong>${creditCode}</strong> can be used for $99 off ${emailConfig.creditUse}.</p>
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
      const smsMessage = `🎉 NEW CONSULT PAID!\n\n${customerName || customerEmail}\nService: ${emailConfig.title}\nCredit: ${creditCode}\n\nPatient instructed to book in-person visit via calendar.`;
      
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
