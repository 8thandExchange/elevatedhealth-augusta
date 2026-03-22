import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-SAFETY-CALLBACK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY is not set");

    const { patient_name, patient_email, patient_phone, safety_flags, preferred_time } = await req.json();

    if (!patient_name) {
      throw new Error("patient_name is required");
    }

    logStep("Request received", { patient_name, patient_email, patient_phone, safety_flags });

    const resend = new Resend(resendKey);

    // Email to the clinic team
    const clinicEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #2C3E50; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">
      🔔 Priority Callback Request
    </h2>
    
    <div style="background: #fef3f2; border-left: 4px solid #e74c3c; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #991b1b;"><strong>Safety Flag Patient</strong> has requested an expedited callback.</p>
    </div>
    
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 140px;">Patient Name:</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${patient_name}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${patient_email || 'Not provided'}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${patient_phone || 'Not provided'}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Preferred Time:</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${preferred_time || 'Any time'}</td>
      </tr>
      <tr>
        <td style="padding: 10px; font-weight: bold; vertical-align: top;">Safety Flags:</td>
        <td style="padding: 10px;">
          ${safety_flags && safety_flags.length > 0 
            ? safety_flags.map((f: string) => `<span style="display: inline-block; background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 4px; margin: 2px; font-size: 13px;">${f}</span>`).join('')
            : '<span style="color: #666;">None specified</span>'
          }
        </td>
      </tr>
    </table>
    
    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      This patient has been flagged for manual review and is requesting contact.
      Please reach out within 24-48 hours.
    </p>
  </div>
</body>
</html>
`;

    // Send to clinic
    await resend.emails.send({
      from: "Réveil <noreply@stripe.reveil.health>",
      to: ["booking@reveil.health"],
      subject: `Priority Callback Request: ${patient_name}`,
      html: clinicEmailHtml,
    });

    logStep("Clinic notification sent");

    // Confirmation email to patient if we have their email
    if (patient_email) {
      const patientEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <div style="background: linear-gradient(135deg, #2C3E50 0%, #3d5166 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 300;">Callback Request Received</h1>
      </div>
      
      <div style="padding: 30px;">
        <p style="color: #2C3E50; font-size: 16px;">Dear ${patient_name},</p>
        
        <p style="color: #4a5568; font-size: 15px;">
          Thank you for requesting a callback. We've received your request and a member of our care team 
          will reach out to you within <strong>24-48 hours</strong>.
        </p>
        
        <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="color: #166534; margin: 0; font-size: 14px;">
            <strong>Your safety is our priority.</strong> We want to ensure we create a treatment plan 
            that's both effective and safe for your unique health situation.
          </p>
        </div>
        
        <p style="color: #4a5568; font-size: 15px;">
          If you need immediate assistance, please call us directly at <strong>(706) 760-3470</strong>.
        </p>
        
        <p style="color: #4a5568; font-size: 15px; margin-top: 30px;">
          Warmly,<br>
          <strong style="color: #2C3E50;">The Réveil Team</strong>
        </p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #718096; font-size: 13px; margin: 0;">
          Réveil<br>
          7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

      await resend.emails.send({
        from: "Réveil <noreply@stripe.reveil.health>",
        to: [patient_email],
        subject: "Your Callback Request Has Been Received",
        html: patientEmailHtml,
      });

      logStep("Patient confirmation sent");
    }

    return new Response(JSON.stringify({ success: true }), {
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
