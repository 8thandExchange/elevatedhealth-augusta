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

const HairIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    {/* Hair follicle / restoration */}
    <ellipse cx="24" cy="38" rx="8" ry="4" />
    <path d="M20 38 C20 30 16 24 16 16 C16 10 20 6 24 6" />
    <path d="M28 38 C28 30 32 24 32 16 C32 10 28 6 24 6" />
    <path d="M24 38 C24 28 24 20 24 6" />
    <circle cx="24" cy="6" r="2" />
  </svg>
);

const WellnessIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    {/* Intimate wellness / vitality heart */}
    <path d="M24 42 C24 42 6 28 6 18 C6 10 12 6 18 6 C22 6 24 10 24 10 C24 10 26 6 30 6 C36 6 42 10 42 18 C42 28 24 42 24 42Z" />
    <path d="M24 18 L24 30" />
    <path d="M18 24 L30 24" />
  </svg>
);

const ConsultationModal = ({ isOpen, onClose }: ConsultationModalProps) => {
  const [loadingService, setLoadingService] = useState<string | null>(null);

  // Clinical Eligibility URL for all free discovery calls
  const clinicalEligibilityUrl = "https://calendar.app.google/5whDnpmP8vGhhEAx6";

  const consultationOptions = [
    {
      icon: NeuralIcon,
      title: "Ketamine Therapy",
      description: "IV infusions & SPRAVATO® for depression, PTSD, and anxiety",
      serviceType: "ketamine",
      freeCallUrl: clinicalEligibilityUrl
    },
    {
      icon: DNAIcon,
      title: "Medical Weight Loss",
      description: "Physician-supervised semaglutide (GLP-1) therapy",
      serviceType: "weight_loss",
      freeCallUrl: clinicalEligibilityUrl
    },
    {
      icon: VitalityIcon,
      title: "Hormone Replacement",
      description: "Bioidentical hormone therapy to restore vitality",
      serviceType: "hormone",
      freeCallUrl: clinicalEligibilityUrl
    },
    {
      icon: CellularIcon,
      title: "Peptide Therapy",
      description: "Sermorelin, NAD+, PT-141 & GHK-Cu for cellular optimization",
      serviceType: "peptide",
      freeCallUrl: clinicalEligibilityUrl
    },
    {
      icon: HairIcon,
      title: "Hair Restoration",
      description: "Finasteride, minoxidil & PRP therapy for hair regrowth",
      serviceType: "hair",
      freeCallUrl: clinicalEligibilityUrl
    },
    {
      icon: WellnessIcon,
      title: "Sexual Wellness",
      description: "Discreet treatment for ED, low libido & intimate health",
      serviceType: "sexual",
      freeCallUrl: clinicalEligibilityUrl
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gold/50 rounded-2xl shadow-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-3xl font-cormorant font-medium text-center text-foreground tracking-wide">
            What brings you in today?
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground font-lato text-base mt-1">
            Select your primary concern and we'll guide you to the right service.
          </DialogDescription>
        </DialogHeader>
        
        {/* Guided Selection - Vertical List */}
        <div className="space-y-3 mt-4">
          {consultationOptions.map((option, index) => {
            const Icon = option.icon;
            const isLoading = loadingService === option.serviceType;
            return (
              <div 
                key={index}
                className="group flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-gold/40 transition-all duration-300 bg-white hover:shadow-md cursor-pointer"
                onClick={() => !isLoading && handlePaidConsultation(option.serviceType)}
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <Icon className="h-6 w-6 text-gold group-hover:scale-110 transition-transform duration-300" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-cormorant font-medium text-foreground mb-0.5">
                    {option.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-lato leading-snug">
                    {option.description}
                  </p>
                </div>

                {/* Price & CTA */}
                <div className="text-right shrink-0">
                  <span className="text-xl font-cormorant font-semibold text-foreground">$99</span>
                  <p className="text-[10px] text-green-600 font-medium">
                    Credit toward treatment
                  </p>
                </div>

                {/* Arrow/Loading */}
                <div className="shrink-0">
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gold" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold transition-colors">
                      <CreditCard className="h-4 w-4 text-gold group-hover:text-white transition-colors" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Not Sure Option */}
        <div className="mt-6 p-4 bg-secondary/50 rounded-xl border border-border/30 text-center">
          <p className="text-sm text-muted-foreground font-lato mb-3">
            Not sure which service is right for you?
          </p>
          <button
            onClick={() => handleFreeCall(consultationOptions[0].freeCallUrl)}
            className="inline-flex items-center gap-2 text-gold hover:text-gold-dark font-lato font-medium transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span>Schedule a FREE 15-min Discovery Call</span>
          </button>
        </div>

        {/* Payment flexibility messaging */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <CreditCard className="w-3.5 h-3.5 text-gold" />
            <span>Pay over time with</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 bg-[#FFB3C7]/20 rounded">
              <span className="font-bold text-[10px] text-[#E91E8A]">Klarna</span>
            </div>
            <div className="px-2 py-0.5 bg-[#0FA0EA]/10 rounded">
              <span className="font-bold text-[10px] text-[#0FA0EA]">affirm</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-3">
          Questions? Call us at <a href={`tel:${SITE_CONFIG.phone}`} className="text-gold hover:underline">{SITE_CONFIG.phone}</a>
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultationModal;
