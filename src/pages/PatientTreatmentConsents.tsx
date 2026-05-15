import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Tier2TreatmentBundle } from "@/components/consents/Tier2TreatmentBundle";
import PatientNavbar from "@/components/patient/PatientNavbar";
import { usePatient } from "@/hooks/usePatient";
import type { ConsentType } from "@/data/consents/types";
import { TIER_2_CONSENTS } from "@/data/consents";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const TIER_2_SET = new Set<string>(TIER_2_CONSENTS);

function parseConsentTypesParam(raw: string | null): ConsentType[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is ConsentType => TIER_2_SET.has(s));
}

export default function PatientTreatmentConsents() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: patient, isLoading } = usePatient();

  const types = useMemo(
    () => parseConsentTypesParam(searchParams.get("types")),
    [searchParams],
  );

  if (isLoading) {
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

  if (types.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <PatientNavbar patientName={patient.full_name} avatarUrl={patient.avatar_url} />
        <main className="container mx-auto max-w-lg px-4 py-12">
          <Alert>
            <AlertDescription>
              This treatment consent link is missing required details. Please use the link from your text or
              email, or call the clinic for help.
            </AlertDescription>
          </Alert>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/patient/dashboard">Back to dashboard</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PatientNavbar patientName={patient.full_name} avatarUrl={patient.avatar_url} />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1 className="font-playfair text-3xl font-light text-foreground">Treatment consent required</h1>
          <p className="mt-2 text-muted-foreground">
            Your clinician needs the signature(s) below before sending certain prescriptions. This usually
            takes a few minutes.
          </p>
        </div>
        <Tier2TreatmentBundle
          patientId={patient.id}
          patientName={patient.full_name}
          consentTypes={types}
          variant="patient_remote"
          onComplete={() => navigate("/patient/dashboard", { replace: true })}
        />
      </main>
    </div>
  );
}
