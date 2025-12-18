import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface OurTreatmentsProps {
  onOpenBooking: () => void;
}

// Thin Stroke Minimalist Icons
const LotusIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C12 2 8 6 8 10C8 14 12 18 12 18C12 18 16 14 16 10C16 6 12 2 12 2Z" />
    <path d="M12 18C12 18 6 14 2 14C2 14 4 18 8 20C12 22 12 22 12 22" />
    <path d="M12 18C12 18 18 14 22 14C22 14 20 18 16 20C12 22 12 22 12 22" />
  </svg>
);

const DNAIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 15C2 15 4 13 7 13C10 13 12 15 12 15C12 15 14 17 17 17C20 17 22 15 22 15" />
    <path d="M2 9C2 9 4 11 7 11C10 11 12 9 12 9C12 9 14 7 17 7C20 7 22 9 22 9" />
    <line x1="4" y1="4" x2="4" y2="20" />
    <line x1="20" y1="4" x2="20" y2="20" />
  </svg>
);

const FeminineIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="5" />
    <line x1="12" y1="13" x2="12" y2="21" />
    <line x1="9" y1="18" x2="15" y2="18" />
  </svg>
);

import { SITE_CONFIG } from "@/lib/siteConfig";

const treatments = [
  {
    id: "ketamine",
    title: "Neural Restoration",
    tagline: "Reset neural pathways altered by stress",
    icon: LotusIcon,
    route: SITE_CONFIG.routes.ketamine,
    iconColor: "#1a8a9a",
  },
  {
    id: "weight-loss",
    title: "Metabolic Reset",
    tagline: "GLP-1s optimized by hormone testing",
    icon: DNAIcon,
    route: SITE_CONFIG.routes.weightloss,
    iconColor: "#D4A017",
  },
  {
    id: "hormones",
    title: "Biological Reset",
    tagline: "Precision bio-identical protocols",
    icon: FeminineIcon,
    route: SITE_CONFIG.routes.hormones,
    iconColor: "#1a8a9a",
  },
];

const OurTreatments = ({ onOpenBooking }: OurTreatmentsProps) => {
  const navigate = useNavigate();

  return (
    <section id="treatments" className="py-16 md:py-24 bg-background scroll-mt-20">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm tracking-[0.3em] uppercase text-gold mb-4 font-lato font-light">
            Our Pathways
          </p>
          <h2 className="font-cormorant text-foreground mb-6">
            Three Integrated Resets
          </h2>
          <p className="text-lg text-muted-foreground font-lato font-light leading-relaxed">
            We test before we treat. Every protocol is architected around your unique biology.
          </p>
        </div>

        {/* White Cards Grid - Light Luxury Style */}
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
                {/* Card Container - White with shadow */}
                <div className="relative rounded-2xl overflow-hidden bg-white p-8 flex flex-col gap-4 transition-all duration-500 group-hover:scale-[1.02] shadow-md hover:shadow-xl border border-gray-100">
                  {/* Icon + Content */}
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${treatment.iconColor}15` }}
                    >
                      <Icon className="h-6 w-6" style={{ color: treatment.iconColor }} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-cormorant text-[#2C3E50]">
                        {treatment.title}
                      </h3>
                      <p className="text-[#64748b] font-lato font-light text-sm">
                        {treatment.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Hover Arrow */}
                  <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="h-4 w-4" style={{ color: treatment.iconColor }} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-14 pt-10 border-t border-border">
          <p className="text-lg text-muted-foreground font-lato font-light mb-6">
            Not sure which reset is right for you?
          </p>
          <button
            onClick={onOpenBooking}
            className="inline-flex items-center gap-2 text-primary font-lato text-sm tracking-wide hover:gap-3 transition-all duration-300"
          >
            <span className="elegant-underline">Request a personalized consultation</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default OurTreatments;