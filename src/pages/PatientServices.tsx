import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, Scale, Sparkles, Droplets, Syringe, Check, ArrowRight, Scissors, Heart, Calendar } from "lucide-react";
import PatientNavbar from "@/components/patient/PatientNavbar";
import EditProfileModal from "@/components/patient/EditProfileModal";
import WelcomeIntake from "@/components/patient/WelcomeIntake";
import SafetyGate from "@/components/patient/SafetyGate";
import OAuthOnboarding from "@/components/patient/OAuthOnboarding";
import { usePatient, useInvalidatePatientData } from "@/hooks/usePatient";
import { EverythingIncludedPillars } from "@/components/marketing/EverythingIncludedPillars";
import { hasCompletedTier1Intake } from "@/lib/consents/intake-status";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Service {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  treatmentKey: string;
  publicPage: string;
  color: string;
  journeyPage: string;
  actionLabel: string;
}

// ACTIVE SERVICES - Core offerings shown to patients
const SERVICES: Service[] = [
  {
    id: "hormone",
    name: "Hormone Optimization",
    description: "Bio-identical hormone therapy for women experiencing menopause, perimenopause, or hormonal imbalance.",
    icon: <Sparkles className="w-6 h-6" />,
    treatmentKey: "hormone",
    publicPage: "/hormones",
    color: "pink",
    journeyPage: "/patient/hormone-journey",
    actionLabel: "View Treatment Plan",
  },
  {
    id: "weight_loss",
    name: "Medical Weight Loss",
    description: "GLP-1 therapy with metabolic optimization for sustainable weight management.",
    icon: <Scale className="w-6 h-6" />,
    treatmentKey: "weight_loss",
    publicPage: "/weightloss",
    color: "green",
    journeyPage: "/patient/hormone-journey",
    actionLabel: "Track Progress",
  },
  // Ketamine therapy sunsetted — service no longer offered.
  // SUNSETTED SERVICES - Hidden but code preserved for future reactivation
  // {
  //   id: "peptides",
  //   name: "Peptide Therapy",
  //   description: "Growth hormone support, NAD+ for brain restoration, and intimacy enhancement.",
  //   icon: <Syringe className="w-6 h-6" />,
  //   treatmentKey: "peptides",
  //   publicPage: "/peptides",
  //   color: "blue",
  //   journeyPage: "/patient/hormone-journey",
  //   actionLabel: "View Protocol",
  // },
  // {
  //   id: "iv_lounge",
  //   name: "IV Hydration Lounge",
  //   description: "Vitamin infusions for wellness, immunity, recovery, and beauty.",
  //   icon: <Droplets className="w-6 h-6" />,
  //   treatmentKey: "iv_lounge",
  //   publicPage: "/iv-lounge",
  //   color: "teal",
  //   journeyPage: "/iv-lounge",
  //   actionLabel: "Book Session",
  // },
  // {
  //   id: "hair_restoration",
  //   name: "Hair Restoration",
  //   description: "FDA-approved medications and peptide therapy for hair loss and regrowth.",
  //   icon: <Scissors className="w-6 h-6" />,
  //   treatmentKey: "hair_restoration",
  //   publicPage: "/hair-restoration",
  //   color: "amber",
  //   journeyPage: "/patient/hormone-journey",
  //   actionLabel: "View Protocol",
  // },
  // {
  //   id: "sexual_wellness",
  //   name: "Sexual Wellness",
  //   description: "Discreet ED treatments and intimacy enhancement. Private consultations.",
  //   icon: <Heart className="w-6 h-6" />,
  //   treatmentKey: "sexual_wellness",
  //   publicPage: "/sexual-wellness",
  //   color: "rose",
  //   journeyPage: "/patient/hormone-journey",
  //   actionLabel: "View Treatment",
  // },
];

