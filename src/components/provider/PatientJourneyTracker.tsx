import { Check, Clock, TestTube, Sparkles, Pill, Stethoscope, Activity, UserPlus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PatientJourneyTrackerProps {
  onboardingStatus: string | null;
  primaryProgram: string | null;
  className?: string;
}

interface JourneyStep {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
}

// Hormone therapy journey (LabCorp in-office)
const HORMONE_STEPS: JourneyStep[] = [
  { id: 'consultation', label: 'Consultation', shortLabel: 'Consult', icon: <Stethoscope className="h-4 w-4" /> },
  { id: 'lab_ordered', label: 'Lab Ordered', shortLabel: 'Labs', icon: <TestTube className="h-4 w-4" /> },
  { id: 'draw_complete', label: 'Draw Complete', shortLabel: 'Draw', icon: <Activity className="h-4 w-4" /> },
  { id: 'labs_ready', label: 'Results Ready', shortLabel: 'Results', icon: <TestTube className="h-4 w-4" /> },
  { id: 'protocol_approved', label: 'Protocol Approved', shortLabel: 'Protocol', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'rx_sent', label: 'Rx Sent', shortLabel: 'Rx', icon: <Pill className="h-4 w-4" /> },
  { id: 'active', label: 'Active Treatment', shortLabel: 'Active', icon: <Check className="h-4 w-4" /> },
];

// Weight loss journey (no labs required)
const WEIGHT_LOSS_STEPS: JourneyStep[] = [
  { id: 'consultation', label: 'Consultation', shortLabel: 'Consult', icon: <Stethoscope className="h-4 w-4" /> },
  { id: 'clearance', label: 'Medical Clearance', shortLabel: 'Clearance', icon: <Check className="h-4 w-4" /> },
  { id: 'rx_sent', label: 'Rx Sent', shortLabel: 'Rx', icon: <Pill className="h-4 w-4" /> },
  { id: 'active', label: 'Active Treatment', shortLabel: 'Active', icon: <Check className="h-4 w-4" /> },
];

// Statuses that indicate a patient was migrated/added directly without full onboarding
const MIGRATED_STATUSES = ['treatment_active', 'existing_patient'];

// Map onboarding_status to step index for Hormone journey
function getHormoneStepIndex(status: string | null): number {
  const statusMap: Record<string, number> = {
    'pending_invite': 0,
    'account_created': 0,
    'consultation_paid': 0,
    'consultation_scheduled': 0,
    'consultation_complete': 0,
    'consultation_completed': 0,
    'intake_complete': 0,
    'kit_link_sent': 1,
    'labs_paid': 1,
    'awaiting_blood_work': 1,
    'kit_shipped': 2,
    'labs_in_progress': 2,
    'sample_received': 2,
    'results_ready': 3,
    'labs_reviewed': 4,
    'protocol_approved': 4,
    'pending_pharmacy_order': 5,
    'rx_sent': 5,
    'treatment_active': 6,
    'existing_patient': 6,
  };
  return statusMap[status || ''] ?? 0;
}

// Map onboarding_status to step index for Weight Loss journey
function getWeightLossStepIndex(status: string | null): number {
  const statusMap: Record<string, number> = {
    'pending_invite': 0,
    'account_created': 0,
    'consultation_paid': 0,
    'consultation_scheduled': 0,
    'consultation_complete': 0,
    'consultation_completed': 0,
    'intake_complete': 0,
    'awaiting_medical_clearance': 1,
    'glp1_approved': 1,
    'medical_clearance_complete': 1,
    'pending_pharmacy_order': 2,
    'glp1_rx_sent': 2,
    'rx_sent': 2,
    'treatment_active': 3,
    'existing_patient': 3,
  };
  return statusMap[status || ''] ?? 0;
}

function getNextAction(status: string | null, primaryProgram: string | null): string | null {
  const isWeightLoss = primaryProgram === 'weight_loss' || primaryProgram === 'glp1';
  
  // No next action for migrated/existing patients on treatment
  if (status === 'treatment_active' || status === 'existing_patient') {
    return null;
  }
  
  const actionMap: Record<string, string> = isWeightLoss ? {
    'consultation_complete': 'Medical clearance review',
    'intake_complete': 'Medical clearance review',
    'awaiting_medical_clearance': 'Approve for GLP-1',
    'glp1_approved': 'Send Rx to pharmacy',
    'medical_clearance_complete': 'Send Rx to pharmacy',
  } : {
    'consultation_complete': 'Order LabCorp panel',
    'intake_complete': 'Order LabCorp panel',
    'labs_paid': 'Schedule LabCorp draw',
    'awaiting_blood_work': 'Patient awaiting draw',
    'kit_shipped': 'Confirm draw completed',
    'labs_in_progress': 'Await LabCorp results',
    'sample_received': 'Await LabCorp results',
    'results_ready': 'Review labs & create protocol',
    'labs_reviewed': 'Approve protocol',
    'protocol_approved': 'Send Rx to pharmacy',
    'pending_pharmacy_order': 'Pharmacy order pending',
  };
  
  return actionMap[status || ''] || null;
}

// Check if this is a migrated patient (added directly without going through full onboarding)
function isMigratedPatient(status: string | null): boolean {
  return MIGRATED_STATUSES.includes(status || '');
}

export function PatientJourneyTracker({ onboardingStatus, primaryProgram, className }: PatientJourneyTrackerProps) {
  const isWeightLoss = primaryProgram === 'weight_loss' || primaryProgram === 'glp1';
  const steps = isWeightLoss ? WEIGHT_LOSS_STEPS : HORMONE_STEPS;
  const currentStepIndex = isWeightLoss 
    ? getWeightLossStepIndex(onboardingStatus) 
    : getHormoneStepIndex(onboardingStatus);
  const nextAction = getNextAction(onboardingStatus, primaryProgram);
  const isMigrated = isMigratedPatient(onboardingStatus);
  
  // For migrated patients at final step, show only the Active step as current
  const isAtFinalStep = currentStepIndex === steps.length - 1;
  
  return (
    <div className={cn("space-y-3", className)}>
      {/* Migrated Patient Badge */}
      {isMigrated && isAtFinalStep && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="gap-1.5 text-xs font-normal border-amber-300 text-amber-700 bg-amber-50">
            <UserPlus className="w-3 h-3" />
            Existing patient — added directly to active treatment
          </Badge>
        </div>
      )}
      
      {/* Journey Stepper */}
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const isComplete = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isFuture = idx > currentStepIndex;
          
          // For migrated patients, prior steps are "skipped" not "completed"
          const isSkipped = isMigrated && isAtFinalStep && idx < currentStepIndex;
          
          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                    // Skipped steps for migrated patients - gray/dashed style
                    isSkipped && "bg-muted/50 border-dashed border-muted-foreground/30 text-muted-foreground/50",
                    // Completed steps (not skipped)
                    isComplete && !isSkipped && "bg-green-500 border-green-500 text-white",
                    // Current step
                    isCurrent && "bg-primary border-primary text-primary-foreground",
                    // Future steps
                    isFuture && "bg-muted border-border text-muted-foreground"
                  )}
                >
                  {isSkipped ? (
                    <Minus className="h-3 w-3" />
                  ) : isComplete ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span 
                  className={cn(
                    "text-xs mt-1 text-center whitespace-nowrap",
                    isSkipped && "text-muted-foreground/50",
                    isCurrent && "font-semibold text-foreground",
                    isFuture && "text-muted-foreground"
                  )}
                >
                  {step.shortLabel}
                </span>
              </div>
              
              {/* Connector Line */}
              {idx < steps.length - 1 && (
                <div 
                  className={cn(
                    "flex-1 h-0.5 mx-1 mt-[-16px]",
                    isSkipped || (isMigrated && isAtFinalStep && idx < currentStepIndex - 1) 
                      ? "bg-muted-foreground/20 border-dashed" 
                      : idx < currentStepIndex 
                        ? "bg-green-500" 
                        : "bg-border"
                  )} 
                />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Next Action Badge */}
      {nextAction && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
          <Clock className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-800">Next: {nextAction}</span>
        </div>
      )}
    </div>
  );
}

export default PatientJourneyTracker;
