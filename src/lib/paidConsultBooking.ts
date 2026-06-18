import { supabase } from "@/integrations/supabase/client";
import { hasWellnessAssessmentPaid } from "@/lib/wellnessAssessmentPayment";

export interface PaidConsultBookingRow {
  id: string;
  service_type: string | null;
  customer_email: string;
  customer_name: string | null;
  booked_for: string | null;
}

const BOOKING_SELECT =
  "id, service_type, customer_email, customer_name, booked_for";

/** Latest paid consultation_bookings row for an email (scheduling source of truth). */
export async function fetchPaidConsultBookingByEmail(
  email: string,
): Promise<PaidConsultBookingRow | null> {
  const normalized = email.toLowerCase().trim();
  if (!normalized) return null;

  const { data, error } = await supabase
    .from("consultation_bookings")
    .select(BOOKING_SELECT)
    .eq("customer_email", normalized)
    .eq("status", "paid")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as PaidConsultBookingRow | null) ?? null;
}

/** Service role backfill when onboarding proves $79 paid but no booking row exists. */
export async function ensurePaidConsultBookingForScheduling(): Promise<PaidConsultBookingRow | null> {
  const { data, error } = await supabase.functions.invoke("ensure-paid-consult-booking");
  if (error) return null;
  if (data?.error_code === "not_paid") return null;
  return (data?.booking as PaidConsultBookingRow | undefined) ?? null;
}

/**
 * Resolve a schedulable paid booking — matches enrollment paid detection, then backfills
 * consultation_bookings when onboarding_status is post-pay but Stripe row is missing.
 */
export async function resolveSchedulableConsultBooking(input: {
  email: string;
  onboardingStatus?: string | null;
}): Promise<PaidConsultBookingRow | null> {
  const existing = await fetchPaidConsultBookingByEmail(input.email);
  const wellnessPaid = hasWellnessAssessmentPaid({
    onboardingStatus: input.onboardingStatus,
    hasPaidConsultBooking: !!existing?.id,
  });

  if (existing) return existing;
  if (!wellnessPaid) return null;
  return ensurePaidConsultBookingForScheduling();
}
