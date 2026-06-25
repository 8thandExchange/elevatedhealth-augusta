import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Crown, Calendar, Loader2, Save, Scale, Star, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ELEVATED_PROGRAMS, GLP1_DISPLAY_PRICE_RANGE } from "@/lib/stripeConfig";

interface MembershipAssignmentCardProps {
  patientId: string;
  patientName: string;
  currentTier: string | null;
  currentRenewalDate: string | null;
  onUpdate?: () => void;
}

const MembershipAssignmentCard = ({
  patientId,
  patientName,
  currentTier,
  currentRenewalDate,
  onUpdate
}: MembershipAssignmentCardProps) => {
  const [tier, setTier] = useState(currentTier || "none");
  const [renewalDate, setRenewalDate] = useState(currentRenewalDate || "");
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = 
    tier !== (currentTier || "none") || 
    renewalDate !== (currentRenewalDate || "");

  const getTierBadgeStyle = (tierValue: string) => {
    switch (tierValue) {
      case "access":
        return "bg-slate-600 text-white";
      case "vitality":
        return "bg-gradient-to-r from-primary to-primary/80 text-white";
      case "concierge":
        return "bg-gradient-to-r from-gold to-gold/80 text-gold-foreground";
      case "elevated_trt":
      case "elevated_hrt":
      case "elevated_glp1":
      case "elevated_wellness":
        return "bg-gradient-to-r from-accent/90 to-accent text-accent-foreground";
      case "semaglutide":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white";
      case "tirzepatide":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTierIcon = (tierValue: string) => {
    switch (tierValue) {
      case "access":
        return <Zap className="w-3 h-3 mr-1" />;
      case "vitality":
        return <Star className="w-3 h-3 mr-1" />;
      case "concierge":
        return <Crown className="w-3 h-3 mr-1" />;
      case "elevated_trt":
      case "elevated_hrt":
      case "elevated_glp1":
      case "elevated_wellness":
        return <Crown className="w-3 h-3 mr-1" />;
      case "semaglutide":
      case "tirzepatide":
        return <Scale className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const getTierLabel = (tierValue: string) => {
    switch (tierValue) {
      case "access":
        return "ACCESS";
      case "vitality":
        return "VITALITY";
      case "concierge":
        return "CONCIERGE";
      case "elevated_trt":
        return ELEVATED_PROGRAMS.trt.name;
      case "elevated_hrt":
        return ELEVATED_PROGRAMS.hrt.name;
      case "elevated_glp1":
        return ELEVATED_PROGRAMS.glp1.name;
      case "elevated_wellness":
        return ELEVATED_PROGRAMS.wellness.name;
      case "semaglutide":
        return "Semaglutide (Legacy)";
      case "tirzepatide":
        return "Tirzepatide (Legacy)";
      default:
        return "None";
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData: Record<string, unknown> = {
        membership_tier: tier === "none" ? null : tier,
        membership_renewal_date: renewalDate || null,
      };

      const { error } = await supabase
        .from("patients")
        .update(updateData)
        .eq("id", patientId);

      if (error) throw error;

      toast.success(`Membership updated for ${patientName}`);
      onUpdate?.();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update membership";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-gold/30 bg-gradient-to-br from-gold/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Crown className="w-4 h-4 text-gold" />
          Membership Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        {currentTier && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Current:</span>
            <Badge className={getTierBadgeStyle(currentTier)}>
              {getTierIcon(currentTier)}
              {getTierLabel(currentTier)}
            </Badge>
            {currentRenewalDate && (
              <span className="text-xs text-muted-foreground">
                Renews: {new Date(currentRenewalDate).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {/* Tier Selection - Native HTML Select */}
        <div className="space-y-2">
          <Label htmlFor="tier" className="text-sm">Membership Tier</Label>
          <select
            id="tier"
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="none">No Membership</option>
            <optgroup label="ELEVATED programs (assign new patients here)">
              <option value="elevated_trt">
                {ELEVATED_PROGRAMS.trt.name} ({ELEVATED_PROGRAMS.trt.displayPrice})
              </option>
              <option value="elevated_hrt">
                {ELEVATED_PROGRAMS.hrt.name} ({ELEVATED_PROGRAMS.hrt.displayPrice})
              </option>
              <option value="elevated_glp1">
                {ELEVATED_PROGRAMS.glp1.name} ({GLP1_DISPLAY_PRICE_RANGE})
              </option>
              <option value="elevated_wellness">
                {ELEVATED_PROGRAMS.wellness.name} ({ELEVATED_PROGRAMS.wellness.displayPrice})
              </option>
            </optgroup>
            <optgroup label="Legacy tiers (existing patient rows only)">
              <option value="access">ACCESS (Legacy)</option>
              <option value="vitality">VITALITY (Legacy)</option>
              <option value="concierge">CONCIERGE (Legacy)</option>
            </optgroup>
            <optgroup label="Legacy GLP-1 tier labels">
              <option value="semaglutide">Semaglutide subscription (Legacy)</option>
              <option value="tirzepatide">Tirzepatide subscription (Legacy)</option>
            </optgroup>
          </select>
        </div>

        {/* Renewal Date */}
        {tier !== "none" && (
          <div className="space-y-2">
            <Label htmlFor="renewal" className="text-sm flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Renewal Date
            </Label>
            <Input
              id="renewal"
              type="date"
              value={renewalDate}
              onChange={(e) => setRenewalDate(e.target.value)}
              className="max-w-[200px]"
            />
          </div>
        )}

        {/* Tier Features Summary */}
        {(tier === "elevated_trt" ||
          tier === "elevated_hrt" ||
          tier === "elevated_glp1" ||
          tier === "elevated_wellness") && (
          <div className="text-xs text-muted-foreground p-3 bg-accent/10 rounded-lg">
            <p className="font-medium text-foreground mb-1">ELEVATED program bundle</p>
            <ul className="space-y-0.5">
              <li>• Medication included when prescribed as part of this program</li>
              <li>• Monthly RN check-in and unlimited messaging</li>
              <li>• Quarterly labs and lab review included</li>
              <li>• Posted prices live in Stripe — see Staff Pricing Cheatsheet</li>
            </ul>
          </div>
        )}

        {tier === "access" && (
          <div className="text-xs text-muted-foreground p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">ACCESS Includes:</p>
            <ul className="space-y-0.5">
              <li>• Portal access & secure messaging</li>
              <li>• 2 provider consults/year</li>
              <li>• 20% off quarterly labs ($279)</li>
              <li>• 30-day Rx ordering only</li>
            </ul>
          </div>
        )}

        {tier === "vitality" && (
          <div className="text-xs text-muted-foreground p-3 bg-primary/5 rounded-lg">
            <p className="font-medium text-primary mb-1">VITALITY Includes:</p>
            <ul className="space-y-0.5">
              <li>• 4 provider consults/year</li>
              <li>• Priority scheduling</li>
              <li>• 30% off quarterly labs ($244)</li>
              <li>• 90-day Rx access (major savings)</li>
              <li>• 10% off GLP-1 add-ons</li>
            </ul>
          </div>
        )}

        {tier === "concierge" && (
          <div className="text-xs text-muted-foreground p-3 bg-gold/10 rounded-lg">
            <p className="font-medium text-gold mb-1">CONCIERGE Includes:</p>
            <ul className="space-y-0.5">
              <li>• Unlimited provider consults</li>
              <li>• Direct provider phone line</li>
              <li>• 40% off quarterly labs ($209)</li>
              <li>• 90-day Rx access</li>
              <li>• 20% off GLP-1 add-ons</li>
            </ul>
          </div>
        )}

        {(tier === "semaglutide" || tier === "tirzepatide") && (
          <div className="text-xs text-muted-foreground p-3 bg-green-500/10 rounded-lg">
            <p className="font-medium text-green-700 dark:text-green-400 mb-1">
              {tier === "semaglutide" ? "Semaglutide" : "Tirzepatide"} Includes:
            </p>
            <ul className="space-y-0.5">
              <li>• Monthly GLP-1 medication supply</li>
              <li>• Supplies and shipping included</li>
              <li>• Ongoing provider supervision</li>
              <li>• +$149/mo to add hormones</li>
            </ul>
          </div>
        )}

        {/* Save Button */}
        {hasChanges && (
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? "Saving..." : "Save Membership"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default MembershipAssignmentCard;
