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

    // Create Stripe Checkout session for $299 Hormone Mapping
    // After payment, redirect to account creation page
    const session = await stripe.checkout.sessions.create({
      customer_email: patient_email,
      line_items: [
        {
          price: "price_1SZiRMEOtKRY99pua6QMu12h", // Hormone Mapping Package $299
          quantity: 1,
        },
      ],
      mode: "payment",
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      // Redirect to account creation after payment
      success_url: `${origin}/patient/create-account?session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(patient_email)}&name=${encodeURIComponent(patient_name)}`,
      cancel_url: `${origin}/`,
      metadata: {
        patient_email,
        patient_name,
        product: "hormone_mapping_package",
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
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2C3E50; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #2C3E50; }
          .content { background: #f8f9fa; border-radius: 12px; padding: 30px; margin-bottom: 30px; }
          .cta-button { display: inline-block; background: #2C3E50; color: white !important; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; margin: 20px 0; }
          .price { font-size: 32px; font-weight: bold; color: #2C3E50; }
          .includes { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .includes li { margin: 8px 0; color: #4a5568; }
          .footer { text-align: center; color: #7F8C8D; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Elevated Health Augusta</div>
          </div>
          <div class="content">
            <h2>Welcome, ${firstName}!</h2>
            <p>Lauren Bursey, NP-C has invited you to begin your personalized hormone optimization journey with Elevated Health.</p>
            
            <p class="price">$299 One-Time</p>
            <p style="font-size: 14px; color: #7F8C8D; margin-top: 0;">Hormone Mapping Experience</p>
            
            <div class="includes">
              <strong>What's Included:</strong>
              <ul>
                <li>✓ At-home ZRT Saliva Test Kit (shipped to you)</li>
                <li>✓ Comprehensive hormone panel analysis</li>
                <li>✓ 45-minute deep-dive clinical review with Lauren</li>
                <li>✓ Customized protocol design</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${paymentLink}" class="cta-button">Begin Your Journey →</a>
            </div>
            
            <p style="font-size: 14px; color: #7F8C8D;">After payment, you'll create your secure patient portal account and complete your medical intake form.</p>
          </div>
          <div class="footer">
            <p>Questions? Reply to this email or call us at (706) 821-7354</p>
            <p>Elevated Health Augusta<br/>3540 Wheeler Road, Suite 601<br/>Augusta, GA 30909</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Elevated Health <noreply@stripe.elevatedhealthaugusta.com>",
      to: [patient_email],
      subject: "Welcome to Elevated Health – Begin Your Hormone Mapping",
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