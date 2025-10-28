import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
  webhookUrl?: string;
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
      webhookUrl,
    } = data;

    // Email to provider
    const providerEmailHtml = `
      <h1>Referral Request from ${patientName}</h1>
      <p>You have received a referral request for ketamine-assisted therapy at Elevated Health Augusta.</p>
      
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
        Email: care@elevatedhealthaugusta.com
      </p>

      <p>Please contact the clinic or patient to coordinate this referral.</p>
    `;

    // Email to patient
    const patientEmailHtml = `
      <h1>Your Referral Request Has Been Submitted</h1>
      <p>Dear ${patientName},</p>
      
      <p>Thank you for requesting a referral to Elevated Health Augusta for ketamine-assisted therapy.</p>

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
        Email: care@elevatedhealthaugusta.com
      </p>

      <p>Thank you for choosing Elevated Health Augusta.</p>
    `;

    // Send email to provider with CC to clinic using Resend API
    const providerEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Elevated Health Augusta <onboarding@resend.dev>",
        to: [providerEmail],
        cc: ["care@elevatedhealthaugusta.com"],
        reply_to: patientEmail,
        subject: `Referral Request for ${patientName} - ${benefitType.toUpperCase()}`,
        html: providerEmailHtml,
      }),
    });

    const providerResult = await providerEmailResponse.json();
    console.log("Provider email sent:", providerResult);

    // Send confirmation email to patient
    const patientEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Elevated Health Augusta <onboarding@resend.dev>",
        to: [patientEmail],
        reply_to: "care@elevatedhealthaugusta.com",
        subject: "Your Referral Request - Elevated Health Augusta",
        html: patientEmailHtml,
      }),
    });

    const patientResult = await patientEmailResponse.json();
    console.log("Patient confirmation email sent:", patientResult);

    // Trigger webhook if provided (for CRM integration)
    if (webhookUrl) {
      console.log("Triggering CRM webhook:", webhookUrl);
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            type: "referral_request",
            patient: {
              name: patientName,
              email: patientEmail,
              phone: patientPhone,
              benefitType,
            },
            provider: {
              name: providerName,
              email: providerEmail,
            },
            clinical: {
              diagnosis,
              priorTreatments,
            },
          }),
        });
        console.log("Webhook triggered successfully");
      } catch (webhookError) {
        console.error("Webhook error (non-blocking):", webhookError);
        // Don't fail the request if webhook fails
      }
    }

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
