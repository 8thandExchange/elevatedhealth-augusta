import { ELEVATED_PROGRAMS, GLP1_DISPLAY_PRICE_RANGE } from "./stripeConfig";

/** Patient-facing copy for program-specific memberships (not legacy single-tier). */
export const ELEVATED_PROGRAMS_PRICE_RANGE = "$199–$449/mo";

export const ELEVATED_PROGRAMS_SUMMARY =
  "ELEVATED TRT ($249/mo), ELEVATED HRT ($229/mo), ELEVATED GLP-1 (semaglutide $349/mo · tirzepatide $449/mo), or ELEVATED IV ($199/mo)";

export const MEMBER_ALACARTE_DISCOUNT_COPY =
  "Active ELEVATED members receive 20% off eligible à la carte add-ons (excluding medications already bundled in their program).";

export function elevatedProgramLabel(key: keyof typeof ELEVATED_PROGRAMS): string {
  const p = ELEVATED_PROGRAMS[key];
  return `${p.name} (${p.displayPrice})`;
}

export { GLP1_DISPLAY_PRICE_RANGE };
