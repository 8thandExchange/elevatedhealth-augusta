import { cn } from "@/lib/utils";

interface CircularGaugeProps {
  score: number;
  maxScore: number;
  label: string;
  icon: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export const CircularGauge = ({ score, maxScore, label, icon, size = "md" }: CircularGaugeProps) => {
  const percentage = Math.min((score / maxScore) * 100, 100);
  
  // Determine zone: Green (0-5), Yellow (6-15), Red (16+)
  const getZone = () => {
    if (score <= 5) return { color: "stroke-green-500", bg: "bg-green-500/10", text: "text-green-500", label: "Optimal" };
    if (score <= 15) return { color: "stroke-yellow-500", bg: "bg-yellow-500/10", text: "text-yellow-500", label: "Sub-Optimal" };
    return { color: "stroke-red-500", bg: "bg-red-500/10", text: "text-red-500", label: "Needs Treatment" };
  };

  const zone = getZone();
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-32 h-32",
    lg: "w-40 h-40",
  };

  return (
    <div className="flex flex-col items-center">
      <div className={cn("relative", sizeClasses[size])}>
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-secondary"
          />
          {/* Progress circle */}
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className={cn("transition-all duration-700 ease-out", zone.color)}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={cn("p-2 rounded-full mb-1", zone.bg)}>
            {icon}
          </div>
          <span className="text-xl font-bold text-foreground">{score}</span>
        </div>
      </div>
      
      <div className="mt-3 text-center">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className={cn("text-xs", zone.text)}>{zone.label}</p>
      </div>
    </div>
  );
};

export default CircularGauge;