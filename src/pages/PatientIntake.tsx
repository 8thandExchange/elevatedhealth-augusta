import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, CheckCircle, ShieldAlert, Loader2, User, Check, TestTube, Brain } from "lucide-react";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { PageLoader } from "@/components/ui/PageLoader";
import ConsentStep from "@/components/patient/ConsentStep";

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

const MENSTRUAL_STATUS_OPTIONS = [
  { id: "regular", label: "Regular Periods" },
  { id: "irregular", label: "Irregular Periods" },
  { id: "no_periods", label: "No Periods" },
  { id: "hysterectomy", label: "Hysterectomy" },
  { id: "menopause", label: "Menopause" },
];

const WAKE_TIME_OPTIONS = [
  { id: "5am", label: "5:00 - 5:30 AM" },
  { id: "530am", label: "5:30 - 6:00 AM" },
  { id: "6am", label: "6:00 - 6:30 AM" },
  { id: "630am", label: "6:30 - 7:00 AM" },
  { id: "7am", label: "7:00 - 7:30 AM" },
  { id: "730am", label: "7:30 - 8:00 AM" },
  { id: "8am", label: "8:00 AM or later" },
];

// Mental health questions for Ketamine patients
const PHQ9_QUESTIONS = [
  { id: "phq1", label: "Little interest or pleasure in doing things" },
  { id: "phq2", label: "Feeling down, depressed, or hopeless" },
  { id: "phq3", label: "Trouble falling or staying asleep, or sleeping too much" },
  { id: "phq4", label: "Feeling tired or having little energy" },
  { id: "phq5", label: "Poor appetite or overeating" },
  { id: "phq6", label: "Feeling bad about yourself or that you are a failure" },
  { id: "phq7", label: "Trouble concentrating on things" },
  { id: "phq8", label: "Moving or speaking slowly, or being fidgety or restless" },
  { id: "phq9", label: "Thoughts that you would be better off dead or hurting yourself" },
];

const GAD7_QUESTIONS = [
  { id: "gad1", label: "Feeling nervous, anxious, or on edge" },
  { id: "gad2", label: "Not being able to stop or control worrying" },
  { id: "gad3", label: "Worrying too much about different things" },
  { id: "gad4", label: "Trouble relaxing" },
  { id: "gad5", label: "Being so restless that it's hard to sit still" },
  { id: "gad6", label: "Becoming easily annoyed or irritable" },
  { id: "gad7", label: "Feeling afraid as if something awful might happen" },
];

const mentalHealthSeverityLabels = ["Not at all", "Several days", "More than half the days", "Nearly every day"];

const STEPS = [
  { id: "profile", label: "Profile" },
  { id: "hormoneHistory", label: "Hormone Hx" },
  { id: "symptoms", label: "Symptoms" },
  { id: "safety", label: "Safety" },
  { id: "medical", label: "History" },
  { id: "mentalWellness", label: "Mental Wellness" },
  { id: "consent", label: "Consent" },
];

