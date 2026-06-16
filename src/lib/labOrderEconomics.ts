/**
 * Lab order screen economics — staff-only rollup for LabOrderWorkflow (Task 9).
 */
import {
  computePanelEconomics,
  formatCentsUsd,
  formatMarginLabel,
  type LabTestCostRow,
  type PanelEconomicsResult,
} from "./labCatalogEconomics";
import { labPanelNonMemberCents } from "./labPanelCheckout";

export interface LabPanelBillingMeta {
  included_in_program: boolean;
  initial_paid_at_intake: boolean;
  validity_days: number;
}

export function panelBillingContext(panel: LabPanelBillingMeta): {
  intakeLabel: string;
  programLabel: string;
  validityLabel: string;
} {
  return {
    intakeLabel: panel.initial_paid_at_intake
      ? "Initial draw — patient pays panel charge at intake"
      : "Initial draw — no separate panel charge",
    programLabel: panel.included_in_program
      ? "In-program quarterly monitoring — $0 to patient"
      : "Not included in program monitoring bundle",
    validityLabel: `Results validity window: ${panel.validity_days} days (staff reference)`,
  };
}

export function buildPanelEconomicsForOrder(
  panelSlug: string,
  panelName: string,
  tests: LabTestCostRow[],
): PanelEconomicsResult {
  return computePanelEconomics({
    panelSlug,
    panelName,
    patientChargeCents: labPanelNonMemberCents(panelSlug),
    tests,
  });
}

export function economicsSummaryLines(result: PanelEconomicsResult): string[] {
  const lines = [
    `Patient charge: ${formatCentsUsd(result.patientChargeCents)}`,
    `EHA lab COGS: ${result.marginIsFinal ? formatCentsUsd(result.totalLabCostCents) : `${formatCentsUsd(result.totalLabCostCents)} (partial)`}`,
  ];
  if (result.marginIsFinal) {
    lines.push(`Gross profit: ${formatCentsUsd(result.grossProfitCents)}`);
    lines.push(`Margin: ${formatMarginLabel(result)}`);
  } else {
    lines.push(formatMarginLabel(result));
  }
  return lines;
}
