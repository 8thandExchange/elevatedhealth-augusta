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
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Beaker, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import LabPdfUploader from "./LabPdfUploader";

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

interface ParsedLabData {
  collectionDate: string | null;
  patientName: string | null;
  estradiol: number | null;
  progesterone: number | null;
  testosterone: number | null;
  dheas: number | null;
  cortisol: number | null;
  pgE2Ratio: number | null;
  confidence: {
    overall: number;
    fields: Record<string, number>;
  };
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [parsedFromPdf, setParsedFromPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // Lab Source Toggle
  const [labSource, setLabSource] = useState<"zrt" | "labcorp">("zrt");
  
  // ZRT Saliva Labs (Primary)
  const [estradiol, setEstradiol] = useState("");
  const [progesterone, setProgesterone] = useState("");
  const [testosterone, setTestosterone] = useState("");
  const [cortisol, setCortisol] = useState("");
  const [dheas, setDheas] = useState("");
  const [pgE2Ratio, setPgE2Ratio] = useState("");
  
  // Labcorp Blood Labs
  const [hematocrit, setHematocrit] = useState("");
  const [psa, setPsa] = useState("");
  const [alt, setAlt] = useState("");
  const [ast, setAst] = useState("");
  const [labcorpA1c, setLabcorpA1c] = useState("");
  
  // Advanced Labs (collapsed by default)
  const [hba1c, setHba1c] = useState("");
  const [fastingInsulin, setFastingInsulin] = useState("");
  const [vitaminD, setVitaminD] = useState("");
  
  const [recommendation, setRecommendation] = useState<ProtocolRecommendation | null>(null);
  const [labcorpAlerts, setLabcorpAlerts] = useState<ProtocolRecommendation[]>([]);

  // Handle parsed PDF data - auto-populate editable fields
  const handleParsedData = (data: ParsedLabData) => {
    if (data.collectionDate) setCollectionDate(data.collectionDate);
    if (data.estradiol !== null) setEstradiol(data.estradiol.toString());
    if (data.progesterone !== null) setProgesterone(data.progesterone.toString());
    if (data.testosterone !== null) setTestosterone(data.testosterone.toString());
    if (data.dheas !== null) setDheas(data.dheas.toString());
    if (data.cortisol !== null) setCortisol(data.cortisol.toString());
    if (data.pgE2Ratio !== null) setPgE2Ratio(data.pgE2Ratio.toString());
    setParsedFromPdf(true);
  };

  const handlePdfUploaded = (url: string) => {
    setPdfUrl(url);
  };

  // Labcorp Blood Safety Alerts
  const getLabcorpSafetyAlerts = (
    hct: number | null,
    psaVal: number | null,
    altVal: number | null,
    astVal: number | null,
    a1cVal: number | null
  ): ProtocolRecommendation[] => {
    const alerts: ProtocolRecommendation[] = [];

    if (hct !== null && hct > 52) {
      alerts.push({
        title: "🚨 Polycythemia Risk",
        protocol: "HOLD Testosterone Therapy",
        dose: "Consider therapeutic phlebotomy if Hct > 54%",
        reason: `Hematocrit at ${hct}% is elevated (normal: 38-50%). Risk of blood clots.`,
        severity: "critical"
      });
    }

    if (psaVal !== null && psaVal > 4.0) {
      alerts.push({
        title: "🚨 Prostate Risk",
        protocol: "Refer to Urology",
        dose: "Hold testosterone pending urology clearance",
        reason: `PSA at ${psaVal} ng/mL exceeds safety threshold.`,
        severity: "critical"
      });
    }

    if ((altVal !== null && altVal > 40) || (astVal !== null && astVal > 40)) {
      alerts.push({
        title: "⚠️ Elevated Liver Enzymes",
        protocol: "Monitor Liver Function",
        dose: "Recheck LFTs in 4-6 weeks",
        reason: `ALT: ${altVal || 'N/A'} U/L, AST: ${astVal || 'N/A'} U/L.`,
        severity: "warning"
      });
    }

    if (a1cVal !== null && a1cVal >= 6.5) {
      alerts.push({
        title: "⚠️ Diabetes Indicated",
        protocol: "GLP-1 Therapy Recommended",
        dose: "Consider Semaglutide or Tirzepatide",
        reason: `HbA1c at ${a1cVal}% indicates diabetes.`,
        severity: a1cVal >= 7.0 ? "critical" : "warning"
      });
    }

    return alerts;
  };

  const getProtocolRecommendation = (
    e2: number | null, 
    t: number | null,
    pg: number | null,
    pgE2: number | null
  ): ProtocolRecommendation | null => {
    // Low Estradiol
    if (e2 !== null && e2 < 1.5) {
      return {
        title: "Low Estradiol Detected",
        protocol: "Protocol A: Bi-Est 80/20 (Pink Topiclick)",
        dose: "2 clicks (0.5ml) daily",
        reason: `Estradiol at ${e2} pg/mL is critically low (optimal: 1.3-3.3 pg/mL)`
      };
    }
    
    // Low Testosterone
    if (t !== null && t < 16) {
      return {
        title: "Low Testosterone Detected",
        protocol: "Protocol B: Testosterone Concentrate (Blue Topiclick)",
        dose: "Start at 1mg/0.2cc daily",
        reason: `Testosterone at ${t} pg/mL is below range (range: 16-55 pg/mL)`
      };
    }

    // Low Progesterone with suboptimal Pg/E2 ratio
    if (pg !== null && pg < 75) {
      return {
        title: "Low Progesterone Detected",
        protocol: "Progesterone Support Protocol",
        dose: "100-200mg nightly",
        reason: `Progesterone at ${pg} pg/mL is below range (range: 75-270 pg/mL Luteal)`
      };
    }

    // Low Pg/E2 Ratio
    if (pgE2 !== null && pgE2 < 100 && e2 !== null && e2 >= 1.3 && e2 <= 3.3) {
      return {
        title: "Suboptimal Pg/E2 Ratio",
        protocol: "Progesterone Balance Protocol",
        dose: "Add or increase progesterone",
        reason: `Pg/E2 ratio at ${pgE2} is below optimal (optimal: 100-500 when E2 1.3-3.3 pg/mL)`
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
    
    if (latestSymptomScore.estrogen > 10 && e2 !== null && e2 < 2) {
      alerts.push("High Estrogen Symptom Score matches Low Estradiol Lab");
    }
    
    if (latestSymptomScore.androgen > 8 && t !== null && t < 25) {
      alerts.push("High Androgen Symptom Score matches Low Testosterone Lab");
    }
    
    if (latestSymptomScore.progesterone > 8 && pg !== null && pg < 100) {
      alerts.push("High Progesterone Symptom Score matches Low Progesterone Lab");
    }
    
    return alerts.length > 0 ? alerts.join("; ") : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (labSource === "labcorp") {
        // Labcorp Blood Labs
        const hctValue = hematocrit ? parseFloat(hematocrit) : null;
        const psaValue = psa ? parseFloat(psa) : null;
        const altValue = alt ? parseFloat(alt) : null;
        const astValue = ast ? parseFloat(ast) : null;
        const a1cValue = labcorpA1c ? parseFloat(labcorpA1c) : null;

        const alerts = getLabcorpSafetyAlerts(hctValue, psaValue, altValue, astValue, a1cValue);

        const labcorpNotes = `Labcorp Blood Panel: Hematocrit=${hctValue || 'N/A'}%, PSA=${psaValue || 'N/A'} ng/mL, ALT=${altValue || 'N/A'} U/L, AST=${astValue || 'N/A'} U/L, A1c=${a1cValue || 'N/A'}%`;

        const { error } = await supabase.from("lab_results").insert({
          patient_id: patientId,
          collection_date: collectionDate,
          hematocrit: hctValue,
          psa: psaValue,
          alt: altValue,
          ast: astValue,
          a1c: a1cValue,
          notes: labcorpNotes,
          lab_source: "labcorp",
          correlation_alert: alerts.length > 0 ? alerts.map(a => a.title).join("; ") : null,
          created_by: user?.id
        });

        if (error) throw error;

        if (alerts.length > 0) {
          setLabcorpAlerts(alerts);
          toast.success("Labcorp labs saved!", {
            description: `${alerts.length} safety alert(s) detected.`
          });
        } else {
          toast.success("Labcorp labs saved. All values within normal range!");
          resetAndClose();
        }
      } else {
        // ZRT Saliva Labs
        const e2Value = estradiol ? parseFloat(estradiol) : null;
        const pgValue = progesterone ? parseFloat(progesterone) : null;
        const tValue = testosterone ? parseFloat(testosterone) : null;
        const cortisolValue = cortisol ? parseFloat(cortisol) : null;
        const dheasValue = dheas ? parseFloat(dheas) : null;
        const pgE2Value = pgE2Ratio ? parseFloat(pgE2Ratio) : null;

        // Advanced labs
        const a1cValue = hba1c ? parseFloat(hba1c) : null;
        const insulinValue = fastingInsulin ? parseFloat(fastingInsulin) : null;
        const vitDValue = vitaminD ? parseFloat(vitaminD) : null;

        const correlationAlert = getCorrelationAlert(e2Value, pgValue, tValue);

        const { error } = await supabase.from("lab_results").insert({
          patient_id: patientId,
          collection_date: collectionDate,
          estradiol_e2: e2Value,
          progesterone_pg: pgValue,
          testosterone_t: tValue,
          cortisol_morning: cortisolValue,
          dhea_s: dheasValue,
          pg_e2_ratio: pgE2Value,
          a1c: a1cValue,
          fasting_insulin: insulinValue,
          vitamin_d: vitDValue,
          lab_source: "zrt",
          correlation_alert: correlationAlert,
          pdf_url: pdfUrl,
          parsed_from_pdf: parsedFromPdf,
          created_by: user?.id
        });

        if (error) throw error;

        const rec = getProtocolRecommendation(e2Value, tValue, pgValue, pgE2Value);
        if (rec) {
          setRecommendation(rec);
          toast.success("Lab results saved!", {
            description: "Protocol recommendation generated."
          });
        } else {
          toast.success("Lab results saved successfully!");
          resetAndClose();
        }
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
    setLabSource("zrt");
    setCollectionDate(new Date().toISOString().split('T')[0]);
    setShowAdvanced(false);
    setParsedFromPdf(false);
    setPdfUrl(null);
    // ZRT fields
    setEstradiol("");
    setProgesterone("");
    setTestosterone("");
    setCortisol("");
    setDheas("");
    setPgE2Ratio("");
    // Labcorp fields
    setHematocrit("");
    setPsa("");
    setAlt("");
    setAst("");
    setLabcorpA1c("");
    // Advanced fields
    setHba1c("");
    setFastingInsulin("");
    setVitaminD("");
    // Recommendations
    setRecommendation(null);
    setLabcorpAlerts([]);
    onClose();
  };

  // Helper to get field status
  const getFieldStatus = (value: string, min: number, max: number): "normal" | "low" | "high" => {
    const num = parseFloat(value);
    if (isNaN(num)) return "normal";
    if (num < min) return "low";
    if (num > max) return "high";
    return "normal";
  };

  const getFieldBorderClass = (status: "normal" | "low" | "high") => {
    if (status === "low") return "border-amber-500 focus-visible:ring-amber-500";
    if (status === "high") return "border-red-500 focus-visible:ring-red-500";
    return "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
        {(recommendation || labcorpAlerts.length > 0) ? (
          <div className="space-y-4">
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

            {labcorpAlerts.map((alert, index) => (
              <div 
                key={`labcorp-${index}`}
                className={`border rounded-lg p-4 ${
                  alert.severity === "critical" 
                    ? "bg-destructive/5 border-destructive/30" 
                    : "bg-amber-50 dark:bg-amber-950/20 border-amber-500/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${
                    alert.severity === "critical" ? "text-destructive" : "text-amber-600"
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{alert.title}</h4>
                      {alert.severity === "critical" && (
                        <Badge variant="destructive" className="text-xs">Critical</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{alert.reason}</p>
                    <div className="mt-3 p-3 bg-card rounded border border-border">
                      <p className="text-sm font-medium text-foreground">{alert.protocol}</p>
                      <p className="text-sm text-primary mt-1">{alert.dose}</p>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Lab Source Toggle */}
            <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
              <Label className="text-sm font-medium">Lab Source:</Label>
              <div className="flex gap-1 bg-background rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setLabSource("zrt")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    labSource === "zrt"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ZRT (Saliva)
                </button>
                <button
                  type="button"
                  onClick={() => setLabSource("labcorp")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    labSource === "labcorp"
                      ? "bg-amber-600 text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Labcorp (Blood)
                </button>
              </div>
            </div>

            {/* ZRT Saliva Fields */}
            {labSource === "zrt" && (
              <>
                {/* PDF Upload */}
                <LabPdfUploader 
                  patientName={patientName}
                  onParsed={handleParsedData}
                  onPdfUploaded={handlePdfUploaded}
                />

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

                {/* ZRT Hormone Fields - Editable */}
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    ZRT Saliva Profile III
                    {parsedFromPdf && (
                      <Badge variant="secondary" className="ml-2 text-xs">Parsed from PDF</Badge>
                    )}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="estradiol" className="text-xs">Estradiol (E2)</Label>
                      <div className="relative">
                        <Input
                          id="estradiol"
                          type="number"
                          step="0.1"
                          placeholder="2.1"
                          value={estradiol}
                          onChange={(e) => setEstradiol(e.target.value)}
                          className={`pr-14 ${getFieldBorderClass(getFieldStatus(estradiol, 1.3, 3.3))}`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                          pg/mL
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Range: 1.3-3.3</p>
                    </div>

                    <div>
                      <Label htmlFor="progesterone" className="text-xs">Progesterone (Pg)</Label>
                      <div className="relative">
                        <Input
                          id="progesterone"
                          type="number"
                          step="1"
                          placeholder="150"
                          value={progesterone}
                          onChange={(e) => setProgesterone(e.target.value)}
                          className={`pr-14 ${getFieldBorderClass(getFieldStatus(progesterone, 75, 270))}`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                          pg/mL
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Luteal: 75-270</p>
                    </div>

                    <div>
                      <Label htmlFor="pgE2Ratio" className="text-xs">Pg/E2 Ratio</Label>
                      <Input
                        id="pgE2Ratio"
                        type="number"
                        step="1"
                        placeholder="100"
                        value={pgE2Ratio}
                        onChange={(e) => setPgE2Ratio(e.target.value)}
                        className={getFieldBorderClass(getFieldStatus(pgE2Ratio, 100, 500))}
                      />
                      <p className="text-xs text-muted-foreground mt-0.5">Optimal: 100-500</p>
                    </div>

                    <div>
                      <Label htmlFor="testosterone" className="text-xs">Testosterone (T)</Label>
                      <div className="relative">
                        <Input
                          id="testosterone"
                          type="number"
                          step="0.1"
                          placeholder="35"
                          value={testosterone}
                          onChange={(e) => setTestosterone(e.target.value)}
                          className={`pr-14 ${getFieldBorderClass(getFieldStatus(testosterone, 16, 55))}`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                          pg/mL
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Range: 16-55</p>
                    </div>

                    <div>
                      <Label htmlFor="dheas" className="text-xs">DHEAS</Label>
                      <div className="relative">
                        <Input
                          id="dheas"
                          type="number"
                          step="0.1"
                          placeholder="10"
                          value={dheas}
                          onChange={(e) => setDheas(e.target.value)}
                          className={`pr-14 ${getFieldBorderClass(getFieldStatus(dheas, 2, 23))}`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                          ng/mL
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Range: 2-23</p>
                    </div>

                    <div>
                      <Label htmlFor="cortisol" className="text-xs">Cortisol (AM)</Label>
                      <div className="relative">
                        <Input
                          id="cortisol"
                          type="number"
                          step="0.1"
                          placeholder="6.5"
                          value={cortisol}
                          onChange={(e) => setCortisol(e.target.value)}
                          className={`pr-14 ${getFieldBorderClass(getFieldStatus(cortisol, 3.7, 9.5))}`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                          ng/mL
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Morning: 3.7-9.5</p>
                    </div>
                  </div>
                </div>

                {/* Advanced Labs - Collapsible */}
                <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                  <CollapsibleTrigger asChild>
                    <Button type="button" variant="ghost" size="sm" className="w-full justify-between text-muted-foreground">
                      <span className="text-xs">Advanced Labs (Metabolic)</span>
                      {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3">
                    <div className="grid grid-cols-3 gap-3 p-3 bg-secondary/30 rounded-lg">
                      <div>
                        <Label htmlFor="hba1c" className="text-xs">HbA1c</Label>
                        <div className="relative">
                          <Input
                            id="hba1c"
                            type="number"
                            step="0.1"
                            placeholder="5.4"
                            value={hba1c}
                            onChange={(e) => setHba1c(e.target.value)}
                            className="pr-8"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="fastingInsulin" className="text-xs">Fasting Insulin</Label>
                        <Input
                          id="fastingInsulin"
                          type="number"
                          step="0.1"
                          placeholder="8"
                          value={fastingInsulin}
                          onChange={(e) => setFastingInsulin(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="vitaminD" className="text-xs">Vitamin D</Label>
                        <Input
                          id="vitaminD"
                          type="number"
                          step="1"
                          placeholder="50"
                          value={vitaminD}
                          onChange={(e) => setVitaminD(e.target.value)}
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </>
            )}

            {/* Labcorp Blood Fields */}
            {labSource === "labcorp" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="labcorpDate">Collection Date</Label>
                  <Input
                    id="labcorpDate"
                    type="date"
                    value={collectionDate}
                    onChange={(e) => setCollectionDate(e.target.value)}
                    required
                  />
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-500/30 rounded-lg p-3">
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    <span className="font-semibold">Labcorp Blood Panel</span> — Enter blood draw results for testosterone safety monitoring
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="hematocrit" className="text-xs">Hematocrit (Hct)</Label>
                    <div className="relative">
                      <Input
                        id="hematocrit"
                        type="number"
                        step="0.1"
                        placeholder="45"
                        value={hematocrit}
                        onChange={(e) => setHematocrit(e.target.value)}
                        className="pr-8"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Normal: 38-50%</p>
                  </div>

                  <div>
                    <Label htmlFor="psa" className="text-xs">PSA</Label>
                    <div className="relative">
                      <Input
                        id="psa"
                        type="number"
                        step="0.1"
                        placeholder="1.5"
                        value={psa}
                        onChange={(e) => setPsa(e.target.value)}
                        className="pr-14"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">ng/mL</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Normal: &lt;4.0</p>
                  </div>

                  <div>
                    <Label htmlFor="alt" className="text-xs">ALT (Liver)</Label>
                    <div className="relative">
                      <Input
                        id="alt"
                        type="number"
                        step="1"
                        placeholder="25"
                        value={alt}
                        onChange={(e) => setAlt(e.target.value)}
                        className="pr-10"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">U/L</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="ast" className="text-xs">AST (Liver)</Label>
                    <div className="relative">
                      <Input
                        id="ast"
                        type="number"
                        step="1"
                        placeholder="22"
                        value={ast}
                        onChange={(e) => setAst(e.target.value)}
                        className="pr-10"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">U/L</span>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="labcorpA1c" className="text-xs">HbA1c (Blood Sugar)</Label>
                    <div className="relative max-w-[150px]">
                      <Input
                        id="labcorpA1c"
                        type="number"
                        step="0.1"
                        placeholder="5.4"
                        value={labcorpA1c}
                        onChange={(e) => setLabcorpA1c(e.target.value)}
                        className="pr-8"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Normal: &lt;5.7%</p>
                  </div>
                </div>
              </div>
            )}

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
                  labSource === "labcorp" ? "Save Labcorp Labs" : "Save ZRT Labs"
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
