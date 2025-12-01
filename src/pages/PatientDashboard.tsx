import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Activity, Zap, Heart, Brain, LogOut, Plus } from "lucide-react";
import TreatmentPlan from "@/components/patient/TreatmentPlan";

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
}

interface Protocol {
  name: string;
  dispenser_type: string;
  instructions: string;
}

const WellnessGauge = ({ 
  label, 
  score, 
  maxScore, 
  icon: Icon,
  color 
}: { 
  label: string; 
  score: number; 
  maxScore: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) => {
  const percentage = Math.min((score / maxScore) * 100, 100);
  const status = percentage > 66 ? "Needs Attention" : percentage > 33 ? "Moderate" : "Optimal";
  const statusColor = percentage > 66 ? "text-red-500" : percentage > 33 ? "text-yellow-500" : "text-green-500";

  return (
    <Card className="bg-card border-border/50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-full ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">{label}</h3>
            <p className={`text-sm ${statusColor}`}>{status}</p>
          </div>
        </div>
        
        {/* Gauge */}
        <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
          <div 
            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
              percentage > 66 ? "bg-red-500" : percentage > 33 ? "bg-yellow-500" : "bg-green-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Optimal</span>
          <span>Score: {score}</span>
        </div>
      </CardContent>
    </Card>
  );
};

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [latestLog, setLatestLog] = useState<SymptomLog | null>(null);
  const [protocol, setProtocol] = useState<Protocol | null>(null);
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

      // Get patient record
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

      // Get latest symptom log
      const { data: logData } = await supabase
        .from("symptom_logs")
        .select("*")
        .eq("patient_id", patientData.id)
        .order("date_logged", { ascending: false })
        .limit(1)
        .maybeSingle();

      setLatestLog(logData);

      // Get current protocol if assigned
      if (patientData.current_protocol) {
        const { data: protocolData } = await supabase
          .from("protocols")
          .select("*")
          .eq("name", patientData.current_protocol)
          .maybeSingle();
        
        setProtocol(protocolData);
      }
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
      toast.success("Review request submitted! Your provider will contact you soon.");
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
        {/* Wellness Gauges */}
        {latestLog ? (
          <>
            <div>
              <h2 className="font-cormorant text-xl text-foreground mb-4">Your Wellness Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <WellnessGauge 
                  label="Estrogen Balance" 
                  score={latestLog.estrogen_score} 
                  maxScore={12}
                  icon={Heart}
                  color="bg-pink-500"
                />
                <WellnessGauge 
                  label="Progesterone Balance" 
                  score={latestLog.progesterone_score} 
                  maxScore={9}
                  icon={Brain}
                  color="bg-purple-500"
                />
                <WellnessGauge 
                  label="Vitality & Energy" 
                  score={latestLog.androgen_score} 
                  maxScore={9}
                  icon={Zap}
                  color="bg-blue-500"
                />
                <WellnessGauge 
                  label="Stress Response" 
                  score={latestLog.cortisol_score} 
                  maxScore={9}
                  icon={Activity}
                  color="bg-orange-500"
                />
              </div>
            </div>

            {/* Review Button */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h3 className="font-cormorant text-xl text-foreground">
                    Ready to optimize your protocol?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Request a review with your provider to discuss your results and adjust your treatment plan.
                  </p>
                  <Button 
                    onClick={handleRequestReview}
                    disabled={isCreatingOrder}
                    size="lg"
                  >
                    {isCreatingOrder ? "Submitting..." : "Review with Provider"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="bg-card border-border/50">
            <CardContent className="pt-6 text-center space-y-4">
              <p className="text-muted-foreground">
                No symptom check-ins yet. Complete your first assessment to see your wellness status.
              </p>
              <Button onClick={() => navigate("/patient/check-in")}>
                <Plus className="w-4 h-4 mr-2" />
                Start Check-In
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Treatment Plan */}
        {patient?.current_protocol && protocol && (
          <TreatmentPlan 
            protocolName={patient.current_protocol}
            dispenserType={protocol.dispenser_type}
            instructions={protocol.instructions}
          />
        )}

        {/* Quick Actions */}
        <div className="pb-8">
          <Button 
            onClick={() => navigate("/patient/check-in")} 
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