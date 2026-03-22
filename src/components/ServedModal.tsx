import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trackModalOpen, trackCTAClick } from "@/lib/analytics";

const MODAL_STORAGE_KEY = "served-modal-last-shown";
const DAYS_BETWEEN_SHOWS = 30;

export const ServedModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAndShowModal = () => {
      const lastShown = localStorage.getItem(MODAL_STORAGE_KEY);
      
      if (!lastShown) {
        // Never shown before
        setIsOpen(true);
        return;
      }

      const lastShownDate = new Date(lastShown);
      const daysSinceLastShown = Math.floor(
        (Date.now() - lastShownDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastShown >= DAYS_BETWEEN_SHOWS) {
        setIsOpen(true);
        trackModalOpen('served_modal');
      }
    };

    // Small delay to avoid showing on initial page load flash
    const timer = setTimeout(checkAndShowModal, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(MODAL_STORAGE_KEY, new Date().toISOString());
    setIsOpen(false);
  };

  const handleMilitaryClick = () => {
    trackCTAClick('military_veteran_benefits', '/military-veteran');
    localStorage.setItem(MODAL_STORAGE_KEY, new Date().toISOString());
    setIsOpen(false);
    navigate("/military-veteran");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDismiss}>
      <DialogContent
        id="served-modal"
        className="sm:max-w-md"
        aria-describedby="served-modal-description"
        role="alertdialog"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold" id="served-modal-title">
            Have you served our country?
          </DialogTitle>
          <DialogDescription id="served-modal-description" className="text-base pt-2">
            You may be eligible for TRICARE or VA Community Care coverage for
            advanced longevity medicine. Let us guide your referral.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-col gap-2 pt-4">
          <Button
            onClick={handleMilitaryClick}
            className="w-full"
            size="lg"
            aria-label="Yes, I am military or veteran - learn about benefits"
          >
            Yes — Military/Veteran Benefits
          </Button>
          <Button
            onClick={handleDismiss}
            variant="outline"
            className="w-full"
            size="lg"
            aria-label="No, continue to main website"
          >
            No, continue to main site
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
