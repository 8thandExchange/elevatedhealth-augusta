import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Activity, Zap, Heart, Brain, Plus, Clock, CreditCard, Lock, FileText, Sparkles, ArrowRight, BookOpen, LayoutGrid, ClipboardList } from "lucide-react";
import MyRegimenCard from "@/components/patient/MyRegimenCard";
import WelcomeIntake from "@/components/patient/WelcomeIntake";
import OnboardingProgress from "@/components/patient/OnboardingProgress";
import NextActionCard from "@/components/patient/NextActionCard";
import EditProfileModal from "@/components/patient/EditProfileModal";
import PatientChatWidget from "@/components/chat/PatientChatWidget";
import KitTracker from "@/components/patient/KitTracker";
import MindCareCard from "@/components/patient/MindCareCard";
import NeurotransmitterCard from "@/components/patient/NeurotransmitterCard";
// MetabolicArchitectureCard removed - $599 kit discontinued
import SafetyGate from "@/components/patient/SafetyGate";
import MinimalPatientHeader from "@/components/patient/MinimalPatientHeader";
import BottomTabBar from "@/components/patient/BottomTabBar";
import DailyProtocolCard from "@/components/patient/DailyProtocolCard";
import HealthOverview from "@/components/patient/HealthOverview";
import ActionPlanTab from "@/components/patient/ActionPlanTab";
import AnimatedCard from "@/components/patient/AnimatedCard";
import MembershipSummary from "@/components/patient/MembershipSummary";

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
  membership_tier?: string | null;
  membership_renewal_date?: string | null;
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

interface LabResult {
  vitamin_d?: number | null;
  magnesium?: number | null;
  cortisol_morning?: number | null;
  cortisol_night?: number | null;
  fasting_insulin?: number | null;
  a1c?: number | null;
  tsh?: number | null;
  mercury?: number | null;
  lead_level?: number | null;
  serotonin?: number | null;
  gaba?: number | null;
  triglycerides?: number | null;
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
  const [labResult, setLabResult] = useState<LabResult | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
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

