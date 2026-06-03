/**
 * LabCorp-first patient journey — legacy ZRT saliva kit flow removed from product UI.
 */

export const CLINIC_LAB_PATH = "labcorp" as const;

export type LabPath = typeof CLINIC_LAB_PATH;

export interface LabPathInfo {
  path: LabPath;
  panel?: string | null;
  reason?: string | null;
}

/** Legacy onboarding values still in DB; map to staff/patient copy. */
export const LEGACY_KIT_STATUSES = [
  "kit_link_sent",
  "labs_paid",
  "kit_shipped",
  "sample_received",
] as const;

export function normalizeLabPath(input?: { path?: string } | null): LabPathInfo {
  return {
    path: CLINIC_LAB_PATH,
    panel: input?.path === CLINIC_LAB_PATH ? (input as LabPathInfo).panel : (input as LabPathInfo)?.panel,
    reason: (input as LabPathInfo)?.reason ?? "In-office LabCorp draw per clinic protocol",
  };
}

export function isLegacyKitStatus(status: string | null | undefined): boolean {
  return LEGACY_KIT_STATUSES.includes(status as (typeof LEGACY_KIT_STATUSES)[number]);
}

/** Display status for UI — collapses legacy kit states into LabCorp equivalents. */
export function displayOnboardingStatus(status: string | null | undefined): string {
  if (!status) return "pending_invite";
  switch (status) {
    case "labs_paid":
    case "kit_link_sent":
    case "kit_shipped":
      return "awaiting_blood_work";
    case "sample_received":
      return "labs_in_progress";
    default:
      return status;
  }
}
