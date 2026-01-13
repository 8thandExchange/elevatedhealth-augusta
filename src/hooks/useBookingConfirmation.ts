import { useState, useCallback } from "react";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import { SITE_CONFIG } from "@/lib/siteConfig";

export function useBookingConfirmation() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleCalendarInteraction = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
      // Show helpful toast after user focuses on calendar
      setTimeout(() => {
        setShowConfirmation(true);
      }, 3000); // Show after 3 seconds of interaction
    }
  }, [hasInteracted]);

  const showBookingSuccessToast = useCallback(() => {
    toast.success("Booking Request Submitted!", {
      description: `You'll receive a confirmation email shortly. Questions? Call ${SITE_CONFIG.phone}`,
      duration: 8000,
      action: {
        label: "Got it",
        onClick: () => {},
      },
    });
    trackEvent("booking_confirmed_toast", { source: "calendar_embed" });
    setShowConfirmation(false);
    setHasInteracted(false);
  }, []);

  const resetConfirmation = useCallback(() => {
    setShowConfirmation(false);
    setHasInteracted(false);
  }, []);

  return {
    showConfirmation,
    hasInteracted,
    handleCalendarInteraction,
    showBookingSuccessToast,
    resetConfirmation,
  };
}
