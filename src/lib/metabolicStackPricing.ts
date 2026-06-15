import {
  CATALOG,
  memberPriceCents,
  nonMemberPriceCents,
  type CatalogItem,
} from "./pricing";
import { STACK_ALACARTE_CATALOG_KEYS } from "./metabolicStackConfig";
import type { ElevatedProgramKey } from "./stripeConfig";

export interface StackCompoundPricing {
  key: string;
  name: string;
  nonMemberCents: number;
  memberCents: number;
  interval: "month" | "one_time";
  includedInProgram: boolean;
}

export function stackCompoundPricing(catalogKey: string): StackCompoundPricing | null {
  const item = CATALOG[catalogKey];
  if (!item) return null;
  const includedInProgram =
    item.member.kind === "included" &&
    item.member.program === ("metabolicRecomposition" satisfies ElevatedProgramKey);
  return {
    key: catalogKey,
    name: item.label,
    nonMemberCents: nonMemberPriceCents(item),
    memberCents: includedInProgram ? 0 : memberPriceCents(item),
    interval: item.interval,
    includedInProgram,
  };
}

/** Full-stack à la carte non-member monthly estimate — derived from CATALOG. */
export function metabolicStackAlacarteNonMemberCents(): number {
  return STACK_ALACARTE_CATALOG_KEYS.reduce((sum, key) => {
    const item = CATALOG[key];
    if (!item) return sum;
    return sum + nonMemberPriceCents(item);
  }, 0);
}

export function metabolicStackAlacarteMemberCents(): number {
  return STACK_ALACARTE_CATALOG_KEYS.reduce((sum, key) => {
    const item = CATALOG[key];
    if (!item) return sum;
    return sum + memberPriceCents(item);
  }, 0);
}

export function stackAlacarteLineItems(): StackCompoundPricing[] {
  return STACK_ALACARTE_CATALOG_KEYS.map((key) => stackCompoundPricing(key)).filter(
    (x): x is StackCompoundPricing => x != null,
  );
}

export function catalogItemOrNull(key: string): CatalogItem | null {
  return CATALOG[key] ?? null;
}
