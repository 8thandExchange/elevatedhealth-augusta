import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-TREATMENT-AUTHORIZED] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY is not set");

    const { patient_name, patient_email, protocol_name, patient_id } = await req.json();

    if (!patient_email || !patient_name) {
      throw new Error("patient_email and patient_name are required");
    }

    logStep("Request received", { patient_name, patient_email, protocol_name, patient_id });

    const resend = new Resend(resendKey);

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2C3E50 0%, #3d5166 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 1px;">Great News!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #2C3E50; font-size: 18px; margin: 0 0 20px; line-height: 1.6;">
                Dear ${patient_name},
              </p>
              
              <p style="color: #4a5568; font-size: 16px; margin: 0 0 20px; line-height: 1.8;">
                Your provider has completed their clinical review and <strong>authorized your treatment plan</strong>.
              </p>

              ${protocol_name ? `
              <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <p style="color: #166534; margin: 0; font-weight: 600;">Recommended Protocol: ${protocol_name}</p>
              </div>
              ` : ''}
              
              <p style="color: #4a5568; font-size: 16px; margin: 0 0 20px; line-height: 1.8;">
                <strong>What happens next?</strong>
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td style="padding: 15px 20px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #2C3E50;">
                    <p style="color: #2C3E50; font-size: 14px; margin: 0 0 8px; font-weight: 600;">1. Activation Email</p>
                    <p style="color: #718096; font-size: 14px; margin: 0;">You'll receive a separate email shortly with a secure link to activate your membership and finalize your pharmacy order.</p>
                  </td>
                </tr>
                <tr><td style="height: 12px;"></td></tr>
                <tr>
                  <td style="padding: 15px 20px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #2C3E50;">
                    <p style="color: #2C3E50; font-size: 14px; margin: 0 0 8px; font-weight: 600;">2. Pharmacy Processing</p>
                    <p style="color: #718096; font-size: 14px; margin: 0;">Once activated, your prescription will be sent to our partner pharmacy and shipped directly to you (3-5 business days).</p>
                  </td>
                </tr>
                <tr><td style="height: 12px;"></td></tr>
                <tr>
                  <td style="padding: 15px 20px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #2C3E50;">
                    <p style="color: #2C3E50; font-size: 14px; margin: 0 0 8px; font-weight: 600;">3. Patient Portal Access</p>
                    <p style="color: #718096; font-size: 14px; margin: 0;">Log in to your patient portal to view your full treatment plan with detailed application instructions.</p>
                  </td>
                </tr>
              </table>
              
              <p style="color: #4a5568; font-size: 16px; margin: 20px 0; line-height: 1.8;">
                If you have any questions, reply to this email or call us at <strong>(706) 760-3470</strong>.
              </p>
              
              <p style="color: #4a5568; font-size: 16px; margin: 20px 0 0; line-height: 1.8;">
                Warmly,<br>
                <strong style="color: #2C3E50;">The Réveil Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #718096; font-size: 13px; margin: 0 0 8px;">
                Réveil<br>
                7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809
              </p>
              <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Réveil. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    const emailResponse = await resend.emails.send({
      from: "Réveil <noreply@stripe.reveil.health>",
      to: [patient_email],
      subject: "Your Treatment Has Been Authorized – Next Steps Inside",
      html: emailHtml,
    });

    logStep("Email sent", { emailId: emailResponse.data?.id });

    // Log to communication_logs if patient_id provided
    if (patient_id) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        await supabase.from("communication_logs").insert({
          patient_id,
          template_key: "treatment_authorized",
          subject: "Your Treatment Has Been Authorized – Next Steps Inside",
          body_preview: `Treatment authorized notification sent${protocol_name ? ` for ${protocol_name}` : ''}`,
          delivery_method: "email",
          status: "sent",
        });
        logStep("Communication logged");
      } catch (logError) {
        logStep("Failed to log communication", { error: logError });
      }
    }

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
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
