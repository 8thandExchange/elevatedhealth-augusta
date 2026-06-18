import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";
import {
  assertConsultPaidForGfe,
  computeGfeExpiresAtIso,
  hasValidGfeClearance,
} from "../_shared/gfe-clearance.ts";
import {
  corsHeaders,
  createServiceClient,
  requireStaffOrServiceRole,
} from "../_shared/intake-magic-link-auth.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const functionName = "record-in-clinic-gfe";

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
    const patientId = body.patient_id as string;
    const serviceCategory = (body.service_category as string) || "general";
    const notes = (body.notes as string) || null;
    const providerName = (body.provider_name as string) || null;

    if (!patientId) {
      return new Response(JSON.stringify({ error: "patient_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("id, email, onboarding_status")
      .eq("id", patientId)
      .maybeSingle();

    if (patientError || !patient) {
      return new Response(JSON.stringify({ error: "Patient not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paidCheck = await assertConsultPaidForGfe(
      supabase,
      patientId,
      patient.email,
      patient.onboarding_status,
    );
    if (!paidCheck.ok) {
      return new Response(
        JSON.stringify({
          error: paidCheck.message,
          error_code: "consult_not_paid",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (await hasValidGfeClearance(supabase, patientId)) {
      return new Response(
        JSON.stringify({
          error: "Patient already has a valid in-clinic or remote GFE on file.",
          error_code: "gfe_already_valid",
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let resolvedProviderName = providerName?.trim() || null;
    if (!resolvedProviderName && auth.userId) {
      const { data: staffUser } = await supabase.auth.admin.getUserById(auth.userId);
      const meta = staffUser?.user?.user_metadata;
      resolvedProviderName =
        (typeof meta?.full_name === "string" && meta.full_name.trim()) ||
        (typeof meta?.name === "string" && meta.name.trim()) ||
        staffUser?.user?.email?.split("@")[0] ||
        null;
    }

    await supabase
      .from("gfe_clearances")
      .update({ status: "cancelled" })
      .eq("patient_id", patientId)
      .eq("status", "pending");

    const approvedAt = new Date();
    const { data: row, error: insertError } = await supabase
      .from("gfe_clearances")
      .insert({
        patient_id: patientId,
        service_category: serviceCategory,
        clearance_source: "in_clinic",
        status: "approved",
        approved_at: approvedAt.toISOString(),
        expires_at: computeGfeExpiresAtIso(approvedAt),
        provider_name: resolvedProviderName,
        notes,
        consultation_booking_id: paidCheck.consultation_booking_id ?? null,
        sent_by: auth.userId ?? null,
        sent_at: approvedAt.toISOString(),
      })
      .select("id, expires_at")
      .single();

    if (insertError) throw insertError;

    await supabase
      .from("patients")
      .update({ onboarding_status: "gfe_cleared" })
      .eq("id", patientId)
      .in("onboarding_status", [
        "consultation_paid",
        "gfe_pending",
        "account_created",
        "invited",
        "pending_invite",
      ]);

    edgeStructuredLog(functionName, { patient_id: patientId, clearance_id: row?.id, success: true });

    return new Response(
      JSON.stringify({ success: true, clearance_id: row?.id, expires_at: row?.expires_at }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    edgeStructuredLog(functionName, { success: false, error_message: message });
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
