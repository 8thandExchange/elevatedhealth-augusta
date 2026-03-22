import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@4.1.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-CONSULTATION-FOLLOWUP] ${step}${detailsStr}`);
};

// This function checks for $149 consultations that haven't converted to kit purchases within 48 hours
// Run via pg_cron daily

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const resend = new Resend(resendKey);

    // Find consultations paid more than 48 hours ago that haven't had a kit purchase
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    
    // Get all paid consultations from 48+ hours ago
    const { data: consultations, error: consultError } = await supabaseClient
      .from("consultation_bookings")
      .select("id, customer_email, customer_name, credit_code, created_at, followup_sent_at")
      .eq("status", "paid")
      .lt("created_at", fortyEightHoursAgo)
      .is("followup_sent_at", null);

    if (consultError) throw consultError;
    logStep("Consultations needing followup", { count: consultations?.length || 0 });

    if (!consultations || consultations.length === 0) {
      return new Response(JSON.stringify({ success: true, processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const followups: string[] = [];

    for (const consultation of consultations) {
      // Check if this customer has any hormone_mapping_payments
      const { data: kitPayments } = await supabaseClient
        .from("hormone_mapping_payments")
        .select("id")
        .eq("customer_email", consultation.customer_email)
        .eq("payment_status", "paid")
        .limit(1);

      // If they have a paid kit, skip
      if (kitPayments && kitPayments.length > 0) {
        logStep("Customer already purchased kit", { email: consultation.customer_email });
        // Mark as processed
        await supabaseClient
          .from("consultation_bookings")
          .update({ followup_sent_at: new Date().toISOString() })
          .eq("id", consultation.id);
        continue;
      }

      // No kit purchase - send followup alert to provider
      followups.push(consultation.customer_email);
      
      logStep("Sending followup alert for", { 
        email: consultation.customer_email, 
        name: consultation.customer_name,
        creditCode: consultation.credit_code 
      });
    }

    // If there are any followups needed, send single alert email to provider
    if (followups.length > 0) {
      const patientList = consultations
        .filter(c => followups.includes(c.customer_email))
        .map(c => `• ${c.customer_name || c.customer_email} - Credit Code: ${c.credit_code || 'N/A'}`)
        .join('\n');

      await resend.emails.send({
        from: "Réveil <noreply@stripe.reveil.health>",
        to: ["booking@reveil.health"],
        subject: `⚠️ ${followups.length} Consultation(s) Need Kit Follow-up`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #c53030;">Consultation Follow-up Needed</h2>
            <p>The following patients paid for a $149 consultation more than 48 hours ago but haven't purchased their diagnostic kit:</p>
            <div style="background-color: #fff5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #c53030;">
              <pre style="margin: 0; white-space: pre-wrap;">${patientList}</pre>
            </div>
            <p><strong>Recommended Action:</strong></p>
            <ul>
              <li>Call or text these patients to check on their decision</li>
              <li>Send them the kit payment link from the Provider Dashboard</li>
              <li>Remind them their $149 credit is waiting to be applied</li>
            </ul>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              This is an automated message from your Réveil patient management system.
            </p>
          </div>
        `,
      });

      logStep("Followup alert sent to provider", { patientCount: followups.length });

      // Mark all as followup sent
      for (const consultation of consultations.filter(c => followups.includes(c.customer_email))) {
        await supabaseClient
          .from("consultation_bookings")
          .update({ followup_sent_at: new Date().toISOString() })
          .eq("id", consultation.id);
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: followups.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
