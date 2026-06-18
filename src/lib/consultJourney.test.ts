import { describe, expect, it } from "vitest";
import {
  canBookWellnessVisit,
  getConsultJourneyPatientAction,
  getConsultJourneyStageIndex,
} from "./consultJourney";

describe("consultJourney", () => {
  it("blocks booking until GFE cleared", () => {
    expect(
      canBookWellnessVisit({ onboardingStatus: "consultation_paid", gfeRows: [] }),
    ).toBe(false);
    expect(
      canBookWellnessVisit({
        onboardingStatus: "gfe_cleared",
        gfeRows: [],
      }),
    ).toBe(true);
  });

  it("places paid patient on GFE step", () => {
    const idx = getConsultJourneyStageIndex({ onboardingStatus: "consultation_paid" });
    expect(idx).toBeGreaterThanOrEqual(4);
  });

  it("advances account_created when paid booking exists", () => {
    const idx = getConsultJourneyStageIndex({
      onboardingStatus: "account_created",
      hasPaidConsultBooking: true,
    });
    expect(idx).toBe(4);
    const action = getConsultJourneyPatientAction({
      onboardingStatus: "account_created",
      hasPaidConsultBooking: true,
    });
    expect(action.ctaPath).not.toBe("/consult/start");
    expect(action.title).toMatch(/Good Faith Exam/i);
  });
});
