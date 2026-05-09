import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  start_time: string;     // HH:MM:SS
  end_time: string;
  type: "addition" | "removal" | string;
  service_lines: string[];
  slot_minutes: number;
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function dateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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
    const exceptionStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const exceptionEndDate = new Date(exceptionStartDate.getTime() + days * 24 * 60 * 60 * 1000);
    const { data: exceptions } = providerIds.length
      ? await supabase
          .from("schedule_exceptions")
          .select(
            "provider_id,exception_date,start_time,end_time,type,service_lines,slot_minutes",
          )
          .in("provider_id", providerIds)
          .contains("service_lines", [service_line])
          .gte("exception_date", dateKey(exceptionStartDate))
          .lte("exception_date", dateKey(exceptionEndDate))
      : { data: [] as Exception[] };

    const slots: { provider_id: string; start: string; end: string }[] = [];
    // Track unique (provider_id, slotStartIso) to avoid duplicates when an
    // addition window overlaps the base schedule.
    const seen = new Set<string>();

    for (let d = 0; d < days; d++) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d);
      const dow = day.getDay();
      const dayKeyStr = dateKey(day);

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
            const slotStart = new Date(day);
            slotStart.setHours(0, 0, 0, 0);
            slotStart.setMinutes(m);
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

            const key = `${providerIdForDay}|${slotStart.toISOString()}`;
            if (seen.has(key)) continue;
            seen.add(key);

            slots.push({
              provider_id: providerIdForDay,
              start: slotStart.toISOString(),
              end: slotEnd.toISOString(),
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
