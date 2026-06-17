/**
 * Pricing readiness audit — flags items that cannot be safely quoted/ordered.
 */
import {
  CLINICAL_OPTIMIZATION_CATALOG,
  canStaffQuote,
  itemMarginPercent,
  type ClinicalOptimizationItem,
} from "./clinicalOptimizationCatalog";
import { supplyProfileForItem } from "./supplyReadiness";

export type ReadinessIssue =
  | "missing_clinic_cost"
  | "missing_supplier"
  | "missing_sku"
  | "missing_patient_price"
  | "margin_below_threshold"
  | "inactive_protocol"
  | "missing_consent"
  | "missing_supplies_profile"
  | "not_quotable";

export interface PricingReadinessRow {
  slug: string;
  display_name: string;
  category: string;
  clinical_status: string;
  public_status: string;
  patient_price_cents: number | null;
  clinic_cost_cents: number | null;
  margin_percent: number | null;
  issues: ReadinessIssue[];
  blockers: string[];
  quotable: boolean;
}

export const MARGIN_ALERT_THRESHOLD = 25;

export function auditItemReadiness(item: ClinicalOptimizationItem): PricingReadinessRow {
  const issues: ReadinessIssue[] = [];
  const { ok, blockers } = canStaffQuote(item);

  if (item.clinic_cost_cents == null) issues.push("missing_clinic_cost");
  if (!item.supplier) issues.push("missing_supplier");
  if (item.ordering_supplies_required && !item.supplier_sku && item.category !== "glp1_weight_loss") {
    issues.push("missing_sku");
  }
  if (item.patient_price_cents == null) issues.push("missing_patient_price");
  const margin = itemMarginPercent(item);
  if (margin != null && margin < item.margin_threshold_pct) issues.push("margin_below_threshold");
  if (item.clinical_status !== "active") issues.push("inactive_protocol");
  if (item.requires_consent && !item.consent_type) issues.push("missing_consent");
  if (item.ordering_supplies_required) {
    try {
      supplyProfileForItem(item);
    } catch {
      issues.push("missing_supplies_profile");
    }
  }
  if (!ok) issues.push("not_quotable");

  return {
    slug: item.slug,
    display_name: item.display_name,
    category: item.category,
    clinical_status: item.clinical_status,
    public_status: item.public_status,
    patient_price_cents: item.patient_price_cents,
    clinic_cost_cents: item.clinic_cost_cents,
    margin_percent: margin,
    issues: [...new Set(issues)],
    blockers,
    quotable: ok,
  };
}

export function fullPricingReadinessAudit(): PricingReadinessRow[] {
  return CLINICAL_OPTIMIZATION_CATALOG.map(auditItemReadiness).sort((a, b) => {
    if (a.quotable !== b.quotable) return a.quotable ? 1 : -1;
    return a.display_name.localeCompare(b.display_name);
  });
}

export function readinessSummary(): {
  total: number;
  quotable: number;
  blocked: number;
  missingCost: number;
  lowMargin: number;
} {
  const rows = fullPricingReadinessAudit();
  return {
    total: rows.length,
    quotable: rows.filter((r) => r.quotable).length,
    blocked: rows.filter((r) => !r.quotable).length,
    missingCost: rows.filter((r) => r.issues.includes("missing_clinic_cost")).length,
    lowMargin: rows.filter((r) => r.issues.includes("margin_below_threshold")).length,
  };
}
