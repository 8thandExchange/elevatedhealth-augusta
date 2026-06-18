import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { ConsentType } from "@/data/consents/types";
import { TIER_1_REQUIRED_CONSENTS, TIER_2_CONSENTS } from "@/data/consents";
import {
  mergeRequiredConsents,
  getRequiredConsentsForRxContext,
  type RxConsentResolutionInput,
} from "@/data/consents/medication-consent-mapping";
import { formatClinicDateKey, isConsentActive } from "@/lib/clinicTime";

export { TIER_1_REQUIRED_CONSENTS } from "@/data/consents";

const GRACE_MS = 30 * 24 * 60 * 60 * 1000;
const CALENDAR_WARN_MS = 30 * 24 * 60 * 60 * 1000;

export type PatientConsentStatus =
  | { state: "all_current"; details: ConsentRecordSummary[] }
  | {
      state: "expiring_soon";
      details: ConsentRecordSummary[];
      expiringConsents: ExpiringConsent[];
    }
  | {
      state: "missing_or_expired";
      details: ConsentRecordSummary[];
      missingConsents: ConsentType[];
      expiredConsents: ConsentType[];
      expiringConsents: ExpiringConsent[];
    }
  | { state: "no_consents_signed" };

export interface ConsentRecordSummary {
  consent_type: ConsentType;
  consent_version_id: string;
  signed_at: string;
  expires_at: string;
  is_in_grace_period: boolean;
  /** Days until nominal expires_at (negative when past nominal expiry but still in grace). */
  days_until_expiration: number;
}

export interface ExpiringConsent {
  consent_type: ConsentType;
  expires_at: string;
  days_remaining: number;
}

interface RawRecord {
  consent_type: string;
  consent_version_id: string;
  signed_at: string;
  expires_at: string;
}

function dayBuckets(ms: number): number {
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

function latestRecordsByType(rows: RawRecord[]): Map<string, RawRecord> {
  const map = new Map<string, RawRecord>();
  const sorted = [...rows].sort(
    (a, b) => new Date(b.signed_at).getTime() - new Date(a.signed_at).getTime(),
  );
  for (const r of sorted) {
    if (!map.has(r.consent_type)) map.set(r.consent_type, r);
  }
  return map;
}

function routingHintsFromPatient(row: {
  primary_program?: string | null;
  service_interests?: unknown;
}): string | null {
  const prog = (row.primary_program || "").toLowerCase();
  const interests = Array.isArray(row.service_interests)
    ? (row.service_interests as string[]).map((s) => String(s).toLowerCase())
    : [];

  if (interests.includes("weight_loss") || prog.includes("glp") || prog.includes("weight")) {
    return "weight_loss";
  }
  if (interests.includes("peptide") || prog.includes("peptide")) return "peptide";
  if (interests.includes("iv_therapy") || prog.includes("iv")) return "iv_therapy";
  if (interests.includes("female_hormone") || prog === "elevated_hrt" || prog.includes("hrt")) {
    return "female_hormone";
  }
  if (
    interests.includes("hormone") ||
    prog.includes("trt") ||
    prog.includes("hormone") ||
    prog.includes("elevated_trt")
  ) {
    return "male_hormone";
  }
  return null;
}

/** Derive Rx contexts from an order.protocol_snapshot JSON blob. */
export function contextsFromProtocolSnapshot(
  snapshot: Json | null | undefined,
  patientRoutingFallback: string | null,
): RxConsentResolutionInput[] {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) return [];
  const p = snapshot as Record<string, unknown>;
  const routingCategory =
    (typeof p.routing_category === "string" && p.routing_category) ||
    (typeof p.primaryProgram === "string" && p.primaryProgram) ||
    patientRoutingFallback;

  const ctxs: RxConsentResolutionInput[] = [];

  if (typeof p.portal_fcc_sku === "string") {
    ctxs.push({
      fccSku: p.portal_fcc_sku,
      fccName:
        typeof p.medicationName === "string"
          ? p.medicationName
          : typeof p.medication_name === "string"
            ? p.medication_name
            : null,
      routingCategory,
    });
  }

  if (typeof p.medication_id === "string") {
    ctxs.push({ medicationLineId: p.medication_id, routingCategory });
  }

  if (
    typeof p.medication === "string" &&
    !p.medication_id &&
    !p.portal_fcc_sku
  ) {
    ctxs.push({ fccName: p.medication, routingCategory });
  }

  return ctxs;
}

