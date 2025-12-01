import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface OurTreatmentsProps {
  onOpenBooking: () => void;
}

// Thin Stroke Minimalist Icons (White)
const LotusIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C12 2 8 6 8 10C8 14 12 18 12 18C12 18 16 14 16 10C16 6 12 2 12 2Z" />
    <path d="M12 18C12 18 6 14 2 14C2 14 4 18 8 20C12 22 12 22 12 22" />
    <path d="M12 18C12 18 18 14 22 14C22 14 20 18 16 20C12 22 12 22 12 22" />
  </svg>
);

const DNAIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 15C2 15 4 13 7 13C10 13 12 15 12 15C12 15 14 17 17 17C20 17 22 15 22 15" />
    <path d="M2 9C2 9 4 11 7 11C10 11 12 9 12 9C12 9 14 7 17 7C20 7 22 9 22 9" />
    <line x1="4" y1="4" x2="4" y2="20" />
    <line x1="20" y1="4" x2="20" y2="20" />
  </svg>
);

const FeminineIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="5" />
    <line x1="12" y1="13" x2="12" y2="21" />
    <line x1="9" y1="18" x2="15" y2="18" />
  </svg>
);

const treatments = [
  {
    id: "ketamine",
    title: "Ketamine Therapy",
    tagline: "Mental Clarity & Neural Repair",
    icon: LotusIcon,
    route: "/ketamine",
    gradient: "from-[#1a365d] via-[#2c5282] to-[#1a365d]",
  },
  {
    id: "weight-loss",
    title: "Medical Weight Loss",
    tagline: "Metabolic Reset & Composition",
    icon: DNAIcon,
    route: "/weight-loss",
    gradient: "from-[#2d3748] via-[#4a5568] to-[#2d3748]",
  },
  {
    id: "hormones",
    title: "Hormone Optimization",
    tagline: "Women's Vitality & Academy-Level Protocols",
    icon: FeminineIcon,
    route: "/hormones",
    gradient: "from-[#2c3e50] via-[#34495e] to-[#2c3e50]",
  },
];

const OurTreatments = ({ onOpenBooking }: OurTreatmentsProps) => {
  const navigate = useNavigate();

  return (
    <section id="treatments" className="section-spacing bg-background scroll-mt-20">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <p className="text-sm tracking-[0.3em] uppercase text-gold mb-4 font-lato font-light">
            Our Services
          </p>
          <h2 className="font-cormorant text-foreground mb-6">
            Pillars of Care
          </h2>
          <p className="text-lg text-muted-foreground font-lato font-light leading-relaxed">
            Three integrated pathways to restore your wellbeing
          </p>
        </div>

        {/* Textural Cards Grid - Compact Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {treatments.map((treatment, index) => {
            const Icon = treatment.icon;
            return (
              <article 
                key={treatment.id}
                className="group cursor-pointer animate-fade-in-up"
                onClick={() => navigate(treatment.route)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Card Container - More compact */}
                <div className={`relative rounded-xl overflow-hidden bg-gradient-to-br ${treatment.gradient} p-6 flex flex-col gap-4 transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-xl`}>
                  {/* Subtle texture overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.05)_0%,_transparent_50%)]" />
                  
                  {/* Icon + Content Row */}
                  <div className="relative z-10 flex items-start gap-4">
                    <Icon className="h-8 w-8 text-white/90 shrink-0" />
                    <div className="space-y-1">
                      <h3 className="text-lg font-cormorant text-white">
                        {treatment.title}
                      </h3>
                      <p className="text-white/70 font-lato font-light text-sm">
                        {treatment.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Hover Arrow */}
                  <div className="relative z-10 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="h-4 w-4 text-white/80" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20 pt-16 border-t border-border">
          <p className="text-lg text-muted-foreground font-lato font-light mb-6">
            Not sure which treatment is right for you?
          </p>
          <button
            onClick={onOpenBooking}
            className="inline-flex items-center gap-2 text-primary font-lato text-sm tracking-wide hover:gap-3 transition-all duration-300"
          >
            <span className="elegant-underline">Schedule a complimentary consultation</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default OurTreatments;
