import { describe, expect, it } from "vitest";
import {
  lookupPolicyForCandidate,
  indexPoliciesByKey,
  normalizePolicyKey,
  policyRequiresProgramEnrollment,
  policyStatusBlocksOffer,
  resolvePolicyKeyForCandidate,
  type ClinicalPolicyItem,
} from "./clinicalPolicy";

const samplePolicy = (overrides: Partial<ClinicalPolicyItem>): ClinicalPolicyItem => ({
  id: "1",
  item_key: "semaglutide",
  display_name: "Semaglutide",
  category: "glp1",
  regulatory_tier: "COMPOUNDABLE_503A",
  eha_status: "offered",
  required_consents: ["glp1"],
  required_lab_slugs: ["weight-optimization"],
  monitoring_lab_slugs: [],
  contraindication_tags: [],
  allowed_vendor_slugs: ["gc-scientific-network"],
  policy_owner: null,
  last_reviewed_at: null,
  next_review_at: null,
  signed_protocol_version_id: null,
  notes: null,
  active: false,
  signed_off_by: null,
  signed_off_at: null,
  is_sample: false,
  ...overrides,
});

describe("clinicalPolicy", () => {
  it("normalizes CDS candidate keys to policy item keys", () => {
    expect(resolvePolicyKeyForCandidate("glp1_semaglutide")).toBe("semaglutide");
    expect(normalizePolicyKey("trt_testosterone_cypionate")).toBe("testosterone_cypionate");
  });

  it("flags excluded and program-only statuses", () => {
    expect(policyStatusBlocksOffer("excluded")).toBe(true);
    expect(policyStatusBlocksOffer("offered")).toBe(false);
    expect(policyRequiresProgramEnrollment("program_only")).toBe(true);
  });

  it("looks up policy by CDS candidate alias", () => {
    const map = indexPoliciesByKey([
      samplePolicy({ item_key: "semaglutide" }),
      samplePolicy({
        item_key: "elevated_metabolic_program",
        eha_status: "program_only",
      }),
    ]);
    expect(lookupPolicyForCandidate(map, "glp1_semaglutide")?.item_key).toBe("semaglutide");
    expect(lookupPolicyForCandidate(map, "elevated_metabolic_program")?.eha_status).toBe(
      "program_only",
    );
  });
});
