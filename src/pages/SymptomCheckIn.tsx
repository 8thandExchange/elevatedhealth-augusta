import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import ProgressReport from "@/components/patient/ProgressReport";

interface SymptomQuestion {
  id: string;
  label: string;
  category: "estrogen" | "progesterone" | "androgen" | "cortisol";
}

const questions: SymptomQuestion[] = [
  // Estrogen
  { id: "hot_flashes", label: "Hot Flashes", category: "estrogen" },
  { id: "night_sweats", label: "Night Sweats", category: "estrogen" },
  { id: "mental_fog", label: "Mental Fog", category: "estrogen" },
  { id: "vaginal_dryness", label: "Vaginal Dryness", category: "estrogen" },
  // Progesterone
  { id: "insomnia", label: "Difficulty Sleeping", category: "progesterone" },
  { id: "anxiety", label: "Anxiety or Irritability", category: "progesterone" },
  { id: "mood_swings", label: "Mood Swings", category: "progesterone" },
  // Androgen
  { id: "low_libido", label: "Low Libido", category: "androgen" },
  { id: "fatigue", label: "Low Energy / Fatigue", category: "androgen" },
  { id: "muscle_loss", label: "Muscle Weakness", category: "androgen" },
  // Cortisol
  { id: "stress", label: "Chronic Stress", category: "cortisol" },
  { id: "sugar_cravings", label: "Sugar Cravings", category: "cortisol" },
  { id: "morning_fatigue", label: "Morning Fatigue", category: "cortisol" },
];

const categoryLabels: Record<string, { title: string; description: string }> = {
  estrogen: { title: "Estrogen Balance", description: "These symptoms may indicate low estrogen levels" },
  progesterone: { title: "Progesterone Balance", description: "These symptoms may indicate progesterone needs" },
  androgen: { title: "Vitality & Energy", description: "These symptoms relate to androgen levels" },
  cortisol: { title: "Stress Response", description: "These symptoms relate to cortisol and adrenal health" },
};

const severityLabels = ["None", "Mild", "Moderate", "Severe"];

interface PreviousScores {
  estrogen: number;
  progesterone: number;
  androgen: number;
  cortisol: number;
}

const SymptomCheckIn = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPrevious, setIsLoadingPrevious] = useState(true);
  const [previousScores, setPreviousScores] = useState<PreviousScores | null>(null);
  const [showProgressReport, setShowProgressReport] = useState(false);
  const [currentScores, setCurrentScores] = useState<PreviousScores | null>(null);

  useEffect(() => {
    loadPreviousScores();
  }, []);

  const loadPreviousScores = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/patient/login");
        return;
      }

      const { data: patient } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!patient) return;

      // Get the most recent symptom log
      const { data: previousLog } = await supabase
        .from("symptom_logs")
        .select("estrogen_score, progesterone_score, androgen_score, cortisol_score")
        .eq("patient_id", patient.id)
        .order("date_logged", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (previousLog) {
        setPreviousScores({
          estrogen: previousLog.estrogen_score || 0,
          progesterone: previousLog.progesterone_score || 0,
          androgen: previousLog.androgen_score || 0,
          cortisol: previousLog.cortisol_score || 0,
        });
      }
    } catch (error) {
      console.error("Error loading previous scores:", error);
    } finally {
      setIsLoadingPrevious(false);
    }
  };

  const currentQuestion = questions[currentIndex];
  const currentCategory = currentQuestion.category;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleSliderChange = (value: number[]) => {
    setAnswers({ ...answers, [currentQuestion.id]: value[0] });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const calculateScores = () => {
    const scores = {
      estrogen: 0,
      progesterone: 0,
      androgen: 0,
      cortisol: 0,
    };

    questions.forEach((q) => {
      const score = answers[q.id] || 0;
      scores[q.category] += score;
    });

    return scores;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to submit your check-in");
        navigate("/patient/login");
        return;
      }

      // Get patient record
      const { data: patient, error: patientError } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (patientError || !patient) {
        toast.error("Patient profile not found. Please contact support.");
        return;
      }

      const scores = calculateScores();
      setCurrentScores(scores);

      const { error } = await supabase.from("symptom_logs").insert({
        patient_id: patient.id,
        estrogen_score: scores.estrogen,
        progesterone_score: scores.progesterone,
        androgen_score: scores.androgen,
        cortisol_score: scores.cortisol,
        raw_answers: answers,
      });

      if (error) throw error;

      // Show progress report instead of immediately navigating
      setShowProgressReport(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit check-in");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentValue = answers[currentQuestion.id] ?? 0;
  const isLastQuestion = currentIndex === questions.length - 1;

  if (isLoadingPrevious) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (showProgressReport && currentScores) {
    return (
      <ProgressReport
        previousScores={previousScores}
        currentScores={currentScores}
        onContinue={() => {
          toast.success("Check-in submitted successfully!");
          navigate("/patient/dashboard");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-secondary">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <p className="text-xs uppercase tracking-widest text-gold font-medium">
          {categoryLabels[currentCategory].title}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {categoryLabels[currentCategory].description}
        </p>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="space-y-12">
          <div>
            <h2 className="font-cormorant text-3xl md:text-4xl text-foreground mb-2">
              {currentQuestion.label}
            </h2>
            <p className="text-muted-foreground">
              How would you rate this symptom over the past 2 weeks?
            </p>
          </div>

          {/* Slider */}
          <div className="space-y-6">
            <Slider
              value={[currentValue]}
              onValueChange={handleSliderChange}
              max={3}
              step={1}
              className="w-full"
            />
            
            {/* Severity Labels */}
            <div className="flex justify-between text-sm">
              {severityLabels.map((label, i) => (
                <span 
                  key={label}
                  className={`transition-colors ${
                    currentValue === i 
                      ? "text-primary font-medium" 
                      : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Current Selection Display */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-2xl font-cormorant text-primary">
                {currentValue}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {severityLabels[currentValue]}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-8 pt-4">
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => currentIndex === 0 ? navigate("/patient/dashboard") : handlePrev()}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {currentIndex === 0 ? "Cancel" : "Back"}
          </Button>
          
          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
              <Check className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleNext} className="flex-1">
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Question Counter */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          Question {currentIndex + 1} of {questions.length}
        </p>
      </div>
    </div>
  );
};

export default SymptomCheckIn;
