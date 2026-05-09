import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { ArrowDown, ArrowUp, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

type ClinicalProtocol = Tables<"clinical_protocols">;
type ClinicalProtocolVersion = Tables<"clinical_protocol_versions">;

type DosingFields = {
  medication: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
};

type AdverseEventResponse = {
  mild: string[];
  moderate: string[];
  severe: string[];
};

type StructuredBody = {
  indication: string;
  contraindications: string[];
  exclusion_criteria: string[];
  pre_administration_checks: string[];
  dosing: DosingFields;
  administration: string[];
  monitoring_during: string[];
  monitoring_post: string[];
  patient_education: string[];
  escalation_criteria: string[];
  documentation_required: string[];
  adverse_event_response: AdverseEventResponse;
};

type ReviewerItem = {
  note: string;
  resolved: boolean;
  resolved_at?: string | null;
  resolved_by?: string | null;
};

const EMPTY_DOSING: DosingFields = {
  medication: "",
  dose: "",
  route: "",
  frequency: "",
  duration: "",
};

const EMPTY_BODY: StructuredBody = {
  indication: "",
  contraindications: [],
  exclusion_criteria: [],
  pre_administration_checks: [],
  dosing: { ...EMPTY_DOSING },
  administration: [],
  monitoring_during: [],
  monitoring_post: [],
  patient_education: [],
  escalation_criteria: [],
  documentation_required: [],
  adverse_event_response: { mild: [], moderate: [], severe: [] },
};

const ALL_SECTIONS = [
  "sec-indication",
  "sec-contraindications",
  "sec-pre",
  "sec-dosing",
  "sec-administration",
  "sec-monitoring",
  "sec-education",
  "sec-escalation",
  "sec-documentation",
  "sec-aer",
];

function asStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string");
}

function normalizeStructured(raw: Json | null | undefined): StructuredBody {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...EMPTY_BODY, dosing: { ...EMPTY_DOSING }, adverse_event_response: { mild: [], moderate: [], severe: [] } };
  }
  const o = raw as Record<string, unknown>;
  const dosingRaw = (o.dosing && typeof o.dosing === "object" && !Array.isArray(o.dosing) ? o.dosing : {}) as Record<
    string,
    unknown
  >;
  const aerRaw = (o.adverse_event_response && typeof o.adverse_event_response === "object" && !Array.isArray(o.adverse_event_response)
    ? o.adverse_event_response
    : {}) as Record<string, unknown>;

  return {
    indication: typeof o.indication === "string" ? o.indication : "",
    contraindications: asStringArray(o.contraindications),
    exclusion_criteria: asStringArray(o.exclusion_criteria),
    pre_administration_checks: asStringArray(o.pre_administration_checks),
    dosing: {
      medication: typeof dosingRaw.medication === "string" ? dosingRaw.medication : "",
      dose: typeof dosingRaw.dose === "string" ? dosingRaw.dose : "",
      route: typeof dosingRaw.route === "string" ? dosingRaw.route : "",
      frequency: typeof dosingRaw.frequency === "string" ? dosingRaw.frequency : "",
      duration: typeof dosingRaw.duration === "string" ? dosingRaw.duration : "",
    },
    administration: asStringArray(o.administration),
    monitoring_during: asStringArray(o.monitoring_during),
    monitoring_post: asStringArray(o.monitoring_post),
    patient_education: asStringArray(o.patient_education),
    escalation_criteria: asStringArray(o.escalation_criteria),
    documentation_required: asStringArray(o.documentation_required),
    adverse_event_response: {
      mild: asStringArray(aerRaw.mild),
      moderate: asStringArray(aerRaw.moderate),
      severe: asStringArray(aerRaw.severe),
    },
  };
}

function parseReviewerItems(raw: Json | null | undefined): ReviewerItem[] {
  if (!raw || !Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      if (row && typeof row === "object" && "note" in row) {
        const o = row as Record<string, unknown>;
        return {
          note: String(o.note ?? ""),
          resolved: Boolean(o.resolved),
          resolved_at: (o.resolved_at as string | null | undefined) ?? null,
          resolved_by: (o.resolved_by as string | null | undefined) ?? null,
        };
      }
      return null;
    })
    .filter((x): x is ReviewerItem => !!x && !!x.note);
}

