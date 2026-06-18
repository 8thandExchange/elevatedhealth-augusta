import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useScrollReveal, revealClasses } from "@/hooks/useScrollReveal";
import { CORE_SERVICES } from "@/lib/stripeConfig";
import { Button } from "@/components/ui/button";

const categories = [
  {
    label: "Hormones & thyroid",
    count: "16+ biomarkers",
    markers: ["Testosterone", "Estradiol", "Progesterone", "TSH / Free T4", "DHEA-S"],
    route: "/hormones-women",
  },
  {
    label: "Metabolic & weight",
    count: "18+ biomarkers",
    markers: ["A1C", "Fasting insulin", "ApoB", "Lp(a)", "Leptin", "Cortisol"],
    route: "/weight-loss",
  },
  {
    label: "Heart & inflammation",
    count: "12+ biomarkers",
    markers: ["Lipid panel", "hs-CRP", "Homocysteine", "CMP", "CBC"],
    route: "/membership",
  },
  {
    label: "Nutrients & recovery",
    count: "10+ biomarkers",
    markers: ["Vitamin D", "B12", "Folate", "Iron studies", "Ferritin"],
    route: "/peptides",
  },
];

const LabFocusSection = () => {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="section-band-white">
      <div className="container mx-auto px-6 lg:px-8">
        <div className={`max-w-3xl mx-auto text-center mb-14 ${revealClasses.fadeUp(isVisible)}`}>
          <p className="section-label mb-4">Lab-Guided Care</p>
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">
            Panels chosen for <span className="italic">real optimization.</span>
          </h2>
          <p className="font-jost font-light text-base text-muted-foreground leading-relaxed">
            Blood drawn in-office at Evans, processed by LabCorp, reviewed by your physician-led team.
            Comprehensive Wellness Panel {CORE_SERVICES.comprehensivePanel.displayPrice} · Expanded Panel{" "}
            {CORE_SERVICES.expandedPanel.displayPrice}.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto mb-12">
          {categories.map((cat, i) => (
            <button
              key={cat.label}
              type="button"
              onClick={() => navigate(cat.route)}
              className={`premium-card text-left p-6 md:p-7 group hover:border-accent/30 ${revealClasses.fadeUp(isVisible)}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <p className="font-jost text-[11px] uppercase tracking-[0.2em] text-accent mb-3">{cat.count}</p>
              <h3 className="font-playfair text-xl text-foreground mb-4 leading-snug">{cat.label}</h3>
              <ul className="space-y-1.5 mb-5">
                {cat.markers.map((m) => (
                  <li key={m} className="font-jost font-light text-xs text-muted-foreground">
                    {m}
                  </li>
                ))}
              </ul>
              <span className="inline-flex items-center gap-1 font-jost text-xs uppercase tracking-[0.15em] text-accent group-hover:gap-2 transition-all">
                Explore <ArrowRight className="h-3 w-3" />
              </span>
            </button>
          ))}
        </div>

        <div className={`text-center ${revealClasses.fadeUp(isVisible)}`}>
          <Button variant="outline" onClick={() => navigate("/membership")}>
            See program pricing
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LabFocusSection;
