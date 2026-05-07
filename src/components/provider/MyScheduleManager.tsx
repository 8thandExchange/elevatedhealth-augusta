import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, CalendarOff } from "lucide-react";
import { format } from "date-fns";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SERVICE_LINES = [
  { id: "iv", label: "IV Therapy" },
  { id: "consult", label: "Wellness Assessment" },
  { id: "hormone", label: "Hormone Follow-up" },
  { id: "follow_up", label: "General Follow-up" },
];

interface Schedule {
  id: string;
  provider_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  service_lines: string[];
  slot_minutes: number;
  is_active: boolean;
}

interface Block {
  id: string;
  provider_id: string;
  start_at: string;
  end_at: string;
  reason: string | null;
}

export default function MyScheduleManager() {
  const [providerId, setProviderId] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

  // New schedule form
  const [newDay, setNewDay] = useState(1);
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("17:00");
  const [newServices, setNewServices] = useState<string[]>(["iv", "consult"]);
  const [newSlotMin, setNewSlotMin] = useState(30);

  // New block form
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockReason, setBlockReason] = useState("");

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setProviderId(user.id);
    const [{ data: scheds }, { data: blks }] = await Promise.all([
      supabase.from("provider_schedules").select("*").eq("provider_id", user.id).order("day_of_week"),
      supabase.from("schedule_blocks").select("*").eq("provider_id", user.id).gte("end_at", new Date().toISOString()).order("start_at"),
    ]);
    setSchedules((scheds as any) || []);
    setBlocks((blks as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addSchedule = async () => {
    if (!providerId) return;
    if (newServices.length === 0) {
      toast.error("Select at least one service line");
      return;
    }
    const { error } = await supabase.from("provider_schedules").insert({
      provider_id: providerId,
      day_of_week: newDay,
      start_time: newStart + ":00",
      end_time: newEnd + ":00",
      service_lines: newServices,
      slot_minutes: newSlotMin,
      is_active: true,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Availability added");
    load();
  };

  const removeSchedule = async (id: string) => {
    if (!confirm("Remove this availability block?")) return;
    await supabase.from("provider_schedules").delete().eq("id", id);
    load();
  };

  const toggleActive = async (s: Schedule) => {
    await supabase.from("provider_schedules").update({ is_active: !s.is_active }).eq("id", s.id);
    load();
  };

  const addBlock = async () => {
    if (!providerId || !blockStart || !blockEnd) return;
    const { error } = await supabase.from("schedule_blocks").insert({
      provider_id: providerId,
      start_at: new Date(blockStart).toISOString(),
      end_at: new Date(blockEnd).toISOString(),
      reason: blockReason || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Time-off block added");
    setBlockStart(""); setBlockEnd(""); setBlockReason("");
    load();
  };

  const removeBlock = async (id: string) => {
    await supabase.from("schedule_blocks").delete().eq("id", id);
    load();
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Availability</CardTitle>
          <p className="text-sm text-muted-foreground">Patients can self-book into open slots that match these hours.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {schedules.length === 0 ? (
            <p className="text-sm text-muted-foreground">No availability set. Add a block below.</p>
          ) : (
            <div className="space-y-2">
              {schedules.map((s) => (
                <div key={s.id} className={`flex flex-wrap items-center gap-3 p-3 border rounded-lg ${s.is_active ? "" : "opacity-50"}`}>
                  <Badge variant="outline" className="w-12 justify-center">{DAYS[s.day_of_week]}</Badge>
                  <span className="font-mono text-sm">{s.start_time.slice(0,5)} – {s.end_time.slice(0,5)}</span>
                  <span className="text-sm text-muted-foreground">/ {s.slot_minutes}min slots</span>
                  <div className="flex flex-wrap gap-1">
                    {s.service_lines.map((sl) => <Badge key={sl} variant="secondary">{sl}</Badge>)}
                  </div>
                  <div className="ml-auto flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => toggleActive(s)}>
                      {s.is_active ? "Pause" : "Activate"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => removeSchedule(s.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-4 space-y-3">
            <p className="font-medium text-sm flex items-center gap-2"><Plus className="h-4 w-4" /> Add Availability</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <Label className="text-xs">Day</Label>
                <select value={newDay} onChange={(e) => setNewDay(Number(e.target.value))} className="w-full h-10 px-2 border rounded-md bg-background">
                  {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs">Start</Label>
                <Input type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">End</Label>
                <Input type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Slot length (min)</Label>
                <Input type="number" min={15} step={15} value={newSlotMin} onChange={(e) => setNewSlotMin(Number(e.target.value))} />
              </div>
              <div className="flex items-end">
                <Button onClick={addSchedule} className="w-full">Add</Button>
              </div>
            </div>
            <div>
              <Label className="text-xs">Services offered in this block</Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {SERVICE_LINES.map((sl) => (
                  <label key={sl.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={newServices.includes(sl.id)}
                      onCheckedChange={(v) =>
                        setNewServices((arr) => v ? [...arr, sl.id] : arr.filter((x) => x !== sl.id))
                      }
                    />
                    {sl.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarOff className="h-5 w-5" /> Time Off / Blocks</CardTitle>
          <p className="text-sm text-muted-foreground">Block out vacation, lunch, or any unavailable window.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {blocks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming blocks.</p>
          ) : (
            <div className="space-y-2">
              {blocks.map((b) => (
                <div key={b.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <span className="text-sm">
                    {format(new Date(b.start_at), "MMM d, h:mm a")} – {format(new Date(b.end_at), "MMM d, h:mm a")}
                  </span>
                  {b.reason && <span className="text-sm text-muted-foreground italic">— {b.reason}</span>}
                  <Button variant="ghost" size="sm" className="ml-auto" onClick={() => removeBlock(b.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs">Start</Label>
              <Input type="datetime-local" value={blockStart} onChange={(e) => setBlockStart(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">End</Label>
              <Input type="datetime-local" value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Reason (optional)</Label>
              <Input value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Vacation, lunch..." />
            </div>
            <div className="flex items-end">
              <Button onClick={addBlock} className="w-full">Add Block</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
