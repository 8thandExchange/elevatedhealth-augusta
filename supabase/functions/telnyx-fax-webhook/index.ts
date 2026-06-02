import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/** Telnyx fax.* event_type → internal orders.fax_status */
const EVENT_STATUS_MAP: Record<string, string> = {
  "fax.queued": "queued",
  "fax.media.processed": "processing",
  "fax.sending.started": "transmitting",
  "fax.delivered": "delivered",
  "fax.failed": "failed",
};

async function sendFailureAlert(
  resend: InstanceType<typeof Resend>,
  patientName: string,
  medication: string,
  errorMessage: string,
  faxId: string,
  pharmacyContactLine: string,
) {
  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; border-bottom: 3px solid #C5A059; padding-bottom: 15px; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 20px; color: #1a3a4a; letter-spacing: 2px;">ELEVATED HEALTH AUGUSTA</h1>
      </div>
      <div style="background: #fee2e2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 10px 0; color: #dc2626; font-size: 18px;">Fax delivery failed</h2>
        <p style="margin: 0; color: #7f1d1d;">The prescription fax could not be delivered. Please use manual fallback.</p>
      </div>
      <div style="background: #f9f9f7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #C5A059; font-size: 14px; text-transform: uppercase;">Order details</h3>
        <p style="margin: 5px 0;"><strong>Patient:</strong> ${patientName}</p>
        <p style="margin: 5px 0;"><strong>Medication:</strong> ${medication}</p>
        <p style="margin: 5px 0;"><strong>Fax ID:</strong> ${faxId}</p>
        <p style="margin: 5px 0;"><strong>Error:</strong> ${errorMessage || "Unknown error"}</p>
      </div>
      <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px;">
        <h3 style="margin: 0 0 10px 0; color: #92400e; font-size: 14px;">Manual fallback</h3>
        <ol style="margin: 0; padding-left: 20px; color: #78350f;">
          <li>Open the Provider Dashboard</li>
          <li>Navigate to the patient's profile</li>
          <li>Use the pharmacy portal or manual fax process</li>
          <li>${pharmacyContactLine}</li>
        </ol>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "Elevated Health Augusta <noreply@stripe.elevatedhealthaugusta.com>",
      to: ["appointments@elevatedhealthaugusta.com"],
      subject: `Fax failed: ${patientName} - ${medication}`,
      html,
    });
    console.log("Failure alert email sent");
  } catch (emailError) {
    console.error("Error sending failure alert:", emailError);
  }
}

function parseTelnyxWebhook(body: Record<string, unknown>): {
  faxId: string | null;
  mappedStatus: string;
  errorMessage: string | undefined;
} {
  const data = (body.data ?? body) as Record<string, unknown>;
  const eventType = String(data.event_type ?? body.event_type ?? "");
  const payload = (data.payload ?? data) as Record<string, unknown>;

  const faxId =
    (payload.fax_id as string) ||
    (payload.id as string) ||
    (data.id as string) ||
    null;

  const mappedStatus =
    EVENT_STATUS_MAP[eventType] ||
    String(payload.status ?? "unknown").toLowerCase();

  const errorMessage =
    (payload.failure_reason as string) ||
    (payload.error_message as string) ||
    undefined;

  return { faxId, mappedStatus, errorMessage };
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
    console.log("Telnyx fax webhook:", JSON.stringify(body));

    const { faxId, mappedStatus, errorMessage } = parseTelnyxWebhook(body);

    if (!faxId) {
      return new Response(
        JSON.stringify({ received: true, message: "No fax ID in payload" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    console.log(`Fax ${faxId} → status ${mappedStatus}`);

    const { data: order, error: findError } = await supabase
      .from("orders")
      .select("id, patient_id, fax_status, protocol_snapshot, pharmacy_id, patients(full_name)")
      .eq("fax_id", faxId)
      .maybeSingle();

    if (findError || !order) {
      console.log(`No order for fax_id ${faxId}:`, findError?.message);
      return new Response(
        JSON.stringify({ received: true, message: "Order not found" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const updateData: Record<string, unknown> = {
      fax_status: mappedStatus,
      updated_at: new Date().toISOString(),
    };

    if (mappedStatus === "failed") {
      updateData.fax_error = errorMessage || "Delivery failed";

      if (resend) {
        const patientName = (order as { patients?: { full_name?: string } }).patients?.full_name ||
          "Unknown Patient";
        const medication =
          (order.protocol_snapshot as { medication_name?: string })?.medication_name ||
          "Unknown Medication";

        let pharmacyContactLine = "Contact the prescribing provider for next steps.";
        if (order.pharmacy_id) {
          const { data: pharmacy } = await supabase
            .from("pharmacies")
            .select("name, phone_number")
            .eq("id", order.pharmacy_id)
            .single();
          if (pharmacy?.phone_number) {
            pharmacyContactLine = `Or call ${pharmacy.name} directly: ${pharmacy.phone_number}`;
          } else if (pharmacy?.name) {
            pharmacyContactLine = `Or contact ${pharmacy.name}.`;
          }
        }

        await sendFailureAlert(
          resend,
          patientName,
          medication,
          errorMessage ?? "",
          faxId,
          pharmacyContactLine,
        );
      }
    }

    if (mappedStatus === "delivered") {
      updateData.status = "completed";
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", order.id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        received: true,
        order_id: order.id,
        fax_id: faxId,
        status: mappedStatus,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("telnyx-fax-webhook error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
});
