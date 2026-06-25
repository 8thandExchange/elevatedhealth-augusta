/**
 * Formulary economics — margin and vendor comparison for staff/financial analysis.
 */
import {
  FORMULARY_ECONOMICS_CATALOG,
  type FormularyEconomicsLine,
  type FormularySupplier,
} from "./vendorRouting";

export interface EconomicsRow extends FormularyEconomicsLine {
  marginPrimaryPct: number | null;
  marginAlternatePct: number | null;
  savingsVsAlternateCents: number | null;
  monthlyCogsAtCapacity: number | null;
}

export function marginPct(costCents: number | null | undefined, priceCents: number | null | undefined): number | null {
  if (costCents == null || priceCents == null || priceCents <= 0) return null;
  return Math.round(((priceCents - costCents) / priceCents) * 100);
}

export function enrichEconomicsLine(line: FormularyEconomicsLine): EconomicsRow {
  const price = line.clientPriceCents > 0 ? line.clientPriceCents : null;
  const monthlyCogsAtCapacity =
    line.monthlyUnitsAtCapacity != null
      ? line.primaryCostCents * line.monthlyUnitsAtCapacity
      : null;

  return {
    ...line,
    marginPrimaryPct: marginPct(line.primaryCostCents, price),
    marginAlternatePct:
      line.alternateCostCents != null ? marginPct(line.alternateCostCents, price) : null,
    savingsVsAlternateCents:
      line.alternateCostCents != null
        ? line.alternateCostCents - line.primaryCostCents
        : null,
    monthlyCogsAtCapacity,
  };
}

export function allEconomicsRows(): EconomicsRow[] {
  return FORMULARY_ECONOMICS_CATALOG.map(enrichEconomicsLine);
}

export function economicsBySupplier(supplier: FormularySupplier): EconomicsRow[] {
  return allEconomicsRows().filter((r) => r.primarySupplier === supplier);
}

export function totalGcSavingsMonthly(): number {
  return allEconomicsRows()
    .filter((r) => r.savingsVsAlternateCents != null && r.savingsVsAlternateCents < 0)
    .reduce((sum, r) => sum + Math.abs(r.savingsVsAlternateCents ?? 0), 0);
}

export const fmtUsd = (cents: number): string =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export const fmtPct = (pct: number | null): string => (pct == null ? "—" : `${pct}%`);
