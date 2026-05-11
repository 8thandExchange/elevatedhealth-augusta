/**
 * ServiceDurationGrid — admin
 *
 * Manage each service's duration, room requirement, and scheduling rules.
 * Changes apply to patient-facing availability immediately.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Service {
  id: string;
  slug: string;
  name: string;
  category: string;
  duration_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  requires_room: boolean;
  room_type_required: string | null;
  allow_flex_room: boolean;
  min_advance_booking_hours: number;
  online_bookable: boolean;
  active: boolean;
}

const ROOM_TYPES = ["", "treatment_room", "consult_room", "procedure_room", "injection_room"];

export function ServiceDurationGrid() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("active", true)
      .order("category", { ascending: true })
      .order("display_order", { ascending: true });
    setServices((data as Service[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (id: string, patch: Partial<Service>) => {
    const { error } = await (supabase as any).from("services").update(patch).eq("id", id);
    if (error) toast.error(`Save failed: ${error.message}`);
    else { toast.success("Service updated"); setEditingId(null); load(); }
  };

  const categories = Array.from(new Set(services.map((s) => s.category)));
  const visible = filter === "all" ? services : services.filter((s) => s.category === filter);

  return (
    <div className="space-y-5">
      <div className="flex gap-1 flex-wrap border border-border rounded-sm overflow-hidden w-fit">
        <button
          onClick={() => setFilter("all")}
          className={[
            "font-jost text-xs uppercase tracking-[0.14em] px-4 py-2 transition-colors",
            filter === "all" ? "bg-primary text-accent" : "bg-background text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={[
              "font-jost text-xs uppercase tracking-[0.14em] px-4 py-2 transition-colors capitalize",
              filter === c ? "bg-primary text-accent" : "bg-background text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {c.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonRows />
      ) : (
        <div className="space-y-2">
          {visible.map((s) =>
            editingId === s.id ? (
              <ServiceEditRow key={s.id} service={s} onCancel={() => setEditingId(null)} onSave={save} />
            ) : (
              <ServiceRow key={s.id} service={s} onEdit={() => setEditingId(s.id)} />
            ),
          )}
        </div>
      )}
    </div>
  );
}

function ServiceRow({ service, onEdit }: { service: Service; onEdit: () => void }) {
  return (
    <div className="p-4 border border-border bg-background rounded-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-playfair text-lg text-foreground">{service.name}</h4>
            <span className="font-jost text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {service.category.replace("_", " ")}
            </span>
            {!service.online_bookable && (
              <span className="font-jost text-[10px] uppercase tracking-[0.16em] px-2 py-0.5 bg-muted text-muted-foreground rounded-sm">
                Phone-only
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 font-jost text-xs text-muted-foreground">
            <span className="text-accent font-medium">{formatDuration(service.duration_minutes)}</span>
            {service.buffer_after_minutes > 0 && (
              <span>+ {service.buffer_after_minutes}min cleanup</span>
            )}
            {service.requires_room ? (
              <span>
                {service.room_type_required ? service.room_type_required.replace("_", " ") : "any room"}
                {service.allow_flex_room && " (lobby ok)"}
              </span>
            ) : (
              <span className="italic">No room required</span>
            )}
            <span>Min {service.min_advance_booking_hours}h advance</span>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="font-jost text-xs uppercase tracking-[0.14em] px-3 py-1.5 border border-border text-foreground rounded-sm hover:border-accent hover:text-accent transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

function ServiceEditRow({
  service,
  onCancel,
  onSave,
}: {
  service: Service;
  onCancel: () => void;
  onSave: (id: string, patch: Partial<Service>) => void;
}) {
  const [duration, setDuration] = useState(service.duration_minutes);
  const [bufferAfter, setBufferAfter] = useState(service.buffer_after_minutes);
  const [requiresRoom, setRequiresRoom] = useState(service.requires_room);
  const [roomType, setRoomType] = useState(service.room_type_required || "");
  const [allowFlex, setAllowFlex] = useState(service.allow_flex_room);
  const [minAdvance, setMinAdvance] = useState(service.min_advance_booking_hours);
  const [onlineBookable, setOnlineBookable] = useState(service.online_bookable);

  return (
    <div className="p-5 border border-accent bg-muted/20 rounded-sm space-y-4">
      <h4 className="font-playfair text-lg text-foreground">{service.name}</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <label className="block">
          <span className="font-jost text-xs uppercase tracking-[0.14em] text-muted-foreground">Duration (min)</span>
          <input
            type="number"
            min={1}
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
            className="mt-1 w-full font-jost text-sm px-3 py-2 bg-background border border-border rounded-sm focus:outline-none focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="font-jost text-xs uppercase tracking-[0.14em] text-muted-foreground">Cleanup buffer (min)</span>
          <input
            type="number"
            min={0}
            value={bufferAfter}
            onChange={(e) => setBufferAfter(parseInt(e.target.value) || 0)}
            className="mt-1 w-full font-jost text-sm px-3 py-2 bg-background border border-border rounded-sm focus:outline-none focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="font-jost text-xs uppercase tracking-[0.14em] text-muted-foreground">Min advance (hrs)</span>
          <input
            type="number"
            min={0}
            value={minAdvance}
            onChange={(e) => setMinAdvance(parseInt(e.target.value) || 0)}
            className="mt-1 w-full font-jost text-sm px-3 py-2 bg-background border border-border rounded-sm focus:outline-none focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="font-jost text-xs uppercase tracking-[0.14em] text-muted-foreground">Room type</span>
          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            disabled={!requiresRoom}
            className="mt-1 w-full font-jost text-sm px-3 py-2 bg-background border border-border rounded-sm focus:outline-none focus:border-accent disabled:opacity-50"
          >
            <option value="">Any</option>
            {ROOM_TYPES.filter(Boolean).map((rt) => (
              <option key={rt} value={rt}>{rt.replace("_", " ")}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-4">
        <CheckRow label="Requires a room" value={requiresRoom} onChange={setRequiresRoom} />
        <CheckRow label="Allow lobby (flex)" value={allowFlex} onChange={setAllowFlex} />
        <CheckRow label="Online bookable" value={onlineBookable} onChange={setOnlineBookable} />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() =>
            onSave(service.id, {
              duration_minutes: duration,
              buffer_after_minutes: bufferAfter,
              requires_room: requiresRoom,
              room_type_required: roomType || null,
              allow_flex_room: allowFlex,
              min_advance_booking_hours: minAdvance,
              online_bookable: onlineBookable,
            })
          }
          className="font-jost text-xs uppercase tracking-[0.14em] px-4 py-2 bg-primary text-accent rounded-sm hover:bg-primary-light transition-colors"
        >
          Save
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

function CheckRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-[var(--accent)]"
      />
      <span className="font-jost text-sm text-foreground">{label}</span>
    </label>
  );
}

function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (m === 0) return `${h} hr`;
  return `${h}h ${m}m`;
}

function SkeletonRows() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-20 border border-border bg-muted/20 rounded-sm animate-pulse" />
      ))}
    </div>
  );
}
