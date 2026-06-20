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
  "Walk in during clinic hours or book your drip online — no wellness assessment required.",
  "Complete a brief health screening so we can confirm IV therapy is safe for you.",
  "Choose your drip or add-on (Myers Cocktail, NAD+, glutathione push, custom hydration) and check out.",
  `ELEVATED members save ${MEMBER_DISCOUNT_PERCENT}% on IV add-ons.`,
  "Interested in hormones, weight loss, or peptides? We can help you book a Wellness Assessment when you're ready.",
] as const;

export const WELLNESS_PROGRAM_PATIENT_STEPS = [
  `Book your ${WA} Wellness Assessment — a 30–45 minute in-clinic visit with our clinical team.`,
  "Share your history, vitals, and goals with us in person at our Evans office.",
  `When clinically appropriate, we draw labs the same visit (Comprehensive Wellness Panel ${COMP} or Expanded Panel ${EXP}, processed by LabCorp).`,
  "Your physician reviews results — typically within about a week — and calls you to discuss what fits your goals.",
  "If you enroll, choose the ELEVATED program for your protocol, complete consents in the patient portal, and schedule any teaching visits.",
  "We do not prescribe from symptoms alone. Your plan is based on labs and physician sign-off before treatment begins.",
] as const;

export const PATIENT_CARE_JOURNEY = [
  {
    phase: "01",
    title: "Book your visit",
    detail: `IV Lounge walk-in or online booking — or start with a ${WA} Wellness Assessment for hormones, medical weight loss, and peptides.`,
  },
  {
    phase: "02",
    title: "Assessment & labs",
    detail: "In-clinic visit with our RN or clinical team: symptoms, history, vitals, and goals. Blood draw on-site when your provider orders a panel.",
  },
  {
    phase: "03",
    title: "Physician review",
    detail: "Your physician interprets LabCorp results and recommends a path — or redirects you safely if a program is not appropriate.",
  },
  {
    phase: "04",
    title: "Your program",
    detail: "Enroll in the ELEVATED tier that fits your protocol. Medication where prescribed, monthly check-ins, quarterly labs, and messaging — one transparent monthly price.",
  },
] as const;
