import { describe, expect, it } from "vitest";
import { CORE_SERVICES } from "./stripeConfig";
import {
  labCheckoutTierForSlug,
  labPanelAlacarteProductKey,
  labPanelNonMemberCents,
  PROGRAM_DEFAULT_LAB_SLUG,
} from "./labPanelCheckout";

describe("labPanelCheckout", () => {
  it("maps hormone panels to expanded Stripe tier ($299)", () => {
    expect(labCheckoutTierForSlug("hormone-male")).toBe("expanded");
    expect(labPanelNonMemberCents("hormone-male")).toBe(CORE_SERVICES.expandedPanel.amount);
    expect(labPanelNonMemberCents("hormone-female")).toBe(CORE_SERVICES.expandedPanel.amount);
  });

  it("maps weight optimization to expanded Stripe tier ($299)", () => {
    expect(labCheckoutTierForSlug("weight-optimization")).toBe("expanded");
    expect(labPanelNonMemberCents("weight-optimization")).toBe(CORE_SERVICES.expandedPanel.amount);
  });

  it("keeps foundation and sexual-wellness on the comprehensive tier ($199)", () => {
    expect(labCheckoutTierForSlug("foundation-wellness")).toBe("comprehensive");
    expect(labPanelNonMemberCents("foundation-wellness")).toBe(CORE_SERVICES.comprehensivePanel.amount);
    expect(labCheckoutTierForSlug("sexual-wellness")).toBe("comprehensive");
  });

  it("assigns program default lab slugs", () => {
    expect(PROGRAM_DEFAULT_LAB_SLUG.trt).toBe("hormone-male");
    expect(PROGRAM_DEFAULT_LAB_SLUG.glp1).toBe("weight-optimization");
    expect(PROGRAM_DEFAULT_LAB_SLUG.wellness).toBe("foundation-wellness");
  });

  it("maps clinical slug to à la carte checkout product key", () => {
    expect(labPanelAlacarteProductKey("hormone-male")).toBe("labPanelExpanded");
    expect(labPanelAlacarteProductKey("foundation-wellness")).toBe("labPanel");
    expect(labPanelAlacarteProductKey("weight-optimization")).toBe("labPanelExpanded");
  });
});
