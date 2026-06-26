import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import MyScheduleManager from "@/components/provider/MyScheduleManager";
import { getStaffHomeLabel, getStaffPortalLoginPath } from "@/lib/staffPortalRouting";
import { getSchedulePortalHome, mainSiteUrl } from "@/lib/schedulePortalHost";
import { patientNameEmailPhoneOrFilter } from "@/lib/patientSearch";
import {
  addClinicDays,
  clinicLocalToUtc,
  clinicMinutesFromMidnight,
  formatClinicDate,
  formatClinicDateKey,
  formatClinicTime,
} from "@/lib/clinicTime";
import { addDays, format, isSameDay, isToday, startOfDay, startOfWeek } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import {
  Loader2, ChevronLeft, ChevronRight, Search, Printer, Plus, MoreVertical,
  CalendarIcon, X, Phone, FileText, AlertTriangle, RefreshCw, ArrowLeft,
} from "lucide-react";
import {
  Provider, ProviderSchedule, ScheduleBlock, ScheduleException, Appointment,
  SERVICE_LINES, SERVICE_LABEL, SERVICE_FULL, STATUS_STYLES,
  HOUR_START, HOUR_END, SLOT_MINUTES, ROWS, ROW_PX,
} from "@/components/scheduling/types";
import {
  coverageForDate, blocksForDate, isSlotCovered, isSlotBlocked,
  formatHourLabel, initials, snap30, minutesToHHMM,
} from "@/components/scheduling/timeMath";
import LabCorpPortalLink from "@/components/provider/LabCorpPortalLink";

type ViewMode = "day" | "week" | "print";

interface PatientLite { id: string; full_name: string; phone: string | null; email: string | null; }

const STATUS_OPTIONS = [
  { v: "scheduled", label: "Booked" },
  { v: "checked_in", label: "Checked-in" },
  { v: "in_progress", label: "In progress" },
  { v: "completed", label: "Completed" },
  { v: "no_show", label: "No-show" },
  { v: "cancelled", label: "Cancelled" },
];

type ScheduleTab = "calendar" | "hours";

export interface OfficeScheduleProps {
  /** Standalone calendar portal — no clinical dashboard chrome */
  portalMode?: boolean;
  loginPath?: string;
}

