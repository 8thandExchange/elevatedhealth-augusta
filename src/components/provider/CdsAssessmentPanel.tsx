import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Brain,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Loader2,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { format } from "date-fns";
import {
  ALL_PATIENT_GOALS,
  GOAL_LABELS,
  type PatientGoal,
} from "@/lib/clinicalPathwayEngine";
import type {
  CdsAssessment,
  CdsAssessmentResult,
  CdsAssessmentStatus,
  CdsProviderDecision,
  CdsProviderReview,
} from "@/lib/cdsTypes";
import type { CdsPathwaySummary } from "@/lib/cdsPathwayCatalog";
import {
  formatElevatedProgram,
  formatRecommendedLabPanel,
  goalLabel,
} from "@/lib/cdsPathwayCatalog";
import {
  canRecommendCandidate,
  gateBadgeClassName,
  GATE_STATE_LABELS,
  isRegulatoryBadgeStatus,
  regulatoryBadgeClassName,
  REGULATORY_STATUS_LABELS,
  requiresSubstanceAcknowledgment,
  shouldRouteToOrderLabs,
} from "@/lib/cdsUiHelpers";
import LabcorpOrderModal from "@/components/provider/LabcorpOrderModal";
import { SubstanceAcknowledgmentCapture } from "@/components/consents/SubstanceAcknowledgmentCapture";

const SYMPTOM_OPTIONS = [
  { key: "joint_pain", label: "Joint / tendon pain" },
  { key: "fatigue", label: "Fatigue" },
  { key: "low_libido", label: "Low libido" },
  { key: "weight_gain", label: "Weight gain" },
  { key: "brain_fog", label: "Brain fog" },
  { key: "poor_recovery", label: "Poor recovery" },
] as const;

export interface CdsAssessmentPanelProps {
  patientId: string;
  patientName: string;
  patientDob?: string | null;
  patientEmail?: string | null;
  patientStreet?: string | null;
  patientCity?: string | null;
  patientState?: string | null;
  patientZip?: string | null;
}

