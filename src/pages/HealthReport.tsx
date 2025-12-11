import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Loader2, 
  ArrowLeft, 
  Heart, 
  Zap, 
  Activity, 
  FileText, 
  Lock,
  TrendingDown,
  Calendar
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import CorrelationCard from "@/components/patient/CorrelationCard";

interface LabResult {
  id: string;
  collection_date: string;
  estradiol_e2: number | null;
  progesterone_pg: number | null;
  testosterone_t: number | null;
  cortisol_morning: number | null;
  notes: string | null;
  correlation_alert: string | null;
}

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
  gender: string | null;
  onboarding_status: string | null;
}

// Reference ranges for ZRT saliva tests (pg/mL)
const LAB_REFERENCES = {
  female: {
    estradiol: { low: 1.0, optimal: 3.0, high: 8.0, unit: "pg/mL" },
    progesterone: { low: 75, optimal: 250, high: 500, unit: "pg/mL" },
    testosterone: { low: 20, optimal: 45, high: 80, unit: "pg/mL" },
    cortisol: { low: 3.0, optimal: 10.0, high: 20.0, unit: "ng/mL" },
  },
  male: {
    estradiol: { low: 1.0, optimal: 3.0, high: 6.0, unit: "pg/mL" },
    progesterone: { low: 12, optimal: 50, high: 100, unit: "pg/mL" },
    testosterone: { low: 50, optimal: 120, high: 200, unit: "pg/mL" },
    cortisol: { low: 3.0, optimal: 10.0, high: 20.0, unit: "ng/mL" },
  },
};

