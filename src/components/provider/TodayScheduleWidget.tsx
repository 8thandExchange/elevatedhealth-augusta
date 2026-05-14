import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Phone, Check, X, ArrowRight } from "lucide-react";
import { format, isToday, isTomorrow, parseISO, startOfDay, endOfDay, addDays } from "date-fns";

interface Appointment {
  id: string;
  customer_name: string | null;
  customer_email: string;
  customer_phone: string | null;
  booked_for: string | null;
  service_type: string | null;
  status: string;
  notes: string | null;
}

interface TodayScheduleWidgetProps {
  onPatientSelect?: (email: string) => void;
  compact?: boolean;
}

const TodayScheduleWidget = ({ onPatientSelect, compact = false }: TodayScheduleWidgetProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewRange, setViewRange] = useState<"today" | "week">("today");

  useEffect(() => {
    loadAppointments();
  }, [viewRange]);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const today = startOfDay(new Date());
      const endDate = viewRange === "today" ? endOfDay(today) : endOfDay(addDays(today, 7));

      const { data, error } = await supabase
        .from("consultation_bookings")
        .select("*")
        .gte("booked_for", today.toISOString())
        .lte("booked_for", endDate.toISOString())
        .order("booked_for", { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markStatus = async (id: string, status: "completed" | "no_show" | "cancelled") => {
    try {
      const { error } = await supabase
        .from("consultation_bookings")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      loadAppointments();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getServiceBadge = (serviceType: string | null) => {
    const types: Record<string, { label: string; className: string }> = {
      hormone: { label: "Hormones", className: "bg-purple-100 text-purple-700" },
      weight_loss: { label: "Weight Loss", className: "bg-green-100 text-green-700" },
      iv_therapy: { label: "IV Therapy", className: "bg-cyan-100 text-cyan-700" },
    };
    return types[serviceType || ""] || { label: serviceType || "Consultation", className: "bg-gray-100 text-gray-700" };
  };

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEE, MMM d");
  };

  const todayCount = appointments.filter(a => a.booked_for && isToday(parseISO(a.booked_for))).length;

  if (compact) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Today's Schedule
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {todayCount} appointment{todayCount !== 1 ? "s" : ""}
            </Badge>
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
                .filter(a => a.booked_for && isToday(parseISO(a.booked_for)))
                .slice(0, 3)
                .map(apt => (
                  <div 
                    key={apt.id} 
                    className="flex items-center justify-between p-2 rounded-md bg-background/50 hover:bg-background cursor-pointer"
                    onClick={() => onPatientSelect?.(apt.customer_email)}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {apt.booked_for ? format(parseISO(apt.booked_for), "h:mm a") : "TBD"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {apt.customer_name || apt.customer_email.split("@")[0]}
                      </span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  </div>
                ))}
              {todayCount > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{todayCount - 3} more
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
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">No upcoming appointments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map(apt => {
              const serviceBadge = getServiceBadge(apt.service_type);
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
                          {apt.booked_for ? getDateLabel(apt.booked_for) : "Unscheduled"}
                        </span>
                        {apt.booked_for && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-sm font-semibold">
                              {format(parseISO(apt.booked_for), "h:mm a")}
                            </span>
                          </>
                        )}
                        <Badge className={`${serviceBadge.className} text-xs`}>
                          {serviceBadge.label}
                        </Badge>
                      </div>
                      <div 
                        className="flex items-center gap-2 cursor-pointer hover:text-primary"
                        onClick={() => onPatientSelect?.(apt.customer_email)}
                      >
                        <User className="w-4 h-4" />
                        <span className="font-medium">{apt.customer_name || "Unknown"}</span>
                      </div>
                      {apt.customer_phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Phone className="w-3 h-3" />
                          {apt.customer_phone}
                        </div>
                      )}
                    </div>
                    {apt.status === "pending" || apt.status === "paid" ? (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
                          onClick={() => markStatus(apt.id, "completed")}
                          title="Mark Complete"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                          onClick={() => markStatus(apt.id, "no_show")}
                          title="Mark No-Show"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Badge variant="outline" className={
                        apt.status === "completed" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                      }>
                        {apt.status === "completed" ? "Completed" : apt.status === "no_show" ? "No-Show" : "Cancelled"}
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
