import { MarketingImage } from "@/components/marketing/MarketingImage";
import { MARKETING_IMAGES } from "@/lib/marketingImages";
import { useScrollReveal, revealClasses } from "@/hooks/useScrollReveal";

const ClinicalTeamSection = () => {
  const { ref, isVisible } = useScrollReveal();
  return (
    <section ref={ref} className="py-24 md:py-32 bg-muted/30">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Portrait — 4:5 */}
          <MarketingImage
            src={MARKETING_IMAGES.physician}
            alt="Elevated Health Augusta Medical Director"
            fallbackVariant="warm"
            className={`aspect-[4/5] border border-border ${revealClasses.fadeUp(isVisible)}`}
            imgClassName="grayscale-[15%]"
          />

          {/* Bio */}
          <div className={`${revealClasses.fadeUp(isVisible)}`} style={{ transitionDelay: "100ms" }}>
            <p className="section-label mb-5">Clinical Leadership</p>
            <h2 className="font-playfair italic text-3xl md:text-4xl lg:text-5xl text-foreground mb-3 leading-tight">
              Our Medical Director
            </h2>
            <p className="font-jost font-medium uppercase tracking-[2px] text-xs text-muted-foreground mb-8">
              Board Certified · Physician-Owned
            </p>

            <div className="space-y-5 font-jost font-light text-base text-foreground/90 leading-relaxed">
              <p>
                Elevated Health Augusta is physician-owned and physician-operated.
                Our medical director sets every protocol, reviews every lab, and supervises
                every prescription written in the clinic.
              </p>
              <p>
                With deep training in hormone optimization, peptide medicine, and
                metabolic health, the practice is built around a simple belief: patients
                deserve to know their physician — and their physician should know them.
              </p>
              <p className="text-muted-foreground italic font-playfair">
                "We're not building an app. We're rebuilding a clinic."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClinicalTeamSection;
