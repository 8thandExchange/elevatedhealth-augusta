import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-METABOLIC-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const resendKey = Deno.env.get("RESEND_API_KEY");

    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { sessionId } = await req.json();
    logStep("Verifying session", { sessionId });

    if (!sessionId) throw new Error("Session ID is required");

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Session retrieved", { status: session.payment_status, metadata: session.metadata });

    if (session.payment_status === "paid") {
      const paymentId = session.metadata?.payment_id;
      const patientId = session.metadata?.patient_id;
      const patientName = session.metadata?.patient_name;
      const patientEmail = session.metadata?.patient_email;

      // Update payment record
      if (paymentId) {
        await supabase
          .from('metabolic_payments')
          .update({
            payment_status: 'paid',
            amount_paid: 59900,
            kit_status: 'ordered',
            stripe_payment_intent_id: session.payment_intent as string
          })
          .eq('id', paymentId);
        logStep("Payment record updated", { paymentId });
      }

      // Send notification email to admin
      if (resendKey) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${resendKey}`,
            },
            body: JSON.stringify({
              from: "Réveil <noreply@stripe.reveil.health>",
              to: ["booking@reveil.health"],
              subject: "🧬 New Metabolic Architecture Kit Ordered - $599",
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #C5A059;">New Metabolic Architecture Kit Order</h2>
                  <div style="background: #f9f9f7; padding: 20px; border-radius: 8px; border-left: 4px solid #C5A059;">
                    <p><strong>Patient:</strong> ${patientName || 'Unknown'}</p>
                    <p><strong>Email:</strong> ${patientEmail}</p>
                    <p><strong>Amount:</strong> $599.00</p>
                    <p><strong>Kit Type:</strong> ZRT Weight Management + Thyroid + Cardio Panel</p>
                  </div>
                  <p style="margin-top: 20px; color: #666;">
                    <strong>Action Required:</strong> Ship the Metabolic Architecture Kit to the patient.
                  </p>
                </div>
              `,
            }),
          });
          logStep("Admin notification email sent");
        } catch (emailError) {
          logStep("Email notification failed", emailError);
        }
      }

      return new Response(JSON.stringify({ verified: true, status: 'paid' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ verified: false, status: session.payment_status }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage, verified: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
