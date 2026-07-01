import { describe, expect, it } from "vitest";
import {
  C03_PROGRAM_AMOUNT,
  GLP1_PROGRAM_COUNSELING,
  RETATRUTIDE_PEPTIDE_LAYER_RULE,
  retatrutideMonthlyDisplayPrice,
  REVENUE_LANE_BULLETS,
} from "./staffTherapyCounseling";
import { MEDICATION_FILLS } from "./stripeConfig";

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
});
