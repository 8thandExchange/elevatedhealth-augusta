/** CDS row shapes — mirrors public.cds_* tables (not yet in generated Supabase types). */

export type CdsRegulatoryStatus =
  | "FDA_APPROVED"
  | "COMPOUNDABLE_503A"
  | "GRAY_ZONE"
  | "RESEARCH_USE_ONLY"
  | "EXCLUDED";

export type CdsGateState =
  | "ready"
  | "blocked_excluded"
  | "blocked_ruo"
  | "needs_labs"
  | "needs_ack"
  | "needs_contra_review";

export type CdsAssessmentStatus =
  | "draft"
  | "awaiting_labs"
  | "awaiting_provider"
  | "reviewed";

export type CdsProviderDecision = "approved" | "modified" | "rejected";

export interface CdsAssessment {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  pathway_id: string | null;
  created_by: string;
  status: CdsAssessmentStatus;
  goal_key: string | null;
  symptoms_selected: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CdsAssessmentResult {
  id: string;
  assessment_id: string;
  candidate_id: string | null;
  candidate_key: string;
  display_name: string;
  regulatory_status: CdsRegulatoryStatus;
  gate_state: CdsGateState;
  requires_labs: boolean;
  blocked_reason: string | null;
  rank_score: number | null;
  engine_version: string | null;
  surfaced_at: string;
  metadata: Record<string, unknown>;
}

export interface CdsProviderReview {
  id: string;
  assessment_id: string;
  prescriber_id: string;
  decision: CdsProviderDecision;
  notes: string | null;
  modified_payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}
