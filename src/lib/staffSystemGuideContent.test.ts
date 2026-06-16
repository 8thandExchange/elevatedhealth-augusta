import { describe, expect, it } from "vitest";
import { buildGoalLabTable, buildVendorRoutingTable } from "./staffSystemGuideContent";

describe("staffSystemGuideContent", () => {
  it("builds goal-to-lab rows with Stripe-aligned panel charges", () => {
    const rows = buildGoalLabTable();
    expect(rows.length).toBeGreaterThan(5);
    const weight = rows.find((r) => r.goalKey === "weight_loss");
    expect(weight?.patientCharge).toBe("$299");
    expect(weight?.panelName).toMatch(/Expanded/i);
    const trt = rows.find((r) => r.goalKey === "low_testosterone");
    expect(trt?.patientCharge).toBe("$199");
    const iv = rows.find((r) => r.goalKey === "iv_only");
    expect(iv?.panelSlug).toBeNull();
  });

  it("resolves vendor routing from shared vendorRouting lib", () => {
    const vendors = buildVendorRoutingTable();
    expect(vendors.some((v) => v.vendor.includes("Evans"))).toBe(true);
    expect(vendors.some((v) => v.laneKey === "labs")).toBe(true);
  });
});
