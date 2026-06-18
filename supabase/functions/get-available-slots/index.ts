/**
 * get-available-slots
 * deploy: 2026-05-19 slot token v1 hardening
 *
 * Returns bookable time slots for the SlotPicker. Reads provider_schedules,
 * schedule_blocks, schedule_exceptions, and appointments to compute live
 * availability across the next N days.
 *
 * Room-aware (v2): batch-loads rooms, room_blackouts, room-assigned
 * appointments, and booking_limits once per request, then filters each
 * candidate slot in-memory to match find_available_room + check_booking_limits
 * trigger semantics.
 *
 * AUTH POSTURE (security audit R-5, 2026-05-08):
 *   - verify_jwt = true in supabase/config.toml
 *   - No additional role check: any authenticated user can compute slots,
 *     because both anonymous storefront flows (post-payment confirmation)
 *     and patient-portal flows need this.
 *
 * SECURITY POSTURE (R-5 follow-up):
 *   Returns opaque signed slot_token values instead of raw provider_id.
 *   If SLOT_SIGNING_KEY is missing, this function fails closed and emits no slots.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getSlotSigningKey, issueSlotToken } from "../_shared/slot-token.ts";
import {
  addClinicDays,
  clinicDateKey,
  clinicDateKeysFrom,
  clinicDayOfWeek,
  clinicLocalToUtc,
  clinicMinutesFromMidnight,
} from "../_shared/clinic-time.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Schedule {
  id: string;
  provider_id: string;
  day_of_week: number;
  start_time: string; // HH:MM:SS
  end_time: string;
  service_lines: string[];
  slot_minutes: number;
  is_active: boolean;
}

interface Block {
  provider_id: string;
  start_at: string;
  end_at: string;
}

interface Appt {
  provider_id: string;
  scheduled_at: string;
  duration_minutes: number;
}

interface Exception {
  provider_id: string;
  exception_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string;
  type: "addition" | "removal" | string;
  service_lines: string[];
  slot_minutes: number;
}

interface RoomRow {
  id: string;
  type: string;
  is_active: boolean;
  is_flex: boolean;
  allowed_service_lines: string[];
  max_concurrent_appointments: number;
  display_order: number;
}

interface RoomBlackoutRow {
  room_id: string;
  start_at: string;
  end_at: string;
}

interface RoomApptRow {
  id: string;
  room_id: string;
  scheduled_at: string;
  duration_minutes: number;
  service_line: string;
  status: string;
}

interface BookingLimitRow {
  id: string;
  active: boolean;
  day_of_week: number | null;
  start_time: string | null;
  end_time: string | null;
  max_concurrent: number;
  service_line: string | null;
  applies_to_room_types: string[] | null;
  effective_from: string | null;
  effective_until: string | null;
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function timeStrToMinutes(t: string | null): number | null {
  if (!t) return null;
  const [hh, mm] = t.split(":").map(Number);
  return hh * 60 + mm;
}

function overlapsInterval(aStartMs: number, aEndMs: number, bStartMs: number, bEndMs: number): boolean {
  return aStartMs < bEndMs && aEndMs > bStartMs;
}

function buildRoomHelpers(
  rooms: RoomRow[],
  blackouts: RoomBlackoutRow[],
  roomAppts: RoomApptRow[],
  bookingLimits: BookingLimitRow[],
) {
  const roomsById = new Map(rooms.map((r) => [r.id, r]));
  const sortedRooms = [...rooms].sort((a, b) => {
    if (a.is_flex !== b.is_flex) return Number(a.is_flex) - Number(b.is_flex);
    return (a.display_order ?? 0) - (b.display_order ?? 0);
  });

  function isSlotRoomAvailable(slotStart: Date, slotEnd: Date, serviceLine: string): boolean {
    const sMs = slotStart.getTime();
    const eMs = slotEnd.getTime();
    for (const r of sortedRooms) {
      if (!r.is_active) continue;
      if (!r.allowed_service_lines?.includes(serviceLine)) continue;

      const blackoutHit = blackouts.some(
        (b) =>
          b.room_id === r.id &&
          overlapsInterval(new Date(b.start_at).getTime(), new Date(b.end_at).getTime(), sMs, eMs),
      );
      if (blackoutHit) continue;

      const apptHit = roomAppts.some((a) => {
        if (a.room_id !== r.id) return false;
        if (["cancelled", "no_show", "rescheduled"].includes(a.status)) return false;
        const aStart = new Date(a.scheduled_at).getTime();
        const aEnd = aStart + (a.duration_minutes || 30) * 60_000;
        return overlapsInterval(aStart, aEnd, sMs, eMs);
      });
      if (!apptHit) return true;
    }
    return false;
  }

  function withinBookingLimits(slotStart: Date, slotEnd: Date, serviceLine: string): boolean {
    const slotStartMs = slotStart.getTime();
    const slotEndMs = slotEnd.getTime();
    const apptDate = clinicDateKey(slotStart);
    const apptDow = clinicDayOfWeek(slotStart);
    const apptMin = clinicMinutesFromMidnight(slotStart);

    for (const lim of bookingLimits) {
      if (!lim.active) continue;
      if (lim.effective_from && lim.effective_from > apptDate) continue;
      if (lim.effective_until && lim.effective_until < apptDate) continue;
      if (lim.day_of_week !== null && lim.day_of_week !== apptDow) continue;
      const stMin = timeStrToMinutes(lim.start_time);
      const enMin = timeStrToMinutes(lim.end_time);
      if (stMin !== null && stMin > apptMin) continue;
      if (enMin !== null && enMin < apptMin) continue;
      if (lim.service_line !== null && lim.service_line !== serviceLine) continue;

      const appliesNull =
        lim.applies_to_room_types === null || (lim.applies_to_room_types?.length ?? 0) === 0;

      let count = 0;
      for (const a of roomAppts) {
        if (["cancelled", "no_show", "rescheduled"].includes(a.status)) continue;
        const aStart = new Date(a.scheduled_at).getTime();
        const aEnd = aStart + (a.duration_minutes || 30) * 60_000;
        if (!overlapsInterval(aStart, aEnd, slotStartMs, slotEndMs)) continue;
        if (lim.service_line !== null && a.service_line !== lim.service_line) continue;

        const r = roomsById.get(a.room_id);
        const rType = r?.type ?? null;
        if (!appliesNull) {
          const types = lim.applies_to_room_types!;
          if (!rType || !types.includes(rType)) continue;
        }
        count++;
      }
      if (count + 1 > lim.max_concurrent) return false;
    }
    return true;
  }

  return { isSlotRoomAvailable, withinBookingLimits };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    let body: any = {};
    if (req.method === "POST") body = await req.json().catch(() => ({}));
    const service_line: string = body.service_line || url.searchParams.get("service_line") || "iv";
    const duration_minutes: number = Number(body.duration_minutes || url.searchParams.get("duration_minutes") || 60);
    const provider_id: string | null = body.provider_id || url.searchParams.get("provider_id") || null;
    const days: number = Number(body.days || url.searchParams.get("days") || 14);
    const signingKey = getSlotSigningKey();
    if (!signingKey) {
      console.error("get-available-slots: SLOT_SIGNING_KEY missing; refusing to emit bookable slots");
      return new Response(
        JSON.stringify({
          error: "Slot signing is not configured.",
          error_code: "slot_signing_not_configured",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let schedQ = supabase.from("provider_schedules").select("*").eq("is_active", true).contains("service_lines", [service_line]);
    if (provider_id) schedQ = schedQ.eq("provider_id", provider_id);
    const { data: schedules, error: schedErr } = await schedQ;
    if (schedErr) throw schedErr;

    const now = new Date();
    const startWindow = new Date(now.getTime());
    const endWindow = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const providerIds = [...new Set((schedules || []).map((s: Schedule) => s.provider_id))];

    const { data: blocks } = providerIds.length
      ? await supabase
          .from("schedule_blocks")
          .select("provider_id,start_at,end_at")
          .in("provider_id", providerIds)
          .gte("end_at", startWindow.toISOString())
          .lte("start_at", endWindow.toISOString())
      : { data: [] as Block[] };

    const { data: appts } = providerIds.length
      ? await supabase
          .from("appointments")
          .select("provider_id,scheduled_at,duration_minutes,status")
          .in("provider_id", providerIds)
          .neq("status", "cancelled")
          .gte("scheduled_at", startWindow.toISOString())
          .lte("scheduled_at", endWindow.toISOString())
      : { data: [] as Appt[] };

    // schedule_exceptions overrides the base provider_schedules pattern on
    // specific dates. Two flavours:
    //   - 'removal'  → suppress all base/addition slots inside that window
    //   - 'addition' → expose extra slots outside the base pattern (e.g. a
    //                  one-off Saturday clinic). Treated as if it were a
    //                  matching provider_schedules row for that date only.
    const exceptionStartKey = clinicDateKey(now);
    const exceptionEndKey = addClinicDays(exceptionStartKey, days);
    const { data: exceptions } = providerIds.length
      ? await supabase
          .from("schedule_exceptions")
          .select(
            "provider_id,exception_date,start_time,end_time,type,service_lines,slot_minutes",
          )
          .in("provider_id", providerIds)
          .contains("service_lines", [service_line])
          .gte("exception_date", exceptionStartKey)
          .lte("exception_date", exceptionEndKey)
      : { data: [] as Exception[] };

    const fetchStart = new Date(startWindow.getTime() - 48 * 60 * 60 * 1000);
    const [{ data: roomsData }, { data: blackoutsData }, { data: roomApptsRaw }, { data: limitsData }] = await Promise.all([
      supabase
        .from("rooms")
        .select("id, type, is_active, is_flex, allowed_service_lines, max_concurrent_appointments, display_order")
        .eq("is_active", true),
      supabase
        .from("room_blackouts")
        .select("room_id, start_at, end_at")
        .lt("start_at", endWindow.toISOString())
        .gt("end_at", startWindow.toISOString()),
      supabase
        .from("appointments")
        .select("id, room_id, scheduled_at, duration_minutes, service_line, status")
        .not("room_id", "is", null)
        .gte("scheduled_at", fetchStart.toISOString())
        .lt("scheduled_at", endWindow.toISOString()),
      supabase.from("booking_limits").select("*").eq("active", true),
    ]);

    const rooms = (roomsData || []) as RoomRow[];
    const blackouts = (blackoutsData || []) as RoomBlackoutRow[];
    const roomAppts = ((roomApptsRaw || []) as RoomApptRow[]).filter(
      (a) => !["cancelled", "no_show", "rescheduled"].includes(a.status),
    );
    const bookingLimits = (limitsData || []) as BookingLimitRow[];

    const { isSlotRoomAvailable, withinBookingLimits } = buildRoomHelpers(rooms, blackouts, roomAppts, bookingLimits);

    const slots: { slot_token: string; start: string; end: string }[] = [];
    // Track unique (provider_id, slotStartIso) to avoid duplicates when an
    // addition window overlaps the base schedule.
    const seen = new Set<string>();

    const clinicDayKeys = clinicDateKeysFrom(now, days);

    for (const dayKeyStr of clinicDayKeys) {
      const dow = clinicDayOfWeek(clinicLocalToUtc(dayKeyStr, 12 * 60));

      // Build the per-provider, per-day window list to iterate. Start with
      // base schedule rows that match this day-of-week, then append addition
      // exception rows for this exact date.
      const windowsByProvider = new Map<
        string,
        { startMin: number; endMin: number; step: number }[]
      >();

      for (const s of (schedules || []) as Schedule[]) {
        if (s.day_of_week !== dow) continue;
        const list = windowsByProvider.get(s.provider_id) || [];
        list.push({
          startMin: timeToMinutes(s.start_time),
          endMin: timeToMinutes(s.end_time),
          step: s.slot_minutes || 30,
        });
        windowsByProvider.set(s.provider_id, list);
      }

      for (const ex of (exceptions || []) as Exception[]) {
        if (ex.exception_date !== dayKeyStr) continue;
        if (ex.type !== "addition") continue;
        const list = windowsByProvider.get(ex.provider_id) || [];
        list.push({
          startMin: timeToMinutes(ex.start_time),
          endMin: timeToMinutes(ex.end_time),
          step: ex.slot_minutes || 30,
        });
        windowsByProvider.set(ex.provider_id, list);
      }

      // Removal exceptions for this date apply per-provider as extra blocks.
      const removalsByProvider = new Map<
        string,
        { startMin: number; endMin: number }[]
      >();
      for (const ex of (exceptions || []) as Exception[]) {
        if (ex.exception_date !== dayKeyStr) continue;
        if (ex.type !== "removal") continue;
        const list = removalsByProvider.get(ex.provider_id) || [];
        list.push({
          startMin: timeToMinutes(ex.start_time),
          endMin: timeToMinutes(ex.end_time),
        });
        removalsByProvider.set(ex.provider_id, list);
      }

      for (const [providerIdForDay, windows] of windowsByProvider.entries()) {
        const removals = removalsByProvider.get(providerIdForDay) || [];
        for (const w of windows) {
          for (let m = w.startMin; m + duration_minutes <= w.endMin; m += w.step) {
            const slotStart = clinicLocalToUtc(dayKeyStr, m);
            const slotEnd = new Date(slotStart.getTime() + duration_minutes * 60_000);

            // Skip past slots (with 2hr buffer)
            if (slotStart.getTime() < now.getTime() + 2 * 60 * 60 * 1000) continue;

            // Removal exception covers this slot → skip
            const removed = removals.some((r) => m < r.endMin && m + duration_minutes > r.startMin);
            if (removed) continue;

            // Conflict with appointments
            const conflictAppt = (appts || []).some((a: Appt) => {
              if (a.provider_id !== providerIdForDay) return false;
              const aStart = new Date(a.scheduled_at).getTime();
              const aEnd = aStart + (a.duration_minutes || 30) * 60_000;
              return slotStart.getTime() < aEnd && slotEnd.getTime() > aStart;
            });
            if (conflictAppt) continue;

            // Conflict with blocks
            const conflictBlock = (blocks || []).some((b: Block) => {
              if (b.provider_id !== providerIdForDay) return false;
              const bStart = new Date(b.start_at).getTime();
              const bEnd = new Date(b.end_at).getTime();
              return slotStart.getTime() < bEnd && slotEnd.getTime() > bStart;
            });
            if (conflictBlock) continue;

            if (!isSlotRoomAvailable(slotStart, slotEnd, service_line)) continue;
            if (!withinBookingLimits(slotStart, slotEnd, service_line)) continue;

            const key = `${providerIdForDay}|${slotStart.toISOString()}`;
            if (seen.has(key)) continue;
            seen.add(key);

            const slotStartIso = slotStart.toISOString();
            const slotEndIso = slotEnd.toISOString();
            const { token } = await issueSlotToken({
              signingKey,
              providerId: providerIdForDay,
              slotStartIso,
              slotEndIso,
              serviceLine: service_line,
            });

            slots.push({
              slot_token: token,
              start: slotStartIso,
              end: slotEndIso,
            });
          }
        }
      }
    }

    return new Response(JSON.stringify({ slots }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error("get-available-slots error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
