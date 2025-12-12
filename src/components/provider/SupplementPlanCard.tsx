import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Leaf, Copy, Check, ExternalLink, Package, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface LabResult {
  testosterone_t?: number | null;
  estradiol_e2?: number | null;
}

interface PatientData {
  id: string;
  full_name: string;
  gender?: string | null;
  dob?: string | null;
}

interface SupplementPlanCardProps {
  patient: PatientData;
  latestLabResult?: LabResult | null;
  onPlanUpdate?: (plan: SupplementPlan) => void;
}

interface SupplementPlan {
  zinc: boolean;
  dhea: boolean;
  includeInKit: boolean;
}

const SupplementPlanCard = ({ patient, latestLabResult, onPlanUpdate }: SupplementPlanCardProps) => {
  const [plan, setPlan] = useState<SupplementPlan>({
    zinc: false,
    dhea: false,
    includeInKit: true,
  });
  const [copied, setCopied] = useState(false);

  // Calculate patient age from DOB
  const getPatientAge = (): number | null => {
    if (!patient.dob) return null;
    const today = new Date();
    const birthDate = new Date(patient.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const patientAge = getPatientAge();
  const isMale = patient.gender === "male";

  // Auto-recommendation logic based on Dr. Holgate's protocols
  const shouldRecommendZinc = (): boolean => {
    // Zinc for high estrogen/conversion control (males with E2 > 30)
    if (isMale && latestLabResult?.estradiol_e2 && latestLabResult.estradiol_e2 > 30) {
      return true;
    }
    return false;
  };

  const shouldRecommendDHEA = (): boolean => {
    // DHEA for young men or those with T around 400
    if (isMale) {
      if (patientAge && patientAge < 35) return true;
      if (latestLabResult?.testosterone_t && latestLabResult.testosterone_t < 500) return true;
    }
    return false;
  };

  const zincRecommended = shouldRecommendZinc();
  const dheaRecommended = shouldRecommendDHEA();

  const handleToggle = (key: keyof SupplementPlan) => {
    const newPlan = { ...plan, [key]: !plan[key] };
    setPlan(newPlan);
    onPlanUpdate?.(newPlan);
  };

  const buildRecommendationText = (): string => {
    const supplements: string[] = [];
    if (plan.zinc) supplements.push("Zinc 50mg daily");
    if (plan.dhea) supplements.push("DHEA 25mg daily");
    
    if (supplements.length === 0) return "";
    
    const fulfillment = plan.includeInKit 
      ? "Include in next kit shipment." 
      : "Order via Fullscript dispensary.";
    
    return `Supplement Recommendation for ${patient.full_name}:\n${supplements.join(" + ")}\n\n${fulfillment}`;
  };

  const handleCopy = async () => {
    const text = buildRecommendationText();
    if (!text) {
      toast.error("No supplements selected");
      return;
    }
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const hasRecommendations = zincRecommended || dheaRecommended;
  const hasSelections = plan.zinc || plan.dhea;

  return (
    <Card className="border-green-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Leaf className="w-5 h-5 text-green-600" />
          Supplement Plan
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Dr. Holgate's supplement protocols
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auto-Recommendations Alert */}
        {hasRecommendations && (
          <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm">
              <span className="font-medium">Auto-Recommendation:</span>
              {zincRecommended && (
                <span className="block mt-1">• Zinc 50mg - High E2 detected ({latestLabResult?.estradiol_e2} pg/mL)</span>
              )}
              {dheaRecommended && (
                <span className="block mt-1">
                  • DHEA 25mg - {patientAge && patientAge < 35 ? `Young patient (${patientAge}y)` : `Low T (${latestLabResult?.testosterone_t} ng/dL)`}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Zinc Protocol Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Label htmlFor="zinc" className="font-medium">Zinc Protocol</Label>
              {zincRecommended && (
                <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 border-amber-300">
                  Recommended
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              50mg daily • For estrogen/conversion control
            </p>
          </div>
          <Switch
            id="zinc"
            checked={plan.zinc}
            onCheckedChange={() => handleToggle("zinc")}
          />
        </div>

        {/* DHEA Boost Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Label htmlFor="dhea" className="font-medium">DHEA Boost</Label>
              {dheaRecommended && (
                <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 border-amber-300">
                  Recommended
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              25mg daily • For T levels ~400 or younger men
            </p>
          </div>
          <Switch
            id="dhea"
            checked={plan.dhea}
            onCheckedChange={() => handleToggle("dhea")}
          />
        </div>

        {/* Fulfillment Option */}
        {hasSelections && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-green-600" />
                <Label htmlFor="includeInKit" className="font-medium">Include in Kit Shipment</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Ship with ZRT kit (100% margin) vs. Fullscript (25% commission)
              </p>
            </div>
            <Switch
              id="includeInKit"
              checked={plan.includeInKit}
              onCheckedChange={() => handleToggle("includeInKit")}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCopy}
            disabled={!hasSelections}
          >
            {copied ? (
              <Check className="w-4 h-4 mr-2 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            Copy Recommendation
          </Button>
          
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => window.open("https://us.fullscript.com/", "_blank")}
            disabled={plan.includeInKit}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Launch Fullscript
          </Button>
        </div>

        {/* Fullscript Integration Note */}
        <p className="text-xs text-muted-foreground text-center">
          💡 Fullscript API integration coming soon
        </p>
      </CardContent>
    </Card>
  );
};

export default SupplementPlanCard;
