/**
 * BookingLimitsTable — admin
 *
 * Manage practice-wide concurrent booking caps. Example uses:
 *   - "Only 4 IVs at once" (treatment room cap)
 *   - "Max 2 NAD+ slow drips in parallel" (chair-time-intensive)
 *   - "No more than 2 injections in lobby simultaneously"
 *   - "Saturdays cap total IVs at 2" (limited staff days)
 */

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BookingLimit {
  id: string;
  name: string;
  day_of_week: number | null;
  start_time: string;
  end_time: string;
  max_concurrent: number;
  service_category: string | null;
  applies_to_room_types: string[] | null;
  effective_from: string;
  effective_until: string | null;
  active: boolean;
}

const CATEGORIES = ["iv", "nad", "hormone", "peptide", "weight_loss", "consult", "injection"];
const ROOM_TYPES = ["treatment_room", "consult_room", "procedure_room", "injection_room", "lobby"];
const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function BookingLimitsTable() {
  const [limits, setLimits] = useState<BookingLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from("booking_limits").select("*").order("created_at", { ascending: false });
    setLimits((data as BookingLimit[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggle = async (limit: BookingLimit) => {
    const { error } = await supabase
      .from("booking_limits")
      .update({ active: !limit.active })
      .eq("id", limit.id);
    if (error) toast.error(`Failed: ${error.message}`);
    else { toast.success(`${limit.name} ${!limit.active ? "enabled" : "disabled"}`); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this booking limit?")) return;
    const { error } = await (supabase as any).from("booking_limits").delete().eq("id", id);
    if (error) toast.error(`Failed: ${error.message}`);
    else { toast.success("Limit deleted"); load(); }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm((s) => !s)}
          className="font-jost text-xs uppercase tracking-[0.14em] px-4 py-2 bg-accent text-primary-foreground rounded-sm hover:opacity-90 transition-opacity"
        >
          {showForm ? "Cancel" : "+ New Limit"}
        </button>
      </div>

      {showForm && <LimitForm onCreated={() => { setShowForm(false); load(); }} />}

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
                    {l.service_category && (
                      <> {" "}<span className="capitalize">{l.service_category.replace("_", " ")}</span> appointments</>
                    )}
                    {l.applies_to_room_types && (
                      <> in {l.applies_to_room_types.map((t) => t.replace("_", " ")).join(", ")}</>
                    )}
                  </p>
                  <p className="font-jost text-xs text-muted-foreground mt-1">
                    {l.day_of_week === null ? "Every day" : DOW_LABELS[l.day_of_week]}
                    {" · "}
                    {l.start_time.slice(0, 5)} – {l.end_time.slice(0, 5)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={() => toggle(l)}
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
                    onClick={() => remove(l.id)}
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
          The system checks every active limit when a patient tries to book. The booking is rejected
          if it would cause any limit's cap to be exceeded. Multiple limits can apply to the same
          appointment — all must pass. Defaults are seeded for IV (cap 4), NAD+ (cap 2), and
          lobby injections (cap 2). Disable or tune any of these to match operations.
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
  const [category, setCategory] = useState<string>("");
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleRoomType = (rt: string) => {
    setRoomTypes((prev) => (prev.includes(rt) ? prev.filter((r) => r !== rt) : [...prev, rt]));
  };

  const submit = async () => {
    if (!name) { toast.error("Name is required"); return; }
    if (maxConcurrent < 1) { toast.error("Max concurrent must be ≥ 1"); return; }
    setSaving(true);
    const { error } = await (supabase as any).from("booking_limits").insert({
      name,
      day_of_week: dow === "" ? null : Number(dow),
      start_time: startTime,
      end_time: endTime,
      max_concurrent: maxConcurrent,
      service_category: category || null,
      applies_to_room_types: roomTypes.length > 0 ? roomTypes : null,
      active: true,
    });
    setSaving(false);
    if (error) toast.error(`Failed: ${error.message}`);
    else { toast.success("Limit created"); onCreated(); }
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
            {DOW_LABELS.map((d, i) => <option key={i} value={i}>{d}</option>)}
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
            onChange={(e) => setMaxConcurrent(parseInt(e.target.value) || 1)}
            className="mt-1 w-full font-jost text-sm px-3 py-2 bg-background border border-border rounded-sm focus:outline-none focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="font-jost text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Service category (optional)
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full font-jost text-sm px-3 py-2 bg-background border border-border rounded-sm focus:outline-none focus:border-accent"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
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
        onClick={submit}
        disabled={saving}
        className="font-jost text-xs uppercase tracking-[0.14em] px-5 py-2.5 bg-primary text-accent rounded-sm hover:bg-primary-light transition-colors disabled:opacity-50"
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
