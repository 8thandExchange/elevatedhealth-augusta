import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import PatientNavbar from "@/components/patient/PatientNavbar";
import EditProfileModal from "@/components/patient/EditProfileModal";
import SafetyGate from "@/components/patient/SafetyGate";
import OAuthOnboarding from "@/components/patient/OAuthOnboarding";
import PatientDashboardHome from "@/components/patient/PatientDashboardHome";
import { usePatient, useInvalidatePatientData } from "@/hooks/usePatient";
import { useAuth } from "@/contexts/AuthContext";
import { linkPatientAccount } from "@/lib/patientAccountLink";
import { hasCompletedTier1Intake } from "@/lib/consents/intake-status";
import { supabase } from "@/integrations/supabase/client";

const PatientServices = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn } = useAuth();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [linkAttempted, setLinkAttempted] = useState(false);
  const [linking, setLinking] = useState(false);

  const { data: patient, isLoading, error } = usePatient();
  const { invalidatePatient } = useInvalidatePatientData();
  const [tier1IntakeComplete, setTier1IntakeComplete] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoggedIn || !user?.email || patient || isLoading || linkAttempted) return;
    setLinkAttempted(true);
    setLinking(true);
    linkPatientAccount({ email: user.email })
      .then((linked) => {
        if (linked) return invalidatePatient();
      })
      .catch((err) => console.warn("[PatientServices] auto-link failed", err))
      .finally(() => setLinking(false));
  }, [isLoggedIn, user?.email, patient, isLoading, linkAttempted, invalidatePatient]);

  useEffect(() => {
    if (!patient?.id) return;
    hasCompletedTier1Intake(patient.id).then(setTier1IntakeComplete).catch(() => setTier1IntakeComplete(null));
  }, [patient?.id]);

  useEffect(() => {
    if (!patient?.id || tier1IntakeComplete !== false) return;
    if (location.pathname.startsWith("/intake/")) return;
    navigate("/intake/consents", { replace: true });
  }, [patient?.id, tier1IntakeComplete, location.pathname, navigate]);

  useEffect(() => {
    if (!patient?.id) return;
    void supabase.rpc("sync_my_consult_payment_status").then(({ data, error }) => {
      if (error) {
        console.warn("[PatientServices] consult payment sync skipped", error.message);
        return;
      }
      if (data && typeof data === "object" && "updated" in data && data.updated) {
        void invalidatePatient();
      }
    });
  }, [patient?.id, invalidatePatient]);

  if (isLoading || linking || (!patient && !linkAttempted)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Unable to load your portal</h2>
            <p className="text-muted-foreground text-sm mb-4">
              {error instanceof Error ? error.message : "Please try again later."}
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!patient && linkAttempted) {
    const createUrl = user?.email
      ? `/patient/create-account?email=${encodeURIComponent(user.email)}`
      : "/patient/create-account";
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="font-playfair italic text-xl">Finish setting up your portal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You&apos;re signed in, but we couldn&apos;t find a patient profile linked to your account.
              If you recently paid or completed intake, finish account setup to connect your records.
            </p>
            <Button className="w-full" onClick={() => navigate(createUrl)}>
              Complete account setup
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => navigate("/consult")}>
              Book a consultation
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  if (patient.onboarding_status === "needs_program_selection") {
    return (
      <OAuthOnboarding
        patientId={patient.id}
        patientName={patient.full_name}
        patientEmail={patient.email || ""}
        onComplete={() => invalidatePatient()}
      />
    );
  }

  const isFlaggedPatient =
    patient.risk_status === "high_risk_review" ||
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

  return (
    <div className="min-h-screen bg-background">
      <PatientNavbar
        patientName={patient.full_name}
        avatarUrl={patient.avatar_url}
        onEditProfile={() => setIsEditProfileOpen(true)}
      />

      <PatientDashboardHome patient={patient} tier1IntakeComplete={tier1IntakeComplete} />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        patientId={patient.id}
        currentName={patient.full_name}
        currentAvatarUrl={patient.avatar_url}
        onUpdate={() => invalidatePatient()}
      />
    </div>
  );
};

export default PatientServices;
