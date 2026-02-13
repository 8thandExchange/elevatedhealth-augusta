import { Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { useBooking } from "@/contexts/BookingContext";

const WhyUsCompare = () => {
  const { openBooking } = useBooking();
  
  const handleLearnMore = () => {
    trackEvent("cta_click", { cta_name: "compare_learn_more", destination: "/weight-loss" });
    window.location.href = "/weight-loss";
  };

  const comparisonPoints = [
    { feature: "Medication Approach", standard: "Generic GLP-1 Dosing", elevated: "FDA-Approved GLP-1s with Personalized Protocols" },
    { feature: "Diagnostic Testing", standard: "Basic Weight Check", elevated: "ZRT Saliva Diagnostics + Hormone Panel" },
    { feature: "Consultations", standard: "15-Minute Med Refills", elevated: "Comprehensive Provider-Led Consultations" },
    { feature: "Root Cause Analysis", standard: "Symptom Treatment Only", elevated: "Hormone Blockers Identified & Addressed" },
    { feature: "Biological Approach", standard: "Calories In, Calories Out", elevated: "Cortisol, Estrogen, Testosterone Optimization" },
    { feature: "Care Model", standard: "Office Hours Only", elevated: "Concierge Access + Weekly Check-ins" }
  ];

  return (
    <section className="section-spacing bg-white">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm tracking-[0.3em] uppercase text-gold mb-4 font-lato font-light">
            The Difference
          </p>
          <h2 className="font-cormorant text-foreground mb-6">
            We Test. We Don't Guess.
          </h2>
          <p className="text-lg text-muted-foreground font-lato font-light leading-relaxed">
            Most clinics prescribe blindly. We architect your protocol around your unique biology 
            using advanced saliva diagnostics.
          </p>
        </div>

        {/* Desktop: Comparison Table */}
        <div className="max-w-4xl mx-auto hidden md:block">
          {/* Table Header */}
          <div className="grid grid-cols-3 gap-4 mb-8 pb-4 border-b border-border">
            <div className="col-span-1" />
            <div className="text-center">
              <p className="text-sm font-lato text-muted-foreground uppercase tracking-wide">
                Standard Clinic
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-lato text-gold uppercase tracking-wide font-semibold">
                Elevated Health
              </p>
            </div>
          </div>

          {/* Comparison Rows */}
          <div className="space-y-6">
            {comparisonPoints.map((point, index) => (
              <div 
                key={index} 
                className="grid grid-cols-3 gap-4 items-center py-4 border-b border-border/50 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="col-span-1">
                  <p className="font-cormorant text-lg text-foreground">{point.feature}</p>
                </div>
                <div className="text-center flex flex-col items-center gap-2">
                  <X className="h-5 w-5 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground font-lato">{point.standard}</p>
                </div>
                <div className="text-center flex flex-col items-center gap-2">
                  <Check className="h-5 w-5 text-gold" />
                  <p className="text-sm text-foreground font-lato font-medium">{point.elevated}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: Card-based comparison */}
        <div className="md:hidden space-y-4 max-w-lg mx-auto">
          {comparisonPoints.map((point, index) => (
            <div 
              key={index} 
              className="bg-card rounded-xl p-5 border border-border/50 shadow-sm animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <p className="font-cormorant text-lg text-foreground mb-3">{point.feature}</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <X className="h-4 w-4 text-muted-foreground/50 mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground font-lato">{point.standard}</p>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground font-lato font-medium">{point.elevated}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground font-lato mb-6">
            Ready to discover your biological blockers?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={openBooking} size="lg" className="font-lato">
              Schedule Discovery Call
            </Button>
            <Button onClick={handleLearnMore} variant="outline" size="lg" className="font-lato group">
              Learn About Hormonal Weight Reset
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUsCompare;
