import { cn } from "@/lib/utils";
import { Lock, Heart, Zap, Brain, Skull, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HealthPillarRingProps {
  pillar: 'hormonal' | 'metabolic' | 'brain' | 'toxicity' | 'nutrient';
  score: number | null;
  label: string;
  onUnlock?: () => void;
  unlockPrice?: number;
  isLoading?: boolean;
}

const PILLAR_CONFIG = {
  hormonal: {
    icon: Heart,
    gradientStart: 'hsl(350, 89%, 60%)',
    gradientEnd: 'hsl(330, 81%, 60%)',
    glowColor: 'rgba(244, 63, 94, 0.4)',
  },
  metabolic: {
    icon: Zap,
    gradientStart: 'hsl(38, 92%, 50%)',
    gradientEnd: 'hsl(25, 95%, 53%)',
    glowColor: 'rgba(245, 158, 11, 0.4)',
  },
  brain: {
    icon: Brain,
    gradientStart: 'hsl(263, 70%, 50%)',
    gradientEnd: 'hsl(280, 65%, 50%)',
    glowColor: 'rgba(139, 92, 246, 0.4)',
  },
  toxicity: {
    icon: Skull,
    gradientStart: 'hsl(160, 84%, 39%)',
    gradientEnd: 'hsl(174, 72%, 40%)',
    glowColor: 'rgba(20, 184, 166, 0.4)',
  },
  nutrient: {
    icon: Leaf,
    gradientStart: 'hsl(142, 71%, 45%)',
    gradientEnd: 'hsl(84, 81%, 44%)',
    glowColor: 'rgba(34, 197, 94, 0.4)',
  },
};

const getStatusColor = (score: number | null) => {
  if (score === null) return 'gray';
  if (score >= 70) return 'green';
  if (score >= 40) return 'yellow';
  return 'red';
};

const getStatusLabel = (score: number | null) => {
  if (score === null) return 'Locked';
  if (score >= 70) return 'Optimal';
  if (score >= 40) return 'Sub-Optimal';
  return 'Critical';
};

const HealthPillarRing = ({ 
  pillar, 
  score, 
  label, 
  onUnlock, 
  unlockPrice = 299,
  isLoading = false 
}: HealthPillarRingProps) => {
  const config = PILLAR_CONFIG[pillar];
  const Icon = config.icon;
  const status = getStatusColor(score);
  const statusLabel = getStatusLabel(score);
  
  const size = 100;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = score !== null ? (score / 100) * circumference : 0;
  const strokeDashoffset = circumference - progress;

  const statusColors = {
    green: { ring: '#22c55e', bg: 'bg-green-500/10', text: 'text-green-600' },
    yellow: { ring: '#eab308', bg: 'bg-yellow-500/10', text: 'text-yellow-600' },
    red: { ring: '#ef4444', bg: 'bg-red-500/10', text: 'text-red-600' },
    gray: { ring: 'hsl(var(--muted))', bg: 'bg-muted', text: 'text-muted-foreground' },
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center p-3 animate-pulse">
        <div className="w-24 h-24 rounded-full bg-muted" />
        <div className="h-3 w-16 bg-muted rounded mt-2" />
        <div className="h-2.5 w-12 bg-muted rounded mt-1" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-3 group">
      {/* Ring Container */}
      <div 
        className="relative"
        style={{ 
          width: size, 
          height: size,
          filter: score !== null && score >= 70 ? `drop-shadow(0 0 12px ${config.glowColor})` : 'none'
        }}
      >
        {/* Background Ring */}
        <svg 
          className="w-full h-full -rotate-90" 
          viewBox={`0 0 ${size} ${size}`}
        >
          <defs>
            <linearGradient id={`gradient-${pillar}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={config.gradientStart} />
              <stop offset="100%" stopColor={config.gradientEnd} />
            </linearGradient>
          </defs>
          
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            opacity={0.3}
          />
          
          {/* Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={score !== null ? `url(#gradient-${pillar})` : 'hsl(var(--muted))'}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: score !== null ? strokeDashoffset : circumference,
              transition: 'stroke-dashoffset 1s ease-out',
            }}
          />
        </svg>
        
        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {score !== null ? (
            <>
              <Icon className="w-5 h-5 mb-0.5 text-foreground/70" />
              <span className="text-xl font-playfair font-bold text-foreground">{score}</span>
            </>
          ) : (
            <Lock className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Label */}
      <h3 className="mt-2 text-xs font-inter font-semibold text-foreground text-center leading-tight">
        {label}
      </h3>
      
      {/* Status Badge or Unlock Button */}
      {score !== null ? (
        <span className={cn(
          "mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-inter font-medium",
          statusColors[status].bg,
          statusColors[status].text
        )}>
          {statusLabel}
        </span>
      ) : (
        <Button 
          size="sm" 
          variant="outline" 
          className="mt-2 text-[10px] h-6 px-2 border-gold/50 text-gold hover:bg-gold hover:text-primary-foreground font-inter"
          onClick={onUnlock}
        >
          Unlock ${unlockPrice}
        </Button>
      )}
    </div>
  );
};

export default HealthPillarRing;
