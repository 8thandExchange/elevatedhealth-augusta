import { useState, useEffect } from "react";
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
import { Loader2, Beaker, AlertCircle } from "lucide-react";
import { MedicationRecommendation } from "@/lib/medicationMapping";
import LabPdfUploader, { type ParsedLabData } from "./LabPdfUploader";
import { autoPersistLabcorpInterpretationAfterSave } from "@/lib/persistLabcorpInterpretation";

interface ExistingLabResult {
  id: string;
  collection_date: string;
  hematocrit: number | null;
  psa: number | null;
  alt: number | null;
  ast: number | null;
  a1c: number | null;
  lab_source: string | null;
}

interface PdfExtraLabFields {
  estradiol_e2: number | null;
  progesterone_pg: number | null;
  testosterone_t: number | null;
  dhea_s: number | null;
  cortisol_morning: number | null;
  tsh: number | null;
  free_t3: number | null;
  free_t4: number | null;
  vitamin_d: number | null;
  fasting_insulin: number | null;
  triglycerides: number | null;
  hdl: number | null;
  ldl: number | null;
  parsed_from_pdf: boolean;
  pdf_url: string | null;
}

const emptyPdfExtras = (): PdfExtraLabFields => ({
  estradiol_e2: null,
  progesterone_pg: null,
  testosterone_t: null,
  dhea_s: null,
  cortisol_morning: null,
  tsh: null,
  free_t3: null,
  free_t4: null,
  vitamin_d: null,
  fasting_insulin: null,
  triglycerides: null,
  hdl: null,
  ldl: null,
  parsed_from_pdf: false,
  pdf_url: null,
});

function pdfExtrasFromParsed(parsed: ParsedLabData, pdfUrl: string | null): PdfExtraLabFields {
  return {
    estradiol_e2: parsed.estradiol,
    progesterone_pg: parsed.progesterone,
    testosterone_t: parsed.testosterone,
    dhea_s: parsed.dheas,
    cortisol_morning: parsed.cortisol,
    tsh: parsed.tsh ?? null,
    free_t3: parsed.freeT3 ?? null,
    free_t4: parsed.freeT4 ?? null,
    vitamin_d: parsed.vitaminD ?? null,
    fasting_insulin: parsed.fastingInsulin ?? null,
    triglycerides: parsed.triglycerides ?? null,
    hdl: parsed.hdl ?? null,
    ldl: parsed.ldl ?? null,
    parsed_from_pdf: true,
    pdf_url: pdfUrl,
  };
}