const PatientIntake = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [patientInterests, setPatientInterests] = useState<string[]>([]);
  const [primaryProgram, setPrimaryProgram] = useState<string>("hormone");
  const [step, setStep] = useState<"profile" | "hormoneHistory" | "symptoms" | "safety" | "medical" | "mentalWellness" | "consent">("profile");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullName, setFullName] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [streetAddress, setStreetAddress] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [zipCode, setZipCode] = useState<string>("");
  const [allergies, setAllergies] = useState<string>("");
  const [treatmentRequests, setTreatmentRequests] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [safetyAnswers, setSafetyAnswers] = useState<Record<string, boolean>>({});
  const [medicalHistory, setMedicalHistory] = useState<Record<string, boolean>>({});
  const [labcorpConditions, setLabcorpConditions] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mental wellness answers (PHQ-9 and GAD-7)
  const [phq9Answers, setPhq9Answers] = useState<Record<string, number>>({});
  const [gad7Answers, setGad7Answers] = useState<Record<string, number>>({});
  const [mentalWellnessIndex, setMentalWellnessIndex] = useState(0);
  
  // Hormone History (ZRT Required)
  const [menstrualStatus, setMenstrualStatus] = useState<string>("");
  const [takingHormones, setTakingHormones] = useState<boolean | null>(null);
  const [hormoneDetails, setHormoneDetails] = useState<string>("");
  const [wakeTime, setWakeTime] = useState<string>("");

  // Insurance fields (optional, used for superbill reimbursement)
  const [insuranceType, setInsuranceType] = useState<string>("self_pay");
  const [insurancePlanName, setInsurancePlanName] = useState<string>("");
  const [insuranceMemberId, setInsuranceMemberId] = useState<string>("");
  const [insuranceGroupNumber, setInsuranceGroupNumber] = useState<string>("");

  // Fetch patient's interests on mount
  useEffect(() => {
    const fetchPatientInterests = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          // ProtectedRoute handles auth redirects - just return here
          return;
        }

        const { data: patient, error } = await supabase
          .from("patients")
          .select("treatment_request, primary_program, full_name, gender")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (patient) {
          // Parse treatment_request (comma-separated interests)
          const interests = patient.treatment_request?.split(",").filter(Boolean) || [];
          setPatientInterests(interests);
          setPrimaryProgram(patient.primary_program || "hormone");
          
          // Pre-fill name and gender if available
          if (patient.full_name) setFullName(patient.full_name);
          if (patient.gender) setGender(patient.gender);
        }
      } catch (error) {
        console.error("Error fetching patient interests:", error);
        toast.error("Failed to load patient data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientInterests();
  }, [navigate]);

  // Determine which sections to show based on interests
  const hasHormoneInterests = useMemo(() => {
    return patientInterests.some(i => ["hormone", "weight_loss", "peptides"].includes(i));
  }, [patientInterests]);

  const hasKetamineInterest = useMemo(() => {
    return patientInterests.includes("ketamine");
  }, [patientInterests]);

  // Calculate visible steps based on interests
  const visibleSteps = useMemo(() => {
    const steps = [];
    steps.push({ id: "profile", label: "Profile" });
    
    if (hasHormoneInterests) {
      steps.push({ id: "hormoneHistory", label: "Hormone Hx" });
      steps.push({ id: "symptoms", label: "Symptoms" });
      steps.push({ id: "safety", label: "Safety" });
      steps.push({ id: "medical", label: "History" });
    }
    
    if (hasKetamineInterest) {
      steps.push({ id: "mentalWellness", label: "Mental Wellness" });
    }
    
    // Consent step for hormone/weight loss patients (ketamine uses Osmind)
    if (hasHormoneInterests && !hasKetamineInterest) {
      steps.push({ id: "consent", label: "Consent" });
    }
    
    return steps;
  }, [hasHormoneInterests, hasKetamineInterest]);

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

  // Calculate which step index we're on based on visible steps
  const getStepIndex = () => {
    return visibleSteps.findIndex(s => s.id === step);
  };
  
  // Get next step based on current step and interests
  const getNextStep = () => {
    const currentIdx = getStepIndex();
    if (currentIdx < visibleSteps.length - 1) {
      return visibleSteps[currentIdx + 1].id as typeof step;
    }
    return null;
  };

  // Get previous step based on current step and interests  
  const getPrevStep = () => {
    const currentIdx = getStepIndex();
    if (currentIdx > 0) {
      return visibleSteps[currentIdx - 1].id as typeof step;
    }
    return null;
  };
  
  const canProceedFromHormoneHistory = wakeTime.length > 0 && (gender === "male" || menstrualStatus.length > 0);

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

  const handleSubmit = async (consentSignature?: string) => {
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

      // If no patient record exists, create one with the entered name
      if (!patient && !patientError) {
        const { data: newPatient, error: createError } = await supabase
          .from("patients")
          .insert({
            user_id: user.id,
            full_name: fullName.trim(),
          })
          .select("id")
          .single();
        
        if (createError) throw new Error("Failed to create patient record");
        patient = newPatient;
      } else if (patient) {
        // Update the patient's name if they entered one
        await supabase
          .from("patients")
          .update({ full_name: fullName.trim() })
          .eq("id", patient.id);
      }

      if (patientError || !patient) throw new Error("Patient not found");

      const scores = calculateScores();
      const highRisk = isHighRisk();
      const androgenExcess = hasAndrogenExcess();
      const labPathResult = determineLabPath();

      // Calculate PHQ-9 and GAD-7 scores
      const phq9Score = Object.values(phq9Answers).reduce((a, b) => a + b, 0);
      const gad7Score = Object.values(gad7Answers).reduce((a, b) => a + b, 0);

      // Save symptom log with hormone history and mental wellness
      const { error: logError } = await supabase.from("symptom_logs").insert([{
        patient_id: patient.id,
        estrogen_score: hasHormoneInterests ? scores.estrogen : null,
        progesterone_score: hasHormoneInterests ? scores.progesterone : null,
        androgen_score: hasHormoneInterests ? scores.androgen : null,
        cortisol_score: hasHormoneInterests ? scores.cortisol : null,
        raw_answers: {
          symptoms: hasHormoneInterests ? answers : null,
          safety: hasHormoneInterests ? safetyAnswers : null,
          androgenExcess: hasHormoneInterests ? androgenExcess : null,
          labcorpConditions: hasHormoneInterests ? labcorpConditions : null,
          labPath: hasHormoneInterests ? labPathResult : null,
          hormoneHistory: hasHormoneInterests ? {
            menstrualStatus: gender === "female" ? menstrualStatus : "n/a_male",
            takingHormones,
            hormoneDetails: takingHormones ? hormoneDetails : null,
            wakeTime,
          } : null,
          mentalWellness: hasKetamineInterest ? {
            phq9Answers,
            phq9Score,
            gad7Answers,
            gad7Score,
          } : null,
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
        street_address: streetAddress.trim() || null,
        city: city.trim() || null,
        state: state.trim() || null,
        zip_code: zipCode.trim() || null,
        allergies: allergies.trim() || "NKDA",
        insurance_type: insuranceType,
        insurance_plan_name: insurancePlanName.trim() || null,
        insurance_member_id: insuranceMemberId.trim() || null,
        insurance_group_number: insuranceGroupNumber.trim() || null,
      };

      // Add consent data if signature provided (hormone/weight loss patients)
      if (consentSignature) {
        updateData.consent_signature = consentSignature;
        updateData.consent_signature_date = new Date().toISOString();
        updateData.consent_completed_at = new Date().toISOString();
        updateData.consent_method = "internal";
      }

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

      // Send notification to provider that intake is complete
      try {
        await supabase.functions.invoke("send-intake-completion-notification", {
          body: {
            patientName: fullName.trim(),
            patientEmail: user.email,
            patientId: patient.id,
            primaryProgram: primaryProgram,
            treatmentInterests: treatmentRequests,
            symptomScores: hasHormoneInterests ? scores : undefined,
            mentalWellnessScores: hasKetamineInterest ? { phq9: phq9Score, gad7: gad7Score } : undefined,
            isHighRisk: highRisk,
            safetyFlags: highRisk ? highRiskConditions.filter(c => medicalHistory[c.id]).map(c => c.label) : undefined,
            labPath: labPathResult.path,
            gender,
          }
        });
        console.log("[PatientIntake] Provider notification sent");
      } catch (notifyError) {
        console.error("[PatientIntake] Failed to send provider notification:", notifyError);
        // Don't block the flow if notification fails
      }

      // If patient is flagged as high-risk, send them the eligibility review email
      if (highRisk) {
        try {
          await supabase.functions.invoke("send-flagged-patient-notification", {
            body: {
              patient_name: fullName.trim(),
              patient_email: user.email,
              safety_flags: highRiskConditions.filter(c => medicalHistory[c.id]).map(c => c.label),
              treatment_type: treatmentRequests.join(", ") || "hormone therapy",
            }
          });
          console.log("[PatientIntake] Flagged patient notification sent");
        } catch (flaggedError) {
          console.error("[PatientIntake] Failed to send flagged patient notification:", flaggedError);
          // Don't block the flow if notification fails
        }
      }

      toast.success("Intake complete! A provider will review your results within 24-48 hours.");
      navigate("/patient/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit intake");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedFromProfile = fullName.trim().length >= 2 && gender && treatmentRequests.length > 0;

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-8">
        <div className="container mx-auto px-4 max-w-xl">
          {/* Step Indicators */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {visibleSteps.map((s, index) => {
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
                    {index < visibleSteps.length - 1 && (
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
              {step === "mentalWellness" && "Mental wellness assessment"}
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

                  {/* Full Name */}
                  <div className="mb-8">
                    <Label htmlFor="fullName" className="text-sm font-medium mb-3 block">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full"
                      required
                    />
                  </div>

                  {/* Gender Selection */}
                  <div className="mb-8">
                    <Label className="text-sm font-medium mb-3 block">
                      I identify as: <span className="text-red-500">*</span>
                    </Label>
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

                  {/* Address Fields */}
                  <div className="mb-8">
                    <Label className="text-sm font-medium mb-3 block">
                      Mailing Address <span className="text-muted-foreground font-normal">(for pharmacy shipments)</span>
                    </Label>
                    <div className="space-y-3">
                      <Input
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        placeholder="Street Address"
                        className="w-full"
                      />
                      <div className="grid grid-cols-6 gap-3">
                        <Input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="City"
                          className="col-span-3"
                        />
                        <Input
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="State"
                          className="col-span-1"
                          maxLength={2}
                        />
                        <Input
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          placeholder="ZIP"
                          className="col-span-2"
                          maxLength={10}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Insurance (Optional, for Superbill / Reimbursement) */}
                  <div className="mb-8">
                    <Label className="text-sm font-medium mb-3 block">
                      Insurance <span className="text-muted-foreground font-normal">(optional — for superbill reimbursement)</span>
                    </Label>
                    <div className="space-y-3">
                      <select
                        value={insuranceType}
                        onChange={(e) => setInsuranceType(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="self_pay">Self-Pay (no insurance)</option>
                        <option value="bcbs">Blue Cross Blue Shield</option>
                        <option value="tricare">TRICARE</option>
                        <option value="va">VA</option>
                        <option value="aetna">Aetna</option>
                        <option value="united">UnitedHealthcare</option>
                        <option value="cigna">Cigna</option>
                        <option value="medicare">Medicare</option>
                        <option value="other">Other</option>
                      </select>
                      {insuranceType !== "self_pay" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input
                            value={insurancePlanName}
                            onChange={(e) => setInsurancePlanName(e.target.value)}
                            placeholder="Plan name (e.g. PPO Gold)"
                          />
                          <Input
                            value={insuranceMemberId}
                            onChange={(e) => setInsuranceMemberId(e.target.value)}
                            placeholder="Member ID"
                          />
                          <Input
                            value={insuranceGroupNumber}
                            onChange={(e) => setInsuranceGroupNumber(e.target.value)}
                            placeholder="Group # (optional)"
                            className="sm:col-span-2"
                          />
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        We don't bill insurance directly. We provide a superbill with ICD-10 + CPT codes you can submit for reimbursement.
                      </p>
                    </div>
                  </div>

                  {/* Allergies */}
                  <div className="mb-8">
                    <Label htmlFor="allergies" className="text-sm font-medium mb-3 block">
                      Drug Allergies
                    </Label>
                    <Input
                      id="allergies"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      placeholder="List any drug allergies (or leave blank for NKDA)"
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Leave blank if no known drug allergies</p>
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
                onClick={() => setStep("hormoneHistory")} 
                className="w-full"
                disabled={!canProceedFromProfile}
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}

          {/* Hormone History Step (ZRT Required) */}
          {step === "hormoneHistory" && (
            <>
              <Card className="border-border/50 mb-8">
                <CardContent className="pt-8 pb-8">
                  <div className="flex items-center gap-2 mb-6">
                    <TestTube className="w-5 h-5 text-blue-500" />
                    <h2 className="font-cormorant text-xl text-foreground">
                      Hormone History
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    This information is required for your ZRT saliva test kit.
                  </p>

                  {/* Menstrual Status - Female Only */}
                  {gender === "female" && (
                    <div className="mb-8">
                      <Label className="text-sm font-medium mb-3 block">
                        Menstrual Status <span className="text-red-500">*</span>
                      </Label>
                      <RadioGroup 
                        value={menstrualStatus} 
                        onValueChange={setMenstrualStatus}
                        className="space-y-2"
                      >
                        {MENSTRUAL_STATUS_OPTIONS.map((option) => (
                          <div 
                            key={option.id}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                              menstrualStatus === option.id 
                                ? "border-primary bg-primary/5" 
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <RadioGroupItem value={option.id} id={`menstrual-${option.id}`} />
                            <Label htmlFor={`menstrual-${option.id}`} className="cursor-pointer flex-1">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}

                  {/* Currently Taking Hormones */}
                  <div className="mb-8">
                    <Label className="text-sm font-medium mb-3 block">
                      Are you currently taking hormones? <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup 
                      value={takingHormones === null ? "" : takingHormones ? "yes" : "no"} 
                      onValueChange={(v) => setTakingHormones(v === "yes")}
                      className="space-y-2"
                    >
                      <div className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                        takingHormones === false ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      )}>
                        <RadioGroupItem value="no" id="hormones-no" />
                        <Label htmlFor="hormones-no" className="cursor-pointer flex-1">No</Label>
                      </div>
                      <div className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                        takingHormones === true ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      )}>
                        <RadioGroupItem value="yes" id="hormones-yes" />
                        <Label htmlFor="hormones-yes" className="cursor-pointer flex-1">Yes</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Hormone Details - If Yes */}
                  {takingHormones === true && (
                    <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                      <Label htmlFor="hormoneDetails" className="text-sm font-medium mb-3 block">
                        List Hormone, Brand, Dose, and Last Time Used
                      </Label>
                      <textarea
                        id="hormoneDetails"
                        value={hormoneDetails}
                        onChange={(e) => setHormoneDetails(e.target.value)}
                        placeholder="e.g., Estradiol (Estrace) 1mg, last taken yesterday morning"
                        className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        This helps us interpret your saliva hormone levels accurately.
                      </p>
                    </div>
                  )}

                  {/* Wake Time */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      What time do you usually wake up? <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Crucial for interpreting your Cortisol Awakening Response (CAR).
                    </p>
                    <RadioGroup 
                      value={wakeTime} 
                      onValueChange={setWakeTime}
                      className="grid grid-cols-2 gap-2"
                    >
                      {WAKE_TIME_OPTIONS.map((option) => (
                        <div 
                          key={option.id}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-lg border transition-colors",
                            wakeTime === option.id 
                              ? "border-primary bg-primary/5" 
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <RadioGroupItem value={option.id} id={`wake-${option.id}`} />
                          <Label htmlFor={`wake-${option.id}`} className="cursor-pointer text-sm">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep("profile")} className="flex-1">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={() => setStep("symptoms")} 
                  className="flex-1"
                  disabled={!canProceedFromHormoneHistory}
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
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
                      setStep("hormoneHistory");
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
                {hasKetamineInterest ? (
                  <Button onClick={() => setStep("mentalWellness")} className="flex-1">
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : hasHormoneInterests ? (
                  <Button onClick={() => setStep("consent")} className="flex-1">
                    Continue to Consent
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={() => handleSubmit()} disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    Submit Intake
                  </Button>
                )}
              </div>
            </>
          )}

          {/* Consent Step - For Hormone/Weight Loss Patients */}
          {step === "consent" && (
            <ConsentStep
              treatmentType={treatmentRequests.includes("weight_loss") ? "weight_loss" : "hormone"}
              patientName={fullName}
              onBack={() => setStep("medical")}
              onSubmit={async (signature) => {
                await handleSubmit(signature);
              }}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Mental Wellness Step - PHQ-9 and GAD-7 */}
          {step === "mentalWellness" && (
            <>
              <Card className="border-border/50 mb-8">
                <CardContent className="pt-8 pb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-5 h-5 text-primary" />
                    <h2 className="font-cormorant text-xl text-foreground">
                      Mental Wellness Assessment
                    </h2>
                  </div>
                  <p className="text-muted-foreground text-sm mb-6">
                    Over the last 2 weeks, how often have you been bothered by the following?
                  </p>

                  {/* PHQ-9 Questions */}
                  <div className="mb-8">
                    <h3 className="text-sm font-medium text-foreground mb-4">Depression Screening (PHQ-9)</h3>
                    <div className="space-y-4">
                      {PHQ9_QUESTIONS.map((q) => (
                        <div key={q.id} className="p-4 rounded-lg border border-border">
                          <p className="text-sm font-medium text-foreground mb-3">{q.label}</p>
                          <div className="grid grid-cols-4 gap-2">
                            {mentalHealthSeverityLabels.map((label, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setPhq9Answers({ ...phq9Answers, [q.id]: i })}
                                className={cn(
                                  "p-2 text-xs rounded-lg border transition-colors",
                                  phq9Answers[q.id] === i
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border hover:border-primary/50"
                                )}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* GAD-7 Questions */}
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-4">Anxiety Screening (GAD-7)</h3>
                    <div className="space-y-4">
                      {GAD7_QUESTIONS.map((q) => (
                        <div key={q.id} className="p-4 rounded-lg border border-border">
                          <p className="text-sm font-medium text-foreground mb-3">{q.label}</p>
                          <div className="grid grid-cols-4 gap-2">
                            {mentalHealthSeverityLabels.map((label, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setGad7Answers({ ...gad7Answers, [q.id]: i })}
                                className={cn(
                                  "p-2 text-xs rounded-lg border transition-colors",
                                  gad7Answers[q.id] === i
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border hover:border-primary/50"
                                )}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(hasHormoneInterests ? "medical" : "profile")} className="flex-1">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={() => handleSubmit()} disabled={isSubmitting} className="flex-1">
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
