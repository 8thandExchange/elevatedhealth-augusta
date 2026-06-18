import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  Loader2, ChevronLeft, ChevronRight, CalendarOff, Copy, AlertTriangle, Trash2, Plus, X,
} from "lucide-react";
import {
  addClinicDays,
  clinicDayOfWeek,
  clinicLocalToUtc,
  clinicMinutesFromMidnight,
  formatClinicDateKey,
  formatClinicDatetimeLocal,
  formatClinicTime,
  isSameClinicDay,
  parseClinicDatetimeLocal,
} from "@/lib/clinicTime";
import {
  addDays, startOfWeek, endOfWeek, format, isSameDay, isBefore, addWeeks, subWeeks,
  parseISO, differenceInMinutes, isWithinInterval,
} from "date-fns";
import { Link } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SERVICE_LINES = [
  { id: "iv", label: "IV", full: "IV Therapy" },
  { id: "consult", label: "WA", full: "Wellness Assessment" },
  { id: "hormone", label: "HRM", full: "Hormone" },
  { id: "peptide", label: "PEP", full: "Peptide" },
  { id: "weight_loss", label: "WL", full: "Weight Loss" },
  { id: "follow_up", label: "F/U", full: "Follow-up" },
] as const;
const SERVICE_LABEL = Object.fromEntries(SERVICE_LINES.map((s) => [s.id, s.label]));
const SERVICE_FULL = Object.fromEntries(SERVICE_LINES.map((s) => [s.id, s.full]));

