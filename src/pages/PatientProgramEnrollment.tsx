import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, CreditCard, AlertTriangle, CheckCircle2 } from "lucide-react";
import PatientNavbar from "@/components/patient/PatientNavbar";
import { Tier2TreatmentBundle } from "@/components/consents/Tier2TreatmentBundle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePatient } from "@/hooks/usePatient";
import { ELEVATED_PROGRAMS, type ElevatedProgramKey } from "@/lib/stripeConfig";
import { formatCreditCents, type JourneyStage } from "@/config/onboardingCredit";
import {
  fetchPatientJourney,
  fetchRedeemableCredit,
  invokeCompleteProgramEnrollmentConsents,
  journeyAtLeast,
  patientCanEnrollMembership,
  startBaselineLabsCheckout,
  startMembershipCheckoutWithCredit,
  tier2ConsentsForProgram,
} from "@/lib/patientJourney";
import { toast } from "sonner";

function inferProgram(patient: {
  treatment_request?: string | null;
  primary_program?: string | null;
}): ElevatedProgramKey {
  const blob = `${patient.treatment_request || ""} ${patient.primary_program || ""}`.toLowerCase();
  if (/weight|glp|semaglutide|tirzepatide/.test(blob)) return "glp1";
  if (/trt|testosterone|androgen|male/.test(blob)) return "trt";
  if (/hrt|bhrt|estrogen|progesterone|female|women/.test(blob)) return "hrt";
  return "wellness";
}

export default function PatientProgramEnrollment() {
  const navigate = useNavigate();
  const { data: patient, isLoading: patientLoading } = usePatient();
  const [journeyStage, setJourneyStage] = useState<JourneyStage | null>(null);
  const [creditCents, setCreditCents] = useState<number | null>(null);
  const [creditExpires, setCreditExpires] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [labsLoading, setLabsLoading] = useState(false);

  const program = useMemo(
    () => (patient ? inferProgram(patient) : "wellness"),
    [patient],
  );
  const programMeta = ELEVATED_PROGRAMS[program];
  const consentTypes = tier2ConsentsForProgram(patient?.primary_program ?? patient?.treatment_request);

  const load = useCallback(async () => {
    if (!patient?.user_id) return;
    setLoading(true);
    try {
      const [journey, credit] = await Promise.all([
        fetchPatientJourney(patient.user_id),
        fetchRedeemableCredit(patient.user_id),
      ]);
      setJourneyStage(journey?.stage ?? null);
      setCreditCents(credit?.credit_amount_cents ?? null);
      setCreditExpires(credit?.expires_at ?? null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load enrollment status");
    } finally {
      setLoading(false);
    }
  }, [patient?.user_id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (patientLoading || loading) {
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

  const needsBaselineLabs =
    !journeyStage ||
    (!journeyAtLeast(journeyStage, "baseline_labs_ordered") &&
      ["consultation_complete", "intake_complete", "consultation_scheduled"].includes(
        patient.onboarding_status ?? "",
      ));

  const needsConsents =
    journeyStage === "protocol_recommended" ||
    (journeyAtLeast(journeyStage, "results_reviewed") &&
      !patientCanEnrollMembership(journeyStage));

  const canEnroll =
    patientCanEnrollMembership(journeyStage) ||
    (!journeyStage &&
      ["protocol_approved", "labs_reviewed", "pending_pharmacy_order"].includes(
        patient.onboarding_status ?? "",
      ));

  const isNotCandidate = journeyStage === "not_a_candidate";

  const handleBaselineLabs = async (panel: "comprehensive" | "expanded") => {
    if (!patient.email) {
      toast.error("Add an email to your profile before checkout.");
      return;
    }
    setLabsLoading(true);
    try {
      const url = await startBaselineLabsCheckout({
        panel_type: panel,
        patient_email: patient.email,
        patient_name: patient.full_name,
        patient_id: patient.id,
      });
      window.location.href = url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start lab checkout");
    } finally {
      setLabsLoading(false);
    }
  };

  const handleEnroll = async () => {
    setCheckoutLoading(true);
    try {
      const { url } = await startMembershipCheckoutWithCredit(program);
      window.location.href = url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start membership checkout");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PatientNavbar patientName={patient.full_name} avatarUrl={patient.avatar_url} />
      <main className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div>
          <p className="font-jost text-xs uppercase tracking-widest text-muted-foreground mb-1">
            Program enrollment
          </p>
          <h1 className="font-playfair text-3xl text-foreground">Continue your care plan</h1>
          <p className="font-jost text-muted-foreground mt-2">
            Consult → baseline labs → results review → program consents → membership enrollment.
          </p>
        </div>

        {isNotCandidate && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your provider has determined you are not a candidate for this program at this time.
              Please call the clinic at (706) 760-3470 if you have questions.
            </AlertDescription>
          </Alert>
        )}

        {needsBaselineLabs && !isNotCandidate && (
          <Card className="border-[#00477E]/30">
            <CardContent className="pt-6 space-y-4">
              <h2 className="font-playfair text-xl">Step 2 — Baseline labs</h2>
              <p className="font-jost text-sm text-muted-foreground">
                Pay the one-time onboarding lab charge. After payment, that amount can be credited toward
                your first month of membership if you enroll within the credit window.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  disabled={labsLoading}
                  onClick={() => void handleBaselineLabs("comprehensive")}
                  className="bg-[#00477E] hover:bg-[#003660]"
                >
                  {labsLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Comprehensive panel
                </Button>
                <Button
                  variant="outline"
                  disabled={labsLoading}
                  onClick={() => void handleBaselineLabs("expanded")}
                >
                  Expanded panel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {needsConsents && !isNotCandidate && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h2 className="font-playfair text-xl">Step 4 — Program consents</h2>
              <p className="font-jost text-sm text-muted-foreground">
                Your provider has recommended a protocol. Sign the consents below before enrolling — this
                is separate from payment.
              </p>
              <Tier2TreatmentBundle
                patientId={patient.id}
                patientName={patient.full_name}
                consentTypes={consentTypes}
                variant="patient_remote"
                onComplete={async () => {
                  try {
                    await invokeCompleteProgramEnrollmentConsents(consentTypes);
                    toast.success("Consents recorded. You can enroll when ready.");
                    await load();
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Could not finalize consents");
                  }
                }}
              />
            </CardContent>
          </Card>
        )}

        {canEnroll && !isNotCandidate && (
          <Card className="border-green-600/30 bg-green-50/30 dark:bg-green-950/10">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <h2 className="font-playfair text-xl">Step 5 — Enroll in {programMeta.name}</h2>
                  <p className="font-jost text-sm text-muted-foreground">
                    {programMeta.displayPrice}/mo · medication and quarterly labs included where prescribed.
                  </p>
                  {creditCents != null && creditCents > 0 && (
                    <p className="font-jost text-sm text-[#00477E]">
                      Pending onboarding credit: {formatCreditCents(creditCents)} toward month one
                      {creditExpires ? ` (expires ${new Date(creditExpires).toLocaleDateString()})` : ""}.
                    </p>
                  )}
                </div>
              </div>
              <Button
                size="lg"
                className="w-full sm:w-auto bg-[#00477E] hover:bg-[#003660]"
                disabled={checkoutLoading}
                onClick={() => void handleEnroll()}
              >
                {checkoutLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                Enroll — review net first month in Stripe
              </Button>
            </CardContent>
          </Card>
        )}

        <Button variant="ghost" onClick={() => navigate("/patient/dashboard")}>
          Back to dashboard
        </Button>
      </main>
    </div>
  );
}
