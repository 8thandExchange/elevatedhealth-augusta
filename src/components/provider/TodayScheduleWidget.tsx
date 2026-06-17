import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Phone, Check, X, ArrowRight } from "lucide-react";
import { format, isToday, isTomorrow, parseISO, startOfDay, endOfDay, addDays } from "date-fns";
import { SERVICE_FULL } from "@/components/scheduling/types";

interface AppointmentRow {
  id: string;
  patient_id: string;
  scheduled_at: string;
  service_line: string;
  status: string;
  duration_minutes: number;
  patient_name: string | null;
  patient_email: string | null;
  patient_phone: string | null;
}

interface TodayScheduleWidgetProps {
  onPatientSelect?: (patientId: string) => void;
  compact?: boolean;
}

const TodayScheduleWidget = ({ onPatientSelect, compact = false }: TodayScheduleWidgetProps) => {
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewRange, setViewRange] = useState<"today" | "week">("today");

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const today = startOfDay(new Date());
      const endDate = viewRange === "today" ? endOfDay(today) : endOfDay(addDays(today, 7));

      const { data, error } = await supabase
        .from("appointments")
        .select("id, patient_id, scheduled_at, service_line, status, duration_minutes, patients(full_name, email, phone)")
        .gte("scheduled_at", today.toISOString())
        .lte("scheduled_at", endDate.toISOString())
        .neq("status", "cancelled")
        .order("scheduled_at", { ascending: true });

      if (error) throw error;

      setAppointments(
        (data || []).map((row: Record<string, unknown>) => {
          const patients = row.patients as { full_name?: string; email?: string; phone?: string } | null;
          return {
            id: row.id as string,
            patient_id: row.patient_id as string,
            scheduled_at: row.scheduled_at as string,
            service_line: row.service_line as string,
            status: row.status as string,
            duration_minutes: row.duration_minutes as number,
            patient_name: patients?.full_name ?? null,
            patient_email: patients?.email ?? null,
            patient_phone: patients?.phone ?? null,
          };
        }),
      );
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [viewRange]);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  const markStatus = async (id: string, status: "completed" | "no_show" | "cancelled") => {
    try {
      const patch: Record<string, string> = { status };
      if (status === "completed") patch.check_out_at = new Date().toISOString();
      const { error } = await supabase.from("appointments").update(patch).eq("id", id);
      if (error) throw error;
      void loadAppointments();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getServiceBadge = (serviceLine: string) => {
    const label = SERVICE_FULL[serviceLine] ?? serviceLine;
    const className =
      serviceLine === "iv" ? "bg-cyan-100 text-cyan-700"
      : serviceLine === "weight_loss" ? "bg-green-100 text-green-700"
      : serviceLine === "hormone" ? "bg-purple-100 text-purple-700"
      : "bg-gray-100 text-gray-700";
    return { label, className };
  };

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEE, MMM d");
  };

  const todayCount = appointments.filter((a) => isToday(parseISO(a.scheduled_at))).length;

  if (compact) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Today&apos;s Schedule
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {todayCount} appointment{todayCount !== 1 ? "s" : ""}
              </Badge>
              <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                <Link to="/calendar">Open calendar</Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : todayCount === 0 ? (
            <p className="text-sm text-muted-foreground">No appointments today</p>
          ) : (
            <div className="space-y-2">
              {appointments
                .filter((a) => isToday(parseISO(a.scheduled_at)))
                .slice(0, 3)
                .map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-2 rounded-md bg-background/50 hover:bg-background cursor-pointer"
                    onClick={() => onPatientSelect?.(apt.patient_id)}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {format(parseISO(apt.scheduled_at), "h:mm a")}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {apt.patient_name ?? "Unknown"}
                      </span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  </div>
                ))}
              {todayCount > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{todayCount - 3} more — <Link to="/calendar" className="text-primary hover:underline">view all</Link>
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Schedule
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant={viewRange === "today" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewRange("today")}
            >
              Today
            </Button>
            <Button
              variant={viewRange === "week" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewRange("week")}
            >
              Week
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/calendar">Full calendar</Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">No upcoming appointments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => {
              const serviceBadge = getServiceBadge(apt.service_line);
              const actionable = ["scheduled", "checked_in", "in_progress"].includes(apt.status);
              return (
                <div
                  key={apt.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    apt.status === "completed"
                      ? "bg-green-50/50 border-green-200"
                      : apt.status === "no_show" || apt.status === "cancelled"
                      ? "bg-red-50/50 border-red-200 opacity-60"
                      : "bg-card hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-muted-foreground">
                          {getDateLabel(apt.scheduled_at)}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm font-semibold">
                          {format(parseISO(apt.scheduled_at), "h:mm a")}
                        </span>
                        <Badge className={`${serviceBadge.className} text-xs`}>
                          {serviceBadge.label}
                        </Badge>
                      </div>
                      <div
                        className="flex items-center gap-2 cursor-pointer hover:text-primary"
                        onClick={() => onPatientSelect?.(apt.patient_id)}
                      >
                        <User className="w-4 h-4" />
                        <span className="font-medium">{apt.patient_name ?? "Unknown"}</span>
                      </div>
                      {apt.patient_phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Phone className="w-3 h-3" />
                          {apt.patient_phone}
                        </div>
                      )}
                    </div>
                    {actionable ? (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
                          onClick={() => void markStatus(apt.id, "completed")}
                          title="Mark Complete"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                          onClick={() => void markStatus(apt.id, "no_show")}
                          title="Mark No-Show"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Badge
                        variant="outline"
                        className={
                          apt.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {apt.status === "completed" ? "Completed" : apt.status === "no_show" ? "No-Show" : apt.status}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodayScheduleWidget;
