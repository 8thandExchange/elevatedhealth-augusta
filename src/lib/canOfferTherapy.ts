/**
 * Unified four-gate clinical eligibility check (Priority 2).
 * Composes CDS engine regulatory/lab rules with contraindication + protocol gates.
 *
 * Use before: surfacing therapy as eligible, Rx handoff, program activation, post-lab checkout.
 */
import {
  evaluateCandidate,
  type CdsCandidateInput,
  type CdsEngineContext,
  type GateState,
  type RegulatoryStatus,
} from "./cdsEngine";
import {
  policyRequiresProgramEnrollment,
  policyStatusBlocksOffer,
  type EhaPolicyStatus,
} from "./clinicalPolicy";

export type GateStatus = "pass" | "block" | "pending";

export interface SingleGateResult {
  status: GateStatus;
  reason: string | null;
  patientExplanation: string | null;
}

export interface CanOfferTherapyInput {
  therapyKey: string;
  displayName: string;
  regulatoryStatus: RegulatoryStatus;
  requiresLabs: boolean;
  requiredConsentTypes: string[];
  /** Therapy-specific contraindication tags from CDS config */
  contraindicationTags?: string[];
  /** Active patient contraindication flags from chart/intake */
  patientContraindications?: string[];
  hasResultedLabs: boolean;
  validConsentTypes: string[];
  substanceAcknowledgmentIds: string[];
  /** Signed active protocol version exists for this therapy/pathway */
  protocolSigned?: boolean;
  /** CDS pathway row is active with prescriber sign-off */
  pathwayActive?: boolean;
  /** CDS candidate row is active with prescriber sign-off */
  candidateActive?: boolean;
  /** Canonical policy eha_status from clinical_policy_items */
  policyEhaStatus?: EhaPolicyStatus;
  /** Patient enrolled in parent program (for program_only policies) */
  programEnrolled?: boolean;
  /** Provider has approved cds_provider_review for current assessment */
  providerReviewApproved?: boolean;
}

export interface GateResult {
  canOffer: boolean;
  contraindication: SingleGateResult;
  labs: SingleGateResult;
  regulatory: SingleGateResult;
  protocol: SingleGateResult;
  missingActions: string[];
  staffReason: string;
  patientExplanation: string;
  engineGateState: GateState;
}

function gateFromEngineState(gateState: GateState): SingleGateResult {
  switch (gateState) {
    case "ready":
      return {
        status: "pass",
        reason: null,
        patientExplanation: null,
      };
    case "needs_labs":
      return {
        status: "pending",
        reason: "Required lab results are not on file.",
        patientExplanation:
          "We need your baseline lab work before we can recommend this therapy. Labs are drawn in-office and reviewed by your provider.",
      };
    case "needs_ack":
      return {
        status: "pending",
        reason: "Required consent or substance acknowledgment is missing.",
        patientExplanation:
          "Please complete the required informed consent documents before we proceed with this therapy.",
      };
    case "blocked_ruo":
      return {
        status: "block",
        reason: "Research-use-only — cannot offer or ePrescribe.",
        patientExplanation:
          "This option is not offered at Elevated Health Augusta. Your provider will discuss alternatives.",
      };
    case "blocked_excluded":
      return {
        status: "block",
        reason: "This therapy is excluded from the EHA formulary.",
        patientExplanation:
          "This option is not offered at Elevated Health Augusta. Your provider will discuss alternatives.",
      };
    case "needs_contra_review":
      return {
        status: "pending",
        reason: "Contraindication review required.",
        patientExplanation:
          "Your provider needs to review a safety consideration before this therapy can be offered.",
      };
    default:
      return { status: "block", reason: "Unknown gate state.", patientExplanation: null };
  }
}

