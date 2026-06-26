import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";
import {
  getSlotSigningKey,
  redeemSlotTokenJtiOnce,
  verifySlotToken,
} from "../_shared/slot-token.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

// TODO(inventory): When inventory tracking goes live for the IV lounge, this
// edge function should reserve (not yet decrement) the SKUs implied by the
// chosen IV therapy + addons against inventory_skus / inventory_lots. Actual
// dispensation still happens at the chair via DispenseFromInventoryModal so the
// audit trail records who administered, when, from which lot. See
// supabase/migrations/20260509220000_inventory_tracking_fefo.sql for the
// dispense_from_lot() helper.

// Allowed booking_source values must match the CHECK constraint added in
// supabase/migrations/20260510010000_booking_attribution_fields.sql
const ALLOWED_SOURCES = new Set([
  "self_service",
  "staff_phone",
  "chat",
  "walk_in",
]);

// Allowed payment_status values for staff-mode bookings (no Stripe pre-pay).
const STAFF_PAYMENT_STATUS = new Set([
  "pay_at_visit",
  "card_on_file_pending",
  "member_no_charge",
  "paid_external",
]);

interface RequestBody {
  // Patient self-serve path
  session_id?: string;
  slot_token?: string;
  intake_id?: string;
  // Phone (legacy compatibility) — for staff_mode use staff_booking.customer_phone
  customer_phone?: string;
  // Staff attribution (always optional). Must pair with a non-self_service
  // booking_source to take effect.
  booked_by_user_id?: string;
  booking_source?: string;
  // Staff-mode payload. When present we skip the Stripe round-trip and
  // create the iv_drip_bookings row directly. Caller must be staff or admin.
  staff_booking?: {
    patient_id: string;
    therapy_id: string;
    therapy_name?: string;
    addon_ids?: string[];
    payment_status: string; // see STAFF_PAYMENT_STATUS
    amount_cents?: number;
    customer_email?: string;
    customer_name?: string;
    customer_phone?: string;
  };
}

