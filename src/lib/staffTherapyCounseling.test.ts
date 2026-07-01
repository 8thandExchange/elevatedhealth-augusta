import { describe, expect, it } from "vitest";
import {
  C03_PROGRAM_AMOUNT,
  GLP1_PROGRAM_COUNSELING,
  RETATRUTIDE_PEPTIDE_LAYER_RULE,
  retatrutideMonthlyDisplayPrice,
  REVENUE_LANE_BULLETS,
} from "./staffTherapyCounseling";
import { ACTIVE_SERVICES } from "./serviceConfig";
import { MEDICATION_FILLS } from "./stripeConfig";
import {
  HORMONE_PROGRAM_COUNSELING,
  IV_LOUNGE_ADDON_CHARGE,
  WELLNESS_ASSESSMENT_PRICE,
} from "./staffTherapyCounseling";

describe("staffTherapyCounseling", () => {
  it("derives GLP program counseling from Stripe variants", () => {
    expect(GLP1_PROGRAM_COUNSELING).toContain("$349/mo");
    expect(GLP1_PROGRAM_COUNSELING).toContain("$449/mo");
    expect(GLP1_PROGRAM_COUNSELING).not.toContain("$499");
  });

  it("confirms retatrutide at $499/mo", () => {
    expect(retatrutideMonthlyDisplayPrice()).toBe("$499/mo");
    expect(MEDICATION_FILLS.retatrutide.displayPrice).toBe("$499/mo");
    expect(RETATRUTIDE_PEPTIDE_LAYER_RULE).toContain("$499/mo");
  });

  it("uses program tier range for C-03 (excludes retatrutide top-end)", () => {
    expect(C03_PROGRAM_AMOUNT).toBe("$199–$449/mo");
  });

  it("revenue lane bullets mention ketamine not offered and retatrutide gating", () => {
    const joined = REVENUE_LANE_BULLETS.join(" ");
    expect(joined.toLowerCase()).toContain("ketamine");
    expect(joined).toContain("$499/mo");
    expect(joined).toContain("Stripe prepay");
  });

  it("derives hormone counseling from ELEVATED program Stripe prices", () => {
    expect(HORMONE_PROGRAM_COUNSELING).toContain("$249/mo");
    expect(HORMONE_PROGRAM_COUNSELING).toContain("$229/mo");
  });

  it("derives IV lounge upsell charge from Stripe + addon catalog", () => {
    expect(IV_LOUNGE_ADDON_CHARGE).toContain("$185");
    expect(IV_LOUNGE_ADDON_CHARGE).toMatch(/pushes \$25–\$50/);
  });

  it("confirms sexual wellness and hair restoration remain launch-hidden", () => {
    expect(ACTIVE_SERVICES.sexualWellness).toBe(false);
    expect(ACTIVE_SERVICES.hairRestoration).toBe(false);
    expect(WELLNESS_ASSESSMENT_PRICE).toBe("$79");
  });
});
