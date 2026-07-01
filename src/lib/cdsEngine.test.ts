import { describe, expect, it } from "vitest";
import {
  deriveAssessmentStatus,
  evaluateCandidate,
  isEngineExcludedKey,
  matchPathwayIds,
  runCdsEngine,
  selectCandidatesForAssessment,
  type CdsCandidateInput,
  type CdsEngineContext,
} from "./cdsEngine";

const baseCtx: CdsEngineContext = {
  hasResultedLabs: true,
  validConsentTypes: ["research_peptide"],
  substanceAcknowledgmentIds: ["sample_bpc_157"],
};

function candidate(overrides: Partial<CdsCandidateInput> = {}): CdsCandidateInput {
  return {
    id: "cand-1",
    pathway_id: "path-1",
    candidate_key: "bpc_157",
    display_name: "BPC-157",
    regulatory_status: "FDA_APPROVED",
    requires_labs: false,
    required_lab_slugs: [],
    required_consent_types: [],
    rank_weight: 1,
    is_sample: false,
    ...overrides,
  };
}

describe("cdsEngine exclusions", () => {
  it("hard-blocks ketamine at engine level regardless of DB regulatory_status", () => {
    const result = evaluateCandidate(
      candidate({
        candidate_key: "ketamine",
        display_name: "Ketamine",
        regulatory_status: "FDA_APPROVED",
      }),
      baseCtx,
    );
    expect(result.gate_state).toBe("blocked_excluded");
    expect(result.regulatory_status).toBe("EXCLUDED");
    expect(isEngineExcludedKey("Ketamine")).toBe(true);
  });

  it("does not hard-block retatrutide at engine level", () => {
    const result = evaluateCandidate(
      candidate({
        candidate_key: "retatrutide",
        regulatory_status: "COMPOUNDABLE_503A",
      }),
      baseCtx,
    );
    expect(result.gate_state).toBe("ready");
    expect(isEngineExcludedKey("retatrutide")).toBe(false);
  });
});

describe("cdsEngine lab gate", () => {
  it("routes to needs_labs when requires_labs and no resulted labs on file", () => {
    const result = evaluateCandidate(
      candidate({ requires_labs: true }),
      { ...baseCtx, hasResultedLabs: false },
    );
    expect(result.gate_state).toBe("needs_labs");
    expect(result.blocked_reason).toMatch(/order labs/i);
  });

  it("never returns ready when labs are required but missing", () => {
    const results = runCdsEngine(
      [candidate({ requires_labs: true, rank_weight: 10 })],
      { ...baseCtx, hasResultedLabs: false },
    );
    expect(results[0]?.gate_state).not.toBe("ready");
  });
});

describe("cdsEngine consent gates", () => {
  it("hard-blocks RESEARCH_USE_ONLY — never clears on substance acknowledgment", () => {
    const withoutAck = evaluateCandidate(
      candidate({
        candidate_key: "tb_500",
        regulatory_status: "RESEARCH_USE_ONLY",
        required_consent_types: ["research_peptide"],
      }),
      { ...baseCtx, substanceAcknowledgmentIds: [] },
    );
    expect(withoutAck.gate_state).toBe("blocked_ruo");
    expect(withoutAck.blocked_reason).toMatch(/ePrescribe|Research-use-only/i);

    const withAck = evaluateCandidate(
      candidate({
        candidate_key: "sample_bpc_157",
        regulatory_status: "RESEARCH_USE_ONLY",
        required_consent_types: ["research_peptide"],
      }),
      baseCtx,
    );
    expect(withAck.gate_state).toBe("blocked_ruo");
    expect(withAck.gate_state).not.toBe("ready");
  });

  it("surfaces needs_ack when parent consent types are missing for GRAY_ZONE", () => {
    const result = evaluateCandidate(
      candidate({
        regulatory_status: "GRAY_ZONE",
        required_consent_types: ["research_peptide", "off_label"],
      }),
      { ...baseCtx, validConsentTypes: ["research_peptide"], substanceAcknowledgmentIds: ["bpc_157"] },
    );
    expect(result.gate_state).toBe("needs_ack");
  });

  it("returns ready when labs, consents, and substance ack are satisfied for GRAY_ZONE", () => {
    const result = evaluateCandidate(
      candidate({
        regulatory_status: "GRAY_ZONE",
        required_consent_types: ["research_peptide"],
        candidate_key: "sample_bpc_157",
      }),
      baseCtx,
    );
    expect(result.gate_state).toBe("ready");
  });
});

describe("cdsEngine pathway selection", () => {
  const pathways = [
    { id: "p1", goal_key: "recovery_injury", is_sample: false },
    { id: "p2", goal_key: "recovery_injury", is_sample: false },
    { id: "sample", goal_key: "recovery_injury", is_sample: true },
  ];

  const symptoms = [
    { pathway_id: "p1", symptom_key: "joint_pain", weight: 2 },
    { pathway_id: "p2", symptom_key: "fatigue", weight: 1 },
  ];

  it("matches pathways by symptom overlap", () => {
    expect(
      matchPathwayIds(pathways, symptoms, "recovery_injury", ["joint_pain"], null),
    ).toEqual(["p1"]);
  });

  it("excludes sample pathways from matching", () => {
    expect(
      matchPathwayIds(
        [{ id: "sample", goal_key: "recovery_injury", is_sample: true }],
        symptoms,
        "recovery_injury",
        ["joint_pain"],
        null,
      ),
    ).toEqual([]);
  });

  it("filters sample candidates out of selection", () => {
    const selected = selectCandidatesForAssessment(
      [
        candidate({ id: "real", pathway_id: "p1", is_sample: false }),
        candidate({ id: "sample", pathway_id: "p1", is_sample: true }),
      ],
      ["p1"],
    );
    expect(selected).toHaveLength(1);
    expect(selected[0]?.id).toBe("real");
  });

  it("includes contraindication_tags and candidate_active in result metadata", () => {
    const result = evaluateCandidate(
      candidate({
        contraindication_tags: ["pregnancy"],
        active: false,
      }),
      baseCtx,
    );
    expect(result.metadata.contraindication_tags).toEqual(["pregnancy"]);
    expect(result.metadata.candidate_active).toBe(false);
  });
});

describe("deriveAssessmentStatus", () => {
  it("sets awaiting_labs when any candidate needs labs", () => {
    expect(
      deriveAssessmentStatus(
        [
          {
            candidate_id: "1",
            candidate_key: "a",
            display_name: "A",
            regulatory_status: "FDA_APPROVED",
            gate_state: "needs_labs",
            requires_labs: true,
            blocked_reason: null,
            rank_score: 0,
            metadata: {},
          },
        ],
        "draft",
      ),
    ).toBe("awaiting_labs");
  });

  it("sets awaiting_provider when ready candidates exist", () => {
    expect(
      deriveAssessmentStatus(
        [
          {
            candidate_id: "1",
            candidate_key: "a",
            display_name: "A",
            regulatory_status: "FDA_APPROVED",
            gate_state: "ready",
            requires_labs: false,
            blocked_reason: null,
            rank_score: 1,
            metadata: {},
          },
        ],
        "draft",
      ),
    ).toBe("awaiting_provider");
  });
});
