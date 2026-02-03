import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  AlertTriangle,
  Brain,
  Pill,
  Activity,
  Heart,
  Zap,
  Sparkles
} from "lucide-react";
import { MedicationRecommendation } from "@/lib/medicationMapping";

interface LabResult {
  id: string;
  collection_date: string;
  estradiol_e2: number | null;
  progesterone_pg: number | null;
  testosterone_t: number | null;
  cortisol_morning: number | null;
  clinical_story: string | null;
  treatment_plan: any;
  correlation_alert: string | null;
}

interface HealthReportPreviewProps {
  patientId: string;
  patientName: string;
  patientGender?: string;
  onApplyMedications?: (medications: MedicationRecommendation[]) => void;
}

const HealthReportPreview = ({ patientId, patientName, patientGender = 'female', onApplyMedications }: HealthReportPreviewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [labResult, setLabResult] = useState<LabResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLatestLab();
  }, [patientId]);

  const loadLatestLab = async () => {
    try {
      const { data, error } = await supabase
        .from("lab_results")
        .select("*")
        .eq("patient_id", patientId)
        .order("collection_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setLabResult(data);
    } catch (error) {
      console.error("Error loading lab results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-green-500/30 bg-green-50/50 dark:bg-green-950/20">
        <CardContent className="pt-4">
          <div className="animate-pulse flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-300 dark:bg-green-700" />
            <div className="h-4 bg-green-200 dark:bg-green-800 rounded w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const treatmentPlan = labResult?.treatment_plan;
  const findings = treatmentPlan?.findings || [];
  const protocols = treatmentPlan?.protocols || [];
  const medications = treatmentPlan?.medications || [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  return (
    <Card className="border-green-500/30 bg-green-50/50 dark:bg-green-950/20">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-green-100/50 dark:hover:bg-green-900/20 transition-colors pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base font-medium text-green-700 dark:text-green-400">
                    Labs Reviewed - Health Report Ready
                  </CardTitle>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    {labResult?.collection_date 
                      ? `Lab date: ${new Date(labResult.collection_date).toLocaleDateString()}`
                      : "View clinical analysis and recommendations"
                    }
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-green-600">
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {/* Lab Values Summary */}
            {labResult && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-card rounded-lg p-3 border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-3 h-3 text-pink-500" />
                    <span className="text-xs text-muted-foreground">Estradiol</span>
                  </div>
                  <p className="font-semibold text-foreground">
                    {labResult.estradiol_e2 ?? "—"} <span className="text-xs font-normal text-muted-foreground">pg/mL</span>
                  </p>
                </div>
                <div className="bg-white dark:bg-card rounded-lg p-3 border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-3 h-3 text-purple-500" />
                    <span className="text-xs text-muted-foreground">Progesterone</span>
                  </div>
                  <p className="font-semibold text-foreground">
                    {labResult.progesterone_pg ?? "—"} <span className="text-xs font-normal text-muted-foreground">pg/mL</span>
                  </p>
                </div>
                <div className="bg-white dark:bg-card rounded-lg p-3 border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-3 h-3 text-blue-500" />
                    <span className="text-xs text-muted-foreground">Testosterone</span>
                  </div>
                  <p className="font-semibold text-foreground">
                    {labResult.testosterone_t ?? "—"} <span className="text-xs font-normal text-muted-foreground">pg/mL</span>
                  </p>
                </div>
                <div className="bg-white dark:bg-card rounded-lg p-3 border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-3 h-3 text-orange-500" />
                    <span className="text-xs text-muted-foreground">Cortisol AM</span>
                  </div>
                  <p className="font-semibold text-foreground">
                    {labResult.cortisol_morning ?? "—"} <span className="text-xs font-normal text-muted-foreground">ng/dL</span>
                  </p>
                </div>
              </div>
            )}

            {/* Clinical Story */}
            {labResult?.clinical_story && (
              <div className="bg-white dark:bg-card rounded-lg p-4 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <h4 className="font-medium text-sm">Clinical Story</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {labResult.clinical_story}
                </p>
              </div>
            )}

            {/* Correlation Alert */}
            {labResult?.correlation_alert && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {labResult.correlation_alert}
                  </p>
                </div>
              </div>
            )}

            {/* Findings */}
            {findings.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Clinical Findings
                </h4>
                <div className="space-y-2">
                  {findings.map((finding: any, i: number) => (
                    <div key={i} className="bg-white dark:bg-card rounded-lg p-3 border border-border/50">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{finding.pattern}</span>
                            <Badge className={`text-xs ${getPriorityColor(finding.priority)}`}>
                              {finding.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{finding.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medication Recommendations */}
            {medications.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Pill className="w-4 h-4" />
                  Medication Recommendations
                </h4>
                <div className="space-y-2">
                  {medications.map((med: any, i: number) => (
                    <div key={i} className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <p className="font-medium text-sm text-foreground">{med.name}</p>
                      <p className="text-xs text-muted-foreground">{med.strength}</p>
                      <p className="text-xs text-primary mt-1">{med.rationale}</p>
                    </div>
                  ))}
                </div>
                
                {/* Apply to Pharmacy Order Button */}
                {onApplyMedications && (
                  <Button 
                    onClick={() => onApplyMedications(medications as MedicationRecommendation[])}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Apply Recommended Medications
                  </Button>
                )}
              </div>
            )}

            {/* Empty state */}
            {!labResult?.clinical_story && findings.length === 0 && medications.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">No clinical analysis available yet.</p>
                <p className="text-xs">Add lab results with the "Add Labs" button above to generate analysis.</p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default HealthReportPreview;
