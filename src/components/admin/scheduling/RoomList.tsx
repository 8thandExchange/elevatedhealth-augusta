/**
 * RoomList — admin
 *
 * Shows all rooms with inline edit: name, active toggle, capacity,
 * allowed service categories. Today's utilization is shown alongside.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Room {
  id: string;
  name: string;
  type: "treatment_room" | "consult_room" | "procedure_room" | "injection_room" | "lobby";
  active: boolean;
  is_flex: boolean;
  display_order: number;
  max_concurrent_appointments: number;
  allowed_service_categories: string[];
  notes: string | null;
}

interface Utilization {
  id: string;
  appointments_today: number;
  appointments_this_week: number;
  active_blackouts: number;
}

const ALL_CATEGORIES: { key: string; label: string }[] = [
  { key: "iv", label: "IV Hydration" },
  { key: "nad", label: "NAD+" },
  { key: "hormone", label: "Hormone" },
  { key: "peptide", label: "Peptide" },
  { key: "weight_loss", label: "Weight Loss" },
  { key: "injection", label: "Injection" },
  { key: "consult", label: "Consult" },
];

export function RoomList() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [utilization, setUtilization] = useState<Record<string, Utilization>>({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: roomData }, { data: utilData }] = await Promise.all([
      (supabase as any).from("rooms").select("*").order("display_order"),
      (supabase as any).from("v_room_utilization").select("*"),
    ]);
    setRooms((roomData as Room[]) || []);
    const utilMap: Record<string, Utilization> = {};
    (utilData || []).forEach((u: any) => { utilMap[u.id] = u; });
    setUtilization(utilMap);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (room: Room) => {
    const { error } = await supabase
      .from("rooms")
      .update({ active: !room.active })
      .eq("id", room.id);
    if (error) {
      toast.error(`Failed to update ${room.name}: ${error.message}`);
    } else {
      toast.success(`${room.name} ${!room.active ? "activated" : "deactivated"}`);
      load();
    }
  };

  const saveRoom = async (room: Partial<Room> & { id: string }) => {
    const { error } = await supabase
      .from("rooms")
      .update({
        name: room.name,
        max_concurrent_appointments: room.max_concurrent_appointments,
        allowed_service_categories: room.allowed_service_categories,
        notes: room.notes,
      })
      .eq("id", room.id);
    if (error) {
      toast.error(`Save failed: ${error.message}`);
    } else {
      toast.success("Room updated");
      setEditingId(null);
      load();
    }
  };

  if (loading) return <SkeletonRows />;

  return (
    <div className="space-y-3">
      {rooms.map((room) => {
        const u = utilization[room.id];
        const isEditing = editingId === room.id;
        return (
          <div
            key={room.id}
            className={[
              "border rounded-sm bg-background transition-all",
              room.active ? "border-border" : "border-border/50 bg-muted/30",
              isEditing && "border-accent",
            ].filter(Boolean).join(" ")}
          >
            {isEditing ? (
              <RoomEditForm room={room} onCancel={() => setEditingId(null)} onSave={saveRoom} />
            ) : (
              <div className="p-5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-playfair text-xl text-foreground">{room.name}</h3>
                    {room.is_flex && (
                      <span className="font-jost text-[10px] uppercase tracking-[0.16em] px-2 py-0.5 bg-accent/10 text-accent border border-accent/30 rounded-sm">
                        Flex
                      </span>
                    )}
                    <span className="font-jost text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {room.type.replace("_", " ")}
                    </span>
                    {!room.active && (
                      <span className="font-jost text-[10px] uppercase tracking-[0.16em] px-2 py-0.5 bg-destructive/10 text-destructive border border-destructive/30 rounded-sm">
                        Off
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-jost text-xs text-muted-foreground">
                    <span>Capacity: {room.max_concurrent_appointments}</span>
                    <span>Today: {u?.appointments_today ?? 0}</span>
                    <span>This week: {u?.appointments_this_week ?? 0}</span>
                    {(u?.active_blackouts ?? 0) > 0 && (
                      <span className="text-destructive">{u?.active_blackouts} blackout(s)</span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {room.allowed_service_categories.map((cat) => (
                      <span key={cat} className="font-jost text-[10px] px-2 py-0.5 bg-muted text-foreground/70 rounded-sm">
                        {ALL_CATEGORIES.find((c) => c.key === cat)?.label || cat}
                      </span>
                    ))}
                  </div>
                  {room.notes && (
                    <p className="font-jost text-xs text-muted-foreground italic mt-2">{room.notes}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={() => toggleActive(room)}
                    className={[
                      "font-jost text-xs uppercase tracking-[0.14em] px-3 py-1.5 rounded-sm border transition-colors",
                      room.active
                        ? "border-border text-muted-foreground hover:border-destructive hover:text-destructive"
                        : "border-accent/40 text-accent hover:bg-accent hover:text-primary-foreground",
                    ].join(" ")}
                  >
                    {room.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => setEditingId(room.id)}
                    className="font-jost text-xs uppercase tracking-[0.14em] px-3 py-1.5 rounded-sm border border-border text-foreground hover:border-accent hover:text-accent transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="mt-6 p-5 border border-border bg-muted/30 rounded-sm">
        <p className="font-jost text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Note: </span>
          Rooms 1–4 are treatment rooms intended for IV, NAD+, hormone, peptide, and weight-loss therapies.
          The lobby is a flex space — it's only booked when treatment rooms are full, and only for
          injections and brief consults. Deactivating a room makes it unavailable for any new booking
          but doesn't affect existing appointments.
        </p>
      </div>
    </div>
  );
}

function RoomEditForm({
  room,
  onCancel,
  onSave,
}: {
  room: Room;
  onCancel: () => void;
  onSave: (r: Partial<Room> & { id: string }) => void;
}) {
  const [name, setName] = useState(room.name);
  const [capacity, setCapacity] = useState(room.max_concurrent_appointments);
  const [cats, setCats] = useState<string[]>(room.allowed_service_categories);
  const [notes, setNotes] = useState(room.notes || "");

  const toggleCat = (key: string) => {
    setCats((prev) => (prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]));
  };

  return (
    <div className="p-5 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="font-jost text-xs uppercase tracking-[0.14em] text-muted-foreground">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full font-jost text-sm px-3 py-2 bg-background border border-border rounded-sm focus:outline-none focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="font-jost text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Concurrent capacity
          </span>
          <input
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
            className="mt-1 w-full font-jost text-sm px-3 py-2 bg-background border border-border rounded-sm focus:outline-none focus:border-accent"
          />
        </label>
      </div>
      <div>
        <span className="font-jost text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Allowed service categories
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {ALL_CATEGORIES.map((c) => {
            const on = cats.includes(c.key);
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => toggleCat(c.key)}
                className={[
                  "font-jost text-xs px-3 py-1.5 rounded-sm border transition-colors",
                  on
                    ? "bg-accent text-primary-foreground border-accent"
                    : "bg-background text-muted-foreground border-border hover:border-accent hover:text-foreground",
                ].join(" ")}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>
      <label className="block">
        <span className="font-jost text-xs uppercase tracking-[0.14em] text-muted-foreground">Notes</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-1 w-full font-jost text-sm px-3 py-2 bg-background border border-border rounded-sm focus:outline-none focus:border-accent resize-none"
        />
      </label>
      <div className="flex gap-2 pt-2">
        <button
          onClick={() =>
            onSave({
              id: room.id,
              name,
              max_concurrent_appointments: capacity,
              allowed_service_categories: cats,
              notes,
            })
          }
          className="font-jost text-xs uppercase tracking-[0.14em] px-4 py-2 bg-primary text-accent rounded-sm hover:bg-primary-light transition-colors"
        >
          Save changes
        </button>
        <button
          onClick={onCancel}
          className="font-jost text-xs uppercase tracking-[0.14em] px-4 py-2 border border-border text-muted-foreground rounded-sm hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-28 border border-border bg-muted/20 rounded-sm animate-pulse" />
      ))}
    </div>
  );
}