export async function getRequiredConsentTypesForPatient(patientId: string): Promise<ConsentType[]> {
  const [{ data: patientRow }, { data: orders }] = await Promise.all([
    supabase
      .from("patients")
      .select("primary_program, service_interests")
      .eq("id", patientId)
      .maybeSingle(),
    supabase.from("orders").select("protocol_snapshot").eq("patient_id", patientId),
  ]);

  const fallback = patientRow ? routingHintsFromPatient(patientRow) : null;

  const ctxLists: RxConsentResolutionInput[][] =
    orders?.map((o) => contextsFromProtocolSnapshot(o.protocol_snapshot, fallback)) ?? [];

  const tier2FromOrders = mergeRequiredConsents(
    ctxLists.map((c) => mergeRequiredConsents(c.map(getRequiredConsentsForRxContext))),
  );

  const required = new Set<ConsentType>([...TIER_1_REQUIRED_CONSENTS, ...tier2FromOrders]);
  return Array.from(required);
}

/** Batch-load consent statuses for dashboard badges (Option A — current page only). */
export async function getConsentStatusesForPatients(
  patientIds: string[],
): Promise<Map<string, PatientConsentStatus>> {
  const map = new Map<string, PatientConsentStatus>();
  if (patientIds.length === 0) return map;

  const [{ data: patients }, { data: orders }, { data: records }] = await Promise.all([
    supabase.from("patients").select("id, primary_program, service_interests").in("id", patientIds),
    supabase.from("orders").select("patient_id, protocol_snapshot").in("patient_id", patientIds),
    supabase
      .from("consent_records")
      .select("patient_id, consent_type, consent_version_id, signed_at, expires_at")
      .in("patient_id", patientIds)
      .is("revoked_at", null),
  ]);

  const ordersByPatient = new Map<string, NonNullable<typeof orders>>();
  for (const o of orders ?? []) {
    const pid = o.patient_id as string;
    if (!ordersByPatient.has(pid)) ordersByPatient.set(pid, []);
    ordersByPatient.get(pid)!.push(o);
  }

  const recordsByPatient = new Map<string, RawRecord[]>();
  for (const r of records ?? []) {
    const pid = r.patient_id as string;
    if (!recordsByPatient.has(pid)) recordsByPatient.set(pid, []);
    recordsByPatient.get(pid)!.push({
      consent_type: r.consent_type as string,
      consent_version_id: r.consent_version_id as string,
      signed_at: r.signed_at as string,
      expires_at: r.expires_at as string,
    });
  }

  const patientById = new Map((patients ?? []).map((p) => [p.id as string, p]));

  for (const pid of patientIds) {
    const prow = patientById.get(pid);
    const fallback = prow ? routingHintsFromPatient(prow) : null;
    const ordRows = ordersByPatient.get(pid) ?? [];
    const ctxLists = ordRows.map((o) => contextsFromProtocolSnapshot(o.protocol_snapshot, fallback));
    const tier2FromOrders = mergeRequiredConsents(
      ctxLists.map((c) => mergeRequiredConsents(c.map(getRequiredConsentsForRxContext))),
    );
    const required = Array.from(
      new Set<ConsentType>([...TIER_1_REQUIRED_CONSENTS, ...tier2FromOrders]),
    );

    const rows = recordsByPatient.get(pid) ?? [];
    map.set(pid, classifyPatientConsent(required, rows));
  }

  return map;
}

