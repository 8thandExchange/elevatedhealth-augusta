import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Calendar, 
  Phone, 
  Mail, 
  Gift, 
  Clock, 
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  UserPlus,
  Loader2,
  CalendarPlus,
  Archive,
  Trash2,
  RotateCcw,
  Info,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LogFreeConsultationModal from "./LogFreeConsultationModal";
import {
  formatConsultationAmount,
  isAwaitingConsultPayment,
  isPaidConsultation,
} from "@/lib/consultationBookingDisplay";

interface ConsultationBooking {
  id: string;
  customer_email: string;
  customer_name: string | null;
  customer_phone: string | null;
  amount_paid: number | null;
  status: string;
  credit_code: string | null;
  credit_used_at: string | null;
  follow_up_date: string | null;
  notes: string | null;
  service_type: string | null;
  created_at: string;
  stripe_session_id: string | null;
  booked_for: string | null;
}

const ConsultationTracker = () => {
  const [consultations, setConsultations] = useState<ConsultationBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationBooking | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isConverting, setIsConverting] = useState<string | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [syncingSessionId, setSyncingSessionId] = useState<string | null>(null);

  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("consultation_bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setConsultations(data || []);
    } catch (error) {
      console.error("Error loading consultations:", error);
      toast.error("Failed to load consultations");
    } finally {
      setIsLoading(false);
    }
  };

  const syncStripePayment = async (consult: ConsultationBooking) => {
    if (!consult.stripe_session_id) {
      toast.error("No Stripe session on this row — resend the payment invite");
      return;
    }
    setSyncingSessionId(consult.stripe_session_id);
    try {
      const { data, error } = await supabase.functions.invoke("verify-consultation-payment", {
        body: { session_id: consult.stripe_session_id },
      });
      if (error) throw error;
      if (!data?.success) {
        throw new Error(data?.error || "Stripe reports payment not completed");
      }
      toast.success(
        data.already_recorded
          ? "Payment already recorded — refreshed list"
          : `Payment synced · code ${data.credit_code}`,
      );
      await loadConsultations();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not sync payment from Stripe";
      toast.error(msg);
    } finally {
      setSyncingSessionId(null);
    }
  };

  const updateConsultation = async () => {
    if (!selectedConsultation) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("consultation_bookings")
        .update({
          status: editStatus,
          notes: editNotes,
        })
        .eq("id", selectedConsultation.id);

      if (error) throw error;
      toast.success("Consultation updated");
      loadConsultations();
      setSelectedConsultation(null);
    } catch (error) {
      toast.error("Failed to update consultation");
    } finally {
      setIsSaving(false);
    }
  };

  const archiveConsultation = async (id: string) => {
    setIsArchiving(true);
    try {
      const { error } = await supabase
        .from("consultation_bookings")
        .update({ status: "archived" })
        .eq("id", id);

      if (error) throw error;
      toast.success("Consultation archived");
      loadConsultations();
      setSelectedConsultation(null);
    } catch (error) {
      console.error("Error archiving consultation:", error);
      toast.error("Failed to archive consultation");
    } finally {
      setIsArchiving(false);
    }
  };

  const restoreConsultation = async (id: string) => {
    setIsArchiving(true);
    try {
      const { error } = await supabase
        .from("consultation_bookings")
        .update({ status: "pending" })
        .eq("id", id);

      if (error) throw error;
      toast.success("Consultation restored");
      loadConsultations();
      setSelectedConsultation(null);
    } catch (error) {
      console.error("Error restoring consultation:", error);
      toast.error("Failed to restore consultation");
    } finally {
      setIsArchiving(false);
    }
  };

  const deleteConsultation = async (id: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("consultation_bookings")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Consultation permanently deleted");
      loadConsultations();
      setSelectedConsultation(null);
    } catch (error) {
      console.error("Error deleting consultation:", error);
      toast.error("Failed to delete consultation");
    } finally {
      setIsDeleting(false);
    }
  };

  const convertToPatient = async (consult: ConsultationBooking) => {
    if (!consult.customer_email || !consult.customer_name) {
      toast.error("Customer name and email are required");
      return;
    }

    setIsConverting(consult.id);
    try {
      const serviceType = consult.service_type?.toLowerCase() || '';
      const isWeightLoss = serviceType.includes('weight') || serviceType.includes('glp') || serviceType.includes('semaglutide') || serviceType.includes('tirzepatide');
      const isPeptide = serviceType.includes('peptide');
      // Legacy mapping path removed — labs are drawn in-office (LabCorp) for current patients.
      // consult via LabCorp client billing; no separate kit payment.

      if (isWeightLoss) {
        // Weight Loss flow: Create patient directly, no kit needed
        const { data: existingPatient } = await supabase
          .from("patients")
          .select("id")
          .eq("email", consult.customer_email)
          .maybeSingle();
          
        if (existingPatient) {
          // Update existing patient
          await supabase
            .from("patients")
            .update({ 
              onboarding_status: "awaiting_medical_clearance",
              primary_program: "weight_loss",
              treatment_request: "weight_loss",
              consultation_booking_id: consult.id,
            })
            .eq("id", existingPatient.id);
        } else {
          // Create new patient
          await supabase
            .from("patients")
            .insert({
              full_name: consult.customer_name,
              email: consult.customer_email,
              phone: consult.customer_phone,
              onboarding_status: "awaiting_medical_clearance",
              primary_program: "weight_loss",
              treatment_request: "weight_loss",
              consultation_booking_id: consult.id,
            });
        }
        
        await supabase
          .from("consultation_bookings")
          .update({ status: "converted_to_glp1" })
          .eq("id", consult.id);
          
        toast.success(`${consult.customer_name} added as Weight Loss patient - ready for medical clearance`);
      } else {
        // Hormone / peptide / general consult conversion. No external kit
        // payment — labs are drawn on-site at the consult via LabCorp.
        const program = isPeptide ? "peptide" : "hormone";
        const { data: existingPatient } = await supabase
          .from("patients")
          .select("id")
          .eq("email", consult.customer_email)
          .maybeSingle();

        const patch = {
          onboarding_status: "consultation_pending",
          primary_program: program,
          treatment_request: program,
          consultation_booking_id: consult.id,
        };

        if (existingPatient) {
          await supabase.from("patients").update(patch).eq("id", existingPatient.id);
        } else {
          await supabase.from("patients").insert({
            full_name: consult.customer_name,
            email: consult.customer_email,
            phone: consult.customer_phone,
            ...patch,
          });
        }

        await supabase
          .from("consultation_bookings")
          .update({ status: program === "peptide" ? "converted_to_peptide" : "converted_to_hormone" })
          .eq("id", consult.id);

        // Fire-and-forget welcome email so the patient knows what to expect
        // before the visit.
        supabase.functions.invoke("send-welcome-email", {
          body: {
            email: consult.customer_email,
            patient_email: consult.customer_email,
            first_name: (consult.customer_name || "").trim().split(/\s+/)[0] || undefined,
            last_name: (consult.customer_name || "").trim().split(/\s+/).slice(1).join(" ") || undefined,
            primary_program: program,
          },
        }).catch((err) => console.error("send-welcome-email error", err));

        toast.success(`${consult.customer_name} added as ${program === "peptide" ? "Peptide" : "Hormone"} patient`);
      }
      
      loadConsultations();
      setSelectedConsultation(null);
    } catch (err: any) {
      console.error("Convert error:", err);
      toast.error(err.message || "Failed to convert to patient");
    } finally {
      setIsConverting(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
      case "pending_payment":
        return <Badge variant="outline" className="text-amber-700 border-amber-400">Awaiting payment</Badge>;
      case "paid":
        return <Badge className="bg-emerald-600">Paid — schedule visit</Badge>;
      case "scheduled":
        return <Badge variant="outline" className="text-blue-600 border-blue-400">Scheduled</Badge>;
      case "completed":
        return <Badge variant="outline" className="text-green-600 border-green-400">Completed</Badge>;
      case "converted_to_hormone":
        return <Badge className="bg-green-600">Converted to Hormone</Badge>;
      case "converted_to_peptide":
        return <Badge className="bg-green-600">Converted to Peptide</Badge>;
      case "converted_to_glp1":
        return <Badge className="bg-green-600">Converted to GLP-1</Badge>;
      // Legacy statuses, still possible on historical rows.
      case "converted_to_mapping":
        return <Badge className="bg-green-600">Converted (legacy)</Badge>;
      case "converted_to_ketamine":
        return <Badge className="bg-green-600">Converted (legacy)</Badge>;
      case "nurture":
        return <Badge variant="outline" className="text-purple-600 border-purple-400">In Nurture</Badge>;
      case "lost":
        return <Badge variant="outline" className="text-red-600 border-red-400">Lost</Badge>;
      case "archived":
        return <Badge variant="outline" className="text-gray-500 border-gray-300">Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDaysAgo = (dateStr: string) => {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  // Filter logic: when showArchived, show only archived; otherwise exclude archived
  const filteredConsultations = showArchived
    ? consultations.filter(c => c.status === "archived")
    : filterStatus === "all"
      ? consultations.filter(c => c.status !== "archived")
      : filterStatus === "awaiting_payment"
        ? consultations.filter(c => isAwaitingConsultPayment(c.status) && c.status !== "archived")
        : filterStatus === "paid_unscheduled"
          ? consultations.filter(c => isPaidConsultation(c.status) && !c.booked_for && c.status !== "archived")
          : consultations.filter(c => c.status === filterStatus && c.status !== "archived");

  const stats = {
    total: consultations.filter(c => c.status !== "archived").length,
    awaitingPayment: consultations.filter(c => isAwaitingConsultPayment(c.status)).length,
    paid: consultations.filter(c => isPaidConsultation(c.status)).length,
    paidUnscheduled: consultations.filter(c => isPaidConsultation(c.status) && !c.booked_for).length,
    scheduled: consultations.filter(c => c.status === "scheduled").length,
    completed: consultations.filter(c => c.status === "completed").length,
    converted: consultations.filter(c =>
      c.status === "converted_to_hormone" ||
      c.status === "converted_to_peptide" ||
      c.status === "converted_to_glp1" ||
      // historical statuses for backward compatibility
      c.status === "converted_to_mapping" ||
      c.status === "converted_to_ketamine"
    ).length,
    archived: consultations.filter(c => c.status === "archived").length,
  };

  const conversionRate = stats.total > 0 
    ? Math.round((stats.converted / stats.total) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-muted/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Active</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-700">{stats.awaitingPayment}</p>
            <p className="text-xs text-yellow-600">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-700">{stats.paidUnscheduled}</p>
            <p className="text-xs text-emerald-600">Paid — needs time</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{stats.scheduled}</p>
            <p className="text-xs text-blue-600">Scheduled</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{stats.converted}</p>
            <p className="text-xs text-green-600">Converted</p>
          </CardContent>
        </Card>
        <Card className="bg-accent/10 border-gold/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-accent">{conversionRate}%</p>
            <p className="text-xs text-accent">Conversion Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Actions */}
      <div className="flex flex-wrap items-center gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Info className="h-4 w-4" />
                <span className="text-xs">Leads vs Patients</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                <strong>Awaiting payment</strong> — invite sent, Stripe not completed yet. Use <strong>Sync Stripe</strong> if they say they paid.
                <br /><br />
                <strong>Paid — schedule visit</strong> — card captured; patient needs a time on the calendar.
                <br /><br />
                <strong>All Patients</strong> — full chart records (Add Patient or auto-created after payment).
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Label>Filter:</Label>
        <Select value={filterStatus} onValueChange={setFilterStatus} disabled={showArchived}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Active</SelectItem>
            <SelectItem value="awaiting_payment">Awaiting payment</SelectItem>
            <SelectItem value="paid_unscheduled">Paid — needs time</SelectItem>
            <SelectItem value="paid">Paid (all)</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="converted_to_hormone">Converted (Hormone)</SelectItem>
            <SelectItem value="converted_to_peptide">Converted (Peptide)</SelectItem>
            <SelectItem value="converted_to_glp1">Converted (GLP-1)</SelectItem>
            <SelectItem value="nurture">In Nurture</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          variant={showArchived ? "default" : "outline"} 
          size="sm"
          onClick={() => setShowArchived(!showArchived)}
          className="gap-2"
        >
          <Archive className="h-4 w-4" />
          {showArchived ? `Viewing Archived (${stats.archived})` : "Show Archived"}
        </Button>

        <Button variant="outline" size="sm" onClick={loadConsultations}>
          Refresh
        </Button>
        <div className="flex-1" />
        <Button onClick={() => setIsLogModalOpen(true)} className="gap-2">
          <CalendarPlus className="h-4 w-4" />
          Log Free Consultation
        </Button>
      </div>

      {/* Consultations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {showArchived ? (
              <>
                <Archive className="h-5 w-5" />
                Archived Consultations
              </>
            ) : (
              <>
                <Calendar className="h-5 w-5" />
                Wellness Assessment consults
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredConsultations.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {showArchived ? "No archived consultations" : "No consultations found"}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredConsultations.map((consult) => (
                <div 
                  key={consult.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedConsultation?.id === consult.id ? "border-gold bg-accent/5" : ""
                  } ${consult.status === "archived" ? "opacity-60" : ""}`}
                  onClick={() => {
                    setSelectedConsultation(consult);
                    setEditNotes(consult.notes || "");
                    setEditStatus(consult.status);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {consult.customer_name || consult.customer_email}
                        </span>
                        {getStatusBadge(consult.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {consult.customer_email}
                        </span>
                        {consult.customer_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {consult.customer_phone}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getDaysAgo(consult.created_at)}
                        </span>
                        {consult.credit_code && (
                          <span className="flex items-center gap-1 text-green-600">
                            <Gift className="h-3 w-3" />
                            {consult.credit_code}
                            {consult.credit_used_at && " (Used)"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatConsultationAmount(consult.amount_paid)}
                        </p>
                        <p className="text-xs text-muted-foreground">{consult.service_type}</p>
                      </div>
                      {/* Inline action icons */}
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {isAwaitingConsultPayment(consult.status) && consult.stripe_session_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            disabled={syncingSessionId === consult.stripe_session_id}
                            onClick={() => void syncStripePayment(consult)}
                          >
                            {syncingSessionId === consult.stripe_session_id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "Sync Stripe"
                            )}
                          </Button>
                        )}
                        {consult.status === "archived" ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-green-600"
                                  onClick={() => restoreConsultation(consult.id)}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Restore</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-orange-600"
                                  onClick={() => archiveConsultation(consult.id)}
                                >
                                  <Archive className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Archive</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <AlertDialog>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                              </TooltipTrigger>
                              <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Permanently Delete?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Delete consultation for <strong>{consult.customer_name || consult.customer_email}</strong>? This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteConsultation(consult.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Panel */}
      {selectedConsultation && (
        <Card className="border-gold">
          <CardHeader>
            <CardTitle className="text-lg">
              Edit: {selectedConsultation.customer_name || selectedConsultation.customer_email}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending Booking</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="converted_to_hormone">Converted to Hormone</SelectItem>
                  <SelectItem value="converted_to_peptide">Converted to Peptide</SelectItem>
                  <SelectItem value="converted_to_glp1">Converted to GLP-1</SelectItem>
                  <SelectItem value="nurture">In Nurture</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add notes about this consultation..."
                rows={3}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={updateConsultation} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              
              {/* Convert to Patient button - only show if not already converted or archived */}
              {!selectedConsultation.status.startsWith("converted") && selectedConsultation.status !== "archived" && (
                <Button 
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 gap-2"
                  onClick={() => convertToPatient(selectedConsultation)}
                  disabled={isConverting === selectedConsultation.id || !selectedConsultation.customer_name}
                >
                  {isConverting === selectedConsultation.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Convert to Patient
                    </>
                  )}
                </Button>
              )}

              {/* Archive/Restore button */}
              {selectedConsultation.status === "archived" ? (
                <Button 
                  variant="outline"
                  className="gap-2"
                  onClick={() => restoreConsultation(selectedConsultation.id)}
                  disabled={isArchiving}
                >
                  {isArchiving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                  Restore
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  className="gap-2 text-orange-600 border-orange-300 hover:bg-orange-50"
                  onClick={() => archiveConsultation(selectedConsultation.id)}
                  disabled={isArchiving}
                >
                  {isArchiving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Archive className="h-4 w-4" />
                  )}
                  Archive
                </Button>
              )}

              {/* Delete button with confirmation */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline"
                    className="gap-2 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Permanently Delete Consultation?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove this consultation record for{" "}
                      <strong>{selectedConsultation.customer_name || selectedConsultation.customer_email}</strong>.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteConsultation(selectedConsultation.id)}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete Permanently"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button variant="ghost" onClick={() => setSelectedConsultation(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <LogFreeConsultationModal 
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSuccess={loadConsultations}
      />
    </div>
  );
};

export default ConsultationTracker;
