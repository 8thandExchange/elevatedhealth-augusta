import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useScrollReveal, revealClasses } from "@/hooks/useScrollReveal";
import { ACTIVE_SERVICES } from "@/lib/serviceConfig";

const services = [
  {
    title: "Hormone Optimization",
    tagline: "Transdermal HRT & TRT",
    body: "Physician-prescribed bioidentical hormones, compounded as transdermal creams. For men and women rebuilding energy, sleep, and clarity.",
    route: "/hormones",
    enabled: ACTIVE_SERVICES.hormones,
  },
  {
    title: "Medical Weight Loss",
    tagline: "GLP-1 protocols",
    body: "Semaglutide and tirzepatide protocols supervised by physicians. Real titration, real labs, real accountability.",
    route: "/weightloss",
    enabled: ACTIVE_SERVICES.weightLoss,
  },
  {
    title: "IV Therapy",
    tagline: "Book direct, no consult",
    body: "Curated drips and boosters for hydration, recovery, immunity, and performance. Pick your protocol, schedule online.",
    route: "/iv-lounge",
    enabled: ACTIVE_SERVICES.ivLounge,
  },
  {
    title: "Peptide Protocols",
    tagline: "Targeted regeneration",
    body: "The first physician-supervised peptide program in the Augusta area. For recovery, longevity, and cellular performance.",
    route: "/peptides",
    enabled: ACTIVE_SERVICES.peptides,
  },
  {
    title: "Sexual Wellness",
    tagline: "Coming soon",
    body: "Discreet, physician-led care for libido, performance, and intimacy.",
    route: "/sexual-wellness",
    enabled: ACTIVE_SERVICES.sexualWellness,
  },
  {
    title: "Hair Restoration",
    tagline: "Coming soon",
    body: "Compounded topicals and peptide-based protocols for hair retention and regrowth.",
    route: "/hair-restoration",
    enabled: ACTIVE_SERVICES.hairRestoration,
  },
];

const WhatWeDoSection = () => {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="py-24 md:py-32 bg-muted/30">
      <div className="container mx-auto px-6 lg:px-8">
        <div className={`max-w-2xl mx-auto text-center mb-16 ${revealClasses.fadeUp(isVisible)}`}>
          <p className="section-label mb-4">What We Do</p>
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-foreground">
            Focused disciplines. <span className="italic">One standard.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border max-w-6xl mx-auto border border-border">
          {services.filter(s => s.enabled).map((s, i) => {
            return (
              <button
                key={s.title}
                onClick={() => navigate(s.route)}
                className={`group text-left bg-background p-10 transition-colors duration-300 hover:bg-muted/40 ${revealClasses.fadeUp(isVisible)}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <p className="section-label mb-4 text-[11px]">{s.tagline}</p>
                <h3 className="font-playfair text-xl md:text-2xl text-foreground mb-4 leading-snug">
                  {s.title}
                </h3>
                <p className="font-jost font-light text-sm text-muted-foreground leading-relaxed mb-6 min-h-[60px]">
                  {s.body}
                </p>
                <div className="flex items-center gap-2 font-jost text-xs uppercase tracking-[2px] text-accent group-hover:gap-3 transition-all">
                  <span>Explore</span>
                  <ArrowRight className="h-3.5 w-3.5" />
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
