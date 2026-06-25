import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Package, ChevronDown, ChevronUp, Info } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface PeptideAddonSelectorProps {
  patientId: string;
  patientName: string;
  patientEmail?: string;
  currentPeptides?: string[];
  onUpdate?: (peptides: string[]) => void;
}

// Stripe price IDs for peptide products - organized by category with healthy margins
// Core Offerings: PT-141, Sermorelin, Tesamorelin, GHK-Cu, NAD+
const PEPTIDE_CATEGORIES = {
  growth_recovery: {
    label: "Growth & Recovery",
    color: "bg-blue-500",
    products: {
      sermorelin: {
        label: "Sermorelin Injection",
        price: "$149/mo",
        priceId: "price_1Sa3oyEOtKRY99puGS2t9EZv",
        type: "recurring" as const,
        description: "Sleep & Recovery Support",
        clinical: "Best for: Sleep issues, recovery, natural GH support",
      },
      cjc_ipamorelin: {
        label: "CJC-1295/Ipamorelin",
        price: "$179/mo",
        priceId: "price_1Sfm0oEOtKRY99puEurPSCU6",
        type: "recurring" as const,
        description: "Short-Acting GH Pulse",
        clinical: "Best for: Sleep, recovery (alternative to Sermorelin)",
        badge: "Alternative",
      },
      tesamorelin: {
        label: "Tesamorelin",
        price: "$399/mo",
        priceId: "price_1SfibZEOtKRY99pud5SNVeXI",
        type: "recurring" as const,
        description: "FDA-Approved GH Releasing Hormone",
        clinical: "Best for: Central adiposity, visceral fat reduction",
        badge: "FDA-Approved",
      },
    },
  },
  // Cellular Energy (standalone NAD+ injection / troche / nasal) discontinued
  // 2026-06-25 — NAD+ is now offered only as the $50 IV "NAD+ Booster" add-on.
  sexual_wellness: {
    label: "Sexual Wellness",
    color: "bg-pink-500",
    products: {
      pt141: {
        label: "PT-141 Kit (10-dose)",
        price: "$225",
        priceId: "price_1Sa3xIEOtKRY99puIXSB3L31",
        type: "one_time" as const,
        description: "Desire & Arousal",
        clinical: "Best for: Low libido, HSDD, both men & women",
        badge: "FDA-Approved",
      },
    },
  },
  regeneration: {
    label: "Skin & Hair Regeneration",
    color: "bg-purple-500",
    products: {
      ghk_cu_topical: {
        label: "GHK-Cu Topical",
        price: "$149/mo",
        priceId: "price_1SfibXEOtKRY99puDbZKu1zw",
        type: "recurring" as const,
        description: "Targeted Skin Therapy",
        clinical: "Best for: Skin rejuvenation, wound healing",
      },
    },
  },
};

type CategoryKey = keyof typeof PEPTIDE_CATEGORIES;
type ProductKey = string;

const PeptideAddonSelector = ({
  patientId,
  patientName,
  patientEmail,
  currentPeptides = [],
  onUpdate,
}: PeptideAddonSelectorProps) => {
  const [selectedPeptides, setSelectedPeptides] = useState<Set<string>>(
    new Set(currentPeptides)
  );
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["growth_recovery", "cellular_energy", "intimacy_mood"])
  );

  const toggleCategory = (category: string) => {
    const updated = new Set(expandedCategories);
    if (updated.has(category)) {
      updated.delete(category);
    } else {
      updated.add(category);
    }
    setExpandedCategories(updated);
  };

  const handleToggle = (key: string) => {
    const updated = new Set(selectedPeptides);
    if (updated.has(key)) {
      updated.delete(key);
    } else {
      updated.add(key);
    }
    setSelectedPeptides(updated);
  };

  const handleAddToSubscription = async (key: string, product: any) => {
    if (!patientEmail) {
      toast.error("Patient email is required to add subscription items");
      return;
    }

    if (!product.priceId) {
      toast.info(`${product.label} coming soon - Stripe price not yet configured`);
      return;
    }

    setIsProcessing(key);

    try {
      const { data, error } = await supabase.functions.invoke("add-peptide-subscription", {
        body: {
          patient_email: patientEmail,
          price_id: product.priceId,
          peptide_type: key,
          is_recurring: product.type === "recurring",
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
        toast.success(`Payment link opened for ${product.label}`);
      } else if (data?.success) {
        toast.success(`${product.label} added to ${patientName}'s subscription`);
        const updated = new Set(selectedPeptides);
        updated.add(key);
        setSelectedPeptides(updated);
        onUpdate?.(Array.from(updated));
      }
    } catch (error: any) {
      console.error("Peptide add error:", error);
      toast.error(error.message || `Failed to add ${product.label}`);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <Card className="border-gold/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="w-5 h-5 text-gold" />
          Peptide Add-Ons
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          4 categories • FDA-compliant protocols • Compatible with all memberships
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <TooltipProvider>
          {Object.entries(PEPTIDE_CATEGORIES).map(([categoryKey, category]) => (
            <Collapsible
              key={categoryKey}
              open={expandedCategories.has(categoryKey)}
              onOpenChange={() => toggleCategory(categoryKey)}
            >
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${category.color}`} />
                    <span className="font-medium text-foreground text-sm">
                      {category.label}
                    </span>
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      {Object.keys(category.products).length} options
                    </Badge>
                  </div>
                  {expandedCategories.has(categoryKey) ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-2">
                {Object.entries(category.products).map(([productKey, product]) => {
                  const fullKey = `${categoryKey}_${productKey}`;
                  const isActive = selectedPeptides.has(fullKey);
                  const isLoading = isProcessing === fullKey;
                  const hasPrice = !!product.priceId;

                  return (
                    <div
                      key={productKey}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        isActive
                          ? "bg-gold/5 border-gold/40"
                          : "bg-card border-border/50 hover:border-gold/30"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Checkbox
                          checked={isActive}
                          onCheckedChange={() => handleToggle(fullKey)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-foreground text-sm truncate">
                              {product.label}
                            </p>
                            {product.badge && (
                              <Badge
                                className={`text-[10px] px-1.5 py-0 ${
                                  product.badge === "New"
                                    ? "bg-green-500/10 text-green-600 border-green-500/30"
                                    : product.badge === "Premium"
                                    ? "bg-gold/10 text-gold border-gold/30"
                                    : "bg-purple-500/10 text-purple-600 border-purple-500/30"
                                }`}
                                variant="outline"
                              >
                                {product.badge}
                              </Badge>
                            )}
                            {!hasPrice && (
                              <Badge
                                className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-600 border-amber-500/30"
                                variant="outline"
                              >
                                Coming Soon
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {product.description}
                          </p>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Info className="w-3 h-3 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-xs">
                            <p className="text-xs">{product.clinical}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Badge variant="outline" className="text-gold border-gold/30 whitespace-nowrap">
                          {product.price}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddToSubscription(fullKey, product)}
                          disabled={isLoading || !patientEmail || !hasPrice}
                          className="border-gold/30 hover:bg-gold/10 text-xs whitespace-nowrap"
                        >
                          {isLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <Plus className="w-3 h-3 mr-1" />
                              {product.type === "recurring" ? "Add" : "Charge"}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </TooltipProvider>

        {/* Info Note */}
        <div className="bg-secondary/50 rounded-lg p-3 text-sm text-muted-foreground">
          <p>
            <strong>Margins:</strong> All peptide pricing includes healthy profit margins.
            Recurring items are added to patient subscriptions. One-time items open payment links.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PeptideAddonSelector;
