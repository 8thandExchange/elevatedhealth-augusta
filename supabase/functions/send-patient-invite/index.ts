import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { LIVE_CORE_SERVICES } from "../_shared/live-prices.ts";
import { hasClinicStaffRole } from "../_shared/staff-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-PATIENT-INVITE] ${step}${detailsStr}`);
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
    // Support both camelCase (from UI) and snake_case naming
    const patient_email = body.patient_email || body.patientEmail;
    const patient_name = body.patient_name || body.patientName;
    const patient_phone = body.patient_phone || body.patientPhone;

    if (!patient_email || !patient_name) {
      throw new Error("Missing required fields: patient_email and patient_name");
    }

    logStep("Request body", { patient_email, patient_name });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = "https://elevatedhealthaugusta.com";

    // Create Stripe Checkout for Comprehensive Wellness Panel ($199 non-member list)
    const session = await stripe.checkout.sessions.create({
      customer_email: patient_email,
      line_items: [
        {
          price: LIVE_CORE_SERVICES.comprehensivePanel,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/patient/create-account?session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(patient_email)}&name=${encodeURIComponent(patient_name)}`,
      cancel_url: `${origin}/`,
      metadata: {
        patient_email,
        patient_name,
        product: "comprehensive_wellness_panel",
        invite_type: "provider_invite",
      },
    });

    logStep("Stripe checkout session created", { sessionId: session.id });

    const paymentLink = session.url;
    const firstName = patient_name.split(" ")[0];

    // Send invite email via Resend
    const resend = new Resend(resendKey);
    
    const emailHtml = `
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
          .cta-button:hover { transform: translateY(-2px); }
          
          .steps-section { background: #f0f9ff; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #bae6fd; }
          .steps-title { font-weight: 600; color: #0369a1; margin-bottom: 16px; font-size: 16px; display: flex; align-items: center; gap: 8px; }
          .step { display: flex; gap: 12px; margin: 12px 0; }
          .step-num { width: 24px; height: 24px; background: #0ea5e9; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; }
          .step-text { color: #0369a1; font-size: 14px; }
          
          .magic-link-note { background: #fef3c7; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #fcd34d; }
          .magic-link-title { font-weight: 600; color: #92400e; margin-bottom: 8px; font-size: 14px; display: flex; align-items: center; gap: 8px; }
          .magic-link-text { color: #92400e; font-size: 13px; line-height: 1.5; }
          
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
              <p class="intro">You've been personally invited to begin your hormone optimization journey with Elevated Health Augusta. We're excited to help you feel your best.</p>
              
              <div class="price-box">
                <p class="price">$199</p>
                <p class="price-label">Comprehensive Wellness Panel • LabCorp (in-office draw)</p>
              </div>
              
              <div class="includes">
                <p class="includes-title">What's Included:</p>
                <ul>
                  <li><span class="check">✓</span> In-office LabCorp blood draw at our Evans clinic</li>
                  <li><span class="check">✓</span> Baseline wellness labs reviewed with your provider</li>
                  <li><span class="check">✓</span> Clear next steps if you enroll in a consult-gated program</li>
                  <li><span class="check">✓</span> Secure patient portal access for ongoing care</li>
                </ul>
              </div>
              
              <div class="cta-container">
                <a href="${paymentLink}" class="cta-button">Begin Your Journey →</a>
              </div>
              
              <div class="steps-section">
                <p class="steps-title">
                  <span style="font-size: 18px;">📋</span> Your Next Steps
                </p>
                <div class="step">
                  <span class="step-num">1</span>
                  <span class="step-text"><strong>Complete payment</strong> using the secure link above</span>
                </div>
                <div class="step">
                  <span class="step-num">2</span>
                  <span class="step-text"><strong>Create your account</strong> — you can use Google sign-in or email</span>
                </div>
                <div class="step">
                  <span class="step-num">3</span>
                  <span class="step-text"><strong>Complete intake forms</strong> in your secure patient portal</span>
                </div>
                <div class="step">
                  <span class="step-num">4</span>
                  <span class="step-text"><strong>Schedule your draw</strong> after account setup — our team coordinates your in-office LabCorp visit</span>
                </div>
              </div>
              
              <div class="magic-link-note">
                <p class="magic-link-title">
                  <span style="font-size: 16px;">✨</span> Easy Sign-In Tip
                </p>
                <p class="magic-link-text">
                  Already have an account? Visit <strong>elevatedhealthaugusta.com</strong> and scroll to the footer. Click "Returning Patient?" and use our <strong>Magic Link</strong> option — just enter your email and we'll send you a secure sign-in link. No password needed!
                </p>
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

    const emailResponse = await resend.emails.send({
      from: "Elevated Health Augusta <noreply@elevatedhealthaugusta.com>",
      to: [patient_email],
      subject: `${firstName}, Your Personalized Hormone Journey Awaits`,
      html: emailHtml,
    });

    logStep("Email sent", { emailId: emailResponse.data?.id });

    // Create a pending patient record
    const { error: patientError } = await supabase
      .from("patients")
      .insert({
        full_name: patient_name,
        email: patient_email,
        onboarding_status: "invited",
        invited_at: new Date().toISOString(),
        invited_by: userData.user.id,
      });

    if (patientError) {
      logStep("Patient record creation warning", { error: patientError.message });
      // Don't fail if patient already exists
    } else {
      logStep("Patient record created");
    }

    return new Response(JSON.stringify({ 
      success: true, 
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