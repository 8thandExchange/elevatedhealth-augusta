import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  Loader2,
  Send,
  Stethoscope,
} from "lucide-react";
import {
  gfeStatusLabel,
  isGfeClearanceCurrentlyValid,
  patientLikelyPaidConsult,
  pickActiveGfeClearance,
  shouldPromptForGfe,
  type GfeClearanceRow,
} from "@/lib/gfeClearance";
import { readEdgeFunctionError } from "@/lib/edgeFunctionError";
import { PatientOutboundPreview } from "@/components/provider/PatientOutboundPreview";
import { buildGfeLinkMessages, GFE_LINK_PLACEHOLDER } from "@/lib/gfeLinkMessages";
import { firstNameFromFullName } from "@/lib/intakeLinkMessages";

interface GfeClearanceCardProps {
  patientId: string;
  patientName: string;
  patientEmail: string | null;
  patientPhone: string | null;
  patientDob: string | null;
  onboardingStatus: string | null;
}

export function GfeClearanceCard({
  patientId,
  patientName,
  patientEmail,
  patientPhone,
  patientDob,
  onboardingStatus,
}: GfeClearanceCardProps) {
  const [rows, setRows] = useState<GfeClearanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendOpen, setSendOpen] = useState(false);
  const [sendStep, setSendStep] = useState<"channels" | "preview">("channels");
  const [inClinicOpen, setInClinicOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [sendEmail, setSendEmail] = useState(Boolean(patientEmail));
  const [sendSms, setSendSms] = useState(Boolean(patientPhone));
  const [inClinicNotes, setInClinicNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("gfe_clearances")
        .select(
          "id, patient_id, service_category, clearance_source, status, approved_at, expires_at, exam_name, provider_name, pdf_storage_path, sent_at, meeting_url, notes, created_at",
        )
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setRows((data as GfeClearanceRow[]) ?? []);
    } catch (e) {
      console.error(e);
      toast.error("Could not load GFE clearance status");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    void load();
  }, [load]);

  const active = pickActiveGfeClearance(rows);
  const latest = rows[0] ?? null;
  const consultPaid = patientLikelyPaidConsult(onboardingStatus);
  const canPrompt = consultPaid && shouldPromptForGfe(rows);
  const pendingRemote = rows.some((r) => r.status === "pending" && r.clearance_source === "qualiphy");

  const gfePreviewMessages = useMemo(
    () =>
      buildGfeLinkMessages({
        firstName: firstNameFromFullName(patientName),
        meetingUrl: GFE_LINK_PLACEHOLDER,
      }),
    [patientName],
  );

  const resetSendDialog = () => {
    setSendStep("channels");
    setSending(false);
  };

  const handleSendOpenChange = (open: boolean) => {
    setSendOpen(open);
    if (!open) resetSendDialog();
  };

  const handleSendRemote = async () => {
    const channels: ("email" | "sms")[] = [];
    if (sendEmail) channels.push("email");
    if (sendSms) channels.push("sms");
    if (channels.length === 0) {
      toast.error("Select at least one delivery channel");
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("qualiphy-send-gfe-invite", {
        body: { patient_id: patientId, channels },
      });
      if (error) {
        toast.error(await readEdgeFunctionError(error, "Failed to send GFE link"));
        return;
      }
      if (data?.error) {
        toast.error(String(data.error));
        return;
      }

      toast.success(
        `Remote GFE link sent to ${patientName} via ${(data.delivered_channels as string[])?.join(" and ") ?? "email"}`,
      );
      handleSendOpenChange(false);
      await load();
    } catch (e) {
      toast.error(await readEdgeFunctionError(e, "Failed to send GFE link"));
    } finally {
      setSending(false);
    }
  };

  const handleRecordInClinic = async () => {
    setRecording(true);
    try {
      const { data, error } = await supabase.functions.invoke("record-in-clinic-gfe", {
        body: { patient_id: patientId, notes: inClinicNotes.trim() || null },
      });
      if (error) {
        toast.error(await readEdgeFunctionError(error, "Failed to record in-clinic GFE"));
        return;
      }
      if (data?.error) {
        toast.error(String(data.error));
        return;
      }

      toast.success(`${patientName} marked as cleared in-clinic (valid 12 months).`);
      setInClinicOpen(false);
      setInClinicNotes("");
      await load();
    } catch (e) {
      toast.error(await readEdgeFunctionError(e, "Failed to record in-clinic GFE"));
    } finally {
      setRecording(false);
    }
  };

  const statusBadge = () => {
    if (loading) {
      return (
        <Badge variant="outline" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Loading…
        </Badge>
      );
    }
    if (active) {
      return (
        <Badge
          variant="outline"
          className="gap-1 border-green-600/40 bg-green-500/10 text-green-800 dark:text-green-200"
        >
          <CheckCircle2 className="h-3 w-3" />
          {gfeStatusLabel(active)}
        </Badge>
      );
    }
    if (pendingRemote) {
      return (
        <Badge variant="outline" className="gap-1 border-amber-500/50 bg-amber-500/10 text-amber-900">
          Awaiting remote GFE
        </Badge>
      );
    }
    if (!consultPaid) {
      return <Badge variant="outline">Wellness assessment not paid yet</Badge>;
    }
    return (
      <Badge variant="outline" className="gap-1 border-amber-500/50 bg-amber-500/10 text-amber-900">
        GFE needed
      </Badge>
    );
  };

  return (
    <>
      <Card id="patient-gfe-clearance" className="scroll-mt-4 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Good Faith Exam (Medical Clearance)
            </span>
            {statusBadge()}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Remote Qualiphy clearance is included with the $79 wellness assessment. Send manually when
            Dennis or Troy are unavailable — or record an in-clinic exam. Valid clearance suppresses
            prompts for 12 months.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {latest && !active && latest.status !== "pending" && (
            <p className="text-sm text-muted-foreground">{gfeStatusLabel(latest)}</p>
          )}

          {active?.clearance_source === "in_clinic" && active.provider_name && (
            <p className="text-xs text-muted-foreground">
              Cleared in-clinic by {active.provider_name}
            </p>
          )}

          {active?.clearance_source === "qualiphy" && active.exam_name && (
            <p className="text-xs text-muted-foreground">Qualiphy exam: {active.exam_name}</p>
          )}

          {pendingRemote && latest?.meeting_url && (
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={latest.meeting_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open pending exam link
              </a>
            </Button>
          )}

          {!consultPaid && (
            <p className="text-sm text-muted-foreground">
              Patient must pay the $79 wellness assessment before staff can send a remote GFE link or
              record clearance.
            </p>
          )}

          {consultPaid && !patientDob && canPrompt && (
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Add date of birth on the patient chart before sending a remote Qualiphy link.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {canPrompt && patientDob && (patientEmail || patientPhone) && (
              <Button type="button" size="sm" variant="default" onClick={() => setSendOpen(true)}>
                <Send className="mr-2 h-4 w-4" />
                Send remote GFE link
              </Button>
            )}
            {canPrompt && (
              <Button type="button" size="sm" variant="outline" onClick={() => setInClinicOpen(true)}>
                <Stethoscope className="mr-2 h-4 w-4" />
                Record in-clinic GFE
              </Button>
            )}
            {active && isGfeClearanceCurrentlyValid(active) && (
              <p className="w-full text-xs text-green-700 dark:text-green-300">
                No GFE action needed until{" "}
                {active.expires_at
                  ? new Date(active.expires_at).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "expiry"}
                .
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={sendOpen} onOpenChange={handleSendOpenChange}>
        <DialogContent layout="pinned" className="max-h-[85vh] max-w-lg sm:max-w-lg">
          <DialogHeader className="border-b border-border px-6 py-4 pr-12 pt-10 text-left">
            <DialogTitle>Send remote GFE link</DialogTitle>
            <DialogDescription>
              {sendStep === "channels"
                ? `Qualiphy medical clearance for ${patientName} — included with the $79 wellness assessment. Preview before sending.`
                : "Review the message below. The Qualiphy secure link is generated when you confirm."}
            </DialogDescription>
          </DialogHeader>

          {sendStep === "channels" ? (
            <DialogBody className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="gfe-email"
                  checked={sendEmail}
                  disabled={!patientEmail}
                  onCheckedChange={(v) => setSendEmail(v === true)}
                />
                <Label htmlFor="gfe-email">Email {patientEmail ? `(${patientEmail})` : "(missing)"}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="gfe-sms"
                  checked={sendSms}
                  disabled={!patientPhone}
                  onCheckedChange={(v) => setSendSms(v === true)}
                />
                <Label htmlFor="gfe-sms">SMS {patientPhone ? `(${patientPhone})` : "(missing)"}</Label>
              </div>
            </DialogBody>
          ) : (
            <DialogBody>
              <PatientOutboundPreview
                showEmail={sendEmail}
                showSms={sendSms}
                emailSubject={gfePreviewMessages.emailSubject}
                emailText={gfePreviewMessages.emailText}
                smsBody={gfePreviewMessages.smsBody}
                note="The actual Qualiphy meeting URL is unique per patient and inserted at send time."
              />
            </DialogBody>
          )}

          <DialogFooter className="border-t border-border px-6 py-4">
            {sendStep === "channels" ? (
              <>
                <Button type="button" variant="outline" onClick={() => handleSendOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    const channels: ("email" | "sms")[] = [];
                    if (sendEmail) channels.push("email");
                    if (sendSms) channels.push("sms");
                    if (channels.length === 0) {
                      toast.error("Select at least one delivery channel");
                      return;
                    }
                    setSendStep("preview");
                  }}
                >
                  Preview message
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={() => setSendStep("channels")} disabled={sending}>
                  Back
                </Button>
                <Button type="button" disabled={sending} onClick={() => void handleSendRemote()}>
                  {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Send to patient
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={inClinicOpen} onOpenChange={setInClinicOpen}>
        <AlertDialogContent layout="pinned">
          <AlertDialogHeader className="border-b border-border px-6 py-4 pt-6 text-left">
            <AlertDialogTitle>Record in-clinic GFE</AlertDialogTitle>
            <AlertDialogDescription>
              Use when Dennis, Troy, or another licensed provider completed the Good Faith Exam in
              person. This clears the patient for 12 months and stops remote GFE prompts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Textarea
              placeholder="Optional notes (provider name, date of exam, etc.)"
              value={inClinicNotes}
              onChange={(e) => setInClinicNotes(e.target.value)}
              rows={3}
            />
          </AlertDialogBody>
          <AlertDialogFooter className="px-6 py-4">
            <AlertDialogCancel disabled={recording}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={recording}
              onClick={(e) => {
                e.preventDefault();
                void handleRecordInClinic();
              }}
            >
              {recording ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm clearance
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default GfeClearanceCard;
