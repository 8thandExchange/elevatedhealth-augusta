import { useScrollReveal, revealClasses } from "@/hooks/useScrollReveal";

const pillars = [
  {
    label: "Physician-Led",
    title: "Every protocol signed by an MD.",
    body: "Not a med-spa. Not a chain. Care is directed by board-certified physicians and administered in-clinic by experienced clinical staff.",
  },
  {
    label: "Transparent Pricing",
    title: "No surprise bills. Ever.",
    body: "Memberships include your medication, monthly check-in, free quarterly labs, and unlimited messaging — one transparent monthly price, no hidden fees.",
  },
  {
    label: "Continuity of Care",
    title: "The same team, every time.",
    body: "You'll see the same clinical team for every visit, every titration, every check-in — the way medicine used to be.",
  },
];

const WhyElevatedSection = () => {
  const { ref, isVisible } = useScrollReveal();
  return (
    <section ref={ref} className="section-band-surface">
      <div className="container mx-auto px-6 lg:px-8">
        <div className={`max-w-2xl mx-auto text-center mb-16 ${revealClasses.fadeUp(isVisible)}`}>
          <p className="section-label mb-4">Why Elevated Health</p>
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-foreground">
            A different <span className="italic">standard of care.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-border max-w-6xl mx-auto border border-border">
          {pillars.map((p, i) => (
            <div
              key={p.label}
              className={`bg-background p-10 lg:p-12 ${revealClasses.fadeUp(isVisible)}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <p className="section-label mb-5">{p.label}</p>
              <h3 className="font-playfair text-xl md:text-2xl text-foreground mb-4 leading-snug">
                {p.title}
              </h3>
              <p className="font-jost font-light text-sm text-muted-foreground leading-relaxed">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyElevatedSection;
