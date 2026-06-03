import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  analyzeLabcorpResults,
  labResultRowToValues,
  parseInterpretationSnapshot,
  type LabcorpInterpretation,
  type LabInterpretationSnapshot,
} from "@/lib/labcorpInterpretation";
import {
  findingsSummaryForAlert,
  generateLabcorpMedicationRecommendations,
} from "@/lib/labcorpMedicationRecommendations";
import type { MedicationRecommendation } from "@/lib/medicationMapping";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  Brain,
  AlertTriangle,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  Pill,
  Save,
} from "lucide-react";
import { protocolSlugsForInterpretationKey } from "@/lib/protocolInterpretationLinks";
import {
  fetchClinicalProtocolsBySlugs,
  type ProtocolLinkInfo,
} from "@/lib/clinicalProtocolLookup";

type LabRow = Record<string, unknown> & { id: string; treatment_plan?: unknown; clinical_story?: string | null };

interface LabInterpretationPanelProps {
  labRow: LabRow;
  patientGender: string;
  primaryProgram?: string | null;
  onApplyToRx?: (recommendations: MedicationRecommendation[]) => void;
  onSaved?: () => void;
}

const priorityVariant = (p: string) => {
  if (p === "high") return "destructive" as const;
  if (p === "medium") return "secondary" as const;
  return "outline" as const;
};

const confidenceLabel = (c: string) => {
  if (c === "high_stakes") return "High stakes";
  if (c === "variable") return "Clinical judgment";
  return "Standard";
};

