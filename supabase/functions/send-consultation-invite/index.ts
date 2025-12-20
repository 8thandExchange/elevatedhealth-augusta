import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-CONSULTATION-INVITE] ${step}${detailsStr}`);
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

    const hasAccess = roles?.some(r => r.role === "admin" || r.role === "staff");
    if (!hasAccess) throw new Error("Insufficient permissions");

    logStep("Authorization verified");

    const body = await req.json();
    const { patient_email, patient_name } = body;

    if (!patient_email || !patient_name) {
      throw new Error("Missing required fields: patient_email and patient_name");
    }

    logStep("Request body", { patient_email, patient_name });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = "https://elevatedhealthaugusta.com";

    // Generate a credit code for the $99 credit
    const creditCode = generateCreditCode();
    logStep("Generated credit code", { creditCode });

    // Create Stripe Checkout session for $99 Discovery Consultation
    const session = await stripe.checkout.sessions.create({
      customer_email: patient_email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Discovery Consultation",
              description: "45-minute consultation with Lauren Bursey, NP-C. Includes $99 credit toward your Hormone Mapping Kit.",
            },
            unit_amount: 9900, // $99
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/consultation-confirmed?session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(patient_email)}&name=${encodeURIComponent(patient_name)}`,
      cancel_url: `${origin}/`,
      metadata: {
        patient_email,
        patient_name,
        credit_code: creditCode,
        product: "discovery_consultation",
        invite_type: "provider_consultation_invite",
      },
    });

    logStep("Stripe checkout session created", { sessionId: session.id });

    const paymentLink = session.url;
    const firstName = patient_name.split(" ")[0];

    // Create a consultation booking record with the credit code
    const { error: bookingError } = await supabase
      .from("consultation_bookings")
      .insert({
        customer_email: patient_email,
        customer_name: patient_name,
        credit_code: creditCode,
        service_type: "hormone_therapy",
        status: "pending",
        stripe_session_id: session.id,
      });

    if (bookingError) {
      logStep("Booking record creation warning", { error: bookingError.message });
    } else {
      logStep("Consultation booking record created with credit code");
    }

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
          
          .credit-highlight { background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #28a745; text-align: center; }
          .credit-title { font-weight: 600; color: #155724; margin-bottom: 8px; font-size: 16px; display: flex; align-items: center; justify-content: center; gap: 8px; }
          .credit-text { color: #155724; font-size: 14px; line-height: 1.5; }
          
          .includes { background: #fafbfc; border-radius: 12px; padding: 24px; margin: 24px 0; }
          .includes-title { font-weight: 600; color: #2C3E50; margin-bottom: 16px; font-size: 16px; }
          .includes ul { margin: 0; padding: 0; list-style: none; }
          .includes li { margin: 12px 0; color: #4a5568; font-size: 15px; display: flex; align-items: flex-start; gap: 10px; }
          .check { color: #10b981; font-weight: bold; flex-shrink: 0; }
          
          .cta-container { text-align: center; margin: 32px 0; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #2C3E50 0%, #1a252f 100%); color: white !important; padding: 18px 40px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 16px rgba(44,62,80,0.3); }
          
          .journey-section { background: #f0f9ff; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #bae6fd; }
          .journey-title { font-weight: 600; color: #0369a1; margin-bottom: 16px; font-size: 16px; display: flex; align-items: center; gap: 8px; }
          .step { display: flex; gap: 12px; margin: 16px 0; }
          .step-num { width: 28px; height: 28px; background: #0ea5e9; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; flex-shrink: 0; }
          .step-content { flex: 1; }
          .step-label { font-weight: 600; color: #0369a1; font-size: 14px; }
          .step-desc { color: #0369a1; font-size: 13px; margin-top: 2px; }
          .step-price { background: #0ea5e9; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-left: 8px; }
          
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
              <h1 class="logo">Elevated Health</h1>
              <p class="tagline">Restore · Renew · Rebalance</p>
            </div>
            <div class="content">
              <h2 class="greeting">Welcome, ${firstName}!</h2>
              <p class="intro">Lauren Bursey, NP-C has personally invited you to begin your hormone optimization journey with Elevated Health Augusta. Let's start with a personalized consultation to understand your unique needs.</p>
              
              <div class="price-box">
                <p class="price">$99</p>
                <p class="price-label">Discovery Consultation • 45 Minutes</p>
              </div>
              
              <div class="credit-highlight">
                <p class="credit-title">
                  <span style="font-size: 18px;">💎</span> $99 Credit Included
                </p>
                <p class="credit-text">
                  Your consultation fee becomes a <strong>$99 credit</strong> toward your Hormone Mapping Kit ($349). 
                  You'll only pay $250 for the kit after consultation!
                </p>
              </div>
              
              <div class="includes">
                <p class="includes-title">Your Consultation Includes:</p>
                <ul>
                  <li><span class="check">✓</span> 45-minute one-on-one with Lauren Bursey, NP-C</li>
                  <li><span class="check">✓</span> Complete symptom assessment</li>
                  <li><span class="check">✓</span> Personalized treatment path discussion</li>
                  <li><span class="check">✓</span> $99 credit toward your diagnostic testing</li>
                </ul>
              </div>
              
              <div class="cta-container">
                <a href="${paymentLink}" class="cta-button">Book Your Consultation →</a>
              </div>
              
              <div class="journey-section">
                <p class="journey-title">
                  <span style="font-size: 18px;">🗓️</span> Your Complete Journey
                </p>
                <div class="step">
                  <span class="step-num">1</span>
                  <div class="step-content">
                    <span class="step-label">Discovery Consultation <span class="step-price">$99</span></span>
                    <p class="step-desc">Pay today & schedule your 45-min consultation</p>
                  </div>
                </div>
                <div class="step">
                  <span class="step-num">2</span>
                  <div class="step-content">
                    <span class="step-label">Hormone Mapping Kit <span class="step-price">$250</span></span>
                    <p class="step-desc">After consultation, we'll send your kit link ($349 - $99 credit)</p>
                  </div>
                </div>
                <div class="step">
                  <span class="step-num">3</span>
                  <div class="step-content">
                    <span class="step-label">Lab Review & Treatment Plan</span>
                    <p class="step-desc">Deep-dive into your results with personalized protocol</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="footer">
              <p class="footer-text">Questions? Reply to this email or call us at <strong>(706) 821-7354</strong></p>
              <p class="footer-address">
                Elevated Health Augusta<br/>
                3540 Wheeler Road, Suite 601<br/>
                Augusta, GA 30909
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Elevated Health <noreply@stripe.elevatedhealthaugusta.com>",
      to: [patient_email],
      subject: `${firstName}, Your Consultation Invitation from Elevated Health`,
      html: emailHtml,
    });

    logStep("Email sent", { emailId: emailResponse.data?.id });

    // Create a pending patient record
    const { error: patientError } = await supabase
      .from("patients")
      .insert({
        full_name: patient_name,
        email: patient_email,
        onboarding_status: "consultation_invited",
        invited_at: new Date().toISOString(),
        invited_by: userData.user.id,
      });

    if (patientError) {
      logStep("Patient record creation warning", { error: patientError.message });
      // Don't fail if patient already exists
    } else {
      logStep("Patient record created with consultation_invited status");
    }

    return new Response(JSON.stringify({ 
      success: true, 
      payment_link: paymentLink,
      email_sent: true,
      credit_code: creditCode,
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