        // Fetch latest lab results for Action Plan
        const { data: labData } = await supabase
          .from('lab_results')
          .select('vitamin_d, magnesium, cortisol_morning, cortisol_night, fasting_insulin, a1c, tsh, mercury, lead_level, serotonin, gaba, triglycerides')
          .eq('patient_id', patientData.id)
          .order('collection_date', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        setLabResult(labData);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load dashboard";
      toast.error(message);
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
            <AnimatedCard delay={0} animation="fadeUp">
              <DailyProtocolCard 
                patientName={patient?.full_name}
                hasInjections={false}
                hasSupplements={false}
              />
            </AnimatedCard>

            <AnimatedCard delay={100} animation="fadeUp">
              <MindCareCard />
            </AnimatedCard>

            <AnimatedCard delay={200} animation="fadeUp">
              <NeurotransmitterCard 
                patientEmail={patient?.email || undefined}
                patientName={patient?.full_name}
                patientId={patient?.id}
                existingPayment={neuroPayment}
              />
            </AnimatedCard>

            <AnimatedCard delay={300} animation="scaleIn">
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
            </AnimatedCard>
          </>
        ) : (
          /* HORMONE PATIENT DASHBOARD */
          <>
            {/* Next Action Card - Prominently shows what patient needs to do */}
            {!isAuthorized && (
              <AnimatedCard delay={0} animation="fadeUp">
                <NextActionCard
                  onboardingStatus={patient?.onboarding_status || null}
                  kitStatus={kitTracking?.zrt_kit_status}
                  hasAuthorizedOrder={isAuthorized}
                  onBookConsultation={() => navigate("/schedule-consult")}
                  onPayForLabs={() => {
                    // This would typically be handled by provider sending kit link
                    toast.info("Check your email for a payment link from your provider.");
                  }}
                  onActivateMembership={handlePurchaseMembership}
                />
              </AnimatedCard>
            )}

            {/* Daily Protocol Hero Card - Only for active treatment */}
            {isAuthorized && (
              <AnimatedCard delay={100} animation="fadeUp">
                <DailyProtocolCard 
                  patientName={patient?.full_name}
                  hasInjections={true}
                  hasSupplements={true}
                />
              </AnimatedCard>
            )}

            {/* Tabbed Interface */}
            <AnimatedCard delay={100} animation="fadeUp">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full h-12 bg-card border border-border/50 rounded-xl p-1 grid grid-cols-2">
                  <TabsTrigger 
                    value="overview" 
                    className="rounded-lg font-inter text-sm data-[state=active]:bg-navy data-[state=active]:text-white"
                  >
                    <LayoutGrid className="w-4 h-4 mr-2" />
                    Health Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="action-plan" 
                    className="rounded-lg font-inter text-sm data-[state=active]:bg-navy data-[state=active]:text-white"
                  >
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Action Plan
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4 space-y-4">
                  {/* Health Overview - Biological Scorecard */}
                  <HealthOverview
                    patientId={patient?.id || ''}
                    patientEmail={patient?.email || ''}
                    patientName={patient?.full_name || ''}
                    labData={labResult}
                    gender={patient?.gender || undefined}
                    hasToxicityPayment={false}
                    hasElevatedArchitecturePayment={false}
                  />

                  {/* Onboarding Progress with Kit Tracking Integration */}
                  {!isAuthorized && (
                    <OnboardingProgress
                      onboardingStatus={patient?.onboarding_status || null}
                      intakeCompleted={patient?.intake_completed || false}
                      hasAuthorizedOrder={isAuthorized}
                      kitStatus={kitTracking?.zrt_kit_status}
                      trackingNumber={kitTracking?.tracking_number}
                    />
                  )}

                  {/* Membership Summary */}
                  <MembershipSummary 
                    membershipTier={patient?.membership_tier as "vitality" | "concierge" | null}
                    renewalDate={patient?.membership_renewal_date ? new Date(patient.membership_renewal_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : undefined}
                  />
                </TabsContent>

                <TabsContent value="action-plan" className="mt-4">
                  <ActionPlanTab 
                    labData={labResult} 
                    gender={patient?.gender || undefined} 
                  />
                </TabsContent>
              </Tabs>
            </AnimatedCard>

            {/* Kit Tracker */}
            {kitTracking && kitTracking.zrt_kit_status !== "not_ordered" && (
              <AnimatedCard delay={200} animation="slideInLeft">
                <KitTracker
                  status={kitTracking.zrt_kit_status}
                  trackingNumber={kitTracking.tracking_number}
                  shippedAt={kitTracking.shipped_at}
                  sampleReceivedAt={kitTracking.sample_received_at}
                  resultsReadyAt={kitTracking.results_ready_at}
                  onBookCall={() => navigate("/schedule-consult")}
                />
              </AnimatedCard>
            )}

            {/* Status Cards */}
            {isPendingReview && (
              <AnimatedCard delay={250} animation="scaleIn">
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
              </AnimatedCard>
            )}

            {/* My Regimen Card */}
            {isAuthorized && latestOrder?.protocol_snapshot && (
              <AnimatedCard delay={300} animation="fadeUp">
                <MyRegimenCard
                  protocolName={latestOrder.protocol_snapshot.protocol_name || patient?.current_protocol || "Your Treatment Plan"}
                  items={getRegimenItems()}
                />
              </AnimatedCard>
            )}

            {/* Request Review Button */}
            {latestLog && !isPendingReview && !isAuthorized && (
              <AnimatedCard delay={300} animation="scaleIn">
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
              </AnimatedCard>
            )}

            {/* Membership Card */}
            {canPurchaseMembership && !isAuthorized && (
              <AnimatedCard delay={350} animation="fadeUp">
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
              </AnimatedCard>
            )}

            {/* Locked Membership Card */}
            {!canPurchaseMembership && patient?.intake_completed && !isAuthorized && (
              <AnimatedCard delay={400} animation="fadeIn">
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
              </AnimatedCard>
            )}

            {/* Quick Actions */}
            <AnimatedCard delay={450} animation="fadeUp">
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
            </AnimatedCard>
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
