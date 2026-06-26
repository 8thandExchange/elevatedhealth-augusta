import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Syringe, Activity, Pill, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface DailyAction {
  id: string;
  icon: React.ElementType;
  label: string;
  path?: string;
  completed: boolean;
}

interface DailyProtocolCardProps {
  patientName?: string;
  hasInjections?: boolean;
  hasSupplements?: boolean;
  onLogInjection?: () => void;
  onTrackSymptoms?: () => void;
}

const DailyProtocolCard = ({ 
  patientName,
  hasInjections = true,
  hasSupplements = true,
  onLogInjection,
  onTrackSymptoms
}: DailyProtocolCardProps) => {
  const navigate = useNavigate();
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());

  const actions: DailyAction[] = [
    ...(hasInjections ? [{
      id: "injection",
      icon: Syringe,
      label: "Log Injection",
      completed: completedActions.has("injection"),
    }] : []),
    {
      id: "symptoms",
      icon: Activity,
      label: "Track Symptoms",
      path: "/patient/checkin",
      completed: completedActions.has("symptoms"),
    },
    ...(hasSupplements ? [{
      id: "supplements",
      icon: Pill,
      label: "AM Supplements",
      completed: completedActions.has("supplements"),
    }] : []),
  ];

  const completedCount = completedActions.size;
  const totalCount = actions.length;

  const handleActionClick = (action: DailyAction) => {
    if (action.path) {
      navigate(action.path);
    } else if (action.id === "injection" && onLogInjection) {
      onLogInjection();
    } else if (action.id === "symptoms" && onTrackSymptoms) {
      onTrackSymptoms();
    } else {
      // Toggle completion for demo
      setCompletedActions(prev => {
        const newSet = new Set(prev);
        if (newSet.has(action.id)) {
          newSet.delete(action.id);
        } else {
          newSet.add(action.id);
        }
        return newSet;
      });
    }
  };

  const today = format(new Date(), "EEEE, MMMM d");

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary-dark p-6 text-primary-foreground">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
      
      {/* Header */}
      <div className="relative flex items-start justify-between mb-6">
        <div>
          <h2 className="font-playfair text-2xl font-semibold mb-1">Daily Protocol</h2>
          <p className="text-primary-foreground/70 font-inter text-sm">{today}</p>
        </div>
        <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-full px-3 py-1.5">
          <span className="text-sm font-inter font-medium">{completedCount}/{totalCount}</span>
          <span className="text-xs text-primary-foreground/60">done</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="relative grid grid-cols-3 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action)}
            className={cn(
              "relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all active:scale-95",
              action.completed 
                ? "bg-primary-foreground/20 ring-2 ring-gold/50" 
                : "bg-primary-foreground/10 hover:bg-primary-foreground/15"
            )}
          >
            {action.completed && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-primary" />
              </div>
            )}
            <action.icon className={cn(
              "w-6 h-6",
              action.completed ? "text-accent" : "text-primary-foreground"
            )} />
            <span className="text-xs font-inter font-medium text-center leading-tight">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="relative mt-6">
        <div className="h-1.5 bg-primary-foreground/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default DailyProtocolCard;
