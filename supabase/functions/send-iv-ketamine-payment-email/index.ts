import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SEND-IV-KETAMINE-EMAIL] ${step}${detailsStr}`);
};

interface IVKetamineEmailRequest {
  patient_name: string;
  patient_email: string;
  session_number: number;
  payment_url: string;
  amount?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { patient_name, patient_email, session_number, payment_url, amount = 400 }: IVKetamineEmailRequest = await req.json();

    if (!patient_email || !payment_url) {
      throw new Error("Missing required fields: patient_email and payment_url");
    }

    logStep("Sending IV Ketamine payment email", { patient_email, session_number });

    const resend = new Resend(resendApiKey);

    const emailResponse = await resend.emails.send({
      from: "Elevated Health <noreply@stripe.elevatedhealthaugusta.com>",
      to: [patient_email],
      subject: `Your IV Ketamine Infusion Payment - Session #${session_number}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <div style="padding: 40px 40px 20px; text-align: center;">
                <h1 style="color: #d4af37; margin: 0; font-size: 28px; font-weight: 600;">Elevated Health Augusta</h1>
                <p style="color: #a0a0a0; margin: 10px 0 0; font-size: 14px;">IV Ketamine Therapy</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 20px 40px 40px;">
                <p style="color: #ffffff; font-size: 18px; margin: 0 0 20px;">Hi ${patient_name || "there"},</p>
                
                <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                  Your IV Ketamine Infusion <strong style="color: #d4af37;">Session #${session_number}</strong> is ready to be scheduled. Please complete payment to book your appointment.
                </p>
                
                <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
                  <p style="color: #a0a0a0; font-size: 14px; margin: 0 0 8px;">Session Total</p>
                  <p style="color: #d4af37; font-size: 36px; font-weight: 700; margin: 0;">$${amount}</p>
                </div>
                
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${payment_url}" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #c9a227 100%); color: #1a1a2e; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);">
                    Complete Payment & Schedule
                  </a>
                </div>
                
                <p style="color: #a0a0a0; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
                  After payment, you'll be able to select your preferred appointment time. If you have any questions, please call us at <strong style="color: #ffffff;">(706) 760-3470</strong>.
                </p>
              </div>
              
              <!-- Footer -->
              <div style="background: rgba(0, 0, 0, 0.2); padding: 24px 40px; text-align: center;">
                <p style="color: #a0a0a0; font-size: 12px; margin: 0;">
                  Elevated Health Augusta<br>
                  4182 Washington Rd, Evans, GA 30809
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    logStep("Email sent successfully", { response: emailResponse });

    return new Response(
      JSON.stringify({ success: true, response: emailResponse }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
