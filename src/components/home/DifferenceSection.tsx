import { useScrollReveal, revealClasses } from "@/hooks/useScrollReveal";
import { Check, X } from "lucide-react";

const rows = [
  { feature: "Board-certified physician oversight", us: true, them: false },
  { feature: "In-clinic injections & lab draws", us: true, them: false },
  { feature: "Transdermal compounded hormones", us: true, them: false },
  { feature: "Labs & medications at cost", us: true, them: false },
  { feature: "Algorithmic, asynchronous prescribing", us: false, them: true },
  { feature: "Hidden membership upcharges", us: false, them: true },
];

const DifferenceSection = () => {
  const { ref, isVisible } = useScrollReveal();
  return (
    <section ref={ref} className="section-band-white">
      <div className="container mx-auto px-6 lg:px-8">
        <div className={`max-w-2xl mx-auto text-center mb-16 ${revealClasses.fadeUp(isVisible)}`}>
          <p className="section-label mb-4">The Difference</p>
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
            Not your average <span className="italic">wellness clinic.</span>
          </h2>
          <p className="font-jost font-light text-sm text-muted-foreground max-w-xl mx-auto">
            In-person Evans care vs. telehealth-only apps — side by side.
          </p>
        </div>

        <div className={`max-w-3xl mx-auto premium-card overflow-hidden ${revealClasses.fadeUp(isVisible)}`}>
          <div className="grid grid-cols-[1fr_auto_auto] bg-surface border-b border-border">
            <div className="p-5 font-jost text-xs uppercase tracking-[2px] text-muted-foreground" />
            <div className="p-5 font-jost text-xs uppercase tracking-[2px] text-accent text-center min-w-[110px]">
              Elevated Health
            </div>
            <div className="p-5 font-jost text-xs uppercase tracking-[2px] text-muted-foreground text-center min-w-[110px]">
              Tele-Health Apps
            </div>
          </div>
          {rows.map((r, i) => (
            <div
              key={r.feature}
              className={`grid grid-cols-[1fr_auto_auto] ${
                i !== rows.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="p-5 font-jost font-light text-sm text-foreground">{r.feature}</div>
              <div className="p-5 flex items-center justify-center min-w-[110px]">
                {r.us ? (
                  <Check className="h-4 w-4 text-accent" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground/40" />
                )}
              </div>
              <div className="p-5 flex items-center justify-center min-w-[110px]">
                {r.them ? (
                  <Check className="h-4 w-4 text-muted-foreground/60" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground/40" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DifferenceSection;
