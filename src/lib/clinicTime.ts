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

const DOW_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const clinicTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: CLINIC_TIMEZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

/** Minutes from clinic-local midnight (for schedule grid placement). */
export function clinicMinutesFromMidnight(value: string | Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TIMEZONE,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(toDate(value));
  let h = 0;
  let m = 0;
  for (const p of parts) {
    if (p.type === "hour") h = parseInt(p.value, 10);
    if (p.type === "minute") m = parseInt(p.value, 10);
  }
  return h * 60 + m;
}

/** 0=Sun … 6=Sat in clinic timezone. */
export function clinicDayOfWeek(value: string | Date): number {
  const s = new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TIMEZONE,
    weekday: "short",
  }).format(toDate(value));
  return DOW_SHORT.indexOf(s as (typeof DOW_SHORT)[number]);
}

export function formatClinicTime(value: string | Date): string {
  return clinicTimeFormatter.format(toDate(value));
}

/** UTC instant for clinic calendar date + minutes from local midnight. */
export function clinicLocalToUtc(dateKey: string, minutesFromMidnight: number): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  const hour = Math.floor(minutesFromMidnight / 60);
  const minute = minutesFromMidnight % 60;
  let ms = Date.UTC(year, month - 1, day, hour + 5, minute, 0);

  for (let i = 0; i < 12; i++) {
    const d = new Date(ms);
    const dk = formatClinicDateKey(d);
    const dm = clinicMinutesFromMidnight(d);
    if (dk === dateKey && dm === minutesFromMidnight) return d;
    if (dk < dateKey) {
      ms += 24 * 60 * 60 * 1000;
      continue;
    }
    if (dk > dateKey) {
      ms -= 24 * 60 * 60 * 1000;
      continue;
    }
    ms += (minutesFromMidnight - dm) * 60 * 1000;
  }

  return new Date(ms);
}

export function addClinicDays(dateKey: string, days: number): string {
  const anchor = clinicLocalToUtc(dateKey, 12 * 60);
  return formatClinicDateKey(new Date(anchor.getTime() + days * 24 * 60 * 60 * 1000));
}

/** Inclusive UTC range covering one clinic calendar day. */
export function clinicDayUtcRange(dateKey: string): { start: Date; end: Date } {
  return {
    start: clinicLocalToUtc(dateKey, 0),
    end: clinicLocalToUtc(addClinicDays(dateKey, 1), 0),
  };
}

export function isSameClinicDay(a: string | Date, b: string | Date): boolean {
  return formatClinicDateKey(a) === formatClinicDateKey(b);
}
