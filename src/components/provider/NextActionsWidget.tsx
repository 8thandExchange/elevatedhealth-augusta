import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Loader2, 
  Package, 
  Stethoscope, 
  TestTube, 
  Pill, 
  CheckCircle, 
  Scale,
  Clock,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PatientAction {
  patientId: string;
  patientName: string;
  patientEmail: string | null;
  onboardingStatus: string;
  primaryProgram: string | null;
  actionLabel: string;
  actionIcon: React.ReactNode;
  urgency: "high" | "medium" | "low";
  daysSinceUpdate: number;
}

interface NextActionsWidgetProps {
  onPatientClick?: (patientId: string) => void;
  onRefresh?: () => void;
}

// Map onboarding status to next action
function getNextAction(
  status: string | null, 
  primaryProgram: string | null
): { label: string; icon: React.ReactNode; urgency: "high" | "medium" | "low" } {
  const isWeightLoss = primaryProgram === "weight_loss" || primaryProgram === "glp1";
  
  const actionMap: Record<string, { label: string; icon: React.ReactNode; urgency: "high" | "medium" | "low" }> = {
    // Consultation phase
    pending_invite: { label: "Send invite", icon: <Stethoscope className="w-4 h-4" />, urgency: "medium" },
    account_created: { label: "Complete consult", icon: <Stethoscope className="w-4 h-4" />, urgency: "medium" },
    consultation_paid: { label: "Complete consult", icon: <Stethoscope className="w-4 h-4" />, urgency: "high" },
    consultation_scheduled: { label: "Consult scheduled", icon: <Clock className="w-4 h-4" />, urgency: "low" },
    consultation_complete: { 
      label: isWeightLoss ? "Medical clearance" : "Send $349 kit", 
      icon: isWeightLoss ? <Scale className="w-4 h-4" /> : <Package className="w-4 h-4" />, 
      urgency: "high" 
    },
    intake_complete: { 
      label: isWeightLoss ? "Medical clearance" : "Send $349 kit", 
      icon: isWeightLoss ? <Scale className="w-4 h-4" /> : <Package className="w-4 h-4" />, 
      urgency: "high" 
    },
    
    // Weight loss path
    awaiting_medical_clearance: { label: "Approve GLP-1", icon: <Scale className="w-4 h-4" />, urgency: "high" },
    glp1_approved: { label: "Send Rx", icon: <Pill className="w-4 h-4" />, urgency: "high" },
    medical_clearance_complete: { label: "Send Rx", icon: <Pill className="w-4 h-4" />, urgency: "high" },
    glp1_rx_sent: { label: "Rx sent - await activation", icon: <CheckCircle className="w-4 h-4" />, urgency: "low" },
    
    // Hormone path
    kit_link_sent: { label: "Await payment", icon: <Package className="w-4 h-4" />, urgency: "low" },
    labs_paid: { label: "Ship kit", icon: <Package className="w-4 h-4" />, urgency: "high" },
    kit_shipped: { label: "Await sample return", icon: <TestTube className="w-4 h-4" />, urgency: "low" },
    sample_received: { label: "Await lab results", icon: <TestTube className="w-4 h-4" />, urgency: "low" },
    results_ready: { label: "Review labs", icon: <TestTube className="w-4 h-4" />, urgency: "high" },
    labs_reviewed: { label: "Approve protocol", icon: <Pill className="w-4 h-4" />, urgency: "high" },
    protocol_approved: { label: "Send Rx", icon: <Pill className="w-4 h-4" />, urgency: "high" },
    pending_pharmacy_order: { label: "Pharmacy order pending", icon: <Pill className="w-4 h-4" />, urgency: "medium" },
    rx_sent: { label: "Await activation", icon: <CheckCircle className="w-4 h-4" />, urgency: "low" },
    
    // Active
    treatment_active: { label: "Active - monitor", icon: <CheckCircle className="w-4 h-4" />, urgency: "low" },
  };
  
  return actionMap[status || ''] || { 
    label: "Review patient", 
    icon: <AlertCircle className="w-4 h-4" />, 
    urgency: "medium" 
  };
}

function getDaysSince(dateString: string | null): number {
  if (!dateString) return 0;
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function NextActionsWidget({ onPatientClick, onRefresh }: NextActionsWidgetProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [actions, setActions] = useState<PatientAction[]>([]);

  useEffect(() => {
    loadPendingActions();
  }, []);

  const loadPendingActions = async () => {
    setIsLoading(true);
    try {
      // Get patients with pending actions (not in final states)
      const { data: patients, error } = await supabase
        .from("patients")
        .select("id, full_name, email, onboarding_status, treatment_request, updated_at")
        .not("onboarding_status", "eq", "treatment_active")
        .eq("is_archived", false)
        .order("updated_at", { ascending: true })
        .limit(20);

      if (error) throw error;

      const patientActions: PatientAction[] = (patients || [])
        .filter(p => p.onboarding_status) // Only patients with a status
        .map(patient => {
          const action = getNextAction(patient.onboarding_status, patient.treatment_request);
          const daysSinceUpdate = getDaysSince(patient.updated_at);
          
          return {
            patientId: patient.id,
            patientName: patient.full_name,
            patientEmail: patient.email,
            onboardingStatus: patient.onboarding_status || "",
            primaryProgram: patient.treatment_request,
            actionLabel: action.label,
            actionIcon: action.icon,
            urgency: action.urgency,
            daysSinceUpdate,
          };
        })
        // Sort by urgency (high first) then by days waiting
        .sort((a, b) => {
          const urgencyOrder = { high: 0, medium: 1, low: 2 };
          if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
            return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
          }
          return b.daysSinceUpdate - a.daysSinceUpdate;
        });

      setActions(patientActions);
    } catch (error) {
      console.error("Error loading pending actions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const urgencyStyles = {
    high: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
    medium: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
    low: "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800",
  };

  const highPriorityCount = actions.filter(a => a.urgency === "high").length;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Next Actions
            {highPriorityCount > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {highPriorityCount} urgent
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              loadPendingActions();
              onRefresh?.();
            }}
            className="h-7 text-xs"
          >
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : actions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            All caught up! No pending actions.
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {actions.map((action) => (
                <div
                  key={action.patientId}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onPatientClick?.(action.patientId)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-full ${urgencyStyles[action.urgency]}`}>
                      {action.actionIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{action.patientName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {action.actionLabel}
                        {action.daysSinceUpdate > 0 && (
                          <span className="ml-2 opacity-70">
                            · {action.daysSinceUpdate}d ago
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        action.primaryProgram === "weight_loss" || action.primaryProgram === "glp1"
                          ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400"
                          : "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400"
                      }`}
                    >
                      {action.primaryProgram === "weight_loss" || action.primaryProgram === "glp1" 
                        ? "GLP-1" 
                        : "HRT"}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export default NextActionsWidget;
