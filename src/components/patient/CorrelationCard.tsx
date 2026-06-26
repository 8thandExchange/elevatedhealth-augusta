import { cn } from "@/lib/utils";
import { Check, AlertTriangle, TrendingDown, TrendingUp, Minus } from "lucide-react";

interface CorrelationCardProps {
  hormone: string;
  symptomScore: number;
  symptomMaxScore: number;
  labValue: number | null;
  labUnit: string;
  labReference: { low: number; optimal: number; high: number };
  icon: React.ReactNode;
  colorClass: string;
}

const getSymptomLevel = (score: number, max: number): "optimal" | "suboptimal" | "deficient" => {
  const percentage = score / max;
  if (percentage <= 0.33) return "optimal";
  if (percentage <= 0.66) return "suboptimal";
  return "deficient";
};

const getLabLevel = (value: number | null, ref: { low: number; optimal: number; high: number }): "optimal" | "low" | "high" | null => {
  if (value === null) return null;
  if (value < ref.low) return "low";
  if (value > ref.high) return "high";
  return "optimal";
};

const CorrelationCard = ({
  hormone,
  symptomScore,
  symptomMaxScore,
  labValue,
  labUnit,
  labReference,
  icon,
  colorClass,
}: CorrelationCardProps) => {
  const symptomLevel = getSymptomLevel(symptomScore, symptomMaxScore);
  const labLevel = getLabLevel(labValue, labReference);

  // Check for validation: High symptoms (deficient/suboptimal) + Low labs = validated
  const isValidated = 
    (symptomLevel === "deficient" || symptomLevel === "suboptimal") && 
    labLevel === "low";

  // Symptom gauge percentage (inverted: higher score = worse)
  const symptomPercentage = (symptomScore / symptomMaxScore) * 100;
  
  // Lab gauge percentage (normalized to reference range)
  const labPercentage = labValue !== null 
    ? Math.min(100, Math.max(0, ((labValue - labReference.low) / (labReference.high - labReference.low)) * 100))
    : 0;

  const symptomLabels = {
    optimal: { text: "Optimal", color: "text-green-600 bg-green-100 dark:bg-green-900/30" },
    suboptimal: { text: "Sub-Optimal", color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30" },
    deficient: { text: "High Deficiency", color: "text-red-600 bg-red-100 dark:bg-red-900/30" },
  };

  const labLabels = {
    optimal: { text: "Normal", color: "text-green-600 bg-green-100 dark:bg-green-900/30" },
    low: { text: "Low", color: "text-red-600 bg-red-100 dark:bg-red-900/30" },
    high: { text: "High", color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
  };

  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
      {/* Header */}
      <div className={cn("px-4 py-3 flex items-center gap-3", colorClass)}>
        {icon}
        <h3 className="font-playfair text-lg font-semibold text-white">{hormone}</h3>
        {isValidated && (
          <span className="ml-auto flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-xs font-medium text-white">
            <Check className="w-3 h-3" />
            Validated
          </span>
        )}
      </div>

      <div className="p-4 grid grid-cols-2 gap-4">
        {/* Left: How I Feel (Symptoms) */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            How I Feel
          </p>
          
          {/* Gauge */}
          <div className="relative h-2 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-foreground/80 w-1 -ml-0.5 shadow-lg"
              style={{ left: `${symptomPercentage}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              symptomLabels[symptomLevel].color
            )}>
              {symptomLabels[symptomLevel].text}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {symptomScore}/{symptomMaxScore}
            </span>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Symptom Score
          </p>
        </div>

        {/* Right: What Biology Says (Labs) */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            What Biology Says
          </p>
          
          {labValue !== null ? (
            <>
              {/* Gauge */}
              <div className="relative h-2 bg-gradient-to-r from-red-400 via-green-400 to-amber-400 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-foreground/80 w-1 -ml-0.5 shadow-lg"
                  style={{ left: `${labPercentage}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  labLabels[labLevel!].color
                )}>
                  {labLabels[labLevel!].text}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {labValue} {labUnit}
                </span>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Lab Reference: {labReference.low}-{labReference.optimal} {labUnit}
              </p>
            </>
          ) : (
            <div className="flex items-center justify-center h-16 bg-secondary/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Lab results pending</p>
            </div>
          )}
        </div>
      </div>

      {/* Validation Message */}
      {isValidated && (
        <div className="mx-4 mb-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                Lab Results Confirm Your Symptoms
              </p>
              <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                Your lab results validate the symptoms you are feeling. Your protocol is designed to fix this specific gap.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Warning if high symptoms but normal labs */}
      {symptomLevel === "deficient" && labLevel === "optimal" && (
        <div className="mx-4 mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Symptoms Present, Labs Normal
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                Your provider will discuss this during your review. Other factors may be contributing to your symptoms.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorrelationCard;
