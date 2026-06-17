import { describe, expect, it } from "vitest";
import { canStaffQuote, catalogBySlug, publicCatalogItems } from "./clinicalOptimizationCatalog";
import { fullPricingReadinessAudit, readinessSummary } from "./pricingReadiness";
import { routeIntakeCare } from "./intakeCareRouting";

describe("clinicalOptimizationCatalog", () => {
  it("excludes ketamine from public catalog", () => {
    expect(publicCatalogItems().some((i) => i.slug === "ketamine")).toBe(false);
    expect(catalogBySlug("ketamine")?.public_status).toBe("inactive");
  });

  it("keeps retatrutide provider-only / program path", () => {
    const r = catalogBySlug("retatrutide-provider-directed");
    expect(r?.public_status).toBe("provider_only");
    expect(r?.elevated_program_key).toBe("metabolicRecomposition");
  });

  it("blocks staff quote when cost missing for pathway-only row", () => {
    const pathway = catalogBySlug("recovery-peptide-review");
    expect(pathway).toBeDefined();
    const q = canStaffQuote(pathway!);
    expect(q.ok).toBe(false);
  });
});

describe("pricingReadiness", () => {
  it("produces audit rows for all catalog items", () => {
    const rows = fullPricingReadinessAudit();
    expect(rows.length).toBeGreaterThan(10);
    const summary = readinessSummary();
    expect(summary.total).toBe(rows.length);
  });
});

describe("intakeCareRouting", () => {
  it("routes IV-only to Lane A", () => {
    const r = routeIntakeCare({
      primaryGoal: "iv_only",
      interests: ["iv"],
    });
    expect(r.lane).toBe("lane_a_iv");
    expect(r.ivScreenRequired).toBe(true);
  });

  it("routes recovery interest to Recovery Peptide Review lane", () => {
    const r = routeIntakeCare({
      primaryGoal: "recovery_injury",
      interests: ["recovery_peptides", "glp1"],
    });
    expect(r.lane).toBe("lane_b_consult");
    expect(r.recoveryPeptideReview).toBe(true);
    expect(r.careLaneId).toBe("recovery_peptide_review");
    expect(r.providerPeptideReview).toBe(true);
  });
});
