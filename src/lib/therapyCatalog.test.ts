import { describe, expect, it } from "vitest";
import {
  cdsCandidateActivationBlocklist,
  isTherapyEngineExcluded,
  offeredPeptideKeys,
  pathwayExcludedCompounds,
  THERAPY_CATALOG,
  THERAPY_ENGINE_EXCLUSIONS,
  therapyByKey,
  therapyStaffPolicyBullets,
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
    expect(r?.displayPrice).toBe("$499/mo");
  });

  it("includes expanded catalog categories from Phase 2B", () => {
    expect(therapyByKey("elevated-trt")?.displayPrice).toBe("$249/mo");
    expect(therapyByKey("iv-nad-booster")?.pageRoute).toBe("/iv-lounge");
    expect(therapyByKey("ss-31")?.providerGated).toBe(true);
    expect(THERAPY_CATALOG.length).toBeGreaterThanOrEqual(35);
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

  it("derives pathway exclusions from catalog not_offered entries", () => {
    const keys = pathwayExcludedCompounds().map((e) => e.key);
    expect(keys).toContain("ketamine");
    expect(keys).toContain("mazdutide");
    expect(keys).not.toContain("retatrutide");
    expect(keys).not.toContain("bpc-157");
  });

  it("derives CDS activation blocklist from catalog", () => {
    const blocklist = cdsCandidateActivationBlocklist();
    expect(blocklist.has("policy_ketamine")).toBe(true);
    expect(blocklist.has("policy_retatrutide_ala_carte")).toBe(true);
  });

  it("exports staff policy bullets for ketamine and retatrutide", () => {
    const bullets = therapyStaffPolicyBullets();
    expect(bullets.some((b) => b.includes("Ketamine"))).toBe(true);
    expect(bullets.some((b) => b.includes("Retatrutide"))).toBe(true);
  });
});
