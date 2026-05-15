import { encode as base64url } from "https://deno.land/std@0.224.0/encoding/base64url.ts";

/** 256-bit URL-safe token for intake magic links. */
export function generateMagicLinkToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64url(bytes);
}

export function getAppBaseUrl(): string {
  return (
    Deno.env.get("APP_BASE_URL") ||
    Deno.env.get("SITE_URL") ||
    "https://elevatedhealthaugusta.com"
  ).replace(/\/$/, "");
}

export function buildIntakeMagicLinkUrl(token: string): string {
  return `${getAppBaseUrl()}/intake/start?t=${encodeURIComponent(token)}`;
}

/** Default expiry: appointment + 24h, else now + 7 days. */
export function computeIntakeLinkExpiry(
  appointmentTime?: string | null,
  expiresAtOverride?: string | null,
): string {
  if (expiresAtOverride) {
    return new Date(expiresAtOverride).toISOString();
  }
  if (appointmentTime) {
    const appt = new Date(appointmentTime);
    return new Date(appt.getTime() + 24 * 60 * 60 * 1000).toISOString();
  }
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
}

export const WELLNESS_ASSESSMENT_SERVICE_TYPES = new Set([
  "hormone",
  "weight_loss",
  "peptide",
  "wellness_assessment",
]);

export function isWellnessAssessmentServiceType(serviceType: string | null | undefined): boolean {
  if (!serviceType) return false;
  return WELLNESS_ASSESSMENT_SERVICE_TYPES.has(serviceType);
}
