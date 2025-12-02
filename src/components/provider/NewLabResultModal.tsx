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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Beaker, AlertCircle, Activity, Scale, TrendingDown } from "lucide-react";

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
  severity?: "warning" | "critical";
}

const NewLabResultModal = ({ 
  isOpen, 
  onClose, 
  patientId, 
  patientName,
  latestSymptomScore,
  onSaved 
}: NewLabResultModalProps) => {
  const [activeTab, setActiveTab] = useState("hormone");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [collectionDate, setCollectionDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Hormone Labs
  const [estradiol, setEstradiol] = useState("");
  const [progesterone, setProgesterone] = useState("");
  const [testosterone, setTestosterone] = useState("");
  const [cortisol, setCortisol] = useState("");
  
  // Metabolic Labs (ZRT Weight Management Profile)
  const [hba1c, setHba1c] = useState("");
  const [fastingInsulin, setFastingInsulin] = useState("");
  const [metabolicCortisol, setMetabolicCortisol] = useState("");
  const [vitaminD, setVitaminD] = useState("");
  
  // Weight Loss Intake (Hormone Blockers - ZRT Saliva)
  const [wlCortisol, setWlCortisol] = useState("");
  const [wlEstradiol, setWlEstradiol] = useState("");
  const [wlTestosterone, setWlTestosterone] = useState("");
  
  const [recommendations, setRecommendations] = useState<ProtocolRecommendation[]>([]);
  const [recommendation, setRecommendation] = useState<ProtocolRecommendation | null>(null);

  // Weight Loss Hormone Blocker Logic
  const getWeightLossBlockers = (
    cort: number | null,
    e2: number | null,
    t: number | null
  ): ProtocolRecommendation[] => {
    const blockers: ProtocolRecommendation[] = [];

    // High Cortisol = Stress Blocker (belly fat retention)
    if (cort !== null && cort > 20) {
      blockers.push({
        title: "⚠️ Stress Blocker Detected",
        protocol: "Adrenal Support Protocol",
        dose: "Adaptogenic herbs + cortisol-lowering strategies",
        reason: `Cortisol at ${cort} μg/dL is elevated. Patient risks belly fat retention. Recommend Adrenal Support.`,
        severity: "warning"
      });
    }

    // High Estradiol = Estrogen Dominance (water retention/hip weight)
    if (e2 !== null && e2 > 5) {
      blockers.push({
        title: "⚠️ Estrogen Dominance",
        protocol: "Progesterone Balance Protocol",
        dose: "Progesterone supplementation to restore E2:P ratio",
        reason: `Estradiol at ${e2} pg/mL indicates dominance. Patient risks water retention/hip weight. Recommend Progesterone Balance.`,
        severity: "warning"
      });
    }

    // Low Testosterone = Muscle Wasting Risk
    if (t !== null && t < 25) {
      blockers.push({
        title: "⚠️ Muscle Wasting Risk",
        protocol: "Testosterone Support Protocol",
        dose: "Low-dose testosterone optimization",
        reason: `Testosterone at ${t} ng/dL is low. Patient risks losing lean mass on GLP-1s. Recommend Testosterone Support.`,
        severity: "critical"
      });
    }

    return blockers;
  };

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

  const getMetabolicRecommendations = (
    a1c: number | null,
    insulin: number | null,
    cort: number | null,
    vitD: number | null
  ): ProtocolRecommendation[] => {
    const recs: ProtocolRecommendation[] = [];

    // HbA1c > 5.7 = Pre-Diabetes
    if (a1c !== null && a1c > 5.7) {
      recs.push({
        title: "Pre-Diabetes Indicated",
        protocol: "Semaglutide Therapy + Glucose Monitoring",
        dose: "Start 0.25mg weekly, titrate to 1mg",
        reason: `HbA1c at ${a1c}% indicates pre-diabetic range (normal: <5.7%)`,
        severity: a1c > 6.4 ? "critical" : "warning"
      });
    }

    // High Fasting Insulin = Severe Insulin Resistance
    if (insulin !== null && insulin > 15) {
      recs.push({
        title: "Severe Insulin Resistance Detected",
        protocol: "Aggressive GLP-1 + Metformin Consideration",
        dose: "Tirzepatide preferred for dual mechanism",
        reason: `Fasting Insulin at ${insulin} μIU/mL is elevated (optimal: <10 μIU/mL)`,
        severity: "critical"
      });
    }

    // High Cortisol = Stress Weight
    if (cort !== null && cort > 20) {
      recs.push({
        title: "Elevated Cortisol - Stress Weight Pattern",
        protocol: "Add Adrenal Support Protocol",
        dose: "Adaptogenic support + lifestyle intervention",
        reason: `Morning Cortisol at ${cort} μg/dL is high. Do NOT rely solely on GLP-1.`,
        severity: "warning"
      });
    }

    // Low Vitamin D = Metabolic Fuel Deficiency
    if (vitD !== null && vitD < 30) {
      recs.push({
        title: "Vitamin D Deficiency",
        protocol: "Vitamin D3 Supplementation",
        dose: vitD < 20 ? "5000 IU daily x 8 weeks, then retest" : "2000-4000 IU daily maintenance",
        reason: `Vitamin D at ${vitD} ng/mL is suboptimal for metabolic function (target: 50-80 ng/mL)`,
        severity: vitD < 20 ? "critical" : "warning"
      });
    }

    return recs;
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

  const handleMetabolicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const a1cValue = hba1c ? parseFloat(hba1c) : null;
      const insulinValue = fastingInsulin ? parseFloat(fastingInsulin) : null;
      const cortValue = metabolicCortisol ? parseFloat(metabolicCortisol) : null;
      const vitDValue = vitaminD ? parseFloat(vitaminD) : null;

      // Get metabolic recommendations
      const recs = getMetabolicRecommendations(a1cValue, insulinValue, cortValue, vitDValue);

      // Store in notes field for now (could be expanded to dedicated metabolic_labs table)
      const { data: { user } } = await supabase.auth.getUser();

      const metabolicNotes = `ZRT Metabolic Profile: HbA1c=${a1cValue || 'N/A'}%, Fasting Insulin=${insulinValue || 'N/A'} μIU/mL, Cortisol=${cortValue || 'N/A'} μg/dL, Vitamin D=${vitDValue || 'N/A'} ng/mL`;

      const { error } = await supabase.from("lab_results").insert({
        patient_id: patientId,
        collection_date: collectionDate,
        cortisol_morning: cortValue,
        notes: metabolicNotes,
        correlation_alert: recs.length > 0 ? recs.map(r => r.title).join("; ") : null,
        created_by: user?.id
      });

      if (error) throw error;

      if (recs.length > 0) {
        setRecommendations(recs);
        toast.success("Metabolic labs saved!", {
          description: `${recs.length} recommendation(s) generated.`
        });
      } else {
        toast.success("Metabolic labs saved successfully!");
        resetAndClose();
      }

      onSaved();
    } catch (error: any) {
      toast.error("Failed to save metabolic labs", {
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWeightLossSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const cortValue = wlCortisol ? parseFloat(wlCortisol) : null;
      const e2Value = wlEstradiol ? parseFloat(wlEstradiol) : null;
      const tValue = wlTestosterone ? parseFloat(wlTestosterone) : null;

      // Get weight loss blocker recommendations
      const blockers = getWeightLossBlockers(cortValue, e2Value, tValue);

      const { data: { user } } = await supabase.auth.getUser();

      const weightLossNotes = `Weight Loss Intake (ZRT Saliva): Cortisol=${cortValue || 'N/A'} μg/dL, Estradiol=${e2Value || 'N/A'} pg/mL, Testosterone=${tValue || 'N/A'} ng/dL`;

      const { error } = await supabase.from("lab_results").insert({
        patient_id: patientId,
        collection_date: collectionDate,
        estradiol_e2: e2Value,
        testosterone_t: tValue,
        cortisol_morning: cortValue,
        notes: weightLossNotes,
        correlation_alert: blockers.length > 0 ? blockers.map(b => b.title).join("; ") : null,
        created_by: user?.id
      });

      if (error) throw error;

      if (blockers.length > 0) {
        setRecommendations(blockers);
        toast.success("Weight Loss Intake saved!", {
          description: `${blockers.length} hormone blocker(s) detected.`
        });
      } else {
        toast.success("No hormone blockers detected. Clear for GLP-1 therapy!");
        resetAndClose();
      }

      onSaved();
    } catch (error: any) {
      toast.error("Failed to save weight loss intake", {
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setActiveTab("hormone");
    setCollectionDate(new Date().toISOString().split('T')[0]);
    setEstradiol("");
    setProgesterone("");
    setTestosterone("");
    setCortisol("");
    setHba1c("");
    setFastingInsulin("");
    setMetabolicCortisol("");
    setVitaminD("");
    setWlCortisol("");
    setWlEstradiol("");
    setWlTestosterone("");
    setRecommendation(null);
    setRecommendations([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-cormorant text-xl">
            <Beaker className="w-5 h-5 text-primary" />
            New Lab Result
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Fast-entry for <span className="font-medium text-foreground">{patientName}</span>
          </p>
        </DialogHeader>

        {/* Show recommendations if any */}
        {(recommendation || recommendations.length > 0) ? (
          <div className="space-y-4">
            {/* Hormone Recommendation */}
            {recommendation && (
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
            )}

            {/* Metabolic Recommendations */}
            {recommendations.map((rec, index) => (
              <div 
                key={index}
                className={`border rounded-lg p-4 ${
                  rec.severity === "critical" 
                    ? "bg-destructive/5 border-destructive/30" 
                    : "bg-gold/5 border-gold/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Activity className={`w-5 h-5 shrink-0 mt-0.5 ${
                    rec.severity === "critical" ? "text-destructive" : "text-gold"
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{rec.title}</h4>
                      {rec.severity === "critical" && (
                        <Badge variant="destructive" className="text-xs">Critical</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{rec.reason}</p>
                    <div className="mt-3 p-3 bg-card rounded border border-border">
                      <p className="text-sm font-medium text-foreground">{rec.protocol}</p>
                      <p className="text-sm text-primary mt-1">Dose: {rec.dose}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={resetAndClose}>
                Close
              </Button>
              <Button className="flex-1" onClick={() => {
                toast.success("Recommendations noted for order");
                resetAndClose();
              }}>
                Approve & Create Order
              </Button>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="hormone" className="flex items-center gap-2 text-xs">
                <Beaker className="w-3 h-3" />
                Hormone
              </TabsTrigger>
              <TabsTrigger value="metabolic" className="flex items-center gap-2 text-xs">
                <Scale className="w-3 h-3" />
                Metabolic
              </TabsTrigger>
              <TabsTrigger value="weightloss" className="flex items-center gap-2 text-xs">
                <TrendingDown className="w-3 h-3" />
                Weight Loss
              </TabsTrigger>
            </TabsList>

            {/* Hormone Labs Tab */}
            <TabsContent value="hormone">
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
                        className="pr-14"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
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
                        className="pr-14"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
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
                        className="pr-14"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
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
                        className="pr-14"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
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
                      "Save Hormone Labs"
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Metabolic Labs Tab (ZRT Weight Management) */}
            <TabsContent value="metabolic">
              <form onSubmit={handleMetabolicSubmit} className="space-y-4">
                <div className="bg-gold/5 border border-gold/20 rounded-lg p-3 mb-4">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-gold">ZRT Weight Management Profile</span> — 
                    Enter values from saliva + blood spot panel
                  </p>
                </div>

                <div>
                  <Label htmlFor="metabolicDate">Collection Date</Label>
                  <Input
                    id="metabolicDate"
                    type="date"
                    value={collectionDate}
                    onChange={(e) => setCollectionDate(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hba1c">HbA1c</Label>
                    <div className="relative">
                      <Input
                        id="hba1c"
                        type="number"
                        step="0.1"
                        placeholder="5.4"
                        value={hba1c}
                        onChange={(e) => setHba1c(e.target.value)}
                        className="pr-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                        %
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Normal: &lt;5.7%</p>
                  </div>

                  <div>
                    <Label htmlFor="fastingInsulin">Fasting Insulin</Label>
                    <div className="relative">
                      <Input
                        id="fastingInsulin"
                        type="number"
                        step="0.1"
                        placeholder="8.0"
                        value={fastingInsulin}
                        onChange={(e) => setFastingInsulin(e.target.value)}
                        className="pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                        μIU/mL
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Optimal: &lt;10</p>
                  </div>

                  <div>
                    <Label htmlFor="metabolicCortisol">Cortisol (AM)</Label>
                    <div className="relative">
                      <Input
                        id="metabolicCortisol"
                        type="number"
                        step="0.1"
                        placeholder="15.0"
                        value={metabolicCortisol}
                        onChange={(e) => setMetabolicCortisol(e.target.value)}
                        className="pr-14"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                        μg/dL
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Normal: 10-20</p>
                  </div>

                  <div>
                    <Label htmlFor="vitaminD">Vitamin D</Label>
                    <div className="relative">
                      <Input
                        id="vitaminD"
                        type="number"
                        step="1"
                        placeholder="45"
                        value={vitaminD}
                        onChange={(e) => setVitaminD(e.target.value)}
                        className="pr-14"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                        ng/mL
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Optimal: 50-80</p>
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
                      "Save Metabolic Labs"
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Weight Loss Intake Tab (Hormone Blockers) */}
            <TabsContent value="weightloss">
              <form onSubmit={handleWeightLossSubmit} className="space-y-4">
                <div className="bg-gold/5 border border-gold/20 rounded-lg p-3 mb-4">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-gold">Hormone Blocker Analysis</span> — 
                    Enter ZRT Saliva values to identify weight loss blockers
                  </p>
                </div>

                <div>
                  <Label htmlFor="wlDate">Collection Date</Label>
                  <Input
                    id="wlDate"
                    type="date"
                    value={collectionDate}
                    onChange={(e) => setCollectionDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="wlCortisol">Cortisol (Morning)</Label>
                    <div className="relative">
                      <Input
                        id="wlCortisol"
                        type="number"
                        step="0.1"
                        placeholder="15.0"
                        value={wlCortisol}
                        onChange={(e) => setWlCortisol(e.target.value)}
                        className="pr-14"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                        μg/dL
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      High = Stress blocker → Belly fat retention
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="wlEstradiol">Estradiol (E2)</Label>
                    <div className="relative">
                      <Input
                        id="wlEstradiol"
                        type="number"
                        step="0.1"
                        placeholder="3.0"
                        value={wlEstradiol}
                        onChange={(e) => setWlEstradiol(e.target.value)}
                        className="pr-14"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                        pg/mL
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      High = Estrogen dominance → Water retention/hip weight
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="wlTestosterone">Testosterone</Label>
                    <div className="relative">
                      <Input
                        id="wlTestosterone"
                        type="number"
                        step="0.1"
                        placeholder="35.0"
                        value={wlTestosterone}
                        onChange={(e) => setWlTestosterone(e.target.value)}
                        className="pr-14"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                        ng/dL
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Low = Muscle wasting risk → Loses lean mass on GLP-1s
                    </p>
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
                        Analyzing...
                      </>
                    ) : (
                      "Check Blockers"
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewLabResultModal;
