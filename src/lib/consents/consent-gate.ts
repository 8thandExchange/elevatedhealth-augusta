import { supabase } from "@/integrations/supabase/client";
import type { ConsentType } from "@/data/consents/types";
import {
  mergeRequiredConsents,
  getRequiredConsentsForRxContext,
  resolveCanonicalMedicationId,
  type RxConsentResolutionInput,
  getMedicationConsentRule,
} from "@/data/consents/medication-consent-mapping";
import { getSubstanceAdditionTemplate } from "@/data/consents/substance-addition-templates";

const GRACE_MS = 30 * 24 * 60 * 60 * 1000;
const EXPIRING_SOON_MS = 30 * 24 * 60 * 60 * 1000;

export type ExpiringSoonReason = "calendar_expiry" | "calendar_grace" | "reconsent_deadline";

export interface ConsentGateResult {
  allowed: boolean;
  missingConsents: ConsentType[];
  /** Types blocked because expiry + grace elapsed */
  expiredConsents: ConsentType[];
  /** Types currently covered only by post-expiry grace window */
  inGraceConsents: ConsentType[];
  expiringSoonConsents: {
    consent_type: ConsentType;
    expires_at: string;
    days_remaining: number;
    reason: ExpiringSoonReason;
  }[];
  blockedConsentDetails: {
    consent_type: ConsentType;
    status: "missing" | "expired" | "reconsent_overdue";
    /** Original consent expiry when status === expired (past grace) */
    expired_at?: string;
    days_ago?: number;
    /** Present when status === reconsent_overdue */
    reconsent_request_id?: string;
  }[];
  /** Point-of-care substance acknowledgment (research peptide formulary additions). */
  substanceAcknowledgmentRequired?: {
    substance_id: string;
    display_name: string;
    requires_full_reconsent: boolean;
    /** Latest valid research peptide record — required for substance acknowledgment inserts */
    parent_consent_record_id?: string;
  };
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

interface ReconsentRequestRow {
  id: string;
  consent_type: string;
  reconsent_deadline: string;
  fulfilled_at: string | null;
}

function evaluateRequiredAgainstRecords(
  required: ConsentType[],
  byType: Map<string, ConsentRecordRow>,
  nowMs: number,
): Omit<ConsentGateResult, "allowed" | "patientId" | "resolvedMedicationIds" | "substanceAcknowledgmentRequired"> {
  const horizonEnd = nowMs + EXPIRING_SOON_MS;

  const missing: ConsentType[] = [];
  const expired: ConsentType[] = [];
  const inGrace: ConsentType[] = [];
  const expiringSoon: ConsentGateResult["expiringSoonConsents"] = [];
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
          reason: "calendar_expiry",
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
        reason: "calendar_grace",
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

function mergeReconsentIntoEvaluation(
  required: ConsentType[],
  partial: Omit<
    ConsentGateResult,
    "allowed" | "patientId" | "resolvedMedicationIds" | "substanceAcknowledgmentRequired"
  >,
  reconsentRows: ReconsentRequestRow[],
  nowMs: number,
): Omit<ConsentGateResult, "allowed" | "patientId" | "resolvedMedicationIds" | "substanceAcknowledgmentRequired"> {
  const requiredSet = new Set(required);
  const unfulfilled = reconsentRows.filter((r) => !r.fulfilled_at && requiredSet.has(r.consent_type as ConsentType));

  const missingSet = new Set(partial.missingConsents);
  const expiredSet = new Set(partial.expiredConsents);
  const calendarValidType = (t: ConsentType) => !missingSet.has(t) && !expiredSet.has(t);

  let expiringSoon = [...partial.expiringSoonConsents];
  let blockedConsentDetails = [...partial.blockedConsentDetails];
  let expiredConsents = [...partial.expiredConsents];
  let missingConsents = [...partial.missingConsents];
  let inGraceConsents = [...partial.inGraceConsents];

  const activeReconsentTypes = new Set(
    unfulfilled.filter((r) => new Date(r.reconsent_deadline).getTime() > nowMs).map((r) => r.consent_type),
  );

  expiringSoon = expiringSoon.filter((e) => {
    if (!activeReconsentTypes.has(e.consent_type)) return true;
    return e.reason !== "calendar_expiry" && e.reason !== "calendar_grace";
  });

  for (const rq of unfulfilled) {
    const t = rq.consent_type as ConsentType;
    if (!requiredSet.has(t)) continue;

    const deadlineMs = new Date(rq.reconsent_deadline).getTime();

    if (deadlineMs <= nowMs) {
      blockedConsentDetails = blockedConsentDetails.filter(
        (b) => !(b.consent_type === t && b.status === "reconsent_overdue"),
      );
      blockedConsentDetails.push({
        consent_type: t,
        status: "reconsent_overdue",
        reconsent_request_id: rq.id,
      });

      if (calendarValidType(t)) {
        if (!expiredConsents.includes(t)) expiredConsents.push(t);
      }

      expiringSoon = expiringSoon.filter((e) => e.consent_type !== t);
      inGraceConsents = inGraceConsents.filter((g) => g !== t);
    } else {
      if (calendarValidType(t)) {
        expiringSoon = expiringSoon.filter((e) => e.consent_type !== t || e.reason === "reconsent_deadline");
        expiringSoon.push({
          consent_type: t,
          expires_at: rq.reconsent_deadline,
          days_remaining: Math.max(0, daysRemaining(nowMs, deadlineMs)),
          reason: "reconsent_deadline",
        });
      }
    }
  }

  const overdueTypes = new Set(
    blockedConsentDetails.filter((b) => b.status === "reconsent_overdue").map((b) => b.consent_type),
  );
  blockedConsentDetails = blockedConsentDetails.filter(
    (b) => !(overdueTypes.has(b.consent_type) && (b.status === "missing" || b.status === "expired")),
  );

  expiredConsents = [...new Set(expiredConsents)];
  missingConsents = [...new Set(missingConsents)];

  blockedConsentDetails = dedupeBlockedDetails(blockedConsentDetails);

  return {
    missingConsents,
    expiredConsents,
    inGraceConsents,
    expiringSoonConsents: dedupeExpiringSoon(expiringSoon),
    blockedConsentDetails,
  };
}

function dedupeBlockedDetails(rows: ConsentGateResult["blockedConsentDetails"]) {
  const seen = new Set<string>();
  const out: ConsentGateResult["blockedConsentDetails"] = [];
  for (const r of rows) {
    const k = `${r.consent_type}:${r.status}:${r.reconsent_request_id ?? ""}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
  }
  return out;
}

function dedupeExpiringSoon(rows: ConsentGateResult["expiringSoonConsents"]) {
  const byType = new Map<string, ConsentGateResult["expiringSoonConsents"][0]>();
  for (const r of rows) {
    const prev = byType.get(r.consent_type);
    if (!prev || r.days_remaining < prev.days_remaining) byType.set(r.consent_type, r);
  }
  return Array.from(byType.values()).sort((a, b) => a.consent_type.localeCompare(b.consent_type));
}

export async function checkConsentGateForRxContexts(
  patientId: string,
  contexts: RxConsentResolutionInput[],
): Promise<ConsentGateResult> {
  const required = mergeRequiredConsents(contexts.map((c) => getRequiredConsentsForRxContext(c)));
  const resolvedIds = [...new Set(contexts.map((c) => resolveCanonicalMedicationId(c)).filter(Boolean))] as string[];

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

  const [{ data: rows, error }, { data: reconsentRows }] = await Promise.all([
    supabase
      .from("consent_records")
      .select("consent_type, expires_at, signed_at")
      .eq("patient_id", patientId)
      .is("revoked_at", null),
    supabase
      .from("consent_reconsent_requests")
      .select("id, consent_type, reconsent_deadline, fulfilled_at")
      .eq("patient_id", patientId)
      .is("fulfilled_at", null),
  ]);

  if (error) throw error;

  const byType = latestRecordsByType((rows || []) as ConsentRecordRow[]);
  const nowMs = Date.now();
  let partial = evaluateRequiredAgainstRecords(required, byType, nowMs);

  partial = mergeReconsentIntoEvaluation(
    required,
    partial,
    (reconsentRows ?? []) as ReconsentRequestRow[],
    nowMs,
  );

  let allowed = partial.missingConsents.length === 0 && partial.expiredConsents.length === 0;

  let substanceAcknowledgmentRequired: ConsentGateResult["substanceAcknowledgmentRequired"];

  if (allowed && resolvedIds.length > 0) {
    const { data: rpLatest } = await supabase
      .from("consent_records")
      .select("id, signed_at, expires_at")
      .eq("patient_id", patientId)
      .eq("consent_type", "research_peptide")
      .is("revoked_at", null)
      .order("signed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const rpIsBlocked =
      partial.missingConsents.includes("research_peptide") ||
      partial.expiredConsents.includes("research_peptide");

    const rpValidCalendar =
      !!rpLatest &&
      !!(rpLatest as { signed_at?: string }).signed_at &&
      new Date((rpLatest as { expires_at: string }).expires_at).getTime() > nowMs &&
      !rpIsBlocked;

    const { data: ackRows } = await supabase
      .from("substance_addition_acknowledgments")
      .select("parent_consent_record_id, substance_id")
      .eq("patient_id", patientId);

    const ackSet = new Set(
      (ackRows ?? []).map((a) => `${(a as { parent_consent_record_id: string }).parent_consent_record_id}:${(a as { substance_id: string }).substance_id}`),
    );

    for (const medId of resolvedIds) {
      const rule = getMedicationConsentRule(medId);
      if (!rule?.required_consents.includes("research_peptide")) continue;

      const template = getSubstanceAdditionTemplate(medId);
      if (!template) continue;

      if (template.requires_full_reconsent) {
        allowed = false;
        if (!partial.missingConsents.includes("research_peptide")) {
          partial.missingConsents.push("research_peptide");
          partial.blockedConsentDetails.push({ consent_type: "research_peptide", status: "missing" });
        }
        substanceAcknowledgmentRequired = {
          substance_id: template.substance_id,
          display_name: template.display_name,
          requires_full_reconsent: true,
          parent_consent_record_id: rpLatest ? (rpLatest as { id: string }).id : undefined,
        };
        break;
      }

      if (!rpValidCalendar || !rpLatest) {
        continue;
      }

      const parentId = (rpLatest as { id: string }).id;
      const signedAtMs = new Date((rpLatest as { signed_at?: string }).signed_at ?? 0).getTime();
      const addedMs = new Date(template.added_to_formulary_date).getTime();

      if (signedAtMs >= addedMs) {
        continue;
      }

      if (ackSet.has(`${parentId}:${template.substance_id}`)) continue;

      allowed = false;
      substanceAcknowledgmentRequired = {
        substance_id: template.substance_id,
        display_name: template.display_name,
        requires_full_reconsent: false,
        parent_consent_record_id: parentId,
      };
      break;
    }
  }

  partial.missingConsents = [...new Set(partial.missingConsents)];
  partial.expiredConsents = [...new Set(partial.expiredConsents)];

  return {
    allowed,
    ...partial,
    substanceAcknowledgmentRequired,
    patientId,
    resolvedMedicationIds: resolvedIds,
  };
}

/** Single canonical medication_id from MEDICATION_CONSENT_RULES. */
export async function checkConsentGate(patientId: string, medicationId: string): Promise<ConsentGateResult> {
  return checkConsentGateForRxContexts(patientId, [{ medicationLineId: medicationId }]);
}
