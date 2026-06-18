import { HOUR_START, HOUR_END, SLOT_MINUTES, ProviderSchedule, ScheduleBlock, ScheduleException } from "./types";
import {
  clinicDayOfWeek,
  clinicLocalToUtc,
  addClinicDays,
  formatClinicDateKey,
  isSameClinicDay,
} from "@/lib/clinicTime";

export const minutesFromMidnight = (hhmmss: string) => {
  const [h, m] = hhmmss.split(":").map(Number);
  return h * 60 + m;
};

export const minutesToHHMM = (mins: number) =>
  `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

export const formatHourLabel = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? "pm" : "am";
  const hh = ((h + 11) % 12) + 1;
  return m === 0 ? `${hh} ${ampm}` : `${hh}:${String(m).padStart(2, "0")} ${ampm}`;
};

export const initials = (name: string | null | undefined) => {
  if (!name) return "—";
  return name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("");
};

export const dayMinuteSlots = () => {
  const out: number[] = [];
  for (let m = HOUR_START * 60; m < HOUR_END * 60; m += SLOT_MINUTES) out.push(m);
  return out;
};

export interface CoverageSlot {
  start: number; // minutes
  end: number;
  service_lines: string[];
  source: "schedule" | "exception";
}

/** Returns [{start,end,service_lines}] minutes-from-midnight for a given provider+date */
export function coverageForDate(
  date: Date,
  providerId: string,
  schedules: ProviderSchedule[],
  exceptions: ScheduleException[]
): CoverageSlot[] {
  const dateStr = formatClinicDateKey(date);
  const exForDate = exceptions.filter(
    (e) => e.provider_id === providerId && e.exception_date === dateStr
  );

  const dow = clinicDayOfWeek(date);
  const recurring = schedules.filter(
    (s) => s.provider_id === providerId && s.day_of_week === dow && s.is_active
  );

  let result: CoverageSlot[] = recurring.map((s) => ({
    start: minutesFromMidnight(s.start_time),
    end: minutesFromMidnight(s.end_time),
    service_lines: s.service_lines || [],
    source: "schedule",
  }));

  // additions
  for (const e of exForDate.filter((e) => e.type === "addition")) {
    result.push({
      start: minutesFromMidnight(e.start_time),
      end: minutesFromMidnight(e.end_time),
      service_lines: e.service_lines || [],
      source: "exception",
    });
  }
  // removals — clip
  for (const e of exForDate.filter((e) => e.type === "removal")) {
    const rs = minutesFromMidnight(e.start_time);
    const re = minutesFromMidnight(e.end_time);
    const next: CoverageSlot[] = [];
    for (const c of result) {
      if (re <= c.start || rs >= c.end) { next.push(c); continue; }
      if (rs > c.start) next.push({ ...c, end: rs });
      if (re < c.end)   next.push({ ...c, start: re });
    }
    result = next;
  }
  return result;
}

export function blocksForDate(date: Date, providerId: string, blocks: ScheduleBlock[]) {
  const dateKey = formatClinicDateKey(date);
  const dayStart = clinicLocalToUtc(dateKey, 0);
  const dayEnd = clinicLocalToUtc(addClinicDays(dateKey, 1), 0);
  return blocks
    .filter((b) => b.provider_id === providerId)
    .map((b) => ({ ...b, _start: new Date(b.start_at), _end: new Date(b.end_at) }))
    .filter((b) => b._end > dayStart && b._start < dayEnd)
    .map((b) => ({
      ...b,
      startMin: Math.max(0, (b._start.getTime() - dayStart.getTime()) / 60000),
      endMin: Math.min(24 * 60, (b._end.getTime() - dayStart.getTime()) / 60000),
    }));
}

export function isSlotCovered(
  slotMin: number,
  coverage: CoverageSlot[]
): CoverageSlot | null {
  return coverage.find((c) => slotMin >= c.start && slotMin < c.end) || null;
}

export function isSlotBlocked(
  slotMin: number,
  blocks: ReturnType<typeof blocksForDate>
): boolean {
  return blocks.some((b) => slotMin >= b.startMin && slotMin < b.endMin);
}

export const snap30 = (mins: number) => Math.round(mins / SLOT_MINUTES) * SLOT_MINUTES;

export { HOUR_START, HOUR_END, SLOT_MINUTES, isSameClinicDay };
