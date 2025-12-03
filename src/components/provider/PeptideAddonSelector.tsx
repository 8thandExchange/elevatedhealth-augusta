import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface PeptideAddonSelectorProps {
  patientId: string;
  patientName: string;
  currentPeptides?: string[];
  onUpdate?: (peptides: string[]) => void;
}

const PEPTIDE_OPTIONS = [
  {
    value: "sermorelin",
    label: "Sermorelin Protocol",
    description: "Daily Injection - Growth Hormone Support",
    priceNote: "Custom Pricing",
  },
  {
    value: "tesamorelin",
    label: "Tesamorelin Protocol",
    description: "Daily Injection - Visceral Fat Reduction",
    priceNote: "Custom Pricing",
  },
  {
    value: "nad_injection",
    label: "NAD+ Injection Protocol",
    description: "Weekly Injection - Cellular Energy",
    priceNote: "Custom Pricing",
  },
  {
    value: "nad_troche",
    label: "NAD+ Troche Protocol",
    description: "Daily Troche - Brain Restoration",
    priceNote: "Custom Pricing",
  },
  {
    value: "pt141",
    label: "PT-141 Protocol",
    description: "As Needed Injection - Libido & Intimacy",
    priceNote: "Custom Pricing",
  },
];

const PeptideAddonSelector = ({
  patientId,
  patientName,
  currentPeptides = [],
  onUpdate,
}: PeptideAddonSelectorProps) => {
  const [selectedPeptides, setSelectedPeptides] = useState<string[]>(currentPeptides);
  const [pendingAdd, setPendingAdd] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAddPeptide = () => {
    if (pendingAdd && !selectedPeptides.includes(pendingAdd)) {
      const updated = [...selectedPeptides, pendingAdd];
      setSelectedPeptides(updated);
      setPendingAdd("");
    }
  };

  const handleRemovePeptide = (peptide: string) => {
    const updated = selectedPeptides.filter((p) => p !== peptide);
    setSelectedPeptides(updated);
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      // For now, just show success - actual backend integration would go here
      // This could update a patient's peptide_protocols field in the database
      toast.success(`Peptide protocols updated for ${patientName}`);
      onUpdate?.(selectedPeptides);
    } catch (error: any) {
      toast.error(error.message || "Failed to update peptide protocols");
    } finally {
      setIsUpdating(false);
    }
  };

  const availableOptions = PEPTIDE_OPTIONS.filter(
    (opt) => !selectedPeptides.includes(opt.value)
  );

  const getLabel = (value: string) =>
    PEPTIDE_OPTIONS.find((opt) => opt.value === value)?.label || value;

  return (
    <Card className="border-gold/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
          </svg>
          Peptide Add-Ons
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Standalone boosters - compatible with all memberships
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Peptides */}
        {selectedPeptides.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Active Protocols</label>
            <div className="flex flex-wrap gap-2">
              {selectedPeptides.map((peptide) => (
                <Badge
                  key={peptide}
                  variant="secondary"
                  className="bg-gold/10 text-gold border border-gold/30 px-3 py-1 flex items-center gap-2"
                >
                  {getLabel(peptide)}
                  <button
                    onClick={() => handleRemovePeptide(peptide)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Add New Peptide */}
        {availableOptions.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Add Protocol</label>
            <div className="flex gap-2">
              <Select value={pendingAdd} onValueChange={setPendingAdd}>
                <SelectTrigger className="flex-1 bg-background">
                  <SelectValue placeholder="Select peptide protocol..." />
                </SelectTrigger>
                <SelectContent className="bg-background border">
                  {availableOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex flex-col">
                        <span>{opt.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {opt.description} • {opt.priceNote}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={handleAddPeptide}
                disabled={!pendingAdd}
                className="border-gold/30 hover:bg-gold/10"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Info Note */}
        <div className="bg-secondary/50 rounded-lg p-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Pricing Note</p>
          <p>
            Peptide protocols are priced on a per-patient basis depending on dosage
            and frequency. These do not conflict with Weight Loss or Hormone memberships.
          </p>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isUpdating}
          className="w-full bg-gold hover:bg-gold-dark text-white"
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Save Peptide Protocols"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PeptideAddonSelector;
