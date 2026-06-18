import { useState, useEffect, useMemo } from "react";
import { PatientConsentStatusBadge } from "@/components/provider/PatientConsentStatusBadge";
import {
  getConsentStatusesForPatients,
  type PatientConsentStatus,
} from "@/lib/consents/patient-consent-status";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { format } from "date-fns";
import { ELEVATED_PROGRAMS } from "@/lib/stripeConfig";
import {
  Search,
  MoreHorizontal,
  Package,
  CreditCard,
  MessageSquare,
  Mail,
  Archive,
  ArchiveRestore,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  UserPlus,
} from "lucide-react";

interface Patient {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  onboarding_status: string | null;
  membership_tier: string | null;
  primary_program: string | null;
  service_interests: unknown;
  created_at: string | null;
  is_archived: boolean | null;
  avatar_url: string | null;
  risk_status: string | null;
}

interface PatientDatabaseProps {
  onSelectPatient?: (patientId: string) => void;
  /** Opens patient profile scrolled to consent section (provider dashboard). */
  onConsentNavigate?: (patientId: string) => void;
  onSendKit?: (patient: Patient) => void;
  onSendPayment?: (patient: Patient) => void;
  onMessage?: (patient: Patient) => void;
  onSendEmail?: (patient: Patient) => void;
}

const ITEMS_PER_PAGE = 25;

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  consultation_pending: { label: "Pending Consult", variant: "outline" },
  consultation_paid: { label: "Paid — GFE next", variant: "secondary" },
  gfe_pending: { label: "GFE sent", variant: "secondary" },
  gfe_cleared: { label: "GFE cleared — schedule", variant: "default" },
  consultation_scheduled: { label: "Visit scheduled", variant: "default" },
  prequal_screening_passed: { label: "Screening passed", variant: "outline" },
  prequal_consents_complete: { label: "Consents signed", variant: "outline" },
  consultation_complete: { label: "Consult Complete", variant: "secondary" },
  pending_invite: { label: "Pending Invite", variant: "outline" },
  invited: { label: "Invited", variant: "outline" },
  kit_link_sent: { label: "Labs — pending", variant: "outline" },
  awaiting_blood_work: { label: "Awaiting Lab Draw", variant: "destructive" },
  account_created: { label: "Account Created", variant: "secondary" },
  intake_complete: { label: "Intake Complete", variant: "default" },
  labs_in_progress: { label: "Labs In Progress", variant: "secondary" },
  kit_shipped: { label: "Awaiting Lab Draw", variant: "secondary" },
  labs_paid: { label: "Labs Paid", variant: "outline" },
  results_ready: { label: "Results Ready", variant: "default" },
  labs_reviewed: { label: "Labs Reviewed", variant: "default" },
  protocol_review: { label: "Protocol Review", variant: "secondary" },
  protocol_approved: { label: "Protocol Approved", variant: "default" },
  treatment_active: { label: "Treatment Active", variant: "default" },
  active: { label: "Active", variant: "default" },
  paused: { label: "Paused", variant: "outline" },
  awaiting_medical_clearance: { label: "Awaiting Clearance", variant: "secondary" },
};

const membershipLabels: Record<string, { label: string; color: string }> = {
  elevated_trt: { label: `${ELEVATED_PROGRAMS.trt.name} (${ELEVATED_PROGRAMS.trt.displayPrice})`, color: "bg-emerald-100 text-emerald-900" },
  elevated_hrt: { label: `${ELEVATED_PROGRAMS.hrt.name} (${ELEVATED_PROGRAMS.hrt.displayPrice})`, color: "bg-emerald-100 text-emerald-900" },
  elevated_glp1: { label: `${ELEVATED_PROGRAMS.glp1.name} (${ELEVATED_PROGRAMS.glp1.displayPrice})`, color: "bg-emerald-100 text-emerald-900" },
  elevated_wellness: { label: `${ELEVATED_PROGRAMS.wellness.name} (${ELEVATED_PROGRAMS.wellness.displayPrice})`, color: "bg-emerald-100 text-emerald-900" },
  access: { label: "ACCESS (Legacy)", color: "bg-slate-100 text-slate-800" },
  vitality: { label: "VITALITY (Legacy)", color: "bg-amber-100 text-amber-800" },
  concierge: { label: "CONCIERGE (Legacy)", color: "bg-gold/20 text-gold" },
  semaglutide: { label: "Semaglutide (Legacy)", color: "bg-blue-100 text-blue-800" },
  tirzepatide: { label: "Tirzepatide (Legacy)", color: "bg-purple-100 text-purple-800" },
};

