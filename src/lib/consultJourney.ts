import type { GfeClearanceRow } from "@/lib/gfeClearance";
import { ELEVATED_PROGRAMS_SUMMARY } from "./membershipCopy";
import { patientGfeIsComplete } from "@/lib/gfeClearance";
import { hasWellnessAssessmentPaid } from "@/lib/wellnessAssessmentPayment";
import type { JourneyStage } from "@/config/onboardingCredit";
import { JOURNEY_ORDER } from "@/config/onboardingCredit";

/** Canonical pre-visit funnel stages for Lane B (consult-gated programs). */
export type ConsultJourneyStageId =
  | "explore"
  | "screening"
  | "consents"
  | "payment"
  | "gfe"
  | "schedule"
  | "visit"
  | "baseline_labs"
  | "results_review"
  | "program_consents"
  | "enroll"
  | "treatment";

export interface ConsultJourneyStage {
  id: ConsultJourneyStageId;
  label: string;
  shortLabel: string;
  patientDescription: string;
}

export const CONSULT_JOURNEY_STAGES: ConsultJourneyStage[] = [
  {
    id: "explore",
    label: "Learn & decide",
    shortLabel: "Explore",
    patientDescription: "Review pricing and program details on our site.",
  },
  {
    id: "screening",
    label: "Safety screening",
    shortLabel: "Screen",
    patientDescription: "Quick health questionnaire to confirm you're a candidate.",
  },
  {
    id: "consents",
    label: "Clinic consents",
    shortLabel: "Consents",
    patientDescription: "Sign required policies before payment.",
  },
  {
    id: "payment",
    label: "Wellness assessment ($79)",
    shortLabel: "Pay $79",
    patientDescription: "One-time wellness assessment fee — credited toward your program if you enroll.",
  },
  {
    id: "schedule",
    label: "Book your visit",
    shortLabel: "Schedule",
    patientDescription: "Pick an in-person appointment at our Evans clinic.",
  },
  {
    id: "gfe",
    label: "Good Faith Exam",
    shortLabel: "GFE",
    patientDescription: "Remote medical clearance when your care team requests it (Qualiphy).",
  },
  {
    id: "visit",
    label: "In-person assessment",
    shortLabel: "Visit",
    patientDescription: "Meet your care team for history, vitals, and care planning.",
  },
  {
    id: "baseline_labs",
    label: "Baseline labs (onboarding)",
    shortLabel: "Labs pay",
    patientDescription: "Pay the fixed onboarding lab charge — credited toward month one if you enroll in time.",
  },
  {
    id: "results_review",
    label: "Results review",
    shortLabel: "Review",
    patientDescription: "Your provider reviews labs and recommends a protocol.",
  },
  {
    id: "program_consents",
    label: "Program consents",
    shortLabel: "Consents",
    patientDescription: "Sign treatment-specific consents before enrollment.",
  },
  {
    id: "enroll",
    label: "Membership enrollment",
    shortLabel: "Enroll",
    patientDescription: "Activate your ELEVATED program with onboarding credit applied if eligible.",
  },
  {
    id: "treatment",
    label: "Active care",
    shortLabel: "Care",
    patientDescription: "Your personalized protocol is underway.",
  },
];

export interface ConsultJourneyContext {
  onboardingStatus: string | null;
  gfeRows?: GfeClearanceRow[];
  hasTier1Consents?: boolean;
  intakeCompleted?: boolean;
  /** Set when consultation_bookings confirms $79 paid (covers stale onboarding_status). */
  hasPaidConsultBooking?: boolean;
  /** From patient_journey when funnel rebuild migration is applied. */
  journeyStage?: JourneyStage | null;
}

export function hasApprovedGfe(
  rows: GfeClearanceRow[] | undefined,
  onboardingStatus?: string | null,
): boolean {
  return patientGfeIsComplete(rows ?? [], onboardingStatus);
}

export function hasPendingGfe(rows: GfeClearanceRow[] | undefined): boolean {
  return (rows ?? []).some((r) => r.status === "pending");
}

