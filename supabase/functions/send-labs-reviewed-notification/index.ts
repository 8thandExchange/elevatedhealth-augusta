import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LabsReviewedRequest {
  patient_id?: string;
  patient_name: string;
  patient_email: string;
  provider_name?: string;
  next_step?: "schedule_review" | "protocol_ready" | "additional_labs";
  next_step_link?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

  try {
    const { 
      patient_id,
      patient_name, 
      patient_email, 
      provider_name = "Your Provider",
      next_step = "protocol_ready",
      next_step_link
    }: LabsReviewedRequest = await req.json();

    console.log(`Sending labs reviewed notification to ${patient_email}`);

    const firstName = patient_name.split(' ')[0];
    
    let nextStepContent = '';
    let ctaText = '';
    let ctaLink = next_step_link || "https://elevatedhealthaugusta.com/patient";
    
    switch (next_step) {
      case "schedule_review":
        nextStepContent = `
          <p style="color: #5D6D7E; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            We'd like to schedule a brief call to discuss your results and answer any questions. Click below to book a convenient time.
          </p>
        `;
        ctaText = "Schedule Lab Review Call →";
        break;
      case "additional_labs":
        nextStepContent = `
          <p style="color: #5D6D7E; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            Based on your initial results, we'd like to run a few additional tests to ensure we have a complete picture of your health. We'll send you details on the next steps.
          </p>
        `;
        ctaText = "View My Dashboard →";
        break;
      case "protocol_ready":
      default:
        nextStepContent = `
          <p style="color: #5D6D7E; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            Great news! Your personalized treatment protocol has been created based on your lab results. You'll receive a separate email with activation instructions shortly.
          </p>
        `;
        ctaText = "View My Results →";
        break;
    }

    const emailResponse = await resend.emails.send({
      from: "Elevated Health Augusta <noreply@elevatedhealthaugusta.com>",
      to: [patient_email],
      subject: "Your Lab Results Have Been Reviewed",
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
                Elevated Health Augusta
              </h1>
              <p style="color: #D4A017; font-size: 14px; margin-top: 8px; letter-spacing: 2px;">
                LAB RESULTS UPDATE
              </p>
            </div>

            <!-- Main Content -->
            <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #E5E5E5;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background: #E8F5E9; border-radius: 50%; padding: 16px;">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>
              
              <h2 style="font-family: Georgia, serif; font-size: 24px; color: #2C3E50; margin: 0 0 16px 0; text-align: center;">
                Your Labs Have Been Reviewed
              </h2>
              
              <p style="color: #5D6D7E; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Hi ${firstName},
              </p>
              
              <p style="color: #5D6D7E; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                ${provider_name} has completed a thorough review of your recent lab results. We've analyzed your hormone levels and other key biomarkers to create the optimal treatment plan for you.
              </p>

              <div style="background: linear-gradient(135deg, #F0FDF4 0%, #E8F5E9 100%); border-radius: 8px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #4CAF50;">
                <h3 style="font-family: Georgia, serif; font-size: 18px; color: #2C3E50; margin: 0 0 12px 0;">
                  What This Means for You
                </h3>
                ${nextStepContent}
              </div>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${ctaLink}" 
                   style="display: inline-block; background: #D4A017; color: white; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(212, 160, 23, 0.3);">
                  ${ctaText}
                </a>
              </div>

              <div style="border-top: 1px solid #E5E5E5; padding-top: 24px;">
                <p style="color: #5D6D7E; font-size: 14px; line-height: 1.6; margin: 0;">
                  <strong>Questions about your results?</strong><br>
                  You can message your care team directly through your patient portal, or call us at (706) 760-3470.
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 32px; color: #8E9EAB; font-size: 12px;">
              <p style="margin: 0 0 8px 0;">
                <strong>Elevated Health Augusta</strong><br>
                7013 Evans Town Center Blvd, Suite 203<br>
                Evans, GA 30809
              </p>
              <p style="margin: 0;">
                <a href="tel:7067603470" style="color: #D4A017; text-decoration: none;">(706) 760-3470</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Labs reviewed notification sent successfully:", emailResponse);

    // Log communication
    if (patient_id) {
      await supabase.from("communication_logs").insert({
        patient_id,
        template_key: "labs_reviewed",
        subject: "Your Lab Results Have Been Reviewed",
        body_preview: `Labs reviewed by ${provider_name} - ${next_step}`,
        delivery_method: "email",
        status: "sent",
      });
      console.log("Communication logged");
    }

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending labs reviewed notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
