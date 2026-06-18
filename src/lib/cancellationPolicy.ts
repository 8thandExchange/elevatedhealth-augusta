import { CORE_SERVICES } from "@/lib/stripeConfig";
import { SITE_CONFIG } from "@/lib/siteConfig";

/** Minimum notice required to cancel or reschedule without penalty. */
export const CANCELLATION_NOTICE_HOURS = 24;

export const REBOOKING_FEE_DISPLAY = CORE_SERVICES.rebookingFee.displayPrice;

export const CARE_EMAIL = "care@elevatedhealthaugusta.com";

export const REFUND_PROCESSING_WINDOW = "5–7 business days";

export type CancellationScenario = {
  id: string;
  situation: string;
  outcome: string;
};

/** Patient-facing rules by appointment type — keep in sync with /terms#cancellation. */
export const IV_CANCELLATION_SCENARIOS: CancellationScenario[] = [
  {
    id: "iv-early",
    situation: `Cancel or reschedule ${CANCELLATION_NOTICE_HOURS}+ hours before your IV slot`,
    outcome: "Full refund to your original payment method, or one free reschedule (your choice). Email or call us — do not simply skip the appointment.",
  },
  {
    id: "iv-late",
    situation: `Cancel or reschedule with less than ${CANCELLATION_NOTICE_HOURS} hours notice`,
    outcome: `No refund. You may reschedule once after paying the ${REBOOKING_FEE_DISPLAY} rebooking fee.`,
  },
  {
    id: "iv-noshow",
    situation: "No-show (missed appointment without notice)",
    outcome: `Payment is forfeited. A ${REBOOKING_FEE_DISPLAY} rebooking fee is required before you can book again. Repeated no-shows may result in declined future bookings.`,
  },
  {
    id: "iv-blocked",
    situation: "We cannot treat you after screening or at the chair for clinical safety",
    outcome: "Full refund for any prepaid service not rendered.",
  },
];

export const CLINICAL_CANCELLATION_SCENARIOS: CancellationScenario[] = [
  {
    id: "clinical-early",
    situation: `Cancel or reschedule ${CANCELLATION_NOTICE_HOURS}+ hours before a consult or follow-up`,
    outcome: "No fee. Reschedule through the patient portal or by contacting the office.",
  },
  {
    id: "clinical-late",
    situation: `Cancel or reschedule with less than ${CANCELLATION_NOTICE_HOURS} hours notice`,
    outcome: `${REBOOKING_FEE_DISPLAY} rebooking fee before a new visit can be scheduled.`,
  },
  {
    id: "clinical-noshow",
    situation: "No-show",
    outcome: `${REBOOKING_FEE_DISPLAY} rebooking fee; visit fees already rendered are non-refundable.`,
  },
  {
    id: "clinical-assessment",
    situation: "Wellness Assessment or labs already completed",
    outcome: "Non-refundable once the visit or draw has occurred.",
  },
];

export const REFUND_REQUEST_STEPS = [
  `Email ${CARE_EMAIL} or call ${SITE_CONFIG.phone} with your name, appointment date, and reason.`,
  "Our team confirms whether your request meets the cancellation window and service type above.",
  "Approved refunds are issued to your original payment method (typically within " +
    REFUND_PROCESSING_WINDOW +
    ").",
  "Late cancellations and no-shows are not refunded; the rebooking fee must be paid before rescheduling.",
] as const;

export const STAFF_REFUND_CHECKLIST = [
  "Confirm appointment type (IV prepaid, consult, follow-up, membership).",
  `Compare cancellation request time to scheduled start (${CANCELLATION_NOTICE_HOURS}-hour rule).`,
  "Document outcome in the appointment note (on-time cancel, late cancel, no-show, clinical block).",
  "IV / à la carte: process Stripe refund from the original Checkout session when eligible; note refund ID in chart.",
  `Late cancel / no-show: set patient onboarding_status to rebooking_fee_required when applicable; patient pays via create-rebooking-checkout before scheduling unlocks.`,
  "Notify patient by email/SMS when refund is initiated or when rebooking fee is required.",
] as const;
