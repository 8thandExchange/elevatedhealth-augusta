import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  CreditCard, 
  TrendingUp,
  ChevronRight,
  RefreshCw,
  Bell
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isTomorrow, addDays, startOfDay, endOfDay } from "date-fns";

interface UpcomingAppointment {
  id: string;
  customer_name: string | null;
  customer_email: string;
  customer_phone: string | null;
  service_type: string | null;
  booked_for: string;
  status: string;
}

interface RecentActivity {
  id: string;
  type: "intake" | "payment" | "signup" | "labs";
  patient_name: string;
  description: string;
  timestamp: string;
}

const DashboardActivityWidget = () => {
  const [appointments, setAppointments] = useState<UpcomingAppointment[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Refresh every 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load upcoming appointments (next 7 days)
      const now = new Date();
      const weekFromNow = addDays(now, 7);
      
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("consultation_bookings")
        .select("id, customer_name, customer_email, customer_phone, service_type, booked_for, status")
        .gte("booked_for", now.toISOString())
        .lte("booked_for", weekFromNow.toISOString())
        .in("status", ["paid", "scheduled"])
        .order("booked_for", { ascending: true })
        .limit(10);

      if (!appointmentsError) {
        setAppointments(appointmentsData || []);
      }

      // Load recent activities from multiple sources
      const recentActivities: RecentActivity[] = [];

      // Recent patients with intake complete
      const { data: intakePatients } = await supabase
        .from("patients")
        .select("id, full_name, updated_at, onboarding_status")
        .eq("onboarding_status", "intake_complete")
        .order("updated_at", { ascending: false })
        .limit(5);

      intakePatients?.forEach(p => {
        recentActivities.push({
          id: `intake-${p.id}`,
          type: "intake",
          patient_name: p.full_name,
          description: "Completed medical intake",
          timestamp: p.updated_at || new Date().toISOString(),
        });
      });

      // Recent consultation payments
      const { data: recentBookings } = await supabase
        .from("consultation_bookings")
        .select("id, customer_name, customer_email, created_at, amount_paid")
        .eq("status", "paid")
        .order("created_at", { ascending: false })
        .limit(5);

      recentBookings?.forEach(b => {
        recentActivities.push({
          id: `payment-${b.id}`,
          type: "payment",
          patient_name: b.customer_name || b.customer_email,
          description: `Paid $${b.amount_paid || 99} consultation`,
          timestamp: b.created_at,
        });
      });

      // Recent patient signups
      const { data: newPatients } = await supabase
        .from("patients")
        .select("id, full_name, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      newPatients?.forEach(p => {
        recentActivities.push({
          id: `signup-${p.id}`,
          type: "signup",
          patient_name: p.full_name,
          description: "New patient registered",
          timestamp: p.created_at || new Date().toISOString(),
        });
      });

      // Sort by timestamp and take top 10
      recentActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      setActivities(recentActivities.slice(0, 10));

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAppointmentDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEE, MMM d");
  };

  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "intake":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "payment":
        return <CreditCard className="h-4 w-4 text-green-500" />;
      case "signup":
        return <User className="h-4 w-4 text-purple-500" />;
      case "labs":
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="animate-pulse">
          <CardHeader className="pb-2">
            <div className="h-5 bg-muted rounded w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-muted rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader className="pb-2">
            <div className="h-5 bg-muted rounded w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-muted rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Upcoming Appointments */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Upcoming Appointments
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={loadData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              No upcoming appointments this week
            </p>
          ) : (
            <ScrollArea className="h-[280px]">
              <div className="space-y-2">
                {appointments.map((apt) => (
                  <div 
                    key={apt.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">
                          {apt.customer_name || apt.customer_email}
                        </span>
                        {isToday(new Date(apt.booked_for)) && (
                          <Badge variant="default" className="bg-accent text-white">
                            Today
                          </Badge>
                        )}
                        {isTomorrow(new Date(apt.booked_for)) && (
                          <Badge variant="outline" className="border-gold text-accent">
                            Tomorrow
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(apt.booked_for), "h:mm a")}
                        <span>•</span>
                        <span className="capitalize">{apt.service_type || "Consultation"}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-accent" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              No recent activity
            </p>
          ) : (
            <ScrollArea className="h-[280px]">
              <div className="space-y-2">
                {activities.map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {activity.patient_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {getTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardActivityWidget;
