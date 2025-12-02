import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    logStep("ERROR", { message: "No stripe-signature header" });
    return new Response("No signature", { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
    );
    logStep("Event received", { type: event.type, id: event.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logStep("Webhook signature verification failed", { message });
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  // Handle checkout.session.completed for subscription payments
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    logStep("Checkout session completed", { 
      sessionId: session.id, 
      customerEmail: session.customer_email,
      mode: session.mode 
    });

    // Only process subscription payments (membership activations)
    if (session.mode === "subscription") {
      const customerEmail = session.customer_email || session.customer_details?.email;
      
      if (customerEmail) {
        logStep("Processing subscription activation", { email: customerEmail });

        // Update activation_links status to 'activated'
        const { data: activationData, error: activationError } = await supabaseClient
          .from("activation_links")
          .update({ 
            status: "activated", 
            activated_at: new Date().toISOString() 
          })
          .eq("patient_email", customerEmail)
          .eq("status", "pending")
          .select();

        if (activationError) {
          logStep("Error updating activation_links", { error: activationError.message });
        } else {
          logStep("Activation links updated", { count: activationData?.length || 0 });
        }

        // Update patient onboarding_status to 'treatment_active'
        const { data: patientData, error: patientError } = await supabaseClient
          .from("patients")
          .update({ onboarding_status: "treatment_active" })
          .eq("email", customerEmail)
          .select();

        if (patientError) {
          logStep("Error updating patient status", { error: patientError.message });
        } else {
          logStep("Patient status updated", { count: patientData?.length || 0 });
        }
      } else {
        logStep("No customer email found in session");
      }
    }
  }

  // Handle subscription status changes
  if (event.type === "customer.subscription.deleted" || event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    logStep("Subscription event", { 
      type: event.type, 
      status: subscription.status,
      customerId: subscription.customer 
    });

    // If subscription is canceled or unpaid, we could update patient status
    if (subscription.status === "canceled" || subscription.status === "unpaid") {
      // Get customer email from Stripe
      const customer = await stripe.customers.retrieve(subscription.customer as string);
      if (customer && !customer.deleted && customer.email) {
        const { error } = await supabaseClient
          .from("patients")
          .update({ onboarding_status: "subscription_canceled" })
          .eq("email", customer.email);

        if (error) {
          logStep("Error updating patient for canceled subscription", { error: error.message });
        } else {
          logStep("Patient status updated for canceled subscription", { email: customer.email });
        }
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
