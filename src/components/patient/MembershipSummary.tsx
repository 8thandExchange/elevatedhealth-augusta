import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles, Scale, Activity } from "lucide-react";

interface MembershipSummaryProps {
  membershipTier: "vitality" | "concierge" | null;
  renewalDate?: string;
}

const MembershipSummary = ({ membershipTier, renewalDate }: MembershipSummaryProps) => {
  if (!membershipTier) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="font-cormorant text-xl flex items-center gap-2">
            <Crown className="w-5 h-5 text-muted-foreground" />
            Membership
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No active membership. Speak with your provider about membership options.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isConciergeMember = membershipTier === "concierge";

  return (
    <Card className={`border-2 ${isConciergeMember ? "border-amber-500/50" : "border-primary/30"}`}>
      <CardHeader className={`pb-4 ${isConciergeMember 
        ? "bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20" 
        : "bg-gradient-to-r from-primary/5 to-primary/10"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className={`w-6 h-6 ${isConciergeMember ? "text-amber-600" : "text-primary"}`} />
            <div>
              <CardTitle className="font-cormorant text-xl">
                {isConciergeMember ? "Concierge Membership" : "Vitality Membership"}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {isConciergeMember ? "All-Inclusive Optimization" : "Hormone Optimization"}
              </p>
            </div>
          </div>
          <Badge className={`${isConciergeMember 
            ? "bg-amber-100 text-amber-800 hover:bg-amber-100" 
            : "bg-primary/10 text-primary hover:bg-primary/10"
          }`}>
            Active
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {isConciergeMember ? (
          // Concierge Membership - 3 Column Breakdown
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-secondary/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                  Vitality Base
                </p>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                  Quarterly ZRT testing
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                  $50/mo medication credit
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                  Unlimited provider messaging
                </li>
              </ul>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Scale className="w-4 h-4 text-amber-600" />
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                  + GLP-1 Weight Loss
                </p>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                  Semaglutide or Tirzepatide
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                  Monthly dosing adjustments
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                  B12/Lipotropic support
                </li>
              </ul>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-amber-600" />
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                  + Adrenal Protocol
                </p>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                  DHEA + Pregnenolone
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                  Adaptogenic herbs (AdreneVive)
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                  Cortisol rhythm optimization
                </li>
              </ul>
            </div>
          </div>
        ) : (
          // Vitality Membership - Single Column
          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">
              Your Benefits
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                Quarterly ZRT hormone testing
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                $50/month medication credit
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                Unlimited provider messaging
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                Priority scheduling
              </li>
            </ul>
          </div>
        )}

        {/* Adrenal Protocol Note - Concierge Only */}
        {isConciergeMember && (
          <p className="text-xs text-muted-foreground italic">
            Your Adrenal Protocol addresses HPA-axis dysfunction for chronic fatigue, burnout, or stress-related hormone imbalances.
          </p>
        )}

        {/* Renewal Info */}
        {renewalDate && (
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground">Next billing</span>
            <span className="text-sm font-medium text-foreground">{renewalDate}</span>
          </div>
        )}

        {/* Pricing */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-sm text-muted-foreground">Monthly rate</span>
          <span className={`text-lg font-cormorant font-semibold ${
            isConciergeMember ? "text-amber-700 dark:text-amber-400" : "text-primary"
          }`}>
            {isConciergeMember ? "$399" : "$199"}/mo
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default MembershipSummary;
