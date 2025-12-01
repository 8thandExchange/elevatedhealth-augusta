import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Beaker, AlertCircle } from "lucide-react";

interface NewLabResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  latestSymptomScore?: {
    estrogen: number;
    progesterone: number;
    androgen: number;
    cortisol: number;
  };
  onSaved: () => void;
}

interface ProtocolRecommendation {
  title: string;
  protocol: string;
  dose: string;
  reason: string;
}

const NewLabResultModal = ({ 
  isOpen, 
  onClose, 
  patientId, 
  patientName,
  latestSymptomScore,
  onSaved 
}: NewLabResultModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [collectionDate, setCollectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [estradiol, setEstradiol] = useState("");
  const [progesterone, setProgesterone] = useState("");
  const [testosterone, setTestosterone] = useState("");
  const [cortisol, setCortisol] = useState("");
  const [recommendation, setRecommendation] = useState<ProtocolRecommendation | null>(null);

  const getProtocolRecommendation = (
    e2: number | null, 
    t: number | null
  ): ProtocolRecommendation | null => {
    // Smart Protocol Logic
    if (e2 !== null && e2 < 1.5) {
      return {
        title: "Low Estradiol Detected",
        protocol: "Protocol A: Bi-Est 80/20 (Pink Topiclick)",
        dose: "2 clicks (0.5ml) daily",
        reason: `Estradiol at ${e2} pg/mL is critically low (optimal: 2-4 pg/mL)`
      };
    }
    
    if (t !== null && t < 20) {
      return {
        title: "Low Testosterone Detected",
        protocol: "Protocol B: Testosterone Concentrate (Blue Topiclick)",
        dose: "Start at 1mg/0.2cc daily",
        reason: `Testosterone at ${t} ng/dL is below threshold (optimal: 30-45 ng/dL)`
      };
    }
    
    return null;
  };

  const getCorrelationAlert = (
    e2: number | null,
    pg: number | null,
    t: number | null
  ): string | null => {
    if (!latestSymptomScore) return null;
    
    const alerts: string[] = [];
    
    // High estrogen symptoms + low lab
    if (latestSymptomScore.estrogen > 10 && e2 !== null && e2 < 2) {
      alerts.push("High Estrogen Symptom Score matches Low Estradiol Lab");
    }
    
    // High androgen symptoms + low testosterone
    if (latestSymptomScore.androgen > 8 && t !== null && t < 25) {
      alerts.push("High Androgen Symptom Score matches Low Testosterone Lab");
    }
    
    // High progesterone symptoms + low lab
    if (latestSymptomScore.progesterone > 8 && pg !== null && pg < 100) {
      alerts.push("High Progesterone Symptom Score matches Low Progesterone Lab");
    }
    
    return alerts.length > 0 ? alerts.join("; ") : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const e2Value = estradiol ? parseFloat(estradiol) : null;
      const pgValue = progesterone ? parseFloat(progesterone) : null;
      const tValue = testosterone ? parseFloat(testosterone) : null;
      const cortisolValue = cortisol ? parseFloat(cortisol) : null;

      // Check for correlations
      const correlationAlert = getCorrelationAlert(e2Value, pgValue, tValue);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Insert lab result
      const { error } = await supabase.from("lab_results").insert({
        patient_id: patientId,
        collection_date: collectionDate,
        estradiol_e2: e2Value,
        progesterone_pg: pgValue,
        testosterone_t: tValue,
        cortisol_morning: cortisolValue,
        correlation_alert: correlationAlert,
        created_by: user?.id
      });

      if (error) throw error;

      // Check for protocol recommendation
      const rec = getProtocolRecommendation(e2Value, tValue);
      if (rec) {
        setRecommendation(rec);
        toast.success("Lab results saved!", {
          description: "Protocol recommendation generated."
        });
      } else {
        toast.success("Lab results saved successfully!");
        resetAndClose();
      }

      onSaved();
    } catch (error: any) {
      toast.error("Failed to save lab results", {
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setCollectionDate(new Date().toISOString().split('T')[0]);
    setEstradiol("");
    setProgesterone("");
    setTestosterone("");
    setCortisol("");
    setRecommendation(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-cormorant text-xl">
            <Beaker className="w-5 h-5 text-primary" />
            New Lab Result
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Fast-entry for <span className="font-medium text-foreground">{patientName}</span>
          </p>
        </DialogHeader>

        {recommendation ? (
          <div className="space-y-4">
            {/* Protocol Recommendation Card */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">{recommendation.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{recommendation.reason}</p>
                  <div className="mt-3 p-3 bg-card rounded border border-border">
                    <p className="text-sm font-medium text-foreground">{recommendation.protocol}</p>
                    <p className="text-sm text-primary mt-1">Dose: {recommendation.dose}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={resetAndClose}>
                Close
              </Button>
              <Button className="flex-1" onClick={() => {
                toast.success("Recommendation noted for order");
                resetAndClose();
              }}>
                Approve & Create Order
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="collectionDate">Collection Date</Label>
              <Input
                id="collectionDate"
                type="date"
                value={collectionDate}
                onChange={(e) => setCollectionDate(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estradiol">Estradiol (E2)</Label>
                <div className="relative">
                  <Input
                    id="estradiol"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={estradiol}
                    onChange={(e) => setEstradiol(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    pg/mL
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Optimal: 2-4</p>
              </div>

              <div>
                <Label htmlFor="progesterone">Progesterone (Pg)</Label>
                <div className="relative">
                  <Input
                    id="progesterone"
                    type="number"
                    step="1"
                    placeholder="0"
                    value={progesterone}
                    onChange={(e) => setProgesterone(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    pg/mL
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Range: 0-500</p>
              </div>

              <div>
                <Label htmlFor="testosterone">Testosterone (T)</Label>
                <div className="relative">
                  <Input
                    id="testosterone"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={testosterone}
                    onChange={(e) => setTestosterone(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    ng/dL
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Optimal: 30-45</p>
              </div>

              <div>
                <Label htmlFor="cortisol">Cortisol (AM)</Label>
                <div className="relative">
                  <Input
                    id="cortisol"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={cortisol}
                    onChange={(e) => setCortisol(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    μg/dL
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Morning value</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={resetAndClose}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Lab Results"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewLabResultModal;
