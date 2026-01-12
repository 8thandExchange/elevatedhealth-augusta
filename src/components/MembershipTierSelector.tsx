import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Crown, 
  Star, 
  Zap, 
  MessageCircle, 
  Calendar, 
  Pill, 
  TestTube, 
  Phone, 
  Loader2,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HORMONE_MEMBERSHIP_TIERS, TIERED_GLP1_PRICES, type HormoneMembershipTier } from "@/lib/stripeConfig";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MembershipTierSelectorProps {
  gender?: "male" | "female";
  onSelectTier?: (tier: HormoneMembershipTier) => void;
  className?: string;
}

export function MembershipTierSelector({ 
  gender = "female", 
  onSelectTier,
  className 
}: MembershipTierSelectorProps) {
  const [selectedTier, setSelectedTier] = useState<HormoneMembershipTier | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isFeminine = gender === "female";
  const accentColor = isFeminine ? "feminine" : "primary";

  const handleSelectTier = (tier: HormoneMembershipTier) => {
    setSelectedTier(tier);
    onSelectTier?.(tier);
  };

  const tierConfigs = [
    {
      key: "access" as const,
      tier: HORMONE_MEMBERSHIP_TIERS.access,
      icon: Zap,
      gradient: "from-slate-50 to-slate-100",
      borderColor: "border-slate-200",
      textColor: "text-slate-700",
      badgeClass: "bg-slate-100 text-slate-700",
    },
    {
      key: "vitality" as const,
      tier: HORMONE_MEMBERSHIP_TIERS.vitality,
      icon: Star,
      gradient: isFeminine 
        ? "from-feminine/5 to-feminine/10" 
        : "from-primary/5 to-primary/10",
      borderColor: isFeminine ? "border-feminine" : "border-primary",
      textColor: isFeminine ? "text-feminine" : "text-primary",
      badgeClass: isFeminine 
        ? "bg-feminine text-feminine-foreground" 
        : "bg-primary text-primary-foreground",
      recommended: true,
    },
    {
      key: "concierge" as const,
      tier: HORMONE_MEMBERSHIP_TIERS.concierge,
      icon: Crown,
      gradient: "from-gold/5 to-gold/10",
      borderColor: "border-gold",
      textColor: "text-gold",
      badgeClass: "bg-gold text-gold-foreground",
    },
  ];

  const renderBenefit = (included: boolean, text: string, tooltip?: string) => (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center gap-2 text-sm",
            included ? "text-foreground" : "text-muted-foreground/50 line-through"
          )}>
            <CheckCircle2 className={cn(
              "h-4 w-4 flex-shrink-0",
              included ? "text-green-600" : "text-muted-foreground/30"
            )} />
            <span>{text}</span>
            {tooltip && <Info className="h-3 w-3 text-muted-foreground/50" />}
          </div>
        </TooltipTrigger>
        {tooltip && (
          <TooltipContent side="top" className="max-w-xs">
            <p className="text-xs">{tooltip}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className={cn("w-full", className)}>
      <div className="grid md:grid-cols-3 gap-6">
        {tierConfigs.map(({ key, tier, icon: Icon, gradient, borderColor, textColor, badgeClass, recommended }) => (
          <Card 
            key={key}
            className={cn(
              "relative overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer",
              `bg-gradient-to-br ${gradient}`,
              recommended ? `border-2 ${borderColor} shadow-lg scale-[1.02]` : `border ${borderColor}`,
              selectedTier === key && "ring-2 ring-offset-2 ring-gold"
            )}
            onClick={() => handleSelectTier(key)}
          >
            {/* Top Badge */}
            {recommended && (
              <div className="absolute top-0 left-0 right-0 flex justify-center">
                <Badge className={cn("rounded-none rounded-b-lg px-4 py-1", badgeClass)}>
                  ⭐ Most Popular
                </Badge>
              </div>
            )}
            
            <CardContent className={cn("p-6", recommended && "pt-10")}>
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  recommended 
                    ? (isFeminine ? "bg-feminine/10" : "bg-primary/10")
                    : key === "concierge" ? "bg-gold/10" : "bg-slate-100"
                )}>
                  <Icon className={cn("h-6 w-6", textColor)} />
                </div>
                <div>
                  <h3 className={cn("text-xl font-bold", textColor)}>{tier.name}</h3>
                  <p className="text-xs text-muted-foreground">{tier.tagline}</p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className={cn("text-4xl font-bold", textColor)}>
                    ${tier.amount / 100}
                  </span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                {key === "concierge" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Save $40/mo vs ACCESS + VITALITY benefits separately
                  </p>
                )}
              </div>

              {/* Benefits */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <MessageCircle className="h-4 w-4" />
                  Secure Provider Messaging
                </div>
                
                {renderBenefit(
                  true,
                  tier.benefits.consultsPerYear === -1 
                    ? "Unlimited Consults/Year" 
                    : `${tier.benefits.consultsPerYear} Consults/Year`,
                )}
                
                {renderBenefit(
                  tier.benefits.priorityScheduling,
                  "Priority Scheduling",
                )}
                
                {renderBenefit(
                  tier.benefits.has90DayRx,
                  "90-Day Prescription Access",
                  "Unlock 90-day prescriptions for significant savings on medication costs"
                )}
                
                {renderBenefit(
                  tier.benefits.directProviderLine,
                  "Direct Provider Phone Line",
                )}
              </div>

              {/* Discounts Section */}
              <div className="border-t pt-4 space-y-2">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <TestTube className="h-3 w-3" />
                  Lab Discounts
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Quarterly Labs</span>
                  <span className={cn("font-semibold", textColor)}>
                    {tier.benefits.labDiscountPercent}% off
                    <span className="text-xs text-muted-foreground ml-1">
                      (${tier.benefits.labDiscountedPrice / 100})
                    </span>
                  </span>
                </div>
                
                <p className="text-xs font-semibold text-foreground flex items-center gap-1 mt-3">
                  <Pill className="h-3 w-3" />
                  GLP-1 Add-On Pricing
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Semaglutide</span>
                    <span className={cn("font-semibold", tier.benefits.glp1DiscountPercent > 0 ? textColor : "text-muted-foreground")}>
                      {tier.benefits.glp1DiscountPercent > 0 
                        ? `${tier.benefits.glp1DiscountPercent}% off` 
                        : "Full price"}
                      <span className="text-xs text-muted-foreground ml-1">
                        ({key === "access" 
                          ? TIERED_GLP1_PRICES.semaglutide.full.displayPrice
                          : key === "vitality"
                          ? TIERED_GLP1_PRICES.semaglutide.vitality.displayPrice
                          : TIERED_GLP1_PRICES.semaglutide.concierge.displayPrice})
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tirzepatide</span>
                    <span className={cn("font-semibold", tier.benefits.glp1DiscountPercent > 0 ? textColor : "text-muted-foreground")}>
                      {tier.benefits.glp1DiscountPercent > 0 
                        ? `${tier.benefits.glp1DiscountPercent}% off` 
                        : "Full price"}
                      <span className="text-xs text-muted-foreground ml-1">
                        ({key === "access" 
                          ? TIERED_GLP1_PRICES.tirzepatide.full.displayPrice
                          : key === "vitality"
                          ? TIERED_GLP1_PRICES.tirzepatide.vitality.displayPrice
                          : TIERED_GLP1_PRICES.tirzepatide.concierge.displayPrice})
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                className={cn(
                  "w-full mt-6",
                  recommended 
                    ? (isFeminine ? "bg-feminine hover:bg-feminine-light text-feminine-foreground" : "bg-primary hover:bg-primary-light text-primary-foreground")
                    : key === "concierge" 
                    ? "bg-gold hover:bg-gold/90 text-gold-foreground"
                    : "bg-slate-600 hover:bg-slate-700 text-white"
                )}
                disabled={isLoading}
              >
                {isLoading && selectedTier === key ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {recommended ? "Get Started" : "Select Plan"}
              </Button>

              {/* Annual Savings Teaser */}
              {key !== "access" && (
                <p className="text-[10px] text-center text-muted-foreground mt-2">
                  Annual plans coming soon — save 2 months!
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison Note */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          All tiers include patient portal access, secure messaging, and prescription ordering.
          <br />
          <span className="text-xs">Prescriptions billed separately at discounted member rates ($40-80/mo typical).</span>
        </p>
      </div>
    </div>
  );
}

export default MembershipTierSelector;
