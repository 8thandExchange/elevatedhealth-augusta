import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  patient_name: string;
  patient_email: string;
  primary_program?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { patient_name, patient_email, primary_program }: WelcomeEmailRequest = await req.json();

    console.log(`Sending welcome email to ${patient_email}`);

    const programText = primary_program === 'ketamine' 
      ? 'Ketamine Therapy & Mental Wellness'
      : 'Hormone Optimization & Weight Loss';

    const emailResponse = await resend.emails.send({
      from: "Elevated Health <noreply@stripe.elevatedhealthaugusta.com>",
      to: [patient_email],
      subject: "Welcome to Elevated Health! Your Next Steps",
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
                PERSONALIZED WELLNESS
              </p>
            </div>

            <!-- Main Content -->
            <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #E5E5E5;">
              <h2 style="font-family: Georgia, serif; font-size: 24px; color: #2C3E50; margin: 0 0 16px 0;">
                Welcome, ${patient_name}!
              </h2>
              
              <p style="color: #5D6D7E; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Thank you for choosing Elevated Health Augusta for your ${programText} journey. We're honored to partner with you on your path to optimal wellness.
              </p>

              <div style="background: #F9F9F7; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="font-family: Georgia, serif; font-size: 18px; color: #2C3E50; margin: 0 0 12px 0;">
                  Your Next Step: Complete Your Medical Intake
                </h3>
                <p style="color: #5D6D7E; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
                  To ensure we create the perfect personalized protocol for you, please complete your medical intake form. This comprehensive assessment helps our providers understand your unique health profile.
                </p>
                <a href="https://elevatedhealthaugusta.com/patient/intake" 
                   style="display: inline-block; background: #D4A017; color: white; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: 500; font-size: 14px;">
                  Complete Medical Intake →
                </a>
              </div>

              <div style="border-top: 1px solid #E5E5E5; padding-top: 24px;">
                <h4 style="font-size: 14px; color: #2C3E50; margin: 0 0 12px 0;">What Happens Next:</h4>
                <ol style="color: #5D6D7E; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Complete your medical intake form (5-10 minutes)</li>
                  <li>Our provider reviews your health profile within 24-48 hours</li>
                  <li>You'll receive an email when your personalized protocol is ready</li>
                  <li>Begin your transformation journey!</li>
                </ol>
              </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 32px; color: #8E9EAB; font-size: 12px;">
              <p style="margin: 0 0 8px 0;">
                Elevated Health Augusta<br>
                3540 Wheeler Road, Suite 505, Augusta, GA 30909
              </p>
              <p style="margin: 0;">
                Questions? Call us at (762) 821-7640
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
