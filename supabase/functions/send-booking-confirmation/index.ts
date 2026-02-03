import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[BOOKING-CONFIRM] ${step}${detailsStr}`);
};

// Format phone number for Sinch (E.164 format)
function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (digits.length > 10) return `+${digits}`;
  throw new Error(`Invalid phone number format: ${phone}`);
}

// Send SMS via Sinch
async function sendSMS(to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const accessKey = Deno.env.get("SINCH_ACCESS_KEY");
  const secretKey = Deno.env.get("SINCH_SECRET_KEY");
  
  if (!accessKey || !secretKey) {
    logStep("Sinch credentials not configured - skipping SMS");
    return { success: false, error: "Sinch credentials not configured" };
  }

  const formattedPhone = formatPhoneNumber(to);
  logStep("Sending SMS", { to: formattedPhone });

  const url = "https://us.sms.api.sinch.com/xms/v1/" + accessKey + "/batches";
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ElevatedHealth",
        to: [formattedPhone],
        body: message,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      logStep("Sinch API error", { status: response.status, result });
      return { success: false, error: result.text || "Failed to send SMS" };
    }

    logStep("SMS sent successfully", { batchId: result.id });
    return { success: true, messageId: result.id };
  } catch (error) {
    logStep("SMS send error", { error: String(error) });
    return { success: false, error: String(error) };
  }
}

// Send email via Resend
async function sendEmail(to: string, name: string): Promise<{ success: boolean; error?: string }> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  
  if (!resendApiKey) {
    logStep("Resend API key not configured - skipping email");
    return { success: false, error: "Resend API key not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Elevated Health Augusta <noreply@stripe.elevatedhealthaugusta.com>",
        to: [to],
        subject: "Your Clinical Strategy Session is Confirmed!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
            <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="background-color: #f5f5f5;">
              <tr>
                <td style="padding: 40px 20px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #1a365d 0%, #2d5a87 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Booking Confirmed! ✓</h1>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="margin: 0 0 20px; font-size: 18px; color: #333333; line-height: 1.6;">
                          Hi ${name || 'there'},
                        </p>
                        <p style="margin: 0 0 20px; font-size: 16px; color: #555555; line-height: 1.8;">
                          Great news! Your <strong>Clinical Strategy Session</strong> has been scheduled with Elevated Health Augusta.
                        </p>
                        
                        <!-- Info Box -->
                        <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="margin: 30px 0; background-color: #f0f7ff; border-radius: 8px; border-left: 4px solid #c9a961;">
                          <tr>
                            <td style="padding: 20px;">
                              <p style="margin: 0 0 10px; font-size: 14px; color: #666666;">
                                <strong style="color: #1a365d;">What to Expect:</strong>
                              </p>
                              <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 14px; line-height: 1.8;">
                                <li>45-minute personalized consultation</li>
                                <li>Comprehensive health assessment</li>
                                <li>Custom treatment recommendations</li>
                                <li>Q&A with our clinical team</li>
                              </ul>
                            </td>
                          </tr>
                        </table>

                        <p style="margin: 20px 0; font-size: 16px; color: #555555; line-height: 1.8;">
                          Please arrive <strong>10 minutes early</strong> to complete any necessary paperwork. You'll receive a calendar reminder before your appointment.
                        </p>

                        <!-- CTA Button -->
                        <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="margin: 30px 0;">
                          <tr>
                            <td style="text-align: center;">
                              <a href="https://www.elevatedhealthaugusta.com" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #c9a961 0%, #d4b87a 100%); color: #1a365d; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                                Visit Our Website
                              </a>
                            </td>
                          </tr>
                        </table>

                        <p style="margin: 20px 0 0; font-size: 14px; color: #888888; line-height: 1.6;">
                          Need to reschedule? Call us at <a href="tel:+17067603470" style="color: #c9a961; text-decoration: none;">(706) 760-3470</a>
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9f9f9; padding: 25px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                        <p style="margin: 0 0 10px; font-size: 14px; color: #666666;">
                          <strong>Elevated Health Augusta</strong>
                        </p>
                        <p style="margin: 0; font-size: 12px; color: #999999;">
                          7013 Evans Town Center Blvd, Suite 203 • Evans, GA 30809<br>
                          <a href="tel:+17067603470" style="color: #c9a961; text-decoration: none;">(706) 760-3470</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      logStep("Resend API error", { status: response.status, result });
      return { success: false, error: result.message || "Failed to send email" };
    }

    logStep("Email sent successfully", { id: result.id });
    return { success: true };
  } catch (error) {
    logStep("Email send error", { error: String(error) });
    return { success: false, error: String(error) };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const body = await req.json();
    const { 
      name,
      email,
      phone,
      source = "portal"
    } = body;

    logStep("Request received", { name, email, phone: phone ? "provided" : "none", source });

    const results = {
      email: { success: false, error: null as string | null },
      sms: { success: false, error: null as string | null },
    };

    // Send confirmation email if email provided
    if (email) {
      const emailResult = await sendEmail(email, name);
      results.email = { success: emailResult.success, error: emailResult.error || null };
    } else {
      results.email = { success: false, error: "No email provided" };
    }

    // Send confirmation SMS if phone provided
    if (phone) {
      const smsMessage = 
        `Hi ${name || 'there'}! Your Clinical Strategy Session with Elevated Health Augusta is confirmed. ` +
        `Please arrive 10 min early. Need to reschedule? Call (706) 760-3470. See you soon!`;
      
      const smsResult = await sendSMS(phone, smsMessage);
      results.sms = { success: smsResult.success, error: smsResult.error || null };
    } else {
      results.sms = { success: false, error: "No phone provided" };
    }

    const overallSuccess = results.email.success || results.sms.success;
    logStep("Complete", { emailSent: results.email.success, smsSent: results.sms.success });

    return new Response(JSON.stringify({
      success: overallSuccess,
      results,
    }), {
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
