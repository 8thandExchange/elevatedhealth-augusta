import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Printer, Send } from "lucide-react";
import type { ConsentType } from "@/data/consents/types";
import type { ConsentRecord } from "@/data/consents/types";
import { consentTypeDisplayName } from "@/data/consents/medication-consent-mapping";
import {
  getPatientConsentStatus,
  getRequiredConsentTypesForPatient,
  tier2ConsentsNeedingAction,
  type PatientConsentStatus,
} from "@/lib/consents/patient-consent-status";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConsentDocumentDisplay } from "@/components/consents/ConsentDocumentDisplay";

interface PatientConsentStatusSectionProps {
  patientId: string;
  patientName: string;
  patientEmail: string | null;
  patientPhone: string | null;
}

function latestRecordMap(records: ConsentRecord[]): Map<ConsentType, ConsentRecord> {
  const sorted = [...records].sort(
    (a, b) => new Date(b.signed_at).getTime() - new Date(a.signed_at).getTime(),
  );
  const m = new Map<ConsentType, ConsentRecord>();
  for (const r of sorted) {
    const t = r.consent_type as ConsentType;
    if (!m.has(t)) m.set(t, r);
  }
  return m;
}

function rowStatusLabel(
  type: ConsentType,
  required: boolean,
  status: PatientConsentStatus,
  record: ConsentRecord | undefined,
): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  const now = Date.now();
  const graceMs = 30 * 24 * 60 * 60 * 1000;

  if (!required && !record) {
    return { label: "Not signed", variant: "outline" };
  }

  if (!record) {
    if (status.state === "missing_or_expired" && status.missingConsents.includes(type)) {
      return { label: "Missing", variant: "destructive" };
    }
    return { label: "Missing", variant: "destructive" };
  }

  if (record.revoked_at) {
    return { label: "Revoked", variant: "destructive" };
  }

  const exp = new Date(record.expires_at).getTime();
  if (exp > now) {
    const soon = exp - now <= 30 * 24 * 60 * 60 * 1000;
    if (soon) return { label: "Expiring soon", variant: "secondary" };
    return { label: "Signed", variant: "default" };
  }

  if (exp + graceMs > now) {
    return { label: "Grace period", variant: "secondary" };
  }

  return { label: "Expired", variant: "destructive" };
}

