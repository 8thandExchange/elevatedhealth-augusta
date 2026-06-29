// Single source of truth for the onboarding-credit policy on the client.
// The dollar amount is NOT set here. The credit equals whatever the patient
// actually paid for the baseline-labs bundle, read from Stripe at issuance.
// The only thing to tune here is the policy: window and cap behavior.
//
// IMPORTANT: keep these in sync with the edge function env vars
//   ONBOARDING_CREDIT_WINDOW_DAYS and ONBOARDING_CREDIT_CAP_MODE.

export const ONBOARDING_CREDIT = {
  // How long after paying for baseline labs a patient can still enroll and have
  // the labs credited toward their first month.
  windowDays: 30,

  // first_month -> credit caps at the first month's membership price
  // uncapped    -> full credit applied to the first invoice (one invoice only)
  capMode: "first_month" as "first_month" | "uncapped" | "spread",
} as const;

export type JourneyStage =
  | "consult_booked"
  | "consult_completed"
  | "baseline_labs_ordered"
  | "baseline_labs_collected"
  | "baseline_labs_resulted"
  | "results_reviewed"
  | "protocol_recommended"
  | "not_a_candidate"
  | "consent_completed"
  | "membership_enrolled"
  | "active";

// Ordering used for gating UI ("can this patient see the enroll screen yet?").
export const JOURNEY_ORDER: Record<JourneyStage, number> = {
  consult_booked: 10,
  consult_completed: 20,
  baseline_labs_ordered: 30,
  baseline_labs_collected: 40,
  baseline_labs_resulted: 50,
  results_reviewed: 60,
  protocol_recommended: 70,
  not_a_candidate: 70,
  consent_completed: 80,
  membership_enrolled: 90,
  active: 100,
};

// Enrollment is only reachable once consent is complete, which is only reachable
// once a protocol has been recommended after results review.
export function canEnroll(stage: JourneyStage): boolean {
  return JOURNEY_ORDER[stage] >= JOURNEY_ORDER.consent_completed;
}

export function formatCreditCents(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}
