import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, FlaskConical, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AILabPanelCardProps {
  patientId: string;
  existingRecommendation?: any;
  onApprove?: (recommendation: any) => void;
}

interface Test {
  code: string;
  name: string;
  reason: string;
}
interface ICD10 {
  code: string;
  description: string;
}
interface Recommendation {
  panel_name: string;
  rationale: string;
  urgency: "routine" | "soon" | "urgent";
  fasting_required: boolean;
  icd10_codes: ICD10[];
  tests: Test[];
  generated_at?: string;
}

const urgencyColor: Record<string, string> = {
  routine: "bg-emerald-100 text-emerald-800 border-emerald-300",
  soon: "bg-amber-100 text-amber-800 border-amber-300",
  urgent: "bg-rose-100 text-rose-800 border-rose-300",
};

export const AILabPanelCard = ({
  patientId,
  existingRecommendation,
  onApprove,
}: AILabPanelCardProps) => {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(
    existingRecommendation ?? null,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRecommendation(existingRecommendation ?? null);
  }, [existingRecommendation, patientId]);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "recommend-lab-panel",
        { body: { patient_id: patientId } },
      );
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      setRecommendation(data.recommendation);
      toast.success("AI lab panel ready");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to generate panel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            AI-Suggested Lab Panel
          </CardTitle>
          {recommendation && (
            <Badge
              variant="outline"
              className={urgencyColor[recommendation.urgency]}
            >
              {recommendation.urgency.toUpperCase()}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!recommendation && (
          <div className="text-center py-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              Generate an AI-recommended LabCorp panel based on this patient's
              gender, age, symptoms, protocol, and active medications.
            </p>
            <Button onClick={generate} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing patient…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Suggest Lab Panel
                </>
              )}
            </Button>
          </div>
        )}

        {recommendation && (
          <>
            <div>
              <p className="font-semibold text-sm">{recommendation.panel_name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {recommendation.rationale}
              </p>
            </div>

            <div className="bg-background rounded-lg p-3 border space-y-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Tests ({recommendation.tests.length})
              </p>
              <div className="space-y-1.5">
                {recommendation.tests.map((t) => (
                  <div
                    key={t.code + t.name}
                    className="flex items-start justify-between gap-2 text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span className="font-medium">{t.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground ml-5 mt-0.5">
                        {t.reason}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="font-mono text-xs flex-shrink-0"
                    >
                      {t.code}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-background rounded-lg p-3 border">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                ICD-10 Diagnostic Codes
              </p>
              <div className="flex flex-wrap gap-1.5">
                {recommendation.icd10_codes.map((c) => (
                  <Badge key={c.code} variant="outline" className="text-xs">
                    <span className="font-mono">{c.code}</span>
                    <span className="ml-1.5 text-muted-foreground">
                      {c.description}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>

            {recommendation.fasting_required && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                ⚠ Patient should fast 8–12 hours before draw.
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generate}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Regenerate
              </Button>
              {onApprove && (
                <Button
                  size="sm"
                  onClick={() => onApprove(recommendation)}
                  className="flex-1"
                >
                  Approve & Order
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AILabPanelCard;
