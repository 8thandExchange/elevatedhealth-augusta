import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Question {
  id: string;
  label: string;
  description: string;
  category: "estrogen" | "progesterone" | "androgen" | "safety";
}

const questions: Question[] = [
  // Estrogen Deficiency (5 questions)
  { id: "hot_flashes", label: "Hot Flashes", description: "Sudden feelings of warmth, especially in the upper body", category: "estrogen" },
  { id: "night_sweats", label: "Night Sweats", description: "Excessive sweating during sleep", category: "estrogen" },
  { id: "vaginal_dryness", label: "Vaginal Dryness", description: "Discomfort or dryness in vaginal tissues", category: "estrogen" },
  { id: "foggy_thinking", label: "Foggy Thinking", description: "Difficulty concentrating or mental clarity issues", category: "estrogen" },
  { id: "heart_palpitations", label: "Heart Palpitations", description: "Awareness of heartbeat or irregular rhythms", category: "estrogen" },
  // Progesterone Deficiency (3 questions)
  { id: "insomnia", label: "Sleep Disturbances", description: "Difficulty falling or staying asleep", category: "progesterone" },
  { id: "anxiety", label: "Anxiety or Nervousness", description: "Feeling worried, restless, or on edge", category: "progesterone" },
  { id: "painful_breasts", label: "Breast Tenderness", description: "Painful or sensitive breast tissue", category: "progesterone" },
  // Androgen/Testosterone Deficiency (5 questions)
  { id: "low_libido", label: "Low Libido", description: "Decreased interest in intimacy", category: "androgen" },
  { id: "muscle_loss", label: "Decreased Muscle Mass", description: "Loss of muscle tone or strength", category: "androgen" },
  { id: "thinning_skin", label: "Thinning Skin", description: "Skin becoming thinner or more fragile", category: "androgen" },
  { id: "fatigue", label: "Fatigue", description: "Persistent tiredness despite adequate rest", category: "androgen" },
  { id: "loss_of_zest", label: "Loss of Zest for Life", description: "Decreased motivation or enjoyment", category: "androgen" },
  // Safety Check (3 questions)
  { id: "acne", label: "Acne", description: "Persistent acne or breakouts", category: "safety" },
  { id: "facial_hair", label: "Excessive Facial Hair", description: "Unwanted hair growth on face", category: "safety" },
  { id: "oily_skin", label: "Oily Skin", description: "Excessively oily skin or scalp", category: "safety" },
];

const categoryLabels: Record<string, { title: string; subtitle: string; color: string }> = {
  estrogen: { 
    title: "Estrogen Balance", 
    subtitle: "Classic vasomotor symptoms validated by NAMS",
    color: "bg-pink-500"
  },
  progesterone: { 
    title: "Progesterone Balance", 
    subtitle: "The 'calming' hormone assessment",
    color: "bg-purple-500"
  },
  androgen: { 
    title: "Vitality & Testosterone", 
    subtitle: "Energy and wellness indicators",
    color: "bg-blue-500"
  },
  safety: { 
    title: "Safety Assessment", 
    subtitle: "Important screening questions",
    color: "bg-orange-500"
  },
};

const severityLabels = ["None", "Mild", "Moderate", "Severe"];

interface Results {
  estrogen: number;
  progesterone: number;
  androgen: number;
  androgenExcess: boolean;
  safetyScore: number;
}

