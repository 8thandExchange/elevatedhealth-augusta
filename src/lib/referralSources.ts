/**
 * Referral / marketing-attribution source options.
 *
 * Single source of truth for the "How did you hear about us?" question on the
 * public intake form and for any staff-facing reporting. The `value` strings
 * are what we persist (patients.referral_source + medical_history.marketing);
 * keep them stable so historical reporting stays consistent. Add new options
 * by appending — do not repurpose an existing value.
 */
export interface ReferralSourceOption {
  value: string;
  label: string;
  /** When true, show the optional free-text "details" field for specifics. */
  promptForDetail?: boolean;
}

export const REFERRAL_SOURCE_OPTIONS: ReferralSourceOption[] = [
  { value: "social_media", label: "Social media (Instagram, Facebook, TikTok)", promptForDetail: true },
  { value: "google_search", label: "Google or online search" },
  { value: "friend_family", label: "Friend or family", promptForDetail: true },
  { value: "provider_referral", label: "Doctor or healthcare provider", promptForDetail: true },
  { value: "signage_drive_by", label: "Saw our location / drove by" },
  { value: "event_community", label: "Event, health fair, or community" },
  { value: "radio_podcast_news", label: "Radio, podcast, or news" },
  { value: "returning_patient", label: "I'm a returning patient" },
  { value: "other", label: "Other", promptForDetail: true },
];

const LABEL_BY_VALUE: Record<string, string> = Object.fromEntries(
  REFERRAL_SOURCE_OPTIONS.map((o) => [o.value, o.label]),
);

/** Human-readable label for a stored referral_source value (falls back to the raw value). */
export function referralSourceLabel(value?: string | null): string {
  if (!value) return "Not provided";
  return LABEL_BY_VALUE[value] ?? value;
}
