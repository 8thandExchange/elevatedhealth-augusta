import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar, Phone, ArrowLeft, ArrowRight } from "lucide-react";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { trackModalOpen, trackQuizComplete, trackCTAClick, trackEvent } from "@/lib/analytics";
import { useBooking } from "@/contexts/BookingContext";

interface CompareQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const questions = [
  {
    id: 1,
    question: "How long have you felt depressed or anxious?",
    options: [
      { value: "short", label: "Less than 1 month", score: 1 },
      { value: "medium", label: "1-6 months", score: 2 },
      { value: "long", label: "6+ months", score: 3 },
      { value: "years", label: "Years", score: 4 },
    ],
  },
  {
    id: 2,
    question: "Have traditional antidepressants helped you?",
    options: [
      { value: "yes", label: "Yes, they work well", score: 1 },
      { value: "somewhat", label: "Somewhat helpful", score: 2 },
      { value: "no", label: "No, not at all", score: 4 },
      { value: "never", label: "Never tried them", score: 2 },
    ],
  },
  {
    id: 3,
    question: "Do you experience suicidal thoughts?",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 2 },
      { value: "sometimes", label: "Sometimes", score: 3 },
      { value: "often", label: "Often", score: 4 },
    ],
  },
  {
    id: 4,
    question: "Rate your daily energy level (1-10):",
    options: [
      { value: "low", label: "1-3 (Very low)", score: 4 },
      { value: "medium", label: "4-6 (Moderate)", score: 3 },
      { value: "good", label: "7-8 (Good)", score: 1 },
      { value: "high", label: "9-10 (High)", score: 0 },
    ],
  },
  {
    id: 5,
    question: "Any history of PTSD or trauma?",
    options: [
      { value: "none", label: "No", score: 0 },
      { value: "mild", label: "Yes, mild", score: 2 },
      { value: "moderate", label: "Yes, moderate", score: 3 },
      { value: "severe", label: "Yes, severe", score: 4 },
    ],
  },
  {
    id: 6,
    question: "Do you have insurance coverage?",
    options: [
      { value: "bcbs", label: "Blue Cross Blue Shield", score: 0, insurance: "BCBS" },
      { value: "tricare", label: "TRICARE", score: 0, insurance: "TRICARE" },
      { value: "va", label: "VA Benefits", score: 0, insurance: "VA" },
      { value: "self", label: "Self-pay / No insurance", score: 0, insurance: "None" },
    ],
  },
];

