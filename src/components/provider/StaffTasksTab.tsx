import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Pill, 
  Phone, 
  Check, 
  Clock, 
  AlertTriangle,
  Calendar,
  FileText,
  ClipboardCheck,
  Send,
  TestTube,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LabDrawTask {
  id: string;
  full_name: string;
  email: string | null;
  onboarding_status: string;
  updated_at: string | null;
}

interface ConsultationFollowUp {
  id: string;
  customer_email: string;
  customer_name: string | null;
  status: string;
  credit_code: string | null;
  created_at: string;
  booked_for: string | null;
}

interface PharmacyOrder {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  updated_at: string | null;
}

interface WaiverTask {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  primary_program: string | null;
  consent_sent_at: string | null;
  consent_completed_at: string | null;
  consent_method: string | null;
  created_at: string | null;
}

const StaffTasksTab = () => {
  const [labDrawTasks, setLabDrawTasks] = useState<LabDrawTask[]>([]);
  const [consultationFollowUps, setConsultationFollowUps] = useState<ConsultationFollowUp[]>([]);
  const [pharmacyOrders, setPharmacyOrders] = useState<PharmacyOrder[]>([]);
  const [waiverTasks, setWaiverTasks] = useState<WaiverTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const { data: labPatients } = await supabase
        .from("patients")
        .select("id, full_name, email, onboarding_status, updated_at")
        .in("onboarding_status", ["awaiting_blood_work", "labs_in_progress", "labs_paid", "kit_shipped"])
        .order("updated_at", { ascending: true });

      setLabDrawTasks((labPatients || []) as LabDrawTask[]);

      // Load consultation follow-ups (pending consultations that need scheduling or completed ones needing nurture)
      const { data: consultations } = await supabase
        .from("consultation_bookings")
        .select("id, customer_email, customer_name, status, credit_code, created_at, booked_for")
        .in("status", ["pending", "completed", "nurture"])
        .order("created_at", { ascending: true });

      setConsultationFollowUps((consultations || []) as ConsultationFollowUp[]);

      // Load pharmacy orders pending
      const { data: pharmacy } = await supabase
        .from("patients")
        .select("id, full_name, email, phone, updated_at")
        .eq("onboarding_status", "pending_pharmacy_order")
        .order("updated_at", { ascending: true });

      setPharmacyOrders((pharmacy || []) as PharmacyOrder[]);

      // Load waiver tasks - patients who need consent sent or completed
      const { data: waivers } = await supabase
        .from("patients")
        .select("id, full_name, email, phone, primary_program, consent_sent_at, consent_completed_at, consent_method, created_at")
        .or("consent_sent_at.is.null,consent_completed_at.is.null")
        .not("intake_completed", "eq", true)
        .order("created_at", { ascending: true });

      setWaiverTasks((waivers || []) as WaiverTask[]);
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast.error("Failed to load staff tasks");
    } finally {
      setIsLoading(false);
    }
  };

  const advanceLabStatus = async (patientId: string, nextStatus: string) => {
    setProcessingId(patientId);
    try {
      const { error } = await supabase
        .from("patients")
        .update({ onboarding_status: nextStatus, lab_path: "labcorp" })
        .eq("id", patientId);

      if (error) throw error;
      toast.success("Lab status updated");
      loadTasks();
    } catch (error) {
      toast.error("Failed to update lab status");
    } finally {
      setProcessingId(null);
    }
  };

  const markConsultationScheduled = async (id: string) => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from("consultation_bookings")
        .update({ status: "scheduled" })
        .eq("id", id);

      if (error) throw error;
      toast.success("Consultation marked as scheduled");
      loadTasks();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  const markPharmacyOrdered = async (id: string) => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from("patients")
        .update({ onboarding_status: "treatment_active" })
        .eq("id", id);

      if (error) throw error;
      toast.success("Pharmacy order marked complete");
      loadTasks();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  const markConsentSent = async (id: string, method: "osmind" | "internal") => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from("patients")
        .update({ 
          consent_sent_at: new Date().toISOString(),
          consent_method: method
        })
        .eq("id", id);

      if (error) throw error;
      toast.success(method === "osmind" ? "Osmind invite marked as sent" : "Intake link marked as sent");
      loadTasks();
    } catch (error) {
      toast.error("Failed to update consent status");
    } finally {
      setProcessingId(null);
    }
  };

  const sendIntakeLink = async (patient: WaiverTask) => {
    setProcessingId(patient.id);
    try {
      // Call dedicated edge function to send intake link (not payment invite)
      const { data, error } = await supabase.functions.invoke("send-intake-link", {
        body: {
          patientId: patient.id,
          patientName: patient.full_name,
          patientEmail: patient.email,
          patientPhone: patient.phone,
        }
      });

      if (error) throw error;

      // The edge function already updates consent_sent_at
      const successMsg = data.email_sent && data.sms_sent 
        ? "Intake link sent via email & SMS" 
        : data.email_sent 
        ? "Intake link sent via email"
        : data.sms_sent
        ? "Intake link sent via SMS"
        : "Intake link generated";
      
      toast.success(successMsg);
      loadTasks();
    } catch (error) {
      console.error("Error sending intake link:", error);
      toast.error("Failed to send intake link");
    } finally {
      setProcessingId(null);
    }
  };

  const getDaysWaiting = (dateStr: string) => {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getHoursWaiting = (dateStr: string) => {
    const hours = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60));
    return hours;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold" />
      </div>
    );
  }

  // Split waiver tasks by type
  const internalWaivers = waiverTasks.filter((w) => w.primary_program !== "ketamine");

  const totalTasks = labDrawTasks.length + consultationFollowUps.length + pharmacyOrders.length + waiverTasks.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TestTube className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-700">{labDrawTasks.length}</p>
                <p className="text-sm text-green-600">LabCorp Draws</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Phone className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-700">{consultationFollowUps.length}</p>
                <p className="text-sm text-blue-600">Consultation Follow-ups</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Pill className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-700">{pharmacyOrders.length}</p>
                <p className="text-sm text-purple-600">Pharmacy Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="h-8 w-8 text-amber-600" />
              <div>
                <p className="text-2xl font-bold text-amber-700">{waiverTasks.length}</p>
                <p className="text-sm text-amber-600">Waivers to Send</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {totalTasks === 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-12 text-center">
            <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-700">All Caught Up!</h3>
            <p className="text-green-600">No pending staff tasks at this time.</p>
          </CardContent>
        </Card>
      )}

      {internalWaivers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-amber-600" />
              Intake Waivers to Send
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">In-App Consent</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {internalWaivers.map((patient) => {
                const hoursWaiting = patient.created_at ? getHoursWaiting(patient.created_at) : 0;
                const isUrgent = hoursWaiting > 2;
                const isSent = !!patient.consent_sent_at;
                
                return (
                  <div 
                    key={patient.id} 
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      isUrgent && !isSent ? "border-yellow-300 bg-yellow-50" : "bg-muted/30"
                    }`}
                  >
                    <div>
                      <p className="font-medium">{patient.full_name}</p>
                      <p className="text-sm text-muted-foreground">{patient.email}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        <span>Added {hoursWaiting} hour(s) ago</span>
                        {patient.primary_program && (
                          <Badge variant="outline" className="text-muted-foreground">
                            {patient.primary_program}
                          </Badge>
                        )}
                        {isUrgent && !isSent && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-400">
                            <AlertTriangle className="h-3 w-3 mr-1" /> {"> 2hrs"}
                          </Badge>
                        )}
                        {isSent && (
                          <Badge className="bg-green-100 text-green-700">
                            <Check className="h-3 w-3 mr-1" /> Sent
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!isSent ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendIntakeLink(patient)}
                            disabled={processingId === patient.id}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            {processingId === patient.id ? "..." : "Send Link"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markConsentSent(patient.id, "internal")}
                            disabled={processingId === patient.id}
                          >
                            Mark Sent
                          </Button>
                        </>
                      ) : (
                        <span className="text-sm text-green-600">Waiting for patient...</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* LabCorp draws */}
      {labDrawTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-green-600" />
              LabCorp — schedule / confirm draw
              <Badge variant="secondary" className="bg-green-100 text-green-700">Staff Task</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {labDrawTasks.map((p) => {
                const daysWaiting = p.updated_at ? getDaysWaiting(p.updated_at) : 0;
                const nextStatus =
                  p.onboarding_status === "labs_in_progress" ? "results_ready" : "labs_in_progress";
                const actionLabel =
                  p.onboarding_status === "labs_in_progress" ? "Results in" : "Draw complete";
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      daysWaiting > 3 ? "border-yellow-300 bg-yellow-50" : "bg-muted/30"
                    }`}
                  >
                    <div>
                      <p className="font-medium">{p.full_name}</p>
                      <p className="text-sm text-muted-foreground">{p.email}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {p.onboarding_status}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => void advanceLabStatus(p.id, nextStatus)}
                      disabled={processingId === p.id}
                    >
                      {processingId === p.id ? "..." : actionLabel}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consultation Follow-ups */}
      {consultationFollowUps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-600" />
              Consultation Follow-ups
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">Staff Task</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {consultationFollowUps.map((consult) => {
                const daysWaiting = getDaysWaiting(consult.created_at);
                return (
                  <div 
                    key={consult.id} 
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      daysWaiting > 3 ? "border-yellow-300 bg-yellow-50" : "bg-muted/30"
                    }`}
                  >
                    <div>
                      <p className="font-medium">{consult.customer_name || consult.customer_email}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Status: {consult.status}</span>
                        {consult.credit_code && (
                          <Badge variant="outline" className="text-green-600">
                            Credit: {consult.credit_code}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        <span>Paid {daysWaiting} day(s) ago</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {consult.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markConsultationScheduled(consult.id)}
                          disabled={processingId === consult.id}
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          Mark Scheduled
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pharmacy Orders */}
      {pharmacyOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-purple-600" />
              Pharmacy Orders to Place
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">Staff Task</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pharmacyOrders.map((order) => {
                const daysWaiting = order.updated_at ? getDaysWaiting(order.updated_at) : 0;
                return (
                  <div 
                    key={order.id} 
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      daysWaiting > 1 ? "border-yellow-300 bg-yellow-50" : "bg-muted/30"
                    }`}
                  >
                    <div>
                      <p className="font-medium">{order.full_name}</p>
                      <p className="text-sm text-muted-foreground">{order.email}</p>
                      {order.phone && (
                        <p className="text-sm text-muted-foreground">{order.phone}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => markPharmacyOrdered(order.id)}
                      disabled={processingId === order.id}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      {processingId === order.id ? "..." : "Order Placed"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card className="bg-muted/20">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2 text-sm">Task Legend</h4>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-100 border border-green-300" />
              <span>Staff Task (can be delegated)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-100 border border-blue-300" />
              <span>Osmind (external)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
              <span>In-App Consent</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-50 border border-yellow-300" />
              <span>Overdue - needs attention</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-50 border border-red-300" />
              <span>Urgent ({"> "}2 hours)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffTasksTab;
