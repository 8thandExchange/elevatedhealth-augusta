import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Activity, Zap, Heart, Brain, Plus, Clock, CreditCard, Lock, FileText, Sparkles, ArrowRight, BookOpen } from "lucide-react";
import MyRegimenCard from "@/components/patient/MyRegimenCard";
import WelcomeIntake from "@/components/patient/WelcomeIntake";
import OnboardingProgress from "@/components/patient/OnboardingProgress";
import EditProfileModal from "@/components/patient/EditProfileModal";
import PatientChatWidget from "@/components/chat/PatientChatWidget";
import KitTracker from "@/components/patient/KitTracker";
import MindCareCard from "@/components/patient/MindCareCard";
import NeurotransmitterCard from "@/components/patient/NeurotransmitterCard";
import { MetabolicArchitectureCard } from "@/components/patient/MetabolicArchitectureCard";
import SafetyGate from "@/components/patient/SafetyGate";
import MinimalPatientHeader from "@/components/patient/MinimalPatientHeader";
import BottomTabBar from "@/components/patient/BottomTabBar";
import DailyProtocolCard from "@/components/patient/DailyProtocolCard";
import HealthOverview from "@/components/patient/HealthOverview";

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
  risk_status: string | null;
  safety_flags: any;
  treatment_request: string | null;
  gender?: string | null;
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

interface MetabolicPayment {
  id: string;
  kit_status: string;
  tracking_number?: string | null;
  shipped_at?: string | null;
  sample_received_at?: string | null;
  results_ready_at?: string | null;
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
  const [metabolicPayment, setMetabolicPayment] = useState<MetabolicPayment | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
    
