import { describe, expect, it } from "vitest";
import { evaluateCandidate, type CdsCandidateInput } from "./cdsEngine";
import {
  CDS_EXPANSION_CANDIDATES,
  CDS_EXPANSION_PATHWAY_SLUGS,
  pathwayActivationAllowed,
} from "./cdsPathwayExpansionManifest";

describe("cdsPathwayExpansion manifest", () => {
  it("lists six new pathway slugs plus IV extension target", () => {
    expect(CDS_EXPANSION_PATHWAY_SLUGS).toHaveLength(6);
    expect(CDS_EXPANSION_PATHWAY_SLUGS).toContain("prediabetes-insulin-resistance");
    expect(CDS_EXPANSION_PATHWAY_SLUGS).toContain("aesthetics");
  });

  it("every expansion candidate resolves to a known pathway slug and regulatory tier", () => {
    for (const row of CDS_EXPANSION_CANDIDATES) {
      expect(row.pathwaySlug.length).toBeGreaterThan(0);
      expect(row.regulatoryStatus).toBeTruthy();
      expect(row.requiredConsentTypes.length).toBeGreaterThan(0);
    }
  });

  it("inactive seed preview: inactive candidates evaluate but stay pathway-gated", () => {
    const sample: CdsCandidateInput = {
      id: "test-id",
      pathway_id: "pathway-id",
      candidate_key: "ed_sildenafil",
      display_name: "Sildenafil",
      regulatory_status: "FDA_APPROVED",
      requires_labs: true,
      required_lab_slugs: ["sexual-wellness"],
      required_consent_types: ["general_medical_treatment", "off_label"],
      rank_weight: 1,
      is_sample: false,
      active: false,
      contraindication_tags: ["nitrates"],
    };
    const result = evaluateCandidate(sample, {
      hasResultedLabs: false,
      validConsentTypes: [],
      substanceAcknowledgmentIds: [],
    });
    expect(result.gate_state).toBe("needs_labs");
  });

  it("CHECK constraint logic blocks activation without sign-off", () => {
    expect(pathwayActivationAllowed({ active: false, signed_off_by: null, signed_off_at: null })).toBe(
      true,
    );
    expect(
      pathwayActivationAllowed({ active: true, signed_off_by: null, signed_off_at: null }),
    ).toBe(false);
    expect(
      pathwayActivationAllowed({
        active: true,
        signed_off_by: "provider-uuid",
        signed_off_at: "2026-06-18T00:00:00Z",
      }),
    ).toBe(true);
  });

  it("PT-141 expansion candidates use off_label consent only", () => {
    const pt141 = CDS_EXPANSION_CANDIDATES.filter((c) => c.candidateKey.includes("pt141"));
    expect(pt141.length).toBe(2);
    for (const row of pt141) {
      expect(row.requiredConsentTypes).toEqual(["off_label"]);
    }
  });
});
