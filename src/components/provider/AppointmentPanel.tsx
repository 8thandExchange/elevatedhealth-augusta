import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  CalendarDays, Plus, ChevronDown, ChevronUp, Loader2, Save, X,
  Clock, MapPin, Video, LogIn, LogOut, Pencil
} from "lucide-react";
import { format, isPast, isToday, isFuture } from "date-fns";

interface Appointment {
  id: string;
  patient_id: string;
  provider_id: string | null;
  appointment_type: string;
  service_line: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  check_in_at: string | null;
  check_out_at: string | null;
  reason: string | null;
  notes: string | null;
  room: string | null;
  is_telehealth: boolean;
  created_at: string;
}

interface AppointmentPanelProps {
  patientId: string;
  patientName: string;
}

const AppointmentPanel = ({ patientId, patientName }: AppointmentPanelProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPast, setShowPast] = useState(false);

  // Form state
  const [appointmentType, setAppointmentType] = useState("follow_up");
  const [selectedServiceLine, setSelectedServiceLine] = useState("hormone");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [reason, setReason] = useState("");
  const [apptNotes, setApptNotes] = useState("");
  const [room, setRoom] = useState("");
  const [isTelehealth, setIsTelehealth] = useState(false);

  useEffect(() => {
    if (patientId) loadAppointments();
  }, [patientId]);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("patient_id", patientId)
        .order("scheduled_at", { ascending: false });
      if (error) throw error;
      setAppointments((data as any[]) || []);
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setAppointmentType("follow_up"); setSelectedServiceLine("hormone");
    setScheduledDate(""); setScheduledTime("09:00"); setDurationMinutes(30);
    setReason(""); setApptNotes(""); setRoom(""); setIsTelehealth(false);
  };

  const startEditing = (appt: Appointment) => {
    setEditingAppt(appt);
    setAppointmentType(appt.appointment_type);
    setSelectedServiceLine(appt.service_line);
    const dt = new Date(appt.scheduled_at);
    setScheduledDate(dt.toISOString().split("T")[0]);
    setScheduledTime(dt.toTimeString().slice(0, 5));
    setDurationMinutes(appt.duration_minutes);
    setReason(appt.reason || "");
    setApptNotes(appt.notes || "");
    setRoom(appt.room || "");
    setIsTelehealth(appt.is_telehealth);
    setIsCreating(true);
  };

  const saveAppointment = async () => {
    if (!scheduledDate || !scheduledTime) {
      toast.error("Date and time are required");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const scheduled_at = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();

      const apptData = {
        patient_id: patientId,
        provider_id: user.id,
        appointment_type: appointmentType,
        service_line: selectedServiceLine,
        scheduled_at,
        duration_minutes: durationMinutes,
        reason: reason || null,
        notes: apptNotes || null,
        room: room || null,
        is_telehealth: isTelehealth,
      };

      if (editingAppt?.id) {
        const { error } = await supabase.from("appointments").update(apptData).eq("id", editingAppt.id);
        if (error) throw error;
        toast.success("Appointment updated");
      } else {
        const { error } = await supabase.from("appointments").insert(apptData);
        if (error) throw error;
        toast.success("Appointment scheduled");
      }

      setIsCreating(false);
      setEditingAppt(null);
      resetForm();
      loadAppointments();
    } catch (error: any) {
      toast.error(error.message || "Failed to save appointment");
    } finally {
      setIsSaving(false);
    }
  };

  const checkIn = async (apptId: string) => {
    try {
      const { error } = await supabase.from("appointments").update({
        status: "checked_in",
        check_in_at: new Date().toISOString(),
      }).eq("id", apptId);
      if (error) throw error;
      toast.success("Patient checked in");
      loadAppointments();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const checkOut = async (apptId: string) => {
    try {
      const { error } = await supabase.from("appointments").update({
        status: "completed",
        check_out_at: new Date().toISOString(),
      }).eq("id", apptId);
      if (error) throw error;
      toast.success("Visit completed");
      loadAppointments();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const cancelAppt = async (apptId: string) => {
    try {
      const { error } = await supabase.from("appointments").update({ status: "cancelled" }).eq("id", apptId);
      if (error) throw error;
      toast.success("Appointment cancelled");
      loadAppointments();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const noShow = async (apptId: string) => {
    try {
      const { error } = await supabase.from("appointments").update({ status: "no_show" }).eq("id", apptId);
      if (error) throw error;
      toast.success("Marked as no-show");
      loadAppointments();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const upcomingAppts = appointments.filter(a => 
    (a.status === "scheduled" || a.status === "checked_in") && isFuture(new Date(a.scheduled_at)) || isToday(new Date(a.scheduled_at))
  );
  const pastAppts = appointments.filter(a => 
    a.status === "completed" || a.status === "cancelled" || a.status === "no_show" || (isPast(new Date(a.scheduled_at)) && !isToday(new Date(a.scheduled_at)))
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled": return <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-300">Scheduled</Badge>;
      case "checked_in": return <Badge className="text-[10px] bg-green-100 text-green-700 border-green-300">Checked In</Badge>;
      case "completed": return <Badge className="text-[10px] bg-muted text-muted-foreground">Completed</Badge>;
      case "cancelled": return <Badge variant="outline" className="text-[10px] text-red-500 border-red-300">Cancelled</Badge>;
      case "no_show": return <Badge variant="destructive" className="text-[10px]">No Show</Badge>;
      default: return <Badge variant="secondary" className="text-[10px]">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      initial: "Initial Consult",
      follow_up: "Follow-Up",
      lab_review: "Lab Review",
      urgent: "Urgent",
      telehealth: "Telehealth",
      injection: "Injection Visit",
      iv_therapy: "IV Therapy",
    };
    return types[type] || type;
  };

  // Creating/Editing View
  if (isCreating) {
    return (
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              {editingAppt ? "Edit Appointment" : "Schedule Appointment"} — {patientName}
            </CardTitle>
            <Button size="sm" variant="ghost" onClick={() => { setIsCreating(false); setEditingAppt(null); resetForm(); }} className="h-7 w-7 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Date *</Label>
              <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="h-8 text-xs" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Time *</Label>
              <Input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="h-8 text-xs" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Appointment Type</Label>
              <Select value={appointmentType} onValueChange={setAppointmentType}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="initial">Initial Consult</SelectItem>
                  <SelectItem value="follow_up">Follow-Up</SelectItem>
                  <SelectItem value="lab_review">Lab Review</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="telehealth">Telehealth</SelectItem>
                  <SelectItem value="injection">Injection Visit</SelectItem>
                  <SelectItem value="iv_therapy">IV Therapy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Duration (min)</Label>
              <Select value={String(durationMinutes)} onValueChange={(v) => setDurationMinutes(Number(v))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                  <SelectItem value="90">90 min</SelectItem>
                  <SelectItem value="120">120 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Service Line</Label>
              <Select value={selectedServiceLine} onValueChange={setSelectedServiceLine}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hormone">HRT</SelectItem>
                  <SelectItem value="weight_loss">Weight Loss</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Room</Label>
              <Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g., Suite A" className="h-8 text-sm" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isTelehealth" checked={isTelehealth} onChange={(e) => setIsTelehealth(e.target.checked)} className="rounded border-input" />
            <Label htmlFor="isTelehealth" className="text-xs">Telehealth Visit</Label>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Reason for Visit</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g., Monthly follow-up" className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Notes</Label>
            <Textarea value={apptNotes} onChange={(e) => setApptNotes(e.target.value)} placeholder="Additional notes..." className="text-xs resize-none" rows={2} />
          </div>

          <div className="flex justify-between pt-3 border-t">
            <Button variant="ghost" size="sm" onClick={() => { setIsCreating(false); setEditingAppt(null); resetForm(); }}>Cancel</Button>
            <Button size="sm" onClick={saveAppointment} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
              {editingAppt ? "Update" : "Schedule"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // List View
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            Appointments
            {upcomingAppts.length > 0 && <Badge variant="secondary" className="text-xs">{upcomingAppts.length} upcoming</Badge>}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => { resetForm(); setIsCreating(true); }} className="h-7 text-xs">
              <Plus className="w-3 h-3 mr-1" /> Schedule
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-7 w-7 p-0">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-2">
          {isLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No appointments scheduled</p>
              <Button size="sm" variant="link" onClick={() => { resetForm(); setIsCreating(true); }} className="mt-1 text-xs">
                Schedule first appointment
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {/* Upcoming / Today */}
              {upcomingAppts.map(appt => {
                const dt = new Date(appt.scheduled_at);
                const isApptToday = isToday(dt);

                return (
                  <div key={appt.id} className={`p-3 rounded-lg border transition-colors ${
                    isApptToday ? "bg-primary/5 border-primary/30" : "bg-background hover:bg-muted/30"
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(appt.status)}
                        {appt.is_telehealth && (
                          <Badge variant="outline" className="text-[10px] gap-1"><Video className="w-2.5 h-2.5" /> Virtual</Badge>
                        )}
                        {isApptToday && <Badge className="text-[10px] bg-primary text-primary-foreground">Today</Badge>}
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => startEditing(appt)} className="h-6 w-6 p-0">
                        <Pencil className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-medium text-foreground">{format(dt, "MMM d, yyyy")}</span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {format(dt, "h:mm a")} ({appt.duration_minutes}m)
                      </span>
                      {appt.room && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-3 h-3" /> {appt.room}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-1">
                      {getTypeLabel(appt.appointment_type)}
                      {appt.reason && ` — ${appt.reason}`}
                    </p>

                    {/* Action buttons for today's appointments */}
                    {(isApptToday || appt.status === "checked_in") && (
                      <div className="flex items-center gap-2 mt-2">
                        {appt.status === "scheduled" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => checkIn(appt.id)} className="h-7 text-xs gap-1">
                              <LogIn className="w-3 h-3" /> Check In
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => noShow(appt.id)} className="h-7 text-xs text-destructive">
                              No Show
                            </Button>
                          </>
                        )}
                        {appt.status === "checked_in" && (
                          <Button size="sm" onClick={() => checkOut(appt.id)} className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700 text-white">
                            <LogOut className="w-3 h-3" /> Check Out
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => cancelAppt(appt.id)} className="h-7 text-xs text-muted-foreground">
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Past appointments toggle */}
              {pastAppts.length > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPast(!showPast)}
                    className="w-full text-xs text-muted-foreground"
                  >
                    {showPast ? "Hide" : "Show"} {pastAppts.length} past appointment{pastAppts.length > 1 ? "s" : ""}
                  </Button>
                  {showPast && pastAppts.map(appt => {
                    const dt = new Date(appt.scheduled_at);
                    return (
                      <div key={appt.id} className="p-3 rounded-lg border bg-muted/20 opacity-70">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(appt.status)}
                          </div>
                          <span className="text-xs text-muted-foreground">{format(dt, "MMM d, yyyy")}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {getTypeLabel(appt.appointment_type)} — {format(dt, "h:mm a")} ({appt.duration_minutes}m)
                          {appt.reason && ` — ${appt.reason}`}
                        </p>
                        {appt.check_in_at && (
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Checked in: {format(new Date(appt.check_in_at), "h:mm a")}
                            {appt.check_out_at && ` → Out: ${format(new Date(appt.check_out_at), "h:mm a")}`}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default AppointmentPanel;
