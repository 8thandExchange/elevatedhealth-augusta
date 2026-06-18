import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";
import { sendQualiphyGfeInvite } from "../_shared/send-qualiphy-gfe-invite-core.ts";
import {
  corsHeaders,
  createServiceClient,
  requireStaffOrServiceRole,
} from "../_shared/intake-magic-link-auth.ts";

function httpStatusForGfeInviteError(errorCode: string): number {
  switch (errorCode) {
    case "qualiphy_not_configured":
      return 503;
    case "patient_not_found":
      return 404;
    case "gfe_already_valid":
      return 409;
    case "internal_error":
      return 500;
    default:
      return 400;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const functionName = "qualiphy-send-gfe-invite";

  try {
    const supabase = createServiceClient();
    const auth = await requireStaffOrServiceRole(supabase, req);
    if (!auth.ok) {
      return new Response(
        JSON.stringify({ error: auth.message, error_code: "unauthorized" }),
        {
          status: auth.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const body = await req.json();
    const patientId = body.patient_id as string;
    const channels = (body.channels as ("email" | "sms")[]) ?? ["email"];
    const serviceCategory = (body.service_category as string) || "general";
    const teleState = (body.tele_state as string) || undefined;

    if (!patientId) {
      return new Response(
        JSON.stringify({ error: "patient_id is required", error_code: "missing_patient_id" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const result = await sendQualiphyGfeInvite(supabase, {
      patientId,
      channels,
      serviceCategory,
      teleState,
      sentByUserId: auth.userId ?? null,
    });

    if (!result.ok) {
      edgeStructuredLog(functionName, {
        patient_id: patientId,
        success: false,
        error_code: result.error_code,
        error_message: result.error,
      });
      return new Response(
        JSON.stringify({ error: result.error, error_code: result.error_code }),
        {
          status: httpStatusForGfeInviteError(result.error_code),
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    edgeStructuredLog(functionName, {
      patient_id: patientId,
      clearance_id: result.clearance_id,
      delivered: result.delivered,
      success: true,
    });

    return new Response(
      JSON.stringify({
        success: true,
        clearance_id: result.clearance_id,
        meeting_url: result.meeting_url,
        delivered_channels: result.delivered,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    edgeStructuredLog(functionName, { success: false, error_message: message });
    return new Response(JSON.stringify({ error: message, error_code: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
