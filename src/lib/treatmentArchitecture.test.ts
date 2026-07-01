import { describe, expect, it } from "vitest";
import { catalogBySlug } from "./clinicalOptimizationCatalog";
import { glpTherapyKeys, peptideOutcomeGroups, therapyByKey, THERAPY_CATALOG } from "./therapyCatalog";
import { TREATMENT_GOAL_PATHS, therapyLabelsForGoal } from "./treatmentArchitecture";

describe("treatmentArchitecture", () => {
  it("maps weight loss goal to three GLP therapies including retatrutide", () => {
    const wl = TREATMENT_GOAL_PATHS.find((p) => p.id === "weight_loss");
    expect(wl?.therapyKeys).toEqual(["semaglutide", "tirzepatide", "retatrutide"]);
    expect(therapyLabelsForGoal(wl!)).toContain("Retatrutide");
  });

  it("routes IV goal to iv-lounge without wellness assessment CTA copy", () => {
    const iv = TREATMENT_GOAL_PATHS.find((p) => p.id === "iv");
    expect(iv?.href).toBe("/iv-lounge");
    expect(iv?.cta).toBe("Book IV");
    expect(iv?.therapyKeys).toHaveLength(0);
  });
});

describe("therapy catalog ↔ formulary alignment", () => {
  it("links catalog slugs to clinicalOptimizationCatalog rows when present", () => {
    for (const t of THERAPY_CATALOG) {
      if (!t.catalogSlug) continue;
      const item = catalogBySlug(t.catalogSlug);
      if (!item) continue;
      expect(item.slug).toBeTruthy();
    }
  });

  it("lists retatrutide in glp keys but not policy block row", () => {
    expect(glpTherapyKeys()).toContain("retatrutide");
    expect(glpTherapyKeys()).not.toContain("policy_retatrutide_ala_carte");
  });

  it("includes expanded peptide offerings", () => {
    for (const key of ["tesamorelin", "ghk-cu", "sermorelin", "bpc-157"]) {
      expect(therapyByKey(key)?.providerGated).toBe(true);
    }
  });

  it("maps recovery outcome group to BPC-157 and TB-500", () => {
    const recovery = peptideOutcomeGroups().find((g) => g.id === "recovery");
    expect(recovery?.therapyKeys).toEqual(expect.arrayContaining(["bpc-157", "tb-500"]));
  });
});
