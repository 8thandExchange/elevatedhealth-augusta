import { supabase } from "@/integrations/supabase/client";
import type { ConsentType } from "@/data/consents/types";

// NOTE: `consent_records` and `consent_versions` tables are not yet in the
// generated Supabase types. Cast to `any` to bypass type-checking until the
// migration adding these tables is applied.
const sb = supabase as any;

/** Check if a patient has a valid (signed, not expired, not revoked) consent of given type. */
export async function hasValidConsent(
  patientId: string,
  consentType: ConsentType
): Promise<{ valid: boolean; consentRecordId?: string; expiresAt?: string }> {
  const { data, error } = await sb
    .from("consent_records")
    .select("id, expires_at, signed_at")
    .eq("patient_id", patientId)
    .eq("consent_type", consentType)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("signed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return { valid: false };
  }

  return {
    valid: true,
    consentRecordId: data.id,
    expiresAt: data.expires_at,
  };
}

/** All consent types — used to build a full validity map. */
const ALL_CONSENT_TYPES: ConsentType[] = [
  "terms_of_service",
  "hipaa_acknowledgment",
  "general_medical_treatment",
  "telehealth",
  "communication",
  "hormone_therapy",
  "glp1",
  "off_label",
  "research_peptide",
  "notice_of_privacy_practices",
];

/** Get whether each consent type currently has at least one valid (non-revoked, non-expired) record. */
export async function getValidConsents(patientId: string): Promise<Record<ConsentType, boolean>> {
  const base = Object.fromEntries(ALL_CONSENT_TYPES.map((t) => [t, false])) as Record<ConsentType, boolean>;

  const { data, error } = await sb
    .from("consent_records")
    .select("consent_type, expires_at")
    .eq("patient_id", patientId)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString());

  if (error || !data) {
    return base;
  }

  const now = Date.now();
  for (const row of data) {
    const t = row.consent_type as ConsentType;
    if (row.expires_at && new Date(row.expires_at).getTime() > now) {
      base[t] = true;
    }
  }

  return base;
}

/** Latest active catalog row for a consent type (by effective_from). */
export async function getActiveConsentVersion(consentType: ConsentType) {
  const { data, error } = await sb
    .from("consent_versions")
    .select("*")
    .eq("consent_type", consentType)
    .eq("is_active", true)
    .order("effective_from", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** SHA-256 hash of body_markdown for tamper detection (matches DB body_hash). */
export async function hashConsentBody(bodyMarkdown: string): Promise<string> {
  const encoder = new TextEncoder();
  const buf = encoder.encode(bodyMarkdown);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buf);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
