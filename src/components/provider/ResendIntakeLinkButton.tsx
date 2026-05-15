import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Link2 } from "lucide-react";
import { toast } from "sonner";

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
  const [sending, setSending] = useState(false);
  const [sendEmail, setSendEmail] = useState(Boolean(patientEmail));
  const [sendSms, setSendSms] = useState(Boolean(patientPhone));

  const handleSend = async () => {
    const channels: ("email" | "sms")[] = [];
    if (sendEmail) channels.push("email");
    if (sendSms) channels.push("sms");

    if (channels.length === 0) {
      toast.error("Select at least one delivery channel");
      return;
    }

    setSending(true);
    try {
      const { data: created, error: createError } = await supabase.functions.invoke(
        "create-intake-magic-link",
        { body: { patient_id: patientId } },
      );

      if (createError || !created?.token) {
        throw new Error(createError?.message ?? created?.error ?? "Failed to create intake link");
      }

      const { data: sendData, error: sendError } = await supabase.functions.invoke(
        "send-intake-magic-link",
        {
          body: {
            patient_id: patientId,
            magic_link_token: created.token,
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
      setOpen(false);
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

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send intake link</AlertDialogTitle>
            <AlertDialogDescription>
              Send a new intake link to <strong>{patientName}</strong> for completing Tier 1 consents?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-2">
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
          <AlertDialogFooter>
            <AlertDialogCancel disabled={sending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); handleSend(); }} disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send link"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
