/** Clinic-local time for Evans, GA — all patient-facing consent timestamps use this zone. */
export const CLINIC_TIMEZONE = "America/New_York";

const clinicDateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: CLINIC_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const clinicDateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: CLINIC_TIMEZONE,
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const clinicDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: CLINIC_TIMEZONE,
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

/** yyyy-mm-dd in clinic timezone (for same-day comparisons). */
export function formatClinicDateKey(value: string | Date): string {
  return clinicDateKeyFormatter.format(toDate(value));
}

export function formatClinicDate(value: string | Date): string {
  return clinicDateFormatter.format(toDate(value));
}

export function formatClinicDateTime(value: string | Date): string {
  return clinicDateTimeFormatter.format(toDate(value));
}

/** Consents remain valid through the expiration calendar date (clinic local), inclusive. */
export function isConsentActive(expiresAt: string | Date, now: Date = new Date()): boolean {
  const expKey = formatClinicDateKey(expiresAt);
  const todayKey = formatClinicDateKey(now);
  return expKey >= todayKey;
}

export function addMonths(base: Date, months: number): Date {
  const d = new Date(base);
  d.setMonth(d.getMonth() + months);
  return d;
}
