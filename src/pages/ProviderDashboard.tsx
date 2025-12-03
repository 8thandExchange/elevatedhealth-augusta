import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, AlertTriangle, Check, User, TrendingUp, TrendingDown, X, Send, ShieldCheck, ShieldAlert, TestTube, Droplet, Activity, MessageSquare, Pill, Phone, Mail, Save, Clock, CreditCard, RotateCcw, CheckSquare, Square, UserPlus, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import confetti from "canvas-confetti";
import LabAnalysisCard from "@/components/provider/LabAnalysisCard";
import LabCorpRequisition from "@/components/provider/LabCorpRequisition";
import ZRTRequisitionGenerator from "@/components/provider/ZRTRequisitionGenerator";
import HormoneAddonSelector from "@/components/provider/HormoneAddonSelector";
import PeptideAddonSelector from "@/components/provider/PeptideAddonSelector";
import PharmacyOrderCard from "@/components/provider/PharmacyOrderCard";
import EditPatientProfileModal from "@/components/provider/EditPatientProfileModal";
import InvitePatientCard from "@/components/provider/InvitePatientCard";
import AdminNavbar from "@/components/admin/AdminNavbar";

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
  const [providerInfo, setProviderInfo] = useState<{ name: string; credentials: string }>({
    name: "Provider",
    credentials: "NP-C"
  });
  // Contact info editing state
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [isMarkingLabsReviewed, setIsMarkingLabsReviewed] = useState(false);

  // Provider lookup based on email - expand this as you add more providers
  const getProviderInfo = (email: string) => {
    const providers: Record<string, { name: string; credentials: string }> = {
      "admin@elevatedhealthaugusta.com": { name: "Lauren Bursey", credentials: "NP-C" },
      "lauren@elevatedhealthaugusta.com": { name: "Lauren Bursey", credentials: "NP-C" },
      // Add more providers here as needed
    };
    return providers[email.toLowerCase()] || { name: email.split("@")[0], credentials: "Provider" };
  };

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/admin/login");
        return;
      }

      // Set provider info based on logged-in user
      if (user.email) {
        setProviderInfo(getProviderInfo(user.email));
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const hasAccess = roles?.some(r => r.role === "admin" || r.role === "staff");
      if (!hasAccess) {
        toast.error("Access denied");
        navigate("/admin/login");
        return;
      }

      await loadData();
    } catch (error: any) {
      toast.error(error.message);
      navigate("/admin/login");
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

      // Also load patients with intake complete but no order yet
      const { data: intakePatients, error: intakeError } = await supabase
        .from("patients")
        .select("*")
        .eq("onboarding_status", "intake_complete")
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
        subtitle="Lauren's Command Center"
        onRefresh={async () => {
          setIsRefreshing(true);
          await loadData();
          setIsRefreshing(false);
        }}
        isRefreshing={isRefreshing}
      />

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="triage" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Action Needed ({pendingPatients.length})
            </TabsTrigger>
            <TabsTrigger value="pharmacy" className="flex items-center gap-2">
              <Pill className="w-4 h-4" />
              Pending Pharmacy ({pendingPharmacy.length})
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Monitoring ({recentCheckIns.length})
            </TabsTrigger>
            <TabsTrigger value="activations" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Activations ({pendingActivations.length})
            </TabsTrigger>
          </TabsList>

          {/* Triage Tab */}
          <TabsContent value="triage">
            {/* Invite Patient Card - Always visible at top */}
            <div className="mb-6">
              <InvitePatientCard onInviteSent={() => loadData()} />
            </div>
            
            {pendingPatients.length === 0 ? (
              <Card className="bg-card border-border/50">
                <CardContent className="pt-6 text-center">
                  <ShieldCheck className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p className="text-muted-foreground">All caught up! No pending reviews.</p>
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
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Highest Category</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Risk Level</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingPatients.map((p) => (
                        <tr 
                          key={p.patient.id} 
                          className={`border-b border-border/30 hover:bg-muted/30 cursor-pointer ${
                            p.riskLevel === "red" ? "bg-red-50/50 dark:bg-red-950/10" : ""
                          } ${selectedPatientIds.has(p.patient.id) ? "bg-primary/5" : ""}`}
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
                                <p className="font-medium text-foreground">{p.patient.full_name}</p>
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
                  <div className="overflow-x-auto">
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
                                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                    <Pill className="w-5 h-5 text-amber-600" />
                                  </div>
                                  <p className="font-medium text-foreground">{patient.full_name}</p>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="space-y-1">
                                  {patient.email && (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      {patient.email}
                                    </p>
                                  )}
                                  {patient.phone && (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
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
                                <Button
                                  size="sm"
                                  onClick={() => handleCompletePharmacyOrder(patient.id)}
                                  disabled={completingPharmacyId === patient.id}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  {completingPharmacyId === patient.id ? (
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  ) : (
                                    <Check className="w-3 h-3 mr-1" />
                                  )}
                                  {completingPharmacyId === patient.id ? "Completing..." : "Order Placed"}
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
        </Tabs>
      </main>

      {/* Side Panel */}
      {isPanelOpen && selectedPatient && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsPanelOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-card border-l border-border z-50 overflow-y-auto">
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
                </CardContent>
              </Card>

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
                    <p className="text-center text-muted-foreground py-8">No symptom data available</p>
                  )}
                </CardContent>
              </Card>

              {/* Lab Analysis Card */}
              <LabAnalysisCard
                patientId={selectedPatient.patient.id}
                patientName={selectedPatient.patient.full_name}
                latestSymptomScore={selectedPatient.latestLog ? {
                  estrogen: selectedPatient.latestLog.estrogen_score || 0,
                  progesterone: selectedPatient.latestLog.progesterone_score || 0,
                  androgen: selectedPatient.latestLog.androgen_score || 0,
                  cortisol: selectedPatient.latestLog.cortisol_score || 0,
                } : undefined}
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
                currentTier={(selectedPatient.patient.medical_history as Record<string, any>)?.hormone_addon_tier || "none"}
                baseMembership="metabolic"
              />

              {/* Peptide Add-On Selector */}
              <PeptideAddonSelector
                patientId={selectedPatient.patient.id}
                patientName={selectedPatient.patient.full_name}
                currentPeptides={(selectedPatient.patient.medical_history as Record<string, any>)?.peptide_protocols || []}
              />

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
                }}
                onOrderCreated={() => loadData()}
              />
              
              {/* Edit Patient Profile Button */}
              <Button
                variant="outline"
                onClick={() => setIsEditProfileOpen(true)}
                className="w-full border-foreground/20 hover:bg-secondary"
              >
                <User className="w-4 h-4 mr-2" />
                Edit Patient Profile
              </Button>

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
    </div>
  );
};

export default ProviderDashboard;