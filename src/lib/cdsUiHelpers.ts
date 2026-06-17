import type { CdsGateState, CdsRegulatoryStatus } from "./cdsTypes";

export const REGULATORY_STATUS_LABELS: Record<CdsRegulatoryStatus, string> = {
  FDA_APPROVED: "FDA approved",
  COMPOUNDABLE_503A: "503A compoundable",
  GRAY_ZONE: "Gray zone",
  RESEARCH_USE_ONLY: "Research use only",
  EXCLUDED: "Excluded",
};

export const GATE_STATE_LABELS: Record<CdsGateState, string> = {
  ready: "Ready for provider review",
  blocked_excluded: "Clinic excluded",
  blocked_ruo: "Research use only — blocked",
  needs_labs: "Order labs first",
  needs_ack: "Consent / acknowledgment required",
  needs_contra_review: "Contraindication review",
};

/** Only `ready` candidates may proceed toward recommendation / ePrescribe handoff. */
export function canRecommendCandidate(gateState: CdsGateState): boolean {
  return gateState === "ready";
}

export function shouldRouteToOrderLabs(gateState: CdsGateState): boolean {
  return gateState === "needs_labs";
}

export function requiresSubstanceAcknowledgment(gateState: CdsGateState): boolean {
  return gateState === "needs_ack";
}

export function isRegulatoryBadgeStatus(
  status: CdsRegulatoryStatus,
): status is "GRAY_ZONE" | "RESEARCH_USE_ONLY" | "EXCLUDED" {
  return (
    status === "GRAY_ZONE" ||
    status === "RESEARCH_USE_ONLY" ||
    status === "EXCLUDED"
  );
}

export function regulatoryBadgeClassName(status: CdsRegulatoryStatus): string {
  switch (status) {
    case "EXCLUDED":
      return "bg-destructive text-destructive-foreground";
    case "GRAY_ZONE":
    case "RESEARCH_USE_ONLY":
      return "bg-amber-600/90 text-white hover:bg-amber-600/90";
    case "COMPOUNDABLE_503A":
      return "bg-accent text-accent-foreground";
    default:
      return "bg-secondary text-secondary-foreground";
  }
}

export function gateBadgeClassName(gateState: CdsGateState): string {
  if (gateState === "ready") return "border-emerald-600/50 text-emerald-800 bg-emerald-50";
  if (gateState === "needs_labs") return "border-blue-600/50 text-blue-900 bg-blue-50";
  if (gateState === "blocked_excluded") return "bg-destructive text-destructive-foreground";
  return "border-amber-600/50 text-amber-900 bg-amber-50";
}

export const MISSING_ACTION_LABELS: Record<string, string> = {
  order_labs: "Order baseline labs",
  capture_consent_or_substance_ack: "Complete consent / substance acknowledgment",
  provider_contra_review: "Provider contraindication review",
  therapy_excluded: "Therapy excluded — do not offer",
  sign_protocol: "Activate signed protocol version",
  provider_review: "Physician CDS review required",
  enroll_program: "Enroll supervised program path",
  resolve_contraindication: "Resolve contraindication",
};
