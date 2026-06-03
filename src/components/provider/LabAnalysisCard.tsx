import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Beaker, Plus, TrendingUp, Pencil } from "lucide-react";
import LabGauge from "./LabGauge";
import NewLabResultModal from "./NewLabResultModal";
import { LabInterpretationPanel } from "./LabInterpretationPanel";
import { MedicationRecommendation } from "@/lib/medicationMapping";

interface LabResult {
  id: string;
  collection_date: string;
  estradiol_e2: number | null;
  progesterone_pg: number | null;
  testosterone_t: number | null;
  cortisol_morning: number | null;
  correlation_alert: string | null;
  dhea_s: number | null;
  pg_e2_ratio: number | null;
  a1c: number | null;
  fasting_insulin: number | null;
  vitamin_d: number | null;
  hematocrit: number | null;
  psa: number | null;
  alt: number | null;
  ast: number | null;
  lab_source: string | null;
  pdf_url: string | null;
  parsed_from_pdf: boolean | null;
}

interface LabAnalysisCardProps {
  patientId: string;
  patientName: string;
  patientGender?: string;
  primaryProgram?: string | null;
  latestSymptomScore?: {
    estrogen: number;
    progesterone: number;
    androgen: number;
    cortisol: number;
  };
  onApplyToRx?: (medications: MedicationRecommendation[]) => void;
}

const LabAnalysisCard = ({ patientId, patientName, patientGender = 'female', primaryProgram, latestSymptomScore, onApplyToRx }: LabAnalysisCardProps) => {
  const [latestLab, setLatestLab] = useState<LabResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<LabResult | null>(null);

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
      setLatestLab(data);
    } catch (error) {
      console.error("Error loading lab results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLatestLab();
  }, [patientId]);

  return (
    <>
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-cormorant">
              <Beaker className="w-5 h-5 text-primary" />
              Lab Analysis
            </CardTitle>
            <div className="flex gap-2">
              {latestLab && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    setEditingLab(latestLab);
                    setIsModalOpen(true);
                  }}
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => {
                setEditingLab(null);
                setIsModalOpen(true);
              }}>
                <Plus className="w-4 h-4 mr-1" />
                Add Labs
              </Button>
            </div>
          </div>
          {latestLab && (
            <p className="text-xs text-muted-foreground">
              Last collected: {new Date(latestLab.collection_date).toLocaleDateString()}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="h-32 flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
          ) : !latestLab ? (
            <div className="text-center py-8 text-muted-foreground">
              <Beaker className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No lab results yet</p>
              <p className="text-xs mt-1">Click &quot;Add Labs&quot; to enter LabCorp or legacy PDF results</p>
            </div>
          ) : (
            <>
              {/* Correlation Alert */}
              {latestLab.correlation_alert && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                        Correlation Alert
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-300 mt-0.5">
                        {latestLab.correlation_alert}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Hormone Gauges */}
              <div className="grid gap-3">
                <LabGauge
                  label="Estradiol (E2)"
                  value={latestLab.estradiol_e2}
                  unit="pg/mL"
                  min={0}
                  max={10}
                  optimalMin={2}
                  optimalMax={4}
                />
                <LabGauge
                  label="Testosterone"
                  value={latestLab.testosterone_t}
                  unit="ng/dL"
                  min={0}
                  max={patientGender?.toLowerCase() === "male" ? 1200 : 80}
                  optimalMin={patientGender?.toLowerCase() === "male" ? 450 : 20}
                  optimalMax={patientGender?.toLowerCase() === "male" ? 900 : 60}
                />
                <LabGauge
                  label="Progesterone"
                  value={latestLab.progesterone_pg}
                  unit="pg/mL"
                  min={0}
                  max={500}
                  optimalMin={100}
                  optimalMax={300}
                />
                {latestLab.cortisol_morning !== null && (
                  <LabGauge
                    label="Cortisol (Morning)"
                    value={latestLab.cortisol_morning}
                    unit="μg/dL"
                    min={0}
                    max={25}
                    optimalMin={10}
                    optimalMax={18}
                  />
                )}
                {(latestLab.a1c != null || latestLab.fasting_insulin != null) && (
                  <>
                    {latestLab.a1c != null && (
                      <LabGauge
                        label="HbA1c"
                        value={latestLab.a1c}
                        unit="%"
                        min={4}
                        max={10}
                        optimalMin={4.5}
                        optimalMax={5.6}
                      />
                    )}
                    {latestLab.fasting_insulin != null && (
                      <LabGauge
                        label="Fasting Insulin"
                        value={latestLab.fasting_insulin}
                        unit="µIU/mL"
                        min={0}
                        max={30}
                        optimalMin={2}
                        optimalMax={12}
                      />
                    )}
                  </>
                )}
                {patientGender?.toLowerCase() === "male" && latestLab.psa != null && (
                  <LabGauge
                    label="PSA"
                    value={latestLab.psa}
                    unit="ng/mL"
                    min={0}
                    max={10}
                    optimalMin={0}
                    optimalMax={4}
                  />
                )}
              </div>

              <LabInterpretationPanel
                labRow={latestLab as Record<string, unknown> & { id: string }}
                patientGender={patientGender}
                primaryProgram={primaryProgram}
                onApplyToRx={onApplyToRx}
                onSaved={loadLatestLab}
              />
            </>
          )}
        </CardContent>
      </Card>

      <NewLabResultModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLab(null);
        }}
        patientId={patientId}
        patientName={patientName}
        patientGender={patientGender}
        primaryProgram={primaryProgram}
        latestSymptomScore={latestSymptomScore}
        onSaved={loadLatestLab}
        onApplyToRx={onApplyToRx}
        existingLab={editingLab}
      />
    </>
  );
};

export default LabAnalysisCard;
