import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HormoneAddonRequest {
  patient_id: string;
  patient_name: string;
  patient_email: string;
  first_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("[HORMONE-ADDON-ACTIVATION] Function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { patient_id, patient_name, patient_email, first_name }: HormoneAddonRequest = await req.json();
    
    console.log("[HORMONE-ADDON-ACTIVATION] Processing request for:", { patient_id, patient_email });

    if (!patient_email) {
      throw new Error("Patient email is required");
    }

    const firstName = first_name || patient_name?.split(" ")[0] || "there";

    // Create Supabase client for checkout URL generation
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    
    // Generate checkout link (this will be a direct link to the edge function)
    const checkoutUrl = `${supabaseUrl}/functions/v1/create-hormone-addon-checkout?patient_id=${patient_id}`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8f7f5; font-family: 'Georgia', serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f7f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2d3436 0%, #1a1a1a 100%); padding: 30px; text-align: center;">
              <h1 style="color: #c9a84c; margin: 0; font-size: 28px; font-weight: 400; letter-spacing: 2px;">
                ELEVATED HEALTH
              </h1>
              <p style="color: #a0a0a0; margin: 8px 0 0; font-size: 12px; letter-spacing: 3px;">
                AUGUSTA
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #2d3436; margin: 0 0 20px; font-size: 24px; font-weight: 400;">
                Add Hormone Optimization to Your Weight Loss Journey
              </h2>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Hi ${firstName},
              </p>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                As an active GLP-1 member, you qualify for our <strong>exclusive $149/month Hormone Add-On</strong>—designed to work synergistically with your weight loss medication for optimal results.
              </p>
              
              <div style="background-color: #f8f7f5; border-left: 4px solid #c9a84c; padding: 20px; margin: 25px 0;">
                <h3 style="color: #2d3436; margin: 0 0 12px; font-size: 18px; font-weight: 500;">
                  What's Included:
                </h3>
                <ul style="color: #4a5568; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li><strong>Bi-Est Cream</strong> – Estrogen balance (if needed)</li>
                  <li><strong>Testosterone</strong> – Energy, mood, and muscle preservation</li>
                  <li><strong>Progesterone</strong> – Sleep and stress support (if needed)</li>
                  <li>Ongoing provider monitoring</li>
                  <li>Monthly medication shipped to your door</li>
                </ul>
              </div>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
                Adding hormone optimization while on GLP-1 therapy can help preserve lean muscle mass, boost energy, and enhance your overall results.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 10px 0 30px;">
                    <a href="${checkoutUrl}" 
                       style="display: inline-block; background: linear-gradient(135deg, #c9a84c 0%, #b8963d 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: 500; letter-spacing: 1px;">
                      ADD HORMONES — $149/mo
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 0; text-align: center;">
                Questions? Call us at <a href="tel:+17064267383" style="color: #c9a84c;">(706) 426-7383</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #2d3436; padding: 25px; text-align: center;">
              <p style="color: #a0a0a0; font-size: 12px; margin: 0 0 8px;">
                Réveil
              </p>
              <p style="color: #a0a0a0; font-size: 12px; margin: 0;">
                7013 Evans Town Center Blvd, Suite 203 · Evans, GA 30809
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Réveil <noreply@stripe.reveil.health>",
      to: [patient_email],
      subject: "Add Hormone Optimization to Your Weight Loss Journey",
      html: emailHtml,
    });

    console.log("[HORMONE-ADDON-ACTIVATION] Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: (emailResponse as any).id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("[HORMONE-ADDON-ACTIVATION] Error:", error);
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
