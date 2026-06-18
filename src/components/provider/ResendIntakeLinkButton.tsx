import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Link2 } from "lucide-react";
import { toast } from "sonner";
import { PatientOutboundPreview } from "@/components/provider/PatientOutboundPreview";
import {
  buildIntakeLinkMessages,
  buildIntakeMagicLinkUrl,
  firstNameFromFullName,
} from "@/lib/intakeLinkMessages";

interface ResendIntakeLinkButtonProps {
  patientId: string;
  patientName: string;
  patientEmail?: string | null;
  patientPhone?: string | null;
}

export default function ResendIntakeLinkButton({
  patientId,
  patientName,
  patientEmail,
  patientPhone,
}: ResendIntakeLinkButtonProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"channels" | "preview">("channels");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendEmail, setSendEmail] = useState(Boolean(patientEmail));
  const [sendSms, setSendSms] = useState(Boolean(patientPhone));
  const [magicLinkToken, setMagicLinkToken] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const firstName = firstNameFromFullName(patientName);

  const previewMessages = useMemo(() => {
    if (!previewUrl) return null;
    return buildIntakeLinkMessages({
      context: "staff_resend",
      firstName,
      magicLinkUrl: previewUrl,
    });
  }, [previewUrl, firstName]);

  const resetDialog = () => {
    setStep("channels");
    setMagicLinkToken(null);
    setPreviewUrl(null);
    setLoadingPreview(false);
    setSending(false);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) resetDialog();
  };

  const handleContinueToPreview = async () => {
    const channels: ("email" | "sms")[] = [];
    if (sendEmail) channels.push("email");
    if (sendSms) channels.push("sms");

    if (channels.length === 0) {
      toast.error("Select at least one delivery channel");
      return;
    }

    setLoadingPreview(true);
    try {
      const { data: created, error: createError } = await supabase.functions.invoke(
        "create-intake-magic-link",
        { body: { patient_id: patientId } },
      );

      if (createError || !created?.token) {
        throw new Error(createError?.message ?? created?.error ?? "Failed to create intake link");
      }

      setMagicLinkToken(created.token as string);
      setPreviewUrl(buildIntakeMagicLinkUrl(created.token as string));
      setStep("preview");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to prepare preview");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSend = async () => {
    if (!magicLinkToken) return;

    const channels: ("email" | "sms")[] = [];
    if (sendEmail) channels.push("email");
    if (sendSms) channels.push("sms");

    setSending(true);
    try {
      const { data: sendData, error: sendError } = await supabase.functions.invoke(
        "send-intake-magic-link",
        {
          body: {
            patient_id: patientId,
            magic_link_token: magicLinkToken,
            context: "staff_resend",
            channels,
          },
        },
      );

      if (sendError) throw sendError;

      if (!sendData?.success) {
        const skipped = (sendData?.skipped_channels as { channel: string; reason: string }[]) ?? [];
        const reasons = skipped.map((s) => `${s.channel}: ${s.reason}`).join("; ");
        throw new Error(reasons || "No messages were delivered");
      }

      toast.success(
        `Intake link sent to ${patientName} via ${(sendData.delivered_channels as string[]).join(" and ")}`,
      );
      handleOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send intake link");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full border-accent/40"
        disabled={!patientEmail && !patientPhone}
        onClick={() => {
          setSendEmail(Boolean(patientEmail));
          setSendSms(Boolean(patientPhone));
          setOpen(true);
        }}
      >
        <Link2 className="mr-2 h-4 w-4" />
        Resend intake link
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent layout="pinned" className="max-h-[85vh] max-w-lg sm:max-w-lg">
          <DialogHeader className="border-b border-border px-6 py-4 pr-12 pt-10 text-left">
            <DialogTitle>Send intake link</DialogTitle>
            <DialogDescription>
              {step === "channels"
                ? `Choose how to deliver the intake link to ${patientName}. You'll preview the message before it goes out.`
                : "Review the message below. Nothing is sent until you confirm."}
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            {step === "channels" ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="resend-email"
                    checked={sendEmail}
                    onCheckedChange={(v) => setSendEmail(v === true)}
                    disabled={!patientEmail}
                  />
                  <Label htmlFor="resend-email" className="text-sm font-normal">
                    Email {patientEmail ? `(${patientEmail})` : "(not on file)"}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="resend-sms"
                    checked={sendSms}
                    onCheckedChange={(v) => setSendSms(v === true)}
                    disabled={!patientPhone}
                  />
                  <Label htmlFor="resend-sms" className="text-sm font-normal">
                    SMS {patientPhone ? `(${patientPhone})` : "(not on file)"}
                  </Label>
                </div>
              </div>
            ) : (
              previewMessages && (
                <PatientOutboundPreview
                  showEmail={sendEmail}
                  showSms={sendSms}
                  emailSubject={previewMessages.emailSubject}
                  emailText={previewMessages.emailText}
                  smsBody={previewMessages.smsBody}
                  note="The patient will open this link to complete intake forms and Tier 1 consents. Use the Consents section above to preview individual consent document text."
                />
              )
            )}
          </DialogBody>

          <DialogFooter className="border-t border-border px-6 py-4">
            {step === "channels" ? (
              <>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => void handleContinueToPreview()} disabled={loadingPreview}>
                  {loadingPreview ? <Loader2 className="h-4 w-4 animate-spin" /> : "Preview message"}
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={() => setStep("channels")} disabled={sending}>
                  Back
                </Button>
                <Button type="button" onClick={() => void handleSend()} disabled={sending}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send to patient"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