const HealthReport = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [latestLabs, setLatestLabs] = useState<LabResult | null>(null);
  const [latestSymptoms, setLatestSymptoms] = useState<SymptomLog | null>(null);
  const [symptomHistory, setSymptomHistory] = useState<SymptomLog[]>([]);
  const [isLocked, setIsLocked] = useState(true);

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // ProtectedRoute handles auth redirects - just return here
        return;
      }

      // Get patient record
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .select("id, full_name, gender, onboarding_status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (patientError || !patientData) {
        toast.error("Patient profile not found");
        navigate("/patient/dashboard");
        return;
      }

      setPatient(patientData);

      // Check if labs have been reviewed (unlock condition)
      // Labs are "reviewed" when they exist and patient has status labs_reviewed, protocol_approved, or treatment_active
      const reviewedStatuses = ["labs_reviewed", "protocol_approved", "pending_pharmacy_order", "treatment_active"];
      const hasReviewedStatus = reviewedStatuses.includes(patientData.onboarding_status || "");

      // Get latest lab results
      const { data: labData } = await supabase
        .from("lab_results")
        .select("*")
        .eq("patient_id", patientData.id)
        .order("collection_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      setLatestLabs(labData);

      // Unlock if has labs and reviewed status
      setIsLocked(!labData || !hasReviewedStatus);

      // Get latest symptom log
      const { data: symptomData } = await supabase
        .from("symptom_logs")
        .select("*")
        .eq("patient_id", patientData.id)
        .order("date_logged", { ascending: false })
        .limit(1)
        .maybeSingle();

      setLatestSymptoms(symptomData);

      // Get symptom history for progress chart (last 6 entries)
      const { data: historyData } = await supabase
        .from("symptom_logs")
        .select("*")
        .eq("patient_id", patientData.id)
        .order("date_logged", { ascending: true })
        .limit(6);

      setSymptomHistory(historyData || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load health data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Locked state
  if (isLocked) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/50 bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/patient/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Health Report</p>
              <h1 className="font-cormorant text-2xl text-foreground">My Health Report</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto bg-secondary/30 border-border/50">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="font-cormorant text-xl text-foreground">
                Report Not Yet Available
              </h2>
              <p className="text-sm text-muted-foreground">
                Your Health Report will be available once Lauren has reviewed your lab results 
                and designed your personalized protocol.
              </p>
              <p className="text-xs text-muted-foreground">
                {!latestLabs 
                  ? "Waiting for lab results to be entered..." 
                  : "Lab results received. Awaiting provider review..."}
              </p>
              <Button variant="outline" onClick={() => navigate("/patient/dashboard")}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const gender = patient?.gender === "male" ? "male" : "female";
  const refs = LAB_REFERENCES[gender];

  // Progress chart data
  const chartData = symptomHistory.map((log, index) => ({
    date: new Date(log.date_logged).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    total: log.estrogen_score + log.progesterone_score + log.androgen_score + log.cortisol_score,
    estrogen: log.estrogen_score,
    testosterone: log.androgen_score,
    cortisol: log.cortisol_score,
    isBaseline: index === 0,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/patient/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <p className="text-xs uppercase tracking-widest text-gold">Results Reveal</p>
            <h1 className="font-cormorant text-2xl text-foreground">My Health Report</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
        {/* Summary Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/20 rounded-full">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-cormorant text-xl text-foreground">
                  Your Results Are In, {patient?.full_name?.split(" ")[0]}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Below you'll see how your symptoms correlate with your lab values. 
                  This validates what you've been feeling and guides your personalized treatment.
                </p>
                {latestLabs?.collection_date && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Lab collection date: {new Date(latestLabs.collection_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Correlation Cards */}
        <div className="space-y-4">
          <h2 className="font-cormorant text-xl text-foreground">Symptom & Lab Correlation</h2>
          
          <div className="grid gap-4">
            {/* Estrogen */}
            <CorrelationCard
              hormone="Estrogen (Estradiol)"
              symptomScore={latestSymptoms?.estrogen_score || 0}
              symptomMaxScore={15}
              labValue={latestLabs?.estradiol_e2 || null}
              labUnit={refs.estradiol.unit}
              labReference={refs.estradiol}
              icon={<Heart className="w-5 h-5 text-white" />}
              colorClass="bg-gradient-to-r from-pink-500 to-pink-600"
            />

            {/* Testosterone */}
            <CorrelationCard
              hormone="Testosterone (Vitality)"
              symptomScore={latestSymptoms?.androgen_score || 0}
              symptomMaxScore={12}
              labValue={latestLabs?.testosterone_t || null}
              labUnit={refs.testosterone.unit}
              labReference={refs.testosterone}
              icon={<Zap className="w-5 h-5 text-white" />}
              colorClass="bg-gradient-to-r from-blue-500 to-blue-600"
            />

            {/* Cortisol */}
            <CorrelationCard
              hormone="Cortisol (Stress)"
              symptomScore={latestSymptoms?.cortisol_score || 0}
              symptomMaxScore={9}
              labValue={latestLabs?.cortisol_morning || null}
              labUnit={refs.cortisol.unit}
              labReference={refs.cortisol}
              icon={<Activity className="w-5 h-5 text-white" />}
              colorClass="bg-gradient-to-r from-orange-500 to-orange-600"
            />
          </div>
        </div>

        {/* Provider Notes */}
        {latestLabs?.notes && (
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Provider Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {latestLabs.notes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Correlation Alert */}
        {latestLabs?.correlation_alert && (
          <Card className="border-amber-500 border-2 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="pt-4">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                <strong>Clinical Note:</strong> {latestLabs.correlation_alert}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Progress Tracker (Before & After) */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-green-500" />
              Your Progress Journey
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Track your symptom improvement over time. Lower scores = feeling better.
            </p>
          </CardHeader>
          <CardContent>
            {chartData.length > 1 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10 }} 
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Legend />
                    {/* Baseline reference */}
                    {chartData[0] && (
                      <ReferenceLine 
                        y={chartData[0].total} 
                        stroke="hsl(var(--muted-foreground))" 
                        strokeDasharray="3 3"
                        label={{ value: "Baseline", fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      />
                    )}
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      name="Total Score"
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="estrogen" 
                      name="Estrogen"
                      stroke="#ec4899" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="testosterone" 
                      name="Testosterone"
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center space-y-3 bg-secondary/30 rounded-lg">
                <Calendar className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Tracking Your Progress</p>
                  <p className="text-xs text-muted-foreground">
                    Your baseline is set. After 3 months of treatment, log your symptoms again 
                    to see your improvement visualized here.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate("/patient/checkin")}
                >
                  Log Monthly Symptoms
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 pb-8">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate("/patient/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button 
            className="flex-1"
            onClick={() => navigate("/patient/checkin")}
          >
            Log Monthly Symptoms
          </Button>
        </div>
      </main>
    </div>
  );
};

export default HealthReport;