export default function CdsAssessmentPanel({
  patientId,
  patientName,
  patientDob,
  patientEmail,
  patientStreet,
  patientCity,
  patientState,
  patientZip,
}: CdsAssessmentPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [isPrescriber, setIsPrescriber] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [assessment, setAssessment] = useState<CdsAssessment | null>(null);
  const [results, setResults] = useState<CdsAssessmentResult[]>([]);
  const [review, setReview] = useState<CdsProviderReview | null>(null);
  const [pathwaySummary, setPathwaySummary] = useState<CdsPathwaySummary | null>(null);

  const [goalKey, setGoalKey] = useState<PatientGoal>("recovery_injury");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const [reviewDecision, setReviewDecision] = useState<CdsProviderDecision>("approved");
  const [reviewNotes, setReviewNotes] = useState("");

  const [labModalOpen, setLabModalOpen] = useState(false);
  const [ackSubstanceId, setAckSubstanceId] = useState<string | null>(null);
  const [parentConsentRecordId, setParentConsentRecordId] = useState<string | null>(null);

  const isReviewLocked = assessment?.status === "reviewed" || review != null;

  const loadRoles = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    setIsPrescriber((roles ?? []).some((r) => r.role === "provider"));
  }, []);

  const loadAssessmentBundle = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: rows, error } = await supabase
        .from("cds_assessments" as "patients")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      const row = (rows?.[0] ?? null) as unknown as CdsAssessment | null;
      setAssessment(row);

      if (!row) {
        setResults([]);
        setReview(null);
        setPathwaySummary(null);
        return;
      }

      if (row.pathway_id) {
        const { data: pathwayRow } = await supabase
          .from("cds_pathways" as "patients")
          .select(
            "id, slug, name, goal_key, recommended_lab_slug, elevated_program_key, staff_redirect_notes",
          )
          .eq("id", row.pathway_id)
          .maybeSingle();
        setPathwaySummary((pathwayRow ?? null) as unknown as CdsPathwaySummary | null);
      } else {
        setPathwaySummary(null);
      }

      if (row.goal_key) setGoalKey(row.goal_key as PatientGoal);
      setSymptoms(Array.isArray(row.symptoms_selected) ? row.symptoms_selected : []);
      setNotes(row.notes ?? "");

      const [{ data: resultRows, error: resErr }, { data: reviewRows, error: revErr }] =
        await Promise.all([
          supabase
            .from("cds_assessment_results" as "patients")
            .select("*")
            .eq("assessment_id", row.id)
            .order("rank_score", { ascending: false }),
          supabase
            .from("cds_provider_review" as "patients")
            .select("*")
            .eq("assessment_id", row.id)
            .maybeSingle(),
        ]);

      if (resErr) throw resErr;
      if (revErr) throw revErr;

      setResults((resultRows ?? []) as unknown as CdsAssessmentResult[]);
      setReview((reviewRows ?? null) as unknown as CdsProviderReview | null);

      if (reviewRows) {
        const rv = reviewRows as unknown as CdsProviderReview;
        setReviewDecision(rv.decision);
        setReviewNotes(rv.notes ?? "");
      }
    } catch (err: unknown) {
      console.error("CDS load error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to load CDS assessment");
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    if (!patientId || assessment?.pathway_id) return;
    void (async () => {
      const { data } = await supabase
        .from("cds_pathways" as "patients")
        .select(
          "id, slug, name, goal_key, recommended_lab_slug, elevated_program_key, staff_redirect_notes",
        )
        .eq("goal_key", goalKey)
        .eq("is_sample", false)
        .order("slug")
        .limit(1)
        .maybeSingle();
      if (data) setPathwaySummary(data as unknown as CdsPathwaySummary);
    })();
  }, [goalKey, patientId, assessment?.pathway_id]);

  useEffect(() => {
    if (patientId) void loadAssessmentBundle();
  }, [patientId, loadAssessmentBundle]);

  const toggleSymptom = (key: string) => {
    setSymptoms((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleCreateAssessment = async () => {
    if (!currentUserId) {
      toast.error("Not signed in");
      return;
    }
    try {
      const { data, error } = await supabase
        .from("cds_assessments" as "patients")
        .insert({
          patient_id: patientId,
          created_by: currentUserId,
          status: "draft",
          goal_key: goalKey,
          symptoms_selected: symptoms,
          notes: notes.trim() || null,
        })
        .select("*")
        .single();

      if (error) throw error;
      toast.success("CDS assessment draft created");
      setAssessment(data as unknown as CdsAssessment);
      setResults([]);
      setReview(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not create assessment");
    }
  };

  const handleUpdateDraft = async () => {
    if (!assessment || assessment.status !== "draft") return;
    try {
      const { error } = await supabase
        .from("cds_assessments" as "patients")
        .update({
          goal_key: goalKey,
          symptoms_selected: symptoms,
          notes: notes.trim() || null,
        })
        .eq("id", assessment.id);

      if (error) throw error;
      toast.success("Assessment updated");
      await loadAssessmentBundle();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not update assessment");
    }
  };

  const handleRunEngine = async () => {
    if (!assessment) return;
    setIsRunning(true);
    try {
      if (assessment.status === "draft") {
        await supabase
          .from("cds_assessments" as "patients")
          .update({
            goal_key: goalKey,
            symptoms_selected: symptoms,
            notes: notes.trim() || null,
          })
          .eq("id", assessment.id);
      }

      const { data, error } = await supabase.functions.invoke("run-cds-assessment", {
        body: { assessment_id: assessment.id },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.primary_pathway) {
        setPathwaySummary(data.primary_pathway as CdsPathwaySummary);
      }

      toast.success("CDS engine run complete");
      await loadAssessmentBundle();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Engine run failed");
    } finally {
      setIsRunning(false);
    }
  };

  const handleOpenSubstanceAck = async (candidateKey: string) => {
    try {
      const { data: consentRow, error } = await supabase
        .from("consent_records")
        .select("id")
        .eq("patient_id", patientId)
        .eq("consent_type", "research_peptide")
        .is("revoked_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("signed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!consentRow?.id) {
        toast.error("Patient needs an active Research Peptide consent before substance acknowledgment.");
        return;
      }

      setParentConsentRecordId(consentRow.id);
      setAckSubstanceId(candidateKey);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not load consent record");
    }
  };

  const handleSubmitReview = async () => {
    if (!assessment || !isPrescriber || !currentUserId) return;

    setIsSavingReview(true);
    try {
      const payload = {
        assessment_id: assessment.id,
        prescriber_id: currentUserId,
        decision: reviewDecision,
        notes: reviewNotes.trim() || null,
        modified_payload:
          reviewDecision === "modified"
            ? { candidate_keys: results.filter((r) => canRecommendCandidate(r.gate_state)).map((r) => r.candidate_key) }
            : null,
      };

      const { error: reviewErr } = review
        ? await supabase
            .from("cds_provider_review" as "patients")
            .update({
              decision: payload.decision,
              notes: payload.notes,
              modified_payload: payload.modified_payload,
            })
            .eq("id", review.id)
            .eq("prescriber_id", currentUserId)
        : await supabase.from("cds_provider_review" as "patients").insert(payload);

      if (reviewErr) throw reviewErr;

      const { error: statusErr } = await supabase
        .from("cds_assessments" as "patients")
        .update({ status: "reviewed" satisfies CdsAssessmentStatus })
        .eq("id", assessment.id);

      if (statusErr) throw statusErr;

      toast.success("Provider review recorded");
      await loadAssessmentBundle();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Prescriber approval failed — check your provider role",
      );
    } finally {
      setIsSavingReview(false);
    }
  };

  const statusLabel = useMemo(() => {
    if (!assessment) return "No assessment";
    switch (assessment.status) {
      case "awaiting_labs":
        return "Awaiting labs";
      case "awaiting_provider":
        return "Awaiting provider";
      case "reviewed":
        return "Reviewed";
      default:
        return "Draft";
    }
  }, [assessment]);

  return (
    <>
      <Card className="border-border">
        <CardHeader className="cursor-pointer" onClick={() => setIsExpanded((v) => !v)}>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-lg font-playfair">
              <Brain className="h-5 w-5 text-accent" />
              Clinical Decision Support
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-jost text-xs">
                {statusLabel}
              </Badge>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>
          <p className="font-jost text-sm text-muted-foreground font-normal">
            Staff runs assessments and surfaces candidates. Only a physician (provider role) may finalize via provider review.
          </p>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground font-jost text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading CDS…
              </div>
            ) : (
              <>
                {!assessment && (
                  <Alert>
                    <AlertDescription className="font-jost text-sm">
                      No CDS assessment on file for this patient. Create a draft, run the engine, then route labs or consent gaps before physician sign-off.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="font-jost">Patient goal</Label>
                    <Select
                      value={goalKey}
                      onValueChange={(v) => setGoalKey(v as PatientGoal)}
                      disabled={isReviewLocked}
                    >
                      <SelectTrigger className="font-jost">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_PATIENT_GOALS.map((g) => (
                          <SelectItem key={g} value={g}>
                            {GOAL_LABELS[g]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-jost">Symptoms (maps to pathway config)</Label>
                    <div className="flex flex-wrap gap-2">
                      {SYMPTOM_OPTIONS.map((s) => (
                        <button
                          key={s.key}
                          type="button"
                          disabled={isReviewLocked}
                          onClick={() => toggleSymptom(s.key)}
                          className={`font-jost text-xs px-3 py-1.5 rounded-full border transition-colors ${
                            symptoms.includes(s.key)
                              ? "bg-accent text-accent-foreground border-accent"
                              : "border-border hover:bg-muted"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {pathwaySummary && (
                  <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 font-jost text-sm">
                    <p className="font-medium text-foreground">{pathwaySummary.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Config pathway: <span className="font-mono">{pathwaySummary.slug}</span>
                      {" · "}
                      Goal: {goalLabel(pathwaySummary.goal_key)}
                    </p>
                    {(() => {
                      const lab = formatRecommendedLabPanel(pathwaySummary.recommended_lab_slug);
                      return (
                        <p>
                          <span className="text-muted-foreground">Baseline labs: </span>
                          {lab.displayPrice
                            ? `${lab.label} (${lab.displayPrice} non-member)`
                            : lab.label}
                        </p>
                      );
                    })()}
                    {pathwaySummary.elevated_program_key && (
                      <p>
                        <span className="text-muted-foreground">Program: </span>
                        {formatElevatedProgram(pathwaySummary.elevated_program_key)}
                      </p>
                    )}
                    {pathwaySummary.staff_redirect_notes && (
                      <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded p-2">
                        <span className="font-medium">Review redirects: </span>
                        {pathwaySummary.staff_redirect_notes}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="font-jost">Staff notes (internal)</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={isReviewLocked}
                    className="font-jost text-sm min-h-[72px]"
                    placeholder="Optional context for the physician queue…"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {!assessment && (
                    <Button type="button" className="font-jost" onClick={() => void handleCreateAssessment()}>
                      Create assessment draft
                    </Button>
                  )}
                  {assessment && assessment.status === "draft" && (
                    <Button type="button" variant="secondary" className="font-jost" onClick={() => void handleUpdateDraft()}>
                      Save draft
                    </Button>
                  )}
                  {assessment && !isReviewLocked && (
                    <Button
                      type="button"
                      className="font-jost gap-2"
                      disabled={isRunning}
                      onClick={() => void handleRunEngine()}
                    >
                      {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />}
                      Run CDS engine
                    </Button>
                  )}
                </div>

                {results.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-jost text-sm font-medium">Surfaced candidates</h3>
                    {results.map((row) => (
                      <div
                        key={row.id}
                        className="rounded-lg border border-border p-4 space-y-3 font-jost text-sm"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-foreground">{row.display_name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{row.candidate_key}</p>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {isRegulatoryBadgeStatus(row.regulatory_status) && (
                              <Badge className={regulatoryBadgeClassName(row.regulatory_status)}>
                                {REGULATORY_STATUS_LABELS[row.regulatory_status]}
                              </Badge>
                            )}
                            <Badge variant="outline" className={gateBadgeClassName(row.gate_state)}>
                              {GATE_STATE_LABELS[row.gate_state]}
                            </Badge>
                          </div>
                        </div>

                        {row.blocked_reason && (
                          <p className="text-xs text-muted-foreground">{row.blocked_reason}</p>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {shouldRouteToOrderLabs(row.gate_state) && (
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              className="font-jost gap-1"
                              onClick={() => setLabModalOpen(true)}
                            >
                              <FlaskConical className="h-3.5 w-3.5" />
                              Order labs
                            </Button>
                          )}

                          {requiresSubstanceAcknowledgment(row.gate_state) && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="font-jost"
                              onClick={() => void handleOpenSubstanceAck(row.candidate_key)}
                            >
                              Capture substance acknowledgment
                            </Button>
                          )}

                          {canRecommendCandidate(row.gate_state) && isReviewLocked && review?.decision === "approved" && (
                            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600 gap-1">
                              <ShieldCheck className="h-3 w-3" />
                              Cleared for Rx handoff
                            </Badge>
                          )}

                          {canRecommendCandidate(row.gate_state) && !isReviewLocked && (
                            <span className="text-xs text-muted-foreground self-center">
                              Awaiting physician approval — not yet recommendable
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {assessment && results.length === 0 && assessment.status !== "draft" && (
                  <p className="font-jost text-sm text-muted-foreground">
                    No active catalog candidates matched this pathway. Seed production rows in CDS config (prescriber-only).
                  </p>
                )}

                {assessment && results.some((r) => r.gate_state === "needs_labs") && (
                  <Alert>
                    <AlertDescription className="font-jost text-sm">
                      Lab gate active: route to <strong>Order labs</strong> — do not recommend therapies until resulted labs are on file in <code className="text-xs">lab_results</code>.
                    </AlertDescription>
                  </Alert>
                )}

                {assessment && !isReviewLocked && (
                  <div className="rounded-lg border border-accent/30 bg-muted/20 p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-accent" />
                      <h3 className="font-jost text-sm font-medium">Physician sign-off</h3>
                    </div>

                    {isPrescriber ? (
                      <>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label className="font-jost">Decision</Label>
                            <Select
                              value={reviewDecision}
                              onValueChange={(v) => setReviewDecision(v as CdsProviderDecision)}
                            >
                              <SelectTrigger className="font-jost">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="modified">Modified</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="font-jost">Provider notes</Label>
                          <Textarea
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            className="font-jost text-sm min-h-[72px]"
                            placeholder="Clinical rationale for approval, modification, or deferral…"
                          />
                        </div>
                        <Button
                          type="button"
                          className="font-jost"
                          disabled={isSavingReview}
                          onClick={() => void handleSubmitReview()}
                        >
                          {isSavingReview ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Finalize provider review
                        </Button>
                      </>
                    ) : (
                      <p className="font-jost text-sm text-muted-foreground">
                        RN/staff may run assessments and view candidates. Final approval requires a user with the <strong>provider</strong> role — RLS blocks non-prescribers from writing <code className="text-xs">cds_provider_review</code>.
                      </p>
                    )}
                  </div>
                )}

                {review && (
                  <div className="rounded-lg border border-emerald-600/30 bg-emerald-50/50 p-4 font-jost text-sm space-y-1">
                    <p className="font-medium text-emerald-900">
                      Provider review: {review.decision}
                    </p>
                    {review.notes && <p className="text-emerald-800">{review.notes}</p>}
                    <p className="text-xs text-emerald-700">
                      {format(new Date(review.created_at), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        )}
      </Card>

      <LabcorpOrderModal
        isOpen={labModalOpen}
        onClose={() => setLabModalOpen(false)}
        patient={{
          id: patientId,
          full_name: patientName,
          dob: patientDob ?? undefined,
          street_address: patientStreet,
          city: patientCity,
          state: patientState,
          zip_code: patientZip,
          email: patientEmail,
        }}
        onSuccess={() => {
          setLabModalOpen(false);
          toast.success("After results are filed, re-run the CDS engine.");
        }}
      />

      <Dialog open={!!ackSubstanceId} onOpenChange={(open) => !open && setAckSubstanceId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-playfair">Substance acknowledgment</DialogTitle>
          </DialogHeader>
          {ackSubstanceId && parentConsentRecordId && currentUserId && (
            <SubstanceAcknowledgmentCapture
              substanceId={ackSubstanceId}
              patientId={patientId}
              patientName={patientName}
              parentConsentRecordId={parentConsentRecordId}
              variant="staff_witnessed"
              staffWitnessUserId={currentUserId}
              onComplete={() => {
                setAckSubstanceId(null);
                toast.success("Acknowledgment saved — re-run CDS engine to refresh gates.");
              }}
              onCancel={() => setAckSubstanceId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
