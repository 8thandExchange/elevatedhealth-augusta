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
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 1px;">Welcome to Elevated Health</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #2C3E50; font-size: 18px; margin: 0 0 20px; line-height: 1.6;">
                Dear ${patientName},
              </p>
              
              <p style="color: #4a5568; font-size: 16px; margin: 0 0 20px; line-height: 1.8;">
                Your membership is now active! We're honored to welcome you to the Elevated Health family.
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
                If you have any questions, simply reply to this email or call us at <strong>(706) 821-7354</strong>.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://elevatedhealthaugusta.com/patient/login" style="display: inline-block; background-color: #2C3E50; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 50px; font-size: 16px; font-weight: 500;">Access Patient Portal</a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #4a5568; font-size: 16px; margin: 20px 0 0; line-height: 1.8;">
                To your health,<br>
                <strong style="color: #2C3E50;">The Elevated Health Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #718096; font-size: 13px; margin: 0 0 8px;">
                Elevated Health Augusta<br>
                3540 Wheeler Rd, Suite 510, Augusta, GA 30909
              </p>
              <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Elevated Health Augusta. All rights reserved.
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
      const metadata = session.metadata || {};
      const baseMembership = metadata.base_membership || "metabolic";
      
      if (customerEmail) {
        logStep("Processing subscription activation", { email: customerEmail, baseMembership });

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

        // Determine the membership type from activation link or metadata
        const membershipType = activationData?.[0]?.base_membership || baseMembership;
        
        // GAP 1 & 2 FIX: Set patient to 'pending_pharmacy_order' and ensure lab_path is 'zrt' for ALL memberships
        // Both GLP-1 (metabolic) and hormone-only (vitality) patients need diagnostic labs
        const { data: patientData, error: patientError } = await supabaseClient
          .from("patients")
          .update({ 
            onboarding_status: "pending_pharmacy_order",  // GAP 2: Lauren sees this and must complete pharmacy order
            lab_path: "zrt"  // GAP 1: ALL patients get ZRT kit shipped, including GLP-1/metabolic
          })
          .eq("email", customerEmail)
          .select();

        if (patientError) {
          logStep("Error updating patient status", { error: patientError.message });
        } else {
          logStep("Patient status updated to pending_pharmacy_order with ZRT lab path", { 
            count: patientData?.length || 0,
            membershipType 
          });
        }

        // Send welcome email (updated to mention ZRT kit shipping)
        const patientName = activationData?.[0]?.patient_name || patientData?.[0]?.full_name || "Valued Patient";
        
        try {
          const emailResponse = await resend.emails.send({
            from: "Elevated Health <noreply@stripe.elevatedhealthaugusta.com>",
            to: [customerEmail],
            subject: "Welcome to Elevated Health – Your Membership is Active!",
            html: generateWelcomeEmail(patientName),
          });
          
          logStep("Welcome email sent", { emailId: emailResponse.data?.id, to: customerEmail });
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