import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import { MARKETING_IMAGES } from "@/lib/marketingImages";
import { useScrollReveal, revealClasses } from "@/hooks/useScrollReveal";
import { getPublicHomepageServices } from "@/lib/clinicalOptimizationCatalog";

const imageMap = {
  serviceHormones: MARKETING_IMAGES.serviceHormones,
  serviceWeightLoss: MARKETING_IMAGES.serviceWeightLoss,
  serviceIv: MARKETING_IMAGES.serviceIv,
  servicePeptides: MARKETING_IMAGES.servicePeptides,
} as const;

const WhatWeDoSection = () => {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="py-24 md:py-32 bg-muted/30">
      <div className="container mx-auto px-6 lg:px-8">
        <div className={`max-w-2xl mx-auto text-center mb-6 ${revealClasses.fadeUp(isVisible)}`}>
          <p className="section-label mb-4">What We Do</p>
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-foreground">
            Physician-led <span className="italic">optimization</span>
          </h2>
        </div>
        <p
          className={`font-jost text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-16 ${revealClasses.fadeUp(isVisible)}`}
        >
          Lab-guided, provider-reviewed, individualized care — we help you understand options; your
          physician decides what is appropriate after assessment and labs.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border max-w-6xl mx-auto border border-border">
          {getPublicHomepageServices().map((s, i) => {
            const image = imageMap[s.imageKey];
            return (
              <button
                key={s.title}
                onClick={() => navigate(s.route)}
                className={`group text-left bg-background flex flex-col overflow-hidden transition-colors duration-300 hover:bg-muted/40 hover:shadow-[0_12px_40px_rgba(42,40,38,0.08)] ${revealClasses.fadeUp(isVisible)}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {image ? (
                  <MarketingImage
                    src={image}
                    alt={s.title}
                    className="aspect-[16/10] w-full shrink-0"
                    imgClassName="transition-transform duration-500 group-hover:scale-105"
                  />
                ) : null}
                <div className="p-10 flex flex-col flex-1">
                  <p className="section-label mb-4 text-[11px]">{s.tagline}</p>
                  <h3 className="font-playfair text-xl md:text-2xl text-foreground mb-4 leading-snug">
                    {s.title}
                  </h3>
                  <p className="font-jost font-light text-sm text-muted-foreground leading-relaxed mb-6 min-h-[60px]">
                    {s.body}
                  </p>
                  <div className="flex items-center gap-2 font-jost text-xs uppercase tracking-[2px] text-accent group-hover:gap-3 transition-all mt-auto">
                    <span>Explore</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhatWeDoSection;