const HOUR_START = 7;       // 7am
const HOUR_END = 20;        // 8pm
const SLOT_MINUTES = 30;    // grid granularity
const ROWS = (HOUR_END - HOUR_START) * (60 / SLOT_MINUTES);
const ROW_PX = 28;          // pixel height per 30-min row

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Schedule {
  id: string;
  provider_id: string;
  day_of_week: number; // 0=Sun..6=Sat (DB convention)
  start_time: string;  // "HH:MM:SS"
  end_time: string;
  service_lines: string[];
  slot_minutes: number;
  is_active: boolean;
}
interface Block {
  id: string;
  provider_id: string;
  start_at: string; // ISO
  end_at: string;   // ISO
  reason: string | null;
}
interface Appt {
  id: string;
  provider_id: string | null;
  patient_id: string;
  scheduled_at: string;
  duration_minutes: number;
  service_line: string;
  status: string;
  patient_name?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const minutesFromMidnight = (hhmmss: string) => {
  const [h, m] = hhmmss.split(":").map(Number);
  return h * 60 + m;
};
const minutesToHHMM = (mins: number) =>
  `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
const initials = (name: string | null | undefined) => {
  if (!name) return "—";
  return name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join(".");
};
// Convert JS getDay() (0=Sun) to our column index where Mon=0..Sun=6
const dowToCol = (jsDow: number) => (jsDow + 6) % 7;
const colToJsDow = (col: number) => (col + 1) % 7;

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

interface MyScheduleManagerProps {
  providerId?: string | null;
}

export default function MyScheduleManager({ providerId: providerIdProp }: MyScheduleManagerProps = {}) {
  const [resolvedProviderId, setResolvedProviderId] = useState<string | null>(null);
  const [providerLoaded, setProviderLoaded] = useState(false);
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const weekEnd = useMemo(() => endOfWeek(weekStart, { weekStartsOn: 1 }), [weekStart]);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [appts, setAppts] = useState<Appt[]>([]);
  const [loading, setLoading] = useState(true);

  // Editor state
  const [editor, setEditor] = useState<
    | { kind: "create"; col: number; startMin: number; endMin: number; anchor: { x: number; y: number } }
    | { kind: "edit-schedule"; schedule: Schedule; anchor: { x: number; y: number } }
    | { kind: "edit-block"; block: Block; anchor: { x: number; y: number } }
    | null
  >(null);
  const [timeOffModalOpen, setTimeOffModalOpen] = useState(false);

  // ── Resolve provider id: explicit prop first, else auth.uid() ──
  useEffect(() => {
    if (providerIdProp) {
      setResolvedProviderId(providerIdProp);
      setProviderLoaded(true);
      return;
    }

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setResolvedProviderId(user?.id ?? null);
      setProviderLoaded(true);
    })();
  }, [providerIdProp]);

  // ── Load data for visible week ──
  const fetchAll = async () => {
    if (!resolvedProviderId) return;
    setLoading(true);
    const firstKey = formatClinicDateKey(weekStart);
    const lastKey = formatClinicDateKey(weekEnd);
    const startISO = clinicLocalToUtc(firstKey, 0).toISOString();
    const endISO = clinicLocalToUtc(addClinicDays(lastKey, 1), 0).toISOString();
    const [schedRes, blockRes, apptRes] = await Promise.all([
      supabase.from("provider_schedules").select("*").eq("provider_id", resolvedProviderId).order("day_of_week"),
      supabase.from("schedule_blocks").select("*").eq("provider_id", resolvedProviderId)
        .lt("start_at", endISO).gt("end_at", startISO),
      supabase.from("appointments").select("id,provider_id,patient_id,scheduled_at,duration_minutes,service_line,status,patients(full_name)")
        .eq("provider_id", resolvedProviderId).neq("status", "cancelled")
        .gte("scheduled_at", startISO).lt("scheduled_at", endISO),
    ]);
    setSchedules((schedRes.data as any) || []);
    setBlocks((blockRes.data as any) || []);
    setAppts(((apptRes.data as any) || []).map((a: any) => ({ ...a, patient_name: a.patients?.full_name ?? null })));
    setLoading(false);
  };
  useEffect(() => { if (resolvedProviderId) fetchAll(); }, [resolvedProviderId, weekStart]);

  // ── Mutations ──
  const upsertWeekly = async (col: number, startMin: number, endMin: number, services: string[], slotMin: number) => {
    if (!resolvedProviderId) return;
    const dow = colToJsDow(col);
    // Merge: if there's overlap, expand existing
    const overlapping = schedules.find(
      (s) =>
        s.day_of_week === dow &&
        s.is_active &&
        (Math.max(minutesFromMidnight(s.start_time), startMin) <
          Math.min(minutesFromMidnight(s.end_time), endMin) ||
          minutesFromMidnight(s.end_time) === startMin ||
          minutesFromMidnight(s.start_time) === endMin),
    );
    if (overlapping) {
      const newStart = Math.min(minutesFromMidnight(overlapping.start_time), startMin);
      const newEnd = Math.max(minutesFromMidnight(overlapping.end_time), endMin);
      const mergedServices = Array.from(new Set([...overlapping.service_lines, ...services]));
      const { error } = await supabase.from("provider_schedules").update({
        start_time: minutesToHHMM(newStart) + ":00",
        end_time: minutesToHHMM(newEnd) + ":00",
        service_lines: mergedServices,
        slot_minutes: slotMin,
      }).eq("id", overlapping.id);
      if (error) return toast.error(error.message);
      toast.success("Merged with existing availability");
    } else {
      const { error } = await supabase.from("provider_schedules").insert({
        provider_id: resolvedProviderId,
        day_of_week: dow,
        start_time: minutesToHHMM(startMin) + ":00",
        end_time: minutesToHHMM(endMin) + ":00",
        service_lines: services,
        slot_minutes: slotMin,
        is_active: true,
      });
      if (error) return toast.error(error.message);
      toast.success("Availability added");
    }
    setEditor(null);
    fetchAll();
  };

  const updateSchedule = async (id: string, patch: Partial<Schedule>) => {
    const { error } = await supabase.from("provider_schedules").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    setEditor(null); fetchAll();
  };
  const deleteSchedule = async (id: string) => {
    if (!confirm("Remove this recurring availability?")) return;
    const { error } = await supabase.from("provider_schedules").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    setEditor(null); fetchAll();
  };

  const addBlock = async (startISO: string, endISO: string, reason: string | null) => {
    if (!resolvedProviderId) return;
    // Warn if appointments fall in this window
    const conflicts = appts.filter((a) => {
      const aStart = parseISO(a.scheduled_at).getTime();
      const aEnd = aStart + (a.duration_minutes || 30) * 60_000;
      return aStart < new Date(endISO).getTime() && aEnd > new Date(startISO).getTime();
    });
    if (conflicts.length && !confirm(`${conflicts.length} appointment(s) are scheduled during this time. They will NOT be auto-cancelled. Continue?`)) return;
    const { error } = await supabase.from("schedule_blocks").insert({
      provider_id: resolvedProviderId, start_at: startISO, end_at: endISO, reason: reason || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Time off added");
    fetchAll();
  };
  const deleteBlock = async (id: string) => {
    if (!confirm("Remove this time off?")) return;
    const { error } = await supabase.from("schedule_blocks").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    setEditor(null); fetchAll();
  };

  const copyWeekForward = async () => {
    if (!resolvedProviderId || schedules.length === 0) {
      toast.error("Nothing to copy — set availability first");
      return;
    }
    toast.info("Recurring schedules already apply to next week automatically.");
  };

  // ── Render guards ──
  if (!providerLoaded) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!resolvedProviderId) {
    return (
      <Card><CardContent className="p-8 text-center space-y-3">
        <CalendarOff className="h-10 w-10 mx-auto text-muted-foreground" />
        <p className="font-medium">Sign in to manage your schedule</p>
      </CardContent></Card>
    );
  }

  const isPastWeek = isBefore(weekEnd, new Date()) && !isSameDay(weekEnd, new Date());

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setWeekStart(subWeeks(weekStart, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="ml-2 text-sm font-medium">
              {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}
            </span>
            {isPastWeek && <Badge variant="secondary">Read-only (past)</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyWeekForward}>
              <Copy className="h-4 w-4 mr-1" /> Copy week
            </Button>
            <Button size="sm" onClick={() => setTimeOffModalOpen(true)}>
              <CalendarOff className="h-4 w-4 mr-1" /> Block off time
            </Button>
          </div>
        </div>

        {/* Grid */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            {loading ? (
              <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : (
              <WeekGrid
                days={days}
                schedules={schedules}
                blocks={blocks}
                appts={appts}
                isPastWeek={isPastWeek}
                onCreate={(col, startMin, endMin, anchor) =>
                  setEditor({ kind: "create", col, startMin, endMin, anchor })
                }
                onClickSchedule={(s, anchor) => setEditor({ kind: "edit-schedule", schedule: s, anchor })}
                onClickBlock={(b, anchor) => setEditor({ kind: "edit-block", block: b, anchor })}
              />
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-accent/30 border-l-2 border-accent" />Available</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary" />Booked</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-muted" style={{ backgroundImage: "repeating-linear-gradient(45deg,hsl(var(--muted-foreground)/.3) 0 2px,transparent 2px 6px)" }} />Time off</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-muted/40" />Past</span>
        </div>

        {/* Editor popovers */}
        {editor?.kind === "create" && (
          <CreatePopover
            anchor={editor.anchor}
            initialServices={["consult"]}
            initialSlot={30}
            startMin={editor.startMin}
            endMin={editor.endMin}
            onCancel={() => setEditor(null)}
            onSave={(services, slot) => upsertWeekly(editor.col, editor.startMin, editor.endMin, services, slot)}
          />
        )}
        {editor?.kind === "edit-schedule" && (
          <EditSchedulePopover
            anchor={editor.anchor}
            schedule={editor.schedule}
            onCancel={() => setEditor(null)}
            onSave={(patch) => updateSchedule(editor.schedule.id, patch)}
            onDelete={() => deleteSchedule(editor.schedule.id)}
          />
        )}
        {editor?.kind === "edit-block" && (
          <EditBlockPopover
            anchor={editor.anchor}
            block={editor.block}
            onCancel={() => setEditor(null)}
            onDelete={() => deleteBlock(editor.block.id)}
          />
        )}

        {/* Block-off-time modal */}
        <TimeOffModal
          open={timeOffModalOpen}
          onOpenChange={setTimeOffModalOpen}
          onCreate={(s, e, r) => { addBlock(s, e, r); setTimeOffModalOpen(false); }}
        />
      </div>
    </TooltipProvider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Week Grid
// ─────────────────────────────────────────────────────────────────────────────

interface WeekGridProps {
  days: Date[];
  schedules: Schedule[];
  blocks: Block[];
  appts: Appt[];
  isPastWeek: boolean;
  onCreate: (col: number, startMin: number, endMin: number, anchor: { x: number; y: number }) => void;
  onClickSchedule: (s: Schedule, anchor: { x: number; y: number }) => void;
  onClickBlock: (b: Block, anchor: { x: number; y: number }) => void;
}

function WeekGrid({ days, schedules, blocks, appts, isPastWeek, onCreate, onClickSchedule, onClickBlock }: WeekGridProps) {
  const today = new Date();
  const nowMin = clinicMinutesFromMidnight(new Date());

  // Drag state
  const dragRef = useRef<{ col: number; startRow: number; endRow: number } | null>(null);
  const [dragPreview, setDragPreview] = useState<{ col: number; startRow: number; endRow: number } | null>(null);

  const onCellPointerDown = (col: number, row: number, day: Date, e: React.PointerEvent) => {
    if (isPastWeek || isBefore(day, new Date()) && !isSameDay(day, new Date())) return;
    if (e.button !== 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { col, startRow: row, endRow: row };
    setDragPreview({ col, startRow: row, endRow: row });
  };
  const onCellPointerEnter = (col: number, row: number) => {
    if (!dragRef.current || dragRef.current.col !== col) return;
    dragRef.current.endRow = row;
    setDragPreview({ ...dragRef.current });
  };
  const onCellPointerUp = (col: number, row: number, day: Date, e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const d = dragRef.current;
    dragRef.current = null;
    setDragPreview(null);
    const startRow = Math.min(d.startRow, d.endRow);
    const endRow = Math.max(d.startRow, d.endRow) + 1; // inclusive
    const startMin = HOUR_START * 60 + startRow * SLOT_MINUTES;
    const endMin = HOUR_START * 60 + endRow * SLOT_MINUTES;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    onCreate(col, startMin, endMin, { x: rect.left + rect.width / 2, y: rect.top });
  };

  return (
    <div className="min-w-[760px]">
      {/* Day headers */}
      <div className="grid sticky top-0 z-10 bg-background border-b" style={{ gridTemplateColumns: `60px repeat(7, 1fr)` }}>
        <div />
        {days.map((d, col) => {
          const isToday = isSameDay(d, today);
          return (
            <div key={col} className={`px-2 py-2 text-center border-l ${isToday ? "bg-accent/10" : ""}`}>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{DAY_LABELS[col]}</div>
              <div className={`text-sm font-medium ${isToday ? "text-accent-foreground" : ""}`}>{format(d, "MMM d")}</div>
            </div>
          );
        })}
      </div>

      {/* Body */}
      <div className="relative grid" style={{ gridTemplateColumns: `60px repeat(7, 1fr)` }}>
        {/* Time axis */}
        <div className="border-r">
          {Array.from({ length: ROWS }, (_, i) => {
            const totalMin = HOUR_START * 60 + i * SLOT_MINUTES;
            const showLabel = totalMin % 60 === 0;
            return (
              <div key={i} className="text-[10px] text-muted-foreground text-right pr-2" style={{ height: ROW_PX }}>
                {showLabel ? format(new Date(2000, 0, 1, Math.floor(totalMin / 60), totalMin % 60), "h a") : ""}
              </div>
            );
          })}
        </div>

        {/* Day columns */}
        {days.map((day, col) => {
          const isToday = isSameDay(day, today);
          const isPastDay = isBefore(day, today) && !isToday;
          const jsDow = clinicDayOfWeek(day);
          const dayKey = formatClinicDateKey(day);
          const daySchedules = schedules.filter((s) => s.day_of_week === jsDow && s.is_active);
          const dayBlocks = blocks.filter((b) => {
            const bStartKey = formatClinicDateKey(b.start_at);
            const bEndKey = formatClinicDateKey(b.end_at);
            return bStartKey <= dayKey && bEndKey >= dayKey;
          });
          const dayAppts = appts.filter((a) => isSameClinicDay(a.scheduled_at, day));

          return (
            <div key={col} className={`relative border-l ${isToday ? "bg-accent/5" : ""} ${isPastDay ? "bg-muted/20" : ""}`}>
              {/* Cells (interactive grid) */}
              {Array.from({ length: ROWS }, (_, row) => {
                const isDragHere =
                  dragPreview && dragPreview.col === col &&
                  row >= Math.min(dragPreview.startRow, dragPreview.endRow) &&
                  row <= Math.max(dragPreview.startRow, dragPreview.endRow);
                return (
                  <div
                    key={row}
                    onPointerDown={(e) => onCellPointerDown(col, row, day, e)}
                    onPointerEnter={() => onCellPointerEnter(col, row)}
                    onPointerUp={(e) => onCellPointerUp(col, row, day, e)}
                    className={`border-b border-border/30 ${
                      isPastDay || isPastWeek ? "cursor-not-allowed" : "cursor-cell hover:bg-accent/5"
                    } ${isDragHere ? "bg-accent/30" : ""}`}
                    style={{ height: ROW_PX }}
                  />
                );
              })}

              {/* Now line on today */}
              {isToday && nowMin >= HOUR_START * 60 && nowMin <= HOUR_END * 60 && (
                <div
                  className="absolute left-0 right-0 border-t-2 border-destructive z-20 pointer-events-none"
                  style={{ top: ((nowMin - HOUR_START * 60) / SLOT_MINUTES) * ROW_PX }}
                >
                  <div className="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-destructive" />
                </div>
              )}

              {/* Past overlay for today (cells before now) */}
              {isToday && nowMin > HOUR_START * 60 && (
                <div
                  className="absolute left-0 right-0 top-0 bg-muted/20 pointer-events-none"
                  style={{ height: Math.min(((nowMin - HOUR_START * 60) / SLOT_MINUTES) * ROW_PX, ROWS * ROW_PX) }}
                />
              )}

              {/* Available blocks */}
              {daySchedules.map((s) => {
                const startMin = minutesFromMidnight(s.start_time);
                const endMin = minutesFromMidnight(s.end_time);
                const top = ((startMin - HOUR_START * 60) / SLOT_MINUTES) * ROW_PX;
                const height = ((endMin - startMin) / SLOT_MINUTES) * ROW_PX;
                if (top + height < 0 || top > ROWS * ROW_PX) return null;
                return (
                  <button
                    key={s.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      onClickSchedule(s, { x: r.left + r.width / 2, y: r.top });
                    }}
                    className="absolute left-1 right-1 bg-accent/15 hover:bg-accent/25 border-l-4 border-accent rounded-r text-left p-1 overflow-hidden transition-colors"
                    style={{ top: Math.max(top, 0), height: Math.min(height, ROWS * ROW_PX - Math.max(top, 0)), zIndex: 1 }}
                  >
                    <div className="text-[10px] font-medium text-foreground/80">
                      {format(new Date(2000, 0, 1, Math.floor(startMin / 60), startMin % 60), "h:mma")}
                      –
                      {format(new Date(2000, 0, 1, Math.floor(endMin / 60), endMin % 60), "h:mma")}
                    </div>
                    <div className="flex flex-wrap gap-0.5 mt-0.5">
                      {s.service_lines.slice(0, 4).map((sl) => (
                        <span key={sl} className="text-[9px] px-1 py-0 rounded bg-accent/30 text-foreground/70">{SERVICE_LABEL[sl] || sl}</span>
                      ))}
                    </div>
                  </button>
                );
              })}

              {/* Time-off blocks */}
              {dayBlocks.map((b) => {
                const dayStart = clinicLocalToUtc(dayKey, 0);
                const dayEnd = clinicLocalToUtc(addClinicDays(dayKey, 1), 0);
                const bStart = parseISO(b.start_at);
                const bEnd = parseISO(b.end_at);
                const segStart = bStart < dayStart ? dayStart : bStart;
                const segEnd = bEnd > dayEnd ? dayEnd : bEnd;
                const startMin = clinicMinutesFromMidnight(segStart);
                const endMin =
                  segEnd.getTime() === dayEnd.getTime()
                    ? HOUR_END * 60
                    : clinicMinutesFromMidnight(segEnd);
                const top = ((startMin - HOUR_START * 60) / SLOT_MINUTES) * ROW_PX;
                const height = ((endMin - startMin) / SLOT_MINUTES) * ROW_PX;
                if (top + height < 0 || top > ROWS * ROW_PX) return null;
                return (
                  <button
                    key={b.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      onClickBlock(b, { x: r.left + r.width / 2, y: r.top });
                    }}
                    className="absolute left-1 right-1 rounded text-left p-1 overflow-hidden border border-muted-foreground/30"
                    style={{
                      top: Math.max(top, 0),
                      height: Math.min(height, ROWS * ROW_PX - Math.max(top, 0)),
                      backgroundImage: "repeating-linear-gradient(45deg,hsl(var(--muted-foreground)/.25) 0 4px,hsl(var(--muted)/.4) 4px 10px)",
                      zIndex: 2,
                    }}
                  >
                    <div className="text-[10px] font-medium text-muted-foreground">Time off</div>
                    {b.reason && <div className="text-[9px] text-muted-foreground italic truncate">{b.reason}</div>}
                  </button>
                );
              })}

              {/* Bookings */}
              {dayAppts.map((a) => {
                const aStart = parseISO(a.scheduled_at);
                const startMin = clinicMinutesFromMidnight(a.scheduled_at);
                const endMin = startMin + (a.duration_minutes || 30);
                const top = ((startMin - HOUR_START * 60) / SLOT_MINUTES) * ROW_PX;
                const height = ((endMin - startMin) / SLOT_MINUTES) * ROW_PX;
                if (top + height < 0 || top > ROWS * ROW_PX) return null;
                // Outside availability check
                const outside = !daySchedules.some((s) => {
                  const ss = minutesFromMidnight(s.start_time);
                  const se = minutesFromMidnight(s.end_time);
                  return startMin >= ss && endMin <= se && s.service_lines.includes(a.service_line);
                });
                return (
                  <Tooltip key={a.id}>
                    <TooltipTrigger asChild>
                      <Link
                        to={`/provider/appointments/${a.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute left-1 right-1 rounded p-1 overflow-hidden bg-primary text-primary-foreground border-l-4 border-primary hover:opacity-90 block"
                        style={{ top: Math.max(top, 0), height: Math.min(height, ROWS * ROW_PX - Math.max(top, 0)), zIndex: 3 }}
                      >
                        <div className="flex items-center gap-1 text-[10px] font-medium">
                          {outside && <AlertTriangle className="h-2.5 w-2.5 shrink-0" />}
                          {initials(a.patient_name)}
                          <span className="ml-auto px-1 rounded bg-primary-foreground/20 text-[9px]">
                            {SERVICE_LABEL[a.service_line] || a.service_line}
                          </span>
                        </div>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <div className="text-xs">
                        <div className="font-medium">{a.patient_name || "Unknown patient"}</div>
                        <div>{SERVICE_FULL[a.service_line] || a.service_line} · {formatClinicTime(a.scheduled_at)}</div>
                        <div className="text-muted-foreground capitalize">{a.status}</div>
                        {outside && <div className="text-destructive mt-1">⚠ Outside set availability</div>}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Editor popovers
// ─────────────────────────────────────────────────────────────────────────────

function PopoverShell({ anchor, children }: { anchor: { x: number; y: number }; children: React.ReactNode }) {
  // Position absolutely; clamp to viewport
  const left = Math.min(Math.max(anchor.x - 160, 8), window.innerWidth - 328);
  const top = Math.min(anchor.y + 8, window.innerHeight - 320);
  return (
    <div className="fixed z-[60] inset-0 pointer-events-none">
      <div className="absolute pointer-events-auto bg-popover border rounded-lg shadow-xl p-4 w-80" style={{ left, top }}>
        {children}
      </div>
    </div>
  );
}

interface CreatePopoverProps {
  anchor: { x: number; y: number };
  initialServices: string[];
  initialSlot: number;
  startMin: number; endMin: number;
  onCancel: () => void;
  onSave: (services: string[], slotMin: number) => void;
}
function CreatePopover({ anchor, initialServices, initialSlot, startMin, endMin, onCancel, onSave }: CreatePopoverProps) {
  const [services, setServices] = useState(initialServices);
  const [slot, setSlot] = useState(initialSlot);
  const toggle = (id: string) =>
    setServices((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]));

  return (
    <PopoverShell anchor={anchor}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">New availability</h3>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <p className="text-xs text-muted-foreground">
          {format(new Date(2000, 0, 1, Math.floor(startMin / 60), startMin % 60), "h:mm a")} – {format(new Date(2000, 0, 1, Math.floor(endMin / 60), endMin % 60), "h:mm a")}
          <span className="ml-2 italic">(repeats weekly)</span>
        </p>

        <div>
          <Label className="text-xs">Services</Label>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {SERVICE_LINES.map((sl) => (
              <button
                key={sl.id}
                onClick={() => toggle(sl.id)}
                className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                  services.includes(sl.id)
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-background border-border hover:border-accent/50"
                }`}
              >
                {sl.full}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-xs">Slot length</Label>
          <RadioGroup value={String(slot)} onValueChange={(v) => setSlot(Number(v))} className="flex gap-3 mt-1.5">
            {[15, 30, 45, 60].map((m) => (
              <label key={m} className="flex items-center gap-1.5 text-xs cursor-pointer">
                <RadioGroupItem value={String(m)} /> {m}m
              </label>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
          <Button size="sm" onClick={() => services.length ? onSave(services, slot) : toast.error("Pick at least one service")}>Save</Button>
        </div>
      </div>
    </PopoverShell>
  );
}

function EditSchedulePopover({ anchor, schedule, onCancel, onSave, onDelete }: {
  anchor: { x: number; y: number }; schedule: Schedule;
  onCancel: () => void; onSave: (patch: Partial<Schedule>) => void; onDelete: () => void;
}) {
  const [start, setStart] = useState(schedule.start_time.slice(0, 5));
  const [end, setEnd] = useState(schedule.end_time.slice(0, 5));
  const [services, setServices] = useState<string[]>(schedule.service_lines);
  const [slot, setSlot] = useState(schedule.slot_minutes);
  const toggle = (id: string) =>
    setServices((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]));

  return (
    <PopoverShell anchor={anchor}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">Edit availability ({DAY_LABELS[dowToCol(schedule.day_of_week)]})</h3>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label className="text-xs">Start</Label><Input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></div>
          <div><Label className="text-xs">End</Label><Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
        </div>
        <div>
          <Label className="text-xs">Services</Label>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {SERVICE_LINES.map((sl) => (
              <button
                key={sl.id}
                onClick={() => toggle(sl.id)}
                className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                  services.includes(sl.id) ? "bg-accent text-accent-foreground border-accent" : "bg-background border-border hover:border-accent/50"
                }`}
              >{sl.full}</button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-xs">Slot length</Label>
          <RadioGroup value={String(slot)} onValueChange={(v) => setSlot(Number(v))} className="flex gap-3 mt-1.5">
            {[15, 30, 45, 60].map((m) => (
              <label key={m} className="flex items-center gap-1.5 text-xs cursor-pointer">
                <RadioGroupItem value={String(m)} /> {m}m
              </label>
            ))}
          </RadioGroup>
        </div>
        <div className="flex justify-between pt-1">
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
            <Button size="sm" onClick={() => onSave({
              start_time: start + ":00", end_time: end + ":00", service_lines: services, slot_minutes: slot,
            })}>Save</Button>
          </div>
        </div>
      </div>
    </PopoverShell>
  );
}

function EditBlockPopover({ anchor, block, onCancel, onDelete }: {
  anchor: { x: number; y: number }; block: Block;
  onCancel: () => void; onDelete: () => void;
}) {
  return (
    <PopoverShell anchor={anchor}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">Time off</h3>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <p className="text-xs text-muted-foreground">
          {format(parseISO(block.start_at), "MMM d, h:mm a")} – {format(parseISO(block.end_at), "MMM d, h:mm a")}
        </p>
        {block.reason && <p className="text-sm">Reason: <span className="italic">{block.reason}</span></p>}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>Close</Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-1" /> Remove
          </Button>
        </div>
      </div>
    </PopoverShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Block-off modal
// ─────────────────────────────────────────────────────────────────────────────

function TimeOffModal({ open, onOpenChange, onCreate }: {
  open: boolean; onOpenChange: (b: boolean) => void;
  onCreate: (startISO: string, endISO: string, reason: string | null) => void;
}) {
  const defaultStart = format(new Date(), "yyyy-MM-dd'T'HH:mm");
  const defaultEnd = format(addDays(new Date(), 0).setHours(23, 59) as any || new Date(), "yyyy-MM-dd'T'HH:mm");
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      const now = new Date();
      setStart(formatClinicDatetimeLocal(now));
      setEnd(formatClinicDatetimeLocal(clinicLocalToUtc(formatClinicDateKey(now), 23 * 60 + 59)));
      setReason("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Block off time</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-xs">Start</Label><Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} /></div>
          <div><Label className="text-xs">End</Label><Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
          <div><Label className="text-xs">Reason (optional)</Label><Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Vacation, training, lunch…" /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => {
            if (!start || !end) return toast.error("Pick start and end");
            onCreate(parseClinicDatetimeLocal(start).toISOString(), parseClinicDatetimeLocal(end).toISOString(), reason || null);
          }}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
