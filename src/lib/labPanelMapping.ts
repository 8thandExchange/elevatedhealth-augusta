/** Maps lab_panels.slug → send-labcorp-requisition panelType keys. */
import { labMemberCents } from "./pricing";

export {
  labCheckoutTierForSlug,
  labPanelDisplayPrice,
  labPanelMemberCents,
  labPanelNonMemberCents,
  PROGRAM_DEFAULT_LAB_SLUG,
  stripePriceIdForLabSlug,
} from "./labPanelCheckout";

export {
  recommendLabPanelSlug,
  recommendLabPanelSlugFromSymptoms,
  GOAL_TO_LAB_PANEL_SLUG,
  LAB_PANEL_SLUGS,
  LAB_PANEL_DISPLAY_NAMES,
} from "./labPanelRecommendations";

export type { LabPanelSlug } from "./labPanelRecommendations";

export type LabcorpRequisitionKey = "mens_safety" | "thyroid" | "safety_cmp";

export const LAB_PANEL_REQUISITION_KEY: Record<string, LabcorpRequisitionKey> = {
  "hormone-male": "mens_safety",
  "hormone-female": "thyroid",
  "foundation-wellness": "safety_cmp",
  "weight-optimization": "safety_cmp",
  "sexual-wellness": "safety_cmp",
};

export const LAB_ORDER_STATUS_LABELS: Record<string, string> = {
  ordered: "Ordered",
  requisition_sent: "Requisition sent",
  awaiting_draw: "Awaiting draw",
  sample_collected: "Sample collected",
  results_pending: "Results pending",
  results_received: "Results received",
  reviewed: "Reviewed",
  cancelled: "Cancelled",
};

export function formatLabPanelPrice(cents: number | null, _memberCents: number | null, isMember: boolean): string {
  if (cents == null) return "—";
  const c = isMember ? labMemberCents(cents) : cents;
  return `$${(c / 100).toFixed(0)}`;
}
