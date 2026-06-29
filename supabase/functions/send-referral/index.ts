import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { MAIL_FROM } from "../_shared/mail-config.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReferralRequest {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  benefitType: string;
  providerName: string;
  providerEmail: string;
  diagnosis: string;
  priorTreatments: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ReferralRequest = await req.json();
    console.log("Processing referral request for:", data.patientName);

    const {
      patientName,
      patientEmail,
      patientPhone,
      benefitType,
      providerName,
      providerEmail,
      diagnosis,
      priorTreatments,
    } = data;

    // Send emails via Resend

    const timestamp = new Date().toLocaleString('en-US', { 
      timeZone: 'America/New_York',
      dateStyle: 'full',
      timeStyle: 'long'
    });

    // Email to provider
    const providerEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            h1 { color: #1a1a1a; border-bottom: 3px solid #D4AF37; padding-bottom: 10px; }
            h2 { color: #1a1a1a; margin-top: 25px; }
            ul { list-style: none; padding: 0; }
            li { padding: 8px 0; }
            strong { color: #1a1a1a; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Referral Request from ${patientName}</h1>
            <p>You have received a referral request for cash-pay wellness services at Elevated Health Augusta (hormone optimization, medical weight management, IV therapy, or peptides when prescribed).</p>
            
            <h2>Patient Information:</h2>
            <ul>
              <li><strong>Name:</strong> ${patientName}</li>
              <li><strong>Email:</strong> ${patientEmail}</li>
              <li><strong>Phone:</strong> ${patientPhone}</li>
              <li><strong>Benefit Type:</strong> ${benefitType.toUpperCase()}</li>
            </ul>

            <h2>Clinical Information:</h2>
            <ul>
              <li><strong>Diagnosis:</strong> ${diagnosis}</li>
              <li><strong>Prior Treatments:</strong> ${priorTreatments}</li>
            </ul>

            <h2>Clinic Information:</h2>
            <p>
              <strong>Elevated Health Augusta</strong><br>
              7013 Evans Town Center Blvd, Suite 203<br>
              Evans, GA 30809<br>
              Phone: (706) 550-9202<br>
              Email: appointments@elevatedhealthaugusta.com
            </p>

            <p>Please contact the clinic or patient to coordinate this referral.</p>

            <div class="footer">
              <p>Received: ${timestamp}</p>
              <p><em>This message was sent via HIPAA-compliant encrypted email.</em></p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Email to patient
    const patientEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            h1 { color: #1a1a1a; border-bottom: 3px solid #D4AF37; padding-bottom: 10px; }
            h2 { color: #1a1a1a; margin-top: 25px; }
            ul { padding-left: 20px; }
            li { padding: 5px 0; }
            strong { color: #1a1a1a; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Your Referral Request Has Been Submitted</h1>
            <p>Dear ${patientName},</p>
            
            <p>Thank you for requesting a referral to Elevated Health Augusta for concierge wellness care.</p>

            <p>We have sent your referral request to:</p>
            <ul>
              <li><strong>Provider:</strong> ${providerName}</li>
              <li><strong>Email:</strong> ${providerEmail}</li>
            </ul>

            <p>Our team will follow up with you within 1-2 business days to:</p>
            <ul>
              <li>Verify your ${benefitType.toUpperCase()} benefits</li>
              <li>Coordinate with your provider</li>
              <li>Schedule your initial evaluation</li>
            </ul>

            <h2>What's Next?</h2>
            <p>You can expect to hear from us soon. In the meantime, if you have any questions, please contact us:</p>
            <p>
              <strong>Elevated Health Augusta</strong><br>
              Phone: (706) 550-9202<br>
              Email: appointments@elevatedhealthaugusta.com
            </p>

            <p>Thank you for choosing Elevated Health Augusta.</p>

            <div class="footer">
              <p>Submitted: ${timestamp}</p>
              <p><em>This message was sent via HIPAA-compliant encrypted email.</em></p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email to provider (or just clinic if provider unknown)
    let providerResult = null;
    
    // Only send to provider if we have a valid email
    if (providerEmail && providerEmail !== "unknown" && providerEmail !== "custom") {
      console.log("Sending referral to provider:", providerEmail);
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: MAIL_FROM,
          to: [providerEmail],
          cc: ["appointments@elevatedhealthaugusta.com"],
          reply_to: patientEmail,
          subject: `Referral Request for ${patientName} - ${benefitType.toUpperCase()}`,
          html: providerEmailHtml,
        }),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        throw new Error(`Resend API error (${emailResponse.status}): ${errorText}`);
      }
      console.log("Provider email sent via Resend");
      providerResult = { success: true, recipient: providerEmail };
    } else {
      // Send only to clinic if no valid provider email
      console.log("No valid provider email, sending to clinic only");
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: MAIL_FROM,
          to: ["appointments@elevatedhealthaugusta.com"],
          subject: `Referral Request for ${patientName} - ${benefitType.toUpperCase()} (No Provider Contact)`,
          html: providerEmailHtml,
        }),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        throw new Error(`Resend API error (${emailResponse.status}): ${errorText}`);
      }
      console.log("Clinic-only email sent via Resend");
      providerResult = { success: true, recipient: "clinic-only" };
    }

    // Send confirmation email to patient
    console.log("Sending confirmation to patient:", patientEmail);
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: [patientEmail],
        subject: "Your Referral Request - Elevated Health Augusta",
        html: patientEmailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`Resend API error (${emailResponse.status}): ${errorText}`);
    }
    console.log("Patient confirmation email sent via Resend");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Referral request submitted successfully",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-referral function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);