import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, CreditCard, Phone } from "lucide-react";
import { SITE_CONFIG } from "@/lib/siteConfig";

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

const CellularIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    {/* Cellular/molecular structure */}
    <circle cx="24" cy="24" r="10" />
    <circle cx="24" cy="24" r="4" />
    <circle cx="24" cy="8" r="3" />
    <circle cx="24" cy="40" r="3" />
    <circle cx="10" cy="16" r="3" />
    <circle cx="38" cy="16" r="3" />
    <circle cx="10" cy="32" r="3" />
    <circle cx="38" cy="32" r="3" />
    <line x1="24" y1="11" x2="24" y2="14" />
    <line x1="24" y1="34" x2="24" y2="37" />
    <line x1="12" y1="18" x2="15" y2="20" />
    <line x1="33" y1="20" x2="36" y2="18" />
    <line x1="12" y1="30" x2="15" y2="28" />
    <line x1="33" y1="28" x2="36" y2="30" />
  </svg>
);

const ConsultationModal = ({ isOpen, onClose }: ConsultationModalProps) => {
  const [loadingService, setLoadingService] = useState<string | null>(null);

  const consultationOptions = [
    {
      icon: NeuralIcon,
      title: "Ketamine Therapy",
      description: "IV infusions & SPRAVATO® for depression, PTSD, and anxiety",
      serviceType: "ketamine",
      freeCallUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0XA11WP_5kIZjLuXt6N_cJq5cpLLRdm3T19lrV6w-gjh-VeN5JN0yybyGHXEP1Qo8rjBOpzMyW?gv=true"
    },
    {
      icon: DNAIcon,
      title: "Medical Weight Loss",
      description: "Physician-supervised semaglutide (GLP-1) therapy",
      serviceType: "weight_loss",
      freeCallUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ1CBfpH07YJj-i6hEBsR8fQQSlo73zA8irBgHx6vj82matcVWu0-K-MFMrC5euDFR-vG5QujSlP?gv=true"
    },
    {
      icon: VitalityIcon,
      title: "Hormone Replacement",
      description: "Bioidentical hormone therapy to restore vitality",
      serviceType: "hormone",
      freeCallUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ1hhrEVpqc7nipsCg8QbgW72gW8vbl-SnUXT-LL4z4zFT1w8jTUBr5cfiruiNd47uu28seod93b?gv=true"
    },
    {
      icon: CellularIcon,
      title: "Peptide Therapy",
      description: "Sermorelin, NAD+, BPC-157 & PT-141 for cellular optimization",
      serviceType: "peptide",
      freeCallUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ3MR6nvUsM4Se9w_L8puDzb-0hWDSKLm6mlgwgeS-q0bBr0lVhS2PXET0ujlCE5ci9gzE0QPMis?gv=true"
    }
  ];

  const handlePaidConsultation = async (serviceType: string) => {
    setLoadingService(serviceType);
    try {
      const { data, error } = await supabase.functions.invoke("create-consultation-checkout", {
        body: { serviceType }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
        onClose();
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Consultation checkout error:", err);
      toast.error("Failed to start checkout. Please try again or call us.");
    } finally {
      setLoadingService(null);
    }
  };

  const handleFreeCall = (url: string) => {
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
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {consultationOptions.map((option, index) => {
            const Icon = option.icon;
            const isLoading = loadingService === option.serviceType;
            return (
              <div 
                key={index}
                className="group flex flex-col items-center text-center p-6 rounded-xl border border-border/50 hover:border-gold/40 transition-all duration-300 bg-white hover:shadow-lg"
              >
                {/* Icon */}
                <div className="mb-4 p-3">
                  <Icon className="h-12 w-12 text-gold group-hover:scale-110 transition-transform duration-300" />
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-cormorant font-medium text-[#2C3E50] mb-2">
                  {option.title}
                </h3>
                
                {/* Description */}
                <p className="text-sm text-[#2C3E50]/70 font-lato leading-relaxed mb-4 flex-grow">
                  {option.description}
                </p>

                {/* Price Badge */}
                <div className="mb-3">
                  <span className="text-2xl font-cormorant font-semibold text-[#2C3E50]">$99</span>
                  <p className="text-xs text-green-600 font-medium mt-1">
                    Credit toward treatment
                  </p>
                </div>

                {/* Primary CTA - Paid Consultation */}
                <Button 
                  className="w-full bg-gold hover:bg-gold-dark text-white font-lato tracking-wide transition-all duration-300 mb-2"
                  onClick={() => handlePaidConsultation(option.serviceType)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? "Processing..." : "Book Consultation"}
                </Button>

                {/* Secondary - Free Call */}
                <button
                  onClick={() => handleFreeCall(option.freeCallUrl)}
                  className="text-xs text-muted-foreground hover:text-[#2C3E50] transition-colors flex items-center gap-1"
                >
                  <Phone className="h-3 w-3" />
                  Not ready? Free 15-min call
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Questions? Call us at <a href={`tel:${SITE_CONFIG.phone}`} className="text-gold hover:underline">{SITE_CONFIG.phone}</a>
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultationModal;
