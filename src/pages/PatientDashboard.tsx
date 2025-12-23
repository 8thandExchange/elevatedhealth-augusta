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
// import NeurotransmitterCard from "@/components/patient/NeurotransmitterCard"; // TEMPORARILY HIDDEN
import SafetyGate from "@/components/patient/SafetyGate";
import MinimalPatientHeader from "@/components/patient/MinimalPatientHeader";
import BottomTabBar from "@/components/patient/BottomTabBar";
import DailyProtocolCard from "@/components/patient/DailyProtocolCard";
import HealthOverview from "@/components/patient/HealthOverview";
import ActionPlanTab from "@/components/patient/ActionPlanTab";
import AnimatedCard from "@/components/patient/AnimatedCard";
import MembershipSummary from "@/components/patient/MembershipSummary";
import OAuthOnboarding from "@/components/patient/OAuthOnboarding";
import { 
  usePatient, 
  useLatestSymptomLog, 
  useLatestOrder, 
  useKitTracking, 
  useLatestLabResult,
  // useNeurotransmitterPayment, // TEMPORARILY HIDDEN
  // useMetabolicPayment, // TEMPORARILY HIDDEN
  useCreateOrder,
  useInvalidatePatientData,
  Patient,
  SymptomLog,
  Order,
  KitTracking as KitTrackingType,
  // NeurotransmitterPayment, // TEMPORARILY HIDDEN
  // MetabolicPayment, // TEMPORARILY HIDDEN
  LabResult
} from "@/hooks/usePatient";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Use React Query hooks for data fetching
  const { data: patient, isLoading: isPatientLoading, error: patientError } = usePatient();
  const { data: latestLog } = useLatestSymptomLog(patient?.id);
  const { data: latestOrder } = useLatestOrder(patient?.id);
  const { data: kitTracking } = useKitTracking(patient?.id);
  const { data: labResult } = useLatestLabResult(patient?.id);
  // TEMPORARILY HIDDEN - Only offering Hormone Mapping Kit for now
  // const { data: neuroPayment } = useNeurotransmitterPayment(
  //   patient?.primary_program === "ketamine" ? patient?.id : undefined
  // );
  // const { data: metabolicPayment } = useMetabolicPayment(
  //   (patient?.primary_program === 'weight_loss' || patient?.treatment_request?.includes('weight')) 
  //     ? patient?.id 
  //     : undefined
  // );
  
  const createOrderMutation = useCreateOrder();
  const { invalidateAll } = useInvalidatePatientData();

  // TEMPORARILY HIDDEN - Payment verification for kits we're not currently offering
  // useEffect(() => {
  //   const sessionId = searchParams.get("session_id");
  //   if (searchParams.get("neurotransmitter") === "success" && sessionId) {
  //     verifyNeurotransmitterPayment(sessionId);
  //   }
  //   if (searchParams.get("metabolic") === "success" && sessionId) {
  //     verifyMetabolicPayment(sessionId);
  //   }
  // }, [searchParams]);

  // TEMPORARILY HIDDEN - Verification functions for kits we're not currently offering
  // const verifyNeurotransmitterPayment = async (sessionId: string) => { ... };
  // const verifyMetabolicPayment = async (sessionId: string) => { ... };

  const handleRequestReview = async () => {
    if (!patient || !latestLog) return;
    createOrderMutation.mutate({ patientId: patient.id, symptomLog: latestLog });
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

  // Loading state
  if (isPatientLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  // Error state
  if (patientError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Unable to load dashboard</h2>
            <p className="text-muted-foreground text-sm mb-4">
              {patientError instanceof Error ? patientError.message : "Please try again later."}
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No patient found
  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Profile not found</h2>
            <p className="text-muted-foreground text-sm mb-4">
              We couldn't find your patient profile. Please contact support.
            </p>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show OAuth onboarding for Google users who haven't selected a program
  if (patient.onboarding_status === 'needs_program_selection') {
    return (
      <OAuthOnboarding
        patientId={patient.id}
        patientName={patient.full_name}
        patientEmail={patient.email || ""}
        onComplete={() => invalidateAll(patient.id)}
      />
    );
  }

  if (!patient.intake_completed && patient.primary_program !== "ketamine") {
    return <WelcomeIntake patientName={patient.full_name} />;
  }

  const isFlaggedPatient = patient.risk_status === "high_risk_review" || 
    (Array.isArray(patient.safety_flags) && patient.safety_flags.length > 0);
  
  if (isFlaggedPatient) {
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

  const isKetaminePatient = patient.primary_program === "ketamine";
  const isAuthorized = latestOrder?.status === "authorized";
  const isPendingReview = latestOrder?.status === "pending_review";
  
  const canPurchaseMembership = patient.onboarding_status === "protocol_approved" || 
                                 patient.onboarding_status === "labs_reviewed" ||
                                 patient.onboarding_status === "pending_pharmacy_order" ||
                                 patient.onboarding_status === "treatment_active";

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
        patientName={patient.full_name}
        avatarUrl={patient.avatar_url}
        onEditProfile={() => setIsEditProfileOpen(true)}
      />

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-2xl">
        {/* KETAMINE PATIENT DASHBOARD */}
        {isKetaminePatient ? (
          <>
            <AnimatedCard delay={0} animation="fadeUp">
              <DailyProtocolCard 
                patientName={patient.full_name}
                hasInjections={false}
                hasSupplements={false}
              />
            </AnimatedCard>

            <AnimatedCard delay={100} animation="fadeUp">
              <MindCareCard />
            </AnimatedCard>

            {/* TEMPORARILY HIDDEN - Only offering Hormone Mapping Kit for now */}
            {/* <AnimatedCard delay={200} animation="fadeUp">
              <NeurotransmitterCard 
                patientEmail={patient.email || undefined}
                patientName={patient.full_name}
                patientId={patient.id}
                existingPayment={neuroPayment}
              />
            </AnimatedCard> */}

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
                  onboardingStatus={patient.onboarding_status || null}
                  kitStatus={kitTracking?.zrt_kit_status}
                  hasAuthorizedOrder={isAuthorized}
                  onBookConsultation={() => navigate("/schedule-consult")}
                  onPayForLabs={() => {
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
                  patientName={patient.full_name}
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
                    patientId={patient.id}
                    patientEmail={patient.email || ''}
                    patientName={patient.full_name}
                    labData={labResult}
                    gender={patient.gender || undefined}
                    hasToxicityPayment={false}
                    hasElevatedArchitecturePayment={false}
                  />

                  {/* Onboarding Progress with Kit Tracking Integration */}
                  {!isAuthorized && (
                    <OnboardingProgress
                      onboardingStatus={patient.onboarding_status || null}
                      intakeCompleted={patient.intake_completed || false}
                      hasAuthorizedOrder={isAuthorized}
                      kitStatus={kitTracking?.zrt_kit_status}
                      trackingNumber={kitTracking?.tracking_number}
                    />
                  )}

                  {/* Membership Summary */}
                  <MembershipSummary 
                    membershipTier={patient.membership_tier as "vitality" | "concierge" | null}
                    renewalDate={patient.membership_renewal_date ? new Date(patient.membership_renewal_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : undefined}
                  />
                </TabsContent>

                <TabsContent value="action-plan" className="mt-4">
                  <ActionPlanTab 
                    labData={labResult} 
                    gender={patient.gender || undefined} 
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
                  protocolName={latestOrder.protocol_snapshot.protocol_name || patient.current_protocol || "Your Treatment Plan"}
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
                      disabled={createOrderMutation.isPending}
                      size="lg"
                      className="bg-primary hover:bg-primary-dark"
                    >
                      {createOrderMutation.isPending ? "Submitting..." : "Request Protocol Review"}
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
            {!canPurchaseMembership && patient.intake_completed && !isAuthorized && (
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
                {patient.intake_completed ? (
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
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        patientId={patient.id}
        currentName={patient.full_name}
        currentAvatarUrl={patient.avatar_url}
        onUpdate={(newName, newAvatarUrl) => invalidateAll(patient.id)}
      />

      {/* Secure Chat Widget */}
      {(patient.intake_completed || isKetaminePatient) && (
        <PatientChatWidget patientId={patient.id} />
      )}
    </div>
  );
};

export default PatientDashboard;
