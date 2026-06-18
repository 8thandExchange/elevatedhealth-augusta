import { POST_CONSULT_PAYMENT_STATUSES } from "./gfe-clearance.ts";

const CONSULT_WAIVED_STATUSES = new Set([
  "consultation_complete",
  "intake_complete",
  "treatment_active",
  "active",
  "existing_patient",
]);

export interface WellnessPaymentContext {
  onboardingStatus?: string | null;
  hasPaidConsultBooking?: boolean;
}

export function hasWellnessAssessmentPaid(ctx: WellnessPaymentContext): boolean {
  if (ctx.hasPaidConsultBooking) return true;
  const status = ctx.onboardingStatus;
  if (status && POST_CONSULT_PAYMENT_STATUSES.has(status)) return true;
  if (status && CONSULT_WAIVED_STATUSES.has(status)) return true;
  return false;
}
