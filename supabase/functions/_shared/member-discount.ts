/**
 * ELEVATED member discount — Stripe Coupon path (PR #12).
 * Coupon "ELEVATED Member 20% Discount" is applied server-side only after
 * `getActiveElevatedProgram` succeeds and `getDiscountEligibility` allows the SKU.
 *
 * Set `STRIPE_ELEVATED_MEMBER_COUPON_ID` in Supabase secrets (live coupon
 * `avPA0zlW` / "ELEVATED Member 20% Discount" — verify via bootstrap-member-coupon).
 */
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import type Stripe from "https://esm.sh/stripe@18.5.0";
import { hasClinicStaffRole } from "./staff-auth.ts";
import { edgeStructuredLog } from "./edge-structured-log.ts";

export type ElevatedProgramKey = "trt" | "hrt" | "glp1" | "wellness";

const PROGRAM_KEYS = new Set<ElevatedProgramKey>(["trt", "hrt", "glp1", "wellness"]);

/** Stripe subscription statuses that still entitle a member to the discount. */
const LIVE_ACTIVE_STATUSES = new Set(["active", "trialing"]);

export type MemberDiscountOpts = {
  /**
   * When provided, the member's Stripe subscription is verified live so a
   * cancelled/past-due subscription that hasn't synced to the DB yet cannot
   * keep getting the discount. Transient Stripe errors fail open to the DB flag.
   */
  stripe?: Stripe;
};

/**
 * Determines the patient_id that may receive a member discount, bound to the
 * authenticated caller — closing the spoofable `patient_id` hole on à la carte.
 *
 * - No/invalid auth → null (guest; full price).
 * - Staff/admin caller → trusted to transact for the supplied patient (payment links).
 * - Patient caller → only ever their OWN patient row, regardless of what was supplied.
 */
export async function resolveAuthorizedDiscountPatientId(
  supabaseAdmin: SupabaseClient,
  authHeader: string | null | undefined,
  suppliedPatientId: string | null | undefined,
): Promise<string | null> {
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) return null;

  const { data: userData, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !userData?.user) return null;
  const userId = userData.user.id;

  const { data: roles } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const roleList = (roles ?? []).map((r) => String(r.role));
  if (hasClinicStaffRole(roleList)) {
    const supplied = suppliedPatientId ? String(suppliedPatientId).trim() : "";
    return supplied !== "" ? supplied : null;
  }

  const { data: ownPatient } = await supabaseAdmin
    .from("patients")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  return ownPatient?.id ?? null;
}

/**
 * Live Stripe coupon ID for ELEVATED Member 20% à la carte discount.
 * Verified 2026-06-26 via bootstrap-member-coupon (do not expose to clients).
 */
export const ELEVATED_MEMBER_COUPON_ENV_KEY = "STRIPE_ELEVATED_MEMBER_COUPON_ID";

export function getElevatedMemberCouponId(): string | null {
  const id = Deno.env.get(ELEVATED_MEMBER_COUPON_ENV_KEY);
  return id && id.trim().length > 0 ? id.trim() : null;
}

export async function getActiveElevatedProgram(
  supabaseAdmin: SupabaseClient,
  patientId: string,
  opts?: MemberDiscountOpts,
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

  // Live verification: a subscription cancelled/past-due in Stripe but not yet
  // synced to the DB must not keep the discount. Fail open on transient errors.
  if (opts?.stripe) {
    try {
      const sub = await opts.stripe.subscriptions.retrieve(data.stripe_subscription_id as string);
      if (!LIVE_ACTIVE_STATUSES.has(sub.status)) return null;
    } catch (_err) {
      // Stripe lookup failed (transient/permissions) — trust the DB flag rather
      // than block a legitimate member.
    }
  }

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
  opts?: MemberDiscountOpts,
): Promise<CheckoutDiscountResult> {
  if (!patientId || patientId.trim() === "") {
    return { applied_discount: "none", program: null };
  }

  const program = await getActiveElevatedProgram(supabaseAdmin, patientId, opts);
  if (!program) {
    return { applied_discount: "none", program: null };
  }

  const { eligible, reason } = getDiscountEligibility(program, productKey);
  if (!eligible) {
    return { applied_discount: "none", program, ineligible_reason: reason };
  }

  const couponId = getElevatedMemberCouponId();
  if (!couponId) {
    edgeStructuredLog("member-discount", {
      event_type: "coupon_missing",
      success: false,
      action_taken: "member_discount_skipped",
      patient_id: patientId,
      error_message:
        "STRIPE_ELEVATED_MEMBER_COUPON_ID is not set — member will pay full à la carte price. Create the 20% coupon in Stripe and add the secret in Supabase.",
    }, "info");
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
