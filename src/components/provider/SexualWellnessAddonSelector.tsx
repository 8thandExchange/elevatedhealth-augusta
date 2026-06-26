import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Heart, Info, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SexualWellnessAddonSelectorProps {
  patientId: string;
  patientName: string;
  patientEmail?: string;
  patientGender?: string;
  currentProducts?: string[];
  onUpdate?: (products: string[]) => void;
}

const SEXUAL_WELLNESS_PRODUCTS = {
  tadalafil: {
    label: "Tadalafil (Cialis)",
    price: "$99/mo",
    priceId: "price_1SfijREOtKRY99puq0ITndfC",
    description: "Daily or As-Needed PDE5 Inhibitor",
    clinical: "Best for: ED, daily dosing (2.5-5mg), longer duration (36hrs). Also helps BPH symptoms.",
    badge: "Most Popular",
    gender: "male",
    isOneTime: false,
  },
  sildenafil: {
    label: "Sildenafil (Viagra)",
    price: "$79/mo",
    priceId: "price_1SfijSEOtKRY99pumi7jjNvs",
    description: "On-Demand PDE5 Inhibitor",
    clinical: "Best for: ED, as-needed use (25-100mg), works in 30-60 min, duration 4-6hrs.",
    badge: null,
    gender: "male",
    isOneTime: false,
  },
  pt141: {
    label: "PT-141 (Bremelanotide)",
    price: "$225",
    priceId: "price_1Sa3xIEOtKRY99puIXSB3L31",
    description: "Desire & Arousal Peptide",
    clinical: "Best for: Low libido in both men and women. Works on brain pathways, not blood flow.",
    badge: "Unisex",
    gender: "all",
    isOneTime: true,
  },
  oxytocin: {
    label: "Oxytocin Nasal Spray",
    price: "$89/mo",
    priceId: "price_1SfibUEOtKRY99pujkcHdFLc",
    description: "Connection & Intimacy Hormone",
    clinical: "Best for: Bonding, intimacy enhancement, anxiety reduction. Used before intimacy.",
    badge: "Unisex",
    gender: "all",
    isOneTime: false,
  },
};

const SexualWellnessAddonSelector = ({
  patientId,
  patientName,
  patientEmail,
  patientGender,
  currentProducts = [],
  onUpdate,
}: SexualWellnessAddonSelectorProps) => {
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

  const handleAddToSubscription = async (key: string, product: typeof SEXUAL_WELLNESS_PRODUCTS[keyof typeof SEXUAL_WELLNESS_PRODUCTS]) => {
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
          peptide_type: `sexual_${key}`,
          is_recurring: !product.isOneTime,
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
      console.error("Sexual wellness add error:", error);
      toast.error(error.message || `Failed to add ${product.label}`);
    } finally {
      setIsProcessing(null);
    }
  };

  // Filter products based on patient gender if specified
  const filteredProducts = Object.entries(SEXUAL_WELLNESS_PRODUCTS).filter(
    ([_, product]) => 
      product.gender === "all" || 
      !patientGender || 
      product.gender === patientGender?.toLowerCase()
  );

  return (
    <Card className="border-gold/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Heart className="w-5 h-5 text-accent" />
          Sexual Wellness
        </CardTitle>
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <ShieldCheck className="w-3 h-3" />
          Discreet packaging • Pharmacy-compounded • HIPAA compliant
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <TooltipProvider>
          {filteredProducts.map(([key, product]) => {
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
                              : product.badge === "Unisex"
                              ? "bg-purple-500/10 text-purple-600 border-purple-500/30"
                              : "bg-accent/10 text-accent border-gold/30"
                          }`}
                          variant="outline"
                        >
                          {product.badge}
                        </Badge>
                      )}
                      {product.isOneTime && (
                        <Badge
                          className="text-[10px] px-1.5 py-0 bg-blue-500/10 text-blue-600 border-blue-500/30"
                          variant="outline"
                        >
                          One-Time
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
                        {product.isOneTime ? "Charge" : "Add"}
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
            <strong>Privacy:</strong> All sexual wellness items ship in discreet, unmarked packaging.
            Prescriptions require brief telehealth consultation for safety screening.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SexualWellnessAddonSelector;
