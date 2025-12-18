import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Crown, Calendar, Loader2, Save, Sparkles } from "lucide-react";
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
      case "concierge":
        return "bg-gradient-to-r from-amber-500 to-yellow-500 text-white";
      case "vitality":
        return "bg-gradient-to-r from-primary to-primary/80 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData: Record<string, any> = {
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
    } catch (err: any) {
      toast.error(err.message || "Failed to update membership");
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
              {currentTier === "concierge" ? (
                <>
                  <Crown className="w-3 h-3 mr-1" />
                  Concierge
                </>
              ) : currentTier === "vitality" ? (
                <>
                  <Sparkles className="w-3 h-3 mr-1" />
                  Vitality
                </>
              ) : (
                "None"
              )}
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
              <SelectItem value="vitality">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Vitality ($199/mo)
                </span>
              </SelectItem>
              <SelectItem value="concierge">
                <span className="flex items-center gap-2">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  Concierge ($499/mo)
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
        {tier === "vitality" && (
          <div className="text-xs text-muted-foreground p-3 bg-primary/5 rounded-lg">
            <p className="font-medium text-primary mb-1">Vitality Includes:</p>
            <ul className="space-y-0.5">
              <li>• Bio-identical hormone therapy</li>
              <li>• Quarterly lab testing</li>
              <li>• Unlimited provider messaging</li>
              <li>• Medication adjustments</li>
            </ul>
          </div>
        )}

        {tier === "concierge" && (
          <div className="text-xs text-muted-foreground p-3 bg-amber-500/10 rounded-lg">
            <p className="font-medium text-amber-700 dark:text-amber-400 mb-1">Concierge Includes:</p>
            <ul className="space-y-0.5">
              <li>• Everything in Vitality PLUS:</li>
              <li>• GLP-1 weight loss medication</li>
              <li>• Adrenal support protocol</li>
              <li>• DHEA + Pregnenolone</li>
              <li>• Cortisol rhythm optimization</li>
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