type DynamicListProps = {
  label?: string;
  helper?: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
};

function DynamicList({ label, helper, values, onChange, placeholder, disabled }: DynamicListProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const focusIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (focusIndexRef.current !== null) {
      const idx = focusIndexRef.current;
      const el = inputRefs.current[idx];
      if (el) {
        el.focus();
      }
      focusIndexRef.current = null;
    }
  }, [values]);

  const updateAt = (idx: number, value: string) => {
    const next = values.slice();
    next[idx] = value;
    onChange(next);
  };

  const removeAt = (idx: number) => {
    const next = values.slice();
    next.splice(idx, 1);
    onChange(next);
  };

  const moveUp = (idx: number) => {
    if (idx <= 0) return;
    const next = values.slice();
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    focusIndexRef.current = idx - 1;
    onChange(next);
  };

  const moveDown = (idx: number) => {
    if (idx >= values.length - 1) return;
    const next = values.slice();
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    focusIndexRef.current = idx + 1;
    onChange(next);
  };

  const addRow = () => {
    focusIndexRef.current = values.length;
    onChange([...values, ""]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (idx === values.length - 1) {
        addRow();
      } else {
        focusIndexRef.current = idx + 1;
        const next = inputRefs.current[idx + 1];
        if (next) next.focus();
      }
    }
  };

  return (
    <div className="space-y-2">
      {label ? <Label className="text-sm">{label}</Label> : null}
      {helper ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
      {values.length === 0 ? (
        <p className="text-xs italic text-muted-foreground">No items yet.</p>
      ) : (
        <ul className="space-y-2">
          {values.map((value, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="mt-2 text-xs tabular-nums text-muted-foreground w-6 text-right select-none">
                {idx + 1}.
              </span>
              <Input
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                value={value}
                onChange={(e) => updateAt(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                placeholder={placeholder ?? "Add an item…"}
                className="flex-1"
                disabled={disabled}
              />
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => moveUp(idx)}
                  disabled={disabled || idx === 0}
                  aria-label="Move up"
                  className="h-9 w-9"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => moveDown(idx)}
                  disabled={disabled || idx === values.length - 1}
                  aria-label="Move down"
                  className="h-9 w-9"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => removeAt(idx)}
                  disabled={disabled}
                  aria-label="Remove item"
                  className="h-9 w-9 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Button type="button" size="sm" variant="outline" onClick={addRow} disabled={disabled}>
        <Plus className="h-4 w-4 mr-1" /> Add row
      </Button>
    </div>
  );
}

export default function ClinicalProtocolEditor() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [protocol, setProtocol] = useState<ClinicalProtocol | null>(null);
  const [version, setVersion] = useState<ClinicalProtocolVersion | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [structured, setStructured] = useState<StructuredBody>(EMPTY_BODY);
  const [reviewerItems, setReviewerItems] = useState<ReviewerItem[]>([]);
  const [savedSnapshot, setSavedSnapshot] = useState<{ markdown: string; structured: string }>({
    markdown: "",
    structured: JSON.stringify(EMPTY_BODY),
  });
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const isLocked = version?.status === "signed" || version?.status === "retired";

  const dirty = useMemo(() => {
    const cur = JSON.stringify(structured);
    return markdown !== savedSnapshot.markdown || cur !== savedSnapshot.structured;
  }, [markdown, structured, savedSnapshot]);

  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  const savingRef = useRef(saving);
  savingRef.current = saving;

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/admin/login");
        return;
      }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const admin = roles?.some((r) => r.role === "admin") ?? false;
      setIsAdmin(admin);
      if (!admin) {
        toast.error("Only admins can edit clinical protocols");
        navigate(`/clinical-protocols/${slug}`);
        return;
      }

      const { data: p, error: pErr } = await supabase
        .from("clinical_protocols")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (pErr) throw pErr;
      if (!p || !p.current_version_id) {
        setProtocol(null);
        setVersion(null);
        return;
      }
      setProtocol(p);

      const { data: v, error: vErr } = await supabase
        .from("clinical_protocol_versions")
        .select("*")
        .eq("id", p.current_version_id)
        .maybeSingle();
      if (vErr) throw vErr;
      if (!v) {
        setVersion(null);
        return;
      }
      setVersion(v as ClinicalProtocolVersion);
      const md = v.body_markdown ?? "";
      const body = normalizeStructured(v.body_structured);
      setMarkdown(md);
      setStructured(body);
      setReviewerItems(parseReviewerItems(v.notes_for_reviewer));
      setSavedSnapshot({ markdown: md, structured: JSON.stringify(body) });
      setLastSavedAt(null);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load editor");
    } finally {
      setLoading(false);
    }
  }, [slug, navigate]);

  useEffect(() => {
    void load();
  }, [load]);

  const persist = useCallback(
    async (nextStatus: "draft" | "pending_signature", silent: boolean) => {
      if (!version) return false;
      if (isLocked) {
        if (!silent) toast.error("Signed or retired versions are immutable.");
        return false;
      }
      setSaving(true);
      try {
        const payload: { body_markdown: string; body_structured: Json; status?: string } = {
          body_markdown: markdown,
          body_structured: structured as unknown as Json,
        };
        if (nextStatus !== version.status) {
          payload.status = nextStatus;
        }
        const { data, error } = await supabase
          .from("clinical_protocol_versions")
          .update(payload)
          .eq("id", version.id)
          .select("*")
          .maybeSingle();
        if (error) throw error;
        if (data) {
          setVersion(data as ClinicalProtocolVersion);
        }
        setSavedSnapshot({ markdown, structured: JSON.stringify(structured) });
        setLastSavedAt(new Date());
        if (!silent) {
          toast.success(nextStatus === "pending_signature" ? "Submitted for signature" : "Draft saved");
        }
        return true;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Save failed";
        if (!silent) toast.error(msg);
        else console.warn("Auto-save failed", msg);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [version, markdown, structured, isLocked],
  );

  useEffect(() => {
    if (!version || isLocked) return;
    const interval = setInterval(() => {
      if (!dirtyRef.current || savingRef.current) return;
      void persist("draft", true);
    }, 30_000);
    return () => clearInterval(interval);
  }, [version, isLocked, persist]);

  const handleSaveDraft = () => void persist("draft", false);
  const handleSubmitForSignature = async () => {
    const ok = await persist("pending_signature", false);
    if (ok) navigate(`/clinical-protocols/${slug}`);
  };
  const handleCancel = () => {
    if (dirty) {
      setConfirmCancel(true);
    } else {
      navigate(`/clinical-protocols/${slug}`);
    }
  };

  const updateField = <K extends keyof StructuredBody>(key: K, value: StructuredBody[K]) => {
    setStructured((prev) => ({ ...prev, [key]: value }));
  };

  const updateDosing = (key: keyof DosingFields, value: string) => {
    setStructured((prev) => ({ ...prev, dosing: { ...prev.dosing, [key]: value } }));
  };

  const updateAer = (key: keyof AdverseEventResponse, next: string[]) => {
    setStructured((prev) => ({
      ...prev,
      adverse_event_response: { ...prev.adverse_event_response, [key]: next },
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin || !protocol || !version) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground font-jost mb-4">Unable to load editor.</p>
        <Button asChild variant="outline">
          <Link to="/clinical-protocols">Back</Link>
        </Button>
      </div>
    );
  }

  let saveLabel: string;
  let saveTone = "text-muted-foreground";
  if (saving) {
    saveLabel = "Saving…";
  } else if (dirty) {
    saveLabel = "Unsaved changes";
    saveTone = "text-amber-700";
  } else if (lastSavedAt) {
    saveLabel = `Saved at ${lastSavedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    saveTone = "text-emerald-700";
  } else {
    saveLabel = "All changes saved";
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6 font-jost">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-1">
            <Link to={`/clinical-protocols/${slug}`}>← Back to protocol</Link>
          </Button>
          <h1 className="font-playfair text-2xl text-foreground">Edit {protocol.title}</h1>
          <p className="text-sm text-muted-foreground">
            Version {version.version_number} — {version.status}. Resolve the reviewer checklist on the detail page before
            signing.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" /> : null}
          <span className={saveTone}>{saveLabel}</span>
        </div>
      </div>

      {isLocked ? (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="py-4 text-sm text-amber-900">
            This version is {version.status} and cannot be edited. Create a new version from the detail page to make
            changes.
          </CardContent>
        </Card>
      ) : null}

      {reviewerItems.length > 0 ? (
        <Card className="border-amber-200 bg-amber-50/60">
          <CardHeader>
            <CardTitle className="font-playfair text-base text-amber-900">Notes from drafter</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm text-amber-900">
              {reviewerItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span className="flex-1">{item.note}</span>
                  {item.resolved ? (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                      Resolved
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-900 hover:bg-amber-100">
                      Open
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-amber-900/80">
              Read-only here. Check off items on the detail page once they're addressed.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="font-playfair text-lg">Structured protocol fields</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={ALL_SECTIONS} className="w-full">
            <AccordionItem value="sec-indication">
              <AccordionTrigger>Clinical Indication</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <Label className="text-sm">What clinical scenario does this protocol address?</Label>
                <Textarea
                  rows={3}
                  value={structured.indication}
                  onChange={(e) => updateField("indication", e.target.value)}
                  placeholder="e.g. Restoration of micronutrient status in fatigued adults presenting at the IV lounge…"
                  disabled={isLocked}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sec-contraindications">
              <AccordionTrigger>Contraindications & Exclusions</AccordionTrigger>
              <AccordionContent className="space-y-6">
                <DynamicList
                  label="Absolute contraindications"
                  helper="Conditions that bar this protocol entirely."
                  values={structured.contraindications}
                  onChange={(v) => updateField("contraindications", v)}
                  placeholder="e.g. Active sepsis"
                  disabled={isLocked}
                />
                <DynamicList
                  label="Exclusion criteria"
                  helper="Patient factors that disqualify someone from this protocol (separate from clinical contraindications)."
                  values={structured.exclusion_criteria}
                  onChange={(v) => updateField("exclusion_criteria", v)}
                  placeholder="e.g. Pregnancy"
                  disabled={isLocked}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sec-pre">
              <AccordionTrigger>Pre-Administration</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <DynamicList
                  label="Pre-administration checks"
                  helper="Required confirmations before the agent is given."
                  values={structured.pre_administration_checks}
                  onChange={(v) => updateField("pre_administration_checks", v)}
                  placeholder="e.g. Confirm consent on file"
                  disabled={isLocked}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sec-dosing">
              <AccordionTrigger>Dosing</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="dose-medication" className="text-sm">
                      Medication
                    </Label>
                    <Input
                      id="dose-medication"
                      value={structured.dosing.medication}
                      onChange={(e) => updateDosing("medication", e.target.value)}
                      placeholder="e.g. Sermorelin acetate 9 mg/mL"
                      disabled={isLocked}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dose-dose" className="text-sm">
                      Dose
                    </Label>
                    <Input
                      id="dose-dose"
                      value={structured.dosing.dose}
                      onChange={(e) => updateDosing("dose", e.target.value)}
                      placeholder="e.g. 0.3 mL (300 mcg)"
                      disabled={isLocked}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dose-route" className="text-sm">
                      Route
                    </Label>
                    <Input
                      id="dose-route"
                      value={structured.dosing.route}
                      onChange={(e) => updateDosing("route", e.target.value)}
                      placeholder="e.g. Subcutaneous, abdominal"
                      disabled={isLocked}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dose-frequency" className="text-sm">
                      Frequency
                    </Label>
                    <Input
                      id="dose-frequency"
                      value={structured.dosing.frequency}
                      onChange={(e) => updateDosing("frequency", e.target.value)}
                      placeholder="e.g. Nightly at bedtime"
                      disabled={isLocked}
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="dose-duration" className="text-sm">
                      Duration
                    </Label>
                    <Input
                      id="dose-duration"
                      value={structured.dosing.duration}
                      onChange={(e) => updateDosing("duration", e.target.value)}
                      placeholder="e.g. 12 weeks, then re-evaluate"
                      disabled={isLocked}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sec-administration">
              <AccordionTrigger>Administration</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <DynamicList
                  label="Administration steps"
                  helper="Ordered procedural steps the clinician follows during administration."
                  values={structured.administration}
                  onChange={(v) => updateField("administration", v)}
                  placeholder="e.g. Confirm bag label and patient identity (two identifiers)"
                  disabled={isLocked}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sec-monitoring">
              <AccordionTrigger>Monitoring</AccordionTrigger>
              <AccordionContent className="space-y-6">
                <DynamicList
                  label="Monitoring during administration"
                  helper="What to watch for while the patient is in chair or in clinic."
                  values={structured.monitoring_during}
                  onChange={(v) => updateField("monitoring_during", v)}
                  placeholder="e.g. Q15-min vitals during NAD+ infusion"
                  disabled={isLocked}
                />
                <DynamicList
                  label="Monitoring post-administration"
                  helper="Follow-up labs, follow-up calls, scheduled reassessments."
                  values={structured.monitoring_post}
                  onChange={(v) => updateField("monitoring_post", v)}
                  placeholder="e.g. Repeat hormone panel at 12 weeks"
                  disabled={isLocked}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sec-education">
              <AccordionTrigger>Patient Education</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <DynamicList
                  label="Patient education points"
                  helper="Teach-back items the clinician must cover before discharge."
                  values={structured.patient_education}
                  onChange={(v) => updateField("patient_education", v)}
                  placeholder="e.g. Hydrate well for 24 hours after infusion"
                  disabled={isLocked}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sec-escalation">
              <AccordionTrigger>Escalation Criteria</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <DynamicList
                  label="When to escalate"
                  helper="Triggers that require pausing administration or contacting the medical director."
                  values={structured.escalation_criteria}
                  onChange={(v) => updateField("escalation_criteria", v)}
                  placeholder="e.g. SBP drops below 90 mmHg"
                  disabled={isLocked}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sec-documentation">
              <AccordionTrigger>Documentation</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <DynamicList
                  label="Documentation required"
                  helper="What the clinician must record in the chart for this protocol."
                  values={structured.documentation_required}
                  onChange={(v) => updateField("documentation_required", v)}
                  placeholder="e.g. Lot number, expiry, site of injection"
                  disabled={isLocked}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sec-aer">
              <AccordionTrigger>Adverse Event Response</AccordionTrigger>
              <AccordionContent className="space-y-6">
                <DynamicList
                  label="Mild reactions"
                  helper="Examples: nausea, mild flushing, minor injection-site reaction."
                  values={structured.adverse_event_response.mild}
                  onChange={(v) => updateAer("mild", v)}
                  placeholder="Action for a mild reaction"
                  disabled={isLocked}
                />
                <DynamicList
                  label="Moderate reactions"
                  helper="Examples: hypotension, urticaria, persistent vomiting."
                  values={structured.adverse_event_response.moderate}
                  onChange={(v) => updateAer("moderate", v)}
                  placeholder="Action for a moderate reaction"
                  disabled={isLocked}
                />
                <DynamicList
                  label="Severe reactions"
                  helper="Examples: anaphylaxis, syncope, chest pain — call 911."
                  values={structured.adverse_event_response.severe}
                  onChange={(v) => updateAer("severe", v)}
                  placeholder="Action for a severe reaction"
                  disabled={isLocked}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-playfair text-lg">Markdown body</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground">
            The markdown body persists independently of the structured fields. (Auto-generation from the structured form
            is a future enhancement — for now both are saved as you edit them.)
          </p>
          <Textarea
            rows={16}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="font-mono text-sm"
            disabled={isLocked}
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 sticky bottom-0 bg-background/95 backdrop-blur border-t pt-4 -mx-4 px-4">
        <div className="text-xs">
          <span className={saveTone}>{saveLabel}</span>
          {dirty ? <span className="text-muted-foreground"> · auto-saves every 30s</span> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={handleSaveDraft} disabled={isLocked || saving}>
            Save as draft
          </Button>
          <Button onClick={() => void handleSubmitForSignature()} disabled={isLocked || saving}>
            Submit for signature
          </Button>
        </div>
      </div>

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved edits to this protocol. Cancelling will discard them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmCancel(false);
                navigate(`/clinical-protocols/${slug}`);
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