export async function getPatientConsentStatus(patientId: string): Promise<PatientConsentStatus> {
  const required = await getRequiredConsentTypesForPatient(patientId);
  const { data: rows, error } = await supabase
    .from("consent_records")
    .select("consent_type, consent_version_id, signed_at, expires_at")
    .eq("patient_id", patientId)
    .is("revoked_at", null);

  if (error) throw error;

  const raw: RawRecord[] =
    rows?.map((r) => ({
      consent_type: r.consent_type as string,
      consent_version_id: r.consent_version_id as string,
      signed_at: r.signed_at as string,
      expires_at: r.expires_at as string,
    })) ?? [];

  return classifyPatientConsent(required, raw);
}

function classifyPatientConsent(required: ConsentType[], rows: RawRecord[]): PatientConsentStatus {
  if (rows.length === 0) {
    return { state: "no_consents_signed" };
  }

  const now = Date.now();
  const horizon = now + CALENDAR_WARN_MS;
  const byType = latestRecordsByType(rows);

  const missing: ConsentType[] = [];
  const expired: ConsentType[] = [];
  const expiringSoon: ExpiringConsent[] = [];

  const pushUniqueExpiring = (e: ExpiringConsent) => {
    const idx = expiringSoon.findIndex((x) => x.consent_type === e.consent_type);
    if (idx === -1) expiringSoon.push(e);
    else if (e.days_remaining < expiringSoon[idx].days_remaining) expiringSoon[idx] = e;
  };

  for (const req of required) {
    const rec = byType.get(req);
    if (!rec) {
      missing.push(req);
      continue;
    }

    const expiryMs = new Date(rec.expires_at).getTime();
    const graceEndMs = expiryMs + GRACE_MS;
    const stillActive = isConsentActive(rec.expires_at, new Date(now));

    if (stillActive) {
      if (expiryMs <= horizon) {
        pushUniqueExpiring({
          consent_type: req,
          expires_at: rec.expires_at,
          days_remaining: Math.max(
            0,
            dayBuckets(
              new Date(formatClinicDateKey(rec.expires_at) + "T12:00:00").getTime() - now,
            ),
          ),
        });
      }
      continue;
    }

    if (graceEndMs > now) {
      pushUniqueExpiring({
        consent_type: req,
        expires_at: new Date(graceEndMs).toISOString(),
        days_remaining: Math.max(0, dayBuckets(graceEndMs - now)),
      });
      continue;
    }

    expired.push(req);
  }

  const detailsTypes = new Set<ConsentType>(required);
  for (const t of byType.keys()) detailsTypes.add(t as ConsentType);

  const details: ConsentRecordSummary[] = [];
  for (const t of detailsTypes) {
    const rec = byType.get(t);
    if (!rec) continue;

    const expiryMs = new Date(rec.expires_at).getTime();
    const graceEndMs = expiryMs + GRACE_MS;
    const inGrace = !isConsentActive(rec.expires_at, new Date(now)) && graceEndMs > now;
    details.push({
      consent_type: t,
      consent_version_id: rec.consent_version_id,
      signed_at: rec.signed_at,
      expires_at: rec.expires_at,
      is_in_grace_period: inGrace,
      days_until_expiration: dayBuckets(expiryMs - now),
    });
  }

  details.sort((a, b) => a.consent_type.localeCompare(b.consent_type));

  if (missing.length > 0 || expired.length > 0) {
    return {
      state: "missing_or_expired",
      details,
      missingConsents: missing,
      expiredConsents: expired,
      expiringConsents: expiringSoon,
    };
  }

  if (expiringSoon.length > 0) {
    return { state: "expiring_soon", details, expiringConsents: expiringSoon };
  }

  return { state: "all_current", details };
}

/** Tier 2 consent types that need renewal magic-link when missing/expired for prescribing. */
export function tier2ConsentsNeedingAction(status: PatientConsentStatus): ConsentType[] {
  if (status.state === "missing_or_expired") {
    const need = new Set<ConsentType>([...status.missingConsents, ...status.expiredConsents]);
    return TIER_2_CONSENTS.filter((t) => need.has(t));
  }
  return [];
}
