/**
 * Lab panel financial rollup — sum EHA COGS from deduplicated lab_tests rows.
 */

export interface LabTestCostRow {
  id: string;
  code: string;
  name: string;
  eha_cost_cents: number | null;
  non_member_price_cents: number;
}

export interface PanelEconomicsInput {
  panelSlug: string;
  panelName: string;
  patientChargeCents: number;
  tests: LabTestCostRow[];
}

export interface PanelEconomicsResult {
  panelSlug: string;
  panelName: string;
  patientChargeCents: number;
  totalLabCostCents: number | null;
  missingPriceCount: number;
  grossProfitCents: number | null;
  marginPct: number | null;
  marginIsFinal: boolean;
  marginBand: "green" | "yellow" | "red" | "unknown";
}

export function computePanelEconomics(input: PanelEconomicsInput): PanelEconomicsResult {
  const missingPriceCount = input.tests.filter(
    (t) => t.eha_cost_cents == null || t.eha_cost_cents <= 0,
  ).length;

  const marginIsFinal = missingPriceCount === 0 && input.tests.length > 0;

  let totalLabCostCents: number | null = null;
  if (input.tests.length > 0) {
    const priced = input.tests.filter((t) => t.eha_cost_cents != null && t.eha_cost_cents > 0);
    if (priced.length === input.tests.length) {
      totalLabCostCents = priced.reduce((sum, t) => sum + (t.eha_cost_cents ?? 0), 0);
    } else if (priced.length > 0) {
      totalLabCostCents = priced.reduce((sum, t) => sum + (t.eha_cost_cents ?? 0), 0);
    }
  }

  let grossProfitCents: number | null = null;
  let marginPct: number | null = null;
  let marginBand: PanelEconomicsResult["marginBand"] = "unknown";

  if (marginIsFinal && totalLabCostCents != null && input.patientChargeCents > 0) {
    grossProfitCents = input.patientChargeCents - totalLabCostCents;
    marginPct = (grossProfitCents / input.patientChargeCents) * 100;
    if (marginPct >= 40) marginBand = "green";
    else if (marginPct >= 20) marginBand = "yellow";
    else marginBand = "red";
  }

  return {
    panelSlug: input.panelSlug,
    panelName: input.panelName,
    patientChargeCents: input.patientChargeCents,
    totalLabCostCents,
    missingPriceCount,
    grossProfitCents,
    marginPct,
    marginIsFinal,
    marginBand,
  };
}

export function formatMarginLabel(result: PanelEconomicsResult): string {
  if (!result.marginIsFinal) {
    return `Incomplete — ${result.missingPriceCount} lab(s) missing EHA cost`;
  }
  if (result.marginPct == null) return "—";
  return `${result.marginPct.toFixed(1)}% margin`;
}

export function formatCentsUsd(cents: number | null): string {
  if (cents == null) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}
