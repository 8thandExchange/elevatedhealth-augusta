import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useScrollReveal, revealClasses } from "@/hooks/useScrollReveal";
import { getPublicHomepageServices } from "@/lib/clinicalOptimizationCatalog";

const WhatWeDoSection = () => {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="section-band-surface">
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {getPublicHomepageServices().map((s, i) => {
            return (
              <button
                key={s.title}
                onClick={() => navigate(s.route)}
                className={`group premium-card text-left flex flex-col p-8 md:p-10 hover:border-accent/25 ${revealClasses.fadeUp(isVisible)}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="flex flex-col flex-1">
                  <p className="section-label mb-4 text-[11px]">{s.tagline}</p>
                  <h3 className="font-playfair text-xl md:text-2xl text-foreground mb-4 leading-snug">
                    {s.title}
                  </h3>
                  <p className="font-jost font-light text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
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
