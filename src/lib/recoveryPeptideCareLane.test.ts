import { describe, expect, it } from "vitest";
import { catalogBySlug } from "./clinicalOptimizationCatalog";
import { evaluateRecoveryPeptideReview, shouldRouteToRecoveryPeptideReview } from "./recoveryPeptideCareLane";

describe("recovery peptide strategy", () => {
  it("lists BPC-157 and TB-500 as publicly mentionable (not inactive)", () => {
    expect(catalogBySlug("bpc-157")?.public_status).toBe("public");
    expect(catalogBySlug("tb-500")?.clinical_status).toBe("active");
    expect(catalogBySlug("bpc_157")?.public_status).toBe("public");
  });

  it("does not expose low-demand metabolic peptides on public catalog filter", () => {
    expect(catalogBySlug("aod-9604")?.public_status).toBe("provider_only");
    expect(catalogBySlug("ss-31-provider-only")?.public_status).toBe("provider_only");
  });

  it("routes recovery goals to Recovery Peptide Review", () => {
    expect(
      shouldRouteToRecoveryPeptideReview({
        interests: ["recovery_peptides"],
      }),
    ).toBe(true);
    expect(
      shouldRouteToRecoveryPeptideReview({
        goalText: "tendon injury after training",
      }),
    ).toBe(true);
  });

  it("does not offer the retired blended BPC-157/TB-500 stack", () => {
    expect(catalogBySlug("bpc-157-tb-500-stack")).toBeUndefined();
  });

  it("blocks recovery order until provider sign-off", () => {
    const partial = evaluateRecoveryPeptideReview({
      injuryRecoveryGoalDocumented: true,
      malignancyHistoryScreened: true,
      malignancyHistoryClear: true,
      pregnancyBreastfeedingScreened: true,
      pregnancyBreastfeedingClear: true,
      medicationHistoryReviewed: true,
      allergyReviewed: true,
      autoimmuneInflammatoryReviewed: true,
      anticoagulantBleedingRiskReviewed: true,
      researchPeptideConsentOnFile: true,
      providerSignedOff: false,
    });
    expect(partial.canProceedToQuote).toBe(true);
    expect(partial.canProceedToOrder).toBe(false);
  });
});
