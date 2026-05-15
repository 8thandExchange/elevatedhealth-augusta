import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tier1IntakeBundle } from "@/components/consents/Tier1IntakeBundle";
import PatientNavbar from "@/components/patient/PatientNavbar";
import { usePatient, useInvalidatePatientData } from "@/hooks/usePatient";
import { hasCompletedTier1Intake, markTier1IntakeComplete } from "@/lib/consents/intake-status";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PatientIntakeConsents() {
  const navigate = useNavigate();
  const { data: patient, isLoading } = usePatient();
  const { invalidatePatient } = useInvalidatePatientData();
  const [checking, setChecking] = useState(true);
  const [alreadyComplete, setAlreadyComplete] = useState(false);

  useEffect(() => {
    async function check() {
      if (!patient?.id) return;
      try {
        const done = await hasCompletedTier1Intake(patient.id);
        setAlreadyComplete(done);
      } finally {
        setChecking(false);
      }
    }
    if (patient?.id) check();
    else if (!isLoading) setChecking(false);
  }, [patient?.id, isLoading]);

  useEffect(() => {
    if (!checking && alreadyComplete) {
      navigate("/patient/dashboard", { replace: true, state: { consentsComplete: true } });
    }
  }, [checking, alreadyComplete, navigate]);

  const handleComplete = async (sessionId: string) => {
    if (!patient) return;
    try {
      await markTier1IntakeComplete(patient.id);
      invalidatePatient();
      toast.success("All required consents are on file. Thank you.");
      navigate("/patient/dashboard", {
        state: { consentsComplete: true, sessionId },
      });
    } catch {
      toast.error("Consents signed, but we could not update your profile. Please contact the office.");
      navigate("/patient/dashboard");
    }
  };

  if (isLoading || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!patient) {
    navigate("/patient/login");
    return null;
  }

  if (!patient.dob) {
    return (
      <div className="min-h-screen bg-background">
        <PatientNavbar patientName={patient.full_name} avatarUrl={patient.avatar_url} />
        <main className="container mx-auto max-w-lg px-4 py-12">
          <Alert>
            <AlertDescription>
              We need your date of birth on file before you can sign consents. Please update your
              profile or contact the office.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  if (alreadyComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PatientNavbar patientName={patient.full_name} avatarUrl={patient.avatar_url} />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1 className="font-playfair text-3xl font-light text-foreground">Required consents</h1>
          <p className="mt-2 text-muted-foreground">
            Please review and sign each document below. All five are required before we can provide
            clinical services.
          </p>
        </div>
        <Tier1IntakeBundle
          patientId={patient.id}
          patientName={patient.full_name}
          patientDateOfBirth={patient.dob}
          mode="authenticated"
          onAllConsentsComplete={() => handleComplete("")}
        />
      </main>
    </div>
  );
}
