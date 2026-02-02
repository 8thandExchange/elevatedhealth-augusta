import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, AlertTriangle, Check, User, TrendingUp, TrendingDown, X, Send, ShieldCheck, ShieldAlert, TestTube, Droplet, Activity, MessageSquare, Pill, Phone, Mail, Save, Clock, CreditCard, RotateCcw, CheckSquare, Square, UserPlus, FileText, MessageCircle, Ban, Archive, Trash2, ArchiveRestore, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import confetti from "canvas-confetti";
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
import { Label } from "@/components/ui/label";
import LabAnalysisCard from "@/components/provider/LabAnalysisCard";
import { LabInterpretationEngine } from "@/components/provider/LabInterpretationEngine";
import LabCorpRequisition from "@/components/provider/LabCorpRequisition";
import ZRTRequisitionGenerator from "@/components/provider/ZRTRequisitionGenerator";
import HormoneAddonSelector from "@/components/provider/HormoneAddonSelector";
import PeptideAddonSelector from "@/components/provider/PeptideAddonSelector";
import HairRestorationAddonSelector from "@/components/provider/HairRestorationAddonSelector";
import SexualWellnessAddonSelector from "@/components/provider/SexualWellnessAddonSelector";
import AlaCartePaymentCard from "@/components/provider/AlaCartePaymentCard";
import PharmacyOrderCard from "@/components/provider/PharmacyOrderCard";
import EditPatientProfileModal from "@/components/provider/EditPatientProfileModal";
import InvitePatientCard from "@/components/provider/InvitePatientCard";
import AddExistingPatientCard from "@/components/provider/AddExistingPatientCard";
import SuperbillGenerator from "@/components/provider/SuperbillGenerator";
import AdminNavbar from "@/components/admin/AdminNavbar";
import ProviderInbox from "@/components/chat/ProviderInbox";
import KitStatusAdmin from "@/components/provider/KitStatusAdmin";
import ResourceManager from "@/components/provider/ResourceManager";
import IVKetamineBilling from "@/components/provider/IVKetamineBilling";
import { InviteProviderModal } from "@/components/provider/InviteProviderModal";
import LabcorpOrderModal from "@/components/provider/LabcorpOrderModal";
import BloodWorkHistory from "@/components/provider/BloodWorkHistory";
import TeamManagement from "@/components/provider/TeamManagement";
import StaffTasksTab from "@/components/provider/StaffTasksTab";
import ConsultationTracker from "@/components/provider/ConsultationTracker";
import PatientPipeline from "@/components/provider/PatientPipeline";
import SupplementPlanCard from "@/components/provider/SupplementPlanCard";
import FaxHistoryLog from "@/components/provider/FaxHistoryLog";
import PatientStatusCard from "@/components/provider/PatientStatusCard";
import { SendKitLinkCard } from "@/components/provider/SendKitLinkCard";
import MembershipAssignmentCard from "@/components/provider/MembershipAssignmentCard";
import ProviderAssistant from "@/components/provider/ProviderAssistant";
import OsmindInviteCard from "@/components/provider/OsmindInviteCard";
import ConsentPDFCard from "@/components/provider/ConsentPDFCard";
import CreditCodeLookup from "@/components/provider/CreditCodeLookup";
import ResendWelcomeEmailButton from "@/components/provider/ResendWelcomeEmailButton";
import ProviderQuickActions from "@/components/provider/ProviderQuickActions";
import PatientDatabase from "@/components/provider/PatientDatabase";
import DashboardActivityWidget from "@/components/provider/DashboardActivityWidget";
import NextActionsWidget from "@/components/provider/NextActionsWidget";
import CommunicationLog from "@/components/provider/CommunicationLog";
import { PatientJourneyTracker } from "@/components/provider/PatientJourneyTracker";
import MedicalClearanceCard from "@/components/provider/MedicalClearanceCard";
import EncounterFormModal from "@/components/provider/EncounterFormModal";
import TodayScheduleWidget from "@/components/provider/TodayScheduleWidget";
import PatientNotesCard from "@/components/provider/PatientNotesCard";

interface Patient {
  id: string;
  full_name: string;
  safety_flags: any;
  current_protocol: string | null;
  risk_status: string | null;
  medical_history: any;
  gender?: string;
  treatment_request?: string;
  lab_path?: string;
  dob?: string;
  phone?: string;
  email?: string;
  street_address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  allergies?: string | null;
  onboarding_status?: string;
  is_archived?: boolean;
  membership_tier?: string | null;
  membership_renewal_date?: string | null;
  consent_sent_at?: string | null;
  consent_completed_at?: string | null;
  consent_method?: string | null;
  consent_signature?: string | null;
}

interface SymptomLog {
  id: string;
  date_logged: string;
  estrogen_score: number;
  progesterone_score: number;
  androgen_score: number;
  cortisol_score: number;
  raw_answers: any;
  patient_id: string;
}

interface Protocol {
  id: string;
  name: string;
  primary_compound: string;
  dispenser_type: string;
  instructions: string;
}

interface LabPathInfo {
  path: "zrt" | "labcorp";
  panel?: "mens_safety" | "thyroid" | "safety_cmp" | null;
  reason?: string | null;
}

interface PatientWithLog {
  patient: Patient;
  latestLog: SymptomLog | null;
  highestCategory: string;
  riskLevel: "green" | "yellow" | "red";
  labPath?: LabPathInfo;
}

interface RecentCheckIn {
  patient: Patient;
  currentLog: SymptomLog;
  previousLog: SymptomLog | null;
  percentChange: number | null;
  improved: boolean;
}

interface PendingActivation {
  id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string | null;
  base_membership: string;
  addon_tier: string;
  total_monthly: number;
  sent_at: string;
  status: string;
}

