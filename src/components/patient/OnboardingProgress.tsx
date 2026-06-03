import { Check, Stethoscope, Activity, Sparkles, Truck, TestTube, Calendar, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type JourneyStep = {
  id: string;
  stepNumber: number;
  label: string;
  description: string;
  icon: React.ReactNode;
  subSteps?: { id: string; label: string; complete: boolean }[];
};

interface OnboardingProgressProps {
  onboardingStatus: string | null;
  intakeCompleted: boolean;
  hasAuthorizedOrder: boolean;
  kitStatus?: string | null;
  trackingNumber?: string | null;
}

export const OnboardingProgress = ({ 
  onboardingStatus, 
  intakeCompleted, 
  hasAuthorizedOrder,
  kitStatus,
  trackingNumber
}: OnboardingProgressProps) => {
  
  // Map onboarding_status to current step and sub-step
  const getStepInfo = () => {
    const status = onboardingStatus || "pending_invite";
    
    // Step 1: Wellness Assessment
    if (["pending_invite", "account_created"].includes(status)) {
      return { step: 1, subStep: "book", progress: 0 };
    }
    if (status === "consultation_paid") {
      return { step: 1, subStep: "paid", progress: 10 };
    }
    if (status === "consultation_scheduled") {
      return { step: 1, subStep: "scheduled", progress: 20 };
    }
    if (status === "consultation_complete" || status === "intake_complete") {
      return { step: 1, subStep: "complete", progress: 33 };
    }
    
    // Step 2: Diagnostic Labs (LabCorp in-office)
    if (status === "labs_paid" || status === "awaiting_blood_work" || status === "kit_link_sent") {
      return { step: 2, subStep: "ordered", progress: 40 };
    }
    if (status === "kit_shipped" || status === "labs_in_progress" || status === "sample_received") {
      return { step: 2, subStep: "in_progress", progress: 55 };
    }
    if (status === "results_ready" || status === "labs_reviewed") {
      return { step: 2, subStep: "ready", progress: 66 };
    }
    
    // Step 3: Treatment
    if (status === "protocol_approved" || status === "pending_pharmacy_order") {
      return { step: 3, subStep: "approved", progress: 80 };
    }
    if (status === "treatment_active" || hasAuthorizedOrder) {
      return { step: 3, subStep: "active", progress: 100 };
    }
    
    return { step: 1, subStep: "book", progress: 0 };
  };

  const { step: currentStep, subStep: currentSubStep, progress } = getStepInfo();

  const JOURNEY_STEPS: JourneyStep[] = [
    {
      id: "strategy",
      stepNumber: 1,
      label: "Wellness Assessment",
      description: currentStep === 1 ? getStep1Description(currentSubStep) : "Initial consultation complete",
      icon: <Stethoscope className="w-5 h-5" />,
    },
    {
      id: "diagnostics",
      stepNumber: 2,
      label: "Diagnostic Labs",
      description: currentStep === 2 ? getStep2Description(currentSubStep, trackingNumber) :
                   currentStep > 2 ? "Lab results reviewed" : "Baseline labs (in-office draw when applicable)",
      icon: <Activity className="w-5 h-5" />,
    },
    {
      id: "treatment",
      stepNumber: 3,
      label: "Treatment",
      description: currentStep === 3 ? getStep3Description(currentSubStep) : "Your personalized protocol",
      icon: <Sparkles className="w-5 h-5" />,
    },
  ];

  function getStep1Description(sub: string): string {
    switch (sub) {
      case "book": return "Book your Wellness Assessment";
      case "paid": return "Session paid - schedule your appointment";
      case "scheduled": return "Session scheduled - see you soon!";
      case "complete": return "Session complete ✓";
      default: return "Initial consultation";
    }
  }

  function getStep2Description(sub: string, _tracking?: string | null): string {
    switch (sub) {
      case "ordered": return "LabCorp panel ordered — schedule your draw";
      case "in_progress": return "Blood draw complete — awaiting lab results";
      case "ready": return "Results ready for review!";
      default: return "In-office LabCorp labs";
    }
  }

  function getStep3Description(sub: string): string {
    switch (sub) {
      case "approved": return "Protocol approved - activating membership";
      case "active": return "Treatment active ✓";
      default: return "Your personalized protocol";
    }
  }

  const isComplete = currentStep === 3 && currentSubStep === "active";

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6">
      {/* Header with current step indicator */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-playfair text-lg text-foreground">Your Journey</h3>
          <p className="text-sm text-muted-foreground font-inter">
            {isComplete 
              ? "All steps complete!" 
              : `Step ${currentStep} of 3: ${JOURNEY_STEPS[currentStep - 1].label}`
            }
          </p>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-xs font-medium font-inter",
          isComplete 
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        )}>
          {isComplete ? "Complete" : `${progress}% Complete`}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-8">
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Vertical Steps - Matching Pricing Page Design */}
      <div className="space-y-4">
        {JOURNEY_STEPS.map((step, index) => {
          const stepNumber = step.stepNumber;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isLocked = stepNumber > currentStep;

          return (
            <div key={step.id} className="relative">
              {/* Connecting Line */}
              {index < JOURNEY_STEPS.length - 1 && (
                <div 
                  className={cn(
                    "absolute left-4 top-14 w-0.5 h-8 -ml-px",
                    isCompleted ? "bg-green-500" : "bg-gradient-to-b from-amber-500/50 to-slate-300"
                  )}
                />
              )}

              <div 
                className={cn(
                  "flex items-start gap-4 p-4 rounded-2xl transition-all border",
                  isCurrent && "bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/50 shadow-sm",
                  isCompleted && "bg-green-50/50 dark:bg-green-900/10 border-green-200/50 dark:border-green-800/30",
                  isLocked && "bg-muted/30 border-transparent opacity-60"
                )}
              >
                {/* Step Icon */}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                  isCompleted && "bg-green-500 text-white",
                  isCurrent && "bg-amber-500 text-white",
                  isLocked && "bg-muted text-muted-foreground"
                )}>
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : isLocked ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    step.icon
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs font-medium uppercase tracking-wider",
                      isCurrent ? "text-amber-600" : "text-muted-foreground"
                    )}>
                      Step {stepNumber}
                    </span>
                    {isLocked && (
                      <span className="text-xs text-muted-foreground">
                        • Unlocked after Step {stepNumber - 1}
                      </span>
                    )}
                  </div>
                  <p className={cn(
                    "font-medium text-sm mt-0.5",
                    isCompleted && "text-muted-foreground",
                    isCurrent && "text-foreground",
                    isLocked && "text-muted-foreground"
                  )}>
                    {step.label}
                  </p>
                  <p className={cn(
                    "text-xs mt-1",
                    isCurrent ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                  )}>
                    {step.description}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0">
                  {isCompleted && (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                      Done
                    </span>
                  )}
                  {isCurrent && !isCompleted && (
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kit Tracking Sub-Timeline (when in Step 2) */}
      {currentStep === 2 && (
        <div className="mt-6 pt-4 border-t border-border/50">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Kit Progress
          </p>
          <div className="flex items-center justify-between">
            {[
              { id: "ordered", label: "Ordered", icon: <TestTube className="w-3.5 h-3.5" /> },
              { id: "shipped", label: "Shipped", icon: <Truck className="w-3.5 h-3.5" /> },
              { id: "received", label: "Received", icon: <Check className="w-3.5 h-3.5" /> },
              { id: "ready", label: "Results", icon: <Calendar className="w-3.5 h-3.5" /> },
            ].map((kitStep, idx) => {
              const kitSteps = ["paid", "shipped", "received", "ready"];
              const currentKitIdx = kitSteps.indexOf(currentSubStep);
              const isKitComplete = idx <= currentKitIdx;
              const isKitCurrent = idx === currentKitIdx;

              return (
                <div key={kitStep.id} className="flex flex-col items-center flex-1">
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center mb-1",
                    isKitComplete ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground"
                  )}>
                    {kitStep.icon}
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium",
                    isKitCurrent ? "text-amber-600" : "text-muted-foreground"
                  )}>
                    {kitStep.label}
                  </span>
                  {idx < 3 && (
                    <div className={cn(
                      "absolute h-0.5 w-full mt-3.5",
                      isKitComplete ? "bg-amber-500" : "bg-muted"
                    )} style={{ left: `${(idx + 1) * 25}%`, width: '20%' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingProgress;
