import { ALL_CONSENTS } from "@/data/consents";
import type { ConsentType } from "@/data/consents/types";

export const LAB_ORDER_STATUS_LABEL: Record<string, string> = {
  ordered: "Order placed",
  requisition_sent: "Requisition sent",
  awaiting_draw: "Ready for your blood draw",
  sample_collected: "Sample collected",
  results_pending: "Results pending",
  results_received: "Results received",
  reviewed: "Reviewed by your care team",
  cancelled: "Cancelled",
};

export const LAB_PANEL_LABEL: Record<string, string> = {
  "hormone-male": "Hormone Panel (Male)",
  "hormone-female": "Hormone Panel (Female)",
  "foundation-wellness": "Foundation Wellness Panel",
  "weight-optimization": "Weight Optimization Panel",
  "sexual-wellness": "Sexual Wellness Panel",
};

export const APPOINTMENT_SERVICE_LABEL: Record<string, string> = {
  consult: "Wellness assessment",
  iv: "IV therapy",
  hormone: "Hormone visit",
  follow_up: "Follow-up visit",
  weight_loss: "Weight loss visit",
  peptide: "Peptide consult",
};

export const APPOINTMENT_STATUS_LABEL: Record<string, string> = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  checked_in: "Checked in",
  completed: "Completed",
  no_show: "Missed",
  cancelled: "Cancelled",
};

export function consentTypeTitle(type: string): string {
  const doc = ALL_CONSENTS[type as ConsentType];
  return doc?.title ?? type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function serviceLineLabel(line: string): string {
  return APPOINTMENT_SERVICE_LABEL[line] ?? line.replace(/_/g, " ");
}
