import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sinch fax status mapping
const STATUS_MAP: Record<string, string> = {
  "QUEUED": "queued",
  "IN_PROGRESS": "transmitting",
  "COMPLETED": "delivered",
  "FAILED": "failed",
  "CANCELED": "canceled",
};

async function sendFailureAlert(
  resend: any,
  patientName: string,
  medication: string,
  errorMessage: string,
  faxId: string
) {
  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; border-bottom: 3px solid #C5A059; padding-bottom: 15px; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 20px; color: #1a3a4a; letter-spacing: 2px;">RÉVEIL</h1>
      </div>
      
      <div style="background: #fee2e2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 10px 0; color: #dc2626; font-size: 18px;">⚠️ Fax Delivery Failed</h2>
        <p style="margin: 0; color: #7f1d1d;">The prescription fax could not be delivered. Please use manual fallback.</p>
      </div>
      
      <div style="background: #f9f9f7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #C5A059; font-size: 14px; text-transform: uppercase;">Order Details</h3>
        <p style="margin: 5px 0;"><strong>Patient:</strong> ${patientName}</p>
        <p style="margin: 5px 0;"><strong>Medication:</strong> ${medication}</p>
        <p style="margin: 5px 0;"><strong>Fax ID:</strong> ${faxId}</p>
        <p style="margin: 5px 0;"><strong>Error:</strong> ${errorMessage || 'Unknown error'}</p>
      </div>
      
      <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #92400e; font-size: 14px;">📋 Manual Fallback Steps</h3>
        <ol style="margin: 0; padding-left: 20px; color: #78350f;">
          <li>Open the Provider Dashboard</li>
          <li>Navigate to the patient's profile</li>
          <li>Use "FCC Portal" button to manually enter the order</li>
          <li>Or call the compounding pharmacy directly: (706) 993-3772</li>
        </ol>
      </div>
      
      <p style="font-size: 12px; color: #666; text-align: center; margin-top: 20px;">
        This is an automated alert from Réveil
      </p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "Réveil <noreply@stripe.reveil.health>",
      to: ["booking@reveil.health"],
      subject: `⚠️ Fax Failed: ${patientName} - ${medication}`,
      html,
    });
    console.log("Failure alert email sent");
  } catch (emailError) {
    console.error("Error sending failure alert:", emailError);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

    const body = await req.json();
    console.log("Sinch webhook received:", JSON.stringify(body));

    // Sinch sends fax status updates with faxId and status
    const faxId = body.id || body.faxId || body.fax_id;
    const sinchStatus = body.status || body.faxStatus;
    const errorMessage = body.errorMessage || body.error?.message;

    if (!faxId) {
      console.log("No fax ID in webhook payload");
      return new Response(
        JSON.stringify({ received: true, message: "No fax ID provided" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Map Sinch status to our internal status
    const mappedStatus = STATUS_MAP[sinchStatus?.toUpperCase()] || sinchStatus?.toLowerCase() || "unknown";
    
    console.log(`Updating fax ${faxId} to status: ${mappedStatus}`);

    // Find the order with this fax_id and get patient/medication info
    const { data: order, error: findError } = await supabase
      .from("orders")
      .select("id, patient_id, fax_status, protocol_snapshot, patients(full_name)")
      .eq("fax_id", faxId)
      .maybeSingle();

    if (findError || !order) {
      console.log(`Order with fax_id ${faxId} not found:`, findError?.message);
      return new Response(
        JSON.stringify({ received: true, message: "Order not found" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update the order with new fax status
    const updateData: Record<string, any> = {
      fax_status: mappedStatus,
      updated_at: new Date().toISOString(),
    };

    // If failed, store the error and send alert
    if (mappedStatus === "failed") {
      updateData.fax_error = errorMessage || "Delivery failed";
      
      // Send failure alert email
      if (resend) {
        const patientName = (order as any).patients?.full_name || "Unknown Patient";
        const medication = (order.protocol_snapshot as any)?.medication_name || "Unknown Medication";
        await sendFailureAlert(resend, patientName, medication, errorMessage, faxId);
      }
    }

    // If delivered, update the status to completed
    if (mappedStatus === "delivered") {
      updateData.status = "completed";
      console.log(`Fax ${faxId} delivered successfully - marking order as completed`);
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", order.id);

    if (updateError) {
      console.error("Error updating order:", updateError);
      throw updateError;
    }

    console.log(`Order ${order.id} updated - fax_status: ${mappedStatus}`);

    return new Response(
      JSON.stringify({
        received: true,
        order_id: order.id,
        fax_id: faxId,
        status: mappedStatus,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error processing Sinch webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
