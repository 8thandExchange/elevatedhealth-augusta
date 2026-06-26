import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Check,
  Copy,
  DollarSign,
  Layers,
  Loader2,
  Mail,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  allComboAnchors,
  COMBO_SHARED_CARE_BULLETS,
  getAddonDefinition,
  getValidAddonsForAnchor,
  inferAnchorFromPatient,
  quoteCombo,
  type ComboAddonKey,
  type ComboAnchorKey,
} from "@/lib/elevatedComboPrograms";
import { fmtUsd } from "@/lib/pricing";
import { CORE_SERVICES } from "@/lib/stripeConfig";

interface ElevatedComboSelectorProps {
  patientId: string;
  patientName: string;
  patientEmail?: string | null;
  patientPhone?: string | null;
  patientGender?: string | null;
  primaryProgram?: string | null;
  treatmentRequest?: string | null;
  /** Legacy flag — maps to hormone add-on when anchor is GLP-1. */
  currentAddonKey?: ComboAddonKey | null;
}

const ElevatedComboSelector = ({
  patientId,
  patientName,
  patientEmail,
  patientPhone,
  patientGender,
  primaryProgram,
  treatmentRequest,
  currentAddonKey = null,
}: ElevatedComboSelectorProps) => {
  const defaultAnchor = inferAnchorFromPatient({
    primary_program: primaryProgram,
    treatment_request: treatmentRequest,
    gender: patientGender,
  });

  const [anchorKey, setAnchorKey] = useState<ComboAnchorKey>(defaultAnchor);
  const [addonKey, setAddonKey] = useState<ComboAddonKey | null>(currentAddonKey);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const validAddons = useMemo(
    () => getValidAddonsForAnchor(anchorKey, patientGender),
    [anchorKey, patientGender],
  );

  const quote = useMemo(
    () => quoteCombo({ anchor: anchorKey, addon: addonKey }),
    [anchorKey, addonKey],
  );

  const firstName = patientName.split(" ")[0] || patientName;

  const selectAnchor = (key: ComboAnchorKey) => {
    setAnchorKey(key);
    if (addonKey && !getValidAddonsForAnchor(key, patientGender).includes(addonKey)) {
      setAddonKey(null);
    }
  };

  const toggleAddon = (key: ComboAddonKey) => {
    setAddonKey((prev) => (prev === key ? null : key));
  };

  const handleUpdateSubscription = async () => {
    if (!patientEmail) {
      toast.error("Patient email required to update subscription");
      return;
    }

    setIsUpdating(true);
    try {
      const { data, error } = await supabase.functions.invoke("update-subscription-addon", {
        body: {
          customer_email: patientEmail,
          combo_addon: addonKey,
          patient_id: patientId,
          combo_slug: quote.comboSlug,
        },
      });

      if (error) throw error;
      if (data?.success) {
        toast.success(`Subscription updated — ${data.monthly_total_formatted}`);
      } else {
        throw new Error(data?.error || "Failed to update subscription");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update subscription";
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const invokeActivation = async (sendEmail: boolean) => {
    const baseMembership =
      anchorKey === "glp1_tirzepatide"
        ? "tirzepatide"
        : anchorKey.startsWith("glp1")
          ? "semaglutide"
          : anchorKey;

    const { data, error } = await supabase.functions.invoke("send-activation-sms", {
      body: {
        first_name: firstName,
        phone: patientPhone || "",
        base_membership: baseMembership,
        include_hormone_addon: addonKey === "trt" || addonKey === "hrt",
        patient_email: patientEmail,
        patient_id: patientId,
        send_email: sendEmail,
        combo_slug: quote.comboSlug,
        combo_anchor: anchorKey,
        combo_addon: addonKey,
      },
    });

    if (error) throw error;
    if (!data?.success) throw new Error(data?.error || "Failed to generate enrollment link");
    return data;
  };

  const handleSendEmail = async () => {
    if (!patientEmail) {
      toast.error("Patient email is required");
      return;
    }

    setIsSendingEmail(true);
    setEmailSent(false);
    try {
      const data = await invokeActivation(true);
      setGeneratedLink(data.payment_link ?? "");
      if (data.email_sent) {
        setEmailSent(true);
        toast.success(`Enrollment email sent to ${patientEmail}`);
      } else {
        toast.warning("Link generated but email failed — use copy link");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      let link = generatedLink;
      if (!link) {
        const data = await invokeActivation(false);
        link = data.payment_link ?? "";
        setGeneratedLink(link);
      }
      if (link) {
        await navigator.clipboard.writeText(link);
        toast.success("Payment link copied");
      }
    } catch {
      toast.error("Failed to generate link");
    }
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-primary">
          <Layers className="w-4 h-4" />
          ELEVATED Combo Enrollment
        </CardTitle>
        <p className="text-xs text-muted-foreground font-jost">
          Pick anchor (full care bundle) + optional medication add-on. Care is never double-billed.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Step 1 — Anchor */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            1 · Primary program (includes care bundle)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {allComboAnchors().map((anchor) => (
              <button
                key={anchor.key}
                type="button"
                onClick={() => selectAnchor(anchor.key)}
                className={cn(
                  "text-left rounded-lg border p-3 transition-colors",
                  anchorKey === anchor.key
                    ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                    : "border-border hover:border-primary/40 bg-background",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium leading-tight">{anchor.label}</span>
                  {anchorKey === anchor.key && (
                    <Check className="w-4 h-4 text-primary shrink-0" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{anchor.displayPrice}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2 — Add-on */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            2 · Add second lane (medication only)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAddonKey(null)}
              className={cn(
                "text-left rounded-lg border p-3 transition-colors",
                addonKey === null
                  ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                  : "border-border hover:border-primary/40 bg-background",
              )}
            >
              <span className="text-sm font-medium">No add-on</span>
              <p className="text-xs text-muted-foreground mt-0.5">Anchor program only</p>
            </button>
            {validAddons.map((key) => {
              const addon = getAddonDefinition(key);
              const selected = addonKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleAddon(key)}
                  className={cn(
                    "text-left rounded-lg border p-3 transition-colors",
                    selected
                      ? "border-accent bg-accent/10 ring-1 ring-accent/30"
                      : "border-border hover:border-accent/40 bg-background",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium">{addon.shortLabel}</span>
                    {selected && <Check className="w-4 h-4 text-accent shrink-0" />}
                  </div>
                  <p className="text-xs text-accent font-medium mt-0.5">
                    {addon.addOnDisplayPrice}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                    {addon.medicationsIncluded}
                  </p>
                </button>
              );
            })}
          </div>
          {patientGender && validAddons.length < 2 && anchorKey.startsWith("glp1") && (
            <p className="text-[11px] text-muted-foreground mt-2">
              Hormone add-on filtered for {patientGender === "male" ? "TRT (men)" : "HRT (women)"}.
            </p>
          )}
        </div>

        {/* Quote */}
        <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Monthly total</span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{quote.anchor.label}</span>
              <span>{fmtUsd(quote.anchorMonthlyCents)}</span>
            </div>
            {quote.addon && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{quote.addon.label}</span>
                <span>{fmtUsd(quote.addonMonthlyCents)}</span>
              </div>
            )}
            <div className="border-t border-border pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary text-lg">{quote.totalDisplay}</span>
            </div>
          </div>
          {quote.addon && (
            <Badge variant="secondary" className="font-jost font-normal">
              Save {quote.savingsDisplay}/mo vs two full programs
            </Badge>
          )}
          <p className="text-xs text-muted-foreground italic">{quote.marketingHeadline}</p>
          <p className="text-[11px] text-muted-foreground">
            Onboarding: {CORE_SERVICES.wellnessAssessment.displayPrice} consult +{" "}
            {quote.onboardingLabDisplay} labs (one draw)
          </p>
        </div>

        {/* Shared care reminder */}
        <ul className="text-[11px] text-muted-foreground space-y-1 list-disc pl-4">
          {COMBO_SHARED_CARE_BULLETS.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>

        {/* Actions */}
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
            {isSendingEmail ? "Sending…" : emailSent ? "Email sent" : "Send enrollment email"}
          </Button>
          <Button
            onClick={handleCopyLink}
            variant="ghost"
            className="w-full text-muted-foreground"
            size="sm"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy payment link
          </Button>
          {patientEmail && (
            <Button
              onClick={handleUpdateSubscription}
              disabled={isUpdating}
              variant="outline"
              className="w-full"
              size="sm"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Update existing subscription
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ElevatedComboSelector;
