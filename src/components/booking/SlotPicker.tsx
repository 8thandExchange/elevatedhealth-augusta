import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { format, isSameDay, addDays, startOfDay } from "date-fns";
import { toast } from "sonner";

interface Slot {
  provider_id: string;
  start: string;
  end: string;
}

interface SlotPickerProps {
  serviceLine: "iv" | "consult" | "hormone" | "follow_up";
  durationMinutes?: number;
  providerId?: string;
  onConfirm: (args: { slot: Slot }) => Promise<void> | void;
  confirmLabel?: string;
}

export default function SlotPicker({
  serviceLine,
  durationMinutes = 60,
  providerId,
  onConfirm,
  confirmLabel = "Confirm Appointment",
}: SlotPickerProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("get-available-slots", {
          body: {
            service_line: serviceLine,
            duration_minutes: durationMinutes,
            provider_id: providerId,
            days: 21,
          },
        });
        if (error) throw error;
        setSlots(data?.slots || []);
      } catch (e: any) {
        toast.error("Couldn't load availability. Please call us.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [serviceLine, durationMinutes, providerId]);

  const days = useMemo(() => {
    const start = addDays(startOfDay(new Date()), weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [weekOffset]);

  const slotsForDay = useMemo(
    () => slots.filter((s) => isSameDay(new Date(s.start), selectedDate)),
    [slots, selectedDate],
  );

  const dayHasSlots = (d: Date) =>
    slots.some((s) => isSameDay(new Date(s.start), d));

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    setSubmitting(true);
    try {
      await onConfirm({ slot: selectedSlot });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-3">
          <p className="text-muted-foreground">No openings in the next 3 weeks.</p>
          <p className="text-sm">Please call <a className="text-gold underline" href="tel:7067603470">(706) 760-3470</a> and we'll get you scheduled.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Week navigator */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setWeekOffset((w) => Math.max(0, w - 1))} disabled={weekOffset === 0}>
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4" /> {format(days[0], "MMM d")} – {format(days[6], "MMM d, yyyy")}
        </p>
        <Button variant="ghost" size="sm" onClick={() => setWeekOffset((w) => Math.min(2, w + 1))} disabled={weekOffset === 2}>
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => {
          const has = dayHasSlots(d);
          const sel = isSameDay(d, selectedDate);
          return (
            <button
              key={d.toISOString()}
              onClick={() => has && setSelectedDate(d)}
              disabled={!has}
              className={`p-3 rounded-lg border text-center transition-all ${
                sel ? "bg-gold text-white border-gold" :
                has ? "bg-card hover:border-gold cursor-pointer" :
                "bg-muted/30 text-muted-foreground cursor-not-allowed opacity-50"
              }`}
            >
              <div className="text-xs uppercase">{format(d, "EEE")}</div>
              <div className="text-lg font-semibold">{format(d, "d")}</div>
            </button>
          );
        })}
      </div>

      {/* Time slots */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-gold" />
            <h3 className="font-medium">{format(selectedDate, "EEEE, MMMM d")}</h3>
          </div>
          {slotsForDay.length === 0 ? (
            <p className="text-sm text-muted-foreground">No openings this day.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {slotsForDay.map((s) => {
                const sel = selectedSlot?.start === s.start;
                return (
                  <button
                    key={s.start + s.provider_id}
                    onClick={() => setSelectedSlot(s)}
                    className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                      sel ? "bg-gold text-white border-gold" : "hover:border-gold"
                    }`}
                  >
                    {format(new Date(s.start), "h:mm a")}
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSlot && (
        <div className="flex items-center justify-between bg-muted/30 rounded-lg p-4">
          <div>
            <p className="text-sm text-muted-foreground">Selected</p>
            <p className="font-semibold">{format(new Date(selectedSlot.start), "EEE, MMM d • h:mm a")}</p>
          </div>
          <Button onClick={handleConfirm} disabled={submitting} className="bg-gold hover:bg-gold/90">
            {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {confirmLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