interface PendingPharmacyPatient {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  onboarding_status: string;
  lab_path: string | null;
  updated_at: string | null;
}

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingPatients, setPendingPatients] = useState<PatientWithLog[]>([]);
  const [recentCheckIns, setRecentCheckIns] = useState<RecentCheckIn[]>([]);
  const [pendingActivations, setPendingActivations] = useState<PendingActivation[]>([]);
  const [pendingPharmacy, setPendingPharmacy] = useState<PendingPharmacyPatient[]>([]);
  const [completingPharmacyId, setCompletingPharmacyId] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<PatientWithLog | null>(null);
  const [patientLogs, setPatientLogs] = useState<SymptomLog[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [recommendedProtocol, setRecommendedProtocol] = useState<Protocol | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEmailingRequisition, setIsEmailingRequisition] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("triage");
  const [renewingPatientId, setRenewingPatientId] = useState<string | null>(null);
  const [resendingActivationId, setResendingActivationId] = useState<string | null>(null);
  const [selectedPatientIds, setSelectedPatientIds] = useState<Set<string>>(new Set());
  const [providerInfo, setProviderInfo] = useState<{ name: string; credentials: string; role: string }>({
    name: "Provider",
    credentials: "NP-C",
    role: "provider"
  });
  // Contact info editing state
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [isMarkingLabsReviewed, setIsMarkingLabsReviewed] = useState(false);
  const [isFlaggingNoShow, setIsFlaggingNoShow] = useState(false);
  const [isClearingHighRisk, setIsClearingHighRisk] = useState<string | null>(null);
  // Archive/Delete state
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showArchivedPatients, setShowArchivedPatients] = useState(false);
  // Provider invite modal state
  const [isInviteProviderOpen, setIsInviteProviderOpen] = useState(false);
  // Labcorp order modal state
  const [isLabcorpModalOpen, setIsLabcorpModalOpen] = useState(false);
  // Kit tracking state
  const [selectedPatientKit, setSelectedPatientKit] = useState<{
    id: string;
    zrt_kit_status: string;
    tracking_number: string | null;
    customer_email: string;
  } | null>(null);
  // Latest lab result for supplement recommendations
  const [selectedPatientLabResult, setSelectedPatientLabResult] = useState<{
    testosterone_t: number | null;
    estradiol_e2: number | null;
  } | null>(null);
  // Quick pharmacy order modal state
  const [pharmacyOrderPatient, setPharmacyOrderPatient] = useState<PendingPharmacyPatient | null>(null);
  const [isPharmacyModalOpen, setIsPharmacyModalOpen] = useState(false);
  // Recommended medications from lab analysis
  const [recommendedMedications, setRecommendedMedications] = useState<import("@/lib/medicationMapping").MedicationRecommendation[]>([]);

  // Provider lookup based on email - expand this as you add more providers
  const getProviderInfo = (email: string) => {
    const providers: Record<string, { name: string; credentials: string; role: string }> = {
      // Providers
      "admin@elevatedhealthaugusta.com": { name: "Lauren Bursey", credentials: "FNP-C", role: "provider" },
      "lauren@elevatedhealthaugusta.com": { name: "Lauren Bursey", credentials: "FNP-C", role: "provider" },
      "troy.w.akers@gmail.com": { name: "Troy Akers", credentials: "DO", role: "provider" },
      "mmbursey@gmail.com": { name: "Michael Bursey", credentials: "DO", role: "provider" },
      "drdwmd@pmrehab.net": { name: "Dennis Williams", credentials: "MD", role: "provider" },
      // Office Staff
      "kcovington@pmrehab.net": { name: "Kristen Covington", credentials: "", role: "office_manager" },
    };
    return providers[email.toLowerCase()] || { name: email.split("@")[0], credentials: "Provider", role: "staff" };
  };

  useEffect(() => {
    initializeProvider();
  }, []);

  const initializeProvider = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Set provider info based on logged-in user
      if (user?.email) {
        setProviderInfo(getProviderInfo(user.email));
      }

      await loadData();
    } catch (error: any) {
      console.error("Error initializing provider:", error);
      toast.error("Failed to load dashboard");
    }
  };

  const loadData = async () => {
    try {
      console.log("[ProviderDashboard] Loading data...");
      
      // Load patients with pending_review orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`
          patient_id,
          patients (*)
        `)
        .eq("status", "pending_review");

      console.log("[ProviderDashboard] Orders query result:", { ordersData, ordersError });

      if (ordersError) throw ordersError;

      // Also load patients with intake complete, account_created, or pending_invite but no order yet
      // This ensures newly signed up patients (including ketamine) appear in triage
      const { data: intakePatients, error: intakeError } = await supabase
        .from("patients")
        .select("*")
        .in("onboarding_status", ["intake_complete", "account_created", "pending_invite"])
        .is("current_protocol", null);

      console.log("[ProviderDashboard] Intake patients query result:", { intakePatients, intakeError });

      // Combine unique patients
      const allPatients: Patient[] = [];
      const patientIds = new Set<string>();

      ordersData?.forEach(order => {
        if (order.patients && !patientIds.has(order.patients.id)) {
          patientIds.add(order.patients.id);
          allPatients.push(order.patients as Patient);
        }
      });

      intakePatients?.forEach(p => {
        if (!patientIds.has(p.id)) {
          patientIds.add(p.id);
          allPatients.push(p as Patient);
        }
      });

      // Get latest symptom logs for each patient
      const patientsWithLogs: PatientWithLog[] = [];
      for (const patient of allPatients) {
        const { data: logs } = await supabase
          .from("symptom_logs")
          .select("*")
          .eq("patient_id", patient.id)
          .order("date_logged", { ascending: false })
          .limit(1);

        const latestLog = logs?.[0] || null;
        let highestCategory = "Unknown";
        let riskLevel: "green" | "yellow" | "red" = "green";

        if (latestLog) {
          const scores = {
            Estrogen: latestLog.estrogen_score || 0,
            Progesterone: latestLog.progesterone_score || 0,
            Androgen: latestLog.androgen_score || 0,
            Cortisol: latestLog.cortisol_score || 0,
          };
          const highest = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b);
          highestCategory = `${highest[0]} High`;

          // Determine risk level
          const maxScore = highest[1];
          if (maxScore > 15) riskLevel = "red";
          else if (maxScore > 8) riskLevel = "yellow";
          else riskLevel = "green";

          // Check for safety flags
          if (patient.safety_flags?.length > 0 || patient.risk_status === "high_risk_review") {
            riskLevel = "red";
          }

                  // Check for androgen excess
                  const rawAnswers = latestLog.raw_answers as Record<string, any> | null;
                  if (rawAnswers?.androgen_excess_risk) {
                    riskLevel = "yellow";
                  }
        }

        // Get lab path info from symptom log
        let labPath: LabPathInfo = { path: "zrt" };
        if (latestLog) {
          const rawAnswers = latestLog.raw_answers as Record<string, any> | null;
          if (rawAnswers?.labPath) {
            labPath = rawAnswers.labPath as LabPathInfo;
          } else {
            // Determine lab path from patient data if not in log
            const medHistory = patient.medical_history as Record<string, boolean> | null;
            if (patient.gender === "male" && (patient.treatment_request === "testosterone" || patient.treatment_request === "hormone_male")) {
              labPath = { path: "labcorp", panel: "mens_safety", reason: "Male testosterone therapy requires PSA, CBC, CMP" };
            } else if (medHistory?.thyroidDisorder) {
              labPath = { path: "labcorp", panel: "thyroid", reason: "Thyroid disorder requires TSH, T3, T4 panel" };
            } else if (medHistory?.kidneyDisease || medHistory?.liverDisease) {
              labPath = { path: "labcorp", panel: "safety_cmp", reason: "Organ function requires CMP safety panel" };
            }
          }
        } else if (patient.lab_path === "labcorp") {
          // Fallback to patient lab_path field
          const medHistory = patient.medical_history as Record<string, boolean> | null;
          if (patient.gender === "male") {
            labPath = { path: "labcorp", panel: "mens_safety", reason: "Male testosterone therapy requires PSA, CBC, CMP" };
          } else if (medHistory?.thyroidDisorder) {
            labPath = { path: "labcorp", panel: "thyroid", reason: "Thyroid disorder requires TSH, T3, T4 panel" };
          } else if (medHistory?.kidneyDisease || medHistory?.liverDisease) {
            labPath = { path: "labcorp", panel: "safety_cmp", reason: "Organ function requires CMP safety panel" };
          }
        }

        patientsWithLogs.push({ patient, latestLog, highestCategory, riskLevel, labPath });
      }

      setPendingPatients(patientsWithLogs);

      // Load protocols
      const { data: protocolsData } = await supabase.from("protocols").select("*");
      setProtocols(protocolsData || []);

      // Load recent check-ins (last 7 days) for Patient Monitoring tab
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: recentLogs } = await supabase
        .from("symptom_logs")
        .select("*, patients(*)")
        .gte("date_logged", sevenDaysAgo.toISOString())
        .order("date_logged", { ascending: false });

      const checkInsData: RecentCheckIn[] = [];
      
      if (recentLogs) {
        for (const log of recentLogs) {
          if (!log.patients) continue;
          
          // Get previous log for this patient
          const { data: previousLogs } = await supabase
            .from("symptom_logs")
            .select("*")
            .eq("patient_id", log.patient_id)
            .lt("date_logged", log.date_logged)
            .order("date_logged", { ascending: false })
            .limit(1);

          const previousLog = previousLogs?.[0] || null;
          
          const currentTotal = (log.estrogen_score || 0) + (log.progesterone_score || 0) + 
                              (log.androgen_score || 0) + (log.cortisol_score || 0);
          const previousTotal = previousLog 
            ? (previousLog.estrogen_score || 0) + (previousLog.progesterone_score || 0) + 
              (previousLog.androgen_score || 0) + (previousLog.cortisol_score || 0)
            : null;
          
          const percentChange = previousTotal && previousTotal > 0
            ? Math.round(((currentTotal - previousTotal) / previousTotal) * 100)
            : null;

          checkInsData.push({
            patient: log.patients as Patient,
            currentLog: log as SymptomLog,
            previousLog: previousLog as SymptomLog | null,
            percentChange,
            improved: percentChange !== null && percentChange < -20,
          });
        }
      }
      
      setRecentCheckIns(checkInsData);

      // Load pending activations
      const { data: activationsData } = await supabase
        .from("activation_links")
        .select("*")
        .eq("status", "pending")
        .order("sent_at", { ascending: false });
      
      setPendingActivations((activationsData || []) as PendingActivation[]);

      // GAP 2: Load patients pending pharmacy order (payment complete, awaiting meds)
      const { data: pharmacyData } = await supabase
        .from("patients")
        .select("id, full_name, email, phone, onboarding_status, lab_path, updated_at")
        .eq("onboarding_status", "pending_pharmacy_order")
        .order("updated_at", { ascending: false });
      
      setPendingPharmacy((pharmacyData || []) as PendingPharmacyPatient[]);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectPatient = async (patientWithLog: PatientWithLog) => {
    setSelectedPatient(patientWithLog);
    setIsPanelOpen(true);
    
    // Initialize contact info editing state
    setEditPhone(patientWithLog.patient.phone || "");
    setEditEmail(patientWithLog.patient.email || "");

    // Fetch kit tracking info
    const { data: kitData } = await supabase
      .from("hormone_mapping_payments")
      .select("id, zrt_kit_status, tracking_number, customer_email")
      .eq("patient_id", patientWithLog.patient.id)
      .eq("payment_status", "paid")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setSelectedPatientKit(kitData);

    // Fetch latest lab result for supplement recommendations
    const { data: labData } = await supabase
      .from("lab_results")
      .select("testosterone_t, estradiol_e2")
      .eq("patient_id", patientWithLog.patient.id)
      .order("collection_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    setSelectedPatientLabResult(labData);

    // Load all symptom logs for chart
    const { data: logs } = await supabase
      .from("symptom_logs")
      .select("*")
      .eq("patient_id", patientWithLog.patient.id)
      .order("date_logged", { ascending: true });

    setPatientLogs(logs || []);

    // Determine recommended protocol
    if (patientWithLog.latestLog) {
      const log = patientWithLog.latestLog;
      const patient = patientWithLog.patient;
      const hasCancerHistory = patient.safety_flags?.some((f: string) => 
        f.toLowerCase().includes("cancer")
      );
      const rawAnswers = log.raw_answers as Record<string, any> | null;
      const hasAndrogenExcess = rawAnswers?.androgen_excess_risk === true;

      const scores = {
        estrogen: log.estrogen_score || 0,
        progesterone: log.progesterone_score || 0,
        androgen: log.androgen_score || 0,
        cortisol: log.cortisol_score || 0,
      };
      const highestCategory = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];

      let recommended: Protocol | undefined;

      if (highestCategory === "estrogen" && !hasCancerHistory) {
        recommended = protocols.find(p => p.name.toLowerCase().includes("menopause") || p.primary_compound?.toLowerCase().includes("bi-est"));
      } else if (highestCategory === "androgen" && !hasAndrogenExcess) {
        recommended = protocols.find(p => p.name.toLowerCase().includes("vitality") || p.primary_compound?.toLowerCase().includes("testosterone"));
      } else if (highestCategory === "progesterone") {
        recommended = protocols.find(p => p.name.toLowerCase().includes("balance") || p.primary_compound?.toLowerCase().includes("progesterone"));
      }

      setRecommendedProtocol(recommended || null);
    }
  };

  const handleSaveContactInfo = async () => {
    if (!selectedPatient) return;
    
    setIsSavingContact(true);
    try {
      const { error } = await supabase
        .from("patients")
        .update({ 
          phone: editPhone || null, 
          email: editEmail || null 
        })
        .eq("id", selectedPatient.patient.id);

      if (error) throw error;

      // Update local state
      setSelectedPatient({
        ...selectedPatient,
        patient: {
          ...selectedPatient.patient,
          phone: editPhone || undefined,
          email: editEmail || undefined,
        }
      });

      toast.success("Contact info saved!");
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save contact info");
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleMarkLabsReviewed = async () => {
    if (!selectedPatient) return;
    
    setIsMarkingLabsReviewed(true);
    try {
      const { error } = await supabase
        .from("patients")
        .update({ 
          onboarding_status: "labs_reviewed",
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedPatient.patient.id);

      if (error) throw error;

      // Update local state
      setSelectedPatient({
        ...selectedPatient,
        patient: {
          ...selectedPatient.patient,
          onboarding_status: "labs_reviewed",
        }
      });

      toast.success(`Labs marked as reviewed for ${selectedPatient.patient.full_name}. Health Report is now unlocked!`);
      await loadData();
    } catch (err: any) {
      console.error("Error marking labs reviewed:", err);
      toast.error(err.message || "Failed to mark labs as reviewed");
    } finally {
      setIsMarkingLabsReviewed(false);
    }
  };

  const handleArchivePatient = async () => {
    if (!selectedPatient) return;
    
    setIsArchiving(true);
    try {
      const newArchiveStatus = !selectedPatient.patient.is_archived;
      const { error } = await supabase
        .from("patients")
        .update({ 
          is_archived: newArchiveStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedPatient.patient.id);

      if (error) throw error;

      toast.success(newArchiveStatus 
        ? `${selectedPatient.patient.full_name} moved to archived patients` 
        : `${selectedPatient.patient.full_name} restored to active patients`
      );
      setIsPanelOpen(false);
      setSelectedPatient(null);
      await loadData();
    } catch (err: any) {
      console.error("Error archiving patient:", err);
      toast.error(err.message || "Failed to archive patient");
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDeletePatient = async () => {
    if (!selectedPatient || deleteConfirmText !== "DELETE") return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("patients")
        .delete()
        .eq("id", selectedPatient.patient.id);

      if (error) throw error;

      toast.success(`${selectedPatient.patient.full_name} permanently deleted`);
      setIsDeleteModalOpen(false);
      setDeleteConfirmText("");
      setIsPanelOpen(false);
      setSelectedPatient(null);
      await loadData();
    } catch (err: any) {
      console.error("Error deleting patient:", err);
      toast.error(err.message || "Failed to delete patient");
    } finally {
      setIsDeleting(false);
    }
  };

  const authorizeAndSendOrder = async () => {
    if (!selectedPatient || !recommendedProtocol) return;

    setIsAuthorizing(true);
    try {
      // Check if order exists
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("id")
        .eq("patient_id", selectedPatient.patient.id)
        .eq("status", "pending_review")
        .maybeSingle();

      if (existingOrder) {
        // Update existing order
        await supabase
          .from("orders")
          .update({ 
            status: "authorized",
            protocol_snapshot: {
              protocol_id: recommendedProtocol.id,
              protocol_name: recommendedProtocol.name,
              compound: recommendedProtocol.primary_compound,
              dispenser: recommendedProtocol.dispenser_type,
              instructions: recommendedProtocol.instructions,
              authorized_at: new Date().toISOString(),
            }
          })
          .eq("id", existingOrder.id);
      } else {
        // Create new order
        await supabase.from("orders").insert({
          patient_id: selectedPatient.patient.id,
          status: "authorized",
          protocol_snapshot: {
            protocol_id: recommendedProtocol.id,
            protocol_name: recommendedProtocol.name,
            compound: recommendedProtocol.primary_compound,
            dispenser: recommendedProtocol.dispenser_type,
            instructions: recommendedProtocol.instructions,
            authorized_at: new Date().toISOString(),
          }
        });
      }

      // Update patient's current protocol
      await supabase
        .from("patients")
        .update({ 
          current_protocol: recommendedProtocol.name,
          onboarding_status: "treatment_active"
        })
        .eq("id", selectedPatient.patient.id);

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      toast.success("Order authorized! Treatment Plan Ready email will be sent.");

      // Send treatment authorized notification email
      if (selectedPatient.patient.email) {
        try {
          await supabase.functions.invoke("send-treatment-authorized", {
            body: {
              patient_name: selectedPatient.patient.full_name,
              patient_email: selectedPatient.patient.email,
              protocol_name: recommendedProtocol.name,
            },
          });
        } catch (emailErr) {
          console.error("Failed to send treatment authorized email:", emailErr);
        }
      }

      await loadData();
      setIsPanelOpen(false);
      setSelectedPatient(null);
      setRecommendedProtocol(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleRenewRx = async (checkIn: RecentCheckIn) => {
    setRenewingPatientId(checkIn.patient.id);
    try {
      // Get the patient's current protocol
      const currentProtocol = checkIn.patient.current_protocol;
      
      if (!currentProtocol) {
        toast.error("No current protocol found for this patient");
        return;
      }

      // Find the protocol details
      const protocol = protocols.find(p => p.name === currentProtocol);
      
      // Create a new authorized order (renewal)
      const { error: orderError } = await supabase.from("orders").insert({
        patient_id: checkIn.patient.id,
        status: "authorized",
        protocol_snapshot: {
          protocol_id: protocol?.id || null,
          protocol_name: currentProtocol,
          compound: protocol?.primary_compound || currentProtocol,
          dispenser: protocol?.dispenser_type || "Standard",
          instructions: protocol?.instructions || "Continue as prescribed",
          authorized_at: new Date().toISOString(),
          renewal: true,
          renewed_from_checkin: checkIn.currentLog.id,
        }
      });

      if (orderError) throw orderError;

      // Update patient's onboarding status to ensure it stays active
      await supabase
        .from("patients")
        .update({ 
          onboarding_status: "treatment_active",
          updated_at: new Date().toISOString()
        })
        .eq("id", checkIn.patient.id);

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      toast.success(`Prescription renewed for ${checkIn.patient.full_name}!`);
      
      // Refresh data
      await loadData();
    } catch (error: any) {
      console.error("Error renewing prescription:", error);
      toast.error(error.message || "Failed to renew prescription");
    } finally {
      setRenewingPatientId(null);
    }
  };

  const handleEmailRequisition = async () => {
    if (!selectedPatient || !selectedPatient.labPath?.panel) return;

    setIsEmailingRequisition(true);
    try {
      const { error } = await supabase.functions.invoke("send-labcorp-requisition", {
        body: {
          patientName: selectedPatient.patient.full_name,
          patientDob: selectedPatient.patient.dob,
          gender: selectedPatient.patient.gender || "unknown",
          panelType: selectedPatient.labPath.panel,
          reason: selectedPatient.labPath.reason || "Medical necessity",
          providerName: providerInfo.name,
          providerCredentials: providerInfo.credentials,
        },
      });

      if (error) throw error;

      toast.success("LabCorp requisition emailed successfully!");
    } catch (error: any) {
      console.error("Error emailing requisition:", error);
      toast.error("Failed to email requisition: " + error.message);
    } finally {
    setIsEmailingRequisition(false);
    }
  };

  const handleResendActivation = async (activation: PendingActivation) => {
    setResendingActivationId(activation.id);
    try {
      const firstName = activation.patient_name.split(" ")[0];
      const { data, error } = await supabase.functions.invoke("send-activation-sms", {
        body: {
          first_name: firstName,
          phone: activation.patient_phone || "",
          base_membership: activation.base_membership,
          addon_tier: activation.addon_tier,
          patient_email: activation.patient_email,
          send_email: true,
        },
      });

      if (error) throw error;

      if (data?.email_sent) {
        toast.success(`Activation email resent to ${activation.patient_email}`);
      } else {
        toast.warning("Could not send email. Link generated - copy manually if needed.");
      }
    } catch (err: any) {
      console.error("Resend error:", err);
      toast.error(err.message || "Failed to resend activation email");
    } finally {
      setResendingActivationId(null);
    }
  };

  // GAP 2: Complete pharmacy order - marks patient as treatment_active
  const handleCompletePharmacyOrder = async (patientId: string) => {
    setCompletingPharmacyId(patientId);
    try {
      const { error } = await supabase
        .from("patients")
        .update({ onboarding_status: "treatment_active" })
        .eq("id", patientId);

      if (error) throw error;

      // Remove from pending list
      setPendingPharmacy(prev => prev.filter(p => p.id !== patientId));
      toast.success("Pharmacy order marked complete! Patient is now treatment active.");
      
      // Celebrate!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      console.error("Complete pharmacy error:", err);
      toast.error(err.message || "Failed to mark pharmacy order complete");
    } finally {
      setCompletingPharmacyId(null);
    }
  };

  const handleClearHighRiskFlag = async (patientId: string) => {
    setIsClearingHighRisk(patientId);
    try {
      const { error } = await supabase
        .from("patients")
        .update({ 
          risk_status: null, 
          safety_flags: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", patientId);

      if (error) throw error;

      toast.success("High-risk flag cleared. Patient can now access their dashboard.");
      await loadData();
    } catch (err: any) {
      console.error("Error clearing high-risk flag:", err);
      toast.error(err.message || "Failed to clear high-risk flag");
    } finally {
      setIsClearingHighRisk(null);
    }
  };

  const togglePatientSelection = (patientId: string) => {
    setSelectedPatientIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(patientId)) {
        newSet.delete(patientId);
      } else {
        newSet.add(patientId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedPatientIds.size === pendingPatients.length) {
      setSelectedPatientIds(new Set());
    } else {
      setSelectedPatientIds(new Set(pendingPatients.map(p => p.patient.id)));
    }
  };

  const chartData = patientLogs.map(log => ({
    date: new Date(log.date_logged || "").toLocaleDateString(),
    Estrogen: log.estrogen_score,
    Progesterone: log.progesterone_score,
    Androgen: log.androgen_score,
    Cortisol: log.cortisol_score,
  }));

  const getRiskBadge = (level: "green" | "yellow" | "red") => {
    const variants = {
      green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    const labels = { green: "Low Risk", yellow: "Moderate", red: "High Risk" };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${variants[level]}`}>{labels[level]}</span>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar 
        title="Triage Dashboard" 
        subtitle={`${providerInfo.name}'s Command Center`}
        onRefresh={async () => {
          setIsRefreshing(true);
          await loadData();
          setIsRefreshing(false);
        }}
        isRefreshing={isRefreshing}
        onNavigateToMessages={() => setActiveTab("messages")}
      />

      {/* Quick Actions Toolbar */}
      <ProviderQuickActions onRefresh={loadData} />

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Clean scrollable tabs with proper spacing */}
          <div className="relative mb-8">
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
              <TabsList className="inline-flex h-auto gap-2 p-1.5 bg-muted/50 rounded-xl flex-nowrap">
                <TabsTrigger 
                  value="triage" 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap text-sm"
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Action</span>
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {pendingPatients.filter(p => !showArchivedPatients ? !p.patient.is_archived : true).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="allpatients" 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap text-sm"
                >
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span>All Patients</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="pipeline" 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap text-sm"
                >
                  <TrendingUp className="w-4 h-4 flex-shrink-0" />
                  <span>Pipeline</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="highrisk" 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap text-sm"
                >
                  <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>High-Risk</span>
                  {pendingPatients.filter(p => p.riskLevel === "red" || p.patient.risk_status === "high_risk_review").length > 0 && (
                    <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                      {pendingPatients.filter(p => p.riskLevel === "red" || p.patient.risk_status === "high_risk_review").length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="staff" 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap text-sm"
                >
                  <CheckSquare className="w-4 h-4 flex-shrink-0" />
                  <span>Tasks</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="consultations" 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap text-sm"
                >
                  <CreditCard className="w-4 h-4 flex-shrink-0" />
                  <span>Consults</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="pharmacy" 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap text-sm"
                >
                  <Pill className="w-4 h-4 flex-shrink-0" />
                  <span>Pharmacy</span>
                  {pendingPharmacy.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                      {pendingPharmacy.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="monitoring" 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap text-sm"
                >
                  <Activity className="w-4 h-4 flex-shrink-0" />
                  <span>Monitor</span>
                  {recentCheckIns.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                      {recentCheckIns.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="activations" 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap text-sm"
                >
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>Activations</span>
                  {pendingActivations.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                      {pendingActivations.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="messages" 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap text-sm"
                >
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Messages</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="resources" 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap text-sm"
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span>Resources</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="fax" 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap text-sm"
                >
                  <Send className="w-4 h-4 flex-shrink-0" />
                  <span>Fax</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="team" 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap text-sm"
                >
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span>Team</span>
                </TabsTrigger>
              </TabsList>
            </div>
            {/* Scroll fade indicators */}
            <div className="absolute left-0 top-0 bottom-2 w-6 bg-gradient-to-r from-background to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-2 w-6 bg-gradient-to-l from-background to-transparent pointer-events-none" />
          </div>

          {/* High-Risk Patients Tab */}
          <TabsContent value="highrisk">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <ShieldAlert className="w-5 h-5" />
                  High-Risk Patients Requiring Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingPatients.filter(p => p.riskLevel === "red" || p.patient.risk_status === "high_risk_review").length === 0 ? (
                  <div className="text-center py-8">
                    <ShieldCheck className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p className="text-muted-foreground">No high-risk patients pending review.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingPatients
                      .filter(p => p.riskLevel === "red" || p.patient.risk_status === "high_risk_review")
                      .map(({ patient, highestCategory, riskLevel }) => (
                        <div 
                          key={patient.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800 cursor-pointer hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors"
                          onClick={() => {
                            const patientWithLog = pendingPatients.find(p => p.patient.id === patient.id);
                            if (patientWithLog) selectPatient(patientWithLog);
                          }}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
                              <ShieldAlert className="w-5 h-5 text-red-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium text-foreground truncate">{patient.full_name}</h3>
                              <p className="text-sm text-muted-foreground truncate">{patient.email}</p>
                              {patient.safety_flags && Array.isArray(patient.safety_flags) && patient.safety_flags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {patient.safety_flags.map((flag: string, i: number) => (
                                    <span key={i} className="text-xs bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-2 py-0.5 rounded">
                                      {flag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:flex-shrink-0">
                            {getRiskBadge(riskLevel)}
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-100 min-h-[44px] min-w-[44px]"
                              onClick={(e) => {
                                e.stopPropagation();
                                const patientWithLog = pendingPatients.find(p => p.patient.id === patient.id);
                                if (patientWithLog) selectPatient(patientWithLog);
                              }}
                            >
                              Review
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700 min-h-[44px]"
                              disabled={isClearingHighRisk === patient.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClearHighRiskFlag(patient.id);
                              }}
                            >
                              {isClearingHighRisk === patient.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4 mr-1" />
                              )}
                              Clear
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Tasks Tab */}
          <TabsContent value="staff">
            <StaffTasksTab />
          </TabsContent>

          {/* Consultations Tab */}
          <TabsContent value="consultations">
            <ConsultationTracker />
          </TabsContent>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline">
            <PatientPipeline />
          </TabsContent>

          <TabsContent value="triage">
            {/* Activity & Actions Widgets - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <DashboardActivityWidget />
              <NextActionsWidget 
                onPatientClick={(patientId) => {
                  const found = pendingPatients.find(p => p.patient.id === patientId);
                  if (found) {
                    selectPatient(found);
                  } else {
                    // Load patient directly if not in pending list
                    supabase
                      .from("patients")
                      .select("*")
                      .eq("id", patientId)
                      .single()
                      .then(({ data }) => {
                        if (data) {
                          selectPatient({
                            patient: data as Patient,
                            latestLog: null,
                            highestCategory: "Unknown",
                            riskLevel: "green",
                          });
                        }
                      });
                  }
                }}
                onRefresh={loadData}
              />
            </div>
            {/* Patient Add Options - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 mt-6">
              <InvitePatientCard onInviteSent={() => loadData()} />
              <AddExistingPatientCard onPatientAdded={() => loadData()} />
              <CreditCodeLookup />
            </div>
            
            {/* Archive Toggle */}
            <div className="flex items-center justify-end mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowArchivedPatients(!showArchivedPatients)}
                className={showArchivedPatients ? "text-amber-600" : "text-muted-foreground"}
              >
                <Archive className="w-4 h-4 mr-2" />
                {showArchivedPatients ? "Showing Archived" : "Show Archived"}
              </Button>
            </div>
            
            {pendingPatients.filter(p => showArchivedPatients ? true : !p.patient.is_archived).length === 0 ? (
              <Card className="bg-card border-border/50">
                <CardContent className="pt-6 text-center">
                  <ShieldCheck className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p className="text-muted-foreground">
                    {showArchivedPatients ? "No archived patients." : "All caught up! No pending reviews."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Bulk Selection Header */}
                {selectedPatientIds.size > 0 && (
                  <div className="bg-primary/10 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-sm text-foreground">
                      {selectedPatientIds.size} patient{selectedPatientIds.size !== 1 ? "s" : ""} selected
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedPatientIds(new Set())}
                    >
                      Clear Selection
                    </Button>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-3 px-4 w-12">
                          <button 
                            onClick={toggleSelectAll}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {selectedPatientIds.size === pendingPatients.length ? (
                              <CheckSquare className="w-4 h-4" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Patient</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Consent</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Highest Category</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Risk Level</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingPatients
                        .filter(p => showArchivedPatients ? true : !p.patient.is_archived)
                        .map((p) => (
                        <tr 
                          key={p.patient.id} 
                          className={`border-b border-border/30 hover:bg-muted/30 cursor-pointer ${
                            p.riskLevel === "red" ? "bg-red-50/50 dark:bg-red-950/10" : ""
                          } ${p.patient.is_archived ? "opacity-60" : ""} ${selectedPatientIds.has(p.patient.id) ? "bg-primary/5" : ""}`}
                        >
                          <td className="py-4 px-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePatientSelection(p.patient.id);
                              }}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {selectedPatientIds.has(p.patient.id) ? (
                                <CheckSquare className="w-4 h-4 text-primary" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                          <td className="py-4 px-4" onClick={() => selectPatient(p)}>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-foreground">{p.patient.full_name}</p>
                                  {p.patient.is_archived && (
                                    <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400">
                                      Archived
                                    </Badge>
                                  )}
                                </div>
                                {p.patient.safety_flags?.length > 0 && (
                                  <p className="text-xs text-red-500 flex items-center gap-1">
                                    <ShieldAlert className="w-3 h-3" />
                                    {p.patient.safety_flags.length} safety flag(s)
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4" onClick={() => selectPatient(p)}>
                            {/* Consent Status Badge */}
                            {p.patient.treatment_request?.includes("ketamine") ? (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                Osmind
                              </Badge>
                            ) : p.patient.consent_completed_at ? (
                              <Badge className="text-xs bg-green-100 text-green-700 hover:bg-green-100">
                                <Check className="w-3 h-3 mr-1" />
                                Signed
                              </Badge>
                            ) : p.patient.consent_sent_at ? (
                              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-muted-foreground">
                                —
                              </Badge>
                            )}
                          </td>
                          <td className="py-4 px-4" onClick={() => selectPatient(p)}>
                            <span className="text-sm text-foreground">{p.highestCategory}</span>
                          </td>
                          <td className="py-4 px-4" onClick={() => selectPatient(p)}>
                            {getRiskBadge(p.riskLevel)}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <Button size="sm" variant="outline" onClick={() => selectPatient(p)}>
                              Review
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          {/* GAP 2: Pending Pharmacy Orders Tab */}
          <TabsContent value="pharmacy">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Pill className="w-4 h-4" />
                  Patients Awaiting Pharmacy Order
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  These patients have paid but need medications ordered via Portal Assistant or Fax
                </p>
              </CardHeader>
              <CardContent>
                {pendingPharmacy.length === 0 ? (
                  <div className="text-center py-8">
                    <Check className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p className="text-muted-foreground">All pharmacy orders complete! No pending actions.</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop: Table view */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border/50">
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Patient</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Contact</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Lab Path</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Paid On</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingPharmacy.map((patient) => {
                            const paidDate = patient.updated_at ? new Date(patient.updated_at).toLocaleDateString() : "Unknown";
                            
                            return (
                              <tr key={patient.id} className="border-b border-border/30 bg-amber-50/50 dark:bg-amber-950/10">
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                                      <Pill className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <p className="font-medium text-foreground">{patient.full_name}</p>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="space-y-1">
                                    {patient.email && (
                                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Mail className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">{patient.email}</span>
                                      </p>
                                    )}
                                    {patient.phone && (
                                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Phone className="w-3 h-3 flex-shrink-0" />
                                        {patient.phone}
                                      </p>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <Badge variant={patient.lab_path === "labcorp" ? "destructive" : "secondary"}>
                                    {patient.lab_path === "labcorp" ? "LabCorp Required" : "ZRT Kit"}
                                  </Badge>
                                </td>
                                <td className="py-4 px-4">
                                  <span className="text-sm text-muted-foreground">{paidDate}</span>
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setPharmacyOrderPatient(patient);
                                        setIsPharmacyModalOpen(true);
                                      }}
                                      className="min-h-[44px]"
                                    >
                                      <Pill className="w-3 h-3 mr-1" />
                                      Order Rx
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => handleCompletePharmacyOrder(patient.id)}
                                      disabled={completingPharmacyId === patient.id}
                                      className="bg-green-600 hover:bg-green-700 text-white min-h-[44px]"
                                    >
                                      {completingPharmacyId === patient.id ? (
                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                      ) : (
                                        <Check className="w-3 h-3 mr-1" />
                                      )}
                                      {completingPharmacyId === patient.id ? "..." : "Done"}
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile: Card view */}
                    <div className="lg:hidden space-y-3">
                      {pendingPharmacy.map((patient) => {
                        const paidDate = patient.updated_at ? new Date(patient.updated_at).toLocaleDateString() : "Unknown";
                        
                        return (
                          <div 
                            key={patient.id} 
                            className="p-4 bg-amber-50/50 dark:bg-amber-950/10 rounded-lg border border-amber-200 dark:border-amber-800/30 space-y-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                                <Pill className="w-5 h-5 text-amber-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-foreground truncate">{patient.full_name}</p>
                                <p className="text-xs text-muted-foreground">Paid: {paidDate}</p>
                              </div>
                              <Badge variant={patient.lab_path === "labcorp" ? "destructive" : "secondary"} className="flex-shrink-0">
                                {patient.lab_path === "labcorp" ? "LabCorp" : "ZRT"}
                              </Badge>
                            </div>
                            
                            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                              {patient.email && (
                                <p className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{patient.email}</span>
                                </p>
                              )}
                              {patient.phone && (
                                <p className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 flex-shrink-0" />
                                  {patient.phone}
                                </p>
                              )}
                            </div>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setPharmacyOrderPatient(patient);
                                setIsPharmacyModalOpen(true);
                              }}
                              className="w-full min-h-[44px] mb-2"
                            >
                              <Pill className="w-4 h-4 mr-2" />
                              Order Rx
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleCompletePharmacyOrder(patient.id)}
                              disabled={completingPharmacyId === patient.id}
                              className="w-full bg-green-600 hover:bg-green-700 text-white min-h-[44px] active:scale-95 transition-transform"
                            >
                              {completingPharmacyId === patient.id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4 mr-2" />
                              )}
                              {completingPharmacyId === patient.id ? "Completing..." : "Mark Order Placed"}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Pharmacy Order Modal */}
            {isPharmacyModalOpen && pharmacyOrderPatient && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-background rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="font-semibold">Order for {pharmacyOrderPatient.full_name}</h3>
                    <Button variant="ghost" size="sm" onClick={() => setIsPharmacyModalOpen(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-4">
                    <PharmacyOrderCard 
                      patient={{
                        id: pharmacyOrderPatient.id,
                        full_name: pharmacyOrderPatient.full_name,
                        email: pharmacyOrderPatient.email,
                        phone: pharmacyOrderPatient.phone,
                      }}
                      onOrderCreated={() => {
                        setIsPharmacyModalOpen(false);
                        loadData();
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Patient Monitoring Tab */}
          <TabsContent value="monitoring">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Check-Ins (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentCheckIns.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No check-ins in the past 7 days.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Patient</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Previous</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Current</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">% Change</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentCheckIns.map((checkIn) => {
                          const prevTotal = checkIn.previousLog 
                            ? (checkIn.previousLog.estrogen_score || 0) + (checkIn.previousLog.progesterone_score || 0) +
                              (checkIn.previousLog.androgen_score || 0) + (checkIn.previousLog.cortisol_score || 0)
                            : null;
                          const currTotal = (checkIn.currentLog.estrogen_score || 0) + (checkIn.currentLog.progesterone_score || 0) +
                            (checkIn.currentLog.androgen_score || 0) + (checkIn.currentLog.cortisol_score || 0);
                          
                          const isImproved = checkIn.percentChange !== null && checkIn.percentChange < -20;
                          const isWorsened = checkIn.percentChange !== null && checkIn.percentChange >= 0;
                          
                          return (
                            <tr 
                              key={checkIn.currentLog.id}
                              className={`border-b border-border/30 ${
                                isImproved ? "bg-green-50/50 dark:bg-green-950/10" : 
                                isWorsened ? "bg-red-50/50 dark:bg-red-950/10" : ""
                              }`}
                            >
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="w-5 h-5 text-primary" />
                                  </div>
                                  <p className="font-medium text-foreground">{checkIn.patient.full_name}</p>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-sm text-muted-foreground">
                                  {new Date(checkIn.currentLog.date_logged).toLocaleDateString()}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-sm text-muted-foreground">
                                  {prevTotal !== null ? prevTotal : "—"}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-sm font-medium text-foreground">{currTotal}</span>
                              </td>
                              <td className="py-4 px-4">
                                {checkIn.percentChange !== null ? (
                                  <span className={`flex items-center gap-1 text-sm font-medium ${
                                    isImproved ? "text-green-600" : isWorsened ? "text-red-600" : "text-muted-foreground"
                                  }`}>
                                    {isImproved ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                                    {checkIn.percentChange > 0 ? "+" : ""}{checkIn.percentChange}%
                                  </span>
                                ) : (
                                  <span className="text-sm text-muted-foreground">Baseline</span>
                                )}
                              </td>
                              <td className="py-4 px-4 text-right">
                                {isImproved ? (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-green-600 border-green-600 hover:bg-green-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRenewRx(checkIn);
                                    }}
                                    disabled={renewingPatientId === checkIn.patient.id}
                                  >
                                    {renewingPatientId === checkIn.patient.id ? (
                                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    ) : (
                                      <Pill className="w-3 h-3 mr-1" />
                                    )}
                                    {renewingPatientId === checkIn.patient.id ? "Renewing..." : "Renew Rx"}
                                  </Button>
                                ) : isWorsened ? (
                                  <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                                    <MessageSquare className="w-3 h-3 mr-1" />
                                    Message
                                  </Button>
                                ) : (
                                  <Button size="sm" variant="ghost" disabled>
                                    No Action
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Activations Tab */}
          <TabsContent value="activations">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Awaiting Payment Activation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingActivations.length === 0 ? (
                  <div className="text-center py-8">
                    <Check className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p className="text-muted-foreground">All activation emails have been completed!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Patient</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Membership</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Monthly</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Sent</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Days Waiting</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingActivations.map((activation) => {
                          const daysSinceSent = Math.floor((Date.now() - new Date(activation.sent_at).getTime()) / (1000 * 60 * 60 * 24));
                          const membershipLabel = activation.base_membership === "vitality" ? "Vitality" : "Metabolic";
                          const addonLabel = activation.addon_tier === "none" ? "" : ` + ${activation.addon_tier.replace("tier", "Tier ")}`;
                          
                          return (
                            <tr key={activation.id} className={`border-b border-border/30 ${daysSinceSent >= 3 ? "bg-yellow-50/50 dark:bg-yellow-950/10" : ""}`}>
                              <td className="py-4 px-4">
                                <div>
                                  <p className="font-medium text-foreground">{activation.patient_name}</p>
                                  <p className="text-xs text-muted-foreground">{activation.patient_email}</p>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-sm text-foreground">{membershipLabel}{addonLabel}</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-sm font-medium text-primary">${activation.total_monthly}/mo</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-sm text-muted-foreground">
                                  {new Date(activation.sent_at).toLocaleDateString()}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  daysSinceSent >= 3 
                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" 
                                    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                }`}>
                                  {daysSinceSent === 0 ? "Today" : `${daysSinceSent} day${daysSinceSent !== 1 ? "s" : ""}`}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleResendActivation(activation)}
                                  disabled={resendingActivationId === activation.id}
                                >
                                  {resendingActivationId === activation.id ? (
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  ) : (
                                    <RotateCcw className="w-3 h-3 mr-1" />
                                  )}
                                  {resendingActivationId === activation.id ? "Sending..." : "Resend"}
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <ProviderInbox />
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <ResourceManager />
          </TabsContent>

          {/* Fax History Tab */}
          <TabsContent value="fax">
            <FaxHistoryLog />
          </TabsContent>

          {/* Team Management Tab */}
          <TabsContent value="team">
            <TeamManagement />
          </TabsContent>

          {/* All Patients Tab */}
          <TabsContent value="allpatients">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  All Patients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PatientDatabase
                  onSelectPatient={(patientId) => {
                    const patient = pendingPatients.find(p => p.patient.id === patientId);
                    if (patient) {
                      selectPatient(patient);
                    } else {
                      // Load patient directly if not in pending list
                      supabase
                        .from("patients")
                        .select("*")
                        .eq("id", patientId)
                        .single()
                        .then(({ data }) => {
                          if (data) {
                            selectPatient({
                              patient: data as Patient,
                              latestLog: null,
                              highestCategory: "Unknown",
                              riskLevel: "green",
                            });
                          }
                        });
                    }
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Side Panel */}
      {isPanelOpen && selectedPatient && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsPanelOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-card border-l border-border z-50 overflow-y-auto overflow-x-visible" style={{ isolation: 'isolate' }}>
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Reviewing</p>
                <h2 className="font-cormorant text-xl text-foreground">{selectedPatient.patient.full_name}</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsPanelOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Info Card */}
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="patient@email.com"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <Button
                    onClick={handleSaveContactInfo}
                    disabled={isSavingContact}
                    size="sm"
                    className="w-full mt-2"
                  >
                    {isSavingContact ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {isSavingContact ? "Saving..." : "Save Contact Info"}
                  </Button>
                  
                  {/* Resend Welcome Email Button */}
                  {selectedPatient.patient.email && (
                    <div className="pt-2 border-t border-border/50 mt-3">
                      <ResendWelcomeEmailButton
                        patientName={selectedPatient.patient.full_name}
                        patientEmail={selectedPatient.patient.email}
                        primaryProgram={selectedPatient.patient.treatment_request || "hormone"}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Patient Journey Tracker - Visual stepper */}
              <PatientJourneyTracker
                onboardingStatus={selectedPatient.patient.onboarding_status || null}
                primaryProgram={(selectedPatient.patient as any).primary_program || selectedPatient.patient.treatment_request || null}
              />

              {/* Communication History Log */}
              <CommunicationLog patientId={selectedPatient.patient.id} />

              {/* Medical Clearance Card - For Weight Loss patients */}
              {(selectedPatient.patient.treatment_request === "weight_loss" || 
                selectedPatient.patient.treatment_request === "glp1") && (
                <MedicalClearanceCard
                  patientId={selectedPatient.patient.id}
                  patientName={selectedPatient.patient.full_name}
                  patientEmail={selectedPatient.patient.email || null}
                  onboardingStatus={selectedPatient.patient.onboarding_status || null}
                  onStatusUpdate={async () => {
                    await loadData();
                    await selectPatient(selectedPatient);
                  }}
                />
              )}

              {/* Patient Status Card - Shows current step and action needed */}
              <PatientStatusCard
                patientId={selectedPatient.patient.id}
                patientName={selectedPatient.patient.full_name}
                patientEmail={selectedPatient.patient.email || null}
                onboardingStatus={selectedPatient.patient.onboarding_status || null}
                onMarkConsultComplete={async () => {
                  try {
                    await supabase.from("patients").update({ 
                      onboarding_status: "consultation_complete" 
                    }).eq("id", selectedPatient.patient.id);
                    // Update local state immediately
                    setSelectedPatient({
                      ...selectedPatient,
                      patient: { ...selectedPatient.patient, onboarding_status: "consultation_complete" }
                    });
                    toast.success("Consultation marked complete. You can now send the lab kit link.");
                    await loadData();
                  } catch (error: any) {
                    toast.error(error.message);
                  }
                }}
                onSendKitLink={() => {
                  // SendKitLinkCard is shown below
                  toast.info("Use the Send Kit Link card below to send payment link.");
                }}
                onMarkLabsReviewed={async () => {
                  try {
                    await supabase.from("patients").update({ 
                      onboarding_status: "labs_reviewed" 
                    }).eq("id", selectedPatient.patient.id);
                    // Update local state immediately
                    setSelectedPatient({
                      ...selectedPatient,
                      patient: { ...selectedPatient.patient, onboarding_status: "labs_reviewed" }
                    });
                    toast.success("Labs marked as reviewed. Health Report is now unlocked!");
                    await loadData();
                  } catch (error: any) {
                    toast.error(error.message);
                  }
                }}
                onApproveProtocol={async () => {
                  try {
                    await supabase.from("patients").update({ 
                      onboarding_status: "protocol_approved" 
                    }).eq("id", selectedPatient.patient.id);
                    // Update local state immediately
                    setSelectedPatient({
                      ...selectedPatient,
                      patient: { ...selectedPatient.patient, onboarding_status: "protocol_approved" }
                    });
                    toast.success("Protocol approved! Patient can now activate membership.");
                    await loadData();
                  } catch (error: any) {
                    toast.error(error.message);
                  }
                }}
              />

              {/* Send Kit Link Card - Show when consultation is complete */}
              {(selectedPatient.patient.onboarding_status === "consultation_paid" ||
                selectedPatient.patient.onboarding_status === "consultation_complete" || 
                selectedPatient.patient.onboarding_status === "intake_complete") && 
                selectedPatient.patient.email && (
                <SendKitLinkCard
                  patientId={selectedPatient.patient.id}
                  patientName={selectedPatient.patient.full_name}
                  patientEmail={selectedPatient.patient.email}
                />
              )}

              {/* Safety Flags */}
              {(selectedPatient.patient.safety_flags?.length > 0 || selectedPatient.patient.risk_status === "high_risk_review") && (
                <Card className="border-red-500 border-2 bg-red-50/50 dark:bg-red-950/20">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-700 dark:text-red-400">Manual Review Required</p>
                        <ul className="text-sm text-red-600 dark:text-red-300 mt-1 list-disc list-inside">
                          {selectedPatient.patient.safety_flags?.map((flag: string, i: number) => (
                            <li key={i}>{flag}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Kit Tracking Admin - Show if patient has paid for hormone mapping */}
              {selectedPatientKit && (
                <KitStatusAdmin
                  paymentId={selectedPatientKit.id}
                  currentStatus={selectedPatientKit.zrt_kit_status}
                  currentTrackingNumber={selectedPatientKit.tracking_number}
                  patientEmail={selectedPatientKit.customer_email}
                  onUpdate={() => selectPatient(selectedPatient)}
                />
              )}

              {/* Androgen Excess Warning */}
              {(selectedPatient.latestLog?.raw_answers as Record<string, any> | null)?.androgen_excess_risk && (
                <Card className="border-amber-500 border-2 bg-amber-50/50 dark:bg-amber-950/20">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-700 dark:text-amber-400">Androgen Excess Risk</p>
                        <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">
                          Patient shows signs of acne/facial hair. Testosterone therapy requires additional evaluation.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lab Path Indicator */}
              {selectedPatient.labPath && (
                <Card className={`border-2 ${
                  selectedPatient.labPath.path === "labcorp" 
                    ? "border-amber-500 bg-amber-50/30 dark:bg-amber-950/10" 
                    : "border-green-500 bg-green-50/30 dark:bg-green-950/10"
                }`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      {selectedPatient.labPath.path === "labcorp" ? (
                        <TestTube className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Droplet className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className={`font-semibold ${
                          selectedPatient.labPath.path === "labcorp" 
                            ? "text-amber-700 dark:text-amber-400" 
                            : "text-green-700 dark:text-green-400"
                        }`}>
                          {selectedPatient.labPath.path === "labcorp" ? "LabCorp Blood Work Required" : "ZRT Saliva Kit (Standard)"}
                        </p>
                        {selectedPatient.labPath.reason && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedPatient.labPath.reason}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {selectedPatient.patient.gender === "male" ? "Male" : "Female"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {selectedPatient.patient.treatment_request?.replace(/_/g, " ") || "Not specified"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* LabCorp Requisition Card */}
              {selectedPatient.labPath?.path === "labcorp" && selectedPatient.labPath.panel && (
                <LabCorpRequisition
                  patientName={selectedPatient.patient.full_name}
                  patientDob={selectedPatient.patient.dob}
                  gender={selectedPatient.patient.gender || "unknown"}
                  panelType={selectedPatient.labPath.panel}
                  reason={selectedPatient.labPath.reason || "Medical necessity"}
                  onEmailRequisition={handleEmailRequisition}
                  isEmailing={isEmailingRequisition}
                  providerName={providerInfo.name}
                  providerCredentials={providerInfo.credentials}
                />
              )}

              {/* ZRT Saliva Kit Requisition */}
              {selectedPatient.labPath?.path === "zrt" && (
                <ZRTRequisitionGenerator
                  patient={{
                    full_name: selectedPatient.patient.full_name,
                    dob: selectedPatient.patient.dob,
                    gender: selectedPatient.patient.gender,
                    street_address: selectedPatient.patient.street_address,
                    city: selectedPatient.patient.city,
                    state: selectedPatient.patient.state,
                    zip_code: selectedPatient.patient.zip_code,
                    phone: selectedPatient.patient.phone,
                    email: selectedPatient.patient.email,
                    treatment_request: selectedPatient.patient.treatment_request,
                  }}
                  symptomLog={selectedPatient.latestLog ? {
                    estrogen_score: selectedPatient.latestLog.estrogen_score,
                    progesterone_score: selectedPatient.latestLog.progesterone_score,
                    androgen_score: selectedPatient.latestLog.androgen_score,
                    cortisol_score: selectedPatient.latestLog.cortisol_score,
                    raw_answers: selectedPatient.latestLog.raw_answers as any,
                  } : null}
                  membershipType={selectedPatient.patient.treatment_request?.includes("weight") ? "weight_management" : "hormone"}
                  providerName={providerInfo.name}
                  providerCredentials={providerInfo.credentials}
                />
              )}

              {/* Blood Work History (for Labcorp patients) */}
              {selectedPatient.labPath?.path === "labcorp" && (
                <BloodWorkHistory 
                  patientId={selectedPatient.patient.id}
                  patientName={selectedPatient.patient.full_name}
                />
              )}

              {/* Symptom Trends Chart */}
              <Card className="bg-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Symptom Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {patientLogs.length > 0 ? (
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="Estrogen" stroke="#ec4899" strokeWidth={2} />
                          <Line type="monotone" dataKey="Progesterone" stroke="#a855f7" strokeWidth={2} />
                          <Line type="monotone" dataKey="Androgen" stroke="#3b82f6" strokeWidth={2} />
                          <Line type="monotone" dataKey="Cortisol" stroke="#f97316" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center py-8 space-y-2">
                      <p className="text-muted-foreground">No symptom data available</p>
                      {(selectedPatient.patient.onboarding_status === 'treatment_active' || 
                        selectedPatient.patient.onboarding_status === 'existing_patient' ||
                        (selectedPatient.patient.medical_history as any)?.is_migrated_patient) && (
                        <p className="text-xs text-muted-foreground">
                          Existing patients can complete a symptom check-in to begin tracking trends.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Lab Analysis Card */}
              <LabAnalysisCard
                patientId={selectedPatient.patient.id}
                patientName={selectedPatient.patient.full_name}
                patientGender={selectedPatient.patient.gender || 'female'}
                latestSymptomScore={selectedPatient.latestLog ? {
                  estrogen: selectedPatient.latestLog.estrogen_score || 0,
                  progesterone: selectedPatient.latestLog.progesterone_score || 0,
                  androgen: selectedPatient.latestLog.androgen_score || 0,
                  cortisol: selectedPatient.latestLog.cortisol_score || 0,
                } : undefined}
                onApplyToRx={(meds) => setRecommendedMedications(meds)}
              />

              {/* Lab Interpretation Engine - Holgate Logic */}
              <LabInterpretationEngine
                patientId={selectedPatient.patient.id}
                patientName={selectedPatient.patient.full_name}
                patientGender={selectedPatient.patient.gender || "female"}
              />

              {/* Mark Labs Reviewed Button */}
              {selectedPatient.patient.onboarding_status && 
               !["labs_reviewed", "protocol_approved", "treatment_active", "pending_pharmacy_order"].includes(selectedPatient.patient.onboarding_status) && (
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="font-medium">Lab Results Review</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Once you've reviewed the patient's lab results, mark them as reviewed to unlock their Health Report.
                      </p>
                      <Button
                        onClick={handleMarkLabsReviewed}
                        disabled={isMarkingLabsReviewed}
                        className="w-full"
                      >
                        {isMarkingLabsReviewed ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4 mr-2" />
                        )}
                        {isMarkingLabsReviewed ? "Updating..." : "Mark Labs Reviewed"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Labs Reviewed Badge */}
              {selectedPatient.patient.onboarding_status && 
               ["labs_reviewed", "protocol_approved", "treatment_active", "pending_pharmacy_order"].includes(selectedPatient.patient.onboarding_status) && (
                <Card className="border-green-500/30 bg-green-50/50 dark:bg-green-950/20">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-green-700 dark:text-green-400">Labs Reviewed</p>
                        <p className="text-sm text-green-600 dark:text-green-300">Patient's Health Report is unlocked</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Hormone Protocol Pricing Add-On Selector */}
              <HormoneAddonSelector
                patientId={selectedPatient.patient.id}
                patientName={selectedPatient.patient.full_name}
                patientEmail={selectedPatient.patient.email}
                patientPhone={selectedPatient.patient.phone}
                currentHasAddon={!!(selectedPatient.patient.medical_history as Record<string, any>)?.has_hormone_addon}
                baseMembership="semaglutide"
              />

              {/* SUNSETTED ADD-ON SELECTORS - Hidden but code preserved for future reactivation
              
              <PeptideAddonSelector
                patientId={selectedPatient.patient.id}
                patientName={selectedPatient.patient.full_name}
                currentPeptides={(selectedPatient.patient.medical_history as Record<string, any>)?.peptide_protocols || []}
              />

              <HairRestorationAddonSelector
                patientId={selectedPatient.patient.id}
                patientName={selectedPatient.patient.full_name}
                patientEmail={selectedPatient.patient.email || ""}
                currentProducts={(selectedPatient.patient.medical_history as Record<string, any>)?.hair_restoration_products || []}
                onUpdate={() => loadData()}
              />

              <SexualWellnessAddonSelector
                patientId={selectedPatient.patient.id}
                patientName={selectedPatient.patient.full_name}
                patientEmail={selectedPatient.patient.email || ""}
                patientGender={selectedPatient.patient.gender || "male"}
                currentProducts={(selectedPatient.patient.medical_history as Record<string, any>)?.sexual_wellness_products || []}
                onUpdate={() => loadData()}
              />
              
              */}

              {/* À La Carte Payment Card - For non-members */}
              <AlaCartePaymentCard
                patientId={selectedPatient.patient.id}
                patientName={selectedPatient.patient.full_name}
                patientEmail={selectedPatient.patient.email}
                patientPhone={selectedPatient.patient.phone}
                hasMembership={!!selectedPatient.patient.membership_tier}
              />

              {/* IV Ketamine Billing - Show for ketamine patients or always visible */}
              <IVKetamineBilling
                patientId={selectedPatient.patient.id}
                patientName={selectedPatient.patient.full_name}
                patientEmail={selectedPatient.patient.email || ""}
                patientPhone={selectedPatient.patient.phone || ""}
              />

              {/* Osmind Invite Card - For Ketamine Patients */}
              {selectedPatient.patient.treatment_request?.includes("ketamine") && (
                <OsmindInviteCard
                  patientId={selectedPatient.patient.id}
                  patientName={selectedPatient.patient.full_name}
                  patientEmail={selectedPatient.patient.email || ""}
                  consentSentAt={selectedPatient.patient.consent_sent_at || null}
                  consentCompletedAt={selectedPatient.patient.consent_completed_at || null}
                  consentMethod={selectedPatient.patient.consent_method || null}
                  onUpdate={() => loadData()}
                />
              )}

              {/* Consent PDF Card - For non-ketamine patients with consent */}
              {!selectedPatient.patient.treatment_request?.includes("ketamine") && (
                <ConsentPDFCard
                  patientId={selectedPatient.patient.id}
                  patientName={selectedPatient.patient.full_name}
                  patientEmail={selectedPatient.patient.email || null}
                  consentSignature={selectedPatient.patient.consent_signature || null}
                  consentCompletedAt={selectedPatient.patient.consent_completed_at || null}
                  consentMethod={selectedPatient.patient.consent_method || null}
                />
              )}

              {/* Pharmacy Order Card */}
              <PharmacyOrderCard
                patient={{
                  id: selectedPatient.patient.id,
                  full_name: selectedPatient.patient.full_name,
                  dob: selectedPatient.patient.dob,
                  email: selectedPatient.patient.email,
                  phone: selectedPatient.patient.phone,
                  street_address: selectedPatient.patient.street_address,
                  city: selectedPatient.patient.city,
                  state: selectedPatient.patient.state,
                  zip_code: selectedPatient.patient.zip_code,
                  allergies: selectedPatient.patient.allergies,
                  medical_history: selectedPatient.patient.medical_history as Record<string, any> | null,
                  gender: selectedPatient.patient.gender,
                }}
                onOrderCreated={() => loadData()}
                recommendedMedications={recommendedMedications}
              />

              {/* Supplement Plan Card - Dr. Holgate's Protocols */}
              <SupplementPlanCard
                patient={{
                  id: selectedPatient.patient.id,
                  full_name: selectedPatient.patient.full_name,
                  gender: selectedPatient.patient.gender,
                  dob: selectedPatient.patient.dob,
                }}
                latestLabResult={selectedPatientLabResult}
              />

              {/* Membership Assignment Card */}
              <MembershipAssignmentCard
                patientId={selectedPatient.patient.id}
                patientName={selectedPatient.patient.full_name}
                currentTier={selectedPatient.patient.membership_tier || null}
                currentRenewalDate={selectedPatient.patient.membership_renewal_date || null}
                onUpdate={() => loadData()}
              />

              {/* Insurance Documentation */}
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Insurance Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Patient Superbill (for insurance reimbursement)
                    </p>
                    <SuperbillGenerator
                      patient={{
                        id: selectedPatient.patient.id,
                        full_name: selectedPatient.patient.full_name,
                        dob: selectedPatient.patient.dob,
                        street_address: selectedPatient.patient.street_address,
                        city: selectedPatient.patient.city,
                        state: selectedPatient.patient.state,
                        zip_code: selectedPatient.patient.zip_code,
                        treatment_request: selectedPatient.patient.treatment_request,
                      }}
                      serviceType={
                        selectedPatient.patient.treatment_request?.includes("weight") 
                          ? "weight_management" 
                          : "saliva_profile_iii"
                      }
                      chargeAmount={
                        selectedPatient.patient.treatment_request?.includes("weight") ? 399 : 299
                      }
                    />
                  </div>
                  <div className="border-t border-border/50 pt-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      Encounter Form (internal billing → Kristen)
                    </p>
                    <EncounterFormModal
                      patient={{
                        id: selectedPatient.patient.id,
                        full_name: selectedPatient.patient.full_name,
                        dob: selectedPatient.patient.dob,
                        phone: selectedPatient.patient.phone,
                        email: selectedPatient.patient.email,
                      }}
                      onSuccess={() => loadData()}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Order Labcorp Safety Panel Button */}
              <Button
                variant="outline"
                onClick={() => setIsLabcorpModalOpen(true)}
                className="w-full border-amber-500/30 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/20"
              >
                <TestTube className="w-4 h-4 mr-2" />
                Order Labcorp Safety Panel
              </Button>
              
              {/* Edit Patient Profile Button */}
              <Button
                variant="outline"
                onClick={() => setIsEditProfileOpen(true)}
                className="w-full border-foreground/20 hover:bg-secondary"
              >
                <User className="w-4 h-4 mr-2" />
                Edit Patient Profile
              </Button>

              {/* Flag as Late Cancel / No-Show Button */}
              <Button
                variant="outline"
                onClick={async () => {
                  if (!selectedPatient) return;
                  setIsFlaggingNoShow(true);
                  try {
                    const { error } = await supabase
                      .from("patients")
                      .update({ onboarding_status: "rebooking_fee_required" })
                      .eq("id", selectedPatient.patient.id);
                    
                    if (error) throw error;
                    toast.success("Patient flagged for late cancel/no-show. $99 rebooking fee required.");
                    await loadData();
                    selectPatient({
                      ...selectedPatient,
                      patient: { ...selectedPatient.patient, onboarding_status: "rebooking_fee_required" }
                    });
                  } catch (err: any) {
                    toast.error(err.message || "Failed to flag patient");
                  } finally {
                    setIsFlaggingNoShow(false);
                  }
                }}
                disabled={isFlaggingNoShow || selectedPatient.patient.onboarding_status === "rebooking_fee_required"}
                className="w-full border-red-500/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                {isFlaggingNoShow ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Ban className="w-4 h-4 mr-2" />
                )}
                {selectedPatient.patient.onboarding_status === "rebooking_fee_required" 
                  ? "Already Flagged - Fee Required" 
                  : "Flag as Late Cancel / No-Show"}
              </Button>

              {/* Archive Patient Button */}
              <Button
                variant="outline"
                onClick={handleArchivePatient}
                disabled={isArchiving}
                className={`w-full ${
                  selectedPatient.patient.is_archived 
                    ? "border-green-500/30 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20" 
                    : "border-amber-500/30 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                }`}
              >
                {isArchiving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : selectedPatient.patient.is_archived ? (
                  <ArchiveRestore className="w-4 h-4 mr-2" />
                ) : (
                  <Archive className="w-4 h-4 mr-2" />
                )}
                {isArchiving 
                  ? "Processing..." 
                  : selectedPatient.patient.is_archived 
                    ? "Restore to Active" 
                    : "Archive Patient"}
              </Button>

              {/* Delete Patient Button */}
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(true)}
                className="w-full border-red-600/50 text-red-600 hover:bg-red-100 dark:hover:bg-red-950/30"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Permanently Delete Patient
              </Button>

              {/* Delete Confirmation Modal */}
              <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                      <Trash2 className="w-5 h-5" />
                      Delete Patient Permanently
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-4">
                      <p>
                        You are about to permanently delete <strong>{selectedPatient.patient.full_name}</strong> and all associated records. This action cannot be undone.
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="deleteConfirm" className="text-sm font-medium">
                          Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm:
                        </Label>
                        <Input
                          id="deleteConfirm"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          placeholder="Type DELETE to confirm"
                          className="font-mono"
                        />
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => {
                      setDeleteConfirmText("");
                      setIsDeleteModalOpen(false);
                    }}>
                      Cancel
                    </AlertDialogCancel>
                    <Button
                      variant="destructive"
                      onClick={handleDeletePatient}
                      disabled={deleteConfirmText !== "DELETE" || isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Forever
                        </>
                      )}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Edit Patient Profile Modal */}
              <EditPatientProfileModal
                isOpen={isEditProfileOpen}
                onClose={() => setIsEditProfileOpen(false)}
                patient={{
                  id: selectedPatient.patient.id,
                  full_name: selectedPatient.patient.full_name,
                  street_address: selectedPatient.patient.street_address,
                  city: selectedPatient.patient.city,
                  state: selectedPatient.patient.state,
                  zip_code: selectedPatient.patient.zip_code,
                  allergies: selectedPatient.patient.allergies,
                }}
                onUpdated={() => loadData()}
              />

              {/* Protocol Suggestion */}
              {recommendedProtocol ? (
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30">
                  <CardHeader>
                    <CardTitle className="text-sm text-gold uppercase tracking-wider">
                      Recommended Protocol
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <h3 className="font-cormorant text-2xl text-foreground">
                      {recommendedProtocol.name.includes("Menopause") ? "Protocol A (Menopause)" :
                       recommendedProtocol.name.includes("Vitality") ? "Protocol B (Vitality)" :
                       recommendedProtocol.name}
                    </h3>

                    {/* Dispenser Visual */}
                    <div className="flex justify-center py-4">
                      <div className={`w-20 h-32 rounded-xl flex items-center justify-center shadow-lg ${
                        recommendedProtocol.dispenser_type?.toLowerCase().includes("pink")
                          ? "bg-gradient-to-b from-pink-300 to-pink-500"
                          : recommendedProtocol.dispenser_type?.toLowerCase().includes("blue")
                          ? "bg-gradient-to-b from-blue-300 to-blue-500"
                          : "bg-gradient-to-b from-gray-300 to-gray-500"
                      }`}>
                        <span className="text-white text-xs font-medium rotate-90 tracking-wider">
                          {recommendedProtocol.dispenser_type?.toUpperCase() || "TOPICLICK"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <p><span className="text-muted-foreground">Product:</span> {recommendedProtocol.primary_compound}</p>
                      <p><span className="text-muted-foreground">Default Sig:</span> {recommendedProtocol.instructions}</p>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={authorizeAndSendOrder}
                      disabled={isAuthorizing || selectedPatient.patient.risk_status === "high_risk_review"}
                    >
                      {isAuthorizing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Approve & Create Order
                    </Button>

                    {selectedPatient.patient.risk_status === "high_risk_review" && (
                      <p className="text-xs text-center text-red-500">
                        Cannot auto-approve. Patient requires manual review due to safety flags.
                      </p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-muted/30 border-border/50">
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">No automatic protocol recommendation available.</p>
                    <p className="text-sm text-muted-foreground mt-2">Manual protocol assignment required.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}

      {/* Invite Provider Modal */}
      <InviteProviderModal
        open={isInviteProviderOpen}
        onOpenChange={setIsInviteProviderOpen}
      />

      {/* Labcorp Order Modal */}
      {selectedPatient && (
        <LabcorpOrderModal
          isOpen={isLabcorpModalOpen}
          onClose={() => setIsLabcorpModalOpen(false)}
          patient={{
            id: selectedPatient.patient.id,
            full_name: selectedPatient.patient.full_name,
            dob: selectedPatient.patient.dob,
            street_address: selectedPatient.patient.street_address,
            city: selectedPatient.patient.city,
            state: selectedPatient.patient.state,
            zip_code: selectedPatient.patient.zip_code,
            email: selectedPatient.patient.email,
          }}
          onSuccess={() => {
            loadData();
            selectPatient({
              ...selectedPatient,
              patient: { ...selectedPatient.patient, onboarding_status: "awaiting_blood_work" }
            });
          }}
        />
      )}

      {/* Provider AI Assistant - Floating Chat */}
      <ProviderAssistant />
    </div>
  );
};

export default ProviderDashboard;