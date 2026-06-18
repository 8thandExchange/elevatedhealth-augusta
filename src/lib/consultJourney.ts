import type { GfeClearanceRow } from "@/lib/gfeClearance";
import { isGfeClearanceCurrentlyValid, pickActiveGfeClearance } from "@/lib/gfeClearance";

/** Canonical pre-visit funnel stages for Lane B (consult-gated programs). */
export type ConsultJourneyStageId =
  | "explore"
  | "screening"
  | "consents"
  | "payment"
  | "gfe"
  | "schedule"
  | "visit"
  | "labs"
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
    id: "gfe",
    label: "Good Faith Exam",
    shortLabel: "GFE",
    patientDescription: "Complete your remote medical clearance exam (Qualiphy).",
  },
  {
    id: "schedule",
    label: "Book your visit",
    shortLabel: "Schedule",
    patientDescription: "Pick an in-person appointment at our Evans clinic.",
  },
  {
    id: "visit",
    label: "In-person assessment",
    shortLabel: "Visit",
    patientDescription: "Meet your care team for history, vitals, and care planning.",
  },
  {
    id: "labs",
    label: "Labs & review",
    shortLabel: "Labs",
    patientDescription: "LabCorp draw and provider results review.",
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
}

export function hasApprovedGfe(rows: GfeClearanceRow[] | undefined): boolean {
  return !!pickActiveGfeClearance(rows ?? []);
}

export function hasPendingGfe(rows: GfeClearanceRow[] | undefined): boolean {
  return (rows ?? []).some((r) => r.status === "pending");
}

/** Current stage index 0–8 for progress UI. */
export function getConsultJourneyStageIndex(ctx: ConsultJourneyContext): number {
  const status = ctx.onboardingStatus ?? "new";
  const gfeApproved = hasApprovedGfe(ctx.gfeRows);
  const gfePending = hasPendingGfe(ctx.gfeRows);

  if (["treatment_active", "active", "protocol_approved", "pending_pharmacy_order", "rx_sent", "glp1_rx_sent"].includes(status)) {
    return 8;
  }
  if (["labs_reviewed", "results_ready", "labs_in_progress", "awaiting_blood_work", "sample_received"].includes(status)) {
    return 7;
  }
  if (["consultation_complete", "intake_complete"].includes(status)) {
    return 6;
  }
  if (status === "consultation_scheduled") {
    return 6;
  }
  if (gfeApproved || status === "gfe_cleared") {
    return 5;
  }
  if (gfePending || status === "gfe_pending") {
    return 4;
  }
  if (["consultation_paid", "consultation_pending"].includes(status)) {
    return 4;
  }
  if (status === "prequal_consents_complete") {
    return 3;
  }
  if (status === "prequal_screening_passed") {
    return 2;
  }
  return 0;
}

export function canBookWellnessVisit(ctx: ConsultJourneyContext): boolean {
  if (ctx.onboardingStatus === "consultation_scheduled") return false;
  if (hasApprovedGfe(ctx.gfeRows)) return true;
  return ctx.onboardingStatus === "gfe_cleared";
}

export function getConsultJourneyPatientAction(ctx: ConsultJourneyContext): {
  title: string;
  description: string;
  ctaLabel: string | null;
  ctaPath: string | null;
} {
  const idx = getConsultJourneyStageIndex(ctx);
  const status = ctx.onboardingStatus ?? "";

  if (canBookWellnessVisit(ctx) && !["consultation_scheduled", "consultation_complete", "intake_complete"].includes(status)) {
    return {
      title: "Book your in-person visit",
      description: "Your Good Faith Exam is complete. Choose a time for your wellness assessment in Evans.",
      ctaLabel: "Choose appointment time",
      ctaPath: "/schedule-consult",
    };
  }

  if (hasPendingGfe(ctx.gfeRows) || status === "gfe_pending" || (status === "consultation_paid" && !hasApprovedGfe(ctx.gfeRows))) {
    return {
      title: "Complete your Good Faith Exam",
      description: "Check your email or SMS for the Qualiphy link. Finish the remote exam before scheduling your visit.",
      ctaLabel: null,
      ctaPath: null,
    };
  }

  if (idx <= 2) {
    return {
      title: "Continue enrollment",
      description: "Complete safety screening and clinic consents, then pay the $79 wellness assessment.",
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
  | "paid_awaiting_gfe"
  | "gfe_pending"
  | "gfe_cleared_unscheduled"
  | "visit_scheduled"
  | "in_clinic_care";

export function staffPrevisitBucket(ctx: ConsultJourneyContext & { email?: string }): StaffPrevisitBucket {
  const status = ctx.onboardingStatus ?? "";
  if (["consultation_scheduled"].includes(status)) return "visit_scheduled";
  if (canBookWellnessVisit(ctx)) return "gfe_cleared_unscheduled";
  if (hasPendingGfe(ctx.gfeRows) || status === "gfe_pending") return "gfe_pending";
  if (["consultation_paid", "consultation_pending"].includes(status)) return "paid_awaiting_gfe";
  if (["prequal_screening_passed", "prequal_consents_complete"].includes(status)) return "prequal_in_progress";
  if (["consultation_complete", "intake_complete", "awaiting_blood_work", "labs_in_progress", "results_ready", "labs_reviewed", "treatment_active"].includes(status)) {
    return "in_clinic_care";
  }
  return "prequal_in_progress";
}

export const STAFF_PREVISIT_BUCKET_LABELS: Record<StaffPrevisitBucket, string> = {
  prequal_in_progress: "Pre-enrollment (screening/consents)",
  paid_awaiting_gfe: "Paid — send GFE",
  gfe_pending: "GFE sent — awaiting patient",
  gfe_cleared_unscheduled: "GFE cleared — book visit",
  visit_scheduled: "Visit scheduled",
  in_clinic_care: "In-clinic / active care",
};

export function onboardingStatusDisplayLabel(status: string | null | undefined): string {
  if (!status) return "New";
  const map: Record<string, string> = {
    prequal_screening_passed: "Screening passed",
    prequal_consents_complete: "Consents signed (pre-pay)",
    consultation_paid: "Paid $79 — GFE next",
    gfe_pending: "GFE invite sent",
    gfe_cleared: "GFE cleared — schedule visit",
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
