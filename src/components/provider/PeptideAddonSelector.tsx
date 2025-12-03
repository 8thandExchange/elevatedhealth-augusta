import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Package } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PeptideAddonSelectorProps {
  patientId: string;
  patientName: string;
  patientEmail?: string;
  currentPeptides?: string[];
  onUpdate?: (peptides: string[]) => void;
}

// Stripe price IDs for peptide products
const PEPTIDE_PRODUCTS = {
  sermorelin: {
    label: "Sermorelin Injection",
    price: "$149/mo",
    priceId: "price_1Sa3oyEOtKRY99puGS2t9EZv",
    type: "recurring" as const,
    description: "Growth Hormone Support",
  },
  nad_injection: {
    label: "NAD+ Injection",
    price: "$199/mo",
    priceId: "price_1Sa3waEOtKRY99puCB267VpA",
    type: "recurring" as const,
    description: "Cellular Energy Protocol",
  },
  nad_troche: {
    label: "NAD+ Troches",
    price: "$99/mo",
    priceId: "price_1Sa3x1EOtKRY99pufL3wEyIN",
    type: "recurring" as const,
    description: "Brain Restoration",
  },
  pt141: {
    label: "PT-141 Performance Kit",
    price: "$225",
    priceId: "price_1Sa3xIEOtKRY99puIXSB3L31",
    type: "one_time" as const,
    description: "10-Dose Kit for Libido",
  },
};

type PeptideKey = keyof typeof PEPTIDE_PRODUCTS;

const PeptideAddonSelector = ({
  patientId,
  patientName,
  patientEmail,
  currentPeptides = [],
  onUpdate,
}: PeptideAddonSelectorProps) => {
  const [selectedPeptides, setSelectedPeptides] = useState<Set<PeptideKey>>(
    new Set(currentPeptides as PeptideKey[])
  );
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleToggle = (key: PeptideKey) => {
    const updated = new Set(selectedPeptides);
    if (updated.has(key)) {
      updated.delete(key);
    } else {
      updated.add(key);
    }
    setSelectedPeptides(updated);
  };

  const handleAddToSubscription = async (key: PeptideKey) => {
    if (!patientEmail) {
      toast.error("Patient email is required to add subscription items");
      return;
    }

    const product = PEPTIDE_PRODUCTS[key];
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
        // One-time payment - open checkout
        window.open(data.url, "_blank");
        toast.success(`Payment link opened for ${product.label}`);
      } else if (data?.success) {
        // Added to subscription
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

  const recurringProducts = Object.entries(PEPTIDE_PRODUCTS).filter(
    ([_, p]) => p.type === "recurring"
  );
  const oneTimeProducts = Object.entries(PEPTIDE_PRODUCTS).filter(
    ([_, p]) => p.type === "one_time"
  );

  return (
    <Card className="border-gold/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="w-5 h-5 text-gold" />
          Peptide Add-Ons
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Standalone boosters - compatible with all memberships
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recurring Peptides */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Monthly Subscriptions
          </h4>
          {recurringProducts.map(([key, product]) => {
            const peptideKey = key as PeptideKey;
            const isActive = selectedPeptides.has(peptideKey);
            const isLoading = isProcessing === key;

            return (
              <div
                key={key}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  isActive
                    ? "bg-gold/5 border-gold/40"
                    : "bg-secondary/30 border-border/50 hover:border-gold/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={isActive}
                    onCheckedChange={() => handleToggle(peptideKey)}
                  />
                  <div>
                    <p className="font-medium text-foreground text-sm">{product.label}</p>
                    <p className="text-xs text-muted-foreground">{product.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-gold border-gold/30">
                    {product.price}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddToSubscription(peptideKey)}
                    disabled={isLoading || !patientEmail}
                    className="border-gold/30 hover:bg-gold/10 text-xs"
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
        </div>

        {/* One-Time Peptides */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            One-Time Purchase
          </h4>
          {oneTimeProducts.map(([key, product]) => {
            const peptideKey = key as PeptideKey;
            const isLoading = isProcessing === key;

            return (
              <div
                key={key}
                className="flex items-center justify-between p-3 rounded-lg border bg-secondary/30 border-border/50 hover:border-gold/30 transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground text-sm">{product.label}</p>
                  <p className="text-xs text-muted-foreground">{product.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-gold border-gold/30">
                    {product.price}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddToSubscription(peptideKey)}
                    disabled={isLoading || !patientEmail}
                    className="border-gold/30 hover:bg-gold/10 text-xs"
                  >
                    {isLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-3 h-3 mr-1" />
                        Charge
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Note */}
        <div className="bg-secondary/50 rounded-lg p-3 text-sm text-muted-foreground">
          <p>
            All peptide protocols include supplies and shipping. Recurring items are
            added to the patient's existing subscription. One-time items open a
            payment link.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PeptideAddonSelector;
