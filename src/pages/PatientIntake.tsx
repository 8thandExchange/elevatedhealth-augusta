import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, CheckCircle, ShieldAlert, Loader2, User, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  label: string;
  description: string;
  category: "estrogen" | "progesterone" | "androgen" | "cortisol" | "safety";
  gender?: "female" | "male" | "all"; // Which gender this applies to
}

const symptomQuestions: Question[] = [
  // Estrogen - Female only
  { id: "hot_flashes", label: "Hot Flashes", description: "Sudden feelings of warmth", category: "estrogen", gender: "female" },
  { id: "night_sweats", label: "Night Sweats", description: "Excessive sweating during sleep", category: "estrogen", gender: "female" },
  { id: "vaginal_dryness", label: "Vaginal Dryness", description: "Discomfort or dryness", category: "estrogen", gender: "female" },
  { id: "foggy_thinking", label: "Foggy Thinking", description: "Difficulty concentrating", category: "estrogen", gender: "all" },
  { id: "heart_palpitations", label: "Heart Palpitations", description: "Awareness of heartbeat", category: "estrogen", gender: "all" },
  // Progesterone - Female only
  { id: "insomnia", label: "Sleep Disturbances", description: "Difficulty sleeping", category: "progesterone", gender: "all" },
  { id: "anxiety", label: "Anxiety", description: "Feeling worried or on edge", category: "progesterone", gender: "all" },
  { id: "painful_breasts", label: "Breast Tenderness", description: "Painful breast tissue", category: "progesterone", gender: "female" },
  // Androgen - All genders
  { id: "low_libido", label: "Low Libido", description: "Decreased interest in intimacy", category: "androgen", gender: "all" },
  { id: "muscle_loss", label: "Muscle Loss", description: "Loss of muscle tone", category: "androgen", gender: "all" },
  { id: "thinning_skin", label: "Thinning Skin", description: "Skin becoming fragile", category: "androgen", gender: "all" },
  { id: "fatigue", label: "Fatigue", description: "Persistent tiredness", category: "androgen", gender: "all" },
  { id: "loss_of_zest", label: "Loss of Zest", description: "Decreased motivation", category: "androgen", gender: "all" },
  // Male-specific androgen symptoms
  { id: "erectile_dysfunction", label: "Erectile Dysfunction", description: "Difficulty achieving or maintaining erection", category: "androgen", gender: "male" },
  { id: "decreased_strength", label: "Decreased Strength", description: "Noticeable loss of physical strength", category: "androgen", gender: "male" },
  // Cortisol - All genders
  { id: "stress", label: "Chronic Stress", description: "Ongoing stress", category: "cortisol", gender: "all" },
  { id: "sugar_cravings", label: "Sugar Cravings", description: "Strong cravings", category: "cortisol", gender: "all" },
  { id: "morning_fatigue", label: "Morning Fatigue", description: "Tired upon waking", category: "cortisol", gender: "all" },
  { id: "belly_fat", label: "Stubborn Belly Fat", description: "Weight accumulation around midsection", category: "cortisol", gender: "all" },
];

const safetyQuestions = [
  { id: "acne", label: "Acne", description: "Persistent breakouts", gender: "all" as const },
  { id: "facial_hair", label: "Excessive Facial Hair", description: "Unwanted hair growth", gender: "female" as const },
  { id: "oily_skin", label: "Oily Skin", description: "Excessively oily", gender: "all" as const },
];

const HIGH_RISK_CONDITIONS_FEMALE = [
  { id: "breastCancer", label: "Breast Cancer (Personal History)" },
  { id: "uterineCancer", label: "Uterine/Endometrial Cancer" },
  { id: "bloodClot", label: "Active Blood Clot (DVT/PE)" },
  { id: "pregnantBreastfeeding", label: "Pregnant or Breastfeeding" },
];

const HIGH_RISK_CONDITIONS_MALE = [
  { id: "prostateCancer", label: "Prostate Cancer (Personal History)" },
  { id: "bloodClot", label: "Active Blood Clot (DVT/PE)" },
  { id: "polycythemia", label: "Polycythemia (High Red Blood Cell Count)" },
];

// LabCorp Trigger Conditions
const LABCORP_CONDITIONS = [
  { id: "thyroidDisorder", label: "Thyroid Disorder (Hypo/Hyperthyroidism)" },
  { id: "kidneyDisease", label: "Kidney Disease or Impaired Function" },
  { id: "liverDisease", label: "Liver Disease or Impaired Function" },
];

