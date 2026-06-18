import { POST_CONSULT_PAYMENT_STATUSES } from "@/lib/gfeClearance";

/** Statuses where $79 was not required (staff-added / legacy import). */
const CONSULT_WAIVED_STATUSES = new Set([
  "consultation_complete",
  "intake_complete",
  "treatment_active",
  "active",
  "existing_patient",
]);

export interface WellnessPaymentContext {
  onboardingStatus?: string | null;
  /** True when consultation_bookings has status=paid for this patient email. */
  hasPaidConsultBooking?: boolean;
  elevatedMembershipStatus?: string | null;
}

/** One-time $79 wellness assessment is satisfied — do not send patient to Stripe again. */
export function hasWellnessAssessmentPaid(ctx: WellnessPaymentContext): boolean {
  if (ctx.hasPaidConsultBooking) return true;
  const status = ctx.onboardingStatus;
  if (status && POST_CONSULT_PAYMENT_STATUSES.has(status)) return true;
  if (status && CONSULT_WAIVED_STATUSES.has(status)) return true;
  return false;
}

export function shouldPromptWellnessAssessmentPayment(ctx: WellnessPaymentContext): boolean {
  return !hasWellnessAssessmentPaid(ctx);
}

export function isActiveElevatedMember(elevatedMembershipStatus: string | null | undefined): boolean {
  return elevatedMembershipStatus === "active";
}
