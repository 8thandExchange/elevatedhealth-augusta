export {
  CDS_ENGINE_VERSION,
  ENGINE_EXCLUDED_CANDIDATE_KEYS,
  deriveAssessmentStatus,
  evaluateCandidate,
  hasRecommendableCandidate,
  isEngineExcludedKey,
  matchPathwayIds,
  normalizeCandidateKey,
  runCdsEngine,
  selectCandidatesForAssessment,
} from "../../supabase/functions/_shared/cds-engine.ts";

export type {
  AssessmentStatus,
  CdsCandidateInput,
  CdsEngineContext,
  CdsEngineResultRow,
  CdsPathwayInput,
  CdsPathwaySymptomInput,
  GateState,
  RegulatoryStatus,
} from "../../supabase/functions/_shared/cds-engine.ts";