async function authorizeStaff(
  req: Request,
  supabase: ReturnType<typeof createClient>,
): Promise<{ ok: true; callerId: string } | { ok: false; status: number; error: string }> {
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
  const isStaff = (roles || []).some(
    (r: { role: string }) => r.role === "staff" || r.role === "admin",
  );
  if (!isStaff) {
    return { ok: false, status: 403, error: "Only staff or admin may book on a patient's behalf" };
  }
  return { ok: true, callerId };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json()) as RequestBody;
    const {
      session_id,
      slot_token,
      intake_id,
      customer_phone,
      booked_by_user_id: rawBookedBy,
      booking_source: rawSource,
      staff_booking,
    } = body;

    if (!slot_token) {
      return new Response(
        JSON.stringify({ error: "slot_token is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!session_id && !staff_booking) {
      return new Response(
        JSON.stringify({ error: "Either session_id (self-serve) or staff_booking (staff-mode) is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const signingKey = getSlotSigningKey();
    if (!signingKey) {
      console.error("book-iv-appointment: SLOT_SIGNING_KEY missing; refusing booking validation");
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
    if (verifiedSlot.serviceLine !== "iv") {
      return new Response(
        JSON.stringify({
          error: "Invalid slot for IV booking.",
          error_code: "invalid_slot_token",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const slotStart = new Date(verifiedSlot.startIso);
    const providerId = verifiedSlot.providerId;

    // Resolve booking_source. Default self_service for the Stripe-paid flow,
    // staff_phone (or the value from rawSource) for the staff_booking flow.
    let bookingSource: string =
      typeof rawSource === "string" && ALLOWED_SOURCES.has(rawSource)
        ? rawSource
        : staff_booking
          ? "staff_phone"
          : "self_service";
    let bookedByUserId: string | null = null;

    // Authorize staff if either we're in staff_booking mode OR the caller
    // claims a non-self-service booking_source.
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
      if (bookingSource === "self_service") {
        // Staff caller forgot to set booking_source; default to staff_phone
        // since they're clearly authenticated as staff.
        bookingSource = "staff_phone";
      }
    }

    // ------------------------------------------------------------------------
    // STAFF-MODE PATH (no Stripe verification)
    // ------------------------------------------------------------------------
    if (staff_booking) {
      const redeemed = await redeemSlotTokenJtiOnce({
        supabaseAdmin: supabase,
        jti: verifiedSlot.jti,
        tokenExpUnix: verifiedSlot.expiresAtUnix,
        bookingFunction: "book-iv-appointment",
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
      // Resolve patient — staff path REQUIRES a known patient_id (the modal
      // does the search/create UI before invoking us).
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

      const therapyId = staff_booking.therapy_id;
      const { data: therapy } = await supabase
        .from("iv_therapies")
        .select("id, name, price")
        .eq("id", therapyId)
        .maybeSingle();
      const therapyName = staff_booking.therapy_name || therapy?.name || "IV Therapy";

      const slotEnd = new Date(slotStart.getTime() + 60 * 60_000);

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

      const { data: created, error: cErr } = await supabase
        .from("iv_drip_bookings")
        .insert({
          therapy_id: therapyId,
          therapy_name: therapyName,
          addon_ids: staff_booking.addon_ids || [],
          customer_email: staff_booking.customer_email || patient.email || "",
          customer_name: staff_booking.customer_name || patient.full_name || "",
          customer_phone: staff_booking.customer_phone || patient.phone || null,
          amount_paid: staff_booking.amount_cents ?? 0,
          payment_status: staff_booking.payment_status,
          booking_source: bookingSource,
          booked_by_user_id: bookedByUserId,
        })
        .select("id")
        .single();
      if (cErr) throw cErr;

      const { data: appt, error: aErr } = await supabase
        .from("appointments")
        .insert({
          patient_id: patient.id,
          provider_id: providerId,
          service_line: "iv",
          appointment_type: "iv_session",
          scheduled_at: slotStart.toISOString(),
          duration_minutes: 60,
          status: "scheduled",
          reason: therapyName,
          iv_drip_booking_id: created.id,
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

      await supabase
        .from("iv_drip_bookings")
        .update({ appointment_id: appt.id })
        .eq("id", created.id);

      try {
        await supabase.functions.invoke("send-booking-confirmation", {
          body: {
            email: staff_booking.customer_email || patient.email,
            phone: staff_booking.customer_phone || patient.phone,
            name: staff_booking.customer_name || patient.full_name,
            service_label: therapyName,
            service_line: "iv",
            scheduled_at: slotStart.toISOString(),
            duration_minutes: 60,
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
    // PATIENT SELF-SERVE PATH (Stripe-paid)
    // ------------------------------------------------------------------------
    // Validate the Stripe session id BEFORE redeeming the slot token. Real
    // Checkout Session ids start with "cs_". A malformed value (e.g. the
    // unsubstituted "{CHECKOUT_SESSION_ID}" placeholder from a bad success_url)
    // must fail here so the patient's reserved slot token is NOT burned and they
    // can retry. This guards against the 2026-06-22 incident where every IV
    // booking silently failed after consuming its slot token.
    if (!session_id || !session_id.startsWith("cs_")) {
      return new Response(
        JSON.stringify({
          error: "Invalid payment session. Your slot is still held — please retry, or call us if this persists.",
          error_code: "invalid_session_id",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ error: "Payment not completed" }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const meta = session.metadata || {};
    const therapyId = meta.therapy_id;
    const therapyName = meta.therapy_name || "IV Therapy";
    const customerEmail = session.customer_details?.email || session.customer_email || "";
    const customerName = session.customer_details?.name || "";

    // Upsert iv_drip_bookings
    const { data: existing } = await supabase
      .from("iv_drip_bookings")
      .select("id, appointment_id")
      .eq("stripe_session_id", session_id)
      .maybeSingle();

    let bookingId = existing?.id;
    if (!bookingId) {
      const { data: created, error: cErr } = await supabase
        .from("iv_drip_bookings")
        .insert({
          stripe_session_id: session_id,
          stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
          therapy_id: therapyId,
          therapy_name: therapyName,
          addon_ids: meta.addon_ids ? meta.addon_ids.split(",").filter(Boolean) : [],
          customer_email: customerEmail,
          customer_name: customerName,
          customer_phone: customer_phone || null,
          amount_paid: session.amount_total || 0,
          payment_status: "paid",
          booking_source: bookingSource,
          booked_by_user_id: bookedByUserId,
        })
        .select("id")
        .single();
      if (cErr) throw cErr;
      bookingId = created.id;
    } else if (existing?.appointment_id) {
      return new Response(JSON.stringify({ error: "Slot already booked for this session", appointment_id: existing.appointment_id }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const slotEnd = new Date(slotStart.getTime() + 60 * 60_000);

    // Conflict check
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

    // Payment is confirmed paid, not already booked for this session, and the
    // slot is free. Redeem the one-time slot token as late as possible — a failed
    // payment or a slot conflict above must never burn the patient's held slot.
    const redeemed = await redeemSlotTokenJtiOnce({
      supabaseAdmin: supabase,
      jti: verifiedSlot.jti,
      tokenExpUnix: verifiedSlot.expiresAtUnix,
      bookingFunction: "book-iv-appointment",
      bookingRef: session_id,
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

    // Find or create patient by email
    let patientId: string | null = null;
    if (customerEmail) {
      const { data: existPatient } = await supabase
        .from("patients").select("id").eq("email", customerEmail).maybeSingle();
      if (existPatient) {
        patientId = existPatient.id;
      } else {
        const { data: newPatient } = await supabase.from("patients").insert({
          full_name: customerName || customerEmail,
          email: customerEmail,
          phone: customer_phone || null,
          primary_program: "iv",
          onboarding_status: "iv_only",
        }).select("id").single();
        patientId = newPatient?.id || null;
      }
    }

    if (!patientId) {
      return new Response(JSON.stringify({ error: "Could not resolve patient" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { data: appt, error: aErr } = await supabase.from("appointments").insert({
      patient_id: patientId,
      provider_id: providerId,
      service_line: "iv",
      appointment_type: "iv_session",
      scheduled_at: slotStart.toISOString(),
      duration_minutes: 60,
      status: "scheduled",
      reason: therapyName,
      stripe_session_id: session_id,
      iv_drip_booking_id: bookingId,
      booking_source: bookingSource,
      booked_by_user_id: bookedByUserId,
    }).select("*").single();
    if (aErr) {
      const mapped = responseForAppointmentInsertError(aErr);
      if (mapped) return mapped;
      throw aErr;
    }

    await supabase.from("iv_drip_bookings").update({ appointment_id: appt.id }).eq("id", bookingId);

    if (typeof intake_id === "string" && intake_id) {
      await supabase
        .from("iv_intake_responses")
        .update({ appointment_id: appt.id, updated_at: new Date().toISOString() })
        .eq("id", intake_id);
    }

    // Fire confirmation. send-booking-confirmation now honours service_label,
    // scheduled_at, duration_minutes, location, and confirmation_number so the
    // email/SMS reflect the real visit details (instead of the legacy
    // hardcoded "Clinical Strategy Session" template).
    try {
      await supabase.functions.invoke("send-booking-confirmation", {
        body: {
          email: customerEmail,
          phone: customer_phone,
          name: customerName,
          service_label: therapyName,
          service_line: "iv",
          scheduled_at: slotStart.toISOString(),
          duration_minutes: 60,
          confirmation_number: appt.id.slice(0, 8).toUpperCase(),
        },
      });
    } catch (e) { console.warn("send-booking-confirmation failed", e); }

    return new Response(JSON.stringify({ appointment: appt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (e) {
    console.error("book-iv-appointment error", e);
    const mapped = responseForAppointmentInsertError(e && typeof e === "object" && "message" in e ? (e as { message?: string }) : null);
    if (mapped) return mapped;
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
