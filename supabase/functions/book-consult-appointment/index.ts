import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { triggerIntakeMagicLinkDelivery } from "../_shared/trigger-intake-magic-link.ts";
import { hasValidGfeClearance } from "../_shared/gfe-clearance.ts";
import { resolveReferralAttribution } from "../_shared/referral-attribution.ts";
import { notifyStaffNewAppointment } from "../_shared/notify-staff-booking.ts";
import {
  getSlotSigningKey,
  redeemSlotTokenJtiOnce,
  verifySlotToken,
} from "../_shared/slot-token.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

async function alertStaffAppointmentBooked(
  supabase: ReturnType<typeof createClient>,
  opts: {
    patientId: string;
    patientName: string;
    patientEmail: string | null;
    patientPhone?: string | null;
    serviceLabel: string;
    scheduledAt: string;
    confirmationNumber?: string | null;
  },
): Promise<void> {
  if (!Deno.env.get("RESEND_API_KEY")) return;
  try {
    const referral = await resolveReferralAttribution(supabase, {
      patientId: opts.patientId,
      patientEmail: opts.patientEmail,
    });
    await notifyStaffNewAppointment(resend, {
      patientName: opts.patientName,
      patientEmail: opts.patientEmail,
      patientPhone: opts.patientPhone,
      serviceLabel: opts.serviceLabel,
      scheduledAt: opts.scheduledAt,
      heardAboutUs: referral.display,
      confirmationNumber: opts.confirmationNumber,
    });
  } catch (e) {
    console.warn("staff appointment alert failed", e);
  }
}

