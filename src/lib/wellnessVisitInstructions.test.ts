import { describe, expect, it } from "vitest";
import { wellnessPreVisitForServiceType } from "./wellnessVisitInstructions";

describe("wellnessVisitInstructions", () => {
  it("does not mention lab draw in pre-visit copy", () => {
    for (const service of ["hormone", "weight_loss", "peptide"]) {
      const lines = wellnessPreVisitForServiceType(service);
      expect(lines.join(" ").toLowerCase()).not.toContain("lab draw");
    }
  });
});
