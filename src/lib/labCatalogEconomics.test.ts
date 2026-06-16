import { describe, expect, it } from "vitest";
import { computePanelEconomics, formatMarginLabel } from "./labCatalogEconomics";

describe("labCatalogEconomics", () => {
  it("sums EHA costs and computes margin when all prices present", () => {
    const result = computePanelEconomics({
      panelSlug: "foundation-wellness",
      panelName: "Foundational Labs",
      patientChargeCents: 19900,
      tests: [
        { id: "1", code: "CBC", name: "CBC", eha_cost_cents: 1500, non_member_price_cents: 3500 },
        { id: "2", code: "CMP", name: "CMP", eha_cost_cents: 1200, non_member_price_cents: 3500 },
      ],
    });
    expect(result.totalLabCostCents).toBe(2700);
    expect(result.grossProfitCents).toBe(17200);
    expect(result.marginIsFinal).toBe(true);
    expect(result.marginPct).toBeCloseTo(86.4, 1);
    expect(result.marginBand).toBe("green");
  });

  it("warns when EHA costs are missing", () => {
    const result = computePanelEconomics({
      panelSlug: "weight-optimization",
      panelName: "Expanded",
      patientChargeCents: 29900,
      tests: [
        { id: "1", code: "CBC", name: "CBC", eha_cost_cents: null, non_member_price_cents: 3500 },
        { id: "2", code: "CMP", name: "CMP", eha_cost_cents: 1000, non_member_price_cents: 3500 },
      ],
    });
    expect(result.missingPriceCount).toBe(1);
    expect(result.marginIsFinal).toBe(false);
    expect(formatMarginLabel(result)).toMatch(/Incomplete/);
  });
});
