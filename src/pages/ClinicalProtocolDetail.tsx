import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Loader2, Pencil, ShieldCheck, ClipboardList } from "lucide-react";
import { toast } from "sonner";

type ClinicalProtocol = Tables<"clinical_protocols">;
type ClinicalProtocolVersion = Tables<"clinical_protocol_versions">;

type ReviewerItem = {
  note: string;
  resolved: boolean;
  resolved_at?: string | null;
  resolved_by?: string | null;
};

type StructuredBody = {
  indication?: string;
  contraindications?: string[];
  exclusion_criteria?: string[];
  pre_administration_checks?: string[];
  dosing?: Record<string, string>;
  administration?: string[];
  monitoring_during?: string[];
  monitoring_post?: string[];
  patient_education?: string[];
  escalation_criteria?: string[];
  documentation_required?: string[];
  adverse_event_response?: {
    mild?: string[];
    moderate?: string[];
    severe?: string[];
  };
};

function parseReviewerItems(raw: Json | null): ReviewerItem[] {
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

export default function ClinicalProtocolDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [protocol, setProtocol] = useState<ClinicalProtocol | null>(null);
  const [version, setVersion] = useState<ClinicalProtocolVersion | null>(null);
  const [history, setHistory] = useState<ClinicalProtocolVersion[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reviewerItems, setReviewerItems] = useState<ReviewerItem[]>([]);
  const [execOpen, setExecOpen] = useState(false);
  const [patientQuery, setPatientQuery] = useState("");
  const [patientHits, setPatientHits] = useState<Array<Pick<Tables<"patients">, "id" | "full_name">>>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [execNotes, setExecNotes] = useState("");

  const structured = useMemo(() => {
    const raw = version?.body_structured;
    if (!raw || typeof raw !== "object") return null;
    return raw as StructuredBody;
  }, [version]);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Not signed in");
        navigate("/admin/login");
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const admin = roles?.some((r) => r.role === "admin") ?? false;
      setIsAdmin(admin);

      const { data: p, error: pErr } = await supabase
        .from("clinical_protocols")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (pErr) throw pErr;
      if (!p) {
        setProtocol(null);
        setVersion(null);
        return;
      }
      setProtocol(p);

      if (!p.current_version_id) {
        setVersion(null);
        setHistory([]);
        return;
      }

      const { data: v, error: vErr } = await supabase
        .from("clinical_protocol_versions")
        .select("*")
        .eq("id", p.current_version_id)
        .maybeSingle();
      if (vErr) throw vErr;
      setVersion(v as ClinicalProtocolVersion);
      setReviewerItems(parseReviewerItems(v?.notes_for_reviewer ?? null));

      const { data: hist, error: hErr } = await supabase
        .from("clinical_protocol_versions")
        .select("*")
        .eq("protocol_id", p.id)
        .order("version_number", { ascending: false });
      if (hErr) throw hErr;
      setHistory((hist ?? []) as ClinicalProtocolVersion[]);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load protocol");
    } finally {
      setLoading(false);
    }
  }, [slug, navigate]);

  useEffect(() => {
    void load();
  }, [load]);

  const allReviewerResolved =
    reviewerItems.length > 0 && reviewerItems.every((i) => i.resolved);

  const persistReviewerItems = async (items: ReviewerItem[]) => {
    if (!version) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const payload = items.map((it) => ({
      note: it.note,
      resolved: it.resolved,
      resolved_at: it.resolved ? it.resolved_at ?? new Date().toISOString() : null,
      resolved_by: it.resolved ? it.resolved_by ?? user.id : null,
    }));
    const { error } = await supabase
      .from("clinical_protocol_versions")
      .update({ notes_for_reviewer: payload as unknown as Json })
      .eq("id", version.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setReviewerItems(items);
    toast.success("Reviewer checklist updated");
  };

  const toggleReviewer = async (index: number, checked: boolean) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const next = reviewerItems.map((it, i) =>
      i === index
        ? {
            ...it,
            resolved: checked,
            resolved_at: checked ? new Date().toISOString() : null,
            resolved_by: checked ? user?.id ?? null : null,
          }
        : it
    );
    await persistReviewerItems(next);
  };

  const handleSign = async () => {
    if (!version) return;
    if (!allReviewerResolved) {
      toast.error("Resolve all reviewer notes before signing");
      return;
    }
    const { data, error } = await supabase
      .rpc("sign_clinical_protocol_version", {
        version_id: version.id,
      })
      .maybeSingle();
    if (error || !data) {
      toast.error(error?.message ?? "Sign failed");
      return;
    }
    toast.success("Protocol version signed");
    setVersion(data as ClinicalProtocolVersion);
    void load();
  };

  const handleRetire = async () => {
    if (!version || !protocol) return;
    const { error: vErr } = await supabase
      .from("clinical_protocol_versions")
      .update({ status: "retired", retired_at: new Date().toISOString() })
      .eq("id", version.id);
    if (vErr) {
      toast.error(vErr.message);
      return;
    }
    const { error: pErr } = await supabase
      .from("clinical_protocols")
      .update({ is_active: false, current_version_id: null })
      .eq("id", protocol.id);
    if (pErr) {
      toast.error(pErr.message);
      return;
    }
    toast.success("Protocol retired");
    navigate("/clinical-protocols");
  };

  const searchPatients = async () => {
    const q = patientQuery.trim();
    if (q.length < 2) {
      setPatientHits([]);
      return;
    }
    const { data, error } = await supabase
      .from("patients")
      .select("id, full_name")
      .ilike("full_name", `%${q}%`)
      .limit(8);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPatientHits((data ?? []) as Array<Pick<Tables<"patients">, "id" | "full_name">>>);
  };

  const logExecution = async () => {
    if (!version || !selectedPatientId) {
      toast.error("Select a patient");
      return;
    }
    if (version.status !== "signed") {
      toast.error("Only signed protocol versions can be executed");
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("clinical_protocol_executions").insert({
      protocol_version_id: version.id,
      patient_id: selectedPatientId,
      executed_by: user.id,
      notes: execNotes.trim() || null,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Execution logged");
    setExecOpen(false);
    setExecNotes("");
    setSelectedPatientId(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!protocol || !version) {
    return (
      <div className="container mx-auto px-4 py-12 text-center space-y-4">
        <p className="text-muted-foreground font-jost">Protocol not found or not visible for your role.</p>
        <Button asChild variant="outline">
          <Link to="/clinical-protocols">Back to library</Link>
        </Button>
      </div>
    );
  }

  if (!isAdmin && version.status !== "signed") {
    return (
      <div className="container mx-auto px-4 py-12 text-center space-y-4">
        <p className="text-muted-foreground font-jost">This protocol is not yet signed for clinical use.</p>
        <Button asChild variant="outline">
          <Link to="/clinical-protocols">Back to library</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-8 font-jost">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
            <Link to="/clinical-protocols">← Clinical protocols</Link>
          </Button>
          <h1 className="font-playfair text-3xl text-foreground">{protocol.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="outline">{protocol.category}</Badge>
            <Badge variant="secondary">v{version.version_number}</Badge>
            <Badge>{version.status}</Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/clinical-protocols/${protocol.slug}/edit`}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
          )}
          {!isAdmin && version.status === "signed" && (
            <Button variant="default" size="sm" onClick={() => setExecOpen(true)}>
              <ClipboardList className="h-4 w-4 mr-2" />
              Mark executed for patient
            </Button>
          )}
        </div>
      </div>

      {isAdmin && reviewerItems.length > 0 && (
        <Card className="border-amber-500/60 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="font-playfair text-lg text-amber-900 dark:text-amber-100 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Awaiting your review
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Check each item after you have verified it in practice. Signing unlocks only when every item is checked.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviewerItems.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 rounded-md border border-border/60 bg-background/80 p-3">
                <Checkbox
                  id={`rev-${idx}`}
                  checked={item.resolved}
                  onCheckedChange={(c) => void toggleReviewer(idx, c === true)}
                />
                <Label htmlFor={`rev-${idx}`} className="text-sm leading-relaxed cursor-pointer">
                  {item.note}
                </Label>
              </div>
            ))}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => void handleSign()}
                disabled={!allReviewerResolved || version.status === "signed"}
              >
                Sign this version
              </Button>
              <Button size="sm" variant="outline" className="text-destructive" onClick={() => void handleRetire()}>
                Retire protocol
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-playfair text-xl">Protocol narrative</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-foreground">
            {version.body_markdown}
          </div>
        </CardContent>
      </Card>

      {structured && (
        <div className="space-y-4">
          <h2 className="font-playfair text-2xl">Structured fields</h2>
          {structured.indication && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base font-playfair">Indication</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">{structured.indication}</CardContent>
            </Card>
          )}
          {!!structured.contraindications?.length && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base font-playfair">Contraindications</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {structured.contraindications.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {structured.dosing && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base font-playfair">Dosing</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm md:grid-cols-2">
                {Object.entries(structured.dosing).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-muted-foreground capitalize">{k.replaceAll("_", " ")}: </span>
                    <span>{v}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="flex w-full justify-between px-0">
            <span className="font-playfair text-lg">Version history</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {history.map((h) => (
            <div
              key={h.id}
              className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2 text-sm"
            >
              <span>
                v{h.version_number} — {h.status}
              </span>
              <span className="text-muted-foreground text-xs">
                {new Date(h.updated_at).toLocaleString()}
              </span>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Dialog open={execOpen} onOpenChange={setExecOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log protocol execution</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Find patient</Label>
              <div className="flex gap-2 mt-1">
                <Input value={patientQuery} onChange={(e) => setPatientQuery(e.target.value)} placeholder="Name" />
                <Button type="button" variant="secondary" onClick={() => void searchPatients()}>
                  Search
                </Button>
              </div>
              <div className="mt-2 space-y-1">
                {patientHits.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`block w-full rounded border px-2 py-1 text-left text-sm ${
                      selectedPatientId === p.id ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    onClick={() => setSelectedPatientId(p.id)}
                  >
                    {p.full_name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea className="mt-1" value={execNotes} onChange={(e) => setExecNotes(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExecOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void logExecution()}>Save execution</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