/** Current stage index 0–11 for progress UI. */
export function getConsultJourneyStageIndex(ctx: ConsultJourneyContext): number {
  const status = ctx.onboardingStatus ?? "new";
  const js = ctx.journeyStage;

  if (js) {
    if (js === "not_a_candidate") return CONSULT_JOURNEY_STAGES.findIndex((s) => s.id === "results_review");
    if (JOURNEY_ORDER[js] >= JOURNEY_ORDER.active) return CONSULT_JOURNEY_STAGES.findIndex((s) => s.id === "treatment");
    if (JOURNEY_ORDER[js] >= JOURNEY_ORDER.membership_enrolled) {
      return CONSULT_JOURNEY_STAGES.findIndex((s) => s.id === "enroll");
    }
    if (JOURNEY_ORDER[js] >= JOURNEY_ORDER.consent_completed) {
      return CONSULT_JOURNEY_STAGES.findIndex((s) => s.id === "enroll");
    }
    if (JOURNEY_ORDER[js] >= JOURNEY_ORDER.protocol_recommended) {
      return CONSULT_JOURNEY_STAGES.findIndex((s) => s.id === "program_consents");
    }
    if (JOURNEY_ORDER[js] >= JOURNEY_ORDER.results_reviewed) {
      return CONSULT_JOURNEY_STAGES.findIndex((s) => s.id === "results_review");
    }
    if (JOURNEY_ORDER[js] >= JOURNEY_ORDER.baseline_labs_ordered) {
      return CONSULT_JOURNEY_STAGES.findIndex((s) => s.id === "baseline_labs");
    }
  }

  const gfeApproved = hasApprovedGfe(ctx.gfeRows, status);
  const gfePending = hasPendingGfe(ctx.gfeRows);
  const wellnessPaid = hasWellnessAssessmentPaid({
    onboardingStatus: status,
    hasPaidConsultBooking: ctx.hasPaidConsultBooking,
  });

  if (["treatment_active", "active", "protocol_approved", "pending_pharmacy_order", "rx_sent", "glp1_rx_sent"].includes(status)) {
    return CONSULT_JOURNEY_STAGES.findIndex((s) => s.id === "treatment");
  }
  if (["labs_reviewed", "results_ready"].includes(status)) {
    return CONSULT_JOURNEY_STAGES.findIndex((s) => s.id === "results_review");
  }
  if (["labs_in_progress", "awaiting_blood_work", "sample_received", "labs_paid"].includes(status)) {
    return CONSULT_JOURNEY_STAGES.findIndex((s) => s.id === "baseline_labs");
  }
  if (["consultation_complete", "intake_complete"].includes(status)) {
    return CONSULT_JOURNEY_STAGES.findIndex((s) => s.id === "baseline_labs");
  }
  if (status === "consultation_scheduled") {
    return CONSULT_JOURNEY_STAGES.findIndex((s) => s.id === "visit");
  }
  if (gfePending || status === "gfe_pending") {
    // GFE in progress does not block scheduling — show visit step once booked, else schedule.
    if (wellnessPaid) {
      return CONSULT_JOURNEY_STAGES.findIndex((s) => s.id === "schedule");
    }
    return CONSULT_JOURNEY_STAGES.findIndex((s) => s.id === "gfe");
  }
  if (wellnessPaid || gfeApproved || status === "gfe_cleared" || ["consultation_paid", "consultation_pending"].includes(status)) {
    return CONSULT_JOURNEY_STAGES.findIndex((s) => s.id === "schedule");
  }
  if (status === "prequal_consents_complete") {
    return CONSULT_JOURNEY_STAGES.findIndex((s) => s.id === "payment");
  }
  if (status === "prequal_screening_passed") {
    return CONSULT_JOURNEY_STAGES.findIndex((s) => s.id === "consents");
  }
  if (status === "account_created" && ctx.hasTier1Consents) {
    return CONSULT_JOURNEY_STAGES.findIndex((s) => s.id === "payment");
  }
  if (status === "account_created") {
    return CONSULT_JOURNEY_STAGES.findIndex((s) => s.id === "screening");
  }
  return CONSULT_JOURNEY_STAGES.findIndex((s) => s.id === "explore");
}

export function canBookWellnessVisit(ctx: ConsultJourneyContext): boolean {
  if (ctx.onboardingStatus === "consultation_scheduled") return false;
  return hasWellnessAssessmentPaid({
    onboardingStatus: ctx.onboardingStatus,
    hasPaidConsultBooking: ctx.hasPaidConsultBooking,
  });
}

