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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { booking_id, slot_start, provider_id } = await req.json();
    if (!booking_id || !slot_start || !provider_id) {
      return new Response(JSON.stringify({ error: "booking_id, slot_start, provider_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: booking, error: bErr } = await supabase
      .from("consultation_bookings").select("*").eq("id", booking_id).maybeSingle();
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

    // Find/create patient by email
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

    const { data: appt, error: aErr } = await supabase.from("appointments").insert({
      patient_id: patientId,
      provider_id,
      service_line: booking.service_type || "hormone",
      appointment_type: "rn_wellness_assessment",
      scheduled_at: slotStart.toISOString(),
      duration_minutes: 30,
      status: "scheduled",
      reason: "Wellness Assessment",
      consultation_booking_id: booking.id,
      booking_source: "patient_self_serve",
    }).select("*").single();
    if (aErr) throw aErr;

    await supabase.from("consultation_bookings").update({
      booked_for: slotStart.toISOString(),
      calendar_booked_at: new Date().toISOString(),
    }).eq("id", booking.id);

    try {
      await supabase.functions.invoke("send-booking-confirmation", {
        body: {
          email, phone: booking.customer_phone, name: booking.customer_name,
          appointment_type: "Wellness Assessment",
          scheduled_at: slotStart.toISOString(), duration_minutes: 30,
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
