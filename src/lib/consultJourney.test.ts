import { describe, expect, it } from "vitest";
import { canBookWellnessVisit, getConsultJourneyStageIndex } from "./consultJourney";

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
});
