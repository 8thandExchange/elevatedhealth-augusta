import { describe, expect, it } from "vitest";
import {
  defaultPharmacyCategory,
  formularyItemsForCategory,
  visiblePharmacyCategories,
  CUSTOM_PHARMACY_VENDOR,
} from "./pharmacyOrderFormulary";

describe("pharmacyOrderFormulary", () => {
  it("defaults male patients to men's cream tab", () => {
    expect(defaultPharmacyCategory("male")).toBe("male_creams");
    const items = formularyItemsForCategory("male_creams", { patientGender: "male" });
    expect(items.some((i) => i.id === "male_testosterone_cream")).toBe(true);
    expect(items.every((i) => i.customPreparationId.includes("cream"))).toBe(true);
  });

  it("hides gender-specific tabs when sex known", () => {
    const maleCats = visiblePharmacyCategories("male");
    expect(maleCats.some((c) => c.id === "female_creams")).toBe(false);
    expect(maleCats.some((c) => c.id === "male_creams")).toBe(true);
  });

  it("routes all items to Custom Pharmacy", () => {
    expect(CUSTOM_PHARMACY_VENDOR).toContain("Custom Pharmacy");
  });
});