    const sessionId = searchParams.get("session_id");
    if (searchParams.get("neurotransmitter") === "success" && sessionId) {
      verifyNeurotransmitterPayment(sessionId);
    }
    if (searchParams.get("metabolic") === "success" && sessionId) {
      verifyMetabolicPayment(sessionId);
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
        loadDashboardData();
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      toast.success("Payment received! Your kit will ship soon.");
    }
  };

  const verifyMetabolicPayment = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-metabolic-payment', {
        body: { sessionId }
      });
      if (error) throw error;
      if (data?.verified) {
        toast.success("Metabolic Architecture Kit purchased! Your kit will ship within 3-5 business days.");
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
      if (!user) return;

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

      if (patientData.primary_program === "ketamine") {
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
        const { data: logData } = await supabase
          .from("symptom_logs")
          .select("*")
          .eq("patient_id", patientData.id)
          .order("date_logged", { ascending: false })
          .limit(1)
          .maybeSingle();

        setLatestLog(logData);

        const { data: orderData } = await supabase
          .from("orders")
          .select("*")
          .eq("patient_id", patientData.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        setLatestOrder(orderData);

        const { data: kitData } = await supabase
          .from("hormone_mapping_payments")
          .select("id, zrt_kit_status, tracking_number, shipped_at, sample_received_at, results_ready_at")
          .eq("patient_id", patientData.id)
          .eq("payment_status", "paid")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        setKitTracking(kitData);

        if (patientData.primary_program === 'weight_loss' || patientData.treatment_request?.includes('weight')) {
          const { data: metabolicData } = await supabase
            .from('metabolic_payments')
            .select('id, kit_status')
            .eq('patient_id', patientData.id)
            .eq('payment_status', 'paid')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          setMetabolicPayment(metabolicData);
        }
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
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (patient && !patient.intake_completed && patient.primary_program !== "ketamine") {
    return <WelcomeIntake patientName={patient.full_name} />;
  }

  const isFlaggedPatient = patient?.risk_status === "high_risk_review" || 
    (Array.isArray(patient?.safety_flags) && patient.safety_flags.length > 0);
  
  if (patient && isFlaggedPatient) {
    const safetyFlags = Array.isArray(patient.safety_flags) ? patient.safety_flags : [];
    const treatmentType = patient.treatment_request || patient.primary_program || "hormone therapy";
    
    return (
      <SafetyGate
        patientName={patient.full_name}
        patientEmail={patient.email || ""}
        patientPhone=""
        safetyFlags={safetyFlags}
        treatmentType={treatmentType}
      />
    );
  }

  const isKetaminePatient = patient?.primary_program === "ketamine";
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
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Minimal Header */}
      <MinimalPatientHeader 
        patientName={patient?.full_name || "Patient"}
        avatarUrl={patient?.avatar_url}
        onEditProfile={() => setIsEditProfileOpen(true)}
      />

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-2xl">
        {/* KETAMINE PATIENT DASHBOARD */}
        {isKetaminePatient ? (
          <>
            <DailyProtocolCard 
              patientName={patient?.full_name}
              hasInjections={false}
              hasSupplements={false}
            />

            <MindCareCard />

            <NeurotransmitterCard 
              patientEmail={patient?.email || undefined}
              patientName={patient?.full_name}
              patientId={patient?.id}
              existingPayment={neuroPayment}
            />

            <Card className="bg-card border-border/50 rounded-2xl overflow-hidden">
              <CardContent className="p-5">
                <div className="text-center space-y-3">
                  <Brain className="w-10 h-10 text-gold mx-auto" />
                  <h3 className="font-playfair text-lg text-foreground">
                    Your Mental Wellness Journey
                  </h3>
                  <p className="text-sm text-muted-foreground font-inter">
                    Your ketamine therapy is coordinated through Osmind. Check your email for your secure portal invitation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          /* HORMONE PATIENT DASHBOARD */
          <>
            {/* Daily Protocol Hero Card */}
            <DailyProtocolCard 
              patientName={patient?.full_name}
              hasInjections={isAuthorized}
              hasSupplements={isAuthorized}
            />

            {/* Health Overview - Biological Scorecard */}
            <HealthOverview
              patientId={patient?.id || ''}
              patientEmail={patient?.email || ''}
              patientName={patient?.full_name || ''}
              labData={null}
              gender={patient?.gender || undefined}
              hasToxicityPayment={false}
              hasElevatedArchitecturePayment={false}
            />

            {/* Onboarding Progress */}
            {!isAuthorized && (
              <OnboardingProgress
                onboardingStatus={patient?.onboarding_status || null}
                intakeCompleted={patient?.intake_completed || false}
                hasAuthorizedOrder={isAuthorized}
              />
            )}

            {/* Metabolic Architecture Card */}
            {(patient?.primary_program === 'weight_loss' || patient?.treatment_request?.includes('weight')) && (
              <MetabolicArchitectureCard
                patientId={patient.id}
                patientEmail={patient.email || ''}
                patientName={patient.full_name}
                kitStatus={metabolicPayment?.kit_status}
              />
            )}

            {/* Kit Tracker */}
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

            {/* Status Cards */}
            {isPendingReview && (
              <Card className="bg-gold/5 border-gold/20 rounded-2xl overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-gold/20 rounded-xl">
                      <Clock className="w-5 h-5 text-gold" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-playfair font-semibold text-foreground">Provider Review in Progress</h3>
                      <p className="text-sm text-muted-foreground font-inter mt-1">
                        A provider is reviewing your results and designing your personalized treatment plan.
                      </p>
                      <div className="bg-gold/10 rounded-xl p-3 mt-3">
                        <p className="text-sm font-inter font-medium text-foreground">⏱️ Estimated: 24-48 hours</p>
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
              <Card className="bg-primary/5 border-primary/20 rounded-2xl overflow-hidden">
                <CardContent className="p-5 text-center space-y-4">
                  <h3 className="font-playfair text-lg text-foreground">
                    Ready to optimize your protocol?
                  </h3>
                  <p className="text-sm text-muted-foreground font-inter">
                    Request a review to discuss your results and get your personalized treatment plan.
                  </p>
                  <Button
                    onClick={handleRequestReview}
                    disabled={isCreatingOrder}
                    size="lg"
                    className="bg-primary hover:bg-primary-dark"
                  >
                    {isCreatingOrder ? "Submitting..." : "Request Protocol Review"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Membership Card */}
            {canPurchaseMembership && !isAuthorized && (
              <Card className="bg-gradient-to-br from-gold/10 to-gold/5 border-gold/30 rounded-2xl overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-gold/20 rounded-xl">
                      <CreditCard className="w-5 h-5 text-gold" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-playfair font-semibold text-foreground">Your Protocol is Approved!</h3>
                      <p className="text-sm text-muted-foreground font-inter mt-1">
                        Your treatment plan is ready. Activate your membership to begin.
                      </p>
                      <Button 
                        onClick={handlePurchaseMembership} 
                        className="mt-4 bg-gold hover:bg-gold-dark text-primary-foreground"
                      >
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
              <Card className="bg-muted/50 border-border/30 rounded-2xl overflow-hidden opacity-60">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-muted rounded-xl">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-inter font-semibold text-muted-foreground">Membership Locked</h3>
                      <p className="text-sm text-muted-foreground font-inter mt-1">
                        Available after your diagnostic results are reviewed.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="pt-2">
              {patient?.intake_completed ? (
                <Button
                  onClick={() => navigate("/patient/checkin")}
                  variant="outline"
                  className="w-full rounded-xl h-12 border-border/50 font-inter"
                  size="lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Log Monthly Symptoms
                </Button>
              ) : (
                <Button
                  onClick={() => navigate("/patient/intake")}
                  variant="outline"
                  className="w-full rounded-xl h-12 border-border/50 font-inter"
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

      {/* Bottom Tab Bar (Mobile Only) */}
      <BottomTabBar />

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

      {/* Secure Chat Widget */}
      {patient && (patient.intake_completed || isKetaminePatient) && (
        <PatientChatWidget patientId={patient.id} />
      )}
    </div>
  );
};

export default PatientDashboard;
