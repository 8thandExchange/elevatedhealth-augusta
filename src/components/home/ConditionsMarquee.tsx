const conditions = [
  "Hormone imbalance",
  "Low testosterone",
  "Perimenopause",
  "Brain fog",
  "Weight resistance",
  "Fatigue",
  "Poor sleep",
  "Metabolic health",
  "Thyroid dysfunction",
  "Inflammation",
  "Recovery & healing",
  "IV hydration",
  "GLP-1 candidacy",
  "Peptide optimization",
  "Libido changes",
  "Muscle loss",
];

const ConditionsMarquee = () => {
  const items = [...conditions, ...conditions];

  return (
    <section
      className="py-8 bg-surface border-y border-border overflow-hidden"
      aria-label="Conditions we help address"
    >
      <div className="container mx-auto px-6 lg:px-8 mb-4">
        <p className="section-label text-center">Clinical focus areas</p>
      </div>
      <div className="relative">
        <div className="conditions-marquee-track gap-8 px-4">
          {items.map((label, i) => (
            <span
              key={`${label}-${i}`}
              className="font-jost text-sm md:text-base text-muted-foreground whitespace-nowrap px-2"
            >
              {label}
              <span className="text-accent mx-4" aria-hidden>
                ·
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ConditionsMarquee;
