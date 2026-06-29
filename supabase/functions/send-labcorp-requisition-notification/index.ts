import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { MAIL_FROM } from "../_shared/mail-config.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface LabcorpNotificationRequest {
  patientEmail: string;
  patientName: string;
  downloadUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { patientEmail, patientName, downloadUrl }: LabcorpNotificationRequest = await req.json();

    if (!patientEmail || !patientName || !downloadUrl) {
      throw new Error("Missing required fields: patientEmail, patientName, or downloadUrl");
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Labcorp Requisition is Ready</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2C3E50; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2C3E50; font-size: 24px; margin-bottom: 10px;">Elevated Health Augusta</h1>
        </div>
        
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: #2C3E50; font-size: 20px; margin-top: 0;">Hi ${patientName},</h2>
          
          <p style="margin-bottom: 20px;">
            Great news! Your Labcorp requisition is ready for download. This form contains all the information 
            the lab needs to complete your blood work.
          </p>
          
          <div style="background-color: #e8f4f8; border-left: 4px solid #3498db; padding: 16px; margin-bottom: 20px; border-radius: 4px;">
            <p style="margin: 0; font-weight: 600; color: #2C3E50;">Next Steps:</p>
            <ol style="margin: 10px 0 0 0; padding-left: 20px; color: #5a6a7a;">
              <li>Download and print the attached requisition form</li>
              <li>Take it to any Labcorp Patient Service Center</li>
              <li>No appointment is needed—just walk in!</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin: 24px 0;">
            <a href="${downloadUrl}" 
               style="display: inline-block; background-color: #2C3E50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Download Your Requisition
            </a>
          </div>
          
          <p style="color: #7f8c8d; font-size: 14px;">
            <strong>Find a Labcorp near you:</strong><br>
            <a href="https://www.labcorp.com/labs-and-appointments" style="color: #3498db;">
              https://www.labcorp.com/labs-and-appointments
            </a>
          </p>
        </div>
        
        <div style="text-align: center; color: #95a5a6; font-size: 12px; margin-top: 30px;">
          <p>
            This is a secure, HIPAA-compliant message from Elevated Health Augusta.<br>
            If you have questions, please contact us at (706) 750-7060.
          </p>
          <p style="margin-top: 10px;">
            2803 Wrightsboro Road, Suite 27<br>
            Augusta, GA 30909
          </p>
        </div>
      </body>
      </html>
    `;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: [patientEmail],
        subject: "Your Labcorp Requisition is Ready - Elevated Health Augusta",
        html: emailHtml,
      }),
    });

    const emailResponse = await emailRes.json();
    console.log("Labcorp notification email sent:", emailResponse);

    if (!emailRes.ok) {
      throw new Error(emailResponse.message || "Failed to send email");
    }

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending labcorp notification:", error);
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