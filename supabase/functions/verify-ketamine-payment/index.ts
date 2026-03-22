import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-KETAMINE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const { session_id } = await req.json();
    
    if (!session_id) {
      throw new Error("No session_id provided");
    }
    logStep("Session ID received", { session_id });

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    logStep("Session retrieved", { 
      status: session.payment_status,
      customer_email: session.customer_details?.email 
    });

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ success: false, message: "Payment not completed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const customerEmail = session.customer_details?.email || session.customer_email;
    const customerName = session.customer_details?.name || "New Patient";
    
    logStep("Payment verified", { customerEmail, customerName });

    // Send notification email to clinic
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      const resend = new Resend(resendKey);
      
      try {
        await resend.emails.send({
          from: "Réveil <noreply@stripe.reveil.health>",
          to: ["booking@reveil.health"],
          subject: `🧠 New Ketamine Patient: ${customerName} Has Paid`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2C3E50; font-size: 24px; margin: 0;">New Ketamine Patient Registration</h1>
              </div>
              
              <div style="background: #f8f9fa; border-left: 4px solid #C5A059; padding: 20px; margin-bottom: 30px;">
                <h2 style="color: #2C3E50; margin: 0 0 10px 0; font-size: 18px;">ACTION REQUIRED</h2>
                <p style="color: #666; margin: 0; font-size: 16px;">
                  Please create their chart in Osmind and send the intake invitation.
                </p>
              </div>
              
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Patient Name</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #2C3E50; font-weight: bold;">${customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Email</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #2C3E50;">${customerEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Service</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #2C3E50;">Ketamine Therapy</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666;">Payment Status</td>
                  <td style="padding: 10px 0; color: #22c55e; font-weight: bold;">✓ Deposit Paid</td>
                </tr>
              </table>
              
              <div style="background: #2C3E50; color: white; padding: 20px; border-radius: 8px; text-align: center;">
                <p style="margin: 0 0 15px 0; font-size: 14px;">Next Steps:</p>
                <ol style="text-align: left; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                  <li>Log into Osmind</li>
                  <li>Create new patient chart for ${customerName}</li>
                  <li>Send intake invitation to ${customerEmail}</li>
                </ol>
              </div>
              
              <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
                This is an automated notification from Réveil.
              </p>
            </div>
          `,
        });
        logStep("Notification email sent to clinic");
      } catch (emailError) {
        logStep("Failed to send notification email", { error: emailError });
        // Continue anyway - payment was successful
      }
    } else {
      logStep("RESEND_API_KEY not configured, skipping notification email");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        email: customerEmail,
        name: customerName 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ success: false, message: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
