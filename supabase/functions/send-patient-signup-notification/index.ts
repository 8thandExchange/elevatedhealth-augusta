import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PatientSignupNotificationRequest {
  patientName: string;
  patientEmail: string;
  primaryProgram: "hormone" | "weight_loss" | "peptide" | string;
  isHighRisk: boolean;
  safetyFlags?: string[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      patientName, 
      patientEmail, 
      primaryProgram, 
      isHighRisk,
      safetyFlags 
    }: PatientSignupNotificationRequest = await req.json();

    console.log("[send-patient-signup-notification] New patient signup:", {
      patientName,
      patientEmail,
      primaryProgram,
      isHighRisk
    });

    const programLabel =
      primaryProgram === "weight_loss"
        ? "Medical Weight Loss (GLP-1)"
        : primaryProgram === "peptide"
        ? "Peptide Therapy"
        : "Hormone Optimization / Wellness";

    const riskBadge = isHighRisk 
      ? `<span style="background-color: #fee2e2; color: #dc2626; padding: 4px 12px; border-radius: 4px; font-weight: 600;">⚠️ HIGH RISK - REQUIRES REVIEW</span>`
      : `<span style="background-color: #dcfce7; color: #16a34a; padding: 4px 12px; border-radius: 4px; font-weight: 600;">✓ Standard Risk</span>`;

    const safetyFlagsHtml = isHighRisk && safetyFlags && safetyFlags.length > 0
      ? `
        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-top: 16px;">
          <h3 style="color: #92400e; margin: 0 0 8px 0;">Safety Flags Identified:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #78350f;">
            ${safetyFlags.map(flag => `<li>${flag}</li>`).join('')}
          </ul>
        </div>
      `
      : '';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Patient Registration</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
            
            <div style="background: linear-gradient(135deg, #2C3E50 0%, #34495e 100%); padding: 24px 32px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🆕 New Patient Registration</h1>
              <p style="color: #C5A059; margin: 8px 0 0 0; font-size: 14px;">Elevated Health Augusta</p>
            </div>

            <div style="padding: 32px;">
              <p style="color: #374151; font-size: 16px; margin: 0 0 24px 0;">
                A new patient has registered through the patient portal:
              </p>

              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; width: 140px;">Patient Name:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 600;">${patientName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Email:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827;">${patientEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Program:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827;">${programLabel}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #6b7280;">Risk Status:</td>
                  <td style="padding: 12px 0;">${riskBadge}</td>
                </tr>
              </table>

              ${safetyFlagsHtml}

              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <a href="https://elevatedhealthaugusta.com/provider/dashboard" 
                   style="display: inline-block; background-color: #C5A059; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                  View in Provider Dashboard →
                </a>
              </div>
            </div>

            <div style="background-color: #f3f4f6; padding: 16px 32px; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                This is an automated notification from Elevated Health Augusta Patient Portal
              </p>
            </div>

          </div>
        </body>
      </html>
    `;

    // Send to clinic booking email
    const emailResponse = await resend.emails.send({
      from: "Elevated Health Augusta <noreply@stripe.elevatedhealthaugusta.com>",
      to: ["appointments@elevatedhealthaugusta.com"],
      subject: `🆕 New patient: ${patientName} (${primaryProgram})${isHighRisk ? " ⚠️ HIGH RISK" : ""}`,
      html: emailHtml,
    });

    console.log("[send-patient-signup-notification] Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("[send-patient-signup-notification] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
