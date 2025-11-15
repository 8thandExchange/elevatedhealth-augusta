import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const MobileBookNow = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl bg-accent hover:bg-accent-light text-white z-50 lg:hidden animate-pulse hover:animate-none"
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
                Book Your Free Consultation
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
              src="https://calendar.app.google/dmUqXpAwVspD7Nyi9?embed=true"
              width="100%"
              height="100%"
              frameBorder="0"
              className="border-0"
              title="Schedule Consultation"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MobileBookNow;
