import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { trackModalOpen, trackEvent } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HRTQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const symptomsList = [
  "Low energy/persistent fatigue",
  "Difficulty focusing/brain fog",
  "Unexplained weight gain",
  "Decreased libido",
  "Mood changes/irritability",
  "Poor sleep quality",
  "Hot flashes/night sweats",
  "Anxiety/depression",
  "Reduced muscle strength",
  "Other"
];

const questions = [
  {
    id: 1,
    type: "checkbox",
    question: "What symptoms are you experiencing?",
    subtext: "Select all that apply",
    options: symptomsList
  },
  {
    id: 2,
    type: "radio",
    question: "What is your age range?",
    options: [
      { value: "under30", label: "Under 30" },
      { value: "30-39", label: "30-39" },
      { value: "40-49", label: "40-49" },
      { value: "50-59", label: "50-59" },
      { value: "60plus", label: "60+" }
    ]
  },
  {
    id: 3,
    type: "radio",
    question: "What is your biological sex?",
    options: [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" }
    ]
  },
  {
    id: 4,
    type: "radio",
    question: "Do you have a primary care provider?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ]
  },
  {
    id: 5,
    type: "radio",
    question: "Have you had regular labs drawn this year?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "unsure", label: "Not sure" }
    ]
  },
  {
    id: 6,
    type: "radio",
    question: "Do you have any significant health problems?",
    subtext: "Heart disease, diabetes, cancer, etc.",
    options: [
      { value: "none", label: "No" },
      { value: "mild", label: "Yes, minor/well-controlled" },
      { value: "moderate", label: "Yes, moderate" },
      { value: "severe", label: "Yes, significant" }
    ]
  },
  {
    id: 7,
    type: "radio",
    question: "Have you ever had hormone therapy before?",
    options: [
      { value: "never", label: "Never" },
      { value: "past", label: "Yes, in the past" },
      { value: "current", label: "Yes, currently" }
    ]
  },
  {
    id: 8,
    type: "textarea",
    question: "What are your primary goals for hormone therapy?",
    placeholder: "e.g., increase energy, improve sleep, manage weight, enhance mood..."
  },
  {
    id: 9,
    type: "contact",
    question: "Contact Information",
    subtext: "We'll reach out to schedule your free consultation"
  }
];

export const HRTQuizModal = ({ isOpen, onClose }: HRTQuizModalProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [contactInfo, setContactInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && currentQuestion === 0 && Object.keys(answers).length === 0) {
      trackModalOpen('hrt_quiz_modal');
    }
  }, [isOpen, currentQuestion, answers]);

  const handleCheckboxAnswer = (option: string, checked: boolean) => {
    const currentAnswers = answers[currentQuestion] || [];
    if (checked) {
      setAnswers({ ...answers, [currentQuestion]: [...currentAnswers, option] });
    } else {
      setAnswers({
        ...answers,
        [currentQuestion]: currentAnswers.filter((a: string) => a !== option)
      });
    }
  };

  const handleRadioAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleTextAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const canProceed = () => {
    const question = questions[currentQuestion];
    
    if (question.type === "contact") {
      return (
        contactInfo.firstName.trim() !== "" &&
        contactInfo.lastName.trim() !== "" &&
        contactInfo.email.trim() !== "" &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email) &&
        contactInfo.phone.trim() !== ""
      );
    }
    
    if (question.type === "checkbox") {
      return answers[currentQuestion]?.length > 0;
    }
    
    return answers[currentQuestion] !== undefined && answers[currentQuestion] !== "";
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Prepare quiz data
      const quizData = {
        symptoms: answers[0] || [],
        age_range: answers[1] || "",
        sex: answers[2] || "",
        has_pcp: answers[3] || "",
        recent_labs: answers[4] || "",
        health_problems: answers[5] || "",
        previous_hrt: answers[6] || "",
        goals: answers[7] || "",
        first_name: contactInfo.firstName,
        last_name: contactInfo.lastName,
        email: contactInfo.email,
        phone: contactInfo.phone,
        created_at: new Date().toISOString()
      };

      // Call edge function to send email
      const { error } = await supabase.functions.invoke('send-quiz-result', {
        body: {
          type: 'hrt',
          data: quizData
        }
      });

      if (error) throw error;

      trackEvent('hrt_quiz_completed', {
        age_range: quizData.age_range,
        sex: quizData.sex,
        previous_hrt: quizData.previous_hrt
      });

      toast.success("Thank you! We'll contact you soon to schedule your free consultation.");
      
      // Reset and close
      setTimeout(() => {
        setCurrentQuestion(0);
        setAnswers({});
        setContactInfo({ firstName: "", lastName: "", email: "", phone: "" });
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting HRT quiz:', error);
      toast.error("There was an error submitting your responses. Please try again or call us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setContactInfo({ firstName: "", lastName: "", email: "", phone: "" });
    onClose();
  };

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Hormone Optimization Assessment</DialogTitle>
          <DialogDescription>
            Help us understand your needs so we can provide the best care.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-6">
          <div
            className="bg-accent h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question Content */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">{question.question}</h3>
            {question.subtext && (
              <p className="text-sm text-muted-foreground mb-4">{question.subtext}</p>
            )}
          </div>

          {/* Checkbox Questions */}
          {question.type === "checkbox" && (
            <div className="space-y-3">
              {question.options?.map((option) => (
                <div key={option} className="flex items-center space-x-3">
                  <Checkbox
                    id={option}
                    checked={answers[currentQuestion]?.includes(option) || false}
                    onCheckedChange={(checked) => handleCheckboxAnswer(option, checked as boolean)}
                  />
                  <Label htmlFor={option} className="text-base cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          )}

          {/* Radio Questions */}
          {question.type === "radio" && (
            <RadioGroup
              value={answers[currentQuestion] || ""}
              onValueChange={handleRadioAnswer}
              className="space-y-3"
            >
              {question.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-3">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="text-base cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {/* Textarea Questions */}
          {question.type === "textarea" && (
            <Textarea
              placeholder={question.placeholder}
              value={answers[currentQuestion] || ""}
              onChange={(e) => handleTextAnswer(e.target.value)}
              className="min-h-[120px]"
            />
          )}

          {/* Contact Form */}
          {question.type === "contact" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={contactInfo.firstName}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, firstName: e.target.value })
                    }
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={contactInfo.lastName}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, lastName: e.target.value })
                    }
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, email: e.target.value })
                  }
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, phone: e.target.value })
                  }
                  placeholder="(706) 555-0123"
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentQuestion === 0 || isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className="bg-accent hover:bg-accent-light text-accent-foreground"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : currentQuestion === questions.length - 1 ? (
                "Submit"
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Question Counter */}
        <div className="text-center text-sm text-muted-foreground mt-2">
          Question {currentQuestion + 1} of {questions.length}
        </div>
      </DialogContent>
    </Dialog>
  );
};