import { describe, expect, it } from "vitest";
import { canOfferTherapy, gateResultFromAssessmentCandidate } from "./canOfferTherapy";

describe("canOfferTherapy", () => {
  const base = {
    therapyKey: "bpc_157",
    displayName: "BPC-157",
    regulatoryStatus: "FDA_APPROVED" as const,
    requiresLabs: true,
    requiredConsentTypes: [] as string[],
    hasResultedLabs: true,
    validConsentTypes: [] as string[],
    substanceAcknowledgmentIds: [] as string[],
    protocolSigned: true,
    pathwayActive: true,
    candidateActive: true,
    providerReviewApproved: true,
  };

  it("returns canOffer=true when all four gates pass", () => {
    const result = canOfferTherapy(base);
    expect(result.canOffer).toBe(true);
    expect(result.missingActions).toHaveLength(0);
    expect(result.contraindication.status).toBe("pass");
    expect(result.labs.status).toBe("pass");
    expect(result.regulatory.status).toBe("pass");
    expect(result.protocol.status).toBe("pass");
  });

  it("blocks ketamine via regulatory engine exclusion", () => {
    const result = canOfferTherapy({
      ...base,
      therapyKey: "ketamine",
      regulatoryStatus: "FDA_APPROVED",
    });
    expect(result.canOffer).toBe(false);
    expect(result.regulatory.status).toBe("block");
    expect(result.missingActions).toContain("therapy_excluded");
  });

  it("pending labs never offers therapy", () => {
    const result = canOfferTherapy({ ...base, hasResultedLabs: false });
    expect(result.canOffer).toBe(false);
    expect(result.labs.status).toBe("pending");
    expect(result.missingActions).toContain("order_labs");
  });

  it("blocks on patient contraindication tag match", () => {
    const result = canOfferTherapy({
      ...base,
      contraindicationTags: ["pregnancy", "chf"],
      patientContraindications: ["pregnancy"],
    });
    expect(result.canOffer).toBe(false);
    expect(result.contraindication.status).toBe("block");
    expect(result.missingActions).toContain("resolve_contraindication");
  });

  it("requires provider review when not approved", () => {
    const result = canOfferTherapy({
      ...base,
      providerReviewApproved: false,
    });
    expect(result.canOffer).toBe(false);
    expect(result.missingActions).toContain("provider_review");
  });

  it("requires signed protocol when protocolSigned is false", () => {
    const result = canOfferTherapy({
      ...base,
      protocolSigned: false,
    });
    expect(result.canOffer).toBe(false);
    expect(result.protocol.status).toBe("pending");
    expect(result.missingActions).toContain("sign_protocol");
  });

  it("requires active candidate config when candidateActive is false", () => {
    const result = canOfferTherapy({
      ...base,
      candidateActive: false,
    });
    expect(result.canOffer).toBe(false);
    expect(result.protocol.status).toBe("pending");
    expect(result.missingActions).toContain("sign_protocol");
  });

  it("blocks hidden policy status even when engine would pass", () => {
    const result = canOfferTherapy({
      ...base,
      policyEhaStatus: "hidden",
    });
    expect(result.canOffer).toBe(false);
    expect(result.regulatory.status).toBe("block");
  });

  it("requires program enrollment for program_only policy", () => {
    const result = canOfferTherapy({
      ...base,
      policyEhaStatus: "program_only",
      programEnrolled: false,
    });
    expect(result.canOffer).toBe(false);
    expect(result.missingActions).toContain("enroll_program");
  });

  it("blocks RESEARCH_USE_ONLY as hard regulatory block even with consents on file", () => {
    const result = canOfferTherapy({
      ...base,
      regulatoryStatus: "RESEARCH_USE_ONLY",
      requiredConsentTypes: ["research_peptide"],
      validConsentTypes: ["research_peptide"],
      substanceAcknowledgmentIds: ["bpc_157"],
    });
    expect(result.canOffer).toBe(false);
    expect(result.regulatory.status).toBe("block");
    expect(result.missingActions).toContain("therapy_excluded");
    expect(result.engineGateState).toBe("blocked_excluded");
  });

  it("maps assessment candidate rows through gateResultFromAssessmentCandidate", () => {
    const result = gateResultFromAssessmentCandidate(
      {
        candidate_key: "ketamine",
        display_name: "Ketamine",
        regulatory_status: "EXCLUDED",
        requires_labs: false,
        metadata: { required_consent_types: [] },
      },
      {
        hasResultedLabs: true,
        validConsentTypes: [],
        substanceAcknowledgmentIds: [],
        providerReviewApproved: false,
      },
    );
    expect(result.canOffer).toBe(false);
    expect(result.missingActions).toContain("therapy_excluded");
  });
});
