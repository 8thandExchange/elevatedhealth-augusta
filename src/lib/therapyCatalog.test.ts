import { describe, expect, it } from "vitest";
import {
  isTherapyEngineExcluded,
  offeredPeptideKeys,
  THERAPY_CATALOG,
  THERAPY_ENGINE_EXCLUSIONS,
  therapyByKey,
  websiteTherapies,
} from "./therapyCatalog";

describe("therapyCatalog", () => {
  it("hard-excludes only ketamine at engine level", () => {
    expect(THERAPY_ENGINE_EXCLUSIONS).toEqual(["ketamine"]);
    expect(isTherapyEngineExcluded("ketamine")).toBe(true);
    expect(isTherapyEngineExcluded("retatrutide")).toBe(false);
    expect(isTherapyEngineExcluded("bpc-157")).toBe(false);
  });

  it("marks ketamine not offered and off website", () => {
    const k = therapyByKey("ketamine");
    expect(k?.patientFacingAvailability).toBe("not_offered");
    expect(k?.onWebsite).toBe(false);
    expect(k?.engineHardExcluded).toBe(true);
  });

  it("marks retatrutide provider-gated but not engine-excluded", () => {
    const r = therapyByKey("retatrutide");
    expect(r?.providerGated).toBe(true);
    expect(r?.engineHardExcluded).toBe(false);
    expect(r?.onWebsite).toBe(false);
    expect(r?.inStripePricing).toBe(true);
  });

  it("lists active recovery peptides as offered and provider-gated", () => {
    for (const key of ["bpc-157", "tb-500"]) {
      const t = therapyByKey(key);
      expect(t?.patientFacingAvailability).toBe("website_consult_gated");
      expect(t?.providerGated).toBe(true);
      expect(t?.onWebsite).toBe(true);
    }
    expect(offeredPeptideKeys()).toEqual(expect.arrayContaining(["bpc-157", "tb-500"]));
  });

  it("never exposes ketamine on website therapies", () => {
    expect(websiteTherapies().some((t) => t.key === "ketamine")).toBe(false);
  });

  it("has unique therapy keys", () => {
    const keys = THERAPY_CATALOG.map((t) => t.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
