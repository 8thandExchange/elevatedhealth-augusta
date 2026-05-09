import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// TODO(inventory): When inventory tracking goes live for the IV lounge, this
// edge function should reserve (not yet decrement) the SKUs implied by the
// chosen IV therapy + addons against inventory_skus / inventory_lots. Actual
// dispensation still happens at the chair via DispenseFromInventoryModal so the
// audit trail records who administered, when, from which lot. See
// supabase/migrations/20260509220000_inventory_tracking_fefo.sql for the
// dispense_from_lot() helper.

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { session_id, slot_start, provider_id, customer_phone } = await req.json();
    if (!session_id || !slot_start || !provider_id) {
      return new Response(JSON.stringify({ error: "session_id, slot_start, provider_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ error: "Payment not completed" }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

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
        })
        .select("id")
        .single();
      if (cErr) throw cErr;
      bookingId = created.id;
    } else if (existing.appointment_id) {
      return new Response(JSON.stringify({ error: "Slot already booked for this session", appointment_id: existing.appointment_id }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const slotStart = new Date(slot_start);
    const slotEnd = new Date(slotStart.getTime() + 60 * 60_000);

    // Conflict check
    const { data: conflicts } = await supabase
      .from("appointments")
      .select("id, scheduled_at, duration_minutes")
      .eq("provider_id", provider_id)
      .neq("status", "cancelled")
      .gte("scheduled_at", new Date(slotStart.getTime() - 2 * 60 * 60_000).toISOString())
      .lte("scheduled_at", slotEnd.toISOString());
    const taken = (conflicts || []).some((a: any) => {
      const aS = new Date(a.scheduled_at).getTime();
      const aE = aS + (a.duration_minutes || 30) * 60_000;
      return slotStart.getTime() < aE && slotEnd.getTime() > aS;
    });
    if (taken) {
      return new Response(JSON.stringify({ error: "Slot just got booked. Please pick another." }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
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
      provider_id,
      service_line: "iv",
      appointment_type: "iv_session",
      scheduled_at: slotStart.toISOString(),
      duration_minutes: 60,
      status: "scheduled",
      reason: therapyName,
      stripe_session_id: session_id,
      iv_drip_booking_id: bookingId,
      booking_source: "patient_self_serve",
    }).select("*").single();
    if (aErr) throw aErr;

    await supabase.from("iv_drip_bookings").update({ appointment_id: appt.id }).eq("id", bookingId);

    // Fire confirmation
    try {
      await supabase.functions.invoke("send-booking-confirmation", {
        body: {
          email: customerEmail,
          phone: customer_phone,
          name: customerName,
          appointment_type: therapyName,
          scheduled_at: slotStart.toISOString(),
          duration_minutes: 60,
        },
      });
    } catch (e) { console.warn("send-booking-confirmation failed", e); }

    return new Response(JSON.stringify({ appointment: appt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (e) {
    console.error("book-iv-appointment error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
