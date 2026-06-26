/** clinical_policy_items — types and display helpers (Task 8). */

export type RegulatoryTier =
  | "FDA_APPROVED"
  | "COMPOUNDABLE_503A"
  | "GRAY_ZONE"
  | "RESEARCH_USE_ONLY"
  | "EXCLUDED";

export type EhaPolicyStatus =
  | "offered"
  | "program_only"
  | "hidden"
  | "blocked"
  | "excluded";

export interface ClinicalPolicyItem {
  id: string;
  item_key: string;
  display_name: string;
  category: string | null;
  regulatory_tier: RegulatoryTier;
  eha_status: EhaPolicyStatus;
  required_consents: string[];
  required_lab_slugs: string[];
  monitoring_lab_slugs: string[];
  contraindication_tags: string[];
  allowed_vendor_slugs: string[];
  policy_owner: string | null;
  last_reviewed_at: string | null;
  next_review_at: string | null;
  signed_protocol_version_id: string | null;
  notes: string | null;
  active: boolean;
  signed_off_by: string | null;
  signed_off_at: string | null;
  is_sample: boolean;
}

export const EHA_STATUS_LABELS: Record<EhaPolicyStatus, string> = {
  offered: "Offered",
  program_only: "Program only",
  hidden: "Hidden / launch-off",
  blocked: "Blocked",
  excluded: "Excluded",
};

export function normalizePolicyKey(key: string): string {
  return key
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_")
    .replace(/^glp1_/, "")
    .replace(/^trt_/, "")
    .replace(/^hrt_/, "")
    .replace(/^recovery_/, "")
    .replace(/^libido_/, "")
    .replace(/^policy_/, "");
}

export function policyStatusBlocksOffer(status: EhaPolicyStatus): boolean {
  return status === "excluded" || status === "blocked" || status === "hidden";
}

export function policyRequiresProgramEnrollment(status: EhaPolicyStatus): boolean {
  return status === "program_only";
}

export function resolvePolicyKeyForCandidate(candidateKey: string): string {
  const n = normalizePolicyKey(candidateKey);
  const aliases: Record<string, string> = {
    glp1_semaglutide: "semaglutide",
    glp1_tirzepatide: "tirzepatide",
    trt_testosterone_cypionate: "testosterone_cypionate",
    hrt_bi_est_cream: "bi_est_cream",
    hrt_progesterone_oral: "progesterone_oral",
    libido_pt141: "pt_141",
    policy_ketamine: "ketamine",
    policy_retatrutide_ala_carte: "retatrutide",
  };
  return aliases[n] ?? n;
}

export function indexPoliciesByKey(
  items: ClinicalPolicyItem[],
): Map<string, ClinicalPolicyItem> {
  const map = new Map<string, ClinicalPolicyItem>();
  for (const item of items) {
    if (item.is_sample) continue;
    map.set(item.item_key, item);
    map.set(normalizePolicyKey(item.item_key), item);
  }
  return map;
}

export function lookupPolicyForCandidate(
  policies: Map<string, ClinicalPolicyItem>,
  candidateKey: string,
): ClinicalPolicyItem | undefined {
  const resolved = resolvePolicyKeyForCandidate(candidateKey);
  return policies.get(resolved) ?? policies.get(normalizePolicyKey(candidateKey));
}
