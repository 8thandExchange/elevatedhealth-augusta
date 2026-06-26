import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, DollarSign, Pill, RefreshCw, Copy, Mail, Check } from "lucide-react";

interface HormoneAddonSelectorProps {
  patientId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  currentHasAddon?: boolean;
  baseMembership?: "semaglutide" | "tirzepatide" | null;
}

const BASE_MEMBERSHIPS = [
  { value: "semaglutide", label: "Semaglutide Membership", price: 349 },
  { value: "tirzepatide", label: "Tirzepatide Membership", price: 449 },
];

const HORMONE_ADDON_PRICE = 149;

const HormoneAddonSelector = ({
  patientId,
  patientName,
  patientEmail,
  patientPhone,
  currentHasAddon = false,
  baseMembership = "semaglutide",
}: HormoneAddonSelectorProps) => {
  const [includeHormones, setIncludeHormones] = useState(currentHasAddon);
  const [selectedMembership, setSelectedMembership] = useState<"semaglutide" | "tirzepatide">(baseMembership || "semaglutide");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const selectedBase = BASE_MEMBERSHIPS.find(m => m.value === selectedMembership);
  const basePrice = selectedBase?.price || 349;
  const addonPrice = includeHormones ? HORMONE_ADDON_PRICE : 0;
  const totalMonthly = basePrice + addonPrice;

  const firstName = patientName.split(" ")[0] || patientName;

  const handleUpdateMembership = async () => {
    if (!patientEmail) {
      toast.error("Patient email required to update subscription");
      return;
    }

    setIsUpdating(true);
    try {
      const { data, error } = await supabase.functions.invoke("update-subscription-addon", {
        body: {
          customer_email: patientEmail,
          include_hormone_addon: includeHormones,
          patient_id: patientId,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Membership updated! New total: ${data.monthly_total_formatted}`);
      } else {
        throw new Error(data?.error || "Failed to update subscription");
      }
    } catch (err: any) {
      console.error("Update error:", err);
      toast.error(err.message || "Failed to update membership");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!patientEmail) {
      toast.error("Patient email is required to send activation email");
      return;
    }

    setIsSendingEmail(true);
    setEmailSent(false);
    try {
      const { data, error } = await supabase.functions.invoke("send-activation-sms", {
        body: {
          first_name: firstName,
          phone: patientPhone || "",
          base_membership: selectedMembership,
          include_hormone_addon: includeHormones,
          patient_email: patientEmail,
          patient_id: patientId,
          send_email: true,
        },
      });

      if (error) throw error;

      if (data?.success) {
        setGeneratedLink(data.payment_link);
        if (data.email_sent) {
          setEmailSent(true);
          toast.success(`Activation email sent to ${patientEmail}!`);
        } else {
          toast.warning("Link generated but email could not be sent. Use copy link instead.");
        }
      } else {
        throw new Error(data?.error || "Failed to send activation email");
      }
    } catch (err: any) {
      console.error("Send email error:", err);
      toast.error(err.message || "Failed to send activation email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleCopyLink = async () => {
    if (!generatedLink) {
      try {
        const { data, error } = await supabase.functions.invoke("send-activation-sms", {
          body: {
            first_name: firstName,
            phone: patientPhone || "",
            base_membership: selectedMembership,
            include_hormone_addon: includeHormones,
            patient_email: patientEmail,
            send_email: false,
            send_sms: false,
          },
        });

        if (error) throw error;

        if (data?.success && data?.payment_link) {
          setGeneratedLink(data.payment_link);
          await navigator.clipboard.writeText(data.payment_link);
          toast.success("Payment link copied to clipboard!");
        }
      } catch (err: any) {
        toast.error("Failed to generate link");
      }
    } else {
      await navigator.clipboard.writeText(generatedLink);
      toast.success("Payment link copied to clipboard!");
    }
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-primary">
          <Pill className="w-4 h-4" />
          GLP-1 + Hormone Pricing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">GLP-1 Medication</label>
          <Select value={selectedMembership} onValueChange={(v: "semaglutide" | "tirzepatide") => setSelectedMembership(v)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select medication" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              {BASE_MEMBERSHIPS.map((membership) => (
                <SelectItem key={membership.value} value={membership.value}>
                  <div className="flex items-center justify-between w-full">
                    <span>{membership.label}</span>
                    <span className="text-muted-foreground ml-4">${membership.price}/mo</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">Add Hormone Therapy?</label>
          <Select value={includeHormones ? "yes" : "no"} onValueChange={(v) => setIncludeHormones(v === "yes")}>
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background">
              <SelectItem value="no">
                <div className="flex items-center justify-between w-full">
                  <span>No Hormone Add-On</span>
                  <span className="text-muted-foreground ml-4">+$0/mo</span>
                </div>
              </SelectItem>
              <SelectItem value="yes">
                <div className="flex items-center justify-between w-full">
                  <span>Add Hormone Therapy</span>
                  <span className="text-muted-foreground ml-4">+$149/mo</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {includeHormones && (
            <p className="text-xs text-muted-foreground mt-1">
              Includes Bi-Est, Testosterone, and/or Progesterone as needed
            </p>
          )}
        </div>

        <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Monthly Bill Estimate</span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{selectedBase?.label}</span>
              <span>${basePrice}</span>
            </div>
            {includeHormones && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hormone Add-On</span>
                <span>+${HORMONE_ADDON_PRICE}</span>
              </div>
            )}
            <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold">
              <span>Total Monthly</span>
              <span className="text-primary text-lg">${totalMonthly}/mo</span>
            </div>
          </div>
        </div>

        {/* Send Actions */}
        <div className="space-y-2">
          <Button
            onClick={handleSendEmail}
            disabled={isSendingEmail || !patientEmail}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            {isSendingEmail ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : emailSent ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Mail className="w-4 h-4 mr-2" />
            )}
            {isSendingEmail ? "Sending..." : emailSent ? "Email Sent!" : "Send Activation Email"}
          </Button>
          
          {!patientEmail && (
            <p className="text-xs text-center text-amber-600">No email on file - add patient email to send</p>
          )}
        </div>

        {/* Fallback Copy Link */}
        <Button
          onClick={handleCopyLink}
          variant="ghost"
          className="w-full text-muted-foreground hover:text-foreground"
          size="sm"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy Payment Link
        </Button>

        {/* Update Existing Subscription */}
        {patientEmail && (
          <Button
            onClick={handleUpdateMembership}
            disabled={isUpdating || includeHormones === currentHasAddon}
            variant="outline"
            className="w-full"
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {isUpdating ? "Updating..." : "Update Existing Subscription"}
          </Button>
        )}

        {includeHormones === currentHasAddon && patientEmail && (
          <p className="text-xs text-center text-muted-foreground">
            Change hormone add-on selection to update subscription
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default HormoneAddonSelector;