import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, X, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trackEvent } from "@/lib/analytics";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { useBookingConfirmation } from "@/hooks/useBookingConfirmation";

const MobileBookNow = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    showConfirmation, 
    handleCalendarInteraction, 
    showBookingSuccessToast,
    resetConfirmation 
  } = useBookingConfirmation();

  const handleOpen = () => {
    setIsOpen(true);
    trackEvent('booking_modal_open', { source: 'mobile_floating_button', link_id: 'long_schedule' });
  };

  const handleClose = () => {
    setIsOpen(false);
    resetConfirmation();
  };

  return (
    <>
      {/* Mobile Floating Button */}
      <Button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl bg-accent hover:bg-accent-light text-white z-50 lg:hidden animate-[pulse_1.5s_ease-out_1] hover:scale-105 transition-transform"
        aria-label="Book consultation"
      >
        <Calendar className="h-7 w-7" />
      </Button>

      {/* Calendly Modal */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-full h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="font-playfair text-2xl text-primary">
                Book Your $99 Consultation
              </DialogTitle>
              <Button
                onClick={handleClose}
                variant="ghost"
                size="icon"
                className="rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>
          <div className="h-full overflow-hidden flex flex-col">
            <div className="flex-1 relative">
              <iframe
                src={SITE_CONFIG.bookingUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                className="border-0"
                title="Schedule Consultation"
                onLoad={() => trackEvent('booking_iframe_loaded', { link_id: 'new_patient_application' })}
                onFocus={handleCalendarInteraction}
                onClick={handleCalendarInteraction}
              />
            </div>
            
            {/* Confirmation Footer */}
            <div className="p-4 border-t bg-card space-y-3">
              {showConfirmation && (
                <div className="flex items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Button
                    onClick={showBookingSuccessToast}
                    className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4" />
                    I've Selected My Time
                  </Button>
                </div>
              )}
              <p className="text-center text-sm text-muted-foreground">
                Prefer to talk? <a href={`tel:+1${SITE_CONFIG.phoneRaw}`} className="text-accent hover:underline font-semibold">Call {SITE_CONFIG.phone}</a>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MobileBookNow;
