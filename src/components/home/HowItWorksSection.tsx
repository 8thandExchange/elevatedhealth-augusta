import { useScrollReveal, revealClasses } from "@/hooks/useScrollReveal";
import { CORE_SERVICES } from "@/lib/stripeConfig";

const steps = [
  {
    n: "01",
    title: "Wellness Assessment",
    body: `A 30–45 minute, in-clinic visit with our RN to map your symptoms, history, and goals. ${CORE_SERVICES.wellnessAssessment.displayPrice}.`,
  },
  {
    n: "02",
    title: "Diagnostic Workup",
    body: `In-office blood draw at our Evans office; panels such as the Comprehensive Wellness Panel (${CORE_SERVICES.comprehensivePanel.displayPrice}) or Expanded Panel (${CORE_SERVICES.expandedPanel.displayPrice}) sent to LabCorp—interpreted by your physician-led team.`,
  },
  {
    n: "03",
    title: "Personalized Protocol",
        body: "A treatment plan built around your biology — hormones, peptides, GLP-1 care, or IV therapy — only after your provider reviews labs.",
  },
  {
    n: "04",
    title: "Ongoing Optimization",
    body: "An ELEVATED program keeps you on track with medication included where prescribed, monthly check-ins with our clinical team, quarterly labs, and unlimited messaging.",
  },
];

const HowItWorksSection = () => {
  const { ref, isVisible } = useScrollReveal();
  return (
    <section ref={ref} className="section-band-white">
      <div className="container mx-auto px-6 lg:px-8">
        <div className={`max-w-2xl mx-auto text-center mb-16 ${revealClasses.fadeUp(isVisible)}`}>
          <p className="section-label mb-4">How It Works</p>
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-foreground">
            Four steps to <span className="italic">feeling like yourself.</span>
          </h2>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className={`${revealClasses.fadeUp(isVisible)}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="border-t border-accent/40 pt-6">
                <p className="font-playfair italic text-accent text-2xl mb-3">{s.n}</p>
                <h3 className="font-playfair text-lg md:text-xl text-foreground mb-3 leading-snug">
                  {s.title}
                </h3>
                <p className="font-jost font-light text-sm text-muted-foreground leading-relaxed">
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
