import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
};

const CONSULT_FEE_USD = 79;

interface RequestBody {
  // Patient self-serve path
  booking_id?: string;
  // Slot
  slot_start?: string;
  provider_id?: string;
  // Staff attribution
  booked_by_user_id?: string;
  booking_source?: string;
  // Staff-mode payload. When present we create a consultation_bookings row
  // ourselves (no Stripe pre-pay) and create the appointment.
  staff_booking?: {
    patient_id: string;
    service_type: string; // hormone | weight_loss | peptide
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
      slot_start,
      provider_id,
      booked_by_user_id: rawBookedBy,
      booking_source: rawSource,
      staff_booking,
    } = body;

    if (!slot_start || !provider_id) {
      return new Response(
        JSON.stringify({ error: "slot_start and provider_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!booking_id && !staff_booking) {
      return new Response(
        JSON.stringify({ error: "Either booking_id (self-serve) or staff_booking (staff-mode) is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

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

      const slotStart = new Date(slot_start);
      const slotEnd = new Date(slotStart.getTime() + 30 * 60_000);

      const { data: conflicts } = await supabase
        .from("appointments")
        .select("id, scheduled_at, duration_minutes")
        .eq("provider_id", provider_id)
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
          provider_id,
          service_line: staff_booking.service_type || "consult",
          appointment_type: "rn_wellness_assessment",
          scheduled_at: slotStart.toISOString(),
          duration_minutes: 30,
          status: "scheduled",
          reason: serviceLabel,
          consultation_booking_id: created.id,
          booking_source: bookingSource,
          booked_by_user_id: bookedByUserId,
        })
        .select("*")
        .single();
      if (aErr) throw aErr;

      try {
        await supabase.functions.invoke("send-booking-confirmation", {
          body: {
            email: staff_booking.customer_email || patient.email,
            phone: staff_booking.customer_phone || patient.phone,
            name: staff_booking.customer_name || patient.full_name,
            service_label: serviceLabel,
            service_line: staff_booking.service_type || "consult",
            scheduled_at: slotStart.toISOString(),
            duration_minutes: 30,
            confirmation_number: appt.id.slice(0, 8).toUpperCase(),
          },
        });
      } catch (e) {
        console.warn("send-booking-confirmation failed", e);
      }

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

    const slotStart = new Date(slot_start);
    const slotEnd = new Date(slotStart.getTime() + 30 * 60_000);

    const { data: conflicts } = await supabase
      .from("appointments")
      .select("id, scheduled_at, duration_minutes")
      .eq("provider_id", provider_id)
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

    const serviceLabel =
      SERVICE_LABEL[booking.service_type as string] || "Wellness Assessment";

    const { data: appt, error: aErr } = await supabase.from("appointments").insert({
      patient_id: patientId,
      provider_id,
      service_line: booking.service_type || "consult",
      appointment_type: "rn_wellness_assessment",
      scheduled_at: slotStart.toISOString(),
      duration_minutes: 30,
      status: "scheduled",
      reason: serviceLabel,
      consultation_booking_id: booking.id,
      booking_source: bookingSource,
      booked_by_user_id: bookedByUserId,
    }).select("*").single();
    if (aErr) throw aErr;

    await supabase.from("consultation_bookings").update({
      booked_for: slotStart.toISOString(),
      calendar_booked_at: new Date().toISOString(),
      booking_source: bookingSource,
      booked_by_user_id: bookedByUserId,
    }).eq("id", booking.id);

    try {
      await supabase.functions.invoke("send-booking-confirmation", {
        body: {
          email,
          phone: booking.customer_phone,
          name: booking.customer_name,
          service_label: serviceLabel,
          service_line: booking.service_type || "consult",
          scheduled_at: slotStart.toISOString(),
          duration_minutes: 30,
          confirmation_number: appt.id.slice(0, 8).toUpperCase(),
        },
      });
    } catch (e) { console.warn("send-booking-confirmation failed", e); }

    return new Response(JSON.stringify({ appointment: appt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (e) {
    console.error("book-consult-appointment error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
