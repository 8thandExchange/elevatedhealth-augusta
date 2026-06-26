import { ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useScrollReveal, revealClasses } from "@/hooks/useScrollReveal";
import { Button } from "@/components/ui/button";
import { CORE_SERVICES, ELEVATED_PROGRAMS, GLP1_DISPLAY_PRICE_RANGE } from "@/lib/stripeConfig";
import { useBooking } from "@/contexts/BookingContext";

const programHighlights = [
  { program: ELEVATED_PROGRAMS.hrt, label: "Women's hormones", price: ELEVATED_PROGRAMS.hrt.displayPrice },
  { program: ELEVATED_PROGRAMS.trt, label: "Men's TRT", price: ELEVATED_PROGRAMS.trt.displayPrice },
  // GLP-1 is molecule-priced (semaglutide $349 / tirzepatide $449).
  { program: ELEVATED_PROGRAMS.glp1, label: "Medical weight loss", price: GLP1_DISPLAY_PRICE_RANGE },
  { program: ELEVATED_PROGRAMS.wellness, label: "IV membership & perks", price: ELEVATED_PROGRAMS.wellness.displayPrice },
];

const includes = [
  "Medication included in the HRT, TRT & GLP-1 programs",
  "Monthly clinical check-in and unlimited messaging",
  "Quarterly labs in the Rx programs (ELEVATED IV is IV-only — two drips a month)",
  "Transparent monthly pricing — no hidden pharmacy fees",
  "Month-to-month — cancel anytime",
];

const HomePricingSection = () => {
  const navigate = useNavigate();
  const { openBooking } = useBooking();
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="section-band-white">
      <div className="container mx-auto px-6 lg:px-8">
        <div className={`max-w-2xl mx-auto text-center mb-14 ${revealClasses.fadeUp(isVisible)}`}>
          <p className="section-label mb-4">Transparent Pricing</p>
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-foreground">
            No insurance maze. <span className="italic">No surprise bills.</span>
          </h2>
          <p className="font-jost font-light text-base text-muted-foreground mt-4 leading-relaxed">
            Start with a {CORE_SERVICES.wellnessAssessment.displayPrice} Wellness Assessment and baseline labs. Enroll in
            the ELEVATED program that fits your protocol — one predictable monthly price.
          </p>
        </div>

        <div
          className={`max-w-5xl mx-auto grid lg:grid-cols-[1fr_1.1fr] gap-8 items-stretch ${revealClasses.fadeUp(isVisible)}`}
        >
          <div className="premium-card-muted p-8 md:p-10 flex flex-col">
            <p className="section-label mb-3">Getting started</p>
            <h3 className="font-playfair text-2xl md:text-3xl text-foreground mb-2">Wellness Assessment</h3>
            <p className="stat-display text-accent mb-6">{CORE_SERVICES.wellnessAssessment.displayPrice}</p>
            <p className="font-jost font-light text-sm text-muted-foreground leading-relaxed mb-8">
              30–45 minute in-clinic visit with our RN. Symptom mapping, vitals, goals, and a clear path forward. Baseline
              labs ({CORE_SERVICES.comprehensivePanel.displayPrice}–{CORE_SERVICES.expandedPanel.displayPrice}) ordered
              when clinically appropriate.
            </p>
            <Button onClick={openBooking} className="mt-auto w-full sm:w-auto">
              Book assessment
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="premium-card border-accent/20 p-8 md:p-10 flex flex-col shadow-[var(--shadow-md)]">
            <p className="section-label mb-3">ELEVATED programs</p>
            <h3 className="font-playfair text-2xl md:text-3xl text-foreground mb-6">All-inclusive monthly care</h3>

            <ul className="grid sm:grid-cols-2 gap-3 mb-8">
              {programHighlights.map(({ program, label, price }) => (
                <li key={program.name} className="flex items-baseline justify-between gap-2 border-b border-border pb-2">
                  <span className="font-jost text-sm text-foreground">{label}</span>
                  <span className="font-playfair text-lg text-accent whitespace-nowrap">{price}</span>
                </li>
              ))}
            </ul>

            <ul className="space-y-3 mb-8 flex-1">
              {includes.map((item) => (
                <li key={item} className="flex gap-3 font-jost font-light text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>

            <Button variant="outline" onClick={() => navigate("/membership")} className="w-full sm:w-auto">
              Compare all programs
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePricingSection;
