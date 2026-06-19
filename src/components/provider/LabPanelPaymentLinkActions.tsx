import { useState } from "react";
import { Button } from "@/components/ui/button";
import { labPanelDisplayPrice } from "@/lib/labPanelCheckout";
import { sendLabPanelPaymentLink } from "@/lib/sendLabPanelPaymentLink";
import { toast } from "sonner";
import { Copy, Loader2, Mail, MessageSquare } from "lucide-react";

interface LabPanelPaymentLinkActionsProps {
  panelSlug: string;
  panelName: string;
  patientId: string;
  patientName: string;
  patientEmail?: string | null;
  patientPhone?: string | null;
  isMember?: boolean;
  size?: "sm" | "default";
  className?: string;
}

/** Staff sends a mobile-friendly Stripe link for a clinical lab panel. */
export function LabPanelPaymentLinkActions({
  panelSlug,
  panelName,
  patientId,
  patientName,
  patientEmail,
  patientPhone,
  isMember = false,
  size = "sm",
  className,
}: LabPanelPaymentLinkActionsProps) {
  const [sending, setSending] = useState<"email" | "sms" | "copy" | null>(null);
  const priceLabel = labPanelDisplayPrice(panelSlug, isMember);

  const handleSend = async (method: "email" | "sms" | "copy") => {
    setSending(method);
    try {
      const result = await sendLabPanelPaymentLink({
        panelSlug,
        panelName,
        patientId,
        patientName,
        patientEmail,
        patientPhone,
        isMember,
        method,
      });
      if (method === "copy") {
        toast.success("Lab payment link copied — paste into a text or show QR on your phone.");
      } else if (method === "email") {
        toast.success(`Payment link emailed (${priceLabel})`);
      } else if (result.smsManualFallback) {
        toast.warning(result.deliveryNote ?? "Payment link copied — paste into Messages for the patient.");
      } else {
        toast.success(`Payment link texted (${priceLabel})`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send payment link");
    } finally {
      setSending(null);
    }
  };

  return (
    <div className={className}>
      <p className="text-[11px] text-muted-foreground mb-1.5">
        Collect {priceLabel} on the patient&apos;s phone before draw (Stripe Checkout). Email or Copy
        work today; Text requires Twilio setup in Supabase.
      </p>
      <div className="flex flex-wrap gap-1.5">
        <Button
          type="button"
          variant="outline"
          size={size}
          disabled={!patientEmail || sending !== null}
          onClick={() => void handleSend("email")}
        >
          {sending === "email" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
          ) : (
            <Mail className="h-3.5 w-3.5 mr-1" />
          )}
          Email link
        </Button>
        <Button
          type="button"
          variant="outline"
          size={size}
          disabled={!patientPhone || sending !== null}
          onClick={() => void handleSend("sms")}
        >
          {sending === "sms" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
          ) : (
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
          )}
          Text link
        </Button>
        <Button
          type="button"
          variant="ghost"
          size={size}
          disabled={!patientEmail || sending !== null}
          onClick={() => void handleSend("copy")}
        >
          {sending === "copy" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
          ) : (
            <Copy className="h-3.5 w-3.5 mr-1" />
          )}
          Copy link
        </Button>
      </div>
    </div>
  );
}

export default LabPanelPaymentLinkActions;