const TREATMENT_OPTIONS_FEMALE = [
  { id: "hormone_female", label: "Hormone Replacement Therapy", description: "Menopause, perimenopause, hormone balance" },
  { id: "weight_loss", label: "Weight Loss Program", description: "GLP-1 therapy with hormonal support" },
];

const TREATMENT_OPTIONS_MALE = [
  { id: "testosterone", label: "Testosterone Therapy (TRT)", description: "Low-T, energy, strength optimization" },
  { id: "hormone_male", label: "Full Hormone Optimization", description: "Comprehensive male hormone panel" },
  { id: "weight_loss", label: "Weight Loss Program", description: "GLP-1 therapy with metabolic support" },
];

const severityLabels = ["None", "Mild", "Moderate", "Severe"];

const STEPS = [
  { id: "profile", label: "Profile" },
  { id: "symptoms", label: "Symptoms" },
  { id: "safety", label: "Safety" },
  { id: "medical", label: "History" },
];

const PatientIntake = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"profile" | "symptoms" | "safety" | "medical">("profile");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gender, setGender] = useState<string>("");
  const [treatmentRequests, setTreatmentRequests] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [safetyAnswers, setSafetyAnswers] = useState<Record<string, boolean>>({});
  const [medicalHistory, setMedicalHistory] = useState<Record<string, boolean>>({});
  const [labcorpConditions, setLabcorpConditions] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter questions based on gender
  const filteredSymptomQuestions = useMemo(() => {
    if (!gender) return [];
    return symptomQuestions.filter(q => q.gender === "all" || q.gender === gender);
  }, [gender]);

  const filteredSafetyQuestions = useMemo(() => {
    if (!gender) return safetyQuestions;
    return safetyQuestions.filter(q => q.gender === "all" || q.gender === gender);
  }, [gender]);

  const highRiskConditions = gender === "male" ? HIGH_RISK_CONDITIONS_MALE : HIGH_RISK_CONDITIONS_FEMALE;
  const treatmentOptions = gender === "male" ? TREATMENT_OPTIONS_MALE : TREATMENT_OPTIONS_FEMALE;

  const currentQuestion = filteredSymptomQuestions[currentIndex];

  // Calculate which step index we're on (0-3)
  const getStepIndex = () => {
    switch (step) {
      case "profile": return 0;
      case "symptoms": return 1;
      case "safety": return 2;
      case "medical": return 3;
      default: return 0;
    }
  };

  const handleTreatmentToggle = (treatmentId: string) => {
    setTreatmentRequests(prev => 
      prev.includes(treatmentId) 
        ? prev.filter(id => id !== treatmentId)
        : [...prev, treatmentId]
    );
  };

  const handleNext = () => {
    if (currentIndex < filteredSymptomQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setStep("safety");
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const calculateScores = () => {
    const scores = { estrogen: 0, progesterone: 0, androgen: 0, cortisol: 0 };
    filteredSymptomQuestions.forEach((q) => {
      scores[q.category] += answers[q.id] || 0;
    });
    return scores;
  };

  const hasAndrogenExcess = () => {
    const count = filteredSafetyQuestions.filter(q => safetyAnswers[q.id]).length;
    return count > 1;
  };

  const isHighRisk = () => {
    return highRiskConditions.some(c => medicalHistory[c.id]);
  };

  // Determine lab path based on triggers
  const determineLabPath = () => {
    // Male requesting testosterone -> LabCorp Men's Safety Panel
    if (gender === "male" && (treatmentRequests.includes("testosterone") || treatmentRequests.includes("hormone_male"))) {
      return { path: "labcorp", panel: "mens_safety", reason: "Male testosterone therapy requires PSA, CBC, CMP" };
    }
    
    // Thyroid disorder -> LabCorp Thyroid Panel
    if (labcorpConditions.thyroidDisorder) {
      return { path: "labcorp", panel: "thyroid", reason: "Thyroid disorder requires TSH, T3, T4 panel" };
    }
    
    // Kidney or Liver disease -> LabCorp Safety Panel
    if (labcorpConditions.kidneyDisease || labcorpConditions.liverDisease) {
      return { path: "labcorp", panel: "safety_cmp", reason: "Organ function requires CMP safety panel" };
    }
    
    // Default: ZRT Saliva Kit for all female hormone/weight loss
    return { path: "zrt", panel: null, reason: null };
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get or create patient record
      let { data: patient, error: patientError } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      // If no patient record exists, create one
      if (!patient && !patientError) {
        const { data: newPatient, error: createError } = await supabase
          .from("patients")
          .insert({
            user_id: user.id,
            full_name: user.email?.split("@")[0] || "Patient",
          })
          .select("id")
          .single();
        
        if (createError) throw new Error("Failed to create patient record");
        patient = newPatient;
      }

      if (patientError || !patient) throw new Error("Patient not found");

      const scores = calculateScores();
      const highRisk = isHighRisk();
      const androgenExcess = hasAndrogenExcess();
      const labPathResult = determineLabPath();

      // Save symptom log
      const { error: logError } = await supabase.from("symptom_logs").insert([{
        patient_id: patient.id,
        estrogen_score: scores.estrogen,
        progesterone_score: scores.progesterone,
        androgen_score: scores.androgen,
        cortisol_score: scores.cortisol,
        raw_answers: {
          symptoms: answers,
          safety: safetyAnswers,
          androgenExcess,
          labcorpConditions,
          labPath: labPathResult,
        },
      }]);

      if (logError) throw logError;

      // Update patient record - store treatments as comma-separated string
      const updateData: Record<string, any> = {
        intake_completed: true,
        onboarding_status: "intake_complete",
        medical_history: { ...medicalHistory, ...labcorpConditions },
        gender,
        treatment_request: treatmentRequests.join(","),
        lab_path: labPathResult.path,
      };

      if (highRisk) {
        updateData.risk_status = "high_risk_review";
        updateData.safety_flags = highRiskConditions
          .filter(c => medicalHistory[c.id])
          .map(c => c.label);
      }

      await supabase
        .from("patients")
        .update(updateData)
        .eq("id", patient.id);

      toast.success("Intake complete! A provider will review your results.");
      navigate("/patient/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit intake");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedFromProfile = gender && treatmentRequests.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-8">
        <div className="container mx-auto px-4 max-w-xl">
          {/* Step Indicators */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {STEPS.map((s, index) => {
                const currentStepIndex = getStepIndex();
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                
                return (
                  <div key={s.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                        isCompleted && "bg-green-500 text-white",
                        isCurrent && "bg-primary text-primary-foreground",
                        !isCompleted && !isCurrent && "bg-secondary text-muted-foreground"
                      )}>
                        {isCompleted ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className={cn(
                        "text-xs mt-1",
                        isCurrent ? "text-primary font-medium" : "text-muted-foreground"
                      )}>
                        {s.label}
                      </span>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div className={cn(
                        "h-0.5 w-8 sm:w-12 mx-1",
                        index < currentStepIndex ? "bg-green-500" : "bg-secondary"
                      )} />
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {step === "profile" && "Tell us about yourself"}
              {step === "symptoms" && `Question ${currentIndex + 1} of ${filteredSymptomQuestions.length}`}
              {step === "safety" && "Safety screening"}
              {step === "medical" && "Medical history review"}
            </p>
          </div>

          {/* Profile Step */}
          {step === "profile" && (
            <>
              <Card className="border-border/50 mb-8">
                <CardContent className="pt-8 pb-8">
                  <div className="flex items-center gap-2 mb-6">
                    <User className="w-5 h-5 text-primary" />
                    <h2 className="font-cormorant text-xl text-foreground">
                      Tell Us About Yourself
                    </h2>
                  </div>

                  {/* Gender Selection */}
                  <div className="mb-8">
                    <Label className="text-sm font-medium mb-3 block">I identify as:</Label>
                    <RadioGroup 
                      value={gender} 
                      onValueChange={(value) => {
                        setGender(value);
                        setTreatmentRequests([]); // Reset treatments when gender changes
                        setCurrentIndex(0); // Reset symptom index
                      }} 
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female" className="cursor-pointer flex-1">Female</Label>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male" className="cursor-pointer flex-1">Male</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Treatment Request - Multi-select */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      I'm interested in: <span className="text-muted-foreground font-normal">(select all that apply)</span>
                    </Label>
                    {gender ? (
                      <div className="space-y-3">
                        {treatmentOptions.map((option) => (
                          <div 
                            key={option.id}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                              treatmentRequests.includes(option.id) 
                                ? "border-primary bg-primary/5" 
                                : "border-border hover:border-primary/50"
                            )}
                            onClick={() => handleTreatmentToggle(option.id)}
                          >
                            <Checkbox
                              id={option.id}
                              checked={treatmentRequests.includes(option.id)}
                              onCheckedChange={() => handleTreatmentToggle(option.id)}
                            />
                            <Label htmlFor={option.id} className="cursor-pointer flex-1">
                              <span className="font-medium">{option.label}</span>
                              <p className="text-xs text-muted-foreground">{option.description}</p>
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Please select your gender first</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={() => setStep("symptoms")} 
                className="w-full"
                disabled={!canProceedFromProfile}
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}

          {/* Symptoms Step */}
          {step === "symptoms" && currentQuestion && (
            <>
              <Card className="border-border/50 mb-8">
                <CardContent className="pt-8 pb-8">
                  <h2 className="font-cormorant text-2xl text-foreground mb-2">
                    {currentQuestion.label}
                  </h2>
                  <p className="text-muted-foreground text-sm mb-8">
                    {currentQuestion.description}
                  </p>

                  <Slider
                    value={[answers[currentQuestion.id] ?? 0]}
                    onValueChange={(v) => setAnswers({ ...answers, [currentQuestion.id]: v[0] })}
                    max={3}
                    step={1}
                    className="w-full mb-6"
                  />
                  
                  <div className="flex justify-between text-xs">
                    {severityLabels.map((label, i) => (
                      <span 
                        key={label}
                        className={answers[currentQuestion.id] === i ? "text-primary font-semibold" : "text-muted-foreground"}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (currentIndex === 0) {
                      setStep("profile");
                    } else {
                      handlePrev();
                    }
                  }} 
                  className="flex-1"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleNext} className="flex-1">
                  {currentIndex === filteredSymptomQuestions.length - 1 ? "Continue" : "Next"}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}

          {/* Safety Step */}
          {step === "safety" && (
            <>
              <Card className="border-border/50 mb-8">
                <CardContent className="pt-8 pb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldAlert className="w-5 h-5 text-amber-500" />
                    <h2 className="font-cormorant text-xl text-foreground">
                      {gender === "male" ? "Androgen Safety Check" : "Hormone Safety Check"}
                    </h2>
                  </div>
                  <p className="text-muted-foreground text-sm mb-6">
                    Do you currently experience any of the following?
                  </p>

                  <div className="space-y-4">
                    {filteredSafetyQuestions.map((q) => (
                      <div key={q.id} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                        <Checkbox
                          id={q.id}
                          checked={safetyAnswers[q.id] || false}
                          onCheckedChange={(c) => setSafetyAnswers({ ...safetyAnswers, [q.id]: c === true })}
                        />
                        <Label htmlFor={q.id} className="cursor-pointer">
                          <span className="font-medium">{q.label}</span>
                          <p className="text-xs text-muted-foreground">{q.description}</p>
                        </Label>
                      </div>
                    ))}
                  </div>

                  {hasAndrogenExcess() && (
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-sm text-amber-700 dark:text-amber-300">
                      Multiple symptoms detected. {gender === "male" ? "Your testosterone therapy" : "Testosterone therapy"} may require additional evaluation.
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => { setStep("symptoms"); setCurrentIndex(filteredSymptomQuestions.length - 1); }} className="flex-1">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={() => setStep("medical")} className="flex-1">
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}

          {/* Medical History Step */}
          {step === "medical" && (
            <>
              <Card className="border-border/50 mb-8">
                <CardContent className="pt-8 pb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    <h2 className="font-cormorant text-xl text-foreground">
                      Medical History
                    </h2>
                  </div>
                  <p className="text-muted-foreground text-sm mb-6">
                    Please answer honestly. This ensures your safety.
                  </p>

                  {/* High Risk Conditions */}
                  <div className="space-y-4 mb-8">
                    <p className="text-sm font-medium text-foreground">Critical Conditions:</p>
                    {highRiskConditions.map((c) => (
                      <div 
                        key={c.id} 
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          medicalHistory[c.id] ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/20" : "border-border"
                        }`}
                      >
                        <Checkbox
                          id={c.id}
                          checked={medicalHistory[c.id] || false}
                          onCheckedChange={(checked) => setMedicalHistory({ ...medicalHistory, [c.id]: checked === true })}
                        />
                        <Label htmlFor={c.id} className="cursor-pointer font-medium">
                          {c.label}
                        </Label>
                      </div>
                    ))}
                  </div>

                  {/* LabCorp Trigger Conditions */}
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-foreground">Other Conditions (may affect lab requirements):</p>
                    {LABCORP_CONDITIONS.map((c) => (
                      <div 
                        key={c.id} 
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          labcorpConditions[c.id] ? "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20" : "border-border"
                        }`}
                      >
                        <Checkbox
                          id={c.id}
                          checked={labcorpConditions[c.id] || false}
                          onCheckedChange={(checked) => setLabcorpConditions({ ...labcorpConditions, [c.id]: checked === true })}
                        />
                        <Label htmlFor={c.id} className="cursor-pointer font-medium">
                          {c.label}
                        </Label>
                      </div>
                    ))}
                  </div>

                  {isHighRisk() && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg text-sm text-red-700 dark:text-red-300">
                      Your intake will be flagged for priority manual review by a provider.
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep("safety")} className="flex-1">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Submit Intake
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default PatientIntake;
