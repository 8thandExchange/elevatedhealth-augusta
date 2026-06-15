import { describe, expect, it } from "vitest";
import {
  assertPricingInvariants,
  CATALOG,
  memberPriceCents,
  nonMemberPriceCents,
  nonMemberSteadyMonthlyCents,
  nonMemberSteadyMonthlyCentsGlp1,
} from "./pricing";
import { ELEVATED_PROGRAMS } from "./stripeConfig";

describe("pricing catalog", () => {
  it("every CATALOG item has member price <= non-member price", () => {
    for (const item of Object.values(CATALOG)) {
      expect(memberPriceCents(item)).toBeLessThanOrEqual(nonMemberPriceCents(item));
    }
  });

  it("assertPricingInvariants does not throw", () => {
    expect(() => assertPricingInvariants()).not.toThrow();
  });
});

describe("program membership vs à la carte steady cost", () => {
  const programKeys = ["trt", "hrt", "glp1", "wellness"] as const;

  it.each(programKeys)("ELEVATED %s is cheaper than non-member steady monthly", (program) => {
    expect(ELEVATED_PROGRAMS[program].amount).toBeLessThan(nonMemberSteadyMonthlyCents(program));
  });

  it("GLP-1 tirzepatide steady baseline exceeds membership", () => {
    expect(ELEVATED_PROGRAMS.glp1.amount).toBeLessThan(nonMemberSteadyMonthlyCentsGlp1("tirzepatide"));
  });
});
