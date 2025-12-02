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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, DollarSign, Pill, RefreshCw, Link2, Copy, Mail, Check } from "lucide-react";

interface HormoneAddonSelectorProps {
  patientId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  currentTier?: string;
  baseMembership?: "metabolic" | "vitality" | null;
}

const ADDON_TIERS = [
  { value: "none", label: "None (GLP-1 Only)", price: 0, description: "No hormone add-on" },
  { value: "tier1", label: "Tier 1 - Single Hormone", price: 75, description: "Bi-Est, Testosterone, or Progesterone" },
  { value: "tier2", label: "Tier 2 - Dual Hormone", price: 125, description: "Two hormones (e.g., Bi-Est + Progesterone)" },
  { value: "tier3", label: "Tier 3 - Trifecta", price: 175, description: "All three: Bi-Est, Testosterone, Progesterone" },
];

const BASE_PRICES = {
  metabolic: 399,
  vitality: 199,
};

const HormoneAddonSelector = ({
  patientId,
  patientName,
  patientEmail,
  patientPhone,
  currentTier = "none",
  baseMembership = "metabolic",
}: HormoneAddonSelectorProps) => {
  const [selectedTier, setSelectedTier] = useState(currentTier);
  const [selectedMembership, setSelectedMembership] = useState<"metabolic" | "vitality">(baseMembership || "metabolic");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);

  const selectedAddon = ADDON_TIERS.find(t => t.value === selectedTier);
  const basePrice = BASE_PRICES[selectedMembership];
  const addonPrice = selectedAddon?.price || 0;
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
          addon_tier: selectedTier,
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

  const handleGenerateActivationLink = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-activation-sms", {
        body: {
          first_name: firstName,
          phone: patientPhone || "",
          base_membership: selectedMembership,
          addon_tier: selectedTier,
          patient_email: patientEmail,
        },
      });

      if (error) throw error;

      if (data?.success && data?.payment_link) {
        setGeneratedLink(data.payment_link);
        setShowLinkModal(true);
        setCopied(false);
      } else {
        throw new Error(data?.error || "Failed to generate activation link");
      }
    } catch (err: any) {
      console.error("Generate link error:", err);
      toast.error(err.message || "Failed to generate activation link");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleDraftEmail = () => {
    const subject = encodeURIComponent("Elevated Health: Activation & Pharmacy Order");
    const emailBody = `Hi ${firstName},\n\nLauren has approved your hormone protocol. Please click the secure link below to activate your membership and finalize your pharmacy order:\n\n${generatedLink}\n\nBest,\nElevated Health Team`;
    const mailtoLink = "mailto:" + (patientEmail || "") + "?subject=" + subject + "&body=" + encodeURIComponent(emailBody);
    window.location.href = mailtoLink;
  };

  return (
    <>
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-primary">
            <Pill className="w-4 h-4" />
            Membership & Hormone Protocol Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Base Membership</label>
            <Select value={selectedMembership} onValueChange={(v: "metabolic" | "vitality") => setSelectedMembership(v)}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select membership" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="metabolic">
                  <div className="flex items-center justify-between w-full">
                    <span>Metabolic Membership (GLP-1)</span>
                    <span className="text-muted-foreground ml-4">$399/mo</span>
                  </div>
                </SelectItem>
                <SelectItem value="vitality">
                  <div className="flex items-center justify-between w-full">
                    <span>Vitality Membership (HRT Only)</span>
                    <span className="text-muted-foreground ml-4">$199/mo</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Hormone Add-On Tier</label>
            <Select value={selectedTier} onValueChange={setSelectedTier}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select hormone tier" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {ADDON_TIERS.map((tier) => (
                  <SelectItem key={tier.value} value={tier.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{tier.label}</span>
                      <span className="text-muted-foreground ml-4">
                        {tier.price > 0 ? `+$${tier.price}/mo` : "No charge"}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAddon && (
              <p className="text-xs text-muted-foreground mt-1">{selectedAddon.description}</p>
            )}
          </div>

          <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Monthly Bill Estimate</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {selectedMembership === "vitality" ? "Vitality Membership" : "Metabolic Membership"}
                </span>
                <span>${basePrice}</span>
              </div>
              {addonPrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{selectedAddon?.label}</span>
                  <span>+${addonPrice}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold">
                <span>Total Monthly</span>
                <span className="text-primary text-lg">${totalMonthly}/mo</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleGenerateActivationLink}
            disabled={isGenerating}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Link2 className="w-4 h-4 mr-2" />
            )}
            {isGenerating ? "Generating..." : "Create Activation Link"}
          </Button>

          {patientEmail && (
            <Button
              onClick={handleUpdateMembership}
              disabled={isUpdating || selectedTier === currentTier}
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

          {selectedTier === currentTier && patientEmail && (
            <p className="text-xs text-center text-muted-foreground">
              Select a different tier to update existing subscription
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={showLinkModal} onOpenChange={setShowLinkModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              Link Ready
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-2">
                Stripe Payment Link
              </label>
              <div className="flex gap-2">
                <Input
                  value={generatedLink}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyToClipboard}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-secondary/30 rounded-lg p-3 text-sm">
              <p className="text-muted-foreground">
                <strong>Patient:</strong> {patientName}
              </p>
              {patientEmail && (
                <p className="text-muted-foreground">
                  <strong>Email:</strong> {patientEmail}
                </p>
              )}
              <p className="text-muted-foreground">
                <strong>Monthly Total:</strong> ${totalMonthly}/mo
              </p>
            </div>

            <Button
              onClick={handleDraftEmail}
              disabled={!patientEmail}
              className="w-full"
              size="lg"
            >
              <Mail className="w-4 h-4 mr-2" />
              Draft Email to Patient
            </Button>

            {!patientEmail && (
              <p className="text-xs text-center text-amber-600">
                No patient email on file. Copy the link and send manually.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HormoneAddonSelector;
