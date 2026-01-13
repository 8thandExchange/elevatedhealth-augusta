import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trackEvent } from "@/lib/analytics";
import { SITE_CONFIG } from "@/lib/siteConfig";

const MobileBookNow = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    trackEvent('booking_modal_open', { source: 'mobile_floating_button', link_id: 'long_schedule' });
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
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-full h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="font-playfair text-2xl text-primary">
                Book Your $99 Consultation
              </DialogTitle>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>
          <div className="h-full overflow-hidden">
            <iframe
              src={SITE_CONFIG.bookingUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              className="border-0"
              title="Schedule Consultation"
              onLoad={() => trackEvent('booking_iframe_loaded', { link_id: 'new_patient_application' })}
            />
            <div className="p-4 text-center text-sm text-muted-foreground border-t">
              Prefer to talk? <a href={`tel:+1${SITE_CONFIG.phoneRaw}`} className="text-accent hover:underline font-semibold">Call {SITE_CONFIG.phone}</a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MobileBookNow;
