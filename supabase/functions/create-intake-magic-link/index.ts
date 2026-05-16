import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";
import {
  buildIntakeMagicLinkUrl,
  computeIntakeLinkExpiry,
  generateMagicLinkToken,
} from "../_shared/magic-link-helpers.ts";
import {
  corsHeaders,
  createServiceClient,
  requireStaffOrServiceRole,
} from "../_shared/intake-magic-link-auth.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const functionName = "create-intake-magic-link";

  try {
    const supabase = createServiceClient();
    const auth = await requireStaffOrServiceRole(supabase, req);
    if (!auth.ok) {
      return new Response(JSON.stringify({ error: auth.message }), {
        status: auth.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const patientId = body.patient_id as string | undefined;
    const bookingId = body.booking_id as string | undefined;
    const appointmentTime = body.appointment_time as string | undefined;
    const expiresAtOverride = body.expires_at as string | undefined;

    if (!patientId) {
      return new Response(JSON.stringify({ error: "patient_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("id, email, phone")
      .eq("id", patientId)
      .maybeSingle();

    if (patientError || !patient) {
      edgeStructuredLog(functionName, {
        event: "patient_not_found",
        patient_id: patientId,
        success: false,
        error_message: patientError?.message ?? "not found",
      }, "error");
      return new Response(JSON.stringify({ error: "Patient not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = generateMagicLinkToken();
    const expiresAt = computeIntakeLinkExpiry(appointmentTime, expiresAtOverride);

    const pendingConsentTypes = body.pending_consent_types as string[] | undefined;
    const pendingReconsentRequestId = body.pending_reconsent_request_id as string | undefined;
    const pendingSubstanceId = body.pending_substance_id as string | undefined;

    const insertPayload: Record<string, unknown> = {
      token,
      patient_id: patientId,
      booking_id: bookingId ?? null,
      email_address: patient.email,
      phone_number: patient.phone,
      expires_at: expiresAt,
    };

    if (pendingConsentTypes?.length) {
      insertPayload.pending_consent_types = pendingConsentTypes;
    }
    if (pendingReconsentRequestId) {
      insertPayload.pending_reconsent_request_id = pendingReconsentRequestId;
    }
    if (pendingSubstanceId) {
      insertPayload.pending_substance_id = pendingSubstanceId;
    }

    const { error: insertError } = await supabase.from("intake_magic_links").insert(insertPayload);

    if (insertError) {
      throw new Error(insertError.message);
    }

    const fullUrl = buildIntakeMagicLinkUrl(token);

    edgeStructuredLog(functionName, {
      event: "link_created",
      patient_id: patientId,
      booking_id: bookingId ?? null,
      success: true,
    });

    return new Response(
      JSON.stringify({ token, full_url: fullUrl, expires_at: expiresAt }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    edgeStructuredLog(functionName, {
      event: "handler_error",
      success: false,
      error_message: message,
    }, "error");
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