export function PatientConsentStatusSection({
  patientId,
  patientName,
  patientEmail,
  patientPhone,
}: PatientConsentStatusSectionProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<PatientConsentStatus | null>(null);
  const [required, setRequired] = useState<ConsentType[]>([]);
  const [records, setRecords] = useState<ConsentRecord[]>([]);
  const [previewDoc, setPreviewDoc] = useState<{ title: string; body: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [st, req, recRes] = await Promise.all([
        getPatientConsentStatus(patientId),
        getRequiredConsentTypesForPatient(patientId),
        supabase.from("consent_records").select("*").eq("patient_id", patientId).is("revoked_at", null),
      ]);
      setStatus(st);
      setRequired(req);
      setRecords((recRes.data as ConsentRecord[]) ?? []);
      if (recRes.error) throw recRes.error;
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not load consent status");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    void load();
  }, [load]);

  const byType = useMemo(() => latestRecordMap(records), [records]);

  const summaryLine = useMemo(() => {
    if (!status) return "";
    switch (status.state) {
      case "all_current":
        return "All required consents are current.";
      case "expiring_soon":
        return "Consents are valid; one or more renew soon (within ~30 days or grace window).";
      case "missing_or_expired":
        return `Consents needed: ${status.missingConsents.length} missing, ${status.expiredConsents.length} expired past grace.`;
      case "no_consents_signed":
        return "No consents on file yet.";
      default:
        return "";
    }
  }, [status]);

  const handleBulkTier2Send = async () => {
    if (!status) return;
    const tier2 = tier2ConsentsNeedingAction(status);
    if (tier2.length === 0) {
      toast.message("No Tier 2 treatment consents need delivery.", {
        description: "Use “Resend intake link” above if Tier 1 intake is incomplete.",
      });
      return;
    }

    const channels: ("email" | "sms")[] = [];
    if (patientEmail) channels.push("email");
    if (patientPhone) channels.push("sms");
    if (channels.length === 0) {
      toast.error("Patient needs email or phone on file.");
      return;
    }

    try {
      const { data: created, error: createError } = await supabase.functions.invoke(
        "create-intake-magic-link",
        { body: { patient_id: patientId, pending_consent_types: tier2 } },
      );
      if (createError || !created?.token) {
        throw new Error(createError?.message ?? created?.error ?? "Failed to create link");
      }

      const { data: sendData, error: sendError } = await supabase.functions.invoke("send-intake-magic-link", {
        body: {
          patient_id: patientId,
          magic_link_token: created.token,
          context: "tier2_consent_request",
          consent_types: tier2,
          channels,
        },
      });

      if (sendError) throw sendError;
      if (!sendData?.success) {
        throw new Error("Messages were not delivered — check channel availability.");
      }

      toast.success(
        `Consent request sent to ${patientName} via ${(sendData.delivered_channels as string[]).join(" & ")}.`,
      );
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Send failed");
    }
  };

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (!w || !printRef.current) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Consent summary — ${patientName}</title></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  const downloadSignedPdf = async (record: ConsentRecord) => {
    if (!record.pdf_storage_path) {
      toast.error("Signed PDF not available for this row.");
      return;
    }
    try {
      const { data, error } = await supabase.storage
        .from("signed-consents")
        .download(record.pdf_storage_path);
      if (error || !data) throw error ?? new Error("download failed");
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = record.pdf_storage_path.split("/").pop() ?? `${record.consent_type}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Could not download PDF.");
    }
  };

  const openVersionPreview = async (versionId: string, consentType: ConsentType) => {
    const { data, error } = await supabase.from("consent_versions").select("*").eq("id", versionId).maybeSingle();
    if (error || !data) {
      toast.error("Could not load consent version.");
      return;
    }
    setPreviewDoc({
      title: data.title || consentTypeDisplayName(consentType),
      body: data.body_markdown,
    });
  };

  const requiredSorted = useMemo(() => [...required].sort(), [required]);

  if (loading || !status) {
    return (
      <Card id="patient-consent-status" className="border-border/50">
        <CardContent className="flex items-center gap-2 py-8 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading consent status…
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card id="patient-consent-status" className="scroll-mt-4 scroll-mb-24 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-foreground">Consent Status</CardTitle>
          <p className="text-sm text-muted-foreground">{summaryLine}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div ref={printRef} className="rounded-md border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Consent</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Signed</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requiredSorted.map((t) => {
                  const rec = byType.get(t);
                  const rs = rowStatusLabel(t, true, status, rec);
                  return (
                    <TableRow key={t}>
                      <TableCell className="font-medium">{consentTypeDisplayName(t)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Yes</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={rs.variant}>{rs.label}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {rec ? format(new Date(rec.signed_at), "MMM d, yyyy") : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {rec ? format(new Date(rec.expires_at), "MMM d, yyyy") : "—"}
                      </TableCell>
                      <TableCell>
                        {rec ? (
                          <Button
                            type="button"
                            variant="link"
                            className="h-auto p-0 text-xs"
                            onClick={() => void openVersionPreview(rec.consent_version_id, t)}
                          >
                            View text
                          </Button>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {rec?.pdf_storage_path ? (
                          <Button type="button" variant="outline" size="sm" onClick={() => void downloadSignedPdf(rec)}>
                            Signed PDF
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="default" size="sm" onClick={() => void handleBulkTier2Send()}>
              <Send className="h-4 w-4 mr-2" />
              Send all needed consents to patient
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print consent summary
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Tier 2 “needed” list follows prescription gate logic (missing / expired past grace). Tier 1 intake uses the
            standard intake magic link when patients have not completed onboarding consents.
          </p>
        </CardContent>
      </Card>

      <Dialog open={!!previewDoc} onOpenChange={(o) => !o && setPreviewDoc(null)}>
        <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
          <DialogHeader className="static mx-0 shrink-0 border-b border-border px-6 py-4 pr-12 text-left">
            <DialogTitle className="font-playfair">{previewDoc?.title}</DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            {previewDoc && (
              <ConsentDocumentDisplay
                bodyMarkdown={previewDoc.body}
                enforceScroll={false}
                className="max-h-none border-0 px-0 py-0"
              />
            )}
          </div>
          <div className="shrink-0 border-t border-border bg-background px-6 py-4">
            <Button type="button" variant="default" className="w-full sm:w-auto" onClick={() => setPreviewDoc(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
