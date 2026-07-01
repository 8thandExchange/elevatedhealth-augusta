/**
 * Clinical Decision Support — deterministic evaluation engine.
 * Shared by run-cds-assessment edge function and frontend/tests via src/lib/cdsEngine.ts.
 *
 * Hard clinic exclusions (ketamine only) are enforced here regardless of DB config.
 */

export const CDS_ENGINE_VERSION = "cds-engine/1.0.0";

/** Engine-level hard blocks — not overridable by cds_candidates seed rows. */
export const ENGINE_EXCLUDED_CANDIDATE_KEYS = ["ketamine"] as const;

export type RegulatoryStatus =
  | "FDA_APPROVED"
  | "COMPOUNDABLE_503A"
  | "GRAY_ZONE"
  | "RESEARCH_USE_ONLY"
  | "EXCLUDED";

export type GateState =
  | "ready"
  | "blocked_excluded"
  | "blocked_ruo"
  | "needs_labs"
  | "needs_ack"
  | "needs_contra_review";

export type AssessmentStatus =
  | "draft"
  | "awaiting_labs"
  | "awaiting_provider"
  | "reviewed";

export interface CdsPathwayInput {
  id: string;
  goal_key: string;
  is_sample: boolean;
}

export interface CdsPathwaySymptomInput {
  pathway_id: string;
  symptom_key: string;
  weight: number;
}

export interface CdsCandidateInput {
  id: string;
  pathway_id: string | null;
  candidate_key: string;
  display_name: string;
  regulatory_status: RegulatoryStatus;
  requires_labs: boolean;
  required_lab_slugs: string[];
  required_consent_types: string[];
  rank_weight: number;
  is_sample: boolean;
  active?: boolean;
  contraindication_tags?: string[];
}

export interface CdsEngineContext {
  hasResultedLabs: boolean;
  validConsentTypes: string[];
  substanceAcknowledgmentIds: string[];
}

export interface CdsEngineResultRow {
  candidate_id: string | null;
  candidate_key: string;
  display_name: string;
  regulatory_status: RegulatoryStatus;
  gate_state: GateState;
  requires_labs: boolean;
  blocked_reason: string | null;
  rank_score: number;
  metadata: Record<string, unknown>;
}

export function normalizeCandidateKey(key: string): string {
  return key
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");
}

export function isEngineExcludedKey(candidateKey: string): boolean {
  const normalized = normalizeCandidateKey(candidateKey);
  return (ENGINE_EXCLUDED_CANDIDATE_KEYS as readonly string[]).includes(normalized);
}

