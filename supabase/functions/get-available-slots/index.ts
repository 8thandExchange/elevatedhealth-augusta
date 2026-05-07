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

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
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

    const slots: { provider_id: string; start: string; end: string }[] = [];

    for (let d = 0; d < days; d++) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d);
      const dow = day.getDay();
      const dayMatches = (schedules || []).filter((s: Schedule) => s.day_of_week === dow);

      for (const s of dayMatches) {
        const startMin = timeToMinutes(s.start_time);
        const endMin = timeToMinutes(s.end_time);
        const step = s.slot_minutes || 30;
        for (let m = startMin; m + duration_minutes <= endMin; m += step) {
          const slotStart = new Date(day);
          slotStart.setHours(0, 0, 0, 0);
          slotStart.setMinutes(m);
          const slotEnd = new Date(slotStart.getTime() + duration_minutes * 60_000);

          // Skip past slots (with 2hr buffer)
          if (slotStart.getTime() < now.getTime() + 2 * 60 * 60 * 1000) continue;

          // Conflict with appointments
          const conflictAppt = (appts || []).some((a: any) => {
            if (a.provider_id !== s.provider_id) return false;
            const aStart = new Date(a.scheduled_at).getTime();
            const aEnd = aStart + (a.duration_minutes || 30) * 60_000;
            return slotStart.getTime() < aEnd && slotEnd.getTime() > aStart;
          });
          if (conflictAppt) continue;

          // Conflict with blocks
          const conflictBlock = (blocks || []).some((b: Block) => {
            if (b.provider_id !== s.provider_id) return false;
            const bStart = new Date(b.start_at).getTime();
            const bEnd = new Date(b.end_at).getTime();
            return slotStart.getTime() < bEnd && slotEnd.getTime() > bStart;
          });
          if (conflictBlock) continue;

          slots.push({
            provider_id: s.provider_id,
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
          });
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