export function canOfferTherapy(input: CanOfferTherapyInput): GateResult {
  const candidate: CdsCandidateInput = {
    id: "synthetic",
    pathway_id: null,
    candidate_key: input.therapyKey,
    display_name: input.displayName,
    regulatory_status: input.regulatoryStatus,
    requires_labs: input.requiresLabs,
    required_lab_slugs: [],
    required_consent_types: input.requiredConsentTypes,
    rank_weight: 1,
    is_sample: false,
  };

  const ctx: CdsEngineContext = {
    hasResultedLabs: input.hasResultedLabs,
    validConsentTypes: input.validConsentTypes,
    substanceAcknowledgmentIds: input.substanceAcknowledgmentIds,
  };

  const engine = evaluateCandidate(candidate, ctx);
  let regulatory = gateFromEngineState(engine.gate_state);

  if (input.policyEhaStatus && policyStatusBlocksOffer(input.policyEhaStatus)) {
    regulatory = {
      status: "block",
      reason: `Clinic policy marks this therapy as ${input.policyEhaStatus.replace("_", " ")}.`,
      patientExplanation:
        "This option is not available through our clinic at this time. Your provider will discuss alternatives.",
    };
  } else if (
    input.policyEhaStatus &&
    policyRequiresProgramEnrollment(input.policyEhaStatus) &&
    !input.programEnrolled
  ) {
    regulatory = {
      status: "pending",
      reason: "Therapy is program-only — enroll in the supervised program path first.",
      patientExplanation:
        "This therapy is offered only as part of a supervised program, not as a standalone prescription.",
    };
  }

  const contraTags = input.contraindicationTags ?? [];
  const patientContras = input.patientContraindications ?? [];
  const contraHit =
    contraTags.length > 0 &&
    patientContras.some((tag) => contraTags.includes(tag));

  const contraindication: SingleGateResult = contraHit
    ? {
        status: "block",
        reason: `Patient contraindication flag matches: ${patientContras.filter((t) => contraTags.includes(t)).join(", ")}`,
        patientExplanation:
          "Based on your health history, we need to address a safety consideration before this therapy can be considered.",
      }
    : { status: "pass", reason: null, patientExplanation: null };

  const labs: SingleGateResult =
    input.requiresLabs && !input.hasResultedLabs
      ? {
          status: "pending",
          reason: "Baseline labs not resulted on file.",
          patientExplanation:
            "Baseline labs are required so your provider can review your results before recommending treatment.",
        }
      : { status: "pass", reason: null, patientExplanation: null };

  let protocol: SingleGateResult = { status: "pass", reason: null, patientExplanation: null };
  if (input.pathwayActive === false) {
    protocol = {
      status: "pending",
      reason: "CDS pathway config is not active / prescriber-signed.",
      patientExplanation: null,
    };
  } else if (input.candidateActive === false) {
    protocol = {
      status: "pending",
      reason: "CDS candidate config is not active / prescriber-signed.",
      patientExplanation: null,
    };
  } else if (input.protocolSigned === false) {
    protocol = {
      status: "pending",
      reason: "No signed active protocol version on file for this therapy.",
      patientExplanation:
        "Your provider is finalizing the clinical protocol for this path.",
    };
  }

  const missingActions: string[] = [];
  if (contraindication.status !== "pass") missingActions.push("resolve_contraindication");
  if (labs.status === "pending") missingActions.push("order_labs");
  if (regulatory.status === "pending") {
    if (engine.gate_state === "needs_ack") {
      missingActions.push("capture_consent_or_substance_ack");
    } else if (engine.gate_state === "needs_contra_review") {
      missingActions.push("provider_contra_review");
    }
  }
  if (regulatory.status === "block") missingActions.push("therapy_excluded");
  if (regulatory.status === "pending" && input.policyEhaStatus === "program_only") {
    missingActions.push("enroll_program");
  }
  if (protocol.status === "pending") missingActions.push("sign_protocol");
  if (input.providerReviewApproved === false) missingActions.push("provider_review");

  const blocked =
    contraindication.status === "block" ||
    regulatory.status === "block" ||
    labs.status === "block" ||
    protocol.status === "block";

  const pending =
    !blocked &&
    (contraindication.status === "pending" ||
      labs.status === "pending" ||
      regulatory.status === "pending" ||
      protocol.status === "pending" ||
      input.providerReviewApproved === false);

  const canOffer =
    !blocked &&
    !pending &&
    engine.gate_state === "ready" &&
    input.providerReviewApproved !== false;

  const staffParts = [
    contraindication.reason,
    labs.reason,
    regulatory.reason ?? engine.blocked_reason,
    protocol.reason,
    input.providerReviewApproved === false ? "Awaiting physician CDS review." : null,
  ].filter(Boolean);

  const patientParts = [
    contraindication.patientExplanation,
    labs.patientExplanation,
    regulatory.patientExplanation,
    protocol.patientExplanation,
  ].filter(Boolean);

  return {
    canOffer,
    contraindication,
    labs,
    regulatory,
    protocol,
    missingActions,
    staffReason: staffParts.join(" ") || "Eligible pending final physician decision.",
    patientExplanation:
      patientParts[0] ??
      (canOffer
        ? "Your provider will confirm this recommendation after reviewing your chart."
        : "We are completing a few steps before your provider can finalize this plan."),
    engineGateState: engine.gate_state,
  };
}

/** Map CDS assessment result row + context into canOfferTherapy input. */
export function gateResultFromAssessmentCandidate(
  row: {
    candidate_key: string;
    display_name: string;
    regulatory_status: RegulatoryStatus;
    requires_labs: boolean;
    metadata?: Record<string, unknown>;
  },
  ctx: {
    hasResultedLabs: boolean;
    validConsentTypes: string[];
    substanceAcknowledgmentIds: string[];
    patientContraindications?: string[];
    protocolSigned?: boolean;
    pathwayActive?: boolean;
    candidateActive?: boolean;
    policyEhaStatus?: EhaPolicyStatus;
    programEnrolled?: boolean;
    policyContraindicationTags?: string[];
    policyRequiredConsents?: string[];
    providerReviewApproved?: boolean;
  },
): GateResult {
  const requiredConsentTypes = Array.isArray(row.metadata?.required_consent_types)
    ? (row.metadata.required_consent_types as string[])
    : [];
  const contraindicationTags = Array.isArray(row.metadata?.contraindication_tags)
    ? (row.metadata.contraindication_tags as string[])
    : Array.isArray(ctx.policyContraindicationTags)
      ? ctx.policyContraindicationTags
      : [];
  const candidateActive =
    ctx.candidateActive ?? row.metadata?.candidate_active === true;

  return canOfferTherapy({
    therapyKey: row.candidate_key,
    displayName: row.display_name,
    regulatoryStatus: row.regulatory_status,
    requiresLabs: row.requires_labs,
    requiredConsentTypes:
      requiredConsentTypes.length > 0
        ? requiredConsentTypes
        : (ctx.policyRequiredConsents ?? []),
    contraindicationTags,
    patientContraindications: ctx.patientContraindications,
    hasResultedLabs: ctx.hasResultedLabs,
    validConsentTypes: ctx.validConsentTypes,
    substanceAcknowledgmentIds: ctx.substanceAcknowledgmentIds,
    protocolSigned: ctx.protocolSigned,
    pathwayActive: ctx.pathwayActive,
    candidateActive,
    policyEhaStatus: ctx.policyEhaStatus,
    programEnrolled: ctx.programEnrolled,
    providerReviewApproved: ctx.providerReviewApproved,
  });
}