function responseForAppointmentInsertError(err: { message?: string } | null): Response | null {
  const msg = err?.message || "";
  if (/No room available/i.test(msg)) {
    return new Response(
      JSON.stringify({
        error: "All rooms are booked at that time. Please pick another slot.",
        error_code: "room_unavailable",
      }),
      { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  if (/Booking limit exceeded/i.test(msg)) {
    return new Response(
      JSON.stringify({
        error: "We've reached our concurrent booking limit for that time. Please pick another slot.",
        error_code: "limit_exceeded",
      }),
      { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  if (/Room blacked out/i.test(msg)) {
    return new Response(
      JSON.stringify({
        error: "That time is no longer available. Please pick another slot.",
        error_code: "room_blackout",
      }),
      { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  if (/Room already booked/i.test(msg)) {
    return new Response(
      JSON.stringify({
        error: "That slot was just taken. Please pick another.",
        error_code: "slot_taken",
      }),
      { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  return null;
}

// TODO(inventory): For consult-gated lanes that include in-clinic medication
// administration (e.g. peptide initiation, NAD+, B12), wire any clinic-stocked
// items into inventory_dispensations at the time of administration via
// dispense_from_lot(). Booking itself does not yet reserve stock.

const ALLOWED_SOURCES = new Set([
  "self_service",
  "staff_phone",
  "chat",
  "walk_in",
]);

const STAFF_PAYMENT_STATUS = new Set([
  "pay_at_visit",         // staff: collect at visit
  "paid_external",        // staff: cash/check at visit (admin override) or paid by phone
  "pending_link",         // staff: payment link sent, not yet paid
  "member_no_charge",     // staff: member with included consult
]);

const SERVICE_LABEL: Record<string, string> = {
  hormone: "Hormone Optimization Consultation",
  weight_loss: "Medical Weight Loss Consultation",
  peptide: "Peptide Protocols Consultation",
  follow_up: "Follow-up Visit",
  lab_draw: "Lab Draw",
  alacarte_followUp: "Follow-up Visit",
  alacarte_labPanel: "Lab Draw",
};

const CONSULT_FEE_USD = 79;

interface RequestBody {
  // Patient self-serve path
  booking_id?: string;
  slot_token?: string;
  // Staff attribution
  booked_by_user_id?: string;
  booking_source?: string;
  // Optional overrides that let non-default consults (lab_draw,
  // follow_up_visit, alacarte follow-ups) reuse this edge function without
  // forcing them to be tagged as 'rn_wellness_assessment' or 30-minute
  // visits. Defaults below preserve the original behaviour for the $79
  // wellness-assessment path.
  appointment_type?: string;
  duration_minutes?: number;
  service_line_override?: string;
  // Staff-mode payload. When present we create a consultation_bookings row
  // ourselves (no Stripe pre-pay) and create the appointment.
  staff_booking?: {
    patient_id: string;
    service_type: string; // hormone | weight_loss | peptide | follow_up | lab_draw
    payment_status: string; // see STAFF_PAYMENT_STATUS
    customer_email?: string;
    customer_name?: string;
    customer_phone?: string;
    notes?: string;
    is_admin_override?: boolean; // controls whether 'paid_external' is allowed
  };
}

async function authorizeStaff(
  req: Request,
  supabase: ReturnType<typeof createClient>,
): Promise<
  | { ok: true; callerId: string; isAdmin: boolean }
  | { ok: false; status: number; error: string }
> {
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return { ok: false, status: 401, error: "Auth required for staff booking" };
  }
  const { data: userData } = await supabase.auth.getUser(token);
  const callerId = userData.user?.id;
  if (!callerId) {
    return { ok: false, status: 401, error: "Auth token invalid" };
  }
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", callerId);
  const roleList = (roles || []).map((r: { role: string }) => r.role);
  const isAdmin = roleList.includes("admin");
  const isStaff = roleList.includes("staff") || isAdmin;
  if (!isStaff) {
    return {
      ok: false,
      status: 403,
      error: "Only staff or admin may book on a patient's behalf",
    };
  }
  return { ok: true, callerId, isAdmin };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json()) as RequestBody;
    const {
      booking_id,
      slot_token,
      booked_by_user_id: rawBookedBy,
      booking_source: rawSource,
      staff_booking,
      appointment_type: requestedApptType,
      duration_minutes: requestedDuration,
      service_line_override: requestedServiceLine,
    } = body;
    const apptType = requestedApptType || "rn_wellness_assessment";
    const apptDuration = typeof requestedDuration === "number" && requestedDuration > 0 ? requestedDuration : 30;

    if (!slot_token) {
      return new Response(
        JSON.stringify({ error: "slot_token is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!booking_id && !staff_booking) {
      return new Response(
        JSON.stringify({ error: "Either booking_id or staff_booking is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const signingKey = getSlotSigningKey();
    if (!signingKey) {
      console.error("book-consult-appointment: SLOT_SIGNING_KEY missing; refusing booking validation");
      return new Response(
        JSON.stringify({
          error: "Slot signing is not configured.",
          error_code: "slot_signing_not_configured",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    let verifiedSlot;
    try {
      verifiedSlot = await verifySlotToken({ token: slot_token, signingKey });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "invalid_slot_token";
      const code = msg.startsWith("expired_slot_token") ? "expired_slot_token" : "invalid_slot_token";
      return new Response(
        JSON.stringify({
          error: code === "expired_slot_token"
            ? "That time is no longer valid. Please reload and choose another slot."
            : "Invalid slot token. Please reload availability and try again.",
          error_code: code,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (verifiedSlot.serviceLine === "iv") {
      return new Response(
        JSON.stringify({
          error: "Invalid slot for consultation booking.",
          error_code: "invalid_slot_token",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const slotStart = new Date(verifiedSlot.startIso);
    const providerId = verifiedSlot.providerId;

    // Resolve booking_source. Default self_service for the consult-paid flow,
    // staff_phone for staff_booking.
    let bookingSource: string =
      typeof rawSource === "string" && ALLOWED_SOURCES.has(rawSource)
        ? rawSource
        : staff_booking
          ? "staff_phone"
          : "self_service";
    let bookedByUserId: string | null = null;
    let isAdmin = false;

    if (staff_booking || bookingSource !== "self_service") {
      const auth = await authorizeStaff(req, supabase);
      if (!auth.ok) {
        return new Response(JSON.stringify({ error: auth.error }), {
          status: auth.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      bookedByUserId =
        typeof rawBookedBy === "string" && rawBookedBy ? rawBookedBy : auth.callerId;
      isAdmin = auth.isAdmin;
      if (bookingSource === "self_service") bookingSource = "staff_phone";
    }

    // ------------------------------------------------------------------------
    // STAFF-MODE PATH (no pre-existing consultation_bookings row)
    // ------------------------------------------------------------------------
    if (staff_booking) {
      const redeemed = await redeemSlotTokenJtiOnce({
        supabaseAdmin: supabase,
        jti: verifiedSlot.jti,
        tokenExpUnix: verifiedSlot.expiresAtUnix,
        bookingFunction: "book-consult-appointment",
        bookingRef: staff_booking.patient_id,
      });
      if (!redeemed.ok) {
        return new Response(
          JSON.stringify({
            error: "That slot token has already been used. Please pick another time.",
            error_code: redeemed.code,
          }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (!STAFF_PAYMENT_STATUS.has(staff_booking.payment_status)) {
        return new Response(
          JSON.stringify({ error: `Invalid payment_status: ${staff_booking.payment_status}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      // Admin-only override: paid_external (cash/check at visit, no Stripe).
      if (
        staff_booking.payment_status === "paid_external" &&
        !isAdmin &&
        !staff_booking.is_admin_override
      ) {
        return new Response(
          JSON.stringify({ error: "Only admin may mark a consult as paid externally (cash/check)" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const { data: patient, error: pErr } = await supabase
        .from("patients")
        .select("id, full_name, email, phone")
        .eq("id", staff_booking.patient_id)
        .maybeSingle();
      if (pErr || !patient) {
        return new Response(
          JSON.stringify({ error: "Patient not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const slotEnd = new Date(slotStart.getTime() + apptDuration * 60_000);

      const { data: conflicts } = await supabase
        .from("appointments")
        .select("id, scheduled_at, duration_minutes")
        .eq("provider_id", providerId)
        .neq("status", "cancelled")
        .gte("scheduled_at", new Date(slotStart.getTime() - 2 * 60 * 60_000).toISOString())
        .lte("scheduled_at", slotEnd.toISOString());
      const taken = (conflicts || []).some((a: { scheduled_at: string; duration_minutes: number | null }) => {
        const aS = new Date(a.scheduled_at).getTime();
        const aE = aS + (a.duration_minutes || 30) * 60_000;
        return slotStart.getTime() < aE && slotEnd.getTime() > aS;
      });
      if (taken) {
        return new Response(
          JSON.stringify({ error: "Slot just got booked. Please pick another." }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const consultStatus =
        staff_booking.payment_status === "paid_external"
          ? "paid"
          : staff_booking.payment_status === "member_no_charge"
            ? "paid"
            : "pending_payment";
      const amountPaid =
        staff_booking.payment_status === "paid_external"
          ? CONSULT_FEE_USD
          : 0;

      const { data: created, error: cErr } = await supabase
        .from("consultation_bookings")
        .insert({
          customer_email: staff_booking.customer_email || patient.email || "",
          customer_name: staff_booking.customer_name || patient.full_name || "",
          customer_phone: staff_booking.customer_phone || patient.phone || null,
          service_type: staff_booking.service_type,
          status: consultStatus,
          amount_paid: amountPaid,
          notes: staff_booking.notes || null,
          booking_source: bookingSource,
          booked_by_user_id: bookedByUserId,
          booked_for: slotStart.toISOString(),
          calendar_booked_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (cErr) throw cErr;

      const serviceLabel =
        SERVICE_LABEL[staff_booking.service_type] || "Wellness Assessment";

      const { data: appt, error: aErr } = await supabase
        .from("appointments")
        .insert({
          patient_id: patient.id,
          provider_id: providerId,
          service_line: requestedServiceLine || staff_booking.service_type || "consult",
          appointment_type: apptType,
          scheduled_at: slotStart.toISOString(),
          duration_minutes: apptDuration,
          status: "scheduled",
          reason: serviceLabel,
          consultation_booking_id: created.id,
          booking_source: bookingSource,
          booked_by_user_id: bookedByUserId,
        })
        .select("*")
        .single();
      if (aErr) {
        const mapped = responseForAppointmentInsertError(aErr);
        if (mapped) return mapped;
        throw aErr;
      }

      try {
        await supabase.functions.invoke("send-booking-confirmation", {
          body: {
            email: staff_booking.customer_email || patient.email,
            phone: staff_booking.customer_phone || patient.phone,
            name: staff_booking.customer_name || patient.full_name,
            service_label: serviceLabel,
            service_line: requestedServiceLine || staff_booking.service_type || "consult",
            scheduled_at: slotStart.toISOString(),
            duration_minutes: apptDuration,
            confirmation_number: appt.id.slice(0, 8).toUpperCase(),
          },
        });
      } catch (e) {
        console.warn("send-booking-confirmation failed", e);
      }

      await alertStaffAppointmentBooked(supabase, {
        patientId: patient.id,
        patientName: staff_booking.customer_name || patient.full_name || "Patient",
        patientEmail: staff_booking.customer_email || patient.email,
        patientPhone: staff_booking.customer_phone || patient.phone,
        serviceLabel,
        scheduledAt: slotStart.toISOString(),
        confirmationNumber: appt.id.slice(0, 8).toUpperCase(),
      });

      triggerIntakeMagicLinkDelivery(supabase, {
        patientId: patient.id,
        bookingId: created.id,
        appointmentTimeIso: slotStart.toISOString(),
        serviceType: staff_booking.service_type,
      });

      return new Response(
        JSON.stringify({ appointment: appt, booking_id: created.id, mode: "staff" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    // ------------------------------------------------------------------------
    // PATIENT SELF-SERVE PATH
    // ------------------------------------------------------------------------
    const { data: booking, error: bErr } = await supabase
      .from("consultation_bookings").select("*").eq("id", booking_id!).maybeSingle();
    if (bErr || !booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (booking.status !== "paid" && booking.status !== "completed") {
      return new Response(JSON.stringify({ error: "Booking not paid" }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const redeemed = await redeemSlotTokenJtiOnce({
      supabaseAdmin: supabase,
      jti: verifiedSlot.jti,
      tokenExpUnix: verifiedSlot.expiresAtUnix,
      bookingFunction: "book-consult-appointment",
      bookingRef: booking.id,
    });
    if (!redeemed.ok) {
      return new Response(
        JSON.stringify({
          error: "That slot token has already been used. Please pick another time.",
          error_code: redeemed.code,
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const slotEnd = new Date(slotStart.getTime() + apptDuration * 60_000);

    const { data: conflicts } = await supabase
      .from("appointments")
      .select("id, scheduled_at, duration_minutes")
      .eq("provider_id", providerId)
      .neq("status", "cancelled")
      .gte("scheduled_at", new Date(slotStart.getTime() - 2 * 60 * 60_000).toISOString())
      .lte("scheduled_at", slotEnd.toISOString());
    const taken = (conflicts || []).some((a: { scheduled_at: string; duration_minutes: number | null }) => {
      const aS = new Date(a.scheduled_at).getTime();
      const aE = aS + (a.duration_minutes || 30) * 60_000;
      return slotStart.getTime() < aE && slotEnd.getTime() > aS;
    });
    if (taken) {
      return new Response(JSON.stringify({ error: "Slot just got booked. Please pick another." }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    let patientId: string | null = null;
    const email = booking.customer_email;
    if (email) {
      const { data: existPatient } = await supabase
        .from("patients").select("id").eq("email", email).maybeSingle();
      if (existPatient) patientId = existPatient.id;
      else {
        const { data: newPatient } = await supabase.from("patients").insert({
          full_name: booking.customer_name || email,
          email,
          phone: booking.customer_phone,
          primary_program: booking.service_type || "hormone",
          onboarding_status: "consultation_pending",
          consultation_booking_id: booking.id,
        }).select("id").single();
        patientId = newPatient?.id || null;
      }
    }
    if (!patientId) {
      return new Response(JSON.stringify({ error: "Could not resolve patient" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const gfeOk = await hasValidGfeClearance(supabase, patientId);
    if (!gfeOk) {
      return new Response(
        JSON.stringify({
          error:
            "Complete your Good Faith Exam (remote medical clearance) before scheduling your in-person visit. Check your email or patient portal for the Qualiphy link.",
          error_code: "gfe_required",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const serviceLabel =
      SERVICE_LABEL[booking.service_type as string] || "Wellness Assessment";
    const resolvedServiceLine =
      requestedServiceLine ||
      (booking.service_type === "alacarte_followUp"
        ? "follow_up"
        : booking.service_type === "alacarte_labPanel"
          ? "consult"
          : booking.service_type || "consult");

    const { data: appt, error: aErr } = await supabase.from("appointments").insert({
      patient_id: patientId,
      provider_id: providerId,
      service_line: resolvedServiceLine,
      appointment_type: apptType,
      scheduled_at: slotStart.toISOString(),
      duration_minutes: apptDuration,
      status: "scheduled",
      reason: serviceLabel,
      consultation_booking_id: booking.id,
      booking_source: bookingSource,
      booked_by_user_id: bookedByUserId,
    }).select("*").single();
    if (aErr) {
      const mapped = responseForAppointmentInsertError(aErr);
      if (mapped) return mapped;
      throw aErr;
    }

    await supabase.from("consultation_bookings").update({
      booked_for: slotStart.toISOString(),
      calendar_booked_at: new Date().toISOString(),
      booking_source: bookingSource,
      booked_by_user_id: bookedByUserId,
    }).eq("id", booking.id);

    await supabase
      .from("patients")
      .update({ onboarding_status: "consultation_scheduled" })
      .eq("id", patientId)
      .in("onboarding_status", ["gfe_cleared", "consultation_paid", "gfe_pending"]);

    try {
      await supabase.functions.invoke("send-booking-confirmation", {
        body: {
          email,
          phone: booking.customer_phone,
          name: booking.customer_name,
          service_label: serviceLabel,
          service_line: resolvedServiceLine,
          scheduled_at: slotStart.toISOString(),
          duration_minutes: apptDuration,
          confirmation_number: appt.id.slice(0, 8).toUpperCase(),
        },
      });
    } catch (e) { console.warn("send-booking-confirmation failed", e); }

    if (patientId) {
      await alertStaffAppointmentBooked(supabase, {
        patientId,
        patientName: booking.customer_name || "Patient",
        patientEmail: email,
        patientPhone: booking.customer_phone,
        serviceLabel,
        scheduledAt: slotStart.toISOString(),
        confirmationNumber: appt.id.slice(0, 8).toUpperCase(),
      });
    }

    triggerIntakeMagicLinkDelivery(supabase, {
      patientId,
      bookingId: booking.id,
      appointmentTimeIso: slotStart.toISOString(),
      serviceType: booking.service_type as string,
    });

    return new Response(JSON.stringify({ appointment: appt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (e) {
    console.error("book-consult-appointment error", e);
    const mapped = responseForAppointmentInsertError(
      e && typeof e === "object" && "message" in e ? (e as { message?: string }) : null,
    );
    if (mapped) return mapped;
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
