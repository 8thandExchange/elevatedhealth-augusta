import { describe, expect, it } from "vitest";
import { evaluateIvScreening } from "./ivScreeningEngine";

const baseIntake = {
  has_chf: false,
  has_esrd: false,
  is_pregnant: false,
  has_anaphylaxis_history: false,
  has_g6pd_deficiency: false,
  has_ckd: false,
  on_anticoagulants: false,
  has_hypertension_uncontrolled: false,
  has_diabetes: false,
  has_thyroid_disorder: false,
  currently_breastfeeding: false,
  has_sesame_allergy: false,
  has_iv_allergies: false,
};

const nadTherapy = {
  id: "nad-500",
  name: "NAD+ Infusion 500mg",
  requires_g6pd_clearance: true,
  contraindicates_sesame_allergy: false,
};

describe("ivScreeningEngine", () => {
  it("clears healthy intake", () => {
    const result = evaluateIvScreening(baseIntake, nadTherapy);
    expect(result.screening_result).toBe("cleared");
  });

  it("hard-blocks CHF", () => {
    const result = evaluateIvScreening({ ...baseIntake, has_chf: true }, nadTherapy);
    expect(result.screening_result).toBe("blocked");
    expect(result.block_severity).toBe("hard");
  });

  it("blocks G6PD on high-dose vitamin C services", () => {
    const result = evaluateIvScreening(
      { ...baseIntake, has_g6pd_deficiency: true },
      nadTherapy,
    );
    expect(result.screening_result).toBe("blocked");
    expect(result.block_severity).toBe("service_specific");
  });

  it("warns on anticoagulants without blocking", () => {
    const result = evaluateIvScreening(
      { ...baseIntake, on_anticoagulants: true },
      { ...nadTherapy, requires_g6pd_clearance: false },
    );
    expect(result.screening_result).toBe("warned");
    expect(result.staff_actions.length).toBeGreaterThan(0);
  });

  it("hard-blocks ESRD for all IV hydration", () => {
    const result = evaluateIvScreening({ ...baseIntake, has_esrd: true }, {
      ...nadTherapy,
      requires_g6pd_clearance: false,
    });
    expect(result.screening_result).toBe("blocked");
    expect(result.block_severity).toBe("hard");
  });

  it("blocks sesame allergy only on sesame-oil therapies", () => {
    const sesameTherapy = {
      id: "custom-sesame",
      name: "Custom IV (sesame oil base)",
      requires_g6pd_clearance: false,
      contraindicates_sesame_allergy: true,
    };
    const blocked = evaluateIvScreening(
      { ...baseIntake, has_sesame_allergy: true },
      sesameTherapy,
    );
    expect(blocked.screening_result).toBe("blocked");

    const cleared = evaluateIvScreening(
      { ...baseIntake, has_sesame_allergy: true },
      { ...sesameTherapy, contraindicates_sesame_allergy: false },
    );
    expect(cleared.screening_result).toBe("cleared");
  });

  it("G6PD blocks vitamin-C clearance services only", () => {
    const g6pd = { ...baseIntake, has_g6pd_deficiency: true };
    const blocked = evaluateIvScreening(g6pd, nadTherapy);
    expect(blocked.screening_result).toBe("blocked");

    const myers = {
      id: "myers",
      name: "Myers Cocktail",
      requires_g6pd_clearance: false,
      contraindicates_sesame_allergy: false,
    };
    const warned = evaluateIvScreening(g6pd, myers);
    expect(warned.screening_result).not.toBe("blocked");
  });
});
