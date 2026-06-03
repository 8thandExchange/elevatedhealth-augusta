import { useCallback, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import type { ConsentVersion } from "@/data/consents/types";
import type { ConsentType } from "@/data/consents/types";
import { consentTypeDisplayName } from "@/data/consents/medication-consent-mapping";
import { hashConsentBody } from "@/lib/consents/consent-helpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminNavbar from "@/components/admin/AdminNavbar";
import { ConsentDocumentDisplay } from "@/components/consents/ConsentDocumentDisplay";
import { SignatureHistoryView } from "@/components/consents/SignatureHistoryView";
import { toast } from "sonner";
import { ArrowLeft, Copy, Loader2, Plus, TriangleAlert } from "lucide-react";

const ALL_TYPES: ConsentType[] = [
  "terms_of_service",
  "hipaa_acknowledgment",
  "general_medical_treatment",
  "telehealth",
  "communication",
  "notice_of_privacy_practices",
  "hormone_therapy",
  "glp1",
  "research_peptide",
  "off_label",
];

function suggestNextVersionLabel(label: string): string {
  const t = label.trim();
  const m = t.match(/^v(\d+)\.(\d+)\.(\d+)$/i);
  if (!m) return `${t}-rev`;
  const [, maj, min, pat] = m;
  return `v${maj}.${min}.${Number(pat) + 1}`;
}

function truncateHash(hash: string): string {
  if (hash.length <= 14) return hash;
  return `${hash.slice(0, 12)}…`;
}

export default function ConsentVersionsAdmin() {
  const navigate = useNavigate();
  const [accessChecked, setAccessChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState<ConsentVersion[]>([]);
  const [sigCounts, setSigCounts] = useState<Record<string, number>>({});

  const [publishOpen, setPublishOpen] = useState(false);
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);
  const [affectedReconsentCount, setAffectedReconsentCount] = useState<number | null>(null);
  const [publishType, setPublishType] = useState<ConsentType>("hormone_therapy");
  const [activeForType, setActiveForType] = useState<ConsentVersion | null>(null);
  const [versionLabel, setVersionLabel] = useState("");
  const [effectiveFromLocal, setEffectiveFromLocal] = useState("");
  const [bodyMd, setBodyMd] = useState("");
  const [title, setTitle] = useState("");
  const [forceReConsent, setForceReConsent] = useState(false);
  const [changelogNotes, setChangelogNotes] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [docDialog, setDocDialog] = useState<{ title: string; body: string } | null>(null);
  const [historyVersionId, setHistoryVersionId] = useState<string | null>(null);
  const [historyLabel, setHistoryLabel] = useState("");

  const refreshVersions = useCallback(async () => {
    const { data, error } = await supabase
      .from("consent_versions")
      .select("*")
      .order("consent_type", { ascending: true })
      .order("effective_from", { ascending: false });

    if (error) throw error;
    const rows = (data ?? []) as ConsentVersion[];
    setVersions(rows);

    const counts: Record<string, number> = {};
    await Promise.all(
      rows.map(async (v) => {
        const { count, error: cErr } = await supabase
          .from("consent_records")
          .select("id", { count: "exact", head: true })
          .eq("consent_version_id", v.id);
        if (!cErr && count != null) counts[v.id] = count;
        else counts[v.id] = 0;
      }),
    );
    setSigCounts(counts);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          navigate("/admin/login");
          return;
        }
        const { data: isBiz, error } = await supabase.rpc("has_business_admin_role", {
          _user_id: user.id,
        });
        if (error) throw error;
        if (!cancelled) {
          setAllowed(!!isBiz);
          setAccessChecked(true);
          if (!isBiz) {
            toast.error("Business admin access required.");
            navigate("/provider/dashboard");
            return;
          }
          await refreshVersions();
        }
      } catch (e) {
        console.error(e);
        toast.error("Could not verify admin access.");
        navigate("/provider/dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, refreshVersions]);

  useEffect(() => {
    if (!publishOpen) return;
    let cancelled = false;
    void (async () => {
      const { data, error } = await supabase
        .from("consent_versions")
        .select("*")
        .eq("consent_type", publishType)
        .eq("is_active", true)
        .eq("legal_review_status", "approved")
        .order("effective_from", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;
      if (error || !data) {
        setActiveForType(null);
        setBodyMd("");
        setTitle("");
        setVersionLabel("v1.0.0");
        setEffectiveFromLocal(toLocalInput(new Date()));
        return;
      }
      const row = data as ConsentVersion;
      setActiveForType(row);
      setBodyMd(row.body_markdown);
      setTitle(row.title);
      setVersionLabel(suggestNextVersionLabel(row.version_label));
      setEffectiveFromLocal(toLocalInput(new Date()));
      setForceReConsent(false);
      setChangelogNotes("");
    })();
    return () => {
      cancelled = true;
    };
  }, [publishOpen, publishType]);

  const preparePublish = async () => {
    const trimmed = bodyMd.trim();
    if (!trimmed) {
      toast.error("Body markdown is required.");
      return;
    }

    if (forceReConsent && activeForType?.id) {
      const nowIso = new Date().toISOString();
      const { count, error: cErr } = await supabase
        .from("consent_records")
        .select("id", { count: "exact", head: true })
        .eq("consent_version_id", activeForType.id)
        .is("revoked_at", null)
        .gt("expires_at", nowIso);

      if (cErr) {
        toast.error(cErr.message);
        return;
      }
      setAffectedReconsentCount(count ?? 0);
      setPublishConfirmOpen(true);
      return;
    }

    await executePublish();
  };

  const executePublish = async () => {
    const trimmed = bodyMd.trim();
    if (!trimmed) {
      toast.error("Body markdown is required.");
      return;
    }

    setPublishing(true);
    setPublishConfirmOpen(false);
    try {
      const effectiveFromIso = localInputToIso(effectiveFromLocal);
      const hash = await hashConsentBody(trimmed);
      const priorId = activeForType?.id;
      const shouldTriggerReconsent = !!forceReConsent && !!priorId;

      if (priorId) {
        const priorPatch: {
          is_active: boolean;
          effective_to: string;
          force_re_consent_required?: boolean;
        } = {
          is_active: false,
          effective_to: effectiveFromIso,
        };
        if (forceReConsent) priorPatch.force_re_consent_required = true;

        const { error: upErr } = await supabase.from("consent_versions").update(priorPatch).eq("id", priorId);

        if (upErr) throw upErr;
      }

      const { data: inserted, error: insErr } = await supabase
        .from("consent_versions")
        .insert({
          consent_type: publishType,
          version_label:
            versionLabel.trim() ||
            (activeForType ? suggestNextVersionLabel(activeForType.version_label) : "v1.0.0"),
          title: title.trim() || activeForType?.title || consentTypeDisplayName(publishType),
          body_markdown: trimmed,
          body_hash: hash,
          effective_from: effectiveFromIso,
          effective_to: null,
          is_active: true,
          legal_review_status: "approved",
          changelog_notes: changelogNotes.trim() || null,
          force_re_consent_required: false,
        })
        .select("id")
        .single();

      if (insErr) throw insErr;

      if (shouldTriggerReconsent && priorId && inserted?.id) {
        const { data: trig, error: trigErr } = await supabase.functions.invoke("trigger-reconsent-requests", {
          body: { prior_version_id: priorId, new_version_id: inserted.id },
        });

        if (trigErr) {
          toast.error(`Published version, but re-consent fan-out failed: ${trigErr.message}`);
        } else if (trig?.errors?.length) {
          toast.error(`Re-consent partially failed: ${(trig.errors as string[]).slice(0, 3).join("; ")}`);
        } else {
          toast.success(
            `Published. Created ${trig?.requests_created ?? 0} re-consent request(s); ${trig?.links_sent ?? 0} magic link(s) sent.`,
          );
        }
      } else {
        toast.success("Published new consent version.");
      }

      setPublishOpen(false);
      await refreshVersions();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  const copyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      toast.success("Hash copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  if (!accessChecked || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        Loading…
      </div>
    );
  }

  if (!allowed) return null;

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar title="Consent Document Versions" subtitle="Legal catalog · Business admin" />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" size="sm" asChild>
            <Link to="/provider/dashboard" className="gap-2 flex items-center">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button type="button" onClick={() => setPublishOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Publish New Version
          </Button>
          <Button type="button" variant="outline" size="sm" asChild>
            <Link to="/admin/substance-acknowledgments">Substance acknowledgments</Link>
          </Button>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-playfair text-xl">Version catalog</CardTitle>
            <CardDescription>
              Publishing supersedes the prior active row for that consent type. Signatures on older rows stay valid until
              natural expiration unless you enable force re-consent on the superseded row (PR&nbsp;6 workflows).
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Effective from</TableHead>
                  <TableHead>Effective until</TableHead>
                  <TableHead>Force re-consent</TableHead>
                  <TableHead>Body hash</TableHead>
                  <TableHead className="text-right">Signatures</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {consentTypeDisplayName(v.consent_type as ConsentType)}
                    </TableCell>
                    <TableCell className="text-sm">{v.version_label}</TableCell>
                    <TableCell>{v.is_active ? <CheckBadge /> : <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(v.effective_from), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {v.effective_to ? format(new Date(v.effective_to), "MMM d, yyyy HH:mm") : "—"}
                    </TableCell>
                    <TableCell className="text-sm">{v.force_re_consent_required ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <code className="text-xs bg-muted px-1 rounded">{truncateHash(v.body_hash)}</code>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => void copyHash(v.body_hash)}
                          title="Copy full hash"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{sigCounts[v.id] ?? "—"}</TableCell>
                    <TableCell className="text-right space-x-1 whitespace-nowrap">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setDocDialog({
                            title: v.title,
                            body: v.body_markdown,
                          })
                        }
                      >
                        View document
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setHistoryVersionId(v.id);
                          setHistoryLabel(`${v.version_label} · ${consentTypeDisplayName(v.consent_type as ConsentType)}`);
                        }}
                      >
                        Signature history
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground max-w-3xl">
          Post-launch optimization ideas: nightly snapshot of computed consent compliance on patients, or a database view
          joining consent_records for dashboard rollups (see provider patient list badges).
        </p>
      </main>

      <AlertDialog open={publishConfirmOpen} onOpenChange={setPublishConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-playfair">Confirm re-consent fan-out</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              This will create re-consent requests for{" "}
              <span className="font-medium text-foreground">{affectedReconsentCount ?? "—"}</span> patient(s) with
              current valid signatures on the superseded version. They will receive email/SMS within minutes (where
              contact info and opt-outs allow).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={publishing}>Cancel</AlertDialogCancel>
            <Button type="button" disabled={publishing} onClick={() => void executePublish()}>
              {publishing ? "Publishing…" : "Publish & notify"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-playfair">Publish new version</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Consent type</Label>
              <Select value={publishType} onValueChange={(v) => setPublishType(v as ConsentType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {consentTypeDisplayName(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {activeForType && (
              <p className="text-sm text-muted-foreground">
                Current active:{" "}
                <span className="font-medium text-foreground">
                  {activeForType.version_label}
                </span>{" "}
                (effective {format(new Date(activeForType.effective_from), "MMM d, yyyy")})
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cv-version">New version label</Label>
                <Input id="cv-version" value={versionLabel} onChange={(e) => setVersionLabel(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cv-effective">Effective from (local)</Label>
                <Input
                  id="cv-effective"
                  type="datetime-local"
                  value={effectiveFromLocal}
                  onChange={(e) => setEffectiveFromLocal(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cv-title">Title</Label>
              <Input id="cv-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cv-body">Body (Markdown)</Label>
              <Textarea
                id="cv-body"
                className="min-h-[220px] font-mono text-sm"
                value={bodyMd}
                onChange={(e) => setBodyMd(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 p-3">
              <div>
                <p className="text-sm font-medium">Force re-consent</p>
                <p className="text-xs text-muted-foreground">
                  Marks the <em>superseded</em> row for PR&nbsp;6 re-consent workflows.
                </p>
              </div>
              <Switch checked={forceReConsent} onCheckedChange={setForceReConsent} />
            </div>

            {forceReConsent && (
              <Alert variant="destructive">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Clinical interruption risk</AlertTitle>
                <AlertDescription>
                  Patients with valid signatures on the prior version may be blocked from the next prescription until they
                  re-sign. Coordinate communication before enabling.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="cv-changelog">Changelog / notes (optional)</Label>
              <Textarea
                id="cv-changelog"
                value={changelogNotes}
                onChange={(e) => setChangelogNotes(e.target.value)}
                placeholder="What changed in this legal version?"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)}>
              Preview
            </Button>
            <Button type="button" onClick={() => void preparePublish()} disabled={publishing}>
              {publishing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing…
                </>
              ) : (
                "Publish version"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-playfair">{title || "Preview"}</DialogTitle>
          </DialogHeader>
          <ConsentDocumentDisplay bodyMarkdown={bodyMd} enforceScroll={false} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!docDialog} onOpenChange={(o) => !o && setDocDialog(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-playfair">{docDialog?.title}</DialogTitle>
          </DialogHeader>
          {docDialog && <ConsentDocumentDisplay bodyMarkdown={docDialog.body} enforceScroll={false} />}
        </DialogContent>
      </Dialog>

      <Dialog open={!!historyVersionId} onOpenChange={(o) => !o && setHistoryVersionId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-playfair">Signature history</DialogTitle>
          </DialogHeader>
          {historyVersionId && (
            <SignatureHistoryView consentVersionId={historyVersionId} consentTypeLabel={historyLabel} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CheckBadge() {
  return (
    <Badge variant="outline" className="border-green-600/40 bg-green-500/10 text-green-800">
      ✓
    </Badge>
  );
}

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${y}-${m}-${day}T${hh}:${mm}`;
}

function localInputToIso(local: string): string {
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}
