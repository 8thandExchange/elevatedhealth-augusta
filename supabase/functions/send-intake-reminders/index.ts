import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";
import {
  corsHeaders,
  createServiceClient,
  requireServiceRoleOnly,
} from "../_shared/intake-magic-link-auth.ts";
import { isWellnessAssessmentServiceType } from "../_shared/magic-link-helpers.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const functionName = "send-intake-reminders";

  const serviceAuth = requireServiceRoleOnly(req);
  if (!serviceAuth.ok) {
    return new Response(JSON.stringify({ error: serviceAuth.message }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createServiceClient();
  let processed = 0;
  let sent = 0;
  let failed = 0;

  try {
    const now = Date.now();
    const windowStart = new Date(now + 22 * 60 * 60 * 1000).toISOString();
    const windowEnd = new Date(now + 26 * 60 * 60 * 1000).toISOString();

    const { data: appointments, error: apptError } = await supabase
      .from("appointments")
      .select(
        `
        id,
        scheduled_at,
        patient_id,
        consultation_booking_id,
        patients!inner (
          id,
          full_name,
          email,
          phone,
          intake_consents_completed_at
        )
      `,
      )
      .eq("status", "scheduled")
      .is("intake_reminder_sent_at", null)
      .gte("scheduled_at", windowStart)
      .lte("scheduled_at", windowEnd);

    if (apptError) throw apptError;

    for (const appt of appointments ?? []) {
      processed++;
      const patient = (appt as { patients: Record<string, unknown> }).patients;
      if (!patient || patient.intake_consents_completed_at) {
        continue;
      }

      const patientId = appt.patient_id as string;
      const scheduledAt = appt.scheduled_at as string;

      let bookingId = appt.consultation_booking_id as string | null;
      let serviceType: string | null = null;

      if (bookingId) {
        const { data: booking } = await supabase
          .from("consultation_bookings")
          .select("service_type")
          .eq("id", bookingId)
          .maybeSingle();
        serviceType = booking?.service_type ?? null;
      }

      if (serviceType && !isWellnessAssessmentServiceType(serviceType)) {
        continue;
      }

      const { data: existingLink } = await supabase
        .from("intake_magic_links")
        .select("token, expires_at, revoked_at, reminder_sent_at")
        .eq("patient_id", patientId)
        .is("revoked_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let token = existingLink?.token;

      if (!token || existingLink?.reminder_sent_at) {
        if (existingLink?.reminder_sent_at) continue;

        const { data: created, error: createErr } = await supabase.functions.invoke(
          "create-intake-magic-link",
          {
            body: {
              patient_id: patientId,
              booking_id: bookingId,
              appointment_time: scheduledAt,
            },
          },
        );

        if (createErr || !created?.token) {
          failed++;
          continue;
        }
        token = created.token;
      }

      const apptDate = new Date(scheduledAt);
      const appointmentDate = apptDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        timeZone: "America/New_York",
      });
      const appointmentTime = apptDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/New_York",
      });

      const { data: sendResult, error: sendErr } = await supabase.functions.invoke(
        "send-intake-magic-link",
        {
          body: {
            patient_id: patientId,
            magic_link_token: token,
            context: "reminder_24h",
            appointment_date: appointmentDate,
            appointment_time: appointmentTime,
          },
        },
      );

      if (sendErr || !sendResult?.success) {
        failed++;
        continue;
      }

      sent++;
      await supabase
        .from("appointments")
        .update({ intake_reminder_sent_at: new Date().toISOString() })
        .eq("id", appt.id);

      if (existingLink?.token === token) {
        await supabase
          .from("intake_magic_links")
          .update({ reminder_sent_at: new Date().toISOString() })
          .eq("token", token);
      }
    }

    edgeStructuredLog(functionName, {
      event: "job_complete",
      success: true,
      processed,
      sent,
      failed,
    });

    return new Response(JSON.stringify({ processed, sent, failed }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    edgeStructuredLog(functionName, {
      event: "job_error",
      success: false,
      error_message: message,
      processed,
      sent,
      failed,
    }, "error");
    return new Response(JSON.stringify({ error: message, processed, sent, failed }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
