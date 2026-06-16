import { describe, expect, it } from "vitest";
import {
  defaultPharmacyCategory,
  formularyItemsForCategory,
  visiblePharmacyCategories,
} from "./pharmacyOrderFormulary";

describe("pharmacyOrderFormulary", () => {
  it("defaults male patients to TRT tab", () => {
    expect(defaultPharmacyCategory("male")).toBe("male_trt");
    const items = formularyItemsForCategory("male_trt", { patientGender: "male" });
    expect(items.some((i) => i.id === "trt_testosterone_cyp")).toBe(true);
    expect(items.some((i) => i.escalationOnly)).toBe(false);
  });

  it("hides gender-specific tabs when sex known", () => {
    const maleCats = visiblePharmacyCategories("male");
    expect(maleCats.some((c) => c.id === "female_bhrt")).toBe(false);
    expect(maleCats.some((c) => c.id === "male_trt")).toBe(true);
  });
});