export function getConsultJourneyPatientAction(ctx: ConsultJourneyContext): {
  title: string;
  description: string;
  ctaLabel: string | null;
  ctaPath: string | null;
} {
  const status = ctx.onboardingStatus ?? "";
  const wellnessPaid = hasWellnessAssessmentPaid({
    onboardingStatus: status,
    hasPaidConsultBooking: ctx.hasPaidConsultBooking,
  });

  if (canBookWellnessVisit(ctx) && !["consultation_scheduled", "consultation_complete", "intake_complete"].includes(status)) {
    return {
      title: "Book your in-person visit",
      description: "Your wellness assessment is paid. Choose a time for your visit with our care team in Evans.",
      ctaLabel: "Choose appointment time",
      ctaPath: "/schedule-consult",
    };
  }

  if (
    status === "consultation_scheduled" &&
    (hasPendingGfe(ctx.gfeRows) || status === "gfe_pending")
  ) {
    return {
      title: "Complete medical clearance before your visit",
      description:
        "Your care team sent a Qualiphy link to your email and phone. Finish the remote exam before your appointment if you haven't already.",
      ctaLabel: "View dashboard",
      ctaPath: "/patient/dashboard",
    };
  }

  if (!wellnessPaid && ["account_created", "prequal_screening_passed", "prequal_consents_complete", "invited", "pending_invite", "new", ""].includes(status)) {
    return {
      title: "Continue enrollment",
      description: "Complete safety screening and clinic consents, then pay the one-time $79 wellness assessment.",
      ctaLabel: "Continue",
      ctaPath: "/consult/start",
    };
  }

  if (status === "consultation_scheduled") {
    return {
      title: "Visit scheduled",
      description: "We look forward to seeing you at the clinic. Complete portal intake if you haven't already.",
      ctaLabel: "View dashboard",
      ctaPath: "/patient/dashboard",
    };
  }

  if (["consultation_complete", "intake_complete"].includes(status)) {
    return {
      title: "Pay for baseline labs",
      description: "Your visit is complete. Pay the onboarding lab charge next — it can be credited toward your first membership month.",
      ctaLabel: "Continue enrollment",
      ctaPath: "/patient/enroll",
    };
  }

  if (["awaiting_blood_work", "labs_in_progress", "sample_received"].includes(status)) {
    return {
      title: "Labs in progress",
      description: "Your blood work is processing. We will notify you when your provider has reviewed results.",
      ctaLabel: null,
      ctaPath: null,
    };
  }

  if (["results_ready", "labs_reviewed"].includes(status)) {
    return {
      title: "Results ready for review",
      description: "Your provider is preparing your personalized protocol recommendation.",
      ctaLabel: null,
      ctaPath: null,
    };
  }

  if (["protocol_approved", "pending_pharmacy_order"].includes(status)) {
    return {
      title: "Sign consents & enroll",
      description: `Your treatment plan is ready. Complete program consents, then enroll in your ELEVATED program (${ELEVATED_PROGRAMS_SUMMARY}). Baseline lab credit applies to month one when eligible.`,
      ctaLabel: "Continue enrollment",
      ctaPath: "/patient/enroll",
    };
  }

  if (["treatment_active", "active", "rx_sent", "glp1_rx_sent"].includes(status)) {
    return {
      title: "You're in active care",
      description: "Follow your protocol and check in through the portal. Membership renews monthly — no repeat $79 assessment.",
      ctaLabel: null,
      ctaPath: null,
    };
  }

  const idx = getConsultJourneyStageIndex(ctx);
  return {
    title: CONSULT_JOURNEY_STAGES[Math.min(idx, CONSULT_JOURNEY_STAGES.length - 1)].label,
    description: CONSULT_JOURNEY_STAGES[Math.min(idx, CONSULT_JOURNEY_STAGES.length - 1)].patientDescription,
    ctaLabel: null,
    ctaPath: null,
  };
}

/** Staff pipeline bucket for pre-visit funnel. */
export type StaffPrevisitBucket =
  | "prequal_in_progress"
  | "paid_unscheduled"
  | "gfe_pending"
  | "visit_scheduled"
  | "in_clinic_care";

export function staffPrevisitBucket(ctx: ConsultJourneyContext & { email?: string }): StaffPrevisitBucket {
  const status = ctx.onboardingStatus ?? "";
  if (["consultation_scheduled"].includes(status)) return "visit_scheduled";
  if (hasPendingGfe(ctx.gfeRows) || status === "gfe_pending") return "gfe_pending";
  if (["consultation_paid", "consultation_pending", "gfe_cleared"].includes(status)) return "paid_unscheduled";
  if (["prequal_screening_passed", "prequal_consents_complete"].includes(status)) return "prequal_in_progress";
  if (["consultation_complete", "intake_complete", "awaiting_blood_work", "labs_in_progress", "results_ready", "labs_reviewed", "treatment_active"].includes(status)) {
    return "in_clinic_care";
  }
  return "prequal_in_progress";
}

export const STAFF_PREVISIT_BUCKET_LABELS: Record<StaffPrevisitBucket, string> = {
  prequal_in_progress: "Pre-enrollment (screening/consents)",
  paid_unscheduled: "Paid — schedule visit",
  gfe_pending: "GFE sent — awaiting patient",
  visit_scheduled: "Visit scheduled",
  in_clinic_care: "In-clinic / active care",
};

export function onboardingStatusDisplayLabel(status: string | null | undefined): string {
  if (!status) return "New";
  const map: Record<string, string> = {
    prequal_screening_passed: "Screening passed",
    prequal_consents_complete: "Consents signed (pre-pay)",
    consultation_paid: "Paid $79 — schedule visit",
    gfe_pending: "GFE invite sent",
    gfe_cleared: "GFE cleared",
    consultation_scheduled: "Visit scheduled",
    consultation_complete: "Visit complete",
    intake_complete: "Intake complete",
    awaiting_blood_work: "Awaiting labs",
    labs_in_progress: "Labs in progress",
    results_ready: "Results ready",
    labs_reviewed: "Labs reviewed",
    treatment_active: "Active treatment",
    high_risk_review: "Clinical review",
  };
  return map[status] ?? status.replace(/_/g, " ");
}
