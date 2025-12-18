import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@4.1.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-KIT-PAYMENT-LINK] ${step}${detailsStr}`);
};

// Kit pricing configuration
const KIT_TIERS = {
  hormone: {
    name: "Hormone Mapping Kit",
    fullPrice: 29900, // $299 in cents
    creditPrice: 20000, // $200 after $99 credit
    description: "At-home Saliva Profile III test kit + lab review consultation",
    priceId: "price_1SZiRMEOtKRY99pua6QMu12h",
  },
  metabolic: {
    name: "Metabolic Mapping Kit",
    fullPrice: 39900, // $399 in cents
    creditPrice: 30000, // $300 after $99 credit
    description: "At-home Weight Management Panel test kit + lab review consultation",
    priceId: "price_1Sa4bNEOtKRY99pulS73hT1V",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!resendKey) throw new Error("RESEND_API_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { patientId, patientName, patientEmail, kitType, creditCode } = await req.json();
    logStep("Request received", { patientId, patientName, patientEmail, kitType, creditCode });

    if (!patientEmail) throw new Error("Patient email is required");
    if (!kitType || !KIT_TIERS[kitType as keyof typeof KIT_TIERS]) {
      throw new Error("Invalid kit type");
    }

    const kit = KIT_TIERS[kitType as keyof typeof KIT_TIERS];
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const resend = new Resend(resendKey);

    // Check if credit code is valid
    let validCreditCode = false;
    if (creditCode) {
      const { data: creditRecord } = await supabaseClient
        .from("consultation_bookings")
        .select("id, credit_used_at")
        .eq("credit_code", creditCode)
        .is("credit_used_at", null)
        .maybeSingle();
      
      if (creditRecord) {
        validCreditCode = true;
        logStep("Valid credit code found", { creditCode });
      }
    }

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: patientEmail, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    }

    // Calculate price
    const finalAmount = validCreditCode ? kit.creditPrice : kit.fullPrice;
    const discountText = validCreditCode ? " ($99 consultation credit applied)" : "";

    // Create checkout session with price_data to support discounts
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : patientEmail,
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: `${kit.name}${discountText}`,
            description: kit.description,
          },
          unit_amount: finalAmount,
        },
        quantity: 1,
      }],
      mode: "payment",
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      success_url: `https://elevatedhealthaugusta.com/schedule-consult?kit_payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://elevatedhealthaugusta.com/patient/dashboard?kit_payment=cancelled`,
      metadata: {
        patient_id: patientId || "",
        patient_email: patientEmail,
        kit_type: kitType,
        credit_code: validCreditCode ? creditCode : "",
        sent_by_provider: "true",
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // Send email to patient
    const formattedPrice = (finalAmount / 100).toFixed(0);
    const originalPrice = (kit.fullPrice / 100).toFixed(0);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a3a4a;">Your Diagnostic Kit is Ready</h2>
        <p>Hi ${patientName || 'there'},</p>
        <p>Your provider at Elevated Health Augusta has selected a diagnostic kit for you:</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1a3a4a;">${kit.name}</h3>
          <p style="margin: 0 0 15px 0; color: #666;">${kit.description}</p>
          ${validCreditCode ? `
            <p style="margin: 0; color: #666;">
              <span style="text-decoration: line-through;">$${originalPrice}</span>
              <strong style="color: #28a745; font-size: 18px; margin-left: 10px;">$${formattedPrice}</strong>
              <span style="color: #28a745; font-size: 12px;"> (credit applied)</span>
            </p>
          ` : `
            <p style="margin: 0;"><strong style="font-size: 18px; color: #1a3a4a;">$${formattedPrice}</strong></p>
          `}
        </div>
        <a href="${session.url}" style="display: inline-block; background-color: #C5A059; color: white; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: bold;">
          Complete Your Payment
        </a>
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          After payment, your kit will ship within 3-5 business days. You'll receive instructions for the at-home collection process.
        </p>
        <p style="color: #666; font-size: 14px;">
          Questions? Reply to this email or call us at (706) 854-3128.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          Elevated Health Augusta | 1257 Augusta West Pkwy, Augusta, GA 30909
        </p>
      </div>
    `;

    await resend.emails.send({
      from: "Elevated Health <noreply@stripe.elevatedhealthaugusta.com>",
      to: [patientEmail],
      subject: `Your ${kit.name} is Ready - Complete Payment`,
      html: emailHtml,
    });

    logStep("Email sent to patient", { patientEmail });

    // Track kit link sent in patient record
    if (patientId) {
      await supabaseClient
        .from("patients")
        .update({ 
          onboarding_status: "kit_link_sent",
          updated_at: new Date().toISOString(),
        })
        .eq("id", patientId);
      logStep("Patient status updated to kit_link_sent");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        paymentLink: session.url,
        sessionId: session.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
