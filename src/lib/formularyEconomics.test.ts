import { describe, expect, it } from "vitest";
import {
  allEconomicsRows,
  marginPct,
  metabolicStackEconomics,
} from "./formularyEconomics";
import { FORMULARY_ECONOMICS_CATALOG } from "./vendorRouting";
import { publicMenuItemCount } from "./simplifiedMenus";

describe("formularyEconomics", () => {
  it("metabolic stack GC margin beats FCC margin at $1,199/mo", () => {
    const s = metabolicStackEconomics();
    expect(s.programPriceCents).toBe(119900);
    expect(s.gcModeledCogsCents).toBeLessThan(s.fccModeledCogsCents);
    expect(s.gcMarginPct).toBeGreaterThan(s.fccMarginPct);
    expect(s.gcSavingsVsFccCents).toBeGreaterThan(0);
  });

  it("retatrutide GC primary cost is below FCC alternate", () => {
    const row = allEconomicsRows().find((r) => r.itemCode === "PEPTIDE-RETATRUTIDE");
    expect(row?.primaryCostCents).toBeLessThan(row?.alternateCostCents ?? Infinity);
  });

  it("NAD+ stays FCC-primary (cheaper than GC)", () => {
    const row = allEconomicsRows().find((r) => r.itemCode === "PEPTIDE-NAD-INJ");
    expect(row?.primarySupplier).toBe("fcc");
    expect(row?.primaryCostCents).toBeLessThan(row?.alternateCostCents ?? Infinity);
  });

  it("every catalog line has positive client price or is staff-only", () => {
    for (const line of FORMULARY_ECONOMICS_CATALOG) {
      if (line.publicMenu) {
        expect(line.clientPriceCents).toBeGreaterThan(0);
      }
    }
  });

  it("marginPct handles nulls", () => {
    expect(marginPct(null, 100)).toBeNull();
    expect(marginPct(50, 100)).toBe(50);
  });
});

describe("simplifiedMenus", () => {
  it("public menu stays under 20 headline SKUs", () => {
    expect(publicMenuItemCount()).toBeLessThanOrEqual(20);
  });
});
