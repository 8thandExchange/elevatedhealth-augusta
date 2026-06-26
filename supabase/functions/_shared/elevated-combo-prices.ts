/**
 * ELEVATED combo add-on Stripe prices + subscription resolution (edge / Deno).
 * Mirrors `src/lib/elevatedComboPrograms.ts` and `src/lib/stripeConfig.ts`.
 */
import { LIVE_ELEVATED_PROGRAMS, LIVE_GLP1_TIRZEPATIDE_PRICE_ID } from "./live-prices.ts";

import { LIVE_ELEVATED_PROGRAMS, LIVE_GLP1_TIRZEPATIDE_PRICE_ID, LIVE_COMBO_ADDON_PRICE_IDS } from "./live-prices.ts";

export { LIVE_COMBO_ADDON_PRICE_IDS };

export type ComboAddonPriceKey = keyof typeof LIVE_COMBO_ADDON_PRICE_IDS;

/** Legacy test-mode hormone add-on — existing subscriptions may still reference this. */
export const LEGACY_HORMONE_ADDON_PRICE_ID = "price_1SmMlOEOtKRY99puBAxTpw99";

export type ComboAnchorKey =
  | "glp1_semaglutide"
  | "glp1_tirzepatide"
  | "trt"
  | "hrt";

const ANCHOR_TO_STRIPE_PRICE: Record<ComboAnchorKey, string> = {
  glp1_semaglutide: LIVE_ELEVATED_PROGRAMS.glp1,
  glp1_tirzepatide: LIVE_GLP1_TIRZEPATIDE_PRICE_ID,
  trt: LIVE_ELEVATED_PROGRAMS.trt,
  hrt: LIVE_ELEVATED_PROGRAMS.hrt,
};

const ANCHOR_PRICE_TO_PROGRAM: Record<string, "trt" | "hrt" | "glp1"> = {
  [LIVE_ELEVATED_PROGRAMS.trt]: "trt",
  [LIVE_ELEVATED_PROGRAMS.hrt]: "hrt",
  [LIVE_ELEVATED_PROGRAMS.glp1]: "glp1",
  [LIVE_GLP1_TIRZEPATIDE_PRICE_ID]: "glp1",
};

const ADDON_PRICE_TO_KEY: Record<string, ComboAddonPriceKey> = Object.fromEntries(
  Object.entries(LIVE_COMBO_ADDON_PRICE_IDS).map(([k, v]) => [v, k as ComboAddonPriceKey]),
) as Record<string, ComboAddonPriceKey>;

/** All combo add-on price IDs including legacy. */
export function allComboAddonPriceIds(): string[] {
  return [
    ...Object.values(LIVE_COMBO_ADDON_PRICE_IDS),
    LEGACY_HORMONE_ADDON_PRICE_ID,
  ];
}

export function isComboAddonPriceId(priceId: string): boolean {
  return allComboAddonPriceIds().includes(priceId);
}

export function anchorStripePrice(anchor: ComboAnchorKey): string {
  return ANCHOR_TO_STRIPE_PRICE[anchor];
}

export function addonStripePrice(addon: ComboAddonPriceKey): string {
  return LIVE_COMBO_ADDON_PRICE_IDS[addon];
}

export function stripeLineItemsForComboSelection(
  anchor: ComboAnchorKey,
  addon: ComboAddonPriceKey | null,
): Array<{ price: string; quantity: number }> {
  const items: Array<{ price: string; quantity: number }> = [
    { price: anchorStripePrice(anchor), quantity: 1 },
  ];
  if (addon) {
    items.push({ price: addonStripePrice(addon), quantity: 1 });
  }
  return items;
}

export function parseComboAnchorKey(raw: string | null | undefined): ComboAnchorKey | null {
  if (!raw) return null;
  const valid: ComboAnchorKey[] = ["glp1_semaglutide", "glp1_tirzepatide", "trt", "hrt"];
  return valid.includes(raw as ComboAnchorKey) ? (raw as ComboAnchorKey) : null;
}

export function parseComboAddonKey(raw: string | null | undefined): ComboAddonPriceKey | null {
  if (!raw) return null;
  const valid = Object.keys(LIVE_COMBO_ADDON_PRICE_IDS) as ComboAddonPriceKey[];
  return valid.includes(raw as ComboAddonPriceKey) ? (raw as ComboAddonPriceKey) : null;
}

export interface ResolvedElevatedSubscription {
  elevated_program: "trt" | "hrt" | "glp1" | "wellness" | null;
  elevated_program_addon: ComboAddonPriceKey | null;
  glp1_molecule: "semaglutide" | "tirzepatide" | null;
  has_legacy_hormone_addon: boolean;
}

/** Resolve anchor program + medication add-on from all subscription line item price IDs. */
export function resolveSubscriptionElevatedState(
  priceIds: string[],
): ResolvedElevatedSubscription {
  let elevated_program: ResolvedElevatedSubscription["elevated_program"] = null;
  let elevated_program_addon: ComboAddonPriceKey | null = null;
  let glp1_molecule: "semaglutide" | "tirzepatide" | null = null;
  let has_legacy_hormone_addon = false;

  for (const id of priceIds) {
    const prog = ANCHOR_PRICE_TO_PROGRAM[id];
    if (prog) {
      elevated_program = prog;
      if (id === LIVE_GLP1_TIRZEPATIDE_PRICE_ID) glp1_molecule = "tirzepatide";
      if (id === LIVE_ELEVATED_PROGRAMS.glp1) glp1_molecule = "semaglutide";
    }

    const addonKey = ADDON_PRICE_TO_KEY[id];
    if (addonKey) elevated_program_addon = addonKey;

    if (id === LEGACY_HORMONE_ADDON_PRICE_ID) {
      has_legacy_hormone_addon = true;
      if (!elevated_program_addon) elevated_program_addon = "trt";
    }
  }

  return {
    elevated_program,
    elevated_program_addon,
    glp1_molecule,
    has_legacy_hormone_addon,
  };
}
