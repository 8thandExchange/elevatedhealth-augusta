import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { ChevronDown, ExternalLink, Loader2 } from "lucide-react";
import { format } from "date-fns";
import type { EncounterType, PatientEncounter } from "@/data/encounters/types";
import { ENCOUNTER_TYPE_LABELS } from "@/data/encounters/types";
import {
  createEncounterDraft,
  logEncounterAction,
  saveEncounterDraft,
  saveEncounterVitals,
  signEncounter,
  type EncounterDraftFields,
  type VitalsInput,
} from "@/lib/encounters/encounter-helpers";
import { supabase } from "@/integrations/supabase/client";
import { getEprescribeUrl } from "@/lib/encounters/eprescribe-url";
import type { EncounterAttachment } from "@/data/encounters/types";

const ENCOUNTER_TYPES = Object.keys(ENCOUNTER_TYPE_LABELS) as EncounterType[];

export interface EncounterFormProps {
  patientId: string;
  encounterId?: string;
  mode: "create" | "edit" | "amend" | "view";
  defaultEncounterType?: EncounterType;
  onSaved?: (encounter: PatientEncounter) => void;
  onSigned?: (encounter: PatientEncounter) => void;
  onCancel?: () => void;
}

export function EncounterForm({
  patientId,
  encounterId: encounterIdProp,
  mode,
  defaultEncounterType = "wellness_assessment",
  onSaved,
  onSigned,
  onCancel,
}: EncounterFormProps) {
  const readOnly = mode === "view";
  const [resolvedId, setResolvedId] = useState<string | null>(encounterIdProp ?? null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [amendBanner, setAmendBanner] = useState<{ name: string; date: string } | null>(null);

  const [encounterType, setEncounterType] = useState<EncounterType>(defaultEncounterType);
  const [encounterDate, setEncounterDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");
  const [medicationsPrescribed, setMedicationsPrescribed] = useState("");
  const [followUpPlan, setFollowUpPlan] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [status, setStatus] = useState<PatientEncounter["status"]>("draft");

  const [vitals, setVitals] = useState<VitalsInput>({});

  const [attachments, setAttachments] = useState<EncounterAttachment[]>([]);
  const [vitalsOpen, setVitalsOpen] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);

  const autosaveTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewedLogged = useRef(false);
  const createStarted = useRef(false);

  const loadEncounter = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { data: enc, error: eErr } = await supabase.from("patient_encounters").select("*").eq("id", id).single();
      if (eErr || !enc) throw new Error(eErr?.message ?? "Not found");
      const row = enc as PatientEncounter;
      setStatus(row.status);
      setEncounterType((row.encounter_type as EncounterType) || "other");
      setEncounterDate(format(new Date(row.encounter_date), "yyyy-MM-dd'T'HH:mm"));
      setChiefComplaint(row.chief_complaint ?? "");
      setSubjective(row.subjective ?? "");
      setObjective(row.objective ?? "");
      setAssessment(row.assessment ?? "");
      setPlan(row.plan ?? "");
      setMedicationsPrescribed(row.medications_prescribed ?? "");
      setFollowUpPlan(row.follow_up_plan ?? "");
      setInternalNotes(row.internal_notes ?? "");

      if (row.amends_encounter_id) {
        const { data: prior } = await supabase
          .from("patient_encounters")
          .select("signed_at, signed_by_user_id")
          .eq("id", row.amends_encounter_id)
          .maybeSingle();
        if (prior?.signed_at) {
          setAmendBanner({
            name: (prior as { signed_by_user_id?: string }).signed_by_user_id
              ? `User ${String((prior as { signed_by_user_id: string }).signed_by_user_id).slice(0, 8)}…`
              : "Prior author",
            date: format(new Date((prior as { signed_at: string }).signed_at), "MMM d, yyyy h:mm a"),
          });
        }
      } else setAmendBanner(null);

      const { data: vRow } = await supabase
        .from("encounter_vitals")
        .select("*")
        .eq("encounter_id", id)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (vRow) {
        const v = vRow as Record<string, number | null>;
        setVitals({
          systolic_bp: v.systolic_bp ?? null,
          diastolic_bp: v.diastolic_bp ?? null,
          heart_rate: v.heart_rate ?? null,
          respiratory_rate: v.respiratory_rate ?? null,
          temperature_f: v.temperature_f != null ? Number(v.temperature_f) : null,
          weight_lbs: v.weight_lbs != null ? Number(v.weight_lbs) : null,
          height_inches: v.height_inches != null ? Number(v.height_inches) : null,
          spo2_pct: v.spo2_pct ?? null,
        });
      } else setVitals({});

      const { data: att } = await supabase.from("encounter_attachments").select("*").eq("encounter_id", id);
      setAttachments((att ?? []) as EncounterAttachment[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load encounter");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (mode === "create" && !encounterIdProp && !createStarted.current) {
        createStarted.current = true;
        try {
          const row = await createEncounterDraft(patientId, defaultEncounterType);
          if (!cancelled) {
            setResolvedId(row.id);
            setEncounterType((row.encounter_type as EncounterType) || defaultEncounterType);
            setStatus("draft");
            setLoading(false);
          }
        } catch (e) {
          if (!cancelled) {
            toast.error(e instanceof Error ? e.message : "Could not start encounter");
            setLoading(false);
          }
        }
        return;
      }
      const id = encounterIdProp ?? resolvedId;
      if (id) await loadEncounter(id);
      else if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, encounterIdProp, patientId, defaultEncounterType, resolvedId, loadEncounter]);

  useEffect(() => {
    const id = encounterIdProp ?? resolvedId;
    if (!id || !readOnly || viewedLogged.current) return;
    viewedLogged.current = true;
    void logEncounterAction(id, "viewed", {});
  }, [readOnly, encounterIdProp, resolvedId]);

  const persistDraft = useCallback(async () => {
    const id = encounterIdProp ?? resolvedId;
    if (!id || readOnly || status !== "draft") return;
    setSaving(true);
    try {
      const fields: EncounterDraftFields = {
        encounter_date: new Date(encounterDate).toISOString(),
        encounter_type: encounterType,
        chief_complaint: chiefComplaint || null,
        subjective: subjective || null,
        objective: objective || null,
        assessment: assessment || null,
        plan: plan || null,
        medications_prescribed: medicationsPrescribed || null,
        follow_up_plan: followUpPlan || null,
        internal_notes: internalNotes || null,
      };
      await saveEncounterDraft(id, fields);
      await saveEncounterVitals(id, vitals);
      setLastSavedAt(new Date());
      onSaved?.({ id, patient_id: patientId, status: "draft" } as PatientEncounter);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [
    encounterIdProp,
    resolvedId,
    readOnly,
    status,
    encounterDate,
    encounterType,
    chiefComplaint,
    subjective,
    objective,
    assessment,
    plan,
    medicationsPrescribed,
    followUpPlan,
    internalNotes,
    vitals,
    patientId,
    onSaved,
  ]);

  const persistRef = useRef(persistDraft);
  persistRef.current = persistDraft;

  useEffect(() => {
    if (readOnly || status !== "draft") return;
    autosaveTimer.current = window.setInterval(() => {
      void persistRef.current();
    }, 30000);
    return () => {
      if (autosaveTimer.current) clearInterval(autosaveTimer.current);
    };
  }, [readOnly, status]);

  const bmiPreview = useMemo(() => {
    const w = vitals.weight_lbs;
    const h = vitals.height_inches;
    if (!w || !h || h <= 0) return null;
    return Math.round(((w / (h * h)) * 703 + Number.EPSILON) * 10) / 10;
  }, [vitals.weight_lbs, vitals.height_inches]);

  const handleFile = async (file: File) => {
    const id = encounterIdProp ?? resolvedId;
    if (!id || readOnly || status !== "draft") return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const path = `${patientId}/${id}/${crypto.randomUUID()}_${file.name.replace(/\s+/g, "_")}`;
    const { error: upErr } = await supabase.storage.from("encounter-attachments").upload(path, file, {
      upsert: false,
      contentType: file.type || "application/pdf",
    });
    if (upErr) {
      toast.error(upErr.message);
      return;
    }
    const { data: ins, error: insErr } = await supabase
      .from("encounter_attachments")
      .insert({
        encounter_id: id,
        patient_id: patientId,
        attachment_type: "lab_result",
        file_name: file.name,
        storage_path: path,
        file_size_bytes: file.size,
        mime_type: file.type || null,
        uploaded_by_user_id: user.id,
      })
      .select("*")
      .single();
    if (insErr) {
      toast.error(insErr.message);
      return;
    }
    setAttachments((prev) => [...prev, ins as EncounterAttachment]);
    await logEncounterAction(id, "attachment_added", { path, file_name: file.name });
    toast.success("Attachment uploaded");
  };

  const removeAttachment = async (att: EncounterAttachment) => {
    if (readOnly || status !== "draft") return;
    const id = encounterIdProp ?? resolvedId;
    await supabase.storage.from("encounter-attachments").remove([att.storage_path]);
    await supabase.from("encounter_attachments").delete().eq("id", att.id);
    if (id) {
      await logEncounterAction(id, "attachment_removed", { id: att.id });
    }
    setAttachments((prev) => prev.filter((a) => a.id !== att.id));
  };

  const openAttachment = async (att: EncounterAttachment) => {
    const { data, error } = await supabase.storage.from("encounter-attachments").createSignedUrl(att.storage_path, 3600);
    if (error || !data?.signedUrl) {
      toast.error(error?.message ?? "Could not open file");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  if (loading && !resolvedId && mode === "create") {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        Starting encounter…
      </div>
    );
  }

  const id = encounterIdProp ?? resolvedId;
  if (!id) {
    return <p className="text-sm text-muted-foreground">No encounter selected.</p>;
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            {amendBanner && (
              <div className="mb-2 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm">
                Creating amendment to encounter signed by {amendBanner.name} on {amendBanner.date}
              </div>
            )}
            <h3 className="font-playfair text-lg font-light text-foreground">Encounter documentation</h3>
            <p className="text-xs text-muted-foreground">
              {readOnly ? "Signed — read only" : "Draft auto-saves every 30 seconds"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {lastSavedAt && !readOnly && (
              <span className="text-xs text-muted-foreground">
                Saved {format(lastSavedAt, "h:mm a")}
              </span>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="outline" size="sm" asChild>
                  <a href={getEprescribeUrl()} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open iPrescribe
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Opens your iPrescribe account in a new tab</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <section className="space-y-3 rounded-lg border border-border/60 p-4">
          <h4 className="text-sm font-medium text-foreground">Visit details</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Encounter date</Label>
              <Input
                type="datetime-local"
                value={encounterDate}
                onChange={(e) => setEncounterDate(e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Encounter type</Label>
              <Select value={encounterType} onValueChange={(v) => setEncounterType(v as EncounterType)} disabled={readOnly}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENCOUNTER_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {ENCOUNTER_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Chief complaint</Label>
            <Input value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} disabled={readOnly} />
          </div>
        </section>

        <Collapsible open={vitalsOpen} onOpenChange={setVitalsOpen}>
          <CollapsibleTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="gap-1 px-0">
              <ChevronDown className={`h-4 w-4 transition ${vitalsOpen ? "rotate-180" : ""}`} />
              Vitals (optional)
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Systolic BP</Label>
                <Input
                  type="number"
                  value={vitals.systolic_bp ?? ""}
                  onChange={(e) => setVitals((v) => ({ ...v, systolic_bp: e.target.value ? Number(e.target.value) : null }))}
                  disabled={readOnly}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Diastolic BP</Label>
                <Input
                  type="number"
                  value={vitals.diastolic_bp ?? ""}
                  onChange={(e) => setVitals((v) => ({ ...v, diastolic_bp: e.target.value ? Number(e.target.value) : null }))}
                  disabled={readOnly}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Heart rate (bpm)</Label>
                <Input
                  type="number"
                  value={vitals.heart_rate ?? ""}
                  onChange={(e) => setVitals((v) => ({ ...v, heart_rate: e.target.value ? Number(e.target.value) : null }))}
                  disabled={readOnly}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Temperature (°F)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={vitals.temperature_f ?? ""}
                  onChange={(e) => setVitals((v) => ({ ...v, temperature_f: e.target.value ? Number(e.target.value) : null }))}
                  disabled={readOnly}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Weight (lbs)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={vitals.weight_lbs ?? ""}
                  onChange={(e) => setVitals((v) => ({ ...v, weight_lbs: e.target.value ? Number(e.target.value) : null }))}
                  disabled={readOnly}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Height (in)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={vitals.height_inches ?? ""}
                  onChange={(e) => setVitals((v) => ({ ...v, height_inches: e.target.value ? Number(e.target.value) : null }))}
                  disabled={readOnly}
                />
              </div>
              <div className="space-y-1.5">
                <Label>BMI (calculated)</Label>
                <Input readOnly value={bmiPreview != null ? String(bmiPreview) : ""} className="bg-muted/40" />
              </div>
              <div className="space-y-1.5">
                <Label>Respiratory rate</Label>
                <Input
                  type="number"
                  value={vitals.respiratory_rate ?? ""}
                  onChange={(e) => setVitals((v) => ({ ...v, respiratory_rate: e.target.value ? Number(e.target.value) : null }))}
                  disabled={readOnly}
                />
              </div>
              <div className="space-y-1.5">
                <Label>SpO₂ (%)</Label>
                <Input
                  type="number"
                  value={vitals.spo2_pct ?? ""}
                  onChange={(e) => setVitals((v) => ({ ...v, spo2_pct: e.target.value ? Number(e.target.value) : null }))}
                  disabled={readOnly}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {["Subjective", "Objective", "Assessment", "Plan"].map((label, i) => {
          const key = ["subjective", "objective", "assessment", "plan"][i] as const;
          const val = [subjective, objective, assessment, plan][i];
          const set = [setSubjective, setObjective, setAssessment, setPlan][i];
          return (
            <section key={key} className="space-y-2">
              <Label>{label}</Label>
              <Textarea className="min-h-[120px]" value={val} onChange={(e) => set(e.target.value)} disabled={readOnly} />
            </section>
          );
        })}

        <section className="space-y-2">
          <Label>Medications prescribed (free text — iPrescribe)</Label>
          <Textarea value={medicationsPrescribed} onChange={(e) => setMedicationsPrescribed(e.target.value)} disabled={readOnly} />
        </section>
        <section className="space-y-2">
          <Label>Follow-up plan</Label>
          <Textarea value={followUpPlan} onChange={(e) => setFollowUpPlan(e.target.value)} disabled={readOnly} />
        </section>

        <section className="space-y-2">
          <Label>Attachments</Label>
          {!readOnly && status === "draft" && (
            <div>
              <Input
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                className="max-w-md"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFile(f);
                  e.target.value = "";
                }}
              />
            </div>
          )}
          <ul className="text-sm space-y-1">
            {attachments.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-2">
                <button type="button" className="text-accent underline" onClick={() => void openAttachment(a)}>
                  {a.file_name}
                </button>
                {!readOnly && status === "draft" && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => void removeAttachment(a)}>
                    Remove
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </section>

        <Collapsible open={internalOpen} onOpenChange={setInternalOpen}>
          <CollapsibleTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="gap-1 px-0">
              <ChevronDown className={`h-4 w-4 transition ${internalOpen ? "rotate-180" : ""}`} />
              Internal notes (staff only)
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Textarea
              className="min-h-[80px] mt-2"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              disabled={readOnly}
            />
          </CollapsibleContent>
        </Collapsible>

        {!readOnly && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
            <Button type="button" variant="outline" disabled={saving || status !== "draft"} onClick={() => void persistDraft()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Draft"}
            </Button>
            <Button type="button" disabled={status !== "draft"} onClick={() => setSignOpen(true)}>
              Sign and Lock
            </Button>
            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        )}

        <AlertDialog open={signOpen} onOpenChange={setSignOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign and lock encounter?</AlertDialogTitle>
              <AlertDialogDescription>
                Once signed, this encounter cannot be edited directly. Amendments will be tracked in the chart.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Back</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  void (async () => {
                    try {
                      await persistDraft();
                      const signed = await signEncounter(id);
                      setSignOpen(false);
                      setStatus("signed");
                      onSigned?.(signed);
                      toast.success("Encounter signed and locked.");
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Sign failed");
                    }
                  })();
                }}
              >
                Sign and lock
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
