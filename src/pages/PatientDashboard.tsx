import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, Activity, Zap, Heart, Brain, LogOut, Plus, Clock, Settings, CreditCard, Lock, FileText } from "lucide-react";
import CircularGauge from "@/components/ui/CircularGauge";
import MyRegimenCard from "@/components/patient/MyRegimenCard";
import WelcomeIntake from "@/components/patient/WelcomeIntake";
import OnboardingProgress from "@/components/patient/OnboardingProgress";
import EditProfileModal from "@/components/patient/EditProfileModal";
import PatientChatWidget from "@/components/chat/PatientChatWidget";
import KitTracker from "@/components/patient/KitTracker";
import MindCareCard from "@/components/patient/MindCareCard";
import NeurotransmitterCard from "@/components/patient/NeurotransmitterCard";

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
  primary_program: string | null;
}

interface Order {
  id: string;
  status: string;
  protocol_snapshot: any;
}

interface KitTracking {
  id: string;
  zrt_kit_status: string;
  tracking_number: string | null;
  shipped_at: string | null;
  sample_received_at: string | null;
  results_ready_at: string | null;
}

interface NeurotransmitterPayment {
  id: string;
  kit_status: string;
  tracking_number: string | null;
  shipped_at: string | null;
  sample_received_at: string | null;
  results_ready_at: string | null;
}

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [latestLog, setLatestLog] = useState<SymptomLog | null>(null);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [kitTracking, setKitTracking] = useState<KitTracking | null>(null);
  const [neuroPayment, setNeuroPayment] = useState<NeurotransmitterPayment | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    loadDashboardData();
    
    // Check for neurotransmitter payment success and verify
    const sessionId = searchParams.get("session_id");
    if (searchParams.get("neurotransmitter") === "success" && sessionId) {
      verifyNeurotransmitterPayment(sessionId);
    }
  }, []);

  const verifyNeurotransmitterPayment = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-neurotransmitter-payment', {
        body: { sessionId }
      });
      
      if (error) throw error;
      
      if (data?.verified) {
        toast.success("Neurotransmitter Analysis purchased! Your kit will ship within 3-5 business days.");
        // Reload data to show updated status
        loadDashboardData();
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      toast.success("Payment received! Your kit will ship soon.");
    }
  };

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

      // Fetch data based on patient program
      if (patientData.primary_program === "ketamine") {
        // Fetch neurotransmitter payment for ketamine patients
        const { data: neuroData } = await supabase
          .from("neurotransmitter_payments")
          .select("id, kit_status, tracking_number, shipped_at, sample_received_at, results_ready_at")
          .eq("patient_id", patientData.id)
          .eq("payment_status", "paid")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        setNeuroPayment(neuroData);
      } else {
        // Fetch hormone-specific data
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

        // Get kit tracking info
        const { data: kitData } = await supabase
          .from("hormone_mapping_payments")
          .select("id, zrt_kit_status, tracking_number, shipped_at, sample_received_at, results_ready_at")
          .eq("patient_id", patientData.id)
          .eq("payment_status", "paid")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        setKitTracking(kitData);
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
      toast.success("Review request submitted! A provider will contact you soon.");
      await loadDashboardData();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review request");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleLogout = async () => {
    console.log("[PatientDashboard] Logout initiated");
    try {
      const { error } = await supabase.auth.signOut();
      console.log("[PatientDashboard] signOut result:", { error });
      if (error) {
        console.error("[PatientDashboard] Logout error:", error);
        toast.error("Failed to logout");
        return;
      }
      toast.success("Logged out successfully");
      navigate("/patient/login");
    } catch (error: any) {
      console.error("[PatientDashboard] Logout exception:", error);
      toast.error("Failed to logout");
    }
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

  // Show welcome intake if not completed (only for hormone patients)
  if (patient && !patient.intake_completed && patient.primary_program !== "ketamine") {
    return <WelcomeIntake patientName={patient.full_name} />;
  }

  const isKetaminePatient = patient?.primary_program === "ketamine";
  const isAuthorized = latestOrder?.status === "authorized";
  const isPendingReview = latestOrder?.status === "pending_review";
  
  // LOCK #4: Membership is only available after protocol approval / labs reviewed
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
      {/* Header */}
      <header className="border-b border-border/50 bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 border border-border">
              <AvatarImage src={patient?.avatar_url || undefined} alt={patient?.full_name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {patient?.full_name ? getInitials(patient.full_name) : "P"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs uppercase tracking-widest text-gold">Welcome back</p>
              <h1 className="font-cormorant text-2xl text-foreground">
                {patient?.full_name || "Patient"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setIsEditProfileOpen(true)}>
              <Settings className="w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* KETAMINE PATIENT DASHBOARD */}
        {isKetaminePatient ? (
          <>
            {/* Mind Care Card - Osmind Portal */}
            <MindCareCard />

            {/* Neurotransmitter Analysis Add-on */}
            <NeurotransmitterCard 
              patientEmail={patient?.email || undefined}
              patientName={patient?.full_name}
              patientId={patient?.id}
              existingPayment={neuroPayment}
            />

            {/* Welcome message for ketamine patients */}
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Brain className="w-12 h-12 text-primary mx-auto" />
                  <h3 className="font-cormorant text-xl text-foreground">
                    Your Mental Wellness Journey
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Your ketamine therapy is coordinated through Osmind, our HIPAA-compliant mental health platform. 
                    Check your email for your secure portal invitation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          /* HORMONE PATIENT DASHBOARD */
          <>
            {/* Onboarding Progress - Show if not fully active */}
            {!isAuthorized && (
              <OnboardingProgress
                onboardingStatus={patient?.onboarding_status || null}
                intakeCompleted={patient?.intake_completed || false}
                hasAuthorizedOrder={isAuthorized}
              />
            )}

            {/* Kit Tracker - Show if patient has paid for hormone mapping */}
            {kitTracking && kitTracking.zrt_kit_status !== "not_ordered" && (
              <KitTracker
                status={kitTracking.zrt_kit_status}
                trackingNumber={kitTracking.tracking_number}
                shippedAt={kitTracking.shipped_at}
                sampleReceivedAt={kitTracking.sample_received_at}
                resultsReadyAt={kitTracking.results_ready_at}
                onBookCall={() => navigate("/schedule-consult")}
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

            {/* Health Report Card - Show when labs have been reviewed */}
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
                        See how your symptoms correlate with your lab results. Understand the science behind your treatment.
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
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/20 rounded-full">
                      <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Review in Progress</h3>
                      <p className="text-sm text-muted-foreground">
                        A provider is reviewing your protocol based on your results.
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

            {/* LOCK #4: Membership Card - Only visible after protocol approval */}
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
                        Lauren has reviewed your labs and designed your personalized treatment plan.
                        Activate your membership to begin treatment.
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

            {/* Locked Membership Card - Show when not yet approved */}
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
                        Your membership will be available after Lauren reviews your diagnostic results 
                        and approves your personalized protocol.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No data state - only show if no intake completed */}
            {!latestLog && !patient?.intake_completed && (
              <Card className="bg-card border-border/50">
                <CardContent className="pt-6 text-center space-y-4">
                  <p className="text-muted-foreground">
                    No symptom check-ins yet. Complete your medical intake to see your wellness status.
                  </p>
                  <Button onClick={() => navigate("/patient/intake")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Begin Medical Intake
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions - Conditional based on intake status */}
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
          </>
        )}
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

      {/* Secure Chat Widget - Show for all patients after intake */}
      {patient && (patient.intake_completed || isKetaminePatient) && (
        <PatientChatWidget patientId={patient.id} />
      )}
    </div>
  );
};

export default PatientDashboard;
