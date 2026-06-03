import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Loader2, Activity, Zap, Heart, Brain, Plus, Clock, CreditCard, Lock, FileText, 
  Sparkles, ArrowRight, ArrowLeft 
} from "lucide-react";
import CircularGauge from "@/components/ui/CircularGauge";
import MyRegimenCard from "@/components/patient/MyRegimenCard";
import OnboardingProgress from "@/components/patient/OnboardingProgress";
import EditProfileModal from "@/components/patient/EditProfileModal";
import PatientChatWidget from "@/components/chat/PatientChatWidget";
import PatientNavbar from "@/components/patient/PatientNavbar";
import { hasCompletedTier1Intake } from "@/lib/consents/intake-status";

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
  email: string | null;
  avatar_url: string | null;
  current_protocol: string | null;
  intake_completed: boolean;
  onboarding_status: string | null;
  treatment_request: string | null;
}

interface Order {
  id: string;
  status: string;
  protocol_snapshot: any;
}

const HormoneJourneyPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [latestLog, setLatestLog] = useState<SymptomLog | null>(null);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .select("id, full_name, email, avatar_url, current_protocol, intake_completed, onboarding_status, treatment_request")
        .eq("user_id", user.id)
        .maybeSingle();

      if (patientError) throw patientError;
      if (!patientData) {
        toast.error("Patient profile not found");
        return;
      }

      const tier1Done = await hasCompletedTier1Intake(patientData.id);
      if (!tier1Done) {
        navigate("/intake/consents");
        return;
      }

      setPatient(patientData);

      // Fetch symptom logs
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
      toast.error(error.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestReview = async () => {
    if (!patient || !latestLog) return;

    setIsCreatingOrder(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "request-hormone-review",
        { body: { symptom_log_id: latestLog.id } },
      );

      if (error) throw error;
      if (!data?.success) {
        throw new Error(data?.error || "Failed to submit review request");
      }
      toast.success("Review request submitted! A provider will contact you soon.");
      await loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review request");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const getRegimenItems = () => {
    if (!latestOrder?.protocol_snapshot) return [];

    const snapshot = latestOrder.protocol_snapshot;
    const items = [];

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

  const isAuthorized = latestOrder?.status === "authorized";
  const isPendingReview = latestOrder?.status === "pending_review";
  
  const canPurchaseMembership = patient?.onboarding_status === "protocol_approved" || 
                                 patient?.onboarding_status === "labs_reviewed" ||
                                 patient?.onboarding_status === "pending_pharmacy_order" ||
                                 patient?.onboarding_status === "treatment_active";

  const handlePurchaseMembership = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("create-membership-checkout");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to start checkout");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PatientNavbar 
        patientName={patient?.full_name || "Patient"}
        avatarUrl={patient?.avatar_url}
        onEditProfile={() => setIsEditProfileOpen(true)}
      />

      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate("/patient/dashboard")}
          className="gap-2 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </Button>

        {/* Page Header */}
        <div className="text-center space-y-2 pb-4">
          <div className="inline-flex items-center justify-center p-3 bg-pink-500/20 rounded-full mb-2">
            <Sparkles className="w-8 h-8 text-pink-600" />
          </div>
          <h1 className="font-cormorant text-3xl text-foreground">Hormone & Wellness Journey</h1>
          <p className="text-muted-foreground">
            Your personalized treatment progress and wellness tracking
          </p>
        </div>

        {/* Onboarding Progress */}
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

        {/* Health Report Card */}
        {canPurchaseMembership && (
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Your Health Report is Ready</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    See how your symptoms correlate with your lab results.
                  </p>
                  <Button 
                    onClick={() => navigate("/patient/health-report")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Health Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Cards */}
        {isPendingReview && (
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500/20 rounded-full">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Provider Review in Progress</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    A provider is reviewing your results and designing your personalized treatment plan.
                  </p>
                  <div className="bg-amber-100/50 dark:bg-amber-900/30 rounded-lg p-3 text-sm">
                    <p className="font-medium text-amber-800 dark:text-amber-200">⏱️ Estimated review time: 24-48 hours</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Regimen Card */}
        {isAuthorized && latestOrder?.protocol_snapshot && (
          <MyRegimenCard
            protocolName={latestOrder.protocol_snapshot.protocol_name || patient?.current_protocol || "Your Treatment Plan"}
            items={getRegimenItems()}
          />
        )}

        {/* Request Review Button */}
        {latestLog && !isPendingReview && !isAuthorized && (
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="font-cormorant text-xl text-foreground">
                  Ready to optimize your protocol?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Request a review to discuss your results and get your personalized treatment plan.
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

        {/* Membership Card */}
        {canPurchaseMembership && !isAuthorized && (
          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500/20 rounded-full">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Your Protocol is Approved!</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your provider has reviewed your labs and designed your personalized treatment plan.
                  </p>
                  <Button onClick={handlePurchaseMembership} className="bg-green-600 hover:bg-green-700">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Activate $399/mo Membership
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Locked Membership Card */}
        {!canPurchaseMembership && patient?.intake_completed && !isAuthorized && (
          <Card className="bg-secondary/30 border-border/50 relative overflow-hidden">
            <CardContent className="pt-6 opacity-60">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-muted rounded-full">
                  <Lock className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-muted-foreground">Membership Locked</h3>
                  <p className="text-sm text-muted-foreground">
                    Your membership will be available after your provider reviews your diagnostic results.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="pb-8">
          {patient?.intake_completed ? (
            <Button
              onClick={() => navigate("/patient/checkin")}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Log Monthly Symptoms
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/patient/intake")}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Begin Medical Intake
            </Button>
          )}
        </div>
      </main>

      {/* Edit Profile Modal */}
      {patient && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          patientId={patient.id}
          currentName={patient.full_name}
          currentAvatarUrl={patient.avatar_url}
          onUpdate={(newName, newAvatarUrl) => setPatient({ ...patient, full_name: newName, avatar_url: newAvatarUrl })}
        />
      )}

      {/* Chat Widget */}
      {patient && patient.intake_completed && <PatientChatWidget patientId={patient.id} />}
    </div>
  );
};

export default HormoneJourneyPage;
