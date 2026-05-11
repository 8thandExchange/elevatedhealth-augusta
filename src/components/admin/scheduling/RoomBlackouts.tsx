/**
 * RoomBlackouts — admin
 *
 * Block off a specific room for a time window (cleaning, maintenance,
 * staff training, equipment failure, etc.). Blacked-out rooms are
 * excluded from the patient-side availability check.
 */

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Room {
  id: string;
  name: string;
  active: boolean;
  display_order: number;
}

interface Blackout {
  id: string;
  room_id: string;
  start_at: string;
  end_at: string;
  reason: string | null;
  created_at: string;
}

export function RoomBlackouts() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [blackouts, setBlackouts] = useState<Blackout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"upcoming" | "past" | "all">("upcoming");

  const load = async () => {
    setLoading(true);
    const [{ data: roomData }, { data: blackoutData }] = await Promise.all([
      (supabase as any).from("rooms").select("id, name, active, display_order").order("display_order"),
      (supabase as any).from("room_blackouts").select("*").order("start_at", { ascending: false }),
    ]);
    setRooms((roomData as Room[]) || []);
    setBlackouts((blackoutData as Blackout[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const visible = useMemo(() => {
    const now = Date.now();
    if (filter === "all") return blackouts;
    if (filter === "upcoming") return blackouts.filter((b) => new Date(b.end_at).getTime() >= now);
    return blackouts.filter((b) => new Date(b.end_at).getTime() < now);
  }, [blackouts, filter]);

  const remove = async (id: string) => {
    if (!confirm("Remove this blackout?")) return;
    const { error } = await (supabase as any).from("room_blackouts").delete().eq("id", id);
    if (error) toast.error(`Failed: ${error.message}`);
    else { toast.success("Blackout removed"); load(); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1 border border-border rounded-sm overflow-hidden">
          {(["upcoming", "past", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                "font-jost text-xs uppercase tracking-[0.14em] px-4 py-2 transition-colors",
                filter === f
                  ? "bg-primary text-accent"
                  : "bg-background text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="font-jost text-xs uppercase tracking-[0.14em] px-4 py-2 bg-accent text-primary-foreground rounded-sm hover:opacity-90 transition-opacity"
        >
          {showForm ? "Cancel" : "+ New Blackout"}
        </button>
      </div>

      {showForm && <BlackoutForm rooms={rooms} onCreated={() => { setShowForm(false); load(); }} />}

      {loading ? (
        <SkeletonRows />
      ) : visible.length === 0 ? (
        <div className="py-10 text-center border border-border bg-muted/30 rounded-sm">
          <p className="font-jost text-sm text-muted-foreground">
            No {filter === "all" ? "" : filter} blackouts.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((b) => {
            const room = rooms.find((r) => r.id === b.room_id);
            const past = new Date(b.end_at).getTime() < Date.now();
            return (
              <div
                key={b.id}
                className={[
                  "p-4 border rounded-sm flex items-start justify-between gap-4",
                  past ? "border-border/50 bg-muted/20" : "border-border bg-background",
                ].join(" ")}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-playfair text-lg text-foreground">
                    {room?.name || "Unknown room"}
                  </p>
                  <p className="font-jost text-sm text-muted-foreground mt-1">
                    {formatRange(b.start_at, b.end_at)}
                  </p>
                  {b.reason && (
                    <p className="font-jost text-xs text-foreground/70 mt-1 italic">{b.reason}</p>
                  )}
                </div>
                {!past && (
                  <button
                    onClick={() => remove(b.id)}
                    className="font-jost text-xs uppercase tracking-[0.14em] px-3 py-1.5 border border-border text-muted-foreground rounded-sm hover:border-destructive hover:text-destructive transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BlackoutForm({ rooms, onCreated }: { rooms: Room[]; onCreated: () => void }) {
  const [roomId, setRoomId] = useState(rooms[0]?.id || "");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!roomId || !date || !startTime || !endTime) {
      toast.error("Room, date, start, and end are required");
      return;
    }
    if (endTime <= startTime) {
      toast.error("End time must be after start time");
      return;
    }
    setSaving(true);
    const startAt = new Date(`${date}T${startTime}:00-05:00`).toISOString();
    const endAt = new Date(`${date}T${endTime}:00-05:00`).toISOString();
    const { error } = await (supabase as any).from("room_blackouts").insert({
      room_id: roomId,
      start_at: startAt,
      end_at: endAt,
      reason: reason || null,
    });
    setSaving(false);
    if (error) toast.error(`Failed: ${error.message}`);
    else { toast.success("Blackout created"); onCreated(); }
  };

  return (
    <div className="p-5 border border-accent/40 bg-muted/20 rounded-sm space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="font-jost text-xs uppercase tracking-[0.14em] text-muted-foreground">Room</span>
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="mt-1 w-full font-jost text-sm px-3 py-2 bg-background border border-border rounded-sm focus:outline-none focus:border-accent"
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="font-jost text-xs uppercase tracking-[0.14em] text-muted-foreground">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full font-jost text-sm px-3 py-2 bg-background border border-border rounded-sm focus:outline-none focus:border-accent"
          />
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
      <label className="block">
        <span className="font-jost text-xs uppercase tracking-[0.14em] text-muted-foreground">Reason (optional)</span>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g., Deep clean, equipment repair, staff training"
          className="mt-1 w-full font-jost text-sm px-3 py-2 bg-background border border-border rounded-sm focus:outline-none focus:border-accent"
        />
      </label>
      <button
        onClick={submit}
        disabled={saving}
        className="font-jost text-xs uppercase tracking-[0.14em] px-5 py-2.5 bg-primary text-accent rounded-sm hover:bg-primary-light transition-colors disabled:opacity-50"
      >
        {saving ? "Creating…" : "Create Blackout"}
      </button>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 border border-border bg-muted/20 rounded-sm animate-pulse" />
      ))}
    </div>
  );
}

function formatRange(startISO: string, endISO: string): string {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const sameDay = start.toDateString() === end.toDateString();
  const dateFmt: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };
  const timeFmt: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit", hour12: true };
  if (sameDay) {
    return `${start.toLocaleDateString("en-US", dateFmt)} · ${start.toLocaleTimeString("en-US", timeFmt)} – ${end.toLocaleTimeString("en-US", timeFmt)}`;
  }
  return `${start.toLocaleDateString("en-US", dateFmt)} ${start.toLocaleTimeString("en-US", timeFmt)} – ${end.toLocaleDateString("en-US", dateFmt)} ${end.toLocaleTimeString("en-US", timeFmt)}`;
}
