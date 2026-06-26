import { describe, expect, it } from "vitest";
import {
  assertComboPricingInvariants,
  COMBO_DUPLICATE_CARE_SAVINGS_CENTS,
  getValidAddonsForAnchor,
  inferAnchorFromPatient,
  listComboOptions,
  quoteCombo,
} from "./elevatedComboPrograms";

describe("elevatedComboPrograms", () => {
  it("passes pricing invariants", () => {
    assertComboPricingInvariants();
  });

  it("lists 12 options for unknown gender (4 anchors × 3 each)", () => {
    expect(listComboOptions(null)).toHaveLength(12);
  });

  it("filters hormone add-ons by gender", () => {
    expect(getValidAddonsForAnchor("glp1_semaglutide", "male")).toEqual(["trt"]);
    expect(getValidAddonsForAnchor("glp1_semaglutide", "female")).toEqual(["hrt"]);
    expect(getValidAddonsForAnchor("trt", "male")).toEqual([
      "glp1_semaglutide",
      "glp1_tirzepatide",
    ]);
  });

  it("quotes GLP-1 + TRT at $498/mo with $100 savings", () => {
    const q = quoteCombo({ anchor: "glp1_semaglutide", addon: "trt" });
    expect(q.totalMonthlyCents).toBe(49_800);
    expect(q.savingsVsFullDualCents).toBe(COMBO_DUPLICATE_CARE_SAVINGS_CENTS);
    expect(q.marketingHeadline).toContain("$149");
  });

  it("quotes GLP-1 + HRT at $478/mo", () => {
    const q = quoteCombo({ anchor: "glp1_semaglutide", addon: "hrt" });
    expect(q.totalMonthlyCents).toBe(47_800);
  });

  it("is symmetric regardless of anchor order", () => {
    const a = quoteCombo({ anchor: "glp1_tirzepatide", addon: "trt" }).totalMonthlyCents;
    const b = quoteCombo({ anchor: "trt", addon: "glp1_tirzepatide" }).totalMonthlyCents;
    expect(a).toBe(b);
    expect(a).toBe(59_800);
  });

  it("uses Expanded labs when GLP-1 is in the mix", () => {
    const q = quoteCombo({ anchor: "trt", addon: "glp1_semaglutide" });
    expect(q.onboardingLabSlug).toBe("weight-optimization");
  });

  it("infers anchor from primary_program", () => {
    expect(inferAnchorFromPatient({ primary_program: "weight_loss" })).toBe("glp1_semaglutide");
    expect(inferAnchorFromPatient({ primary_program: "tirzepatide" })).toBe("glp1_tirzepatide");
    expect(
      inferAnchorFromPatient({ primary_program: "hormone", gender: "male" }),
    ).toBe("trt");
  });
});
