import { describe, expect, it } from "vitest";
import { parseComboSlug } from "./elevatedComboPrograms";
import {
  buildStaffPaymentProducts,
  comboSlugFromProduct,
  isComboProduct,
} from "./staffPaymentCatalog";

describe("parseComboSlug", () => {
  it("parses anchor-only slugs", () => {
    expect(parseComboSlug("glp1_semaglutide")).toEqual({
      anchor: "glp1_semaglutide",
      addon: null,
    });
  });

  it("parses anchor + addon slugs", () => {
    expect(parseComboSlug("glp1_semaglutide+trt")).toEqual({
      anchor: "glp1_semaglutide",
      addon: "trt",
    });
  });
});

describe("buildStaffPaymentProducts", () => {
  it("includes combo programs and singles", () => {
    const products = buildStaffPaymentProducts("male");
    const combo = products.filter((p) => isComboProduct(p.value));
    expect(combo.length).toBeGreaterThanOrEqual(8);
    expect(products.some((p) => p.value === "consultation")).toBe(true);
    expect(products.some((p) => p.value === "recovery:bpc157")).toBe(true);
    expect(combo.some((p) => comboSlugFromProduct(p.value) === "glp1_semaglutide+trt")).toBe(
      true,
    );
  });

  it("filters HRT add-on for male patients in combo list", () => {
    const maleProducts = buildStaffPaymentProducts("male");
    const maleComboAddons = maleProducts
      .filter((p) => p.value.includes("+hrt"))
      .map((p) => p.value);
    const femaleProducts = buildStaffPaymentProducts("female");
    const femaleComboAddons = femaleProducts
      .filter((p) => p.value.includes("+trt"))
      .map((p) => p.value);
    expect(maleComboAddons).toHaveLength(0);
    expect(femaleComboAddons).toHaveLength(0);
  });
});
