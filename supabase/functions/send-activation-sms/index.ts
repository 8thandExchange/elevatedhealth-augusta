import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-ACTIVATION] ${step}${detailsStr}`);
};

// Stripe price IDs for memberships and add-ons
const PRICE_IDS = {
  // Base memberships
  metabolic: "price_1SZiXTEOtKRY99puR7PQUExU", // $399/mo Metabolic Membership
  vitality: "price_1SZickEOtKRY99pu7j2PtWZm", // $199/mo Vitality Membership
  // Hormone add-on tiers
  tier1: "price_1SZijiEOtKRY99puzJbPH0H0", // $75/mo Tier 1 - Single Hormone
  tier2: "price_1SZj9tEOtKRY99pujZd5xMd9", // $125/mo Tier 2 - Dual Hormone
  tier3: "price_1SZjAAEOtKRY99puFwqI2CTV", // $175/mo Tier 3 - Trifecta
};

const BASE_PRICES: Record<string, number> = {
  metabolic: 399,
  vitality: 199,
};

const ADDON_PRICES: Record<string, number> = {
  none: 0,
  tier1: 75,
  tier2: 125,
  tier3: 175,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    logStep("Resend key check", { hasKey: !!resendKey });

    const body = await req.json();
    const { 
      first_name, 
      phone, 
      base_membership = "metabolic", 
      addon_tier = "none",
      patient_email,
      send_email = false,
      send_sms = false,
    } = body;

    logStep("Request body received", { first_name, phone, base_membership, addon_tier, patient_email, send_email, send_sms });

    if (!first_name) {
      throw new Error("Missing required field: first_name is required");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Build line items based on selected membership and tier
    const lineItems: Array<{ price: string; quantity: number }> = [];

    // Add base membership
    const basePriceId = PRICE_IDS[base_membership as keyof typeof PRICE_IDS];
    if (!basePriceId) {
      throw new Error(`Invalid base membership: ${base_membership}`);
    }
    lineItems.push({ price: basePriceId, quantity: 1 });
    logStep("Added base membership", { base_membership, price_id: basePriceId });

    // Add hormone add-on tier if selected (not "none")
    if (addon_tier && addon_tier !== "none") {
      const addonPriceId = PRICE_IDS[addon_tier as keyof typeof PRICE_IDS];
      if (addonPriceId) {
        lineItems.push({ price: addonPriceId, quantity: 1 });
        logStep("Added hormone addon tier", { addon_tier, price_id: addonPriceId });
      }
    }

    // Calculate total for email
    const basePrice = BASE_PRICES[base_membership] || 399;
    const addonPrice = ADDON_PRICES[addon_tier] || 0;
    const totalMonthly = basePrice + addonPrice;

    // Create Stripe Checkout session for subscription
    const origin = req.headers.get("origin") || "https://elevatedhealthaugusta.com";
    
    const session = await stripe.checkout.sessions.create({
      customer_email: patient_email || undefined,
      line_items: lineItems,
      mode: "subscription",
      success_url: `${origin}/patient/dashboard?subscription=activated`,
      cancel_url: `${origin}/`,
      metadata: {
        first_name,
        phone: phone || "",
        base_membership,
        addon_tier,
      },
    });

    logStep("Stripe Checkout session created", { sessionId: session.id, url: session.url });

    const paymentLink = session.url;
    let emailSent = false;
    let smsSent = false;

    // Send email if requested and we have the email
    if (send_email && patient_email && resendKey) {
      try {
        const resend = new Resend(resendKey);
        
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2C3E50; }
              .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 24px; font-weight: bold; color: #2C3E50; }
              .content { background: #f8f9fa; border-radius: 12px; padding: 30px; margin-bottom: 30px; }
              .cta-button { display: inline-block; background: #2C3E50; color: white !important; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; margin: 20px 0; }
              .price { font-size: 28px; font-weight: bold; color: #2C3E50; }
              .footer { text-align: center; color: #7F8C8D; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">Elevated Health Augusta</div>
              </div>
              <div class="content">
                <h2>Hi ${first_name},</h2>
                <p>Great news! Lauren has reviewed and approved your hormone protocol.</p>
                <p>Your personalized membership is ready to activate:</p>
                <p class="price">$${totalMonthly}/month</p>
                <p>Click the secure button below to activate your membership and finalize your pharmacy order:</p>
                <div style="text-align: center;">
                  <a href="${paymentLink}" class="cta-button">Activate My Membership</a>
                </div>
                <p style="font-size: 14px; color: #7F8C8D;">If the button doesn't work, copy and paste this link into your browser:<br/>${paymentLink}</p>
              </div>
              <div class="footer">
                <p>Questions? Reply to this email or call us at (706) 710-2704</p>
                <p>Elevated Health Augusta<br/>3540 Wheeler Road, Suite 601<br/>Augusta, GA 30909</p>
              </div>
            </div>
          </body>
          </html>
        `;

        const emailResponse = await resend.emails.send({
          from: "Elevated Health <onboarding@resend.dev>",
          to: [patient_email],
          subject: "Elevated Health: Your Membership is Ready to Activate",
          html: emailHtml,
        });

        logStep("Email sent successfully", { emailResponse });
        emailSent = true;
      } catch (emailError) {
        logStep("Email send error", { error: String(emailError) });
        // Don't throw - we still want to return the link
      }
    }

    // Send SMS via HighLevel if requested and we have phone
    if (send_sms && phone) {
      try {
        const highlevelWebhookUrl = "https://services.leadconnectorhq.com/hooks/BVEhP40JNHGLuGnXGCNh/webhook-trigger/e2d20f12-bc22-4a47-ab75-7a39ac44f03b";
        
        const smsMessage = `Hi ${first_name}! Your Elevated Health membership is approved. Activate here: ${paymentLink}`;
        
        const smsResponse = await fetch(highlevelWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: phone,
            message: smsMessage,
            first_name: first_name,
            payment_link: paymentLink,
            total_monthly: totalMonthly,
          }),
        });

        logStep("HighLevel webhook response", { status: smsResponse.status });
        smsSent = smsResponse.ok;
      } catch (smsError) {
        logStep("SMS send error", { error: String(smsError) });
        // Don't throw - we still want to return the link
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      payment_link: paymentLink,
      email_sent: emailSent,
      sms_sent: smsSent,
      message: "Activation link generated successfully."
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
