import { Check, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type OnboardingStep = {
  id: string;
  label: string;
  description: string;
};

const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: "account", label: "Account Created", description: "Welcome to Elevated Health" },
  { id: "intake", label: "Medical Intake", description: "Complete your symptom assessment" },
  { id: "review", label: "Provider Review", description: "Your protocol is being reviewed" },
  { id: "active", label: "Treatment Active", description: "Your personalized plan is ready" },
];

interface OnboardingProgressProps {
  onboardingStatus: string | null;
  intakeCompleted: boolean;
  hasAuthorizedOrder: boolean;
}

export const OnboardingProgress = ({ 
  onboardingStatus, 
  intakeCompleted, 
  hasAuthorizedOrder 
}: OnboardingProgressProps) => {
  // Determine current step based on status
  const getCurrentStep = (): number => {
    if (hasAuthorizedOrder || onboardingStatus === "treatment_active") return 4;
    if (onboardingStatus === "intake_complete" || intakeCompleted) return 3;
    if (onboardingStatus === "pending_invite" || onboardingStatus === "onboarding") return 1;
    return 1;
  };

  const currentStep = getCurrentStep();
  const completedSteps = currentStep - 1;
  const isComplete = currentStep === 4;

  return (
    <div className="bg-card border border-border/50 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-cormorant text-lg text-foreground">Your Journey</h3>
          <p className="text-sm text-muted-foreground">
            {isComplete 
              ? "All steps complete!" 
              : `${completedSteps} of ${ONBOARDING_STEPS.length} steps complete`
            }
          </p>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-xs font-medium",
          isComplete 
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-primary/10 text-primary"
        )}>
          {isComplete ? "Complete" : "In Progress"}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-8">
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${(completedSteps / ONBOARDING_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {ONBOARDING_STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isPending = stepNumber > currentStep;

          return (
            <div 
              key={step.id}
              className={cn(
                "flex items-start gap-4 p-3 rounded-lg transition-colors",
                isCurrent && "bg-primary/5 border border-primary/20",
                isCompleted && "opacity-70"
              )}
            >
              {/* Step Icon */}
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                isCompleted && "bg-green-500 text-white",
                isCurrent && "bg-primary text-primary-foreground",
                isPending && "bg-secondary text-muted-foreground"
              )}>
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : isCurrent ? (
                  <span className="text-sm font-bold">{stepNumber}</span>
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium text-sm",
                  isCompleted && "text-muted-foreground line-through",
                  isCurrent && "text-foreground",
                  isPending && "text-muted-foreground"
                )}>
                  {step.label}
                </p>
                <p className={cn(
                  "text-xs mt-0.5",
                  isCurrent ? "text-primary" : "text-muted-foreground"
                )}>
                  {step.description}
                </p>
              </div>

              {/* Status Badge */}
              {isCompleted && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Done
                </span>
              )}
              {isCurrent && (
                <span className="text-xs text-primary font-medium">
                  Current
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingProgress;