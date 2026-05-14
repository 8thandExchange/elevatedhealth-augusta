import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ChevronRight, Check, ShieldAlert, Phone } from "lucide-react";
import SafetyGate from "./SafetyGate";

interface OAuthOnboardingProps {
  patientId: string;
  patientName: string;
  patientEmail: string;
  onComplete: () => void;
}

type PrimaryProgram = "hormone" | "weight_loss" | "peptide";

const INTEREST_OPTIONS = [
  { id: "hormone", label: "Hormone Replacement Therapy", description: "Bio-identical hormones, menopause, perimenopause, testosterone" },
  { id: "weight_loss", label: "Medical Weight Loss", description: "GLP-1 therapy, metabolic optimization" },
  { id: "peptides", label: "Peptide Therapy", description: "Sermorelin, NAD+, PT-141, cellular optimization" },
];

const HORMONE_HIGH_RISK_CONDITIONS = [
  { id: "breastCancer", label: "Breast Cancer (Personal History)", description: "Have you ever been diagnosed with breast cancer?" },
  { id: "uterineCancer", label: "Uterine/Endometrial Cancer", description: "Have you ever been diagnosed with uterine or endometrial cancer?" },
  { id: "bloodClot", label: "Active Blood Clot (DVT/PE)", description: "Do you currently have or recently had a blood clot?" },
  { id: "pregnantBreastfeeding", label: "Pregnant or Breastfeeding", description: "Are you currently pregnant or breastfeeding?" },
];

const formatPhoneNumber = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
  return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
};

const isValidPhoneNumber = (phone: string): boolean => {
  const numbers = phone.replace(/\D/g, "");
  return numbers.length === 10;
};

