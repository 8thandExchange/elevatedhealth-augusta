import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Activity, Zap, Heart, Brain, LogOut, Plus, Clock } from "lucide-react";
import CircularGauge from "@/components/ui/CircularGauge";
import MyRegimenCard from "@/components/patient/MyRegimenCard";
import WelcomeIntake from "@/components/patient/WelcomeIntake";
import OnboardingProgress from "@/components/patient/OnboardingProgress";

interface SymptomLog {
  id: string;
  date_logged: string;
  estrogen_score: number;
  progesterone_score: number;
  androgen_score: number;
  cortisol_score: number;
}

interface Patient {
  id: string;
  full_name: string;
  current_protocol: string | null;
  intake_completed: boolean;
  onboarding_status: string | null;
}

interface Order {
  id: string;
  status: string;
  protocol_snapshot: any;
}

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [latestLog, setLatestLog] = useState<SymptomLog | null>(null);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/patient/login");
        return;
      }

      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (patientError) throw patientError;
      if (!patientData) {
        toast.error("Patient profile not found");
        return;
      }

      setPatient(patientData);

      const { data: logData } = await supabase
        .from("symptom_logs")
        .select("*")
        .eq("patient_id", patientData.id)
        .order("date_logged", { ascending: false })
        .limit(1)
        .maybeSingle();

      setLatestLog(logData);

      // Get latest order
      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .eq("patient_id", patientData.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setLatestOrder(orderData);
    } catch (error: any) {
      toast.error(error.message || "Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestReview = async () => {
    if (!patient || !latestLog) return;

    setIsCreatingOrder(true);
    try {
      const { error } = await supabase.from("orders").insert({
        patient_id: patient.id,
        status: "pending_review",
        protocol_snapshot: {
          symptom_scores: {
            estrogen: latestLog.estrogen_score,
            progesterone: latestLog.progesterone_score,
            androgen: latestLog.androgen_score,
            cortisol: latestLog.cortisol_score,
          },
          date_requested: new Date().toISOString(),
        },
      });

      if (error) throw error;
      toast.success("Review request submitted! Lauren will contact you soon.");
      await loadDashboardData();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review request");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/patient/login");
  };

  // Build regimen items from protocol
  const getRegimenItems = () => {
    if (!latestOrder?.protocol_snapshot) return [];

    const snapshot = latestOrder.protocol_snapshot;
    const items = [];

    // Parse based on protocol name or compound
    if (snapshot.compound?.toLowerCase().includes("bi-est") || snapshot.protocol_name?.toLowerCase().includes("menopause")) {
      items.push({
        name: "Bi-Est (Estrogen)",
        compound: "Bi-Est 80/20 Cream",
        color: "pink" as const,
        instructions: snapshot.instructions || "Apply 1-2 clicks to inner thigh or behind the knee (thin skin) in the morning.",
        applicationSite: "Inner thigh or behind knee",
        timing: "Morning",
      });
    }

    if (snapshot.compound?.toLowerCase().includes("testosterone") || snapshot.protocol_name?.toLowerCase().includes("vitality")) {
      items.push({
        name: "Testosterone",
        compound: "Testosterone Cream",
        color: "blue" as const,
        instructions: snapshot.instructions || "Apply directly to the clitoral area or labia minora for maximum absorption.",
        applicationSite: "Clitoral area",
        timing: "Morning",
      });
    }

    if (snapshot.compound?.toLowerCase().includes("progesterone") || snapshot.protocol_name?.toLowerCase().includes("balance")) {
      items.push({
        name: "Progesterone",
        compound: "Progesterone Cream",
        color: "white" as const,
        instructions: snapshot.instructions || "Apply to breasts or neck at bedtime.",
        applicationSite: "Chest/Neck",
        timing: "Bedtime",
      });
    }

    // Default if nothing matched
    if (items.length === 0 && snapshot.protocol_name) {
      items.push({
        name: snapshot.protocol_name,
        compound: snapshot.compound || "Hormone Cream",
        color: "pink" as const,
        instructions: snapshot.instructions || "Follow provider instructions.",
        applicationSite: "As directed",
        timing: "As directed",
      });
    }

    return items;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show welcome intake if not completed
  if (patient && !patient.intake_completed) {
    return <WelcomeIntake patientName={patient.full_name} />;
  }

  const isAuthorized = latestOrder?.status === "authorized";
  const isPendingReview = latestOrder?.status === "pending_review";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold">Welcome back</p>
            <h1 className="font-cormorant text-2xl text-foreground">
              {patient?.full_name || "Patient"}
            </h1>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Onboarding Progress - Show if not fully active */}
        {!isAuthorized && (
          <OnboardingProgress
            onboardingStatus={patient?.onboarding_status || null}
            intakeCompleted={patient?.intake_completed || false}
            hasAuthorizedOrder={isAuthorized}
          />
        )}

        {/* Circular Health Gauges */}
        {latestLog && (
          <div>
            <h2 className="font-cormorant text-xl text-foreground mb-6 text-center">Your Wellness Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
              <CircularGauge
                score={latestLog.estrogen_score}
                maxScore={15}
                label="Estrogen"
                icon={<Heart className="w-4 h-4 text-pink-500" />}
              />
              <CircularGauge
                score={latestLog.progesterone_score}
                maxScore={9}
                label="Progesterone"
                icon={<Brain className="w-4 h-4 text-purple-500" />}
              />
              <CircularGauge
                score={latestLog.androgen_score}
                maxScore={12}
                label="Vitality"
                icon={<Zap className="w-4 h-4 text-blue-500" />}
              />
              <CircularGauge
                score={latestLog.cortisol_score}
                maxScore={9}
                label="Stress"
                icon={<Activity className="w-4 h-4 text-orange-500" />}
              />
            </div>
          </div>
        )}

        {/* Status Cards */}
        {isPendingReview && (
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/20 rounded-full">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Review in Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Lauren is reviewing your protocol based on your results.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Regimen Card - Show if authorized */}
        {isAuthorized && latestOrder?.protocol_snapshot && (
          <MyRegimenCard
            protocolName={latestOrder.protocol_snapshot.protocol_name || patient?.current_protocol || "Your Treatment Plan"}
            items={getRegimenItems()}
          />
        )}

        {/* Request Review Button - Show if has logs but no pending/authorized order */}
        {latestLog && !isPendingReview && !isAuthorized && (
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="font-cormorant text-xl text-foreground">
                  Ready to optimize your protocol?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Request a review with Lauren to discuss your results and get your personalized treatment plan.
                </p>
                <Button
                  onClick={handleRequestReview}
                  disabled={isCreatingOrder}
                  size="lg"
                >
                  {isCreatingOrder ? "Submitting..." : "Request Protocol Review"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No data state */}
        {!latestLog && (
          <Card className="bg-card border-border/50">
            <CardContent className="pt-6 text-center space-y-4">
              <p className="text-muted-foreground">
                No symptom check-ins yet. Complete your first assessment to see your wellness status.
              </p>
              <Button onClick={() => navigate("/patient/intake")}>
                <Plus className="w-4 h-4 mr-2" />
                Start Medical Intake
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="pb-8">
          <Button
            onClick={() => navigate("/patient/intake")}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Symptom Check-In
          </Button>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;