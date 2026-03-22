import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, CreditCard, Phone, MessageCircle } from "lucide-react";
import { SITE_CONFIG } from "@/lib/siteConfig";

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Elegant thin-line SVG icons
const HormoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="24" cy="24" r="8" />
    <path d="M24 8V4" /><path d="M24 44V40" />
    <path d="M40 24H44" /><path d="M4 24H8" />
    <path d="M35.3 12.7L38.1 9.9" /><path d="M9.9 38.1L12.7 35.3" />
    <path d="M35.3 35.3L38.1 38.1" /><path d="M9.9 9.9L12.7 12.7" />
  </svg>
);

const WeightLossIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 6 C16 14 32 18 32 26 C32 34 16 38 16 46" />
    <path d="M32 6 C32 14 16 18 16 26 C16 34 32 38 32 46" />
    <line x1="18" y1="10" x2="30" y2="10" />
    <line x1="17" y1="16" x2="31" y2="16" />
    <line x1="17" y1="32" x2="31" y2="32" />
    <line x1="18" y1="38" x2="30" y2="38" />
  </svg>
);

const IVIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M24 4 L24 16" />
    <rect x="18" y="16" width="12" height="20" rx="2" />
    <path d="M24 36 L24 44" />
    <path d="M18 22 L30 22" />
    <path d="M18 28 L30 28" />
    <circle cx="24" cy="25" r="1.5" fill="currentColor" />
  </svg>
);

const PeptideIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
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
  </svg>
);

const ConsultationModal = ({ isOpen, onClose }: ConsultationModalProps) => {
  const [loadingService, setLoadingService] = useState<string | null>(null);

  const consultationOptions = [
    {
      icon: HormoneIcon,
      title: "Hormone Optimization",
      description: "Physician-prescribed HRT and TRT for men and women",
      serviceType: "hormone"
    },
    {
      icon: WeightLossIcon,
      title: "Medical Weight Loss",
      description: "Physician-supervised semaglutide & tirzepatide (GLP-1) therapy",
      serviceType: "weight_loss"
    },
    {
      icon: IVIcon,
      title: "IV Therapy",
      description: "Physician-formulated infusions for recovery, immunity, and performance",
      serviceType: "iv_therapy"
    },
    {
      icon: PeptideIcon,
      title: "Peptide Protocols",
      description: "Sermorelin, NAD+, GHK-Cu & more for cellular optimization",
      serviceType: "peptide"
    },
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-3xl font-playfair font-normal text-center text-foreground tracking-wide">
            What brings you in today?
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground font-jost text-base mt-1">
            Select your primary concern and we'll guide you to the right service.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          {consultationOptions.map((option, index) => {
            const Icon = option.icon;
            const isLoading = loadingService === option.serviceType;
            return (
              <div 
                key={index}
                className="group flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/40 transition-all duration-300 bg-card hover:shadow-md cursor-pointer"
                onClick={() => !isLoading && handlePaidConsultation(option.serviceType)}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-playfair font-normal text-foreground mb-0.5">
                    {option.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-jost leading-snug">
                    {option.description}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xl font-playfair font-semibold text-foreground">$149</span>
                  <p className="text-[10px] text-primary font-medium font-jost">
                    Applied as credit if you proceed
                  </p>
                </div>

                <div className="shrink-0">
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                      <CreditCard className="h-4 w-4 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Not Ready Section */}
        <div className="mt-6 p-4 bg-secondary/50 rounded-xl border border-border/30">
          <p className="text-sm font-medium text-foreground mb-2 text-center font-jost">
            Have questions? Chat with our virtual care team first.
          </p>
          <p className="text-xs text-muted-foreground text-center mb-3 font-jost">
            Get instant answers about pricing, insurance, and our process—24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
            <button
              onClick={() => {
                onClose();
                setTimeout(() => {
                  const chatButton = document.querySelector('[aria-label="Open assistant"]');
                  if (chatButton) (chatButton as HTMLButtonElement).click();
                }, 300);
              }}
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-medium transition-colors font-jost"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Chat with Virtual Care Team</span>
            </button>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <a
              href="tel:+17067603470"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors font-jost"
            >
              <Phone className="h-4 w-4" />
              <span>Or Call: (706) 760-3470</span>
            </a>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-3 italic font-jost">
            Admin questions only • No medical advice provided
          </p>
        </div>

        <p className="text-[10px] text-muted-foreground text-center mt-4 max-w-md mx-auto font-jost">
          The $149 consultation fee is non-refundable. If you move forward with treatment, 
          this fee is applied as a credit toward your first service.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground font-jost">
          <div className="flex items-center gap-2">
            <CreditCard className="w-3.5 h-3.5 text-primary" />
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

        <p className="text-center text-xs text-muted-foreground mt-3 font-jost">
          Questions? Call us at <a href={`tel:${SITE_CONFIG.phone}`} className="text-primary hover:underline">{SITE_CONFIG.phone}</a>
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultationModal;