export const CompareQuizModal = ({ isOpen, onClose }: CompareQuizModalProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);

  // Track modal open
  useEffect(() => {
    if (isOpen && currentQuestion === 0 && Object.keys(answers).length === 0) {
      trackModalOpen('compare_quiz_modal');
    }
  }, [isOpen, currentQuestion, answers]);

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const result = calculateResult();
      trackQuizComplete('treatment_comparison_quiz', result.treatment);
      setShowResult(true);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
  };

  const handleClose = () => {
    handleRestart();
    onClose();
  };

  const calculateResult = () => {
    let totalScore = 0;
    let insuranceType = "None";

    Object.entries(answers).forEach(([questionIndex, answerValue]) => {
      const question = questions[parseInt(questionIndex)];
      const selectedOption = question.options.find((opt) => opt.value === answerValue);
      if (selectedOption) {
        totalScore += selectedOption.score;
        if ('insurance' in selectedOption) {
          insuranceType = selectedOption.insurance as string;
        }
      }
    });

    // Determine treatment path based on score
    let treatment: string;
    let reason: string;

    if (totalScore >= 15) {
      treatment = "IV Ketamine Infusions";
      reason = "Treatment-Resistant Depression / PTSD";
    } else if (totalScore >= 10) {
      treatment = "Spravato® Nasal Spray";
      reason = "Moderate Depression / Anxiety";
    } else {
      treatment = "Free Consultation";
      reason = "Explore Your Treatment Options";
    }

    return { treatment, reason, score: totalScore, insurance: insuranceType };
  };

  const currentQ = questions[currentQuestion];
  const canProceed = answers[currentQuestion] !== undefined;

  if (showResult) {
    const result = calculateResult();

  const handleBooking = () => {
      trackCTAClick('quiz_book_now', 'payment_modal');
      
      // Send quiz result to backend
      fetch('/functions/v1/send-quiz-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          treatment: result.treatment,
          reason: result.reason,
          score: result.score,
          insurance: result.insurance,
          answers: Object.values(answers),
        }),
      }).catch(err => console.error('Failed to send quiz result:', err));
      
      onClose();
      // Dispatch custom event to open booking modal
      document.dispatchEvent(new CustomEvent('open-booking-modal'));
    };

    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent 
          className="sm:max-w-lg"
          role="alertdialog"
          aria-labelledby="quiz-result-title"
          aria-describedby="quiz-result-description"
        >
          <DialogHeader>
            <DialogTitle id="quiz-result-title" className="text-2xl md:text-3xl font-playfair">
              Your Personalized Path
            </DialogTitle>
            <DialogDescription id="quiz-result-description" className="text-base pt-4 space-y-4">
              <div className="bg-accent/10 border-l-4 border-accent p-4 rounded-r-lg">
                <p className="text-lg font-semibold text-accent mb-1">Recommended Treatment:</p>
                <p className="text-xl font-bold text-foreground">{result.treatment}</p>
              </div>
              <p className="text-muted-foreground">
                Based on your responses, this path may provide rapid relief. A comprehensive evaluation 
                with our physician will determine the best treatment for your specific situation.
              </p>
              {result.insurance !== "None" && (
                <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
                  ✓ Your insurance ({result.insurance}) may cover this treatment
                </p>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col gap-3">
            <Button
              onClick={handleBooking}
              className="w-full gap-2 text-lg py-6"
              size="lg"
            >
              <Calendar className="h-5 w-5" />
              Book $79 RN Wellness Assessment
            </Button>
            
            <Button
              onClick={() => {
                trackEvent('quiz_complete', { 
                  action: 'view_pricing', 
                  treatment: result.treatment 
                });
                window.location.href = '/what-to-expect#pricing';
              }}
              variant="outline"
              className="w-full"
            >
              View Pricing & Protocol Details
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              Prefer to talk? <a href="tel:+17067603470" className="text-accent hover:underline font-semibold inline-flex items-center gap-1">
                <Phone className="h-4 w-4" />
                Call (706) 760-3470
              </a>
            </p>

            <Button
              onClick={handleRestart}
              variant="ghost"
              className="w-full"
            >
              Restart Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-lg"
        aria-labelledby="quiz-question-title"
        aria-describedby="quiz-question-description"
      >
        <DialogHeader>
          <DialogTitle id="quiz-question-title" className="text-2xl">
            Question {currentQuestion + 1} of {questions.length}
          </DialogTitle>
          <DialogDescription id="quiz-question-description" className="text-base pt-2">
            {currentQ.question}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup
            value={answers[currentQuestion] || ""}
            onValueChange={handleAnswer}
            aria-label={currentQ.question}
            aria-required="true"
          >
            {currentQ.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-3 mb-3">
                <RadioGroupItem value={option.value} id={`${currentQ.id}-${option.value}`} />
                <Label
                  htmlFor={`${currentQ.id}-${option.value}`}
                  className="text-base cursor-pointer flex-1"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {currentQuestion > 0 && (
            <Button
              onClick={handleBack}
              variant="outline"
              className="w-full sm:w-auto gap-2"
              aria-label="Go to previous question"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="w-full sm:w-auto gap-2"
            aria-label={currentQuestion < questions.length - 1 ? "Go to next question" : "See quiz results"}
          >
            <Calendar className="h-4 w-4" aria-hidden="true" />
            {currentQuestion < questions.length - 1 ? "Next" : "See My Results"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
