import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Sparkles, Info } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HairRestorationAddonSelectorProps {
  patientId: string;
  patientName: string;
  patientEmail?: string;
  currentProducts?: string[];
  onUpdate?: (products: string[]) => void;
}

const HAIR_PRODUCTS = {
  minoxidil_finasteride: {
    label: "Minoxidil + Finasteride",
    price: "$129/mo",
    priceId: "price_1SfijTEOtKRY99puE2WxgmrI",
    description: "DHT Blocker + Growth Stimulant",
    clinical: "Best for: Male pattern baldness (androgenetic alopecia), thinning crown, receding hairline",
    badge: "Most Popular",
  },
  dutasteride: {
    label: "Dutasteride",
    price: "$149/mo",
    priceId: "price_1SfijUEOtKRY99pubB9WRUs1",
    description: "Advanced DHT Inhibitor",
    clinical: "Best for: Aggressive hair loss, finasteride non-responders, maximum DHT blocking",
    badge: "Premium",
  },
  ghk_cu_scalp: {
    label: "GHK-Cu Scalp Therapy",
    price: "$149/mo",
    priceId: "price_1SfibXEOtKRY99puDbZKu1zw", // Using existing GHK-Cu topical price
    description: "Copper Peptide Complex",
    clinical: "Best for: Follicle regeneration, scalp health, hair thickness",
    badge: "Peptide",
  },
};

const HairRestorationAddonSelector = ({
  patientId,
  patientName,
  patientEmail,
  currentProducts = [],
  onUpdate,
}: HairRestorationAddonSelectorProps) => {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set(currentProducts)
  );
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleToggle = (key: string) => {
    const updated = new Set(selectedProducts);
    if (updated.has(key)) {
      updated.delete(key);
    } else {
      updated.add(key);
    }
    setSelectedProducts(updated);
  };

  const handleAddToSubscription = async (key: string, product: typeof HAIR_PRODUCTS[keyof typeof HAIR_PRODUCTS]) => {
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
          peptide_type: `hair_${key}`,
          is_recurring: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
        toast.success(`Payment link opened for ${product.label}`);
      } else if (data?.success) {
        toast.success(`${product.label} added to ${patientName}'s subscription`);
        const updated = new Set(selectedProducts);
        updated.add(key);
        setSelectedProducts(updated);
        onUpdate?.(Array.from(updated));
      }
    } catch (error: any) {
      console.error("Hair restoration add error:", error);
      toast.error(error.message || `Failed to add ${product.label}`);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <Card className="border-gold/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          Hair Restoration
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          FDA-approved treatments • Pharmacy-compounded • Monthly subscriptions
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <TooltipProvider>
          {Object.entries(HAIR_PRODUCTS).map(([key, product]) => {
            const isActive = selectedProducts.has(key);
            const isLoading = isProcessing === key;
            const hasPrice = !!product.priceId;

            return (
              <div
                key={key}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  isActive
                    ? "bg-accent/5 border-gold/40"
                    : "bg-card border-border/50 hover:border-gold/30"
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Checkbox
                    checked={isActive}
                    onCheckedChange={() => handleToggle(key)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-foreground text-sm truncate">
                        {product.label}
                      </p>
                      {product.badge && (
                        <Badge
                          className={`text-[10px] px-1.5 py-0 ${
                            product.badge === "Most Popular"
                              ? "bg-green-500/10 text-green-600 border-green-500/30"
                              : product.badge === "Premium"
                              ? "bg-accent/10 text-accent border-gold/30"
                              : "bg-purple-500/10 text-purple-600 border-purple-500/30"
                          }`}
                          variant="outline"
                        >
                          {product.badge}
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
                  <Badge variant="outline" className="text-accent border-gold/30 whitespace-nowrap">
                    {product.price}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddToSubscription(key, product)}
                    disabled={isLoading || !patientEmail || !hasPrice}
                    className="border-gold/30 hover:bg-accent/10 text-xs whitespace-nowrap"
                  >
                    {isLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </TooltipProvider>

        <div className="bg-secondary/50 rounded-lg p-3 text-sm text-muted-foreground">
          <p>
            <strong>Note:</strong> Hair restoration protocols ship monthly from pharmacy.
            Results typically visible in 3-6 months with consistent use.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HairRestorationAddonSelector;