const SymptomChecker = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Results | null>(null);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const currentValue = answers[currentQuestion.id] ?? 0;
  const isLastQuestion = currentIndex === questions.length - 1;

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

  const calculateResults = (): Results => {
    let estrogen = 0, progesterone = 0, androgen = 0, safetyScore = 0;

    questions.forEach((q) => {
      const score = answers[q.id] || 0;
      if (q.category === "estrogen") estrogen += score;
      else if (q.category === "progesterone") progesterone += score;
      else if (q.category === "androgen") androgen += score;
      else if (q.category === "safety") safetyScore += score > 0 ? 1 : 0; // Count YES answers
    });

    // Androgen Excess: If more than 1 safety symptom is present
    const androgenExcess = safetyScore > 1;

    return { estrogen, progesterone, androgen, androgenExcess, safetyScore };
  };

  const handleSubmit = () => {
    const calculatedResults = calculateResults();
    setResults(calculatedResults);
    setShowResults(true);
  };

  const getScoreStatus = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 50) return { label: "Significant Deficiency", color: "text-red-500", bg: "bg-red-500" };
    if (percentage >= 25) return { label: "Moderate Concern", color: "text-yellow-500", bg: "bg-yellow-500" };
    return { label: "Within Normal Range", color: "text-green-500", bg: "bg-green-500" };
  };

  const getRecommendation = (category: string, score: number, maxScore: number, androgenExcess: boolean) => {
    const percentage = (score / maxScore) * 100;
    
    if (category === "androgen" && androgenExcess) {
      return {
        protocol: "Evaluation Required",
        note: "Safety screening indicates androgen excess. Testosterone therapy is NOT recommended. Please consult our providers for a comprehensive evaluation.",
        blocked: true
      };
    }

    if (percentage < 25) {
      return { protocol: "Monitoring", note: "Symptoms are minimal. Continue healthy lifestyle practices.", blocked: false };
    }

    switch (category) {
      case "estrogen":
        return { 
          protocol: "Protocol A: Bi-Est Therapy", 
          note: "Estrogen replacement may help with vasomotor symptoms. Pink Topiclick dispenser.",
          blocked: false 
        };
      case "progesterone":
        return { 
          protocol: "Protocol C: Progesterone Support", 
          note: "Natural progesterone can restore calm and improve sleep quality.",
          blocked: false 
        };
      case "androgen":
        return { 
          protocol: "Protocol B: Testosterone Optimization", 
          note: "Testosterone therapy may restore vitality and energy. Blue Topiclick dispenser.",
          blocked: false 
        };
      default:
        return { protocol: "Consultation Recommended", note: "Speak with a provider for personalized guidance.", blocked: false };
    }
  };

  if (showResults && results) {
    const estrogenStatus = getScoreStatus(results.estrogen, 15);
    const progesteroneStatus = getScoreStatus(results.progesterone, 9);
    const androgenStatus = getScoreStatus(results.androgen, 15);

    const estrogenRec = getRecommendation("estrogen", results.estrogen, 15, results.androgenExcess);
    const progesteroneRec = getRecommendation("progesterone", results.progesterone, 9, results.androgenExcess);
    const androgenRec = getRecommendation("androgen", results.androgen, 15, results.androgenExcess);

    return (
      <div className="public-page-shell">
        <Navbar />
        <main className="flex-1 pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-widest text-accent mb-2">Assessment Complete</p>
              <h1 className="font-playfair text-4xl md:text-5xl text-foreground mb-4">
                Your Hormone Profile
              </h1>
              <p className="text-muted-foreground">
                Based on evidence-based clinical methodology
              </p>
            </div>

            {/* Safety Alert */}
            {results.androgenExcess && (
              <Card className="mb-8 border-2 border-red-500 bg-red-50 dark:bg-red-950/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <ShieldAlert className="w-8 h-8 text-red-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">
                        Important Safety Notice
                      </h3>
                      <p className="text-sm text-red-600 dark:text-red-300">
                        Your safety screening indicates signs of androgen excess (acne, facial hair, oily skin). 
                        Testosterone therapy is <strong>not recommended</strong> without further evaluation to prevent virilization. 
                        Please schedule a consultation for a comprehensive hormone panel.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Score Cards */}
            <div className="space-y-6 mb-12">
              {/* Estrogen */}
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-pink-500" />
                      <h3 className="font-playfair text-xl">Estrogen Deficiency</h3>
                    </div>
                    <span className={`text-sm font-medium ${estrogenStatus.color}`}>
                      {estrogenStatus.label}
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden mb-4">
                    <div 
                      className={`h-full ${estrogenStatus.bg} transition-all`}
                      style={{ width: `${(results.estrogen / 15) * 100}%` }}
                    />
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <p className="text-sm font-medium text-foreground">{estrogenRec.protocol}</p>
                    <p className="text-xs text-muted-foreground mt-1">{estrogenRec.note}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Progesterone */}
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      <h3 className="font-playfair text-xl">Progesterone Deficiency</h3>
                    </div>
                    <span className={`text-sm font-medium ${progesteroneStatus.color}`}>
                      {progesteroneStatus.label}
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden mb-4">
                    <div 
                      className={`h-full ${progesteroneStatus.bg} transition-all`}
                      style={{ width: `${(results.progesterone / 9) * 100}%` }}
                    />
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <p className="text-sm font-medium text-foreground">{progesteroneRec.protocol}</p>
                    <p className="text-xs text-muted-foreground mt-1">{progesteroneRec.note}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Androgen/Testosterone */}
              <Card className={`border-border/50 ${androgenRec.blocked ? "border-red-500 border-2" : ""}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <h3 className="font-playfair text-xl">Testosterone/Vitality</h3>
                    </div>
                    <span className={`text-sm font-medium ${androgenRec.blocked ? "text-red-500" : androgenStatus.color}`}>
                      {androgenRec.blocked ? "Blocked" : androgenStatus.label}
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden mb-4">
                    <div 
                      className={`h-full ${androgenRec.blocked ? "bg-red-500" : androgenStatus.bg} transition-all`}
                      style={{ width: `${(results.androgen / 15) * 100}%` }}
                    />
                  </div>
                  <div className={`rounded-lg p-4 ${androgenRec.blocked ? "bg-red-100 dark:bg-red-950/30" : "bg-secondary/50"}`}>
                    <div className="flex items-center gap-2">
                      {androgenRec.blocked && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      <p className={`text-sm font-medium ${androgenRec.blocked ? "text-red-700 dark:text-red-400" : "text-foreground"}`}>
                        {androgenRec.protocol}
                      </p>
                    </div>
                    <p className={`text-xs mt-1 ${androgenRec.blocked ? "text-red-600 dark:text-red-300" : "text-muted-foreground"}`}>
                      {androgenRec.note}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CTA */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-8 pb-8 text-center">
                <h3 className="font-playfair text-2xl text-foreground mb-2">
                  Ready for Personalized Care?
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  This assessment provides guidance, not a diagnosis. Schedule a consultation 
                  for comprehensive hormone testing and a customized treatment plan.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" onClick={() => navigate("/consult")}>
                    Book Consultation
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => {
                    setShowResults(false);
                    setCurrentIndex(0);
                    setAnswers({});
                  }}>
                    Retake Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="public-page-shell">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-8">
        <div className="container mx-auto px-4 max-w-xl">
          {/* Progress */}
          <div className="mb-8">
            <Progress value={progress} className="h-1" />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>

          {/* Category Badge */}
          <div className="mb-6">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-white ${categoryLabels[currentQuestion.category].color}`}>
              {categoryLabels[currentQuestion.category].title}
            </span>
            <p className="text-xs text-muted-foreground mt-2">
              {categoryLabels[currentQuestion.category].subtitle}
            </p>
          </div>

          {/* Question Card */}
          <Card className="border-border/50 mb-8">
            <CardContent className="pt-8 pb-8">
              <h2 className="font-playfair text-2xl md:text-3xl text-foreground mb-2">
                {currentQuestion.label}
              </h2>
              <p className="text-muted-foreground text-sm mb-8">
                {currentQuestion.description}
              </p>

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
                <div className="flex justify-between text-xs">
                  {severityLabels.map((label, i) => (
                    <span 
                      key={label}
                      className={`transition-colors ${
                        currentValue === i 
                          ? "text-primary font-semibold" 
                          : "text-muted-foreground"
                      }`}
                    >
                      {label}
                    </span>
                  ))}
                </div>

                {/* Current Selection */}
                <div className="text-center pt-4">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full border-2 ${
                    currentValue === 0 ? "border-green-500 text-green-500" :
                    currentValue === 1 ? "border-yellow-500 text-yellow-500" :
                    currentValue === 2 ? "border-orange-500 text-orange-500" :
                    "border-red-500 text-red-500"
                  }`}>
                    <span className="text-xl font-semibold">{currentValue}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            {isLastQuestion ? (
              <Button onClick={handleSubmit} className="flex-1">
                View Results
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleNext} className="flex-1">
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SymptomChecker;