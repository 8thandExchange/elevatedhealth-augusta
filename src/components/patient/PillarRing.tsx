import { cn } from "@/lib/utils";
import { Lock, Heart, Brain, Zap, Skull, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PillarRingProps {
  pillar: 'hormonal' | 'metabolic' | 'brain' | 'toxicity' | 'nutrient';
  score: number | null; // 0-100, null if no data
  label: string;
  onUnlock?: () => void;
  unlockPrice?: number;
  isLoading?: boolean;
}

const PILLAR_CONFIG = {
  hormonal: {
    icon: Heart,
    gradient: 'from-rose-500 to-pink-500',
    bgGradient: 'from-rose-500/20 to-pink-500/20',
  },
  metabolic: {
    icon: Zap,
    gradient: 'from-amber-500 to-orange-500',
    bgGradient: 'from-amber-500/20 to-orange-500/20',
  },
  brain: {
    icon: Brain,
    gradient: 'from-violet-500 to-purple-500',
    bgGradient: 'from-violet-500/20 to-purple-500/20',
  },
  toxicity: {
    icon: Skull,
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-500/20 to-teal-500/20',
  },
  nutrient: {
    icon: Leaf,
    gradient: 'from-green-500 to-lime-500',
    bgGradient: 'from-green-500/20 to-lime-500/20',
  },
};

const getStatusColor = (score: number | null) => {
  if (score === null) return 'gray';
  if (score >= 70) return 'green';
  if (score >= 40) return 'yellow';
  return 'red';
};

const getStatusLabel = (score: number | null) => {
  if (score === null) return 'No Data';
  if (score >= 70) return 'Optimal';
  if (score >= 40) return 'Sub-Optimal';
  return 'Attention Needed';
};

const PillarRing = ({ 
  pillar, 
  score, 
  label, 
  onUnlock, 
  unlockPrice = 299,
  isLoading = false 
}: PillarRingProps) => {
  const config = PILLAR_CONFIG[pillar];
  const Icon = config.icon;
  const status = getStatusColor(score);
  const statusLabel = getStatusLabel(score);
  
  const circumference = 2 * Math.PI * 45;
  const progress = score !== null ? (score / 100) * circumference : 0;
  const strokeDashoffset = circumference - progress;

  const ringColorClass = {
    green: 'stroke-green-500',
    yellow: 'stroke-yellow-500',
    red: 'stroke-red-500',
    gray: 'stroke-muted',
  }[status];

  const statusBgClass = {
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    gray: 'bg-muted text-muted-foreground',
  }[status];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center p-4 animate-pulse">
        <div className="w-28 h-28 rounded-full bg-muted" />
        <div className="h-4 w-20 bg-muted rounded mt-3" />
        <div className="h-3 w-16 bg-muted rounded mt-1" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 group">
      {/* Ring Container */}
      <div className="relative w-28 h-28">
        {/* Background Ring */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/30"
          />
          {/* Progress Ring */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className={cn(ringColorClass, "transition-all duration-1000 ease-out")}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: score !== null ? strokeDashoffset : circumference,
            }}
          />
        </svg>
        
        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {score !== null ? (
            <>
              <Icon className={cn("w-6 h-6 mb-1", `text-${status === 'green' ? 'green' : status === 'yellow' ? 'yellow' : status === 'red' ? 'red' : 'muted'}-500`)} />
              <span className="text-2xl font-bold text-foreground">{score}%</span>
            </>
          ) : (
            <Lock className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Label */}
      <h3 className="mt-3 text-sm font-semibold text-foreground text-center">{label}</h3>
      
      {/* Status Badge or Unlock Button */}
      {score !== null ? (
        <span className={cn("mt-1 text-xs px-2 py-0.5 rounded-full", statusBgClass)}>
          {statusLabel}
        </span>
      ) : (
        <Button 
          size="sm" 
          variant="outline" 
          className="mt-2 text-xs h-7 border-primary/50 hover:bg-primary hover:text-primary-foreground"
          onClick={onUnlock}
        >
          Unlock ${unlockPrice}
        </Button>
      )}
    </div>
  );
};

export default PillarRing;
