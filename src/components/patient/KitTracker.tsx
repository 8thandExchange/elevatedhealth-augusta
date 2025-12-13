import { Package, Truck, FlaskConical, Calendar, Check, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface KitTrackerProps {
  status: string;
  trackingNumber?: string | null;
  shippedAt?: string | null;
  sampleReceivedAt?: string | null;
  resultsReadyAt?: string | null;
  onBookCall?: () => void;
}

const steps = [
  {
    id: "ordered",
    label: "Order Confirmed",
    shortLabel: "Ordered",
    description: "Your diagnostic kit is being prepared",
    icon: Package,
  },
  {
    id: "shipped",
    label: "Kit on the Way",
    shortLabel: "Shipped",
    description: "Your kit has been shipped",
    icon: Truck,
  },
  {
    id: "sample_received",
    label: "Lab Processing",
    shortLabel: "Processing",
    description: "Your sample is being analyzed",
    icon: FlaskConical,
  },
  {
    id: "results_ready",
    label: "Results Ready",
    shortLabel: "Ready",
    description: "Book your strategy call",
    icon: Calendar,
  },
];

const statusOrder = ["not_ordered", "ordered", "shipped", "sample_received", "analyzing", "results_ready"];

const KitTracker = ({
  status,
  trackingNumber,
  shippedAt,
  sampleReceivedAt,
  resultsReadyAt,
  onBookCall,
}: KitTrackerProps) => {
  // Map analyzing to sample_received for display purposes
  const displayStatus = status === "analyzing" ? "sample_received" : status;
  const currentIndex = statusOrder.indexOf(displayStatus);

  // Calculate progress percentage
  const progressPercent = Math.round(((currentIndex - 1) / (steps.length - 1)) * 100);

  const getStepState = (stepId: string): "completed" | "current" | "upcoming" => {
    const stepIndex = statusOrder.indexOf(stepId);
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "upcoming";
  };

  const getTrackingUrl = (trackingNum: string) => {
    // Auto-detect carrier based on tracking number format
    if (trackingNum.startsWith("1Z")) {
      return `https://www.ups.com/track?tracknum=${trackingNum}`;
    } else if (trackingNum.length === 12 || trackingNum.length === 15) {
      return `https://www.fedex.com/fedextrack/?trknbr=${trackingNum}`;
    } else if (trackingNum.length === 22) {
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNum}`;
    }
    // Default to Google search
    return `https://www.google.com/search?q=${trackingNum}+tracking`;
  };

  if (status === "not_ordered" || !status) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-card to-muted/30 border-gold/20 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="font-cormorant text-xl text-foreground flex items-center gap-2">
            <Package className="w-5 h-5 text-gold" />
            Your Diagnostic Journey
          </CardTitle>
          {/* Progress percentage badge */}
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-gold/20 text-gold">
            {progressPercent > 0 ? `${progressPercent}%` : "Started"}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop: Horizontal Progress Steps */}
        <div className="hidden sm:block relative">
          {/* Progress Line */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-border" />
          <div
            className="absolute top-6 left-0 h-0.5 bg-green-500 transition-all duration-500"
            style={{
              width: `${Math.max(0, (currentIndex - 1) / (steps.length - 1)) * 100}%`,
            }}
          />

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step) => {
              const state = getStepState(step.id);
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex flex-col items-center" style={{ width: "25%" }}>
                  {/* Step Circle */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10",
                      state === "completed" && "bg-green-500 border-green-500 text-white scale-100",
                      state === "current" && "bg-gold border-gold text-white animate-pulse scale-110",
                      state === "upcoming" && "bg-background border-border text-muted-foreground scale-90"
                    )}
                  >
                    {state === "completed" ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="mt-3 text-center">
                    <p
                      className={cn(
                        "text-sm font-medium transition-colors duration-300",
                        state === "completed" && "text-green-600 dark:text-green-400",
                        state === "current" && "text-gold",
                        state === "upcoming" && "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 hidden md:block">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: Vertical Progress Steps */}
        <div className="sm:hidden space-y-3">
          {steps.map((step, index) => {
            const state = getStepState(step.id);
            const Icon = step.icon;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="flex items-start gap-3">
                {/* Step indicator with connecting line */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 flex-shrink-0",
                      state === "completed" && "bg-green-500 border-green-500 text-white",
                      state === "current" && "bg-gold border-gold text-white animate-pulse",
                      state === "upcoming" && "bg-background border-border text-muted-foreground"
                    )}
                  >
                    {state === "completed" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  {/* Connecting line */}
                  {!isLast && (
                    <div
                      className={cn(
                        "w-0.5 h-6 mt-1 transition-colors duration-500",
                        state === "completed" ? "bg-green-500" : "bg-border"
                      )}
                    />
                  )}
                </div>

                {/* Step content */}
                <div className="flex-1 min-w-0 pb-2">
                  <p
                    className={cn(
                      "text-sm font-medium transition-colors duration-300",
                      state === "completed" && "text-green-600 dark:text-green-400",
                      state === "current" && "text-gold",
                      state === "upcoming" && "text-muted-foreground"
                    )}
                  >
                    {step.shortLabel}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-border/50">
          {displayStatus === "shipped" && trackingNumber && (
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto min-h-[44px] active:scale-95 transition-transform"
              onClick={() => window.open(getTrackingUrl(trackingNumber), "_blank")}
            >
              <Truck className="w-4 h-4 mr-2" />
              Track Package
              <ExternalLink className="w-3 h-3 ml-2" />
            </Button>
          )}

          {displayStatus === "results_ready" && onBookCall && (
            <Button 
              onClick={onBookCall} 
              className="w-full sm:w-auto bg-gold hover:bg-gold/90 min-h-[44px] active:scale-95 transition-transform"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Your Strategy Call
            </Button>
          )}

          {displayStatus === "sample_received" && (
            <p className="text-sm text-muted-foreground text-center">
              Your sample is being analyzed. Results typically take 5-7 business days.
            </p>
          )}

          {displayStatus === "ordered" && (
            <p className="text-sm text-muted-foreground text-center">
              Your kit will ship within 1-2 business days.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KitTracker;