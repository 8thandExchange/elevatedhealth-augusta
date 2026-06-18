/** Clinic wall-clock helpers — Evans, GA (America/New_York). Shared by edge functions. */
export const CLINIC_TIMEZONE = "America/New_York";

const DOW_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function clinicDateKey(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: CLINIC_TIMEZONE });
}

export function clinicDayOfWeek(d: Date): number {
  const s = new Intl.DateTimeFormat("en-US", { timeZone: CLINIC_TIMEZONE, weekday: "short" }).format(d);
  return DOW_SHORT.indexOf(s as (typeof DOW_SHORT)[number]);
}

export function clinicMinutesFromMidnight(d: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TIMEZONE,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(d);
  let h = 0;
  let m = 0;
  for (const p of parts) {
    if (p.type === "hour") h = parseInt(p.value, 10);
    if (p.type === "minute") m = parseInt(p.value, 10);
  }
  return h * 60 + m;
}

/** UTC instant for a clinic calendar date (yyyy-mm-dd) + minutes from local midnight. */
export function clinicLocalToUtc(dateKey: string, minutesFromMidnight: number): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  const hour = Math.floor(minutesFromMidnight / 60);
  const minute = minutesFromMidnight % 60;
  let ms = Date.UTC(year, month - 1, day, hour + 5, minute, 0);

  for (let i = 0; i < 12; i++) {
    const d = new Date(ms);
    const dk = clinicDateKey(d);
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
  return clinicDateKey(new Date(anchor.getTime() + days * 24 * 60 * 60 * 1000));
}

export function clinicDateKeysFrom(now: Date, count: number): string[] {
  const keys: string[] = [];
  let key = clinicDateKey(now);
  for (let i = 0; i < count; i++) {
    keys.push(key);
    key = addClinicDays(key, 1);
  }
  return keys;
}

export interface MinuteWindow {
  startMin: number;
  endMin: number;
  step: number;
}

/** Merge overlapping or touching availability windows before emitting bookable slots. */
export function mergeMinuteWindows(windows: MinuteWindow[]): MinuteWindow[] {
  if (windows.length === 0) return [];
  const sorted = [...windows].sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);
  const out: MinuteWindow[] = [];
  let cur = { ...sorted[0] };
  for (let i = 1; i < sorted.length; i++) {
    const w = sorted[i];
    if (w.startMin <= cur.endMin) {
      cur.endMin = Math.max(cur.endMin, w.endMin);
      cur.step = Math.min(cur.step, w.step);
    } else {
      out.push(cur);
      cur = { ...w };
    }
  }
  out.push(cur);
  return out;
}
