import { describe, expect, it } from "vitest";
import { hasWellnessAssessmentPaid } from "./wellnessAssessmentPayment";

describe("paid consult scheduling alignment", () => {
  it("treats gfe_cleared as paid even without consultation_bookings row", () => {
    expect(
      hasWellnessAssessmentPaid({
        onboardingStatus: "gfe_cleared",
        hasPaidConsultBooking: false,
      }),
    ).toBe(true);
  });

  it("requires booking or post-pay status before scheduling backfill", () => {
    expect(
      hasWellnessAssessmentPaid({
        onboardingStatus: "account_created",
        hasPaidConsultBooking: false,
      }),
    ).toBe(false);
    expect(
      hasWellnessAssessmentPaid({
        onboardingStatus: "account_created",
        hasPaidConsultBooking: true,
      }),
    ).toBe(true);
  });
});
