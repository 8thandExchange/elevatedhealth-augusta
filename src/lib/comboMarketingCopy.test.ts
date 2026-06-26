import { describe, expect, it } from "vitest";
import {
  COMBO_EXAMPLE_TOTALS,
  COMBO_SAVINGS_HOOK,
  comboAddonMarketingLine,
} from "./comboMarketingCopy";

describe("comboMarketingCopy", () => {
  it("formats addon marketing lines", () => {
    expect(comboAddonMarketingLine("trt")).toContain("$149");
    expect(comboAddonMarketingLine("hrt")).toContain("$129");
  });

  it("example totals match combo engine", () => {
    expect(COMBO_EXAMPLE_TOTALS.glp1SemaPlusTrt).toBe("$498/mo");
  });

  it("includes savings hook", () => {
    expect(COMBO_SAVINGS_HOOK).toContain("$100");
  });
});
