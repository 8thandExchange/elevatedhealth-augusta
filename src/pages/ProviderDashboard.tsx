import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, LogOut, AlertTriangle, Check, User, TrendingUp, X, Send, ShieldCheck, ShieldAlert } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import confetti from "canvas-confetti";
import LabAnalysisCard from "@/components/provider/LabAnalysisCard";

interface Patient {
  id: string;
  full_name: string;
  safety_flags: any;
  current_protocol: string | null;
  risk_status: string | null;
  medical_history: any;
}

interface SymptomLog {
  id: string;
  date_logged: string;
  estrogen_score: number;
  progesterone_score: number;
  androgen_score: number;
  cortisol_score: number;
  raw_answers: any;
}

interface Protocol {
  id: string;
  name: string;
  primary_compound: string;
  dispenser_type: string;
  instructions: string;
}

interface PatientWithLog {
  patient: Patient;
  latestLog: SymptomLog | null;
  highestCategory: string;
  riskLevel: "green" | "yellow" | "red";
}

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingPatients, setPendingPatients] = useState<PatientWithLog[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientWithLog | null>(null);
  const [patientLogs, setPatientLogs] = useState<SymptomLog[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [recommendedProtocol, setRecommendedProtocol] = useState<Protocol | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

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
      // Load patients with pending_review orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`
          patient_id,
          patients (*)
        `)
        .eq("status", "pending_review");

      if (ordersError) throw ordersError;

      // Also load patients with intake complete but no order yet
      const { data: intakePatients } = await supabase
        .from("patients")
        .select("*")
        .eq("onboarding_status", "intake_complete")
        .is("current_protocol", null);

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

        patientsWithLogs.push({ patient, latestLog, highestCategory, riskLevel });
      }

      setPendingPatients(patientsWithLogs);

      // Load protocols
      const { data: protocolsData } = await supabase.from("protocols").select("*");
      setProtocols(protocolsData || []);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
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
      {/* Header */}
      <header className="border-b border-border/50 bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold">Lauren's Command Center</p>
            <h1 className="font-cormorant text-2xl text-foreground">Triage Dashboard</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Action Needed Feed */}
        <div className="mb-8">
          <h2 className="font-cormorant text-xl text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Action Needed ({pendingPatients.length})
          </h2>

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
        </div>
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