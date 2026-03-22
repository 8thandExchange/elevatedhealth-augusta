import { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBooking } from "@/contexts/BookingContext";

const STORAGE_KEY = "floatingCTA_dismissed";

export const FloatingMobileCTA = () => {
  const isMobile = useIsMobile();
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    setIsDismissed(dismissed === "true");
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(STORAGE_KEY, "true");
  };

  const { openBooking } = useBooking();
  
  const handleBook = () => {
    handleDismiss();
    openBooking();
  };

  if (!isMobile || isDismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 animate-fade-in">
      <div className="relative bg-primary text-primary-foreground rounded-xl shadow-2xl p-4 flex items-center gap-3">
        <button
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 w-6 h-6 bg-card text-foreground rounded-full flex items-center justify-center shadow-md hover:bg-muted transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex-1">
          <p className="text-sm font-medium">Ready to feel your best?</p>
          <p className="text-xs opacity-90">Start with a $149 consultation</p>
        </div>
        
        <Button
          onClick={handleBook}
          variant="secondary"
          size="sm"
          className="shrink-0 gap-1.5 font-semibold"
        >
          <Calendar className="w-4 h-4" />
          Book Now
        </Button>
      </div>
    </div>
  );
};
