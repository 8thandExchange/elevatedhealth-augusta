import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SITE_CONFIG } from "@/lib/siteConfig";

interface PillarGridProps {
  onOpenBooking: () => void;
}

// Thin Stroke Minimalist Icons in Dark Slate Blue
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

const PillarGrid = ({ onOpenBooking }: PillarGridProps) => {
  const navigate = useNavigate();

  const pillars = [
    {
      icon: LotusIcon,
      title: "Peptide Protocols",
      description: "Physician-supervised Recovery Peptide Review and focused peptide categories — assessment-first, never a catalog.",
      route: SITE_CONFIG.routes.peptides,
      features: ["Growth hormone support", "Tissue repair", "Physician-supervised"]
    },
    {
      icon: DNAIcon,
      title: "Medical Weight Loss",
      description: "Semaglutide (GLP-1) therapy with personalized nutrition and lifestyle support",
      route: SITE_CONFIG.routes.weightloss,
      features: ["15-20% weight loss", "Physician supervised", "Evidence-based"]
    },
    {
      icon: FeminineIcon,
      title: "Hormone Optimization",
      description: "Advanced BHRT for women: perimenopause, menopause, and hormonal balance",
      route: SITE_CONFIG.routes.hormones,
      features: ["Women's health focus", "Lab testing included", "Academy protocols"]
    }
  ];

  return (
    <section id="pillars" className="section-spacing bg-secondary/30 scroll-mt-20">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20 animate-fade-in-up">
            <p className="text-sm tracking-[0.3em] uppercase text-accent mb-4 font-lato font-light">
              Our Approach
            </p>
            <h2 className="font-cormorant text-foreground mb-6">
              Your Path to Wellness
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
              Three comprehensive pillars of care designed to help you restore your mind, renew your body, and rebalance your hormones
            </p>
          </div>

          {/* Pillars Grid */}
          <div className="grid md:grid-cols-3 gap-10 lg:gap-12">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <Card 
                  key={index} 
                  className="group hover:shadow-lg transition-all duration-500 border border-border/50 hover:border-primary/20 cursor-pointer bg-card animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.15}s` }}
                  onClick={() => navigate(pillar.route)}
                >
                  <CardContent className="p-6 lg:p-8">
                    {/* Thin-stroke Icon */}
                    <div className="mb-6">
                      <Icon className="h-16 w-16 text-primary" />
                    </div>
                    
                    <h3 className="text-2xl font-cormorant mb-3 text-foreground group-hover:text-primary transition-colors">
                      {pillar.title}
                    </h3>
                    
                    <p className="text-muted-foreground mb-6 leading-relaxed font-light">
                      {pillar.description}
                    </p>

                    {/* Features with slate blue dots */}
                    <ul className="space-y-2 mb-6">
                      {pillar.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-center gap-3">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* Learn More Link */}
                    <div className="flex items-center gap-2 text-primary font-lato text-sm tracking-wide">
                      <span className="elegant-underline">Learn More</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PillarGrid;
