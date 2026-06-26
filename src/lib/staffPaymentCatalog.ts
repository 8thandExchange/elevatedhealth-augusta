/**
 * Staff-facing payment link catalog — Quick Payment modal and clinic checkout.
 * Combos, programs, à la carte fills, and provider-directed SKUs in one list.
 */
import {
  listComboOptions,
  type ComboAnchorKey,
  type ComboAddonKey,
} from "./elevatedComboPrograms";
import {
  CORE_SERVICES,
  MEDICATION_FILLS,
  METABOLIC_STACK_ALACARTE,
  PEPTIDE_PRODUCTS,
  RECOVERY_PEPTIDE_PRODUCTS,
  SEXUAL_WELLNESS_PRODUCTS,
  HAIR_RESTORATION_PRODUCTS,
  ELEVATED_PROGRAMS,
  GLP1_PROGRAM_VARIANTS,
} from "./stripeConfig";

export type StaffPaymentDelivery = "email" | "sms" | "copy";

export interface StaffPaymentPatient {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  gender?: string | null;
}

export interface StaffPaymentProduct {
  value: string;
  label: string;
  price: string;
  category: string;
}

const COMBO_PREFIX = "combo:";

function comboValue(comboSlug: string): string {
  return `${COMBO_PREFIX}${comboSlug}`;
}

export function isComboProduct(value: string): boolean {
  return value.startsWith(COMBO_PREFIX);
}

export function comboSlugFromProduct(value: string): string {
  return value.slice(COMBO_PREFIX.length);
}

function catalogEntry(
  value: string,
  label: string,
  price: string,
  category: string,
): StaffPaymentProduct {
  return { value, label, price, category };
}

function fromRecord(
  prefix: string,
  category: string,
  record: Record<string, { name: string; displayPrice: string }>,
  exclude?: string[],
): StaffPaymentProduct[] {
  return Object.entries(record)
    .filter(([key]) => !exclude?.includes(key))
    .map(([key, item]) =>
      catalogEntry(`${prefix}:${key}`, item.name, item.displayPrice, category),
    );
}

/** All selectable products for the Send Payment Link modal (gender filters combo add-ons). */
export function buildStaffPaymentProducts(gender?: string | null): StaffPaymentProduct[] {
  const products: StaffPaymentProduct[] = [];

  for (const quote of listComboOptions(gender)) {
    const label = quote.addon
      ? `${quote.anchor.label} + ${quote.addon.shortLabel}`
      : quote.anchor.label;
    products.push(
      catalogEntry(comboValue(quote.comboSlug), label, quote.totalDisplay, "ELEVATED Combo"),
    );
  }

  products.push(
    catalogEntry("elevated_iv", "ELEVATED IV Membership", ELEVATED_PROGRAMS.wellness.displayPrice, "Membership"),
    catalogEntry("elevated_trt", ELEVATED_PROGRAMS.trt.name, ELEVATED_PROGRAMS.trt.displayPrice, "Membership"),
    catalogEntry("elevated_hrt", ELEVATED_PROGRAMS.hrt.name, ELEVATED_PROGRAMS.hrt.displayPrice, "Membership"),
    catalogEntry("consultation", "Wellness Assessment", "$79", "Consultation"),
    catalogEntry(
      "semaglutide",
      GLP1_PROGRAM_VARIANTS.semaglutide.name,
      GLP1_PROGRAM_VARIANTS.semaglutide.displayPrice,
      "Weight Loss",
    ),
    catalogEntry(
      "tirzepatide",
      GLP1_PROGRAM_VARIANTS.tirzepatide.name,
      GLP1_PROGRAM_VARIANTS.tirzepatide.displayPrice,
      "Weight Loss",
    ),
    catalogEntry(
      "alacarte_testosterone",
      MEDICATION_FILLS.testosterone.name,
      MEDICATION_FILLS.testosterone.displayPrice,
      "À la carte HRT",
    ),
    catalogEntry("alacarte_biEst", MEDICATION_FILLS.biEst.name, MEDICATION_FILLS.biEst.displayPrice, "À la carte HRT"),
    catalogEntry(
      "alacarte_progesterone",
      MEDICATION_FILLS.progesterone.name,
      MEDICATION_FILLS.progesterone.displayPrice,
      "À la carte HRT",
    ),
    catalogEntry(
      "alacarte_semaglutide",
      MEDICATION_FILLS.semaglutide.name,
      MEDICATION_FILLS.semaglutide.displayPrice,
      "GLP-1 One-Time Fill",
    ),
    catalogEntry(
      "alacarte_tirzepatide",
      MEDICATION_FILLS.tirzepatide.name,
      MEDICATION_FILLS.tirzepatide.displayPrice,
      "GLP-1 One-Time Fill",
    ),
    catalogEntry(
      "alacarte_followUp",
      CORE_SERVICES.phoneFollowUp.name,
      CORE_SERVICES.phoneFollowUp.displayPrice,
      "À la carte",
    ),
    catalogEntry(
      "alacarte_labPanel",
      CORE_SERVICES.comprehensivePanel.name,
      CORE_SERVICES.comprehensivePanel.displayPrice,
      "Labs",
    ),
    catalogEntry(
      "alacarte_labPanelExpanded",
      CORE_SERVICES.expandedPanel.name,
      CORE_SERVICES.expandedPanel.displayPrice,
      "Labs",
    ),
  );

  products.push(...fromRecord("recovery", "Recovery Peptides", RECOVERY_PEPTIDE_PRODUCTS));
  products.push(
    ...fromRecord("peptide", "Peptide Therapy", PEPTIDE_PRODUCTS, [
      "nadTroches",
      "nadInjection",
      "nadNasal",
    ]),
  );
  products.push(...fromRecord("metabolic", "Metabolic (Provider)", METABOLIC_STACK_ALACARTE));
  products.push(...fromRecord("sexual", "Sexual Wellness", SEXUAL_WELLNESS_PRODUCTS));
  products.push(...fromRecord("hair", "Hair Restoration", HAIR_RESTORATION_PRODUCTS));

  return products;
}

