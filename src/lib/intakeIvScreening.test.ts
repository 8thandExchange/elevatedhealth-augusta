import { describe, expect, it } from "vitest";
import { mapIntakeWithIvScreening } from "./intakeToAssessment";

describe("IV screening in unified intake assessment", () => {
  it("CHF hard block produces blocking flag in draft", () => {
    const draft = mapIntakeWithIvScreening(
      { intake_interest_iv: true },
      { has_chf: true },
    );
    expect(draft.ivScreeningFlags?.blocked).toBe(true);
    expect(draft.hardStops).toContain("iv_screening_blocked");
    expect(draft.preFlaggedContraindications).toContain("chf");
  });

  it("G6PD with high-dose vit C pathway flags g6pd contraindication", () => {
    const draft = mapIntakeWithIvScreening(
      { intake_interest_iv: true },
      { has_g6pd_deficiency: true },
    );
    expect(draft.ivScreeningFlags?.blocked).toBe(true);
    expect(draft.preFlaggedContraindications).toContain("g6pd_high_dose_vitc");
  });
});
