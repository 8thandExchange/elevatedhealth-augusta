import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { hasClinicStaffRole } from "../_shared/staff-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-INTAKE-LINK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

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
    // Support both camelCase and snake_case
    const patientId = body.patientId || body.patient_id;
    const patientName = body.patientName || body.patient_name;
    const patientEmail = body.patientEmail || body.patient_email;
    const patientPhone = body.patientPhone || body.patient_phone;

    if (!patientId) {
      throw new Error("Missing required field: patientId");
    }

    logStep("Request body", { patientId, patientName, patientEmail });

    // Generate a unique intake token
    const intakeToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    // Update patient with intake token
    const { error: updateError } = await supabase
      .from("patients")
      .update({
        intake_token: intakeToken,
        intake_token_expires_at: expiresAt,
        consent_sent_at: new Date().toISOString(),
        consent_method: "internal",
      })
      .eq("id", patientId);

    if (updateError) {
      throw new Error(`Failed to update patient: ${updateError.message}`);
    }

    logStep("Patient updated with intake token");

    const origin = "https://elevatedhealthaugusta.com";
    const intakeLink = `${origin}/intake?token=${intakeToken}`;
    const firstName = patientName?.split(" ")[0] || "there";

    // Send email with intake link
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
          .cta-container { text-align: center; margin: 32px 0; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #D4A017 0%, #C5A059 100%); color: white !important; padding: 18px 40px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 16px rgba(212,160,23,0.3); }
          .info-box { background: #f0f9ff; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #bae6fd; }
          .info-title { font-weight: 600; color: #0369a1; margin-bottom: 8px; font-size: 14px; }
          .info-text { color: #0369a1; font-size: 13px; line-height: 1.5; }
          .footer { background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
          .footer-text { color: #7F8C8D; font-size: 14px; margin: 8px 0; }
          .footer-address { color: #a0aec0; font-size: 12px; margin-top: 16px; }
          @media (max-width: 600px) {
            .content { padding: 24px 20px; }
            .header { padding: 30px 20px; }
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
              <p class="intro">Please complete your medical intake form and consent documents to continue with your care at Elevated Health Augusta. This helps our provider team prepare for your personalized treatment plan.</p>
              
              <div class="cta-container">
                <a href="${intakeLink}" class="cta-button">Complete Your Intake Form →</a>
              </div>
              <p style="margin-top: 12px; font-size: 13px; color: #4a5568; text-align: center;">
                If the button does not appear, use this direct link:<br/>
                <a href="${intakeLink}" style="color: #0f766e; text-decoration: underline; word-break: break-all;">${intakeLink}</a>
              </p>
              
              <div class="info-box">
                <p class="info-title">📋 What to Expect</p>
                <p class="info-text">
                  The form takes about 5-10 minutes to complete. You'll provide your medical history, current symptoms, and sign our consent documents. All information is kept confidential and secure.
                </p>
              </div>
              
              <div class="info-box" style="background: #fef3c7; border-color: #fcd34d;">
                <p class="info-title" style="color: #92400e;">⏰ Link Expires in 7 Days</p>
                <p class="info-text" style="color: #92400e;">
                  Please complete your intake form within 7 days. If the link expires, contact us and we'll send you a new one.
                </p>
              </div>
            </div>
            <div class="footer">
              <p class="footer-text">Questions? Reply to this email or call us at <strong>(706) 760-3470</strong></p>
              <p class="footer-address">
                Elevated Health Augusta<br/>
                7013 Evans Town Center Blvd<br/>
                Evans, GA 30809
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    let emailSent = false;
    let smsSent = false;

    // Send email if available
    if (patientEmail) {
      const emailResponse = await resend.emails.send({
        from: "Elevated Health Augusta <noreply@elevatedhealthaugusta.com>",
        to: [patientEmail],
        subject: `${firstName}, Complete Your Medical Intake Form`,
        html: emailHtml,
      });

      logStep("Email sent", { emailId: emailResponse.data?.id });
      emailSent = true;
    }

    if (patientPhone) {
      try {
        const { sendSms } = await import("../_shared/sms.ts");
        const smsMessage = `Hi ${firstName}! Please complete your medical intake form for Elevated Health Augusta: ${intakeLink} - This link expires in 7 days.`;
        const smsResult = await sendSms(patientPhone, smsMessage, { contactName: firstName });
        if (smsResult.success) {
          logStep("SMS sent via GHL", { phone: patientPhone });
          smsSent = true;
        } else {
          logStep("SMS failed via GHL", { error: smsResult.error });
        }
      } catch (smsError) {
        logStep("SMS error", { error: String(smsError) });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      intake_link: intakeLink,
      email_sent: emailSent,
      sms_sent: smsSent,
      expires_at: expiresAt,
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
