/**
 * Service Feature Flag Configuration
 * 
 * This file controls which services are visible across the entire application.
 * To sunset a service, set its value to `false`.
 * To re-enable a service, set its value to `true`.
 * 
 * IMPORTANT: Changes here affect navigation, pricing, booking modals, 
 * chat functions, provider dashboard, and patient portal.
 */

export const ACTIVE_SERVICES = {
  // ACTIVE SERVICES - 4 core pillars
  hormones: true,      // Hormone Optimization
  weightLoss: true,    // Medical Weight Loss / GLP-1
  ivLounge: true,      // IV Therapy
  peptides: true,      // Peptide Therapy

  // SUNSETTED / NOT-YET-LAUNCHED SERVICES - hidden across app
  ketamine: false,        // Ketamine / Spravato — not offered
  hairRestoration: false, // Hair Restoration — post-launch
  sexualWellness: false,  // Sexual Wellness — post-launch

  // PEPTIDE-LEVEL COMPLIANCE FLAGS (toggle when FCC supply/legal status shifts)
  peptideTB500: true,     // TB-500 (Thymosin Beta-4) — set false if FCC pulls supply
} as const;

// Type for service keys
export type ServiceKey = keyof typeof ACTIVE_SERVICES;

// Helper function to check if a service is active
export const isServiceActive = (service: ServiceKey): boolean => 
  ACTIVE_SERVICES[service];

// Get all active service keys
export const getActiveServices = (): ServiceKey[] =>
  (Object.keys(ACTIVE_SERVICES) as ServiceKey[]).filter(key => ACTIVE_SERVICES[key]);

// Get all sunsetted service keys
export const getSunsettedServices = (): ServiceKey[] =>
  (Object.keys(ACTIVE_SERVICES) as ServiceKey[]).filter(key => !ACTIVE_SERVICES[key]);

/** Maps booking/intake reason IDs to ACTIVE_SERVICES flags (null = always visible). */
const VISIT_REASON_SERVICE: Partial<Record<string, ServiceKey>> = {
  sexual_wellness: "sexualWellness",
  hair_restoration: "hairRestoration",
};

export function isVisitReasonVisible(reasonId: string): boolean {
  const service = VISIT_REASON_SERVICE[reasonId];
  return service ? isServiceActive(service) : true;
}

export function filterVisibleVisitReasons<T extends { id: string }>(reasons: T[]): T[] {
  return reasons.filter((r) => isVisitReasonVisible(r.id));
}

/** Public marketing copy for consult-gated services (respects launch flags). */
export function consultGatedServicesCopy(): string {
  const parts = ["hormone therapy", "peptides", "weight loss"];
  if (isServiceActive("sexualWellness")) parts.push("sexual wellness");
  return parts.join(", ");
}
