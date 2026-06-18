import { Stethoscope, TestTube, Sparkles, Clock, Check, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PatientStatusCardProps {
  patientId: string;
  patientName: string;
  patientEmail: string | null;
  onboardingStatus: string | null;
  onMarkConsultComplete?: () => void;
  onMarkLabsReviewed?: () => void;
  onApproveProtocol?: () => void;
  isLoading?: boolean;
}

export const PatientStatusCard = ({
  patientId,
  patientName,
  patientEmail,
  onboardingStatus,
  onMarkConsultComplete,
  onMarkLabsReviewed,
  onApproveProtocol,
  isLoading = false,
}: PatientStatusCardProps) => {
  const status = onboardingStatus || "pending_invite";

  const getStatusConfig = () => {
    switch (status) {
      case "pending_invite":
      case "account_created":
        return {
          step: 1,
          label: "Awaiting Consultation",
          description: "Patient has not yet paid for or scheduled their strategy session.",
          icon: <Clock className="w-5 h-5" />,
          color: "slate",
          action: null,
        };

      case "consultation_paid":
        return {
          step: 1,
          label: "Consultation Paid",
          description: "Patient has paid but needs to schedule their appointment.",
          icon: <Stethoscope className="w-5 h-5" />,
          color: "amber",
          action: null,
        };

      case "consultation_scheduled":
        return {
          step: 1,
          label: "Session Scheduled",
          description: "Upcoming strategy session. After completion, mark as complete.",
          icon: <Stethoscope className="w-5 h-5" />,
          color: "blue",
          action: {
            label: "Mark Session Complete",
            onClick: onMarkConsultComplete,
            variant: "default" as const,
          },
        };

      case "consultation_complete":
      case "intake_complete":
        return {
          step: 1,
          label: "Session Complete",
          description: "Patient has completed their consult. Awaiting next clinical action.",
          icon: <Check className="w-5 h-5" />,
          color: "green",
          action: null,
        };

      case "labs_paid":
        return {
          step: 2,
          label: "Labs Paid - Ship Kit",
          description: "Patient has paid for labs. Ship their kit and update tracking.",
          icon: <TestTube className="w-5 h-5" />,
          color: "amber",
          action: null, // Kit shipping handled via KitStatusAdmin
        };

      case "kit_shipped":
        return {
          step: 2,
          label: "Kit Shipped",
          description: "Waiting for patient to complete and return sample.",
          icon: <TestTube className="w-5 h-5" />,
          color: "blue",
          action: null,
        };

      case "sample_received":
        return {
          step: 2,
          label: "Sample Received",
          description: "Lab is processing. Awaiting results.",
          icon: <TestTube className="w-5 h-5" />,
          color: "blue",
          action: null,
        };

      case "results_ready":
        return {
          step: 2,
          label: "Results Ready",
          description: "Review lab results and create treatment protocol.",
          icon: <TestTube className="w-5 h-5" />,
          color: "amber",
          action: {
            label: "Mark Labs Reviewed",
            onClick: onMarkLabsReviewed,
            variant: "default" as const,
          },
        };

      case "labs_reviewed":
        return {
          step: 2,
          label: "Labs Reviewed",
          description: "Approve treatment protocol to allow membership activation.",
          icon: <Check className="w-5 h-5" />,
          color: "green",
          action: {
            label: "Approve Protocol",
            onClick: onApproveProtocol,
            variant: "default" as const,
          },
        };

      case "protocol_approved":
        return {
          step: 3,
          label: "Protocol Approved",
          description: "Patient can now activate their membership.",
          icon: <Sparkles className="w-5 h-5" />,
          color: "amber",
          action: null,
        };

      case "pending_pharmacy_order":
        return {
          step: 3,
          label: "Pending Pharmacy",
          description: "Place pharmacy order via Custom Pharmacy fax.",
          icon: <AlertTriangle className="w-5 h-5" />,
          color: "amber",
          action: null, // FCC Portal handled separately
        };

      case "treatment_active":
        return {
          step: 3,
          label: "Treatment Active",
          description: "Patient is on active treatment protocol.",
          icon: <Check className="w-5 h-5" />,
          color: "green",
          action: null,
        };

      default:
        return {
          step: 1,
          label: status,
          description: "Unknown status",
          icon: <Clock className="w-5 h-5" />,
          color: "slate",
          action: null,
        };
    }
  };

  const config = getStatusConfig();

  const colorClasses = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    green: "bg-green-100 text-green-700 border-green-200",
  };

  return (
    <Card className="border border-border/50 rounded-xl">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
              colorClasses[config.color as keyof typeof colorClasses]
            )}>
              {config.icon}
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  Step {config.step}
                </Badge>
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  colorClasses[config.color as keyof typeof colorClasses]
                )}>
                  {config.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {config.description}
              </p>
            </div>
          </div>

          {config.action && (
            <Button
              size="sm"
              variant={config.action.variant}
              onClick={config.action.onClick}
              disabled={isLoading}
              className="flex-shrink-0"
            >
              {config.action.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientStatusCard;
