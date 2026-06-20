/**
 * Patient-facing copy for /how-it-works — not staff SOP language.
 * Staff workflows live in staffSystemGuideContent.ts.
 */
import { CORE_SERVICES } from "./stripeConfig";
import { MEMBER_DISCOUNT_PERCENT } from "./pricing";

const WA = CORE_SERVICES.wellnessAssessment.displayPrice;
const COMP = CORE_SERVICES.comprehensivePanel.displayPrice;
const EXP = CORE_SERVICES.expandedPanel.displayPrice;

export const IV_LOUNGE_PATIENT_STEPS = [
  "Book online or walk in during clinic hours — no wellness assessment required.",
  "Complete a brief health screening so we can confirm IV therapy is safe for you.",
  "Choose your drip and optional boosters (glutathione push, B12, NAD+ push, and more), then check out.",
  `RN-administered session, typically 45–60 minutes. ELEVATED members save ${MEMBER_DISCOUNT_PERCENT}% on IV add-ons.`,
] as const;

export const WELLNESS_PROGRAM_PATIENT_STEPS = [
  `Book your ${WA} Wellness Assessment — a 30–45 minute in-clinic visit with our clinical team.`,
  "Share your history, vitals, and goals with us in person at our Evans office.",
  `When clinically appropriate, we draw labs the same visit (Comprehensive Wellness Panel ${COMP} or Expanded Panel ${EXP}, processed by LabCorp).`,
  "Your physician reviews results — typically within about a week — and calls you to discuss what fits your goals.",
  "If you enroll, choose the ELEVATED program for your protocol, complete consents in the patient portal, and schedule any teaching visits.",
] as const;

export const CARE_PATH_COMPARISON = [
  { label: "Consult required?", iv: "No", wellness: `Yes — ${WA} Wellness Assessment` },
  { label: "How you start", iv: "Walk in or book online today", wellness: "Schedule your Wellness Assessment" },
  {
    label: "Best for",
    iv: "Hydration, recovery, immunity, and performance",
    wellness: "Hormones, medical weight loss, and peptide therapy",
  },
] as const;

export const CARE_LANES = [
  {
    id: "iv-lounge",
    lane: "Lane A",
    title: "IV Lounge",
    tagline: "Walk-in hydration & recovery",
    summary: "Open booking — pick your drip, add boosters, and pay. No wellness assessment needed.",
    steps: IV_LOUNGE_PATIENT_STEPS,
    cta: { label: "Browse the IV menu", href: "/iv-lounge" as const },
  },
  {
    id: "wellness",
    lane: "Lane B",
    title: "Wellness Programs",
    tagline: "Hormones · GLP-1 · peptides",
    summary: `Physician-led programs that start with a ${WA} Wellness Assessment — credited toward your protocol if you enroll.`,
    steps: WELLNESS_PROGRAM_PATIENT_STEPS,
    cta: { label: `Book ${WA} Wellness Assessment`, action: "wellness-booking" as const },
  },
] as const;