export default function OfficeSchedule({ portalMode = false, loginPath = "/admin/login" }: OfficeScheduleProps) {
  const { user, isProvider, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: ScheduleTab = searchParams.get("tab") === "hours" ? "hours" : "calendar";
  const setActiveTab = (tab: ScheduleTab) => {
    if (tab === "calendar") {
      searchParams.delete("tab");
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ tab }, { replace: true });
    }
  };
  const [view, setView] = useState<ViewMode>("day");
  const [date, setDate] = useState<Date>(startOfDay(new Date()));
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [schedules, setSchedules] = useState<ProviderSchedule[]>([]);
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [exceptions, setExceptions] = useState<ScheduleException[]>([]);
  const [appts, setAppts] = useState<Appointment[]>([]);

  // Filters
  const [hiddenProviders, setHiddenProviders] = useState<Set<string>>(new Set());
  const [hiddenServices, setHiddenServices] = useState<Set<string>>(new Set());
  const [hiddenStatuses, setHiddenStatuses] = useState<Set<string>>(new Set(["cancelled"]));
  const [search, setSearch] = useState("");
  const [hoursProviderId, setHoursProviderId] = useState<string>("");

  // UI state
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [newApptCtx, setNewApptCtx] = useState<{ providerId: string; date: Date; startMin: number } | null>(null);
  const [staffEmail, setStaffEmail] = useState<string | undefined>();
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [rescheduleConfirm, setRescheduleConfirm] = useState<{
    appt: Appointment;
    newProviderId: string;
    newScheduledAt: Date;
    conflict: Appointment | null;
  } | null>(null);

  const staffHomePath = getStaffPortalLoginPath(staffEmail);
  const staffHomeLabel = getStaffHomeLabel(staffEmail);

  // Role gate
  useEffect(() => {
    if (authLoading) return;
    const nextPath = portalMode ? getSchedulePortalHome() : "/office/schedule";
    if (!user) {
      navigate(`${loginPath}?next=${encodeURIComponent(nextPath)}`, { replace: portalMode });
      return;
    }
    setStaffEmail(user.email ?? undefined);
    if (!isProvider) { navigate("/patient/dashboard"); return; }
  }, [user, isProvider, authLoading, navigate, portalMode, loginPath]);

  // Date range to fetch
  const range = useMemo(() => {
    if (view === "week") {
      const start = startOfWeek(date, { weekStartsOn: 1 });
      return { start, end: addDays(start, 7) };
    }
    return { start: startOfDay(date), end: addDays(startOfDay(date), 1) };
  }, [view, date]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const firstKey = formatClinicDateKey(range.start);
    const lastKey = formatClinicDateKey(addDays(range.end, -1));
    const startISO = clinicLocalToUtc(firstKey, 0).toISOString();
    const endISO = clinicLocalToUtc(addClinicDays(lastKey, 1), 0).toISOString();
    try {
      const [provRes, schedRes, blockRes, exRes, apptRes] = await Promise.all([
        supabase.rpc("get_providers_directory"),
        supabase.from("provider_schedules").select("*"),
        supabase.from("schedule_blocks").select("*").lt("start_at", endISO).gt("end_at", startISO),
        supabase.from("schedule_exceptions").select("*")
          .gte("exception_date", firstKey)
          .lt("exception_date", addClinicDays(lastKey, 1)),
        supabase.from("appointments")
          .select("id,provider_id,patient_id,scheduled_at,duration_minutes,service_line,status,notes,is_telehealth,iv_drip_booking_id,consultation_booking_id,patients(full_name,phone)")
          .gte("scheduled_at", startISO).lt("scheduled_at", endISO)
          .order("scheduled_at"),
      ]);
      if (provRes.error) console.warn("providers", provRes.error);
      setProviders((provRes.data as any) || []);
      setSchedules((schedRes.data as any) || []);
      setBlocks((blockRes.data as any) || []);
      setExceptions((exRes.data as any) || []);
      setAppts(((apptRes.data as any) || []).map((a: any) => ({
        ...a,
        patient_name: a.patients?.full_name ?? null,
        patient_phone: a.patients?.phone ?? null,
      })));
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to load schedule");
    } finally {
      setLoading(false);
    }
  }, [range.start.getTime(), range.end.getTime()]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (providers.length > 0 && !hoursProviderId) {
      setHoursProviderId(providers[0].user_id);
    }
  }, [providers, hoursProviderId]);

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel("office-schedule")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "iv_drip_bookings" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "consultation_bookings" }, () => fetchAll())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchAll]);

  const visibleProviders = useMemo(
    () => providers.filter((p) => !hiddenProviders.has(p.user_id)),
    [providers, hiddenProviders]
  );

  const filteredAppts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return appts.filter((a) => {
      if (a.provider_id && hiddenProviders.has(a.provider_id)) return false;
      if (hiddenServices.has(a.service_line)) return false;
      if (hiddenStatuses.has(a.status)) return false;
      return true;
    }).map((a) => ({
      ...a,
      _matchesSearch: !!q && (
        (a.patient_name?.toLowerCase().includes(q)) ||
        (a.patient_phone?.toLowerCase().includes(q))
      ),
    }));
  }, [appts, hiddenProviders, hiddenServices, hiddenStatuses, search]);

  // ── Helpers ─────────────────────────────────────────────────────────────
  const getProviderColor = (pid: string | null) =>
    providers.find((p) => p.user_id === pid)?.color ?? "hsl(var(--muted-foreground))";
  const getProviderName = (pid: string | null) =>
    providers.find((p) => p.user_id === pid)?.display_name ?? "Unassigned";

  const findConflict = (providerId: string, scheduledAt: Date, durationMin: number, exceptId: string): Appointment | null => {
    const start = scheduledAt.getTime();
    const end = start + durationMin * 60000;
    return appts.find((a) => {
      if (a.id === exceptId) return false;
      if (a.provider_id !== providerId) return false;
      if (a.status === "cancelled" || a.status === "no_show") return false;
      const aStart = new Date(a.scheduled_at).getTime();
      const aEnd = aStart + a.duration_minutes * 60000;
      return start < aEnd && end > aStart;
    }) || null;
  };

  const updateStatus = async (apptId: string, status: string) => {
    const patch: any = { status };
    if (status === "checked_in") patch.check_in_at = new Date().toISOString();
    if (status === "completed")  patch.check_out_at = new Date().toISOString();
    const { error } = await supabase.from("appointments").update(patch).eq("id", apptId);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${STATUS_OPTIONS.find((s) => s.v === status)?.label.toLowerCase()}`);
    fetchAll();
    setSelectedAppt(null);
  };

  const sendReminder = async (a: Appointment) => {
    try {
      await supabase.functions.invoke("send-appointment-reminder", { body: { appointment_id: a.id } });
      toast.success("Reminder sent");
    } catch (e: any) { toast.error("Failed to send reminder"); }
  };

  const performReschedule = async (override: boolean) => {
    if (!rescheduleConfirm) return;
    const { appt, newProviderId, newScheduledAt, conflict } = rescheduleConfirm;
    if (conflict && !override) return;
    const { error } = await supabase.from("appointments").update({
      provider_id: newProviderId,
      scheduled_at: newScheduledAt.toISOString(),
    }).eq("id", appt.id);
    if (error) return toast.error(error.message);
    toast.success("Rescheduled");
    try {
      await supabase.functions.invoke("send-reschedule-notification", {
        body: {
          appointment_id: appt.id,
          patient_name: appt.patient_name,
          patient_phone: appt.patient_phone,
          new_scheduled_at: newScheduledAt.toISOString(),
          new_provider_name: getProviderName(newProviderId),
        },
      });
    } catch {}
    setRescheduleConfirm(null);
    fetchAll();
  };

  // ── Render guards ────────────────────────────────────────────────────────
  if (authLoading || !user) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  if (activeTab === "hours") {
    return (
      <div className={`${portalMode ? "h-full flex flex-col min-h-0" : "min-h-screen"} bg-background`}>
        <div className="sticky top-0 z-30 bg-background border-b border-border shrink-0">
          <div className="px-4 py-3 flex flex-wrap items-center gap-3">
            {!portalMode && (
              <Button variant="outline" size="sm" asChild className="gap-1.5">
                <Link to={staffHomePath}>
                  <ArrowLeft className="h-4 w-4" />
                  {staffHomeLabel}
                </Link>
              </Button>
            )}
            <ScheduleTabBar activeTab={activeTab} onTabChange={setActiveTab} portalMode={portalMode} />
            <div className="flex-1" />
            {providers.length > 0 && (
              <select
                className="text-sm border border-border rounded-md px-2 py-1.5 bg-background"
                value={hoursProviderId}
                onChange={(e) => setHoursProviderId(e.target.value)}
                aria-label="Provider whose hours to edit"
              >
                {providers.map((p) => (
                  <option key={p.user_id} value={p.user_id}>{p.display_name}</option>
                ))}
              </select>
            )}
            <LabCorpPortalLink variant="icon" />
          </div>
        </div>
        <div className={`${portalMode ? "flex-1 overflow-auto" : ""} container mx-auto px-4 py-6`}>
          <MyScheduleManager providerId={hoursProviderId || null} />
        </div>
      </div>
    );
  }

  return (
    <div className={`${portalMode ? "h-full flex flex-col min-h-0" : "min-h-screen"} bg-background print:bg-white`}>
      {/* Toolbar */}
      <div className="sticky top-0 z-30 bg-background border-b border-border print:hidden shrink-0">
        <div className="px-4 py-3 flex flex-wrap items-center gap-3">
          {!portalMode && (
            <Button variant="outline" size="sm" asChild className="gap-1.5 shrink-0">
              <Link to={staffHomePath}>
                <ArrowLeft className="h-4 w-4" />
                {staffHomeLabel}
              </Link>
            </Button>
          )}
          <ScheduleTabBar activeTab={activeTab} onTabChange={setActiveTab} portalMode={portalMode} />
          {/* View toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["day","week","print"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-sm capitalize transition ${view === v ? "bg-primary text-primary-foreground" : "hover:bg-accent/30"}`}
              >
                {v === "print" ? "Print view" : v}
              </button>
            ))}
          </div>

          {/* Date nav */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setDate((d) => addDays(d, view === "week" ? -7 : -1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDate(startOfDay(new Date()))}>Today</Button>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 min-w-[180px] justify-center">
                  <CalendarIcon className="h-4 w-4" />
                  {view === "week"
                    ? `Week of ${format(startOfWeek(date, { weekStartsOn: 1 }), "MMM d")}`
                    : format(date, "EEE, MMM d, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={(d) => { if (d) { setDate(startOfDay(d)); setDatePickerOpen(false); } }} />
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="icon" onClick={() => setDate((d) => addDays(d, view === "week" ? 7 : 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient or phone…"
              className="pl-8 w-56 h-9"
            />
          </div>
          <LabCorpPortalLink variant="icon" />
          <Button variant="ghost" size="icon" onClick={() => fetchAll()} title="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          {view === "print" && (
            <Button variant="outline" onClick={() => window.print()} className="gap-2">
              <Printer className="h-4 w-4" /> Print
            </Button>
          )}
          <Button onClick={() => setWalkInOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Walk-in
          </Button>
        </div>

        {/* Filter chips */}
        <div className="px-4 pb-3 flex flex-wrap gap-2 text-xs">
          <span className="text-muted-foreground py-1">Providers:</span>
          {providers.map((p) => {
            const hidden = hiddenProviders.has(p.user_id);
            return (
              <button
                key={p.user_id}
                onClick={() => setHiddenProviders((s) => { const n = new Set(s); n.has(p.user_id) ? n.delete(p.user_id) : n.add(p.user_id); return n; })}
                className={`px-2 py-1 rounded-full border transition flex items-center gap-1.5 ${hidden ? "opacity-40 border-dashed" : ""}`}
                style={{ borderColor: p.color, color: hidden ? undefined : p.color }}
              >
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: p.color }} />
                {p.display_name}
              </button>
            );
          })}
          <span className="text-muted-foreground py-1 ml-2">Service:</span>
          {SERVICE_LINES.map((s) => {
            const hidden = hiddenServices.has(s.id);
            return (
              <button
                key={s.id}
                onClick={() => setHiddenServices((set) => { const n = new Set(set); n.has(s.id) ? n.delete(s.id) : n.add(s.id); return n; })}
                className={`px-2 py-1 rounded-full border ${hidden ? "opacity-40 border-dashed" : "bg-secondary"}`}
              >
                {s.full}
              </button>
            );
          })}
          <span className="text-muted-foreground py-1 ml-2">Status:</span>
          {STATUS_OPTIONS.map((s) => {
            const hidden = hiddenStatuses.has(s.v);
            return (
              <button
                key={s.v}
                onClick={() => setHiddenStatuses((set) => { const n = new Set(set); n.has(s.v) ? n.delete(s.v) : n.add(s.v); return n; })}
                className={`px-2 py-1 rounded-full border ${hidden ? "opacity-40 border-dashed" : "bg-secondary"}`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty providers warning */}
      {!loading && providers.length === 0 && (
        <div className="m-4 p-4 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-sm">
          <strong>No providers configured.</strong> Assign the <em>provider</em> role to clinicians from the user
          settings page so they appear in the multi-column grid.
        </div>
      )}

      {/* Grid */}
      <div className={`p-4 print:p-0 ${portalMode ? "flex-1 overflow-auto min-h-0" : ""}`}>
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : view === "day" ? (
          <DayView
            date={date}
            providers={visibleProviders}
            schedules={schedules}
            blocks={blocks}
            exceptions={exceptions}
            appts={filteredAppts}
            search={search}
            onApptClick={setSelectedAppt}
            onEmptyCellClick={(providerId, startMin) => setNewApptCtx({ providerId, date, startMin })}
            onApptDrop={(appt, newProviderId, newScheduledAt) => {
              const conflict = findConflict(newProviderId, newScheduledAt, appt.duration_minutes, appt.id);
              setRescheduleConfirm({ appt, newProviderId, newScheduledAt, conflict });
            }}
          />
        ) : view === "week" ? (
          <WeekView
            date={date}
            providers={visibleProviders}
            appts={filteredAppts}
            getProviderColor={getProviderColor}
            onApptClick={setSelectedAppt}
            onApptDrop={(appt, newDate) => {
              const conflict = findConflict(appt.provider_id!, newDate, appt.duration_minutes, appt.id);
              setRescheduleConfirm({ appt, newProviderId: appt.provider_id!, newScheduledAt: newDate, conflict });
            }}
          />
        ) : (
          <PrintView date={date} providers={visibleProviders} appts={filteredAppts} />
        )}
      </div>

      {/* Detail drawer */}
      <ApptDrawer
        appt={selectedAppt}
        providerName={selectedAppt ? getProviderName(selectedAppt.provider_id) : ""}
        onClose={() => setSelectedAppt(null)}
        onUpdateStatus={updateStatus}
        onSendReminder={sendReminder}
        onViewPatient={(pid) => {
          const url = `/provider/dashboard?patient=${pid}`;
          if (portalMode) {
            window.open(mainSiteUrl(url), "_blank", "noopener,noreferrer");
          } else {
            navigate(url);
          }
        }}
      />

      {/* New appointment / walk-in modal */}
      {(newApptCtx || walkInOpen) && (
        <NewAppointmentModal
          ctx={newApptCtx}
          isWalkIn={walkInOpen}
          providers={providers}
          onClose={() => { setNewApptCtx(null); setWalkInOpen(false); }}
          onCreated={() => { setNewApptCtx(null); setWalkInOpen(false); fetchAll(); }}
          findConflict={findConflict}
        />
      )}

      {/* Reschedule confirmation */}
      <Dialog open={!!rescheduleConfirm} onOpenChange={(o) => !o && setRescheduleConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm reschedule</DialogTitle></DialogHeader>
          {rescheduleConfirm && (
            <div className="space-y-3 text-sm">
              <p>
                Move <strong>{rescheduleConfirm.appt.patient_name ?? "patient"}</strong> from{" "}
                <strong>{formatClinicDate(rescheduleConfirm.appt.scheduled_at)} {formatClinicTime(rescheduleConfirm.appt.scheduled_at)}</strong>{" "}
                to <strong>{formatClinicDate(rescheduleConfirm.newScheduledAt)} {formatClinicTime(rescheduleConfirm.newScheduledAt)}</strong>
                {rescheduleConfirm.appt.provider_id !== rescheduleConfirm.newProviderId && (
                  <> with <strong>{getProviderName(rescheduleConfirm.newProviderId)}</strong></>
                )}?
              </p>
              {rescheduleConfirm.conflict && (
                <div className="p-3 rounded-md border border-red-300 bg-red-50 text-red-900 flex gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div>
                    Overlaps with <strong>{rescheduleConfirm.conflict.patient_name}</strong> at{" "}
                    {formatClinicTime(rescheduleConfirm.conflict.scheduled_at)}.
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">An SMS will notify the patient if a phone number is on file.</p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setRescheduleConfirm(null)}>Cancel</Button>
            {rescheduleConfirm?.conflict ? (
              <Button variant="destructive" onClick={() => performReschedule(true)}>Override conflict</Button>
            ) : (
              <Button onClick={() => performReschedule(false)}>Confirm</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PrintStyles />
    </div>
  );
}

function ScheduleTabBar({
  activeTab,
  onTabChange,
  portalMode = false,
}: {
  activeTab: ScheduleTab;
  onTabChange: (tab: ScheduleTab) => void;
  portalMode?: boolean;
}) {
  return (
    <div className="flex rounded-lg border border-border overflow-hidden mr-1">
      <button
        type="button"
        onClick={() => onTabChange("calendar")}
        className={`px-3 py-1.5 text-sm transition ${activeTab === "calendar" ? "bg-primary text-primary-foreground" : "hover:bg-accent/30"}`}
      >
        {portalMode ? "Calendar" : "Office calendar"}
      </button>
      <button
        type="button"
        onClick={() => onTabChange("hours")}
        className={`px-3 py-1.5 text-sm transition ${activeTab === "hours" ? "bg-primary text-primary-foreground" : "hover:bg-accent/30"}`}
      >
        My hours
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Day view
// ════════════════════════════════════════════════════════════════════════════
function DayView(props: {
  date: Date;
  providers: Provider[];
  schedules: ProviderSchedule[];
  blocks: ScheduleBlock[];
  exceptions: ScheduleException[];
  appts: (Appointment & { _matchesSearch?: boolean })[];
  search: string;
  onApptClick: (a: Appointment) => void;
  onEmptyCellClick: (providerId: string, startMin: number) => void;
  onApptDrop: (a: Appointment, providerId: string, newDate: Date) => void;
}) {
  const { date, providers, schedules, blocks, exceptions, appts, onApptClick, onEmptyCellClick, onApptDrop } = props;
  const slots = useMemo(() => Array.from({ length: ROWS }, (_, i) => HOUR_START * 60 + i * SLOT_MINUTES), []);
  const totalH = ROWS * ROW_PX;
  const nowMinutes = isToday(date)
    ? clinicMinutesFromMidnight(new Date())
    : -1;
  const nowOffset = nowMinutes >= HOUR_START * 60 && nowMinutes < HOUR_END * 60
    ? ((nowMinutes - HOUR_START * 60) / SLOT_MINUTES) * ROW_PX
    : null;

  const colRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ apptId: string; offsetY: number } | null>(null);

  if (providers.length === 0) {
    return <div className="text-center py-12 text-muted-foreground text-sm">No providers visible.</div>;
  }

  return (
    <div className="border border-border rounded-lg overflow-x-auto bg-card">
      <div className="grid" style={{ gridTemplateColumns: `60px repeat(${providers.length}, minmax(180px, 1fr))` }}>
        {/* Header row */}
        <div className="border-b border-border bg-muted/30" />
        {providers.map((p) => (
          <div key={p.user_id} className="border-b border-l border-border p-2 flex items-center gap-2 bg-muted/30">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ background: p.color }}>
              {initials(p.display_name)}
            </div>
            <div className="text-sm font-medium truncate">{p.display_name}</div>
          </div>
        ))}

        {/* Time axis + cells */}
        <div className="relative" style={{ height: totalH }}>
          {slots.map((m, i) => (
            <div key={m} className="absolute left-0 right-0 text-[10px] text-muted-foreground pr-1 text-right border-t border-border/40"
              style={{ top: i * ROW_PX, height: ROW_PX }}>
              {m % 60 === 0 && formatHourLabel(m)}
            </div>
          ))}
        </div>
        {providers.map((p) => {
          const coverage = coverageForDate(date, p.user_id, schedules, exceptions);
          const blocksToday = blocksForDate(date, p.user_id, blocks);
          const providerAppts = appts.filter((a) => a.provider_id === p.user_id);

          return (
            <div
              key={p.user_id}
              ref={colRef}
              className="relative border-l border-border"
              style={{ height: totalH }}
              onDragOver={(e) => { if (drag) e.preventDefault(); }}
              onDrop={(e) => {
                if (!drag) return;
                e.preventDefault();
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                const yInCol = e.clientY - rect.top - drag.offsetY;
                const minutesIn = snap30(Math.max(0, (yInCol / ROW_PX) * SLOT_MINUTES));
                const totalMin = HOUR_START * 60 + minutesIn;
                const newDate = clinicLocalToUtc(formatClinicDateKey(date), totalMin);
                const appt = appts.find((a) => a.id === drag.apptId);
                if (appt) onApptDrop(appt, p.user_id, newDate);
                setDrag(null);
              }}
            >
              {/* Slot grid */}
              {slots.map((m, i) => {
                const cov = isSlotCovered(m, coverage);
                const blk = isSlotBlocked(m, blocksToday);
                const past = nowMinutes >= 0 && m < nowMinutes;
                let bg = "bg-muted/15"; // unavailable
                let cursor = "default";
                let label = "";
                if (blk) { bg = "bg-[repeating-linear-gradient(45deg,_hsl(var(--muted))_0,_hsl(var(--muted))_4px,_transparent_4px,_transparent_8px)]"; label = "Time off"; }
                else if (cov) { bg = past ? "bg-accent/[0.03]" : "bg-accent/[0.06]"; cursor = "cell"; }
                return (
                  <div
                    key={m}
                    title={label || (cov ? "Available — click to book" : "Unavailable")}
                    onClick={() => { if (cov && !blk) onEmptyCellClick(p.user_id, m); }}
                    className={`absolute left-0 right-0 border-t border-border/30 ${bg} ${past ? "opacity-60" : ""}`}
                    style={{ top: i * ROW_PX, height: ROW_PX, cursor }}
                  />
                );
              })}

              {/* Appointments */}
              {providerAppts.map((a) => {
                const start = new Date(a.scheduled_at);
                const startMin = clinicMinutesFromMidnight(a.scheduled_at);
                const top = ((startMin - HOUR_START * 60) / SLOT_MINUTES) * ROW_PX;
                const height = (a.duration_minutes / SLOT_MINUTES) * ROW_PX;
                if (top < 0 || top > totalH) return null;
                const style = STATUS_STYLES[a.status] || STATUS_STYLES.scheduled;
                const isPast = nowMinutes >= 0 && startMin + a.duration_minutes < nowMinutes;
                return (
                  <div
                    key={a.id}
                    draggable
                    onDragStart={(e) => {
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      setDrag({ apptId: a.id, offsetY: e.clientY - rect.top });
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onClick={(e) => { e.stopPropagation(); onApptClick(a); }}
                    className={`absolute left-1 right-1 rounded px-1.5 py-1 text-xs cursor-grab active:cursor-grabbing shadow-sm overflow-hidden ${style.bg} ${isPast ? "opacity-70" : ""} ${a._matchesSearch ? "ring-2 ring-amber-400 ring-offset-1" : ""}`}
                    style={{ top: top + 1, height: Math.max(height - 2, 22) }}
                    title={`${a.patient_name} — ${SERVICE_FULL[a.service_line] ?? a.service_line} (${style.label})`}
                  >
                    <div className="font-medium truncate">{a.patient_name?.split(" ").slice(-1)[0] ?? "Patient"}</div>
                    <div className="opacity-90 text-[10px] truncate">{SERVICE_LABEL[a.service_line] ?? a.service_line} · {formatClinicTime(start)}</div>
                  </div>
                );
              })}

              {/* Now line */}
              {nowOffset !== null && (
                <div className="absolute left-0 right-0 border-t-2 border-red-500 z-10 pointer-events-none" style={{ top: nowOffset }}>
                  <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-red-500" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Week view
// ════════════════════════════════════════════════════════════════════════════
function WeekView(props: {
  date: Date;
  providers: Provider[];
  appts: (Appointment & { _matchesSearch?: boolean })[];
  getProviderColor: (pid: string | null) => string;
  onApptClick: (a: Appointment) => void;
  onApptDrop: (a: Appointment, newDate: Date) => void;
}) {
  const { date, providers, appts, getProviderColor, onApptClick, onApptDrop } = props;
  const weekStart = useMemo(() => startOfWeek(date, { weekStartsOn: 1 }), [date]);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const [drag, setDrag] = useState<string | null>(null);

  const apptsByDay = useMemo(() => {
    const m = new Map<string, typeof appts>();
    days.forEach((d) => m.set(formatClinicDateKey(d), []));
    appts.forEach((a) => {
      const k = formatClinicDateKey(a.scheduled_at);
      if (m.has(k)) m.get(k)!.push(a);
    });
    return m;
  }, [appts, days]);

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <div className="grid grid-cols-7">
        {days.map((d) => (
          <div key={d.toISOString()} className={`p-2 border-b border-l border-border first:border-l-0 text-center ${isToday(d) ? "bg-accent/20" : "bg-muted/20"}`}>
            <div className="text-[10px] uppercase text-muted-foreground">{format(d, "EEE")}</div>
            <div className="text-sm font-medium">{format(d, "MMM d")}</div>
          </div>
        ))}
        {days.map((d) => {
          const list = (apptsByDay.get(formatClinicDateKey(d)) || []).sort(
            (a, b) => +new Date(a.scheduled_at) - +new Date(b.scheduled_at)
          );
          return (
            <div
              key={"col-"+d.toISOString()}
              className="border-l border-border first:border-l-0 min-h-[260px] p-1.5 space-y-1"
              onDragOver={(e) => { if (drag) e.preventDefault(); }}
              onDrop={(e) => {
                if (!drag) return;
                e.preventDefault();
                const appt = appts.find((a) => a.id === drag);
                if (!appt) return;
                const oldMin = clinicMinutesFromMidnight(appt.scheduled_at);
                const newDate = clinicLocalToUtc(formatClinicDateKey(d), oldMin);
                onApptDrop(appt, newDate);
                setDrag(null);
              }}
            >
              {list.length === 0 && <div className="text-[10px] text-muted-foreground text-center pt-4">—</div>}
              {list.map((a) => {
                const style = STATUS_STYLES[a.status] || STATUS_STYLES.scheduled;
                return (
                  <div
                    key={a.id}
                    draggable
                    onDragStart={() => setDrag(a.id)}
                    onClick={() => onApptClick(a)}
                    className={`text-[11px] px-1.5 py-1 rounded cursor-pointer shadow-sm border-l-[3px] ${style.bg} ${a._matchesSearch ? "ring-2 ring-amber-400" : ""}`}
                    style={{ borderLeftColor: getProviderColor(a.provider_id) }}
                    title={`${a.patient_name} — ${SERVICE_FULL[a.service_line]}`}
                  >
                    <div className="font-medium truncate">
                      {formatClinicTime(a.scheduled_at)} {a.patient_name?.split(" ").slice(-1)[0] ?? "?"}
                    </div>
                    <div className="text-[10px] opacity-80 truncate">{SERVICE_LABEL[a.service_line]}</div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Print view
// ════════════════════════════════════════════════════════════════════════════
function PrintView({ date, providers, appts }: { date: Date; providers: Provider[]; appts: Appointment[] }) {
  return (
    <div className="max-w-[8.5in] mx-auto bg-white text-black p-6 print:p-0">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold">Daily Huddle</h1>
        <p className="text-sm text-gray-600">{format(date, "EEEE, MMMM d, yyyy")}</p>
      </div>
      {providers.map((p) => {
        const list = appts
          .filter((a) => a.provider_id === p.user_id)
          .sort((a, b) => +new Date(a.scheduled_at) - +new Date(b.scheduled_at));
        return (
          <section key={p.user_id} className="mb-6 break-inside-avoid">
            <div className="flex items-center gap-2 border-b border-gray-400 pb-1 mb-2">
              <div className="w-6 h-6 rounded-full text-white text-[10px] flex items-center justify-center" style={{ background: p.color }}>
                {initials(p.display_name)}
              </div>
              <h2 className="text-base font-semibold">{p.display_name}</h2>
              <span className="text-xs text-gray-600 ml-auto">{list.length} appt{list.length !== 1 ? "s" : ""}</span>
            </div>
            {list.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No appointments scheduled.</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-1 w-20">Time</th>
                    <th>Patient</th>
                    <th className="w-32">Service</th>
                    <th className="w-16">Min</th>
                    <th className="w-24">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((a) => (
                    <tr key={a.id} className="border-b border-gray-200">
                      <td className="py-1.5 font-mono">{formatClinicTime(a.scheduled_at)}</td>
                      <td>{a.patient_name ?? "Unknown"}</td>
                      <td>{SERVICE_FULL[a.service_line] ?? a.service_line}</td>
                      <td>{a.duration_minutes}</td>
                      <td className="capitalize">{a.status.replace("_", " ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        );
      })}
      {providers.length === 0 && <p className="text-center text-gray-500">No providers configured.</p>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Detail drawer
// ════════════════════════════════════════════════════════════════════════════
function ApptDrawer(props: {
  appt: Appointment | null;
  providerName: string;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onSendReminder: (a: Appointment) => void;
  onViewPatient: (pid: string) => void;
}) {
  const { appt, providerName, onClose, onUpdateStatus, onSendReminder, onViewPatient } = props;
  return (
    <Sheet open={!!appt} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        {appt && (() => {
          const style = STATUS_STYLES[appt.status] || STATUS_STYLES.scheduled;
          const start = new Date(appt.scheduled_at);
          return (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {appt.patient_name ?? "Unknown patient"}
                  <Badge className={style.bg}>{style.label}</Badge>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">When</div>
                  <div className="font-medium">{format(start, "EEEE, MMM d · h:mm a")}</div>
                  <div className="text-xs text-muted-foreground">{appt.duration_minutes} min</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Service</div>
                  <div>{SERVICE_FULL[appt.service_line] ?? appt.service_line}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Provider</div>
                  <div>{providerName}</div>
                </div>
                {appt.patient_phone && (
                  <div>
                    <div className="text-xs text-muted-foreground">Phone</div>
                    <a href={`tel:${appt.patient_phone}`} className="flex items-center gap-1 text-primary hover:underline">
                      <Phone className="h-3 w-3" /> {appt.patient_phone}
                    </a>
                  </div>
                )}
                {appt.notes && (
                  <div>
                    <div className="text-xs text-muted-foreground">Notes</div>
                    <div className="text-xs whitespace-pre-wrap p-2 rounded bg-muted/40">{appt.notes}</div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline" onClick={() => onUpdateStatus(appt.id, "checked_in")}>Check in</Button>
                  <Button size="sm" variant="outline" onClick={() => onUpdateStatus(appt.id, "in_progress")}>In progress</Button>
                  <Button size="sm" variant="outline" onClick={() => onUpdateStatus(appt.id, "completed")}>Complete</Button>
                  <Button size="sm" variant="outline" onClick={() => onUpdateStatus(appt.id, "no_show")}>No-show</Button>
                  <Button size="sm" variant="outline" onClick={() => onSendReminder(appt)} className="col-span-2 gap-2">
                    <Phone className="h-3 w-3" /> Send reminder SMS
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onViewPatient(appt.patient_id)} className="col-span-2 gap-2">
                    <FileText className="h-3 w-3" /> View patient chart
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onUpdateStatus(appt.id, "cancelled")} className="col-span-2">
                    Cancel appointment
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground pt-2">
                  Drag the appointment block on the grid to reschedule.
                </p>
              </div>
            </>
          );
        })()}
      </SheetContent>
    </Sheet>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// New appointment modal (also used for walk-in)
// ════════════════════════════════════════════════════════════════════════════
function NewAppointmentModal(props: {
  ctx: { providerId: string; date: Date; startMin: number } | null;
  isWalkIn: boolean;
  providers: Provider[];
  onClose: () => void;
  onCreated: () => void;
  findConflict: (providerId: string, scheduledAt: Date, durationMin: number, exceptId: string) => Appointment | null;
}) {
  const { ctx, isWalkIn, providers, onClose, onCreated, findConflict } = props;
  const [providerId, setProviderId] = useState(ctx?.providerId || providers[0]?.user_id || "");
  const [serviceLine, setServiceLine] = useState(isWalkIn ? "iv" : "consult");
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<PatientLite[]>([]);
  const [patient, setPatient] = useState<PatientLite | null>(null);
  const [saving, setSaving] = useState(false);

  // walk-in start = now snapped
  const initialDate = useMemo(() => {
    if (isWalkIn) {
      const now = new Date();
      const m = snap30(clinicMinutesFromMidnight(now));
      return clinicLocalToUtc(formatClinicDateKey(now), m);
    }
    if (ctx) {
      return clinicLocalToUtc(formatClinicDateKey(ctx.date), ctx.startMin);
    }
    return new Date();
  }, [ctx, isWalkIn]);
  const [scheduledAt, setScheduledAt] = useState(initialDate);
  const [timeStr, setTimeStr] = useState(format(initialDate, "HH:mm"));

  // patient search
  useEffect(() => {
    let cancelled = false;
    const q = search.trim();
    if (q.length < 2) { setResults([]); return; }
    (async () => {
      const { data } = await supabase.from("patients")
        .select("id,full_name,phone,email")
        .or(patientNameEmailPhoneOrFilter(q))
        .limit(8);
      if (!cancelled) setResults((data as any) || []);
    })();
    return () => { cancelled = true; };
  }, [search]);

  const save = async () => {
    if (!patient) return toast.error("Select a patient first");
    if (!providerId) return toast.error("Select a provider");
    setSaving(true);
    const dayKey = formatClinicDateKey(scheduledAt);
    const [hh, mm] = timeStr.split(":").map(Number);
    const final = clinicLocalToUtc(dayKey, hh * 60 + mm);
    const conflict = findConflict(providerId, final, duration, "");
    if (conflict) {
      const ok = window.confirm(`Conflict with ${conflict.patient_name} at ${formatClinicTime(conflict.scheduled_at)}. Override?`);
      if (!ok) { setSaving(false); return; }
    }
    const { error } = await supabase.from("appointments").insert({
      patient_id: patient.id,
      provider_id: providerId,
      scheduled_at: final.toISOString(),
      duration_minutes: duration,
      service_line: serviceLine,
      appointment_type: isWalkIn ? "walk_in" : "follow_up",
      status: isWalkIn ? "checked_in" : "scheduled",
      notes: notes || null,
      booking_source: "staff",
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(isWalkIn ? "Walk-in created" : "Appointment created");
    onCreated();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isWalkIn ? "New walk-in appointment" : "New appointment"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs text-muted-foreground">Patient</label>
            {patient ? (
              <div className="mt-1 p-2 rounded border flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{patient.full_name}</div>
                  <div className="text-xs text-muted-foreground">{patient.phone ?? patient.email}</div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setPatient(null)}><X className="h-3 w-3" /></Button>
              </div>
            ) : (
              <>
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, phone, or email…" />
                {results.length > 0 && (
                  <div className="mt-1 border rounded max-h-40 overflow-y-auto">
                    {results.map((r) => (
                      <button key={r.id}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent/30"
                        onClick={() => { setPatient(r); setSearch(""); setResults([]); }}>
                        <div className="font-medium">{r.full_name}</div>
                        <div className="text-xs text-muted-foreground">{r.phone ?? r.email ?? ""}</div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Provider</label>
              <select value={providerId} onChange={(e) => setProviderId(e.target.value)} className="w-full h-9 px-2 rounded border bg-background text-sm">
                {providers.map((p) => <option key={p.user_id} value={p.user_id}>{p.display_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Service</label>
              <select value={serviceLine} onChange={(e) => setServiceLine(e.target.value)} className="w-full h-9 px-2 rounded border bg-background text-sm">
                {SERVICE_LINES.map((s) => <option key={s.id} value={s.id}>{s.full}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Date</label>
              <Input type="date" value={format(scheduledAt, "yyyy-MM-dd")}
                onChange={(e) => { const d = new Date(e.target.value + "T00:00"); setScheduledAt(d); }} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Time</label>
              <Input type="time" value={timeStr} onChange={(e) => setTimeStr(e.target.value)} step={1800} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Duration (min)</label>
              <Input type="number" min={15} step={15} value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 30)} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Notes</label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving || !patient}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Print styles
// ════════════════════════════════════════════════════════════════════════════
function PrintStyles() {
  return (
    <style>{`
      @media print {
        @page { size: letter portrait; margin: 0.5in; }
        body { background: white !important; }
        .print\\:hidden { display: none !important; }
        .print\\:p-0 { padding: 0 !important; }
        .print\\:bg-white { background: white !important; }
      }
    `}</style>
  );
}
