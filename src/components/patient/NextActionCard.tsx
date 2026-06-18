import { ArrowRight, Calendar, CreditCard, Mail, TestTube, Sparkles, Clock, CheckCircle, Pill, Stethoscope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NextActionCardProps {
  onboardingStatus: string | null;
  kitStatus?: string | null;
  hasAuthorizedOrder: boolean;
  primaryProgram?: string | null;
  onBookConsultation?: () => void;
  onPayForLabs?: () => void;
  onActivateMembership?: () => void;
}

export const NextActionCard = ({
  onboardingStatus,
  kitStatus,
  hasAuthorizedOrder,
  primaryProgram,
  onBookConsultation,
  onPayForLabs,
  onActivateMembership,
}: NextActionCardProps) => {
  const status = onboardingStatus || "pending_invite";
  const isWeightLoss = primaryProgram === "weight_loss" || primaryProgram === "glp1";

  // Define action based on current status
  const getActionConfig = () => {
    // ===== PHASE 1: NEW STATUSES FOR INVITE FLOW =====
    if (status === "invited" || status === "pending_invite") {
      return {
        icon: <Mail className="w-6 h-6" />,
        title: "Complete Your Payment",
        description: "Check your email for a payment link to begin your journey with Elevated Health Augusta.",
        buttonText: null,
        buttonAction: null,
        timeEstimate: "Check your inbox",
        accentColor: "amber",
      };
    }

    if (status === "kit_link_sent" || status === "labs_paid") {
      return {
        icon: <TestTube className="w-6 h-6" />,
        title: "Lab Work Next",
        description: "Your clinic team will coordinate your in-office LabCorp blood draw. Watch for requisition details by email.",
        buttonText: null,
        buttonAction: null,
        timeEstimate: "Typically scheduled at your visit",
        accentColor: "amber",
      };
    }

    // ===== WEIGHT LOSS / GLP-1 SPECIFIC STATUSES =====
    if (isWeightLoss) {
      if (status === "awaiting_medical_clearance" || status === "intake_complete" || status === "consultation_complete") {
        return {
          icon: <Stethoscope className="w-6 h-6" />,
          title: "Medical Review in Progress",
          description: "Your provider is reviewing your information to ensure GLP-1 therapy is right for you.",
          buttonText: null,
          buttonAction: null,
          timeEstimate: "Typically within 24-48 hours",
          accentColor: "blue",
        };
      }

      if (status === "glp1_approved" || status === "medical_clearance_complete") {
        return {
          icon: <CheckCircle className="w-6 h-6" />,
          title: "GLP-1 Approved!",
          description: "Great news! You've been approved for GLP-1 therapy. Your prescription is being sent to the pharmacy.",
          buttonText: null,
          buttonAction: null,
          timeEstimate: "Rx ships in 3-5 business days",
          accentColor: "green",
        };
      }

      if (status === "glp1_rx_sent" || status === "rx_sent") {
        return {
          icon: <Pill className="w-6 h-6" />,
          title: "Prescription Sent!",
          description: "Your GLP-1 medication has been sent to the pharmacy. Watch for shipping updates.",
          buttonText: null,
          buttonAction: null,
          timeEstimate: "Arrives in 3-5 business days",
          accentColor: "green",
        };
      }
    }

    // ===== GENERAL CONSULTATION FLOW =====
    if (status === "account_created") {
      return {
        icon: <Calendar className="w-6 h-6" />,
        title: "Continue enrollment",
        description: "Complete screening and consents, then pay the $79 wellness assessment.",
        buttonText: "Continue",
        buttonAction: () => { window.location.href = "/consult/start"; },
        timeEstimate: "About 5 minutes",
        accentColor: "amber",
      };
    }

    if (status === "consultation_paid" || status === "gfe_pending") {
      return {
        icon: <Calendar className="w-6 h-6" />,
        title: "Complete your Good Faith Exam",
        description: "Finish the remote Qualiphy exam we sent to your email and phone. Scheduling opens after clearance.",
        buttonText: null,
        buttonAction: null,
        timeEstimate: "Usually 10–15 minutes",
        accentColor: "amber",
      };
    }

    if (status === "gfe_cleared") {
      return {
        icon: <Calendar className="w-6 h-6" />,
        title: "Schedule Your Session",
        description: "Your medical clearance is complete. Pick a time for your in-person wellness assessment.",
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

    // ===== HORMONE THERAPY — LabCorp in-office =====
    if ((status === "consultation_complete" || status === "intake_complete") && !isWeightLoss) {
      return {
        icon: <TestTube className="w-6 h-6" />,
        title: "Lab Work Scheduled",
        description: "Your provider will order in-office LabCorp labs. Our team will contact you with draw instructions.",
        buttonText: null,
        buttonAction: null,
        timeEstimate: "Usually at your next clinic visit",
        accentColor: "amber",
      };
    }

    if (status === "awaiting_blood_work" || status === "kit_shipped") {
      return {
        icon: <TestTube className="w-6 h-6" />,
        title: "Awaiting Lab Draw",
        description: "Visit LabCorp or our coordinated draw site when instructed. Fasting may be required for some panels.",
        buttonText: null,
        buttonAction: null,
        timeEstimate: "Bring your requisition if provided",
        accentColor: "blue",
      };
    }

    if (status === "labs_in_progress" || status === "sample_received") {
      return {
        icon: <Clock className="w-6 h-6" />,
        title: "Labs In Progress",
        description: "Your blood work is being processed at the lab. We'll notify you when results are ready for review.",
        buttonText: null,
        buttonAction: null,
        timeEstimate: "Typically 3–7 business days",
        accentColor: "blue",
      };
    }

    if (status === "results_ready" || status === "labs_reviewed") {
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

    // ===== TREATMENT ACTIVATION =====
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

    if (status === "rx_sent" || status === "pending_pharmacy_order") {
      return {
        icon: <Pill className="w-6 h-6" />,
        title: "Prescription on the Way",
        description: "Your personalized medication is being prepared by our pharmacy partner.",
        buttonText: null,
        buttonAction: null,
        timeEstimate: "Ships in 3-5 business days",
        accentColor: "green",
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

    // Default fallback - encourage booking consultation
    return {
      icon: <Calendar className="w-6 h-6" />,
      title: "Start Your Wellness Journey",
      description: "Book a consultation to discuss your health goals and discover how we can help.",
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
