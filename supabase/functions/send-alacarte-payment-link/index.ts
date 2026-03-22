import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-ALACARTE-PAYMENT-LINK] ${step}${detailsStr}`);
};

interface PaymentLinkRequest {
  patient_email: string;
  patient_name: string;
  payment_url: string;
  product_name: string;
  amount: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { patient_email, patient_name, payment_url, product_name, amount }: PaymentLinkRequest = await req.json();

    logStep("Request data", { patient_email, patient_name, product_name, amount });

    if (!patient_email || !payment_url) {
      throw new Error("Patient email and payment URL are required");
    }

    const firstName = patient_name?.split(" ")[0] || "there";

    const emailResponse = await resend.emails.send({
      from: "Réveil <noreply@stripe.reveil.health>",
      to: [patient_email],
      subject: `Your ${product_name} Payment Link - Réveil`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #c5a572; font-size: 28px; font-family: Georgia, serif; margin: 0;">Réveil</h1>
                <p style="color: #ffffff; font-size: 14px; margin: 10px 0 0 0; opacity: 0.9;">Personalized Wellness Solutions</p>
              </td>
            </tr>
            
            <!-- Main Content -->
            <tr>
              <td style="padding: 40px 30px;">
                <h2 style="color: #1a1a2e; font-size: 24px; margin: 0 0 20px 0; font-family: Georgia, serif;">
                  Hi ${firstName},
                </h2>
                
                <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  Your provider has prepared a payment link for your <strong>${product_name}</strong> order.
                </p>
                
                <!-- Order Summary Box -->
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; border-radius: 8px; margin: 30px 0;">
                  <tr>
                    <td style="padding: 25px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color: #666; font-size: 14px; padding-bottom: 10px;">Order Details</td>
                        </tr>
                        <tr>
                          <td>
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="color: #1a1a2e; font-size: 16px; font-weight: 600;">${product_name}</td>
                                <td style="color: #c5a572; font-size: 20px; font-weight: bold; text-align: right;">${amount}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                
                <!-- CTA Button -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                  <tr>
                    <td style="text-align: center;">
                      <a href="${payment_url}" style="display: inline-block; background: linear-gradient(135deg, #c5a572 0%, #b8956a 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 15px rgba(197, 165, 114, 0.3);">
                        Complete Payment →
                      </a>
                    </td>
                  </tr>
                </table>
                
                <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
                  This link is unique to your order and expires in 24 hours.
                </p>
                
                <!-- Membership Upsell - Only show for non-membership purchases -->
                ${!product_name.toLowerCase().includes('membership') && !product_name.toLowerCase().includes('access') && !product_name.toLowerCase().includes('vitality') && !product_name.toLowerCase().includes('concierge') ? `
                <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #fff8e8 0%, #fef3dc 100%); border-radius: 8px; margin: 30px 0; border: 1px solid #c5a572;">
                  <tr>
                    <td style="padding: 25px;">
                      <h3 style="color: #b8956a; font-size: 16px; margin: 0 0 10px 0; font-family: Georgia, serif;">💡 Save with a Membership</h3>
                      <p style="color: #4a4a4a; font-size: 14px; line-height: 1.5; margin: 0;">
                        Membership plans start at <strong>$99/month</strong> and include exclusive member pricing on treatments, labs, and more. Ask your provider about options!
                      </p>
                    </td>
                  </tr>
                </table>
                ` : ''}
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #1a1a2e; padding: 30px; text-align: center;">
                <p style="color: #ffffff; font-size: 14px; margin: 0 0 10px 0;">
                  Questions? Call us at <a href="tel:+17064267383" style="color: #c5a572;">(706) 426-7383</a>
                </p>
                <p style="color: #888; font-size: 12px; margin: 0;">
                  Réveil | 7013 Evans Town Center Blvd, Evans, GA 30809
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    logStep("Email sent successfully", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