const programLabels: Record<string, string> = {
  hormone: "Hormone",
  weight_loss: "Weight Loss",
  peptide: "Peptide",
  iv_therapy: "IV Therapy",
};

export default function PatientDatabase({
  onSelectPatient,
  onConsentNavigate,
  onSendKit,
  onSendPayment,
  onMessage,
  onSendEmail,
}: PatientDatabaseProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [membershipFilter, setMembershipFilter] = useState<string>("all");
  const [programFilter, setProgramFilter] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletePatient, setDeletePatient] = useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState<string | null>(null);
  const [consentByPatient, setConsentByPatient] = useState<Map<string, PatientConsentStatus>>(new Map());
  const [consentsLoading, setConsentsLoading] = useState(false);

  useEffect(() => {
    loadPatients();
  }, [showArchived]);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("patients")
        .select("id, full_name, email, phone, onboarding_status, membership_tier, primary_program, service_interests, created_at, is_archived, avatar_url, risk_status")
        .order("created_at", { ascending: false });

      if (!showArchived) {
        query = query.or("is_archived.is.null,is_archived.eq.false");
      } else {
        query = query.eq("is_archived", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      console.error("Error loading patients:", error);
      toast.error("Failed to load patients");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = patient.full_name?.toLowerCase().includes(query);
        const matchesEmail = patient.email?.toLowerCase().includes(query);
        const matchesPhone = patient.phone?.includes(query);
        if (!matchesName && !matchesEmail && !matchesPhone) return false;
      }

      // Status filter
      if (statusFilter !== "all" && patient.onboarding_status !== statusFilter) {
        return false;
      }

      // Membership filter
      if (membershipFilter !== "all") {
        if (membershipFilter === "none" && patient.membership_tier) return false;
        if (membershipFilter !== "none" && patient.membership_tier !== membershipFilter) return false;
      }

      // Program filter
      if (programFilter !== "all" && patient.primary_program !== programFilter) {
        return false;
      }

      return true;
    });
  }, [patients, searchQuery, statusFilter, membershipFilter, programFilter]);

  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const pagePatientIdsKey = useMemo(
    () => paginatedPatients.map((p) => p.id).sort().join("|"),
    [paginatedPatients],
  );

  /**
   * Dashboard consent badges — Option A: fetch statuses only for the current page of rows.
   * Post-launch: consider a patient.consent_status_snapshot column (nightly job) or a DB view.
   */
  useEffect(() => {
    const ids = paginatedPatients.map((p) => p.id);
    if (ids.length === 0) {
      setConsentByPatient(new Map());
      setConsentsLoading(false);
      return;
    }
    let cancelled = false;
    setConsentsLoading(true);
    void getConsentStatusesForPatients(ids).then((m) => {
      if (!cancelled) {
        setConsentByPatient(m);
        setConsentsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [pagePatientIdsKey]);

  const handleArchive = async (patient: Patient) => {
    setIsArchiving(patient.id);
    try {
      const { error } = await supabase
        .from("patients")
        .update({ is_archived: !patient.is_archived })
        .eq("id", patient.id);

      if (error) throw error;

      toast.success(patient.is_archived ? "Patient restored" : "Patient archived");
      loadPatients();
    } catch (error: any) {
      console.error("Error archiving patient:", error);
      toast.error("Failed to update patient");
    } finally {
      setIsArchiving(null);
    }
  };

  const handleDelete = async () => {
    if (!deletePatient) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("patients")
        .delete()
        .eq("id", deletePatient.id);

      if (error) throw error;

      toast.success("Patient deleted");
      setDeletePatient(null);
      loadPatients();
    } catch (error: any) {
      console.error("Error deleting patient:", error);
      toast.error("Failed to delete patient. They may have related records.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="consultation_pending">Pending Consult</SelectItem>
            <SelectItem value="consultation_complete">Consult Complete</SelectItem>
            <SelectItem value="pending_invite">Pending Invite</SelectItem>
            <SelectItem value="invited">Invited</SelectItem>
            <SelectItem value="kit_link_sent">Kit Link Sent</SelectItem>
            <SelectItem value="account_created">Account Created</SelectItem>
            <SelectItem value="intake_complete">Intake Complete</SelectItem>
            <SelectItem value="labs_in_progress">Labs In Progress</SelectItem>
            <SelectItem value="kit_shipped">Kit Shipped</SelectItem>
            <SelectItem value="results_ready">Results Ready</SelectItem>
            <SelectItem value="labs_reviewed">Labs Reviewed</SelectItem>
            <SelectItem value="protocol_review">Protocol Review</SelectItem>
            <SelectItem value="treatment_active">Treatment Active</SelectItem>
            <SelectItem value="active">Active</SelectItem>
          </SelectContent>
        </Select>

        <Select value={membershipFilter} onValueChange={(v) => { setMembershipFilter(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Membership" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Memberships</SelectItem>
            <SelectItem value="none">No Membership</SelectItem>
            <SelectItem value="elevated_trt">{ELEVATED_PROGRAMS.trt.name}</SelectItem>
            <SelectItem value="elevated_hrt">{ELEVATED_PROGRAMS.hrt.name}</SelectItem>
            <SelectItem value="elevated_glp1">{ELEVATED_PROGRAMS.glp1.name}</SelectItem>
            <SelectItem value="elevated_wellness">{ELEVATED_PROGRAMS.wellness.name}</SelectItem>
            <SelectItem value="access">ACCESS (Legacy)</SelectItem>
            <SelectItem value="vitality">VITALITY (Legacy)</SelectItem>
            <SelectItem value="concierge">CONCIERGE (Legacy)</SelectItem>
            <SelectItem value="semaglutide">Semaglutide (Legacy)</SelectItem>
            <SelectItem value="tirzepatide">Tirzepatide (Legacy)</SelectItem>
          </SelectContent>
        </Select>

        <Select value={programFilter} onValueChange={(v) => { setProgramFilter(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Program" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programs</SelectItem>
            <SelectItem value="hormone">Hormone</SelectItem>
            <SelectItem value="weight_loss">Weight Loss</SelectItem>
            <SelectItem value="iv_therapy">IV Therapy</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={showArchived ? "default" : "outline"}
          size="sm"
          onClick={() => { setShowArchived(!showArchived); setCurrentPage(1); }}
          className="gap-2"
        >
          <Archive className="h-4 w-4" />
          {showArchived ? "Showing Archived" : "Show Archived"}
        </Button>

        <Button variant="outline" size="icon" onClick={loadPatients} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="whitespace-nowrap">Consents</TableHead>
              <TableHead>Membership</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : paginatedPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No patients found
                </TableCell>
              </TableRow>
            ) : (
              paginatedPatients.map((patient) => (
                <TableRow key={patient.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell onClick={() => onSelectPatient?.(patient.id)}>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={patient.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(patient.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{patient.full_name}</p>
                        {patient.risk_status === "high_risk_review" && (
                          <Badge variant="destructive" className="text-xs">High Risk</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {patient.email && <p className="text-muted-foreground">{patient.email}</p>}
                      {patient.phone && <p className="text-muted-foreground">{patient.phone}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {patient.onboarding_status && statusLabels[patient.onboarding_status] ? (
                      <Badge variant={statusLabels[patient.onboarding_status].variant}>
                        {statusLabels[patient.onboarding_status].label}
                      </Badge>
                    ) : (
                      <Badge variant="outline">{patient.onboarding_status || "Unknown"}</Badge>
                    )}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <PatientConsentStatusBadge
                      status={consentByPatient.get(patient.id)}
                      loading={consentsLoading}
                      onNavigateConsent={
                        onConsentNavigate ? () => onConsentNavigate(patient.id) : undefined
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {patient.membership_tier && membershipLabels[patient.membership_tier] ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${membershipLabels[patient.membership_tier].color}`}>
                        {membershipLabels[patient.membership_tier].label}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {patient.service_interests && Array.isArray(patient.service_interests) && patient.service_interests.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {patient.service_interests.map((interest: string) => (
                          <Badge key={interest} variant="outline" className="text-xs">
                            {programLabels[interest] || interest}
                          </Badge>
                        ))}
                      </div>
                    ) : patient.primary_program ? (
                      <span className="text-sm">{programLabels[patient.primary_program] || patient.primary_program}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {patient.created_at ? format(new Date(patient.created_at), "MMM d, yyyy") : "—"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onSelectPatient?.(patient.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onSendKit?.(patient)}>
                          <Package className="h-4 w-4 mr-2" />
                          Send Kit Link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSendPayment?.(patient)}>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Send Payment Link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onMessage?.(patient)}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message Patient
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSendEmail?.(patient)}>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleArchive(patient)}
                          disabled={isArchiving === patient.id}
                        >
                          {patient.is_archived ? (
                            <>
                              <ArchiveRestore className="h-4 w-4 mr-2" />
                              Restore Patient
                            </>
                          ) : (
                            <>
                              <Archive className="h-4 w-4 mr-2" />
                              Archive Patient
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeletePatient(patient)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Patient
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredPatients.length)} of{" "}
            {filteredPatients.length} patients
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletePatient} onOpenChange={() => setDeletePatient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Patient</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletePatient?.full_name}</strong>? This action cannot be undone. All associated data (symptom logs, orders, lab results) will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Patient"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
