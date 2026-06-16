import { describe, expect, it } from "vitest";
import {
  buildPanelEconomicsForOrder,
  panelBillingContext,
} from "./labOrderEconomics";

describe("labOrderEconomics", () => {
  it("describes intake vs in-program billing", () => {
    const ctx = panelBillingContext({
      initial_paid_at_intake: true,
      included_in_program: true,
      validity_days: 90,
    });
    expect(ctx.intakeLabel).toMatch(/patient pays/i);
    expect(ctx.programLabel).toMatch(/\$0/);
  });

  it("computes margin when all EHA costs present", () => {
    const result = buildPanelEconomicsForOrder("foundation-wellness", "Foundational", [
      { id: "1", code: "CBC", name: "CBC", eha_cost_cents: 1000, non_member_price_cents: 3500 },
      { id: "2", code: "CMP", name: "CMP", eha_cost_cents: 1000, non_member_price_cents: 3500 },
    ]);
    expect(result.patientChargeCents).toBe(19900);
    expect(result.marginIsFinal).toBe(true);
    expect(result.grossProfitCents).toBe(17900);
  });
});
