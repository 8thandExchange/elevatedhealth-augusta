import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Ultra-thin elegant line icons in muted gold
const NeuralIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    {/* Lotus/Mind abstraction */}
    <circle cx="24" cy="24" r="6" />
    <path d="M24 18 C24 12 18 8 12 10 C16 14 18 18 18 24" />
    <path d="M24 18 C24 12 30 8 36 10 C32 14 30 18 30 24" />
    <path d="M30 24 C36 24 40 18 38 12" />
    <path d="M18 24 C12 24 8 18 10 12" />
    <path d="M24 30 C24 36 18 40 12 38 C16 34 18 30 18 24" />
    <path d="M24 30 C24 36 30 40 36 38 C32 34 30 30 30 24" />
  </svg>
);

const DNAIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    {/* Elegant DNA helix */}
    <path d="M16 6 C16 14 32 18 32 26 C32 34 16 38 16 46" />
    <path d="M32 6 C32 14 16 18 16 26 C16 34 32 38 32 46" />
    <line x1="18" y1="10" x2="30" y2="10" />
    <line x1="17" y1="16" x2="31" y2="16" />
    <line x1="17" y1="32" x2="31" y2="32" />
    <line x1="18" y1="38" x2="30" y2="38" />
  </svg>
);

const VitalityIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    {/* Vitality sun/drop hybrid */}
    <circle cx="24" cy="24" r="8" />
    <path d="M24 4 L24 12" />
    <path d="M24 36 L24 44" />
    <path d="M4 24 L12 24" />
    <path d="M36 24 L44 24" />
    <path d="M10 10 L16 16" />
    <path d="M32 32 L38 38" />
    <path d="M38 10 L32 16" />
    <path d="M16 32 L10 38" />
  </svg>
);

const ConsultationModal = ({ isOpen, onClose }: ConsultationModalProps) => {
  const consultationOptions = [
    {
      icon: NeuralIcon,
      title: "Ketamine Therapy",
      description: "IV infusions & SPRAVATO® for depression, PTSD, and anxiety",
      bookingUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0XA11WP_5kIZjLuXt6N_cJq5cpLLRdm3T19lrV6w-gjh-VeN5JN0yybyGHXEP1Qo8rjBOpzMyW?gv=true"
    },
    {
      icon: DNAIcon,
      title: "Medical Weight Loss",
      description: "Physician-supervised semaglutide (GLP-1) therapy",
      bookingUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ1CBfpH07YJj-i6hEBsR8fQQSlo73zA8irBgHx6vj82matcVWu0-K-MFMrC5euDFR-vG5QujSlP?gv=true"
    },
    {
      icon: VitalityIcon,
      title: "Hormone Replacement",
      description: "Bioidentical hormone therapy to restore vitality",
      bookingUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ1hhrEVpqc7nipsCg8QbgW72gW8vbl-SnUXT-LL4z4zFT1w8jTUBr5cfiruiNd47uu28seod93b?gv=true"
    }
  ];

  const handleBooking = (url: string) => {
    window.open(url, "_blank");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl bg-white border border-gold/50 rounded-2xl shadow-2xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-3xl font-cormorant font-medium text-center text-[#2C3E50] tracking-wide">
            Book Your Consultation
          </DialogTitle>
          <DialogDescription className="text-center text-[#2C3E50]/70 font-lato text-base mt-1">
            Select the service you're interested in
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-3 gap-5 mt-6">
          {consultationOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <div 
                key={index}
                className="group flex flex-col items-center text-center p-6 rounded-xl border border-border/50 hover:border-gold/40 transition-all duration-300 cursor-pointer bg-white hover:shadow-lg"
                onClick={() => handleBooking(option.bookingUrl)}
              >
                {/* Icon */}
                <div className="mb-5 p-3">
                  <Icon className="h-14 w-14 text-gold group-hover:scale-110 transition-transform duration-300" />
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-cormorant font-medium text-[#2C3E50] mb-3">
                  {option.title}
                </h3>
                
                {/* Description - Serif, larger */}
                <p className="text-[15px] text-[#2C3E50]/70 font-cormorant leading-relaxed mb-5 flex-grow">
                  {option.description}
                </p>

                {/* Ghost Button */}
                <Button 
                  variant="outline"
                  className="w-full border-[#2C3E50] text-[#2C3E50] bg-transparent hover:bg-gold hover:border-gold hover:text-white font-lato tracking-wide transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBooking(option.bookingUrl);
                  }}
                >
                  Select
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultationModal;
