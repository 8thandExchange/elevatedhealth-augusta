// @ts-nocheck
import { TIER_1_CONSENTS } from "@/data/consents";
import { supabase } from "@/integrations/supabase/client";
import { getValidConsents } from "./consent-helpers";

const sb = supabase as any;

/** True when all 5 Tier 1 consents are valid or intake_consents_completed_at is set. */
export async function hasCompletedTier1Intake(patientId: string): Promise<boolean> {
  const { data: patient, error } = await sb
    .from("patients")
    .select("intake_consents_completed_at")
    .eq("id", patientId)
    .maybeSingle();

  if (error) throw error;
  if (patient?.intake_consents_completed_at) return true;

  const valid = await getValidConsents(patientId);
  return TIER_1_CONSENTS.every((t) => valid[t]);
}

export async function markTier1IntakeComplete(patientId: string): Promise<void> {
  const { error } = await sb
    .from("patients")
    .update({ intake_consents_completed_at: new Date().toISOString() })
    .eq("id", patientId);

  if (error) throw error;
}

/** Index 0–4 of first missing Tier 1 consent; 5 if all present. */
export async function getTier1ResumeStepIndex(patientId: string): Promise<number> {
  const valid = await getValidConsents(patientId);
  const idx = TIER_1_CONSENTS.findIndex((t) => !valid[t]);
  return idx === -1 ? TIER_1_CONSENTS.length : idx;
}

/**
 * Reuse an in-progress session when the patient signed some but not all Tier 1 consents
 * in the same sitting; otherwise start a new session id.
 */
export async function resolveIntakeSessionId(patientId: string): Promise<string> {
  const now = new Date().toISOString();
  const { data: rows, error } = await sb
    .from("consent_records")
    .select("signed_session_id, consent_type")
    .eq("patient_id", patientId)
    .in("consent_type", TIER_1_CONSENTS)
    .is("revoked_at", null)
    .gt("expires_at", now)
    .not("signed_session_id", "is", null)
    .order("signed_at", { ascending: false });

  if (error) throw error;
  if (!rows?.length) {
    return crypto.randomUUID();
  }

  const bySession = new Map<string, Set<string>>();
  for (const row of rows) {
    const sid = row.signed_session_id as string;
    if (!sid || sid.startsWith("dev-preview:")) continue;
    if (!bySession.has(sid)) bySession.set(sid, new Set());
    bySession.get(sid)!.add(row.consent_type);
  }

  const valid = await getValidConsents(patientId);
  const missingCount = TIER_1_CONSENTS.filter((t) => !valid[t]).length;
  if (missingCount === 0) {
    return crypto.randomUUID();
  }

  for (const [sid, signedTypes] of bySession) {
    const hasPartial =
      signedTypes.size > 0 &&
      signedTypes.size < TIER_1_CONSENTS.length &&
      TIER_1_CONSENTS.some((t) => !valid[t] && signedTypes.has(t));
    if (hasPartial) return sid;
  }

  return crypto.randomUUID();
}
