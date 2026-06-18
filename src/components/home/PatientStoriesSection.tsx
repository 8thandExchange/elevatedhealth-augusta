import { useScrollReveal, revealClasses } from "@/hooks/useScrollReveal";

const stories = [
  {
    tag: "Hormones",
    headline: "The fog lifted before I realized how bad it was",
    body: "Perimenopause symptoms for years — hot flashes, zero sleep, weight that wouldn't budge. Labs showed what my PCP missed. Within six weeks on a custom cream protocol, I felt like myself again.",
    attribution: "Patient in Evans, GA · ELEVATED HRT",
  },
  {
    tag: "Weight loss",
    headline: "In-person care made the difference",
    body: "I'd tried telehealth GLP-1 clinics. Here, a physician reviewed my history face-to-face, adjusted my dose in real time, and my team answered messages the same day. No algorithm, no ghosting.",
    attribution: "Patient in Augusta area · ELEVATED GLP-1",
  },
  {
    tag: "Men's health",
    headline: "Numbers on paper finally matched how I felt",
    body: "Low energy, declining drive, brain fog in my forties. TRT wasn't a quick fix — it was a monitored protocol with quarterly labs and a team that actually knew my name.",
    attribution: "Patient in Evans, GA · ELEVATED TRT",
  },
];

const PatientStoriesSection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="section-band-surface">
      <div className="container mx-auto px-6 lg:px-8">
        <div className={`max-w-2xl mx-auto text-center mb-14 ${revealClasses.fadeUp(isVisible)}`}>
          <p className="section-label mb-4">Real Patients</p>
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-foreground">
            Real people. <span className="italic">Real results.</span>
          </h2>
          <p className="font-jost font-light text-sm text-muted-foreground mt-4">
            Individual outcomes vary. These are representative experiences — not guarantees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {stories.map((s, i) => (
            <article
              key={s.headline}
              className={`premium-card p-8 flex flex-col ${revealClasses.fadeUp(isVisible)}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <p className="font-jost text-[11px] uppercase tracking-[0.2em] text-accent mb-4">{s.tag}</p>
              <h3 className="font-playfair text-xl text-foreground mb-4 leading-snug">{s.headline}</h3>
              <p className="font-jost font-light text-sm text-muted-foreground leading-relaxed flex-1 mb-6">
                {s.body}
              </p>
              <p className="font-jost text-xs text-muted-foreground/80 border-t border-border pt-4">{s.attribution}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PatientStoriesSection;
