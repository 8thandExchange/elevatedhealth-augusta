import { describe, expect, it } from "vitest";
import { evaluateSharedLabRedirects } from "./labRedirectRules";

describe("labRedirectRules", () => {
  it("A1c over 6.4 produces diabetes redirect regardless of entry pathway", () => {
    const hits = evaluateSharedLabRedirects([{ analyteKey: "hba1c", value: 6.8 }]);
    expect(hits).toHaveLength(1);
    expect(hits[0]?.rule.redirectMessage).toMatch(/diabetes referral/i);
  });

  it("TSH over 4.5 and under 0.4 both redirect", () => {
    expect(evaluateSharedLabRedirects([{ analyteKey: "tsh", value: 5.0 }])).toHaveLength(1);
    expect(evaluateSharedLabRedirects([{ analyteKey: "tsh_suppressed", value: 0.2 }])).toHaveLength(1);
  });

  it("ferritin under 30 and hemoglobin under 12 redirect", () => {
    expect(evaluateSharedLabRedirects([{ analyteKey: "ferritin", value: 18 }])).toHaveLength(1);
    expect(evaluateSharedLabRedirects([{ analyteKey: "hemoglobin", value: 11 }])).toHaveLength(1);
  });
});
