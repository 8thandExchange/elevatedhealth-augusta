import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SITE_CONFIG } from "@/lib/siteConfig";
import ketamineImg from "@/assets/service-ketamine-zen.jpg";
import weightlossImg from "@/assets/service-weightloss-tape.jpg";
import hormonesImg from "@/assets/service-hormones-cool.jpg";

interface OurTreatmentsProps {
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

const treatments = [
  {
    id: "ketamine",
    title: "Ketamine Therapy",
    subtitle: "Mental Wellness",
    description: "FDA-approved treatment for depression, anxiety, and PTSD. Experience breakthrough relief in a serene, medically supervised environment.",
    image: ketamineImg,
    icon: LotusIcon,
    route: "/ketamine",
  },
  {
    id: "weight-loss",
    title: "Medical Weight Loss",
    subtitle: "Body Transformation",
    description: "Personalized GLP-1 programs designed to help you achieve sustainable results with ongoing provider support.",
    image: weightlossImg,
    icon: DNAIcon,
    route: "/weight-loss",
  },
  {
    id: "hormones",
    title: "Hormone Optimization",
    subtitle: "Women's Health",
    description: "Advanced bio-identical hormone replacement therapy (BHRT) for women. Specialized care for perimenopause, menopause, and hormonal balance to restore energy and vitality. Academy-level protocols for safe, effective results.",
    image: hormonesImg,
    icon: FeminineIcon,
    route: "/hormones",
  },
];

const OurTreatments = ({ onOpenBooking }: OurTreatmentsProps) => {
  const navigate = useNavigate();

  return (
    <section className="section-spacing bg-background">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <p className="text-sm tracking-[0.3em] uppercase text-accent mb-4 font-lato font-light">
            Our Services
          </p>
          <h2 className="font-cormorant text-foreground mb-6">
            Curated Treatments
          </h2>
          <p className="text-lg text-muted-foreground font-lato font-light leading-relaxed">
            Each treatment is thoughtfully designed to address your unique wellness journey
          </p>
        </div>

        {/* Treatments Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-8">
          {treatments.map((treatment, index) => {
            const Icon = treatment.icon;
            return (
              <article 
                key={treatment.id}
                className="group cursor-pointer"
                onClick={() => navigate(treatment.route)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] mb-8 overflow-hidden bg-secondary">
                  <img
                    src={treatment.image}
                    alt={treatment.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Subtle overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-foreground/10" />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-500" />
                </div>

                {/* Content */}
                <div className="space-y-4">
                  {/* Icon and Subtitle */}
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <p className="text-xs tracking-[0.2em] uppercase text-accent font-lato">
                      {treatment.subtitle}
                    </p>
                  </div>
                  
                  <h3 className="text-2xl lg:text-3xl font-cormorant text-foreground group-hover:text-primary transition-colors duration-300">
                    {treatment.title}
                  </h3>
                  <p className="text-muted-foreground font-lato font-light leading-relaxed text-sm">
                    {treatment.description}
                  </p>
                  
                  {/* Learn More Link */}
                  <div className="flex items-center gap-2 pt-2 text-primary font-lato text-sm">
                    <span className="elegant-underline">Learn More</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
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
