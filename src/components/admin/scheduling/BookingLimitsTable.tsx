/**
 * BookingLimitsTable — admin
 *
 * Manage practice-wide concurrent booking caps. Example uses:
 *   - "Only 4 IVs at once" (treatment room cap)
 *   - "No more than 2 injections in lobby simultaneously"
 *   - "Saturdays cap total IVs at 2" (limited staff days)
 */

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type BookingLimitRow = Database["public"]["Tables"]["booking_limits"]["Row"];

const SERVICE_LINES = ["iv", "hormone", "injection", "weight_loss", "peptide", "consult"] as const;
const ROOM_TYPES = ["treatment_room", "consult_room", "procedure_room", "injection_room", "lobby"] as const;
const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatTimeRange(start: string | null, end: string | null): string {
  if (!start && !end) return "All hours";
  const s = (start || "00:00:00").slice(0, 5);
  const e = (end || "23:59:59").slice(0, 5);
  return `${s} – ${e}`;
}

export function BookingLimitsTable() {
  const [limits, setLimits] = useState<BookingLimitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("booking_limits").select("*").order("created_at", { ascending: false });
    setLimits(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const toggle = async (limit: BookingLimitRow) => {
    const { error } = await supabase
      .from("booking_limits")
      .update({ active: !limit.active })
      .eq("id", limit.id);
    if (error) toast.error(`Failed: ${error.message}`);
    else {
      toast.success(`${limit.name} ${!limit.active ? "enabled" : "disabled"}`);
      void load();
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this booking limit?")) return;
    const { error } = await supabase.from("booking_limits").delete().eq("id", id);
    if (error) toast.error(`Failed: ${error.message}`);
    else {
      toast.success("Limit deleted");
      void load();
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm((s) => !s)}
          className="font-jost text-xs uppercase tracking-[0.14em] px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary-dark transition-opacity"
        >
          {showForm ? "Cancel" : "+ New Limit"}
        </button>
      </div>

      {showForm && <LimitForm onCreated={() => { setShowForm(false); void load(); }} />}

      {loading ? (
        <SkeletonRows />
      ) : limits.length === 0 ? (
        <div className="py-10 text-center border border-border bg-muted/30 rounded-sm">
          <p className="font-jost text-sm text-muted-foreground">No booking limits set.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {limits.map((l) => (
            <div
              key={l.id}
              className={[
                "p-5 border rounded-sm",
                l.active ? "border-border bg-background" : "border-border/50 bg-muted/30",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-playfair text-lg text-foreground">{l.name}</h3>
                    {!l.active && (
                      <span className="font-jost text-[10px] uppercase tracking-[0.16em] px-2 py-0.5 bg-muted text-muted-foreground border border-border rounded-sm">
                        Disabled
                      </span>
                    )}
                  </div>
                  <p className="font-jost text-sm text-foreground mt-2">
                    <span className="text-accent font-medium">Max {l.max_concurrent}</span> concurrent
                    {l.service_line && (
                      <>
                        {" "}
                        <span className="capitalize">{l.service_line.replace("_", " ")}</span> appointments
                      </>
                    )}
                    {!l.service_line && <> appointments (all service lines)</>}
                    {l.applies_to_room_types && l.applies_to_room_types.length > 0 && (
                      <> in {l.applies_to_room_types.map((t) => t.replace("_", " ")).join(", ")}</>
                    )}
                  </p>
                  <p className="font-jost text-xs text-muted-foreground mt-1">
                    {l.day_of_week === null ? "Every day" : DOW_LABELS[l.day_of_week]}
                    {" · "}
                    {formatTimeRange(l.start_time, l.end_time)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={() => void toggle(l)}
                    className={[
                      "font-jost text-xs uppercase tracking-[0.14em] px-3 py-1.5 rounded-sm border transition-colors",
                      l.active
                        ? "border-border text-muted-foreground hover:border-destructive hover:text-destructive"
                        : "border-accent/40 text-accent hover:bg-accent hover:text-primary-foreground",
                    ].join(" ")}
                  >
                    {l.active ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => void remove(l.id)}
                    className="font-jost text-xs uppercase tracking-[0.14em] px-3 py-1.5 border border-border text-muted-foreground rounded-sm hover:border-destructive hover:text-destructive transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 p-5 border border-border bg-muted/30 rounded-sm">
        <p className="font-jost text-xs text-muted-foreground">
          <span className="font-medium text-foreground">How limits work: </span>
          The system checks every active limit when a patient tries to book. The booking is rejected if it
          would cause the cap for any matching limit to be exceeded. Multiple limits can apply to the same appointment —
          all must pass. Seeded defaults include an IV concurrent cap and lobby caps; adjust to match operations.
        </p>
      </div>
    </div>
  );
}

function LimitForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [dow, setDow] = useState<number | "">("");
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [maxConcurrent, setMaxConcurrent] = useState(4);
  const [serviceLine, setServiceLine] = useState<string>("");
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleRoomType = (rt: string) => {
    setRoomTypes((prev) => (prev.includes(rt) ? prev.filter((r) => r !== rt) : [...prev, rt]));
  };

  const submit = async () => {
    if (!name) {
      toast.error("Name is required");
      return;
    }
    if (maxConcurrent < 1) {
      toast.error("Max concurrent must be ≥ 1");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("booking_limits").insert({
      name,
      day_of_week: dow === "" ? null : Number(dow),
      start_time: `${startTime}:00`,
      end_time: `${endTime}:00`,
      max_concurrent: maxConcurrent,
      service_line: serviceLine || null,
      applies_to_room_types: roomTypes.length > 0 ? roomTypes : null,
      active: true,
    });
    setSaving(false);
    if (error) toast.error(`Failed: ${error.message}`);
    else {
      toast.success("Limit created");
      onCreated();
    }
  };

  return (
    <div className="p-5 border border-accent/40 bg-muted/20 rounded-sm space-y-4">
      <label className="block">
        <span className="font-jost text-xs uppercase tracking-[0.14em] text-muted-foreground">Name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='e.g., "Saturdays — IV cap 2"'
          className="mt-1 w-full font-jost text-sm px-3 py-2 bg-background border border-border rounded-sm focus:outline-none focus:border-accent"
        />
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="block">
          <span className="font-jost text-xs uppercase tracking-[0.14em] text-muted-foreground">Day</span>
          <select
            value={dow}
            onChange={(e) => setDow(e.target.value === "" ? "" : Number(e.target.value))}
            className="mt-1 w-full font-jost text-sm px-3 py-2 bg-background border border-border rounded-sm focus:outline-none focus:border-accent"
          >
            <option value="">Every day</option>
            {DOW_LABELS.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="font-jost text-xs uppercase tracking-[0.14em] text-muted-foreground">Start time</span>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 w-full font-jost text-sm px-3 py-2 bg-background border border-border rounded-sm focus:outline-none focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="font-jost text-xs uppercase tracking-[0.14em] text-muted-foreground">End time</span>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mt-1 w-full font-jost text-sm px-3 py-2 bg-background border border-border rounded-sm focus:outline-none focus:border-accent"
          />
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="font-jost text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Max concurrent
          </span>
          <input
            type="number"
            min={1}
            value={maxConcurrent}
            onChange={(e) => setMaxConcurrent(parseInt(e.target.value, 10) || 1)}
            className="mt-1 w-full font-jost text-sm px-3 py-2 bg-background border border-border rounded-sm focus:outline-none focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="font-jost text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Service line (optional)
          </span>
          <select
            value={serviceLine}
            onChange={(e) => setServiceLine(e.target.value)}
            className="mt-1 w-full font-jost text-sm px-3 py-2 bg-background border border-border rounded-sm focus:outline-none focus:border-accent"
          >
            <option value="">All service lines</option>
            {SERVICE_LINES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <span className="font-jost text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Applies to room types (optional)
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {ROOM_TYPES.map((rt) => {
            const on = roomTypes.includes(rt);
            return (
              <button
                key={rt}
                type="button"
                onClick={() => toggleRoomType(rt)}
                className={[
                  "font-jost text-xs px-3 py-1.5 rounded-sm border transition-colors",
                  on
                    ? "bg-accent text-primary-foreground border-accent"
                    : "bg-background text-muted-foreground border-border hover:border-accent hover:text-foreground",
                ].join(" ")}
              >
                {rt.replace("_", " ")}
              </button>
            );
          })}
        </div>
      </div>
      <button
        onClick={() => void submit()}
        disabled={saving}
        className="font-jost text-xs uppercase tracking-[0.14em] px-5 py-2.5 bg-primary text-primary-foreground rounded-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
      >
        {saving ? "Creating…" : "Create Limit"}
      </button>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 border border-border bg-muted/20 rounded-sm animate-pulse" />
      ))}
    </div>
  );
}
