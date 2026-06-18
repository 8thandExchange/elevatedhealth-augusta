import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, MessageCircle, CreditCard } from "lucide-react";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { cn } from "@/lib/utils";
import { filterVisibleVisitReasons } from "@/lib/serviceConfig";

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_VISIT_REASONS: { id: string; label: string }[] = [
  { id: "hormone", label: "Hormone optimization (HRT/TRT)" },
  { id: "weight_loss", label: "Weight loss (GLP-1 therapy)" },
  { id: "peptide", label: "Peptide therapy" },
  { id: "iv", label: "IV therapy / wellness drips" },
  { id: "sexual_wellness", label: "Sexual wellness" },
  { id: "hair_restoration", label: "Hair restoration" },
  { id: "general_wellness", label: "General wellness / longevity" },
  { id: "exploring", label: "Just exploring" },
];

const ConsultationModal = ({ isOpen, onClose }: ConsultationModalProps) => {
  const navigate = useNavigate();
  const visitReasons = filterVisibleVisitReasons(ALL_VISIT_REASONS);
  const [selectedReasons, setSelectedReasons] = useState<Set<string>>(new Set());

  const toggleReason = (id: string, checked: boolean) => {
    setSelectedReasons((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleContinue = () => {
    const params = new URLSearchParams();
    if (selectedReasons.size) params.set("reasons", [...selectedReasons].join(","));
    onClose();
    navigate(`/consult/start${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl">
        <DialogHeader className="pb-2 text-left sm:text-center">
          <DialogTitle className="text-2xl sm:text-3xl font-playfair font-normal text-foreground tracking-wide">
            Start your $79 Wellness Assessment
          </DialogTitle>
          <DialogDescription className="text-left sm:text-center text-muted-foreground font-jost text-sm sm:text-base mt-2 leading-relaxed">
            Screening and consents first — then payment, your Good Faith Exam, and scheduling your in-person visit.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <div>
            <p className="text-sm font-jost font-medium text-foreground">
              What&apos;s bringing you in? (optional)
            </p>
            <p className="text-xs text-muted-foreground font-jost mt-1">
              Help us prepare for your visit. You can skip this and we&apos;ll cover it in the assessment.
            </p>
          </div>

          <div
            className={cn(
              "grid gap-3 pt-1",
              "grid-cols-1 sm:grid-cols-2",
            )}
          >
            {visitReasons.map(({ id, label }) => (
              <div
                key={id}
                className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5"
              >
                <Checkbox
                  id={`reason-${id}`}
                  checked={selectedReasons.has(id)}
                  onCheckedChange={(v) => toggleReason(id, v === true)}
                  className="mt-0.5"
                />
                <Label
                  htmlFor={`reason-${id}`}
                  className="text-sm font-jost font-normal text-foreground leading-snug cursor-pointer"
                >
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Button
            type="button"
            className="w-full bg-primary text-primary-foreground font-jost font-medium rounded-md py-6 text-base"
            onClick={handleContinue}
          >
            Continue enrollment
          </Button>
          <p className="text-[10px] sm:text-xs text-muted-foreground font-jost text-center leading-snug px-1">
            Safety screening → clinic consents → $79 payment → remote GFE → book your visit.
          </p>
        </div>

        <div className="mt-6 p-4 bg-secondary/50 rounded-xl border border-border/30">
          <p className="text-sm font-medium text-foreground mb-2 text-center font-jost">
            Have questions? Chat with our virtual care team first.
          </p>
          <p className="text-xs text-muted-foreground text-center mb-3 font-jost">
            Get instant answers about pricing, insurance, and our process—24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
            <button
              type="button"
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

        <div className="mt-4 py-3 border-t border-b border-border/30 text-center">
          <p className="text-sm font-jost text-muted-foreground">
            Looking for IV therapy? Book directly without a consultation.
          </p>
          <a
            href="/iv-lounge"
            className="inline-block mt-1 text-sm font-jost text-accent hover:opacity-80 transition-opacity"
            onClick={onClose}
          >
            Book IV →
          </a>
        </div>

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
          Questions? Call us at{" "}
          <a href={`tel:+1${SITE_CONFIG.phoneRaw}`} className="text-primary hover:underline">
            {SITE_CONFIG.phone}
          </a>
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultationModal;
