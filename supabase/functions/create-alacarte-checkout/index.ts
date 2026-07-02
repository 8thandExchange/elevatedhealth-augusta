/**
 * create-alacarte-checkout — dispatcher for legacy `product_key` values.
 *
 * Routes medication fills, phone follow-up, and lab panels to live Stripe
 * Price IDs + server-side ELEVATED member coupon (see `_shared/member-discount.ts`).
 * Prefer dedicated functions (`create-medication-fill-checkout`, etc.) for new UI.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import {
  LIVE_CORE_SERVICES,
  LIVE_MEDICATION_FILLS,
  LIVE_RECOVERY_PEPTIDES,
  type LiveRecoveryPeptideKey,
} from "../_shared/live-prices.ts";
import { checkoutCorsHeaders, serveOnetimePriceCheckoutFromBody } from "../_shared/onetime-checkout-shared.ts";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";

/** Maps Stripe recovery product_key → canonical medication_id (research_peptide category). */
const RECOVERY_PEPTIDE_MEDICATION_IDS: Record<LiveRecoveryPeptideKey, string> = {
  bpc157: "bpc_157",
  tb500: "tb_500",
};

function jsonErrorResponse(
  status: number,
  error: string,
  error_code: string,
): Response {
  return new Response(JSON.stringify({ error, error_code }), {
    status,
    headers: { ...checkoutCorsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Calendar validity — mirrors consent-gate.ts evaluateRequiredAgainstRecords:
 * latest non-revoked row must have signed_at and expires_at in the future.
 */
async function hasValidResearchPeptideConsent(patientId: string): Promise<boolean> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { data: rows, error } = await supabase
    .from("consent_records")
    .select("consent_type, expires_at, signed_at")
    .eq("patient_id", patientId)
    .eq("consent_type", "research_peptide")
    .is("revoked_at", null)
    .order("signed_at", { ascending: false })
    .limit(5);

  if (error) throw error;

  const nowMs = Date.now();
  return (rows ?? []).some((row) => {
    const signedAt = row.signed_at as string | null | undefined;
    const expiresAt = row.expires_at as string | undefined;
    if (!signedAt || !expiresAt) return false;
    return new Date(expiresAt).getTime() > nowMs;
  });
}

async function assertRecoveryPeptideCheckoutAllowed(
  product_key: LiveRecoveryPeptideKey,
  patientId: string | undefined | null,
): Promise<Response | null> {
  const medicationId = RECOVERY_PEPTIDE_MEDICATION_IDS[product_key];

  if (!patientId?.trim()) {
    return jsonErrorResponse(
      400,
      "Recovery peptide fills require an identified patient with a signed research peptide consent on file before checkout.",
      "patient_required_for_recovery_consent",
    );
  }

  const consentOk = await hasValidResearchPeptideConsent(patientId.trim());
  if (!consentOk) {
    edgeStructuredLog("create-alacarte-checkout", {
      event_type: "consent_blocked",
      success: false,
      action_taken: "recovery_checkout_denied",
      product_recognition: "recovery_peptide",
      medication_id: medicationId,
    });
    return jsonErrorResponse(
      403,
      "This item requires a signed research peptide consent before purchase. Please complete consent in the patient portal.",
      "research_peptide_consent_required",
    );
  }

  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: checkoutCorsHeaders });
  }

  try {
    const body = await req.json();
    const product_key = body.product_key as string | undefined;
    if (!product_key) throw new Error("product_key is required");

    if (product_key === "wolverineStack" || product_key === "metabolicStack") {
      throw new Error(
        `${product_key === "wolverineStack" ? "BPC-157/TB-500 recovery stack" : "Metabolic recomposition stack"} is no longer sold. Use individual SKUs or book a Wellness Assessment.`,
      );
    }

    const origin = req.headers.get("origin") || "https://elevatedhealthaugusta.com";
    const authHeader = req.headers.get("Authorization");

    edgeStructuredLog("create-alacarte-checkout", {
      event_type: "dispatch",
      success: true,
      action_taken: `route:${product_key}`,
      product_recognition: "alacarte_fill",
    });

    if (product_key in LIVE_MEDICATION_FILLS) {
      const stripePriceId = LIVE_MEDICATION_FILLS[product_key as keyof typeof LIVE_MEDICATION_FILLS];
      return serveOnetimePriceCheckoutFromBody(body, {
        functionName: "create-alacarte-checkout",
        stripePriceId,
        productKey: product_key,
        success_url:
          `${origin}/alacarte-success?product=${encodeURIComponent(product_key)}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pricing`,
        logConsultationBooking: true,
      }, authHeader);
    }

    if (product_key in LIVE_RECOVERY_PEPTIDES) {
      const recoveryKey = product_key as LiveRecoveryPeptideKey;
      const consentBlock = await assertRecoveryPeptideCheckoutAllowed(
        recoveryKey,
        body.patient_id as string | undefined | null,
      );
      if (consentBlock) return consentBlock;

      const stripePriceId = LIVE_RECOVERY_PEPTIDES[recoveryKey];
      return serveOnetimePriceCheckoutFromBody(body, {
        functionName: "create-alacarte-checkout",
        stripePriceId,
        productKey: product_key,
        success_url:
          `${origin}/alacarte-success?product=${encodeURIComponent(product_key)}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pricing`,
        logConsultationBooking: true,
      }, authHeader);
    }

    if (product_key === "followUp") {
      return serveOnetimePriceCheckoutFromBody(body, {
        functionName: "create-alacarte-checkout",
        stripePriceId: LIVE_CORE_SERVICES.phoneFollowUp,
        productKey: "phone_followup",
        success_url: `${origin}/alacarte-success?product=followUp&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pricing`,
        logConsultationBooking: true,
      }, authHeader);
    }

    if (product_key === "labAdvanced") {
      return serveOnetimePriceCheckoutFromBody(body, {
        functionName: "create-alacarte-checkout",
        stripePriceId: LIVE_CORE_SERVICES.advancedLabAddon,
        productKey: "lab_advanced_addon",
        success_url: `${origin}/alacarte-success?product=labAdvanced&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pricing`,
        logConsultationBooking: true,
      }, authHeader);
    }

    if (product_key === "labPanel" || product_key === "labPanelExpanded") {
      const comprehensive = product_key === "labPanel";
      return serveOnetimePriceCheckoutFromBody(body, {
        functionName: "create-alacarte-checkout",
        stripePriceId: comprehensive
          ? LIVE_CORE_SERVICES.comprehensivePanel
          : LIVE_CORE_SERVICES.expandedPanel,
        productKey: comprehensive ? "lab_comprehensive" : "lab_expanded",
        success_url: comprehensive
          ? `${origin}/alacarte-success?product=labPanel&session_id={CHECKOUT_SESSION_ID}`
          : `${origin}/alacarte-success?product=labPanelExpanded&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pricing`,
        logConsultationBooking: true,
      }, authHeader);
    }

    throw new Error(
      `Invalid product key: ${product_key}. Valid: ${[
        ...Object.keys(LIVE_MEDICATION_FILLS),
        ...Object.keys(LIVE_RECOVERY_PEPTIDES),
        "followUp",
        "labPanel",
        "labPanelExpanded",
        "labAdvanced",
      ].join(", ")}`,
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    edgeStructuredLog(
      "create-alacarte-checkout",
      {
        event_type: "error",
        success: false,
        action_taken: "dispatch_failed",
        error_message: errorMessage,
      },
      "error",
    );
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...checkoutCorsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
