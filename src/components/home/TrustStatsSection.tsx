import { useScrollReveal, revealClasses } from "@/hooks/useScrollReveal";

const stats = [
  { value: "$79", label: "Wellness Assessment", detail: "Universal front door — credited toward your program when you enroll" },
  { value: "503A", label: "Compounding pharmacy", detail: "Patient-specific medications from licensed 503A partners" },
  { value: "LabCorp", label: "Lab partner", detail: "In-office draws at Evans — results in your portal" },
  { value: "100%", label: "Physician-owned", detail: "Every protocol signed by a board-certified MD" },
];

const TrustStatsSection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="py-12 md:py-16 bg-background border-b border-border">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`text-center lg:text-left premium-card-muted p-6 md:p-8 ${revealClasses.fadeUp(isVisible)}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <p className="stat-display mb-2">{s.value}</p>
              <p className="stat-label mb-2">{s.label}</p>
              <p className="font-jost font-light text-xs text-muted-foreground leading-relaxed hidden sm:block">
                {s.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustStatsSection;
