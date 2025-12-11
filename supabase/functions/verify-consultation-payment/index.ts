import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-CONSULTATION-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { session_id, credit_code } = await req.json();
    if (!session_id) {
      throw new Error("session_id is required");
    }
    logStep("Session ID received", { session_id, credit_code });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const resend = resendKey ? new Resend(resendKey) : null;

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    logStep("Session retrieved", { 
      status: session.payment_status, 
      email: session.customer_email,
      metadata: session.metadata 
    });

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Payment not completed" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const customerEmail = session.customer_email || session.customer_details?.email;
    const creditCode = credit_code || session.metadata?.credit_code;
    const serviceType = session.metadata?.service_type || "hormone";

    if (!customerEmail) {
      throw new Error("Customer email not found in session");
    }

    // Check if already recorded
    const { data: existing } = await supabaseClient
      .from("consultation_bookings")
      .select("id")
      .eq("stripe_session_id", session_id)
      .maybeSingle();

    if (existing) {
      logStep("Payment already recorded", { existingId: existing.id });
      return new Response(JSON.stringify({ 
        success: true, 
        already_recorded: true,
        credit_code: creditCode 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Record the consultation booking
    const { data: booking, error: insertError } = await supabaseClient
      .from("consultation_bookings")
      .insert({
        customer_email: customerEmail,
        customer_name: session.customer_details?.name || null,
        stripe_session_id: session_id,
        stripe_payment_intent_id: session.payment_intent as string,
        amount_paid: session.amount_total ? session.amount_total / 100 : 99,
        status: "pending",
        credit_code: creditCode,
        service_type: serviceType,
      })
      .select()
      .single();

    if (insertError) {
      logStep("Insert error", { error: insertError });
      throw insertError;
    }

    logStep("Consultation booking recorded", { bookingId: booking.id, creditCode });

    // Send admin notification
    if (resend) {
      try {
        await resend.emails.send({
          from: "Elevated Health <noreply@stripe.elevatedhealthaugusta.com>",
          to: ["booking@elevatedhealthaugusta.com"],
          subject: `New $99 Discovery Consultation Booked`,
          html: `
            <h2>New Discovery Consultation Payment</h2>
            <p><strong>Customer:</strong> ${customerEmail}</p>
            <p><strong>Name:</strong> ${session.customer_details?.name || "Not provided"}</p>
            <p><strong>Service Type:</strong> ${serviceType}</p>
            <p><strong>Credit Code:</strong> ${creditCode}</p>
            <p><strong>Amount:</strong> $${(session.amount_total || 0) / 100}</p>
            <hr/>
            <p>The patient has been instructed to book their consultation via Google Calendar.</p>
            <p>Their credit code <strong>${creditCode}</strong> can be used for $99 off Hormone Mapping ($299 → $200).</p>
          `,
        });
        logStep("Admin notification sent");
      } catch (emailError) {
        logStep("Email notification failed", { error: emailError });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      booking_id: booking.id,
      credit_code: creditCode 
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