export function LabInterpretationPanel({
  labRow,
  patientGender,
  primaryProgram,
  onApplyToRx,
  onSaved,
}: LabInterpretationPanelProps) {
  const [interpretation, setInterpretation] = useState<LabcorpInterpretation | null>(null);
  const [medicationRecs, setMedicationRecs] = useState<MedicationRecommendation[]>([]);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [protocolLinks, setProtocolLinks] = useState<Map<string, ProtocolLinkInfo>>(new Map());

  const values = useMemo(() => labResultRowToValues(labRow), [labRow]);

  const runAnalysis = useCallback(() => {
    const saved = parseInterpretationSnapshot(labRow.treatment_plan);
    if (saved?.interpretation) {
      setInterpretation(saved.interpretation);
      setSavedAt(saved.interpreted_at);
      setMedicationRecs(
        generateLabcorpMedicationRecommendations(saved.interpretation, values, patientGender),
      );
      return;
    }

    const result = analyzeLabcorpResults(values, patientGender, primaryProgram);
    setInterpretation(result);
    setSavedAt(null);
    setMedicationRecs(generateLabcorpMedicationRecommendations(result, values, patientGender));
  }, [labRow.treatment_plan, values, patientGender, primaryProgram]);

  useEffect(() => {
    runAnalysis();
  }, [runAnalysis]);

  useEffect(() => {
    if (!interpretation?.protocolSuggestions.length) {
      setProtocolLinks(new Map());
      return;
    }
    const slugs = interpretation.protocolSuggestions.flatMap((p) =>
      protocolSlugsForInterpretationKey(p.key),
    );
    let cancelled = false;
    fetchClinicalProtocolsBySlugs(slugs)
      .then((map) => {
        if (!cancelled) setProtocolLinks(map);
      })
      .catch(() => {
        if (!cancelled) setProtocolLinks(new Map());
      });
    return () => {
      cancelled = true;
    };
  }, [interpretation?.protocolSuggestions]);

  const handleReanalyze = () => {
    const result = analyzeLabcorpResults(values, patientGender, primaryProgram);
    setInterpretation(result);
    setSavedAt(null);
    setMedicationRecs(generateLabcorpMedicationRecommendations(result, values, patientGender));
    toast.message("Re-ran analysis from current lab values");
  };

  const handleSave = async () => {
    if (!interpretation) return;
    setIsSaving(true);
    try {
      const snapshot: LabInterpretationSnapshot = {
        version: 1,
        engine: "labcorp",
        interpreted_at: new Date().toISOString(),
        interpretation,
      };
      const alert = findingsSummaryForAlert(interpretation.findings);
      const { error } = await supabase
        .from("lab_results")
        .update({
          clinical_story: interpretation.story,
          treatment_plan: JSON.parse(JSON.stringify(snapshot)),
          correlation_alert: alert,
        })
        .eq("id", labRow.id);

      if (error) throw error;
      setSavedAt(snapshot.interpreted_at);
      toast.success("Interpretation saved to lab record");
      onSaved?.();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not save interpretation");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyToRx = () => {
    if (medicationRecs.length === 0) {
      toast.error("No formulary-linked recommendations for this panel");
      return;
    }
    const creamRecs = medicationRecs.filter((m) => m.formularyId.startsWith("male_") || m.formularyId.startsWith("female_") || m.formularyId === "biest" || m.formularyId === "progesterone_sleep");
    if (creamRecs.length > 0) {
      onApplyToRx?.(creamRecs);
      toast.success("Applied hormone cream recommendations to order card");
    } else {
      onApplyToRx?.(medicationRecs);
      toast.message("GLP-1 suggestion noted — use Rx portal / FCC for semaglutide orders");
    }
  };

  const copyStory = async () => {
    if (!interpretation?.story) return;
    try {
      await navigator.clipboard.writeText(interpretation.story);
      toast.success("Clinical summary copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  if (!interpretation) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
        Analyzing…
      </div>
    );
  }

  return (
    <div className="space-y-4 border-t border-border/50 pt-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium font-jost">LabCorp interpretation</span>
          {savedAt && (
            <Badge variant="outline" className="text-[10px]">
              Saved {new Date(savedAt).toLocaleDateString()}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="ghost" onClick={handleReanalyze}>
            Re-run
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={copyStory}>
            <Copy className="w-3 h-3 mr-1" />
            Copy
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">{interpretation.story}</p>

      {interpretation.monitoringAlerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-sm">Safety monitoring</AlertTitle>
          <AlertDescription className="text-xs space-y-1">
            {interpretation.monitoringAlerts.map((a) => (
              <p key={a}>{a}</p>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {interpretation.findings.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Findings</p>
          <ul className="space-y-2">
            {interpretation.findings.map((f) => (
              <li
                key={`${f.field}-${f.pattern}`}
                className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs"
              >
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-medium text-foreground">{f.label}</span>
                  {f.value != null && (
                    <span className="text-muted-foreground">
                      {f.value} {f.unit}
                    </span>
                  )}
                  <Badge variant={priorityVariant(f.priority)} className="text-[10px]">
                    {f.pattern}
                  </Badge>
                </div>
                <p className="text-muted-foreground leading-snug">{f.rationale}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {interpretation.protocolSuggestions.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Protocol suggestions (physician approval required)
            </p>
            {interpretation.protocolSuggestions.map((p) => {
              const slugs = protocolSlugsForInterpretationKey(p.key);
              return (
                <div
                  key={p.key}
                  className="flex items-start gap-2 text-xs rounded-md bg-accent/10 px-3 py-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{p.title}</p>
                    <p className="text-muted-foreground mt-0.5">{p.rationale}</p>
                    <Badge variant="outline" className="mt-1 text-[10px]">
                      {confidenceLabel(p.confidence)}
                    </Badge>
                    {slugs.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {slugs.map((slug) => {
                          const info = protocolLinks.get(slug);
                          const label = info?.title ?? slug;
                          const status = info?.versionStatus;
                          return (
                            <li key={slug}>
                              <Link
                                to={`/clinical-protocols/${slug}`}
                                className="inline-flex items-center gap-1 text-accent hover:underline font-medium"
                              >
                                <ExternalLink className="w-3 h-3 shrink-0" />
                                {label}
                              </Link>
                              {status && (
                                <Badge variant="outline" className="ml-2 text-[10px]">
                                  {status === "signed" ? "Signed" : "Draft — review required"}
                                </Badge>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    {p.key === "thyroid_evaluation" && slugs.length === 0 && (
                      <p className="text-muted-foreground mt-1 italic">
                        No seeded thyroid protocol yet — use clinical judgment and lab follow-up.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {medicationRecs.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Suggested therapies
            </p>
            {medicationRecs.map((m) => (
              <div key={m.formularyId} className="text-xs border border-border/50 rounded-lg p-3">
                <p className="font-medium text-foreground">
                  {m.name} — {m.strength}
                </p>
                <p className="text-muted-foreground mt-1">{m.rationale}</p>
              </div>
            ))}
            <div className="flex flex-wrap gap-2 pt-1">
              {onApplyToRx && (
                <Button type="button" size="sm" onClick={handleApplyToRx}>
                  <Pill className="w-3.5 h-3.5 mr-1" />
                  Apply to order card
                </Button>
              )}
              <Button type="button" size="sm" variant="secondary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5 mr-1" />
                )}
                Save to record
              </Button>
            </div>
          </div>
        </>
      )}

      <p className="text-[10px] text-muted-foreground italic">
        Decision support only — not a prescription. Physician must confirm dosing, consents, and contraindications.
      </p>
    </div>
  );
}
