import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown } from "lucide-react";
import { ELEVATED_PROGRAMS, GLP1_DISPLAY_PRICE_RANGE } from "@/lib/stripeConfig";

interface MembershipSummaryProps {
  membershipTier: string | null;
  renewalDate?: string;
}

const ELEVATED_KEYS = ["elevated_trt", "elevated_hrt", "elevated_glp1", "elevated_wellness"] as const;

function elevatedProgram(tier: string) {
  switch (tier) {
    case "elevated_trt":
      return ELEVATED_PROGRAMS.trt;
    case "elevated_hrt":
      return ELEVATED_PROGRAMS.hrt;
    case "elevated_glp1":
      return ELEVATED_PROGRAMS.glp1;
    case "elevated_wellness":
      return ELEVATED_PROGRAMS.wellness;
    default:
      return null;
  }
}

const MembershipSummary = ({ membershipTier, renewalDate }: MembershipSummaryProps) => {
  if (!membershipTier) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="font-playfair text-xl flex items-center gap-2">
            <Crown className="w-5 h-5 text-muted-foreground" />
            Membership
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No active membership on file. Speak with your care team about enrolling in an ELEVATED program.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isElevated = (ELEVATED_KEYS as readonly string[]).includes(membershipTier);
  const program = isElevated ? elevatedProgram(membershipTier) : null;
  // GLP-1 price is molecule-specific ($349 semaglutide / $449 tirzepatide) and
  // the molecule isn't stored on the membership tier, so show the range.
  const programPriceDisplay =
    membershipTier === "elevated_glp1" ? GLP1_DISPLAY_PRICE_RANGE : program?.displayPrice;

  const legacyLabel =
    membershipTier === "vitality"
      ? "Legacy: Vitality"
      : membershipTier === "concierge"
        ? "Legacy: Concierge"
        : membershipTier === "access"
          ? "Legacy: Access"
          : membershipTier === "semaglutide" || membershipTier === "tirzepatide"
            ? `Legacy: ${membershipTier}`
            : `Membership (${membershipTier})`;

  return (
    <Card className="border-2 border-primary/30">
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-primary" />
            <div>
              <CardTitle className="font-playfair text-xl">
                {program ? program.name : legacyLabel}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {program ? programPriceDisplay : "Historical tier — clinic has your pricing details"}
              </p>
            </div>
          </div>
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Active</Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        <div className="bg-secondary/50 rounded-lg p-4">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">What&apos;s included</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
              Medication included when prescribed as part of your enrolled program (ELEVATED tiers)
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
              Monthly check-in, quarterly labs when on program, lab review, and messaging per your plan
            </li>
            {!program && (
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                If you are still on a legacy label, ask our clinical team to migrate you to an ELEVATED program when clinically appropriate
              </li>
            )}
          </ul>
        </div>

        {renewalDate && (
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground">Next billing</span>
            <span className="text-sm font-medium text-foreground">{renewalDate}</span>
          </div>
        )}

        {program && (
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground">Program rate</span>
            <span className="text-lg font-playfair font-semibold text-primary">{programPriceDisplay}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MembershipSummary;