interface NewLabResultModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  onSaved: () => void;
  onApplyToRx?: (medications: MedicationRecommendation[]) => void;
  existingLab?: ExistingLabResult | null;
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
  patientGender = "female",
  primaryProgram,
  onSaved,
  existingLab,
}: NewLabResultModalProps) => {
  const isEditMode = !!existingLab;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [collectionDate, setCollectionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [hematocrit, setHematocrit] = useState("");
  const [psa, setPsa] = useState("");
  const [alt, setAlt] = useState("");
  const [ast, setAst] = useState("");
  const [labcorpA1c, setLabcorpA1c] = useState("");
  const [labcorpAlerts, setLabcorpAlerts] = useState<ProtocolRecommendation[]>([]);
  const [pdfExtras, setPdfExtras] = useState<PdfExtraLabFields>(emptyPdfExtras);

  useEffect(() => {
    if (isOpen && existingLab?.lab_source === "zrt") {
      toast.error(
        "Legacy ZRT lab results are retired. Add a new LabCorp blood panel instead."
      );
      onClose();
    }
  }, [isOpen, existingLab, onClose]);

  useEffect(() => {
    if (existingLab && isOpen && existingLab.lab_source === "labcorp") {
      setCollectionDate(existingLab.collection_date);
      setHematocrit(existingLab.hematocrit?.toString() || "");
      setPsa(existingLab.psa?.toString() || "");
      setAlt(existingLab.alt?.toString() || "");
      setAst(existingLab.ast?.toString() || "");
      setLabcorpA1c(existingLab.a1c?.toString() || "");
    }
  }, [existingLab, isOpen]);

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
        title: "Polycythemia Risk",
        protocol: "HOLD Testosterone Therapy",
        dose: "Consider therapeutic phlebotomy if Hct > 54%",
        reason: `Hematocrit at ${hct}% is elevated (normal: 38-50%). Risk of blood clots.`,
        severity: "critical",
      });
    }

    if (psaVal !== null && psaVal > 4.0) {
      alerts.push({
        title: "Prostate Risk",
        protocol: "Refer to Urology",
        dose: "Hold testosterone pending urology clearance",
        reason: `PSA at ${psaVal} ng/mL exceeds safety threshold.`,
        severity: "critical",
      });
    }

    if ((altVal !== null && altVal > 40) || (astVal !== null && astVal > 40)) {
      alerts.push({
        title: "Elevated Liver Enzymes",
        protocol: "Monitor Liver Function",
        dose: "Recheck LFTs in 4-6 weeks",
        reason: `ALT: ${altVal || "N/A"} U/L, AST: ${astVal || "N/A"} U/L.`,
        severity: "warning",
      });
    }

    if (a1cVal !== null && a1cVal >= 6.5) {
      alerts.push({
        title: "Diabetes Indicated",
        protocol: "GLP-1 Therapy Recommended",
        dose: "Consider Semaglutide or Tirzepatide",
        reason: `HbA1c at ${a1cVal}% indicates diabetes.`,
        severity: a1cVal >= 7.0 ? "critical" : "warning",
      });
    }

    return alerts;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const hctValue = hematocrit ? parseFloat(hematocrit) : null;
      const psaValue = psa ? parseFloat(psa) : null;
      const altValue = alt ? parseFloat(alt) : null;
      const astValue = ast ? parseFloat(ast) : null;
      const a1cValue = labcorpA1c ? parseFloat(labcorpA1c) : null;

      const alerts = getLabcorpSafetyAlerts(
        hctValue,
        psaValue,
        altValue,
        astValue,
        a1cValue
      );

      const labcorpNotes = `LabCorp Blood Panel: Hematocrit=${hctValue || "N/A"}%, PSA=${psaValue || "N/A"} ng/mL, ALT=${altValue || "N/A"} U/L, AST=${astValue || "N/A"} U/L, A1c=${a1cValue || "N/A"}%`;

      const safetyCorrelation =
        alerts.length > 0 ? alerts.map((a) => a.title).join("; ") : null;

      const labcorpData = {
        patient_id: patientId,
        collection_date: collectionDate,
        hematocrit: hctValue,
        psa: psaValue,
        alt: altValue,
        ast: astValue,
        a1c: a1cValue,
        estradiol_e2: pdfExtras.estradiol_e2,
        progesterone_pg: pdfExtras.progesterone_pg,
        testosterone_t: pdfExtras.testosterone_t,
        dhea_s: pdfExtras.dhea_s,
        cortisol_morning: pdfExtras.cortisol_morning,
        tsh: pdfExtras.tsh,
        free_t3: pdfExtras.free_t3,
        free_t4: pdfExtras.free_t4,
        vitamin_d: pdfExtras.vitamin_d,
        fasting_insulin: pdfExtras.fasting_insulin,
        triglycerides: pdfExtras.triglycerides,
        hdl: pdfExtras.hdl,
        ldl: pdfExtras.ldl,
        parsed_from_pdf: pdfExtras.parsed_from_pdf,
        pdf_url: pdfExtras.pdf_url,
        notes: labcorpNotes,
        lab_source: "labcorp",
        correlation_alert: safetyCorrelation,
        created_by: user?.id,
      };

      let error;
      let labResultId: string | undefined;
      if (isEditMode && existingLab) {
        labResultId = existingLab.id;
        const result = await supabase
          .from("lab_results")
          .update(labcorpData)
          .eq("id", existingLab.id);
        error = result.error;
      } else {
        const result = await supabase
          .from("lab_results")
          .insert(labcorpData)
          .select("id")
          .single();
        error = result.error;
        labResultId = result.data?.id;
      }

      if (error) throw error;

      let interpretationSaved = false;
      if (labResultId) {
        const interp = await autoPersistLabcorpInterpretationAfterSave({
          labResultId,
          row: { ...labcorpData, id: labResultId, lab_source: "labcorp" },
          patientGender,
          primaryProgram,
          existingCorrelationAlert: safetyCorrelation,
        });
        if (interp.status === "failed") {
          console.warn("Auto interpretation failed:", interp.error);
        } else if (interp.status === "persisted") {
          interpretationSaved = true;
        }
      }

      const interpNote = interpretationSaved
        ? " Lab interpretation saved to chart."
        : "";

      if (alerts.length > 0) {
        setLabcorpAlerts(alerts);
        toast.success(
          isEditMode ? "LabCorp labs updated!" : "LabCorp labs saved!",
          {
            description: `${alerts.length} safety alert(s) detected.${interpNote}`,
          }
        );
      } else {
        toast.success(
          isEditMode
            ? "LabCorp labs updated!"
            : `LabCorp labs saved.${interpNote || " All values within normal range!"}`
        );
        resetAndClose();
      }

      onSaved();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to save lab results", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleParsed = (parsed: ParsedLabData) => {
    setPdfExtras((prev) => ({
      ...pdfExtrasFromParsed(parsed, prev.pdf_url),
      pdf_url: prev.pdf_url,
    }));
    if (parsed.hematocrit != null && !hematocrit) setHematocrit(String(parsed.hematocrit));
    if (parsed.psa != null && !psa) setPsa(String(parsed.psa));
    if (parsed.alt != null && !alt) setAlt(String(parsed.alt));
    if (parsed.ast != null && !ast) setAst(String(parsed.ast));
    if (parsed.a1c != null && !labcorpA1c) setLabcorpA1c(String(parsed.a1c));
    if (parsed.collectionDate) setCollectionDate(parsed.collectionDate);
  };

  const resetAndClose = () => {
    setCollectionDate(new Date().toISOString().split("T")[0]);
    setHematocrit("");
    setPsa("");
    setAlt("");
    setAst("");
    setLabcorpA1c("");
    setLabcorpAlerts([]);
    setPdfExtras(emptyPdfExtras());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-cormorant text-xl">
            <Beaker className="w-5 h-5 text-primary" />
            {isEditMode ? "Edit LabCorp Panel" : "New LabCorp Panel"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {isEditMode ? "Update values for" : "Fast-entry for"}{" "}
            <span className="font-medium text-foreground">{patientName}</span>
          </p>
        </DialogHeader>

        {labcorpAlerts.length > 0 ? (
          <div className="space-y-4">
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
                  <AlertCircle
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      alert.severity === "critical"
                        ? "text-destructive"
                        : "text-amber-600"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">
                        {alert.title}
                      </h4>
                      {alert.severity === "critical" && (
                        <Badge variant="destructive" className="text-xs">
                          Critical
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {alert.reason}
                    </p>
                    <div className="mt-3 p-3 bg-card rounded border border-border">
                      <p className="text-sm font-medium text-foreground">
                        {alert.protocol}
                      </p>
                      <p className="text-sm text-primary mt-1">{alert.dose}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={resetAndClose}
              >
                Close
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  toast.success("Safety alerts noted for chart");
                  resetAndClose();
                }}
              >
                Acknowledge
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <LabPdfUploader
              patientName={patientName}
              onParsed={handleParsed}
              onPdfUploaded={(url) =>
                setPdfExtras((prev) => ({ ...prev, pdf_url: url, parsed_from_pdf: true }))
              }
            />
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
                  <span className="font-semibold">LabCorp Blood Panel</span> —
                  Enter blood draw results for testosterone safety monitoring
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="hematocrit" className="text-xs">
                    Hematocrit (Hct)
                  </Label>
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
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      %
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Normal: 38-50%
                  </p>
                </div>

                <div>
                  <Label htmlFor="psa" className="text-xs">
                    PSA
                  </Label>
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
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      ng/mL
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Normal: &lt;4.0
                  </p>
                </div>

                <div>
                  <Label htmlFor="alt" className="text-xs">
                    ALT (Liver)
                  </Label>
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
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      U/L
                    </span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="ast" className="text-xs">
                    AST (Liver)
                  </Label>
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
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      U/L
                    </span>
                  </div>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="labcorpA1c" className="text-xs">
                    HbA1c (Blood Sugar)
                  </Label>
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
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      %
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Normal: &lt;5.7%
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={resetAndClose}
              >
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
