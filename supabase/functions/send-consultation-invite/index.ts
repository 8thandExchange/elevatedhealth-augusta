import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { LIVE_CORE_SERVICES } from "../_shared/live-prices.ts";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";
import { hasClinicStaffRole } from "../_shared/staff-auth.ts";
import { MAIL_FROM } from "../_shared/mail-config.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-CONSULTATION-INVITE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // Verify admin/staff authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) throw new Error("Unauthorized");

    // Check user role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id);

    const hasAccess = hasClinicStaffRole((roles ?? []).map((r) => String(r.role)));
    if (!hasAccess) throw new Error("Insufficient permissions");

    logStep("Authorization verified");

    const body = await req.json();
    const { 
      patient_email, 
      patient_name, 
      service_type = "hormone",
      invite_type = "needs_booking", // "needs_booking" or "already_booked"
      scheduled_date = null 
    } = body;

    if (!patient_email || !patient_name) {
      throw new Error("Missing required fields: patient_email and patient_name");
    }

    logStep("Request body", { patient_email, patient_name, service_type, invite_type, scheduled_date });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = "https://elevatedhealthaugusta.com";

    // Map service types to display names
    const serviceLabels: Record<string, string> = {
      hormone: "Hormone Therapy",
      weight_loss: "Weight Loss",
      ketamine: "General Wellness",
      general: "General Consultation",
    };
    const serviceLabel = serviceLabels[service_type] || "Wellness Assessment";

    const session = await stripe.checkout.sessions.create({
      customer_email: patient_email,
      line_items: [
        {
          price: LIVE_CORE_SERVICES.wellnessAssessment,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/consultation-confirmed?session_id={CHECKOUT_SESSION_ID}&service=${service_type}`,
      cancel_url: `${origin}/`,
      metadata: {
        patient_email,
        patient_name,
        product: "wellness_assessment",
        payment_type: "consultation",
        service_type,
        invite_type,
        scheduled_date: scheduled_date || "",
      },
    });

    edgeStructuredLog("send-consultation-invite", {
      event_type: "checkout_created",
      event_id: session.id,
      success: true,
      action_taken: "stripe_checkout_session_created",
      product_recognition: "consultation",
    });

    logStep("Stripe checkout session created", { sessionId: session.id });

    const paymentLink = session.url;
    const firstName = patient_name.split(" ")[0];

    // Create a consultation booking record
    const { error: bookingError } = await supabase
      .from("consultation_bookings")
      .insert({
        customer_email: patient_email,
        customer_name: patient_name,
        service_type: service_type || "hormone",
        status: invite_type === "already_booked" ? "pending_payment" : "pending_payment",
        stripe_session_id: session.id,
        amount_paid: null,
        booked_for: scheduled_date || null,
        booking_source: "staff_phone",
        booked_by_user_id: userData.user.id,
      });

    if (bookingError) {
      logStep("Booking record creation warning", { error: bookingError.message });
    } else {
      logStep("Consultation booking record created");
    }

    // Send invite email via Resend - different templates based on invite_type
    const resend = new Resend(resendKey);
    
    let emailHtml: string;
    let emailSubject: string;

    if (invite_type === "already_booked") {
      // Payment-only email for already booked patients
      const dateDisplay = scheduled_date 
        ? new Date(scheduled_date).toLocaleDateString('en-US', { 
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit'
          })
        : "your scheduled time";

      emailSubject = `${firstName}, Complete Your Consultation Payment`;
      emailHtml = `
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
            .tagline { color: rgba(255,255,255,0.7); font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-top: 8px; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 24px; font-weight: 600; color: #2C3E50; margin-bottom: 16px; }
            .intro { color: #4a5568; font-size: 16px; margin-bottom: 24px; }
            
            .appointment-box { background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; color: white; }
            .appointment-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9; }
            .appointment-date { font-size: 18px; font-weight: 600; margin-top: 4px; }
            
            .price-box { background: linear-gradient(135deg, #f7f9fb 0%, #eef2f5 100%); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; border: 1px solid #e2e8f0; }
            .price { font-size: 36px; font-weight: 700; color: #2C3E50; margin: 0; }
            .price-label { font-size: 14px; color: #7F8C8D; margin-top: 4px; }
            
            .credit-note { background: #fef3c7; border-radius: 8px; padding: 12px 16px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .credit-note p { margin: 0; color: #92400e; font-size: 14px; }
            
            .cta-container { text-align: center; margin: 32px 0; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #2C3E50 0%, #1a252f 100%); color: white !important; padding: 18px 40px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 16px rgba(44,62,80,0.3); }
            
            .footer { background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
            .footer-text { color: #7F8C8D; font-size: 14px; margin: 8px 0; }
            .footer-address { color: #a0aec0; font-size: 12px; margin-top: 16px; }
            
            @media (max-width: 600px) {
              .content { padding: 24px 20px; }
              .header { padding: 30px 20px; }
              .price { font-size: 28px; }
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <h1 class="logo">Elevated Health Augusta</h1>
                <p class="tagline">Restore · Renew · Rebalance</p>
              </div>
              <div class="content">
                <h2 class="greeting">Hi ${firstName}!</h2>
                <p class="intro">You have a ${serviceLabel} consultation scheduled with Elevated Health Augusta. Please complete your payment to confirm your appointment.</p>
                
                ${scheduled_date ? `
                <div class="appointment-box">
                  <p class="appointment-label">Your Appointment</p>
                  <p class="appointment-date">${dateDisplay}</p>
                </div>
                ` : ''}
                
                <div class="price-box">
                  <p class="price">$79</p>
                  <p class="price-label">Wellness Assessment • 30 Minutes</p>
                </div>
                
                <div class="credit-note">
                  <p>Your visit is the consult-gated front door. In-office LabCorp draws and any panels are coordinated separately after your provider orders them.</p>
                </div>
                
                <div class="cta-container">
                  <a href="${paymentLink}" class="cta-button">Complete Payment →</a>
                </div>
              </div>
              <div class="footer">
                <p class="footer-text">Questions? Reply to this email or call us at <strong>(706) 760-3470</strong></p>
                <p class="footer-address">
                  Elevated Health Augusta<br/>
                  7013 Evans Town Center Blvd, Suite 203<br/>
                  Evans, GA 30809
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      // Standard invite email - needs to book
      emailSubject = `${firstName}, Your Consultation Invitation from Elevated Health Augusta`;
      emailHtml = `
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
            .tagline { color: rgba(255,255,255,0.7); font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-top: 8px; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 24px; font-weight: 600; color: #2C3E50; margin-bottom: 16px; }
            .intro { color: #4a5568; font-size: 16px; margin-bottom: 24px; }
            
            .price-box { background: linear-gradient(135deg, #f7f9fb 0%, #eef2f5 100%); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; border: 1px solid #e2e8f0; }
            .price { font-size: 36px; font-weight: 700; color: #2C3E50; margin: 0; }
            .price-label { font-size: 14px; color: #7F8C8D; margin-top: 4px; }
            
            .includes { background: #fafbfc; border-radius: 12px; padding: 24px; margin: 24px 0; }
            .includes-title { font-weight: 600; color: #2C3E50; margin-bottom: 16px; font-size: 16px; }
            .includes ul { margin: 0; padding: 0; list-style: none; }
            .includes li { margin: 12px 0; color: #4a5568; font-size: 15px; display: flex; align-items: flex-start; gap: 10px; }
            .check { color: #10b981; font-weight: bold; flex-shrink: 0; }
            
            .cta-container { text-align: center; margin: 32px 0; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #2C3E50 0%, #1a252f 100%); color: white !important; padding: 18px 40px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 16px rgba(44,62,80,0.3); }
            
            .footer { background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
            .footer-text { color: #7F8C8D; font-size: 14px; margin: 8px 0; }
            .footer-address { color: #a0aec0; font-size: 12px; margin-top: 16px; }
            
            @media (max-width: 600px) {
              .content { padding: 24px 20px; }
              .header { padding: 30px 20px; }
              .price { font-size: 28px; }
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <h1 class="logo">Elevated Health Augusta</h1>
                <p class="tagline">Restore · Renew · Rebalance</p>
              </div>
              <div class="content">
                <h2 class="greeting">Welcome, ${firstName}!</h2>
                <p class="intro">You've been personally invited to begin your hormone optimization journey with Elevated Health Augusta. Let's start with a personalized consultation to understand your unique needs.</p>
                
                <div class="price-box">
                  <p class="price">$79</p>
                  <p class="price-label">Wellness Assessment • 30 Minutes</p>
                </div>
                
                <div class="includes">
                  <p class="includes-title">Your Wellness Assessment includes:</p>
                  <ul>
                    <li><span class="check">✓</span> 30-minute in-person visit with your care team</li>
                    <li><span class="check">✓</span> Symptom and history review for your pathway</li>
                    <li><span class="check">✓</span> Clear next steps if you enroll in a program</li>
                    <li><span class="check">✓</span> In-office LabCorp draws when ordered (panels billed separately)</li>
                  </ul>
                </div>
                
                <div class="cta-container">
                  <a href="${paymentLink}" class="cta-button">Book Your Consultation →</a>
                </div>
                
                <p style="text-align: center; color: #718096; font-size: 14px; margin-top: 24px;">
                  After payment, you'll receive confirmation and can schedule your consultation.
                </p>
              </div>
              <div class="footer">
                <p class="footer-text">Questions? Reply to this email or call us at <strong>(706) 760-3470</strong></p>
                <p class="footer-address">
                  Elevated Health Augusta<br/>
                  7013 Evans Town Center Blvd, Suite 203<br/>
                  Evans, GA 30809
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: MAIL_FROM,
      to: [patient_email],
      subject: emailSubject,
      html: emailHtml,
    });

    logStep("Email sent", { emailId: emailResponse.data?.id });

    // Create a pending patient record
    const { data: patientData, error: patientError } = await supabase
      .from("patients")
      .insert({
        full_name: patient_name,
        email: patient_email,
        onboarding_status: "consultation_invited",
        invited_at: new Date().toISOString(),
        invited_by: userData.user.id,
      })
      .select("id")
      .single();

    if (patientError) {
      logStep("Patient record creation warning", { error: patientError.message });
    } else {
      logStep("Patient record created with consultation_invited status");
      
      // Log communication
      if (patientData?.id) {
        await supabase.from("communication_logs").insert({
          patient_id: patientData.id,
          template_key: invite_type === "already_booked" ? "consultation_payment_only" : "consultation_invite",
          subject: `Consultation Invite - ${service_type}`,
          body_preview: invite_type === "already_booked" ? "Payment link for already booked patient" : "Consultation booking invite sent",
          delivery_method: "email",
          status: "sent",
        });
        logStep("Communication logged");
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      paymentLink: paymentLink,
      payment_link: paymentLink,
      email_sent: true,
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