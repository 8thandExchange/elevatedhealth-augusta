import { ArrowRight, Calendar, CreditCard, Mail, TestTube, Sparkles, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NextActionCardProps {
  onboardingStatus: string | null;
  kitStatus?: string | null;
  hasAuthorizedOrder: boolean;
  onBookConsultation?: () => void;
  onPayForLabs?: () => void;
  onActivateMembership?: () => void;
}

export const NextActionCard = ({
  onboardingStatus,
  kitStatus,
  hasAuthorizedOrder,
  onBookConsultation,
  onPayForLabs,
  onActivateMembership,
}: NextActionCardProps) => {
  const status = onboardingStatus || "pending_invite";

  // Define action based on current status
  const getActionConfig = () => {
    // Step 1 states
    if (["pending_invite", "account_created"].includes(status)) {
      return {
        icon: <Calendar className="w-6 h-6" />,
        title: "Book Your Strategy Session",
        description: "Schedule your $99 consultation to discuss your health goals and create a personalized plan.",
        buttonText: "Book Now",
        buttonAction: onBookConsultation,
        timeEstimate: "15-30 minute session",
        accentColor: "amber",
      };
    }

    if (status === "consultation_paid") {
      return {
        icon: <Calendar className="w-6 h-6" />,
        title: "Schedule Your Session",
        description: "You've paid for your consultation. Now pick a time that works for you.",
        buttonText: "Choose Time",
        buttonAction: onBookConsultation,
        timeEstimate: "Book within 48 hours",
        accentColor: "amber",
      };
    }

    if (status === "consultation_scheduled") {
      return {
        icon: <Clock className="w-6 h-6" />,
        title: "Your Session is Scheduled",
        description: "Check your email for the appointment details. We'll see you soon!",
        buttonText: null,
        buttonAction: null,
        timeEstimate: "Check email for details",
        accentColor: "green",
      };
    }

    if (status === "consultation_complete" || status === "intake_complete") {
      return {
        icon: <TestTube className="w-6 h-6" />,
        title: "Complete Your Lab Payment",
        description: "Your provider has recommended diagnostic labs. Pay now to receive your at-home testing kit.",
        buttonText: "Pay for Labs",
        buttonAction: onPayForLabs,
        timeEstimate: "Kit ships in 2-3 business days",
        accentColor: "amber",
      };
    }

    // Step 2 states
    if (status === "labs_paid") {
      return {
        icon: <Mail className="w-6 h-6" />,
        title: "Kit Shipping Soon",
        description: "Your diagnostic kit is being prepared. Watch your mailbox!",
        buttonText: null,
        buttonAction: null,
        timeEstimate: "Ships within 2-3 business days",
        accentColor: "blue",
      };
    }

    if (status === "kit_shipped" || kitStatus === "shipped") {
      return {
        icon: <TestTube className="w-6 h-6" />,
        title: "Kit In Transit",
        description: "Your testing kit is on its way. Follow the instructions inside when it arrives.",
        buttonText: null,
        buttonAction: null,
        timeEstimate: "Arrives in 3-5 business days",
        accentColor: "blue",
      };
    }

    if (status === "sample_received" || kitStatus === "sample_received") {
      return {
        icon: <Clock className="w-6 h-6" />,
        title: "Sample Being Analyzed",
        description: "Our lab is processing your sample. Results typically take 7-10 business days.",
        buttonText: null,
        buttonAction: null,
        timeEstimate: "Results in 7-10 business days",
        accentColor: "blue",
      };
    }

    if (status === "results_ready" || status === "labs_reviewed" || kitStatus === "results_ready") {
      return {
        icon: <Sparkles className="w-6 h-6" />,
        title: "Results Ready!",
        description: "Your lab results are in. Your provider will reach out with your personalized treatment plan.",
        buttonText: null,
        buttonAction: null,
        timeEstimate: "Provider review within 24-48 hours",
        accentColor: "green",
      };
    }

    // Step 3 states
    if (status === "protocol_approved" || status === "pending_pharmacy_order") {
      return {
        icon: <CreditCard className="w-6 h-6" />,
        title: "Activate Your Membership",
        description: "Your treatment plan is ready! Activate your membership to begin your personalized protocol.",
        buttonText: "Activate Membership",
        buttonAction: onActivateMembership,
        timeEstimate: "Start treatment today",
        accentColor: "amber",
      };
    }

    if (status === "treatment_active" || hasAuthorizedOrder) {
      return {
        icon: <Sparkles className="w-6 h-6" />,
        title: "Treatment Active",
        description: "You're all set! Follow your daily protocol and log symptoms to track your progress.",
        buttonText: null,
        buttonAction: null,
        timeEstimate: null,
        accentColor: "green",
      };
    }

    // Default fallback
    return {
      icon: <Calendar className="w-6 h-6" />,
      title: "Get Started",
      description: "Begin your wellness journey by booking a consultation.",
      buttonText: "Book Consultation",
      buttonAction: onBookConsultation,
      timeEstimate: null,
      accentColor: "amber",
    };
  };

  const config = getActionConfig();
  const isActionable = !!config.buttonAction && !!config.buttonText;

  return (
    <Card className={cn(
      "border-2 rounded-2xl overflow-hidden transition-all",
      config.accentColor === "amber" && "border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10",
      config.accentColor === "green" && "border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10",
      config.accentColor === "blue" && "border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10"
    )}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            config.accentColor === "amber" && "bg-amber-500 text-white",
            config.accentColor === "green" && "bg-green-500 text-white",
            config.accentColor === "blue" && "bg-blue-500 text-white"
          )}>
            {config.icon}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-playfair text-lg text-foreground mb-1">
              {config.title}
            </h3>
            <p className="text-sm text-muted-foreground font-inter mb-3">
              {config.description}
            </p>

            {config.timeEstimate && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                <Clock className="w-3.5 h-3.5" />
                <span>{config.timeEstimate}</span>
              </div>
            )}

            {isActionable && (
              <Button 
                onClick={config.buttonAction}
                className={cn(
                  "rounded-full font-inter group",
                  config.accentColor === "amber" && "bg-amber-600 hover:bg-amber-700 text-white"
                )}
              >
                {config.buttonText}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NextActionCard;