export function matchPathwayIds(
  pathways: CdsPathwayInput[],
  pathwaySymptoms: CdsPathwaySymptomInput[],
  goalKey: string | null | undefined,
  symptomsSelected: string[],
  explicitPathwayId: string | null | undefined,
): string[] {
  if (explicitPathwayId) return [explicitPathwayId];

  const eligible = pathways.filter(
    (p) => !p.is_sample && (!goalKey || p.goal_key === goalKey),
  );

  if (symptomsSelected.length === 0) {
    return eligible.map((p) => p.id);
  }

  const selected = new Set(symptomsSelected);

  return eligible
    .map((pathway) => {
      const score = pathwaySymptoms
        .filter((s) => s.pathway_id === pathway.id)
        .reduce((sum, row) => (selected.has(row.symptom_key) ? sum + row.weight : sum), 0);
      return { id: pathway.id, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((row) => row.id);
}

export function selectCandidatesForAssessment(
  allCandidates: CdsCandidateInput[],
  pathwayIds: string[],
): CdsCandidateInput[] {
  const pathwaySet = new Set(pathwayIds);
  return allCandidates.filter(
    (c) => !c.is_sample && c.pathway_id != null && pathwaySet.has(c.pathway_id),
  );
}

function hasRequiredConsents(candidate: CdsCandidateInput, ctx: CdsEngineContext): boolean {
  if (candidate.required_consent_types.length === 0) return true;
  const valid = new Set(ctx.validConsentTypes);
  return candidate.required_consent_types.every((t) => valid.has(t));
}

function hasSubstanceAcknowledgment(candidate: CdsCandidateInput, ctx: CdsEngineContext): boolean {
  const key = normalizeCandidateKey(candidate.candidate_key);
  const acked = new Set(ctx.substanceAcknowledgmentIds.map(normalizeCandidateKey));
  return acked.has(key);
}

export function evaluateCandidate(
  candidate: CdsCandidateInput,
  ctx: CdsEngineContext,
): CdsEngineResultRow {
  const candidateKey = normalizeCandidateKey(candidate.candidate_key);
  const base = {
    candidate_id: candidate.id,
    candidate_key: candidateKey,
    display_name: candidate.display_name,
    requires_labs: candidate.requires_labs,
    rank_score: candidate.rank_weight,
    metadata: {
      pathway_id: candidate.pathway_id,
      required_lab_slugs: candidate.required_lab_slugs,
      required_consent_types: candidate.required_consent_types,
      contraindication_tags: candidate.contraindication_tags ?? [],
      candidate_active: candidate.active === true,
    },
  };

  if (isEngineExcludedKey(candidateKey)) {
    return {
      ...base,
      regulatory_status: "EXCLUDED",
      gate_state: "blocked_excluded",
      blocked_reason: `${candidateKey} is clinic-excluded and cannot be recommended.`,
      rank_score: 0,
    };
  }

  if (candidate.regulatory_status === "EXCLUDED") {
    return {
      ...base,
      regulatory_status: "EXCLUDED",
      gate_state: "blocked_excluded",
      blocked_reason: `${candidate.display_name} is marked EXCLUDED in CDS config.`,
      rank_score: 0,
    };
  }

  if (candidate.requires_labs && !ctx.hasResultedLabs) {
    return {
      ...base,
      regulatory_status: candidate.regulatory_status,
      gate_state: "needs_labs",
      blocked_reason: "Required lab results are not on file. Order labs before recommending.",
      rank_score: 0,
    };
  }

  const regulatoryStatus = candidate.regulatory_status;

  if (regulatoryStatus === "RESEARCH_USE_ONLY") {
    return {
      ...base,
      regulatory_status: "RESEARCH_USE_ONLY",
      gate_state: "blocked_ruo",
      blocked_reason:
        "Research-use-only — hard clinic block. Cannot proceed to ePrescribe; prescriber override required if policy ever allows.",
      rank_score: 0,
    };
  }

  if (regulatoryStatus === "GRAY_ZONE") {
    if (!hasRequiredConsents(candidate, ctx)) {
      return {
        ...base,
        regulatory_status: regulatoryStatus,
        gate_state: "needs_ack",
        blocked_reason: "Required parent consent(s) not on file.",
        rank_score: 0,
      };
    }

    if (!hasSubstanceAcknowledgment(candidate, ctx)) {
      return {
        ...base,
        regulatory_status: regulatoryStatus,
        gate_state: "needs_ack",
        blocked_reason: "Substance-specific acknowledgment required before ePrescribe handoff.",
        rank_score: 0,
      };
    }
  }

  return {
    ...base,
    regulatory_status: regulatoryStatus,
    gate_state: "ready",
    blocked_reason: null,
  };
}

export function runCdsEngine(
  candidates: CdsCandidateInput[],
  ctx: CdsEngineContext,
): CdsEngineResultRow[] {
  return candidates
    .map((candidate) => evaluateCandidate(candidate, ctx))
    .sort((a, b) => b.rank_score - a.rank_score);
}

export function deriveAssessmentStatus(
  results: CdsEngineResultRow[],
  currentStatus: AssessmentStatus,
): AssessmentStatus {
  if (currentStatus === "reviewed") return "reviewed";
  if (results.length === 0) return "draft";

  if (results.some((r) => r.gate_state === "needs_labs")) {
    return "awaiting_labs";
  }

  if (results.some((r) => r.gate_state === "ready")) {
    return "awaiting_provider";
  }

  if (
    results.some((r) =>
      r.gate_state === "needs_ack" ||
      r.gate_state === "blocked_ruo" ||
      r.gate_state === "needs_contra_review"
    )
  ) {
    return "awaiting_provider";
  }

  if (results.every((r) => r.gate_state === "blocked_excluded")) {
    return "awaiting_provider";
  }

  return "draft";
}

/** True when at least one surfaced candidate is actionable for provider review. */
export function hasRecommendableCandidate(results: CdsEngineResultRow[]): boolean {
  return results.some((r) => r.gate_state === "ready");
}

/** When universal safety screen is positive, elevate all candidates to needs_contra_review. */
export function applyUniversalSafetyToResults(
  results: CdsEngineResultRow[],
  forceProviderReview: boolean,
): CdsEngineResultRow[] {
  if (!forceProviderReview) return results;
  return results.map((row) => {
    if (row.gate_state === "blocked_excluded" || row.gate_state === "blocked_ruo") {
      return row;
    }
    return {
      ...row,
      gate_state: "needs_contra_review" as GateState,
      blocked_reason:
        row.blocked_reason ??
        "Universal safety screen positive. Provider must confirm before therapy recommendation.",
    };
  });
}
