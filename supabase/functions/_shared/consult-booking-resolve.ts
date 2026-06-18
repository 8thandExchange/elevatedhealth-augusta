import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { hasWellnessAssessmentPaid } from "./wellness-assessment-payment.ts";

export const CONSULT_FEE_USD = 79;

export function generateCreditCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "EH-";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function mapProgramToServiceType(primaryProgram: string | null | undefined): string {
  const p = (primaryProgram || "").toLowerCase();
  if (p.includes("weight") || p === "weight_loss") return "weight_loss";
  if (p.includes("peptide")) return "peptide";
  if (p.includes("iv")) return "iv_therapy";
  return "hormone";
}

export type ResolvedConsultBooking = {
  id: string;
  service_type: string | null;
  customer_email: string;
  customer_name: string | null;
  booked_for: string | null;
  created?: boolean;
};

type PatientRow = {
  id: string;
  email: string;
  full_name: string | null;
  onboarding_status: string | null;
  primary_program: string | null;
  consultation_booking_id: string | null;
};

async function fetchPaidBookingByEmail(
  supabase: SupabaseClient,
  email: string,
): Promise<ResolvedConsultBooking | null> {
  const normalized = email.toLowerCase().trim();
  if (!normalized) return null;

  const { data } = await supabase
    .from("consultation_bookings")
    .select("id, service_type, customer_email, customer_name, booked_for")
    .eq("customer_email", normalized)
    .eq("status", "paid")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data as ResolvedConsultBooking | null;
}

async function fetchPaidBookingById(
  supabase: SupabaseClient,
  bookingId: string,
): Promise<ResolvedConsultBooking | null> {
  const { data } = await supabase
    .from("consultation_bookings")
    .select("id, service_type, customer_email, customer_name, booked_for")
    .eq("id", bookingId)
    .eq("status", "paid")
    .maybeSingle();

  return data as ResolvedConsultBooking | null;
}

/** Find paid booking by email / patient FK, or backfill when onboarding proves $79 satisfied. */
export async function resolveOrCreatePaidConsultBooking(
  supabase: SupabaseClient,
  patient: PatientRow,
): Promise<{ ok: true; booking: ResolvedConsultBooking } | { ok: false; error: string; status: number }> {
  const email = (patient.email || "").toLowerCase().trim();
  if (!email) {
    return { ok: false, error: "Patient email is required to schedule.", status: 400 };
  }

  let booking =
    (patient.consultation_booking_id
      ? await fetchPaidBookingById(supabase, patient.consultation_booking_id)
      : null) ?? (await fetchPaidBookingByEmail(supabase, email));

  if (booking) {
    return { ok: true, booking };
  }

  const wellnessPaid = hasWellnessAssessmentPaid({
    onboardingStatus: patient.onboarding_status,
    hasPaidConsultBooking: false,
  });

  if (!wellnessPaid) {
    return {
      ok: false,
      error: "No paid $79 wellness assessment found for this account.",
      status: 402,
    };
  }

  const creditCode = generateCreditCode();
  const serviceType = mapProgramToServiceType(patient.primary_program);

  const { data: created, error: insertError } = await supabase
    .from("consultation_bookings")
    .insert({
      customer_email: email,
      customer_name: patient.full_name,
      status: "paid",
      amount_paid: CONSULT_FEE_USD,
      credit_code: creditCode,
      service_type: serviceType,
      booking_source: "self_service",
      notes:
        "Auto-created for patient self-scheduling — wellness fee already satisfied on patient record.",
    })
    .select("id, service_type, customer_email, customer_name, booked_for")
    .maybeSingle();

  if (insertError || !created) {
    const { data: peer } = await supabase
      .from("consultation_bookings")
      .select("id, service_type, customer_email, customer_name, booked_for")
      .eq("customer_email", email)
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (peer) {
      return { ok: true, booking: peer as ResolvedConsultBooking };
    }

    return {
      ok: false,
      error: insertError?.message ?? "Could not create scheduling record.",
      status: 500,
    };
  }

  if (!patient.consultation_booking_id) {
    await supabase
      .from("patients")
      .update({ consultation_booking_id: created.id })
      .eq("id", patient.id)
      .is("consultation_booking_id", null);
  }

  return {
    ok: true,
    booking: { ...(created as ResolvedConsultBooking), created: true },
  };
}