const OAuthOnboarding = ({ patientId, patientName, patientEmail, onComplete }: OAuthOnboardingProps) => {
  const [step, setStep] = useState<"info" | "program" | "safety">("info");
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [primaryProgram, setPrimaryProgram] = useState<PrimaryProgram | null>(null);
  const [hormoneSafetyScreening, setHormoneSafetyScreening] = useState({
    breastCancer: false,
    uterineCancer: false,
    bloodClot: false,
    pregnantBreastfeeding: false,
  });
  const [confirmedNoneApply, setConfirmedNoneApply] = useState(false);
  const [showSafetyGate, setShowSafetyGate] = useState(false);

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId) ? prev.filter((id) => id !== interestId) : [...prev, interestId],
    );
  };

  const handleContinueFromProgram = () => {
    if (selectedInterests.length === 0) {
      toast.error("Please select at least one area of interest");
      return;
    }

    let program: PrimaryProgram = "hormone";
    if (selectedInterests.includes("weight_loss")) program = "weight_loss";
    else if (selectedInterests.includes("peptides")) program = "peptide";

    setPrimaryProgram(program);
    setStep("safety");
  };

  const isHighRisk = () => {
    if (primaryProgram !== "hormone") return false;
    return (
      hormoneSafetyScreening.breastCancer ||
      hormoneSafetyScreening.uterineCancer ||
      hormoneSafetyScreening.bloodClot ||
      hormoneSafetyScreening.pregnantBreastfeeding
    );
  };

  const getSafetyFlags = () => {
    if (primaryProgram !== "hormone") return [];
    return Object.entries(hormoneSafetyScreening)
      .filter(([_, value]) => value)
      .map(([key]) => {
        const condition = HORMONE_HIGH_RISK_CONDITIONS.find((c) => c.id === key);
        return condition?.label || key;
      });
  };

  const handleContinueFromInfo = () => {
    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    setStep("program");
  };

  const handleCompleteOnboarding = async () => {
    setIsLoading(true);

    try {
      const highRisk = isHighRisk();
      const safetyFlags = getSafetyFlags();
      const medicalHistory = primaryProgram === "hormone" ? hormoneSafetyScreening : {};

      const cleanPhone = phoneNumber ? phoneNumber.replace(/\D/g, "") : null;

      const { error } = await supabase
        .from("patients")
        .update({
          phone: cleanPhone,
          primary_program: primaryProgram,
          treatment_request: selectedInterests.join(","),
          risk_status: highRisk ? "high_risk_review" : "standard",
          medical_history: medicalHistory as unknown as Record<string, boolean>,
          safety_flags: highRisk ? safetyFlags : [],
          intake_completed: false,
          onboarding_status: highRisk ? "high_risk_review" : "account_created",
        })
        .eq("id", patientId);

      if (error) throw error;

      try {
        await supabase.functions.invoke("send-patient-signup-notification", {
          body: {
            patientName,
            patientEmail,
            patientPhone: cleanPhone,
            primaryProgram,
            isHighRisk: highRisk,
            safetyFlags: highRisk ? safetyFlags : [],
          },
        });
      } catch (notifyError) {
        console.error("Failed to send provider notification:", notifyError);
      }

      if (highRisk) {
        setShowSafetyGate(true);
      } else {
        toast.success("Welcome to Elevated Health Augusta!");
        onComplete();
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to complete setup";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (showSafetyGate) {
    return (
      <SafetyGate
        patientName={patientName}
        patientEmail={patientEmail}
        patientPhone={phoneNumber ? phoneNumber.replace(/\D/g, "") : ""}
        safetyFlags={getSafetyFlags()}
        treatmentType={primaryProgram || "treatment"}
      />
    );
  }

  const getStepTitle = () => {
    switch (step) {
      case "info":
        return `Welcome, ${patientName.split(" ")[0]}!`;
      case "program":
        return "Tell Us About Your Goals";
      case "safety":
        return "Quick Safety Check";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case "info":
        return "Let's get your contact info so we can reach you";
      case "program":
        return "Select all the areas you're interested in exploring";
      case "safety":
        return primaryProgram === "hormone"
          ? "Help us ensure your safety with a few quick questions"
          : "Confirm to finish onboarding — your clinician will review goals at your visit.";
    }
  };

  const needsHormoneSafety = primaryProgram === "hormone";
  const canCompleteSafety =
    needsHormoneSafety ? isHighRisk() || confirmedNoneApply : true;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg border-primary/20 bg-card">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-playfair text-foreground">
            {getStepTitle()}
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-2">
            {getStepDescription()}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === "info" && (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                    <span className="text-muted-foreground text-xs">(optional)</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(706) 555-1234"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                    className="bg-background border-border h-12"
                    maxLength={14}
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll only use this for appointment reminders and important updates
                  </p>
                </div>
              </div>

              <Button
                onClick={handleContinueFromInfo}
                className="w-full bg-primary hover:bg-primary/90 text-white h-12"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}

          {step === "program" && (
            <>
              <div className="space-y-3">
                {INTEREST_OPTIONS.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => handleInterestToggle(option.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedInterests.includes(option.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                          selectedInterests.includes(option.id)
                            ? "bg-primary border-primary"
                            : "border-muted-foreground"
                        }`}
                      >
                        {selectedInterests.includes(option.id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleContinueFromProgram}
                disabled={selectedInterests.length === 0}
                className="w-full bg-primary hover:bg-primary/90 text-white h-12"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>

              <Button variant="ghost" onClick={() => setStep("info")} className="w-full text-muted-foreground">
                Back
              </Button>
            </>
          )}

          {step === "safety" && primaryProgram && (
            <>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p className="text-sm text-foreground">
                  Please answer honestly – this helps us provide safe, personalized care.
                </p>
              </div>

              {needsHormoneSafety ? (
                <div className="space-y-3">
                  {HORMONE_HIGH_RISK_CONDITIONS.map((condition) => (
                    <div
                      key={condition.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
                    >
                      <Checkbox
                        id={condition.id}
                        checked={hormoneSafetyScreening[condition.id as keyof typeof hormoneSafetyScreening]}
                        onCheckedChange={(checked) => {
                          setHormoneSafetyScreening((prev) => ({
                            ...prev,
                            [condition.id]: checked === true,
                          }));
                          setConfirmedNoneApply(false);
                        }}
                        className="mt-0.5"
                      />
                      <label htmlFor={condition.id} className="cursor-pointer">
                        <p className="font-medium text-foreground text-sm">{condition.label}</p>
                        <p className="text-xs text-muted-foreground">{condition.description}</p>
                      </label>
                    </div>
                  ))}

                  {!isHighRisk() && (
                    <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-green-500/30 bg-green-500/5">
                      <Checkbox
                        id="noneApply"
                        checked={confirmedNoneApply}
                        onCheckedChange={(checked) => setConfirmedNoneApply(checked === true)}
                      />
                      <label htmlFor="noneApply" className="text-sm text-foreground cursor-pointer">
                        I confirm none of the above conditions apply to me
                      </label>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  You can complete medical intake next. Clinical safety screening for weight loss and peptide protocols
                  continues at your Wellness Assessment.
                </p>
              )}

              <Button
                onClick={handleCompleteOnboarding}
                disabled={isLoading || !canCompleteSafety}
                className="w-full bg-primary hover:bg-primary/90 text-white h-12"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Complete Setup
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <Button variant="ghost" onClick={() => setStep("program")} className="w-full text-muted-foreground">
                Back to Program Selection
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthOnboarding;
