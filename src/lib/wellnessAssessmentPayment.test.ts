import { describe, expect, it } from "vitest";
import {
  hasWellnessAssessmentPaid,
  shouldPromptWellnessAssessmentPayment,
} from "./wellnessAssessmentPayment";

describe("wellnessAssessmentPayment", () => {
  it("treats paid consultation_bookings as satisfied even when onboarding lags", () => {
    expect(
      hasWellnessAssessmentPaid({
        onboardingStatus: "account_created",
        hasPaidConsultBooking: true,
      }),
    ).toBe(true);
    expect(
      shouldPromptWellnessAssessmentPayment({
        onboardingStatus: "prequal_consents_complete",
        hasPaidConsultBooking: true,
      }),
    ).toBe(false);
  });

  it("requires payment for new account_created without booking", () => {
    expect(
      shouldPromptWellnessAssessmentPayment({
        onboardingStatus: "account_created",
        hasPaidConsultBooking: false,
      }),
    ).toBe(true);
  });

  it("recognizes post-pay onboarding statuses", () => {
    expect(hasWellnessAssessmentPaid({ onboardingStatus: "gfe_pending" })).toBe(true);
    expect(hasWellnessAssessmentPaid({ onboardingStatus: "consultation_paid" })).toBe(true);
  });
});
