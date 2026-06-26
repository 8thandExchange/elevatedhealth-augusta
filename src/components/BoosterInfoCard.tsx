import { Check, Sparkles, Zap, Shield, HeartPulse, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BoosterInfoCardProps {
  name: string;
  price: number;
  description: string | null;
  detailedDescription: string | null;
  benefits: string[];
  bestFor: string[];
  iconName: string | null;
  isSelected: boolean;
  onToggle: () => void;
}

const getBoosterIcon = (iconName: string | null) => {
  const iconProps = { className: "w-5 h-5 text-primary" };
  switch (iconName) {
    case "sparkles":
      return <Sparkles {...iconProps} />;
    case "zap":
      return <Zap {...iconProps} />;
    case "shield":
      return <Shield {...iconProps} />;
    case "heart-pulse":
      return <HeartPulse {...iconProps} />;
    case "pill":
      return <Pill {...iconProps} />;
    default:
      return <Sparkles {...iconProps} />;
  }
};

const BoosterInfoCard = ({
  name,
  price,
  description,
  detailedDescription,
  benefits,
  bestFor,
  iconName,
  isSelected,
  onToggle,
}: BoosterInfoCardProps) => {
  return (
    <div className="w-80 bg-card border border-primary/20 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30 bg-secondary/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            {getBoosterIcon(iconName)}
          </div>
          <h4 className="font-playfair text-lg font-semibold text-foreground">
            {name}
          </h4>
        </div>
        <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
          +${price}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Elevator Pitch */}
        {description && (
          <p className="text-sm font-medium text-foreground italic">
            "{description}"
          </p>
        )}

        {/* Detailed Description */}
        {detailedDescription && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {detailedDescription}
          </p>
        )}

        {/* Benefits */}
        {benefits && benefits.length > 0 && (
          <div className="space-y-2">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        )}

        {/* Best For */}
        {bestFor && bestFor.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Best For
            </p>
            <div className="flex flex-wrap gap-2">
              {bestFor.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs bg-secondary text-foreground rounded-full border border-border/50"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="p-4 border-t border-border/30 bg-secondary/20">
        <Button
          onClick={onToggle}
          variant={isSelected ? "default" : "outline"}
          className="w-full rounded-full"
        >
          {isSelected ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Added to Drip
            </>
          ) : (
            "Add to My Drip"
          )}
        </Button>
      </div>
    </div>
  );
};

export default BoosterInfoCard;
