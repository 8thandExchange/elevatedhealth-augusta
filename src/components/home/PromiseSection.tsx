import { useScrollReveal, revealClasses } from "@/hooks/useScrollReveal";

const PromiseSection = () => {
  const { ref, isVisible } = useScrollReveal();
  return (
    <section ref={ref} className="section-band-white">
      <div className="container mx-auto px-6 lg:px-8">
        <div className={`max-w-3xl mx-auto text-center ${revealClasses.fadeUp(isVisible)}`}>
          <p className="section-label mb-6">Our Promise</p>
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-foreground leading-[1.15] mb-8">
            Medicine, restored to <span className="italic">its original intention.</span>
          </h2>
          <div className="section-divider max-w-[80px] mx-auto mb-8" />
          <p className="font-jost font-light text-base md:text-lg text-muted-foreground leading-relaxed">
            We believe healthcare should feel personal, not transactional. Every protocol is
            written by a board-certified physician. ELEVATED memberships bundle medication (where
            prescribed), lab review, and unlimited messaging into one predictable monthly price—so
            you always know what to expect.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PromiseSection;
