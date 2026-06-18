import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tier1IntakeBundle } from "@/components/consents/Tier1IntakeBundle";
import PatientNavbar from "@/components/patient/PatientNavbar";
import { usePatient, useInvalidatePatientData } from "@/hooks/usePatient";
import { hasCompletedTier1Intake, markTier1IntakeComplete } from "@/lib/consents/intake-status";
import { getValidConsents } from "@/lib/consents/consent-helpers";
import { TIER_1_CONSENTS } from "@/data/consents";
import { consentTypeDisplayName } from "@/data/consents/medication-consent-mapping";
import { formatClinicDateTime } from "@/lib/clinicTime";
import { Loader2, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PatientIntakeConsents() {
  const navigate = useNavigate();
  const { data: patient, isLoading } = usePatient();
  const { invalidatePatient } = useInvalidatePatientData();
  const [checking, setChecking] = useState(true);
  const [alreadyComplete, setAlreadyComplete] = useState(false);
  const [signedTypes, setSignedTypes] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function check() {
      if (!patient?.id) return;
      try {
        const [done, valid] = await Promise.all([
          hasCompletedTier1Intake(patient.id),
          getValidConsents(patient.id),
        ]);
        setAlreadyComplete(done);
        setSignedTypes(new Set(TIER_1_CONSENTS.filter((t) => valid[t])));
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

  const completedCount = signedTypes.size;
  const nowEastern = formatClinicDateTime(new Date());

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
          <p className="mt-1 text-xs text-muted-foreground">
            Clinic time (Eastern): {nowEastern} ET
          </p>
        </div>

        {completedCount > 0 && completedCount < TIER_1_CONSENTS.length && (
          <Alert className="mb-6 border-amber-500/40 bg-amber-500/5">
            <AlertDescription>
              You have {completedCount} of {TIER_1_CONSENTS.length} consents on file. Continue below
              to finish the remaining documents.
            </AlertDescription>
          </Alert>
        )}

        <ul className="mb-8 space-y-2 rounded-lg border border-border/60 bg-muted/20 p-4">
          {TIER_1_CONSENTS.map((type) => {
            const done = signedTypes.has(type);
            return (
              <li key={type} className="flex items-center gap-2 text-sm">
                {done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span className={done ? "text-foreground" : "text-muted-foreground"}>
                  {consentTypeDisplayName(type)}
                  {done ? " — signed" : " — needed"}
                </span>
              </li>
            );
          })}
        </ul>

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
