import { describe, expect, it } from "vitest";
import {
  ELEVATED_PROGRAMS_PRICE_RANGE,
  ELEVATED_PROGRAMS_SUMMARY,
  elevatedProgramLabel,
} from "./membershipCopy";

describe("membershipCopy", () => {
  it("uses program-specific pricing range", () => {
    expect(ELEVATED_PROGRAMS_PRICE_RANGE).toMatch(/\$199/);
    expect(ELEVATED_PROGRAMS_SUMMARY).toContain("ELEVATED TRT");
    expect(ELEVATED_PROGRAMS_SUMMARY).not.toMatch(/one membership.*\$199/i);
  });

  it("labels individual programs with display prices", () => {
    expect(elevatedProgramLabel("trt")).toContain("$249/mo");
    expect(elevatedProgramLabel("wellness")).toContain("ELEVATED IV");
  });
});
