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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { session_id, credit_code } = await req.json();
    if (!session_id) {
      throw new Error("session_id is required");
    }
    logStep("Session ID received", { session_id, credit_code });

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
    const creditCode = credit_code || session.metadata?.credit_code;
    const serviceType = session.metadata?.service_type || "hormone";

    if (!customerEmail) {
      throw new Error("Customer email not found in session");
    }

    // Check if already recorded
    const { data: existing } = await supabaseClient
      .from("consultation_bookings")
      .select("id")
      .eq("stripe_session_id", session_id)
      .maybeSingle();

    if (existing) {
      logStep("Payment already recorded", { existingId: existing.id });
      return new Response(JSON.stringify({ 
        success: true, 
        already_recorded: true,
        credit_code: creditCode 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Record the consultation booking
    const { data: booking, error: insertError } = await supabaseClient
      .from("consultation_bookings")
      .insert({
        customer_email: customerEmail,
        customer_name: session.customer_details?.name || null,
        stripe_session_id: session_id,
        stripe_payment_intent_id: session.payment_intent as string,
        amount_paid: session.amount_total ? session.amount_total / 100 : 99,
        status: "pending",
        credit_code: creditCode,
        service_type: serviceType,
      })
      .select()
      .single();

    if (insertError) {
      logStep("Insert error", { error: insertError });
      throw insertError;
    }

    logStep("Consultation booking recorded", { bookingId: booking.id, creditCode });

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
        creditUse: "Hormone Mapping ($299 → $200)"
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

    // Send emails
    if (resend) {
      // Send patient confirmation email with credit code
      try {
        await resend.emails.send({
          from: "Elevated Health <noreply@stripe.elevatedhealthaugusta.com>",
          to: [customerEmail],
          subject: `Your $99 Credit Code for ${emailConfig.title} - Elevated Health`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <h1 style="color: #2C3E50; font-size: 28px; margin-bottom: 24px;">Thank You for Booking!</h1>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                Dear ${session.customer_details?.name || "Valued Patient"},
              </p>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                Your ${emailConfig.title} has been confirmed. We're excited to help you on your wellness journey!
              </p>
              
              <div style="background: linear-gradient(135deg, #F9F9F7 0%, #f0ebe3 100%); border: 2px solid #D4A017; border-radius: 12px; padding: 24px; margin: 32px 0; text-align: center;">
                <p style="color: #2C3E50; font-size: 14px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Your Credit Code</p>
                <p style="color: #D4A017; font-size: 32px; font-weight: bold; margin: 0; letter-spacing: 2px;">${creditCode}</p>
                <p style="color: #718096; font-size: 14px; margin-top: 12px;">Worth $99 toward ${emailConfig.creditUse}</p>
              </div>
              
              <h2 style="color: #2C3E50; font-size: 20px; margin-top: 32px;">How to Use Your Credit</h2>
              
              <ol style="color: #4a5568; font-size: 16px; line-height: 1.8; padding-left: 20px;">
                <li><strong>Complete your 45-minute consultation</strong> with our specialist</li>
                <li><strong>When you're ready</strong> to proceed with treatment</li>
                <li><strong>Enter your credit code</strong> at checkout to receive $99 off</li>
                <li><strong>Begin your personalized wellness journey</strong></li>
              </ol>
              
              <div style="background: #f7fafc; border-left: 4px solid #D4A017; padding: 16px; margin: 24px 0;">
                <p style="color: #2C3E50; font-size: 14px; margin: 0;">
                  <strong>💡 Pro Tip:</strong> Save this email! Your credit code never expires and can be applied when you're ready to move forward with treatment.
                </p>
              </div>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-top: 32px;">
                If you have any questions before your consultation, don't hesitate to reach out.
              </p>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                Warmly,<br/>
                <strong>The Elevated Health Team</strong><br/>
                <span style="color: #718096;">706-922-7958 | Augusta, GA</span>
              </p>
            </div>
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
          subject: `New ${emailConfig.title} Booked`,
          html: `
            <h2>New ${emailConfig.title} Payment</h2>
            <p><strong>Customer:</strong> ${customerEmail}</p>
            <p><strong>Name:</strong> ${session.customer_details?.name || "Not provided"}</p>
            <p><strong>Service Type:</strong> ${serviceType}</p>
            <p><strong>Credit Code:</strong> ${creditCode}</p>
            <p><strong>Amount:</strong> $${(session.amount_total || 0) / 100}</p>
            <hr/>
            <p>The patient has been instructed to book their 45-minute consultation via Google Calendar.</p>
            <p>Their credit code <strong>${creditCode}</strong> can be used for $99 off ${emailConfig.creditUse}.</p>
          `,
        });
        logStep("Admin notification sent");
      } catch (emailError) {
        logStep("Admin email failed", { error: emailError });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      booking_id: booking.id,
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
