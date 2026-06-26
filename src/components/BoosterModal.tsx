import { Check, Sparkles, Zap, Shield, HeartPulse, Pill, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BoosterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  const iconProps = { className: "w-6 h-6 text-primary" };
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

const BoosterModal = ({
  open,
  onOpenChange,
  name,
  price,
  description,
  detailedDescription,
  benefits,
  bestFor,
  iconName,
  isSelected,
  onToggle,
}: BoosterModalProps) => {
  const handleToggle = () => {
    onToggle();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border border-primary/20">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                {getBoosterIcon(iconName)}
              </div>
              <DialogTitle className="font-playfair text-xl font-semibold text-foreground">
                {name}
              </DialogTitle>
            </div>
            <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
              +${price}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
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
                    className="px-3 py-1.5 text-xs bg-secondary text-foreground rounded-full border border-border/50"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="pt-4 border-t border-border/30 mt-4">
          <Button
            onClick={handleToggle}
            variant={isSelected ? "default" : "outline"}
            className="w-full rounded-full"
            size="lg"
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
      </DialogContent>
    </Dialog>
  );
};

export default BoosterModal;
