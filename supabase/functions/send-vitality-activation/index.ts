import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SEND-VITALITY-ACTIVATION] ${step}${detailsStr}`);
};

interface VitalityActivationRequest {
  patient_name: string;
  patient_email: string;
  payment_link?: string;
  patient_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { patient_name, patient_email, payment_link, patient_id }: VitalityActivationRequest = await req.json();

    logStep("Request received", { patient_name, patient_email, patient_id });

    const firstName = patient_name.split(' ')[0];
    const activationLink = payment_link || "https://reveil.health/consult";

    const emailResponse = await resend.emails.send({
      from: "Réveil <noreply@stripe.reveil.health>",
      to: [patient_email],
      subject: "Your Personalized Hormone Protocol is Ready",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #F9F9F7;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="font-family: Georgia, serif; font-size: 28px; color: #2C3E50; margin: 0;">
                Réveil
              </h1>
              <p style="color: #D4A017; font-size: 14px; margin-top: 8px; letter-spacing: 2px;">
                HORMONE OPTIMIZATION
              </p>
            </div>

            <!-- Main Content -->
            <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #E5E5E5;">
              <h2 style="font-family: Georgia, serif; font-size: 24px; color: #2C3E50; margin: 0 0 16px 0;">
                Great News, ${firstName}!
              </h2>
              
              <p style="color: #5D6D7E; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Your personalized hormone protocol has been reviewed and approved by our medical team. You're ready to begin your journey to optimal hormone health.
              </p>

              <div style="background: linear-gradient(135deg, #F9F9F7 0%, #EEF2F6 100%); border-radius: 8px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #D4A017;">
                <h3 style="font-family: Georgia, serif; font-size: 18px; color: #2C3E50; margin: 0 0 12px 0;">
                  Vitality Membership - $249/month
                </h3>
                <ul style="color: #5D6D7E; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Custom-compounded bioidentical hormones</li>
                  <li>Monthly provider check-ins</li>
                  <li>Ongoing lab monitoring</li>
                  <li>Direct messaging with your care team</li>
                  <li>Prescription adjustments as needed</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${activationLink}" 
                   style="display: inline-block; background: #D4A017; color: white; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(212, 160, 23, 0.3);">
                  Activate My Membership →
                </a>
              </div>

              <div style="border-top: 1px solid #E5E5E5; padding-top: 24px;">
                <h4 style="font-size: 14px; color: #2C3E50; margin: 0 0 12px 0;">What Happens Next:</h4>
                <ol style="color: #5D6D7E; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Click the button above to activate your membership</li>
                  <li>Your prescription is sent to our partner pharmacy</li>
                  <li>Medications ship directly to your door (3-5 business days)</li>
                  <li>Start feeling better within 2-4 weeks</li>
                </ol>
              </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 32px; color: #8E9EAB; font-size: 12px;">
              <p style="margin: 0 0 8px 0;">
                <strong>Réveil</strong><br>
                7013 Evans Town Center Blvd, Suite 203<br>
                Evans, GA 30809
              </p>
              <p style="margin: 0;">
                Questions? Call us at <a href="tel:7064267383" style="color: #D4A017; text-decoration: none;">(706) 426-7383</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    logStep("Email sent successfully", { emailId: emailResponse.data?.id });

    // Log to communication_logs if patient_id provided
    if (patient_id) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        await supabase.from("communication_logs").insert({
          patient_id,
          template_key: "vitality_activation",
          subject: "Your Personalized Hormone Protocol is Ready",
          body_preview: `Vitality Membership activation email sent to ${patient_email}`,
          delivery_method: "email",
          status: "sent",
        });
        logStep("Communication logged");
      } catch (logError) {
        logStep("Failed to log communication", { error: logError });
      }
    }

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
