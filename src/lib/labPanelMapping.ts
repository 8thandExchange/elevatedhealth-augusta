/** Maps lab_panels.slug → send-labcorp-requisition panelType keys. */
export type LabcorpRequisitionKey = "mens_safety" | "thyroid" | "safety_cmp";

export const LAB_PANEL_REQUISITION_KEY: Record<string, LabcorpRequisitionKey> = {
  "hormone-male": "mens_safety",
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

export function formatLabPanelPrice(cents: number | null, memberCents: number | null, isMember: boolean): string {
  const c = isMember && memberCents != null ? memberCents : cents;
  if (c == null) return "—";
  return `$${(c / 100).toFixed(0)}`;
}
