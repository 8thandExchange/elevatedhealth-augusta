import { cn } from "@/lib/utils";

interface LabGaugeProps {
  label: string;
  value: number | null;
  unit: string;
  min: number;
  max: number;
  optimalMin: number;
  optimalMax: number;
}

const LabGauge = ({ label, value, unit, min, max, optimalMin, optimalMax }: LabGaugeProps) => {
  // Calculate position percentage
  const range = max - min;
  const valuePosition = value !== null ? Math.min(Math.max(((value - min) / range) * 100, 0), 100) : 0;
  const optimalStartPercent = ((optimalMin - min) / range) * 100;
  const optimalEndPercent = ((optimalMax - min) / range) * 100;

  // Determine status and color
  let status: "deficient" | "optimal" | "excess" | "unknown" = "unknown";
  let statusColor = "bg-muted";
  let statusText = "No data";

  if (value !== null) {
    if (value < optimalMin) {
      status = "deficient";
      statusColor = "bg-red-500";
      statusText = "Deficient";
    } else if (value > optimalMax) {
      status = "excess";
      statusColor = "bg-orange-500";
      statusText = "Excess";
    } else {
      status = "optimal";
      statusColor = "bg-green-500";
      statusText = "Optimal";
    }
  }

  return (
    <div className="bg-card border border-border/50 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className={cn(
          "text-xs px-2 py-0.5 rounded-full font-medium",
          status === "deficient" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
          status === "excess" && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
          status === "optimal" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
          status === "unknown" && "bg-muted text-muted-foreground"
        )}>
          {statusText}
        </span>
      </div>

      {/* Value Display */}
      <div className="mb-3">
        <span className="text-2xl font-playfair text-foreground">
          {value !== null ? value.toFixed(1) : "--"}
        </span>
        <span className="text-sm text-muted-foreground ml-1">{unit}</span>
      </div>

      {/* Gauge Track */}
      <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
        {/* Optimal Range Highlight */}
        <div 
          className="absolute h-full bg-green-200 dark:bg-green-900/50"
          style={{ 
            left: `${optimalStartPercent}%`, 
            width: `${optimalEndPercent - optimalStartPercent}%` 
          }}
        />
        
        {/* Value Indicator */}
        {value !== null && (
          <div 
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md transition-all duration-500",
              statusColor
            )}
            style={{ left: `calc(${valuePosition}% - 8px)` }}
          />
        )}
      </div>

      {/* Range Labels */}
      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-muted-foreground">{min}</span>
        <span className="text-xs text-green-600 dark:text-green-400">
          {optimalMin}-{optimalMax} (optimal)
        </span>
        <span className="text-xs text-muted-foreground">{max}</span>
      </div>
    </div>
  );
};

export default LabGauge;