export function getStaffPaymentProductLabel(value: string, products: StaffPaymentProduct[]): string {
  return products.find((p) => p.value === value)?.label ?? value;
}

export function getStaffPaymentProductPrice(value: string, products: StaffPaymentProduct[]): string {
  return products.find((p) => p.value === value)?.price ?? "";
}

/** Grouped for Select UI — preserves category order. */
export function groupStaffPaymentProducts(
  products: StaffPaymentProduct[],
): { category: string; items: StaffPaymentProduct[] }[] {
  const order = [
    "ELEVATED Combo",
    "Membership",
    "Weight Loss",
    "Consultation",
    "À la carte HRT",
    "GLP-1 One-Time Fill",
    "Recovery Peptides",
    "Peptide Therapy",
    "Metabolic (Provider)",
    "Sexual Wellness",
    "Hair Restoration",
    "Labs",
    "À la carte",
  ];
  const map = new Map<string, StaffPaymentProduct[]>();
  for (const p of products) {
    const list = map.get(p.category) ?? [];
    list.push(p);
    map.set(p.category, list);
  }
  const seen = new Set<string>();
  const groups: { category: string; items: StaffPaymentProduct[] }[] = [];
  for (const category of order) {
    const items = map.get(category);
    if (items?.length) {
      groups.push({ category, items });
      seen.add(category);
    }
  }
  for (const [category, items] of map) {
    if (!seen.has(category)) groups.push({ category, items });
  }
  return groups;
}

export type ComboActivationParams = {
  comboSlug: string;
  comboAnchor: ComboAnchorKey;
  comboAddon: ComboAddonKey | null;
  baseMembership: string;
};

export function comboActivationParams(comboSlug: string): ComboActivationParams {
  const [anchorPart, addonPart] = comboSlug.includes("+")
    ? comboSlug.split("+", 2)
    : [comboSlug, null];
  const comboAnchor = anchorPart as ComboAnchorKey;
  const comboAddon = addonPart as ComboAddonKey | null;
  const baseMembership =
    comboAnchor === "glp1_tirzepatide"
      ? "tirzepatide"
      : comboAnchor.startsWith("glp1")
        ? "semaglutide"
        : comboAnchor;
  return { comboSlug, comboAnchor, comboAddon, baseMembership };
}
