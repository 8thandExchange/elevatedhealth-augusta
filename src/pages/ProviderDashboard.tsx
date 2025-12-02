import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, AlertTriangle, Check, User, TrendingUp, TrendingDown, X, Send, ShieldCheck, ShieldAlert, TestTube, Droplet, Activity, MessageSquare, Pill } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import confetti from "canvas-confetti";
import LabAnalysisCard from "@/components/provider/LabAnalysisCard";
import LabCorpRequisition from "@/components/provider/LabCorpRequisition";
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

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingPatients, setPendingPatients] = useState<PatientWithLog[]>([]);
  const [recentCheckIns, setRecentCheckIns] = useState<RecentCheckIn[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientWithLog | null>(null);
  const [patientLogs, setPatientLogs] = useState<SymptomLog[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [recommendedProtocol, setRecommendedProtocol] = useState<Protocol | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEmailingRequisition, setIsEmailingRequisition] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("triage");
  const [renewingPatientId, setRenewingPatientId] = useState<string | null>(null);

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
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectPatient = async (patientWithLog: PatientWithLog) => {
    setSelectedPatient(patientWithLog);
    setIsPanelOpen(true);

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
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="triage" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Action Needed ({pendingPatients.length})
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Patient Monitoring ({recentCheckIns.length})
            </TabsTrigger>
          </TabsList>

          {/* Triage Tab */}
          <TabsContent value="triage">
            {pendingPatients.length === 0 ? (
              <Card className="bg-card border-border/50">
                <CardContent className="pt-6 text-center">
                  <ShieldCheck className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p className="text-muted-foreground">All caught up! No pending reviews.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
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
                        }`}
                        onClick={() => selectPatient(p)}
                      >
                        <td className="py-4 px-4">
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
                        <td className="py-4 px-4">
                          <span className="text-sm text-foreground">{p.highestCategory}</span>
                        </td>
                        <td className="py-4 px-4">
                          {getRiskBadge(p.riskLevel)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button size="sm" variant="outline">
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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