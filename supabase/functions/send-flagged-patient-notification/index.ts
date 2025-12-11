import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? `: ${JSON.stringify(details)}` : "";
  console.log(`[send-flagged-patient-notification] ${step}${detailsStr}`);
};

interface FlaggedPatientRequest {
  patient_name: string;
  patient_email: string;
  safety_flags: string[];
  treatment_type: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting flagged patient notification");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY is not set");

    const { patient_name, patient_email, safety_flags, treatment_type }: FlaggedPatientRequest = await req.json();
    logStep("Request data", { patient_name, patient_email, safety_flags, treatment_type });

    if (!patient_email) {
      throw new Error("Patient email is required");
    }

    const resend = new Resend(resendKey);

    const calendarUrl = "https://calendar.google.com/calendar/appointments/schedules/AcZssZ3kI-kvTdW2N5O5jqkP1Qn_L2OyL0vpLQaBnYW9b8YC6sK3vqI0xnH4sLhJ3-I9ZjXpBxL7A8Mu?gv=true";

    const flagsList = safety_flags?.length > 0 
      ? safety_flags.map(flag => `<li style="margin-bottom: 4px;">${flag}</li>`).join("")
      : "<li>Medical review required</li>";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Georgia, 'Times New Roman', serif; background-color: #F9F9F7; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1a3a4a 0%, #2C3E50 100%); padding: 32px; text-align: center;">
            <h1 style="color: #D4A017; font-size: 24px; margin: 0; font-weight: normal;">Elevated Health Augusta</h1>
            <p style="color: #ffffff; font-size: 14px; margin-top: 8px; opacity: 0.9;">Your Safety is Our Priority</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px;">
            <h2 style="color: #2C3E50; font-size: 22px; margin: 0 0 16px 0; font-weight: normal;">
              Hello ${patient_name || "there"},
            </h2>
            
            <p style="color: #2C3E50; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Thank you for completing your medical intake. We've reviewed your health information and want to ensure we provide you with the safest, most appropriate care.
            </p>
            
            <div style="background-color: #FEF3C7; border-left: 4px solid #D4A017; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
              <p style="color: #92400E; font-size: 14px; margin: 0 0 8px 0; font-weight: bold;">
                Your intake indicated the following considerations:
              </p>
              <ul style="color: #92400E; font-size: 14px; margin: 0; padding-left: 20px;">
                ${flagsList}
              </ul>
            </div>
            
            <p style="color: #2C3E50; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              Before we can proceed with ${treatment_type || "your treatment"}, our clinical team needs to conduct a brief eligibility review. This is a standard precaution to ensure your safety and optimize your treatment outcomes.
            </p>
            
            <p style="color: #2C3E50; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; font-weight: bold;">
              Please schedule your Clinical Eligibility Review:
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${calendarUrl}" 
                 style="display: inline-block; background-color: #D4A017; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-size: 16px; font-weight: bold;">
                Book Eligibility Review
              </a>
            </div>
            
            <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
              This quick call typically takes 10-15 minutes. We're here to help you find the right path forward.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #F9F9F7; padding: 24px; text-align: center; border-top: 1px solid #E2E8F0;">
            <p style="color: #64748B; font-size: 12px; margin: 0 0 8px 0;">
              Elevated Health Augusta
            </p>
            <p style="color: #64748B; font-size: 12px; margin: 0;">
              3330 McClure Road, Augusta, GA 30909 | (762) 222-0098
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    logStep("Sending email to patient");
    
    const emailResponse = await resend.emails.send({
      from: "Elevated Health <noreply@stripe.elevatedhealthaugusta.com>",
      to: [patient_email],
      subject: "Action Required: Schedule Your Clinical Eligibility Review",
      html: emailHtml,
    });

    logStep("Email sent successfully", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    logStep("Error sending notification", { error: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
