/**
 * ELEVATED member discount — Stripe Coupon path (PR #12).
 * Coupon "ELEVATED Member 20% Discount" is applied server-side only after
 * `getActiveElevatedProgram` succeeds and `getDiscountEligibility` allows the SKU.
 *
 * Set `STRIPE_ELEVATED_MEMBER_COUPON_ID` in Supabase secrets before live deploy
 * (create via Stripe Dashboard or stripe.coupons.create — see PR12 plan doc).
 */
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

export type ElevatedProgramKey = "trt" | "hrt" | "glp1" | "wellness";

const PROGRAM_KEYS = new Set<ElevatedProgramKey>(["trt", "hrt", "glp1", "wellness"]);

/**
 * TODO: Create Stripe Coupon "ELEVATED Member 20% Discount" (20% off) and set Supabase secret
 * `STRIPE_ELEVATED_MEMBER_COUPON_ID` before production. Never expose to clients.
 */
export const ELEVATED_MEMBER_COUPON_ENV_KEY = "STRIPE_ELEVATED_MEMBER_COUPON_ID";

export function getElevatedMemberCouponId(): string | null {
  const id = Deno.env.get(ELEVATED_MEMBER_COUPON_ENV_KEY);
  return id && id.trim().length > 0 ? id.trim() : null;
}

export async function getActiveElevatedProgram(
  supabaseAdmin: SupabaseClient,
  patientId: string,
): Promise<ElevatedProgramKey | null> {
  const { data, error } = await supabaseAdmin
    .from("patients")
    .select("elevated_membership_status, elevated_program, stripe_subscription_id")
    .eq("id", patientId)
    .maybeSingle();

  if (error || !data) return null;
  if (data.elevated_membership_status !== "active") return null;
  if (!data.stripe_subscription_id) return null;

  const raw = data.elevated_program as string | null | undefined;
  if (!raw || !PROGRAM_KEYS.has(raw as ElevatedProgramKey)) return null;
  return raw as ElevatedProgramKey;
}

/**
 * 20% off à la carte except medications bundled in the patient's program.
 */
export function getDiscountEligibility(
  program: ElevatedProgramKey,
  productKey: string,
): { eligible: boolean; reason: string } {
  if (program === "trt" && productKey === "testosterone") {
    return { eligible: false, reason: "already included in your TRT program" };
  }
  if (program === "hrt" && (productKey === "biEst" || productKey === "progesterone")) {
    return { eligible: false, reason: "already included in your HRT program" };
  }
  if (program === "glp1" && (productKey === "semaglutide" || productKey === "tirzepatide")) {
    return { eligible: false, reason: "already included in your GLP-1 program" };
  }
  return { eligible: true, reason: "" };
}

export type CheckoutDiscountResult = {
  discounts?: { coupon: string }[];
  applied_discount: "elevated_member_20pct" | "none";
  program: ElevatedProgramKey | null;
  ineligible_reason?: string;
};

/**
 * Resolves Stripe Checkout `discounts` for an authenticated member + eligible product.
 * No patient_id / no active program / missing coupon env → full price (no discounts array).
 */
export async function resolveMemberCouponForCheckout(
  supabaseAdmin: SupabaseClient,
  patientId: string | null | undefined,
  productKey: string,
): Promise<CheckoutDiscountResult> {
  if (!patientId || patientId.trim() === "") {
    return { applied_discount: "none", program: null };
  }

  const program = await getActiveElevatedProgram(supabaseAdmin, patientId);
  if (!program) {
    return { applied_discount: "none", program: null };
  }

  const { eligible, reason } = getDiscountEligibility(program, productKey);
  if (!eligible) {
    return { applied_discount: "none", program, ineligible_reason: reason };
  }

  const couponId = getElevatedMemberCouponId();
  if (!couponId) {
    return { applied_discount: "none", program, ineligible_reason: "coupon_not_configured" };
  }

  return {
    discounts: [{ coupon: couponId }],
    applied_discount: "elevated_member_20pct",
    program,
  };
}

const MEMBER_DISCOUNT_MULTIPLIER = 0.8;

/** @deprecated Prefer Stripe Coupon on Checkout; kept for IV price_data fallback paths. */
export async function applyMemberDiscount(
  supabaseAdmin: SupabaseClient,
  patientId: string,
  unitAmountCents: number,
): Promise<{ discountedAmount: number; isMember: boolean; program: string | null }> {
  const program = await getActiveElevatedProgram(supabaseAdmin, patientId);
  if (!program) {
    return { discountedAmount: unitAmountCents, isMember: false, program: null };
  }
  return {
    discountedAmount: Math.round(unitAmountCents * MEMBER_DISCOUNT_MULTIPLIER),
    isMember: true,
    program,
  };
}
