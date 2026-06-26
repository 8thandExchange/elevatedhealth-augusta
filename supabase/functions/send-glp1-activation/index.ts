import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SEND-GLP1-ACTIVATION] ${step}${detailsStr}`);
};

interface GLP1ActivationRequest {
  patient_name: string;
  patient_email: string;
  medication_type: "semaglutide" | "tirzepatide";
  payment_link?: string;
  include_hormone_addon?: boolean;
  patient_id?: string;
  // Deprecated: legacy concierge/vitality tiers are discontinued. Accepted for
  // backward compatibility but no longer affects pricing.
  hormone_membership_tier?: "access" | "vitality" | "concierge" | null;
}

// ELEVATED GLP-1 program pricing (all-inclusive monthly). Source of truth:
// docs/pricing/pricing_source_of_truth.md + stripeConfig ELEVATED_PROGRAMS /
// GLP1_PROGRAM_VARIANTS. Member benefit is 20% off à la carte at checkout — it
// does NOT discount the program membership price (the medication is already
// included). No legacy concierge/vitality tier discounts.
const PRICING = {
  semaglutide: { price: "$349", amount: 349 },
  tirzepatide: { price: "$449", amount: 449 },
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { 
      patient_name, 
      patient_email, 
      medication_type, 
      payment_link,
      include_hormone_addon,
      patient_id,
      hormone_membership_tier,
    }: GLP1ActivationRequest = await req.json();

    logStep("Request received", { patient_name, patient_email, medication_type, patient_id, hormone_membership_tier });

    const firstName = patient_name.split(' ')[0];
    const activationLink = payment_link || "https://elevatedhealthaugusta.com/consult";
    
    const isSemaglutide = medication_type === "semaglutide";
    const medicationName = isSemaglutide ? "Semaglutide" : "Tirzepatide";
    
    // ELEVATED GLP-1 program price (all-inclusive). No legacy tier discounts.
    const medPricing = PRICING[medication_type];
    const monthlyPrice = medPricing.price;
    const discountBadge = "";

    const hormoneAddonAmount = include_hormone_addon ? 149 : 0;
    const totalWithAddon = `$${medPricing.amount + hormoneAddonAmount}`;

    const hormoneAddonSection = include_hormone_addon ? `
      <div style="background: #FDF8E7; border-radius: 8px; padding: 16px; margin-top: 16px; border: 1px solid #D4A017;">
        <p style="color: #2C3E50; font-size: 14px; margin: 0;">
          <strong>+ Hormone Add-On:</strong> $149/mo (men's TRT) or $129/mo (women's HRT)<br>
          <span style="color: #5D6D7E;">Includes bioidentical hormone therapy optimized for weight loss</span>
        </p>
        <p style="color: #D4A017; font-size: 16px; font-weight: 600; margin: 8px 0 0 0;">
          Total: ${totalWithAddon}/month
        </p>
      </div>
    ` : '';

    const emailResponse = await resend.emails.send({
      from: "Elevated Health Augusta <noreply@elevatedhealthaugusta.com>",
      to: [patient_email],
      subject: `Your ${medicationName} Weight Loss Program is Ready`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #F9F9F7;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="font-family: Georgia, serif; font-size: 28px; color: #2C3E50; margin: 0;">
                Elevated Health Augusta
              </h1>
              <p style="color: #D4A017; font-size: 14px; margin-top: 8px; letter-spacing: 2px;">
                MEDICAL WEIGHT LOSS
              </p>
            </div>

            <!-- Main Content -->
            <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #E5E5E5;">
              <h2 style="font-family: Georgia, serif; font-size: 24px; color: #2C3E50; margin: 0 0 16px 0;">
                Exciting News, ${firstName}!
              </h2>
              
              <p style="color: #5D6D7E; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Your medical provider has approved you for our ${medicationName} weight loss program. This FDA-approved medication helps patients lose 15-25% of their body weight when combined with lifestyle changes.
              </p>

              <div style="background: linear-gradient(135deg, #F9F9F7 0%, #EEF2F6 100%); border-radius: 8px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #D4A017;">
                ${discountBadge ? `<div style="margin-bottom: 12px;">${discountBadge}</div>` : ''}
                <h3 style="font-family: Georgia, serif; font-size: 18px; color: #2C3E50; margin: 0 0 12px 0;">
                  ${medicationName} Membership - ${monthlyPrice}/month
                </h3>
                <ul style="color: #5D6D7E; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Weekly ${medicationName} injections (included)</li>
                  <li>Provider-supervised dose titration</li>
                  <li>Monthly check-ins & weigh-ins</li>
                  <li>Direct messaging with your care team</li>
                  <li>Nutrition guidance & support</li>
                </ul>
                ${hormoneAddonSection}
              </div>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${activationLink}" 
                   style="display: inline-block; background: #D4A017; color: white; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(212, 160, 23, 0.3);">
                  Start My Weight Loss Journey →
                </a>
              </div>

              <div style="border-top: 1px solid #E5E5E5; padding-top: 24px;">
                <h4 style="font-size: 14px; color: #2C3E50; margin: 0 0 12px 0;">What to Expect:</h4>
                <ol style="color: #5D6D7E; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Click the button above to activate your membership</li>
                  <li>Your starter kit ships within 24-48 hours</li>
                  <li>Begin with a low dose, gradually increasing</li>
                  <li>Most patients see results within 4-6 weeks</li>
                  <li>Average weight loss: 1-2 lbs per week</li>
                </ol>
              </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 32px; color: #8E9EAB; font-size: 12px;">
              <p style="margin: 0 0 8px 0;">
                <strong>Elevated Health Augusta</strong><br>
                7013 Evans Town Center Blvd, Suite 203<br>
                Evans, GA 30809
              </p>
              <p style="margin: 0;">
                Questions? Call us at <a href="tel:7067603470" style="color: #D4A017; text-decoration: none;">(706) 760-3470</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    logStep("Email sent successfully", { emailId: emailResponse.data?.id });

    // Log to communication_logs if patient_id provided
    if (patient_id) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        await supabase.from("communication_logs").insert({
          patient_id,
          template_key: "glp1_activation",
          subject: `Your ${medicationName} Weight Loss Program is Ready`,
          body_preview: `${medicationName} activation email sent to ${patient_email}${include_hormone_addon ? ' (with hormone addon)' : ''}${hormone_membership_tier ? ` - ${hormone_membership_tier.toUpperCase()} discount` : ''}`,
          delivery_method: "email",
          status: "sent",
        });
        logStep("Communication logged");
      } catch (logError) {
        logStep("Failed to log communication", { error: logError });
      }
    }

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);