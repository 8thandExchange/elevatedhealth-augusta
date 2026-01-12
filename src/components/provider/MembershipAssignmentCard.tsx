import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Crown, Calendar, Loader2, Save, Sparkles, Scale, Star, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      case "semaglutide":
        return "Semaglutide";
      case "tirzepatide":
        return "Tirzepatide";
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

        {/* Tier Selection */}
        <div className="space-y-2">
          <Label htmlFor="tier" className="text-sm">Membership Tier</Label>
          <Select value={tier} onValueChange={setTier}>
            <SelectTrigger id="tier">
              <SelectValue placeholder="Select tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <span className="flex items-center gap-2">
                  No Membership
                </span>
              </SelectItem>
              
              {/* Hormone Membership Tiers */}
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-t mt-1 pt-2">
                Hormone Memberships
              </div>
              <SelectItem value="access">
                <span className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-slate-500" />
                  ACCESS ($99/mo) - 20% labs
                </span>
              </SelectItem>
              <SelectItem value="vitality">
                <span className="flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-primary" />
                  VITALITY ($149/mo) - 30% labs, 10% GLP-1
                </span>
              </SelectItem>
              <SelectItem value="concierge">
                <span className="flex items-center gap-2">
                  <Crown className="w-3.5 h-3.5 text-gold" />
                  CONCIERGE ($249/mo) - 40% labs, 15% GLP-1
                </span>
              </SelectItem>
              
              {/* GLP-1 Memberships */}
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-t mt-1 pt-2">
                GLP-1 Memberships
              </div>
              <SelectItem value="semaglutide">
                <span className="flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5 text-green-500" />
                  Semaglutide ($399/mo)
                </span>
              </SelectItem>
              <SelectItem value="tirzepatide">
                <span className="flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5 text-blue-500" />
                  Tirzepatide ($499/mo)
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
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
              <li>• 15% off GLP-1 add-ons</li>
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