import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

export const GFE_VALIDITY_MONTHS = 12;

export const POST_CONSULT_PAYMENT_STATUSES = new Set([
  "consultation_paid",
  "consultation_complete",
  "intake_complete",
  "awaiting_blood_work",
  "labs_in_progress",
  "results_ready",
  "labs_reviewed",
  "protocol_review",
  "protocol_approved",
  "treatment_active",
  "active",
  "awaiting_medical_clearance",
  "glp1_approved",
  "medical_clearance_complete",
  "glp1_rx_sent",
  "rx_sent",
]);

export function computeGfeExpiresAtIso(approvedAt: Date): string {
  const d = new Date(approvedAt);
  d.setUTCMonth(d.getUTCMonth() + GFE_VALIDITY_MONTHS);
  return d.toISOString();
}

export function splitFullName(fullName: string): { first_name: string; last_name: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first_name: "Patient", last_name: "Unknown" };
  if (parts.length === 1) return { first_name: parts[0], last_name: parts[0] };
  return { first_name: parts[0], last_name: parts.slice(1).join(" ") };
}

export function formatPhoneE164(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (raw.startsWith("+") && digits.length >= 10) return `+${digits}`;
  return null;
}

export async function assertConsultPaidForGfe(
  supabase: SupabaseClient,
  patientId: string,
  patientEmail: string | null,
  onboardingStatus: string | null,
): Promise<{ ok: true; consultation_booking_id?: string } | { ok: false; message: string }> {
  if (onboardingStatus && POST_CONSULT_PAYMENT_STATUSES.has(onboardingStatus)) {
    return { ok: true };
  }

  if (patientEmail) {
    const { data: booking } = await supabase
      .from("consultation_bookings")
      .select("id")
      .eq("customer_email", patientEmail.toLowerCase().trim())
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (booking?.id) {
      return { ok: true, consultation_booking_id: booking.id };
    }
  }

  return {
    ok: false,
    message:
      "Patient must complete the $79 wellness assessment payment before a remote GFE link can be sent.",
  };
}

export async function hasValidGfeClearance(
  supabase: SupabaseClient,
  patientId: string,
): Promise<boolean> {
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("gfe_clearances")
    .select("id")
    .eq("patient_id", patientId)
    .eq("status", "approved")
    .gt("expires_at", now)
    .limit(1);

  return (data?.length ?? 0) > 0;
}

export function mapQualiphyExamStatus(status: string): string {
  switch (status) {
    case "Approved":
      return "approved";
    case "Rejected":
      return "rejected";
    case "Deferred to Medical Director":
      return "deferred";
    case "Missed":
      return "missed";
    case "NA":
      return "na";
    default:
      return "rejected";
  }
}
