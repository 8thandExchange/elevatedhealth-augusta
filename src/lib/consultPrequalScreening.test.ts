import { describe, expect, it } from "vitest";
import { evaluateConsultPrequalScreening } from "./consultPrequalScreening";

describe("evaluateConsultPrequalScreening", () => {
  it("clears healthy female candidate", () => {
    const r = evaluateConsultPrequalScreening({
      gender: "female",
      acknowledged_disclaimer: true,
    });
    expect(r.result).toBe("cleared");
  });

  it("blocks pregnancy", () => {
    const r = evaluateConsultPrequalScreening({
      gender: "female",
      pregnant_or_breastfeeding: true,
      acknowledged_disclaimer: true,
    });
    expect(r.result).toBe("blocked");
    expect(r.blockReasons.length).toBeGreaterThan(0);
  });
});