const PatientServices = () => {
  const navigate = useNavigate();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  
  // Use React Query hook for patient data
  const { data: patient, isLoading, error } = usePatient();
  const { invalidateAll, invalidatePatient } = useInvalidatePatientData();
  const [tier1IntakeComplete, setTier1IntakeComplete] = useState<boolean | null>(null);

  useEffect(() => {
    if (!patient?.id) return;
    hasCompletedTier1Intake(patient.id).then(setTier1IntakeComplete).catch(() => setTier1IntakeComplete(null));
  }, [patient?.id]);

  // Parse current interests from patient data
  const currentInterests = patient?.treatment_request?.split(",").filter(Boolean) || [];

  const hasService = (treatmentKey: string) => currentInterests.includes(treatmentKey);

  const openServiceJourney = (journeyPage: string) => {
    if (tier1IntakeComplete === false) {
      navigate("/intake/consents");
      return;
    }
    navigate(journeyPage);
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      pink: "from-pink-50 to-pink-100/50 border-pink-200 dark:from-pink-950/30 dark:to-pink-900/20 dark:border-pink-800",
      green: "from-green-50 to-green-100/50 border-green-200 dark:from-green-950/30 dark:to-green-900/20 dark:border-green-800",
      purple: "from-purple-50 to-purple-100/50 border-purple-200 dark:from-purple-950/30 dark:to-purple-900/20 dark:border-purple-800",
      blue: "from-blue-50 to-blue-100/50 border-blue-200 dark:from-blue-950/30 dark:to-blue-900/20 dark:border-blue-800",
      teal: "from-teal-50 to-teal-100/50 border-teal-200 dark:from-teal-950/30 dark:to-teal-900/20 dark:border-teal-800",
      amber: "from-amber-50 to-amber-100/50 border-amber-200 dark:from-amber-950/30 dark:to-amber-900/20 dark:border-amber-800",
      rose: "from-rose-50 to-rose-100/50 border-rose-200 dark:from-rose-950/30 dark:to-rose-900/20 dark:border-rose-800",
    };
    return colors[color] || colors.blue;
  };

  const getIconColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      pink: "bg-pink-500/20 text-pink-600",
      green: "bg-green-500/20 text-green-600",
      purple: "bg-purple-500/20 text-purple-600",
      blue: "bg-blue-500/20 text-blue-600",
      teal: "bg-teal-500/20 text-teal-600",
      amber: "bg-amber-500/20 text-amber-600",
      rose: "bg-rose-500/20 text-rose-600",
    };
    return colors[color] || colors.blue;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Unable to load services</h2>
            <p className="text-muted-foreground text-sm mb-4">
              {error instanceof Error ? error.message : "Please try again later."}
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No patient found - redirect to login
  if (!patient) {
    navigate("/patient/login");
    return null;
  }

  // Show OAuth onboarding for new Google users who haven't selected a program
  if (patient.onboarding_status === 'needs_program_selection') {
    return (
      <OAuthOnboarding
        patientId={patient.id}
        patientName={patient.full_name}
        patientEmail={patient.email || ""}
        onComplete={() => invalidatePatient()}
      />
    );
  }

  if (!patient.intake_completed) {
    return <WelcomeIntake patientName={patient.full_name} />;
  }

  // HARD GATE: Block flagged patients
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

  // Get active services for display
  const activeServices = SERVICES.filter(s => hasService(s.treatmentKey));

  return (
    <div className="min-h-screen bg-background">
      <PatientNavbar 
        patientName={patient.full_name}
        avatarUrl={patient.avatar_url}
        onEditProfile={() => setIsEditProfileOpen(true)}
      />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {tier1IntakeComplete === false && (
          <Alert className="mb-6 border-accent/40 bg-accent/5">
            <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Please complete your required clinic consents before starting clinical services.
              </span>
              <Button asChild variant="default" size="sm" className="shrink-0">
                <Link to="/intake/consents">Complete consents</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-8">
          <EverythingIncludedPillars intro="When you are on an ELEVATED program, your care team bundles clinical access the same way we describe on our public site — ask us any time how your plan maps to these pillars." />
        </div>

        {/* Welcome Header */}
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Welcome back</p>
          <h1 className="font-cormorant text-3xl text-foreground mb-2">{patient.full_name}</h1>
          <p className="text-muted-foreground">
            Your personalized health journey
          </p>
        </div>

        {/* Active Services - Prominent Cards */}
        {activeServices.length > 0 ? (
          <div className="mb-10">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              Your Treatment Plan
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {activeServices.map((service) => (
                <Card 
                  key={service.id}
                  className={`bg-gradient-to-br ${getColorClasses(service.color)} transition-all hover:shadow-lg cursor-pointer group`}
                  onClick={() => openServiceJourney(service.journeyPage)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-full ${getIconColorClasses(service.color)}`}>
                        {service.icon}
                      </div>
                      <Badge variant="secondary" className="gap-1 bg-green-500/20 text-green-700 border-green-300">
                        <Check className="w-3 h-3" />
                        Active
                      </Badge>
                    </div>
                    <CardTitle className="font-cormorant text-xl">{service.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                    
                    <Button 
                      className="w-full group-hover:bg-foreground group-hover:text-background transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        openServiceJourney(service.journeyPage);
                      }}
                    >
                      {service.actionLabel}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* No Active Services - Consultation CTA */
          <Card className="mb-10 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-cormorant text-2xl mb-2">Start Your Health Journey</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Schedule a consultation with our providers to create your personalized treatment plan. 
                We'll discuss your health goals and recommend the best options for you.
              </p>
              <Button size="lg" onClick={() => navigate("/consult")}>
                Book Your Consultation
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Help Card */}
        <Card className="bg-card border-border/50">
          <CardContent className="pt-6 text-center">
            <h3 className="font-semibold mb-2">Questions about your treatment?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Our care team is here to help you every step of the way.
            </p>
            <Button variant="outline" onClick={() => navigate("/consult")}>
              Contact Us
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Edit Profile Modal */}
      {patient && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          patientId={patient.id}
          currentName={patient.full_name}
          currentAvatarUrl={patient.avatar_url}
          onUpdate={() => invalidatePatient()}
        />
      )}
    </div>
  );
};

export default PatientServices;
