import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

const generateWelcomeEmail = (patientName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2C3E50 0%, #3d5166 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 1px;">Welcome to Réveil</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #2C3E50; font-size: 18px; margin: 0 0 20px; line-height: 1.6;">
                Dear ${patientName},
              </p>
              
              <p style="color: #4a5568; font-size: 16px; margin: 0 0 20px; line-height: 1.8;">
                Your membership is now active! We're honored to welcome you to the Réveil family.
              </p>
              
              <p style="color: #4a5568; font-size: 16px; margin: 0 0 20px; line-height: 1.8;">
                Here's what happens next:
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td style="padding: 15px 20px; background-color: #fef3c7; border-radius: 6px; border-left: 4px solid #d97706;">
                    <p style="color: #92400e; font-size: 14px; margin: 0 0 8px; font-weight: 600;">⏳ ZRT Saliva Kit Shipping</p>
                    <p style="color: #78350f; font-size: 14px; margin: 0;">Your diagnostic kit will ship within 1-2 business days. This is required before we can finalize your prescription.</p>
                  </td>
                </tr>
                <tr><td style="height: 12px;"></td></tr>
                <tr>
                  <td style="padding: 15px 20px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #2C3E50;">
                    <p style="color: #2C3E50; font-size: 14px; margin: 0 0 8px; font-weight: 600;">✓ Your prescription is being prepared</p>
                    <p style="color: #718096; font-size: 14px; margin: 0;">Once labs are reviewed, our pharmacy partner will ship your medications within 3-5 business days.</p>
                  </td>
                </tr>
                <tr><td style="height: 12px;"></td></tr>
                <tr>
                  <td style="padding: 15px 20px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #2C3E50;">
                    <p style="color: #2C3E50; font-size: 14px; margin: 0 0 8px; font-weight: 600;">✓ Access your Patient Portal</p>
                    <p style="color: #718096; font-size: 14px; margin: 0;">Log in to view your treatment plan, track progress, and message your care team.</p>
                  </td>
                </tr>
                <tr><td style="height: 12px;"></td></tr>
                <tr>
                  <td style="padding: 15px 20px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #2C3E50;">
                    <p style="color: #2C3E50; font-size: 14px; margin: 0 0 8px; font-weight: 600;">✓ Monthly check-ins</p>
                    <p style="color: #718096; font-size: 14px; margin: 0;">We'll reach out monthly to monitor your progress and adjust your protocol as needed.</p>
                  </td>
                </tr>
              </table>
              
              <p style="color: #4a5568; font-size: 16px; margin: 20px 0; line-height: 1.8;">
                If you have any questions, simply reply to this email or call us at <strong>(706) 426-7383</strong>.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://reveil.health/patient/login" style="display: inline-block; background-color: #2C3E50; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 50px; font-size: 16px; font-weight: 500;">Access Patient Portal</a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #4a5568; font-size: 16px; margin: 20px 0 0; line-height: 1.8;">
                To your health,<br>
                <strong style="color: #2C3E50;">The Réveil Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #718096; font-size: 13px; margin: 0 0 8px;">
                Réveil<br>
                7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809
              </p>
              <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Réveil. All rights reserved.
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

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

  // Handle checkout.session.completed for all payment types
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    logStep("Checkout session completed", { 
      sessionId: session.id, 
      customerEmail: session.customer_email,
      mode: session.mode 
    });

    const customerEmail = session.customer_email || session.customer_details?.email;
    const metadata = session.metadata || {};

    // PHASE 4: Handle one-time payments (consultations, lab kits, etc.)
    if (session.mode === "payment") {
      const paymentType = metadata.payment_type;
      
      if (customerEmail) {
        logStep("Processing one-time payment", { email: customerEmail, paymentType });

        // Update patient status based on payment type
        if (paymentType === "consultation") {
          const { error } = await supabaseClient
            .from("patients")
            .update({ onboarding_status: "consultation_paid" })
            .eq("email", customerEmail);
          
          if (error) {
            logStep("Error updating patient for consultation payment", { error: error.message });
          } else {
            logStep("Patient status updated to consultation_paid", { email: customerEmail });
          }
        }

        if (paymentType === "hormone_mapping" || paymentType === "lab_kit") {
          const { error } = await supabaseClient
            .from("patients")
            .update({ onboarding_status: "labs_paid" })
            .eq("email", customerEmail);
          
          if (error) {
            logStep("Error updating patient for lab payment", { error: error.message });
          } else {
            logStep("Patient status updated to labs_paid", { email: customerEmail });
          }
        }
      }
    }

    // Handle subscription payments (membership activations)
    if (session.mode === "subscription") {
      // Prefer 'tier' metadata (from hormone membership checkout), fallback to 'base_membership'
      const tierFromMetadata = metadata.tier || metadata.base_membership || "metabolic";
      
      if (customerEmail) {
        logStep("Processing subscription activation", { email: customerEmail, tier: tierFromMetadata });

        // Get activation link to find patient name and membership details
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

        // Priority: metadata.tier > activation_link.base_membership > metadata.base_membership
        const membershipTier = tierFromMetadata || activationData?.[0]?.base_membership || "metabolic";
        
        // PHASE 4: Set patient to treatment_active for subscription activations
        const { data: patientData, error: patientError } = await supabaseClient
          .from("patients")
          .update({ 
            onboarding_status: "treatment_active",
            membership_tier: membershipTier,
            lab_path: "zrt"
          })
          .eq("email", customerEmail)
          .select();

        if (patientError) {
          logStep("Error updating patient status", { error: patientError.message });
        } else {
          logStep("Patient status updated to treatment_active", { 
            count: patientData?.length || 0,
            membershipTier 
          });
        }

        // Send welcome email
        const patientName = activationData?.[0]?.patient_name || patientData?.[0]?.full_name || "Valued Patient";
        
        try {
          const emailResponse = await resend.emails.send({
            from: "Réveil <noreply@stripe.reveil.health>",
            to: [customerEmail],
            subject: "Welcome to Réveil – Your Membership is Active!",
            html: generateWelcomeEmail(patientName),
          });
          
          logStep("Welcome email sent", { emailId: emailResponse.data?.id, to: customerEmail });
          
          // Send SMS alert to staff about payment received
          try {
            const staffAlertResponse = await fetch(
              `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-staff-alert-sms`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
                },
                body: JSON.stringify({
                  alert_type: "payment_received",
                  patient_name: patientName,
                  patient_email: customerEmail,
                  amount: session.amount_total ? session.amount_total / 100 : null,
                  payment_type: "subscription activation",
                  program: tierFromMetadata,
                }),
              }
            );
            logStep("Staff SMS alert sent", { success: staffAlertResponse.ok });
          } catch (smsError) {
            logStep("Staff SMS alert failed (non-critical)", { error: String(smsError) });
          }
        } catch (emailError) {
          const errorMsg = emailError instanceof Error ? emailError.message : String(emailError);
          logStep("Error sending welcome email", { error: errorMsg });
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

    // If subscription is canceled or unpaid, update patient status
    if (subscription.status === "canceled" || subscription.status === "unpaid") {
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