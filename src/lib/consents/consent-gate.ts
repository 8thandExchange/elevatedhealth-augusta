import { supabase } from "@/integrations/supabase/client";
import type { ConsentType } from "@/data/consents/types";
import {
  getRequiredConsentsForMedication,
  mergeRequiredConsents,
  resolveCanonicalMedicationId,
  type RxConsentResolutionInput,
  getRequiredConsentsForRxContext,
} from "@/data/consents/medication-consent-mapping";

const GRACE_MS = 30 * 24 * 60 * 60 * 1000;
const EXPIRING_SOON_MS = 30 * 24 * 60 * 60 * 1000;

export interface ConsentGateResult {
  allowed: boolean;
  missingConsents: ConsentType[];
  /** Types blocked because expiry + grace elapsed */
  expiredConsents: ConsentType[];
  /** Types currently covered only by post-expiry grace window */
  inGraceConsents: ConsentType[];
  expiringSoonConsents: { consent_type: ConsentType; expires_at: string; days_remaining: number }[];
  blockedConsentDetails: {
    consent_type: ConsentType;
    status: "missing" | "expired";
    /** Original consent expiry when status === expired (past grace) */
    expired_at?: string;
    days_ago?: number;
  }[];
  patientId: string;
  resolvedMedicationIds: string[];
}

function daysRemaining(fromMs: number, toMs: number): number {
  return Math.floor((toMs - fromMs) / (24 * 60 * 60 * 1000));
}

interface ConsentRecordRow {
  consent_type: string;
  expires_at: string;
  signed_at: string | null;
}

/** Latest non-revoked row per consent_type (by signed_at). */
function latestRecordsByType(rows: ConsentRecordRow[]): Map<string, ConsentRecordRow> {
  const map = new Map<string, ConsentRecordRow>();
  const sorted = [...rows].sort((a, b) => {
    const ta = new Date(a.signed_at || 0).getTime();
    const tb = new Date(b.signed_at || 0).getTime();
    return tb - ta;
  });
  for (const r of sorted) {
    if (!map.has(r.consent_type)) map.set(r.consent_type, r);
  }
  return map;
}

function evaluateRequiredAgainstRecords(
  required: ConsentType[],
  byType: Map<string, ConsentRecordRow>,
  nowMs: number,
): Omit<
  ConsentGateResult,
  "allowed" | "patientId" | "resolvedMedicationIds"
> {
  const horizonEnd = nowMs + EXPIRING_SOON_MS;

  const missing: ConsentType[] = [];
  const expired: ConsentType[] = [];
  const inGrace: ConsentType[] = [];
  const expiringSoon: { consent_type: ConsentType; expires_at: string; days_remaining: number }[] = [];
  const blockedConsentDetails: ConsentGateResult["blockedConsentDetails"] = [];

  for (const reqType of required) {
    const rec = byType.get(reqType);
    if (!rec) {
      missing.push(reqType);
      blockedConsentDetails.push({ consent_type: reqType, status: "missing" });
      continue;
    }

    const expiryMs = new Date(rec.expires_at).getTime();

    if (expiryMs > nowMs) {
      if (expiryMs <= horizonEnd) {
        expiringSoon.push({
          consent_type: reqType,
          expires_at: rec.expires_at,
          days_remaining: Math.max(0, daysRemaining(nowMs, expiryMs)),
        });
      }
      continue;
    }

    const graceEndMs = expiryMs + GRACE_MS;
    if (graceEndMs > nowMs) {
      inGrace.push(reqType);
      expiringSoon.push({
        consent_type: reqType,
        expires_at: new Date(graceEndMs).toISOString(),
        days_remaining: Math.max(0, daysRemaining(nowMs, graceEndMs)),
      });
    } else {
      expired.push(reqType);
      blockedConsentDetails.push({
        consent_type: reqType,
        status: "expired",
        expired_at: rec.expires_at,
        days_ago: Math.max(0, daysRemaining(expiryMs, nowMs)),
      });
    }
  }

  return {
    missingConsents: missing,
    expiredConsents: expired,
    inGraceConsents: inGrace,
    expiringSoonConsents: expiringSoon,
    blockedConsentDetails,
  };
}

export async function checkConsentGateForRxContexts(
  patientId: string,
  contexts: RxConsentResolutionInput[],
): Promise<ConsentGateResult> {
  const required = mergeRequiredConsents(contexts.map((c) => getRequiredConsentsForRxContext(c)));
  const resolvedIds = contexts.map((c) => resolveCanonicalMedicationId(c)).filter(Boolean) as string[];

  if (required.length === 0) {
    return {
      allowed: true,
      missingConsents: [],
      expiredConsents: [],
      inGraceConsents: [],
      expiringSoonConsents: [],
      blockedConsentDetails: [],
      patientId,
      resolvedMedicationIds: resolvedIds,
    };
  }

  const { data: rows, error } = await supabase
    .from("consent_records")
    .select("consent_type, expires_at, signed_at")
    .eq("patient_id", patientId)
    .is("revoked_at", null);

  if (error) throw error;

  const byType = latestRecordsByType((rows || []) as ConsentRecordRow[]);
  const nowMs = Date.now();
  const partial = evaluateRequiredAgainstRecords(required, byType, nowMs);

  const allowed = partial.missingConsents.length === 0 && partial.expiredConsents.length === 0;

  return {
    allowed,
    ...partial,
    patientId,
    resolvedMedicationIds: resolvedIds,
  };
}

/** Single canonical medication_id from MEDICATION_CONSENT_RULES. */
export async function checkConsentGate(patientId: string, medicationId: string): Promise<ConsentGateResult> {
  const required = getRequiredConsentsForMedication(medicationId);
  return checkConsentGateForRxContexts(patientId, [{ medicationLineId: medicationId }]);
}
