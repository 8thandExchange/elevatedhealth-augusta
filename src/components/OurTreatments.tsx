import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SITE_CONFIG } from "@/lib/siteConfig";
import ivTherapy from "@/assets/iv-therapy-closeup.jpg";
import providerCare from "@/assets/provider-monitored-care.jpg";
import clinicInterior from "@/assets/clinic-interior.jpg";

interface OurTreatmentsProps {
  onOpenBooking: () => void;
}

const treatments = [
  {
    id: "ketamine",
    title: "Ketamine Therapy",
    subtitle: "Mental Wellness",
    description: "FDA-approved treatment for depression, anxiety, and PTSD. Experience breakthrough relief in a serene, medically supervised environment.",
    image: ivTherapy,
    route: "/ketamine",
  },
  {
    id: "weight-loss",
    title: "Medical Weight Loss",
    subtitle: "Body Transformation",
    description: "Personalized GLP-1 programs designed to help you achieve sustainable results with ongoing provider support.",
    image: providerCare,
    route: "/weight-loss",
  },
  {
    id: "hormones",
    title: "Hormone Optimization",
    subtitle: "Vitality Restoration",
    description: "Restore balance and reclaim your energy with customized hormone replacement therapy for men and women.",
    image: clinicInterior,
    route: "/hormones",
  },
];

const OurTreatments = ({ onOpenBooking }: OurTreatmentsProps) => {
  const navigate = useNavigate();

  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4 font-inter font-light">
            Our Services
          </p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-cormorant font-light text-foreground mb-6">
            Curated Treatments
          </h2>
          <p className="text-lg text-muted-foreground font-inter font-light leading-relaxed">
            Each treatment is thoughtfully designed to address your unique wellness journey
          </p>
        </div>

        {/* Treatments Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
          {treatments.map((treatment, index) => (
            <article 
              key={treatment.id}
              className="group cursor-pointer"
              onClick={() => navigate(treatment.route)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image Container */}
              <div className="relative aspect-[4/5] mb-6 overflow-hidden bg-secondary">
                <img
                  src={treatment.image}
                  alt={treatment.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-500" />
              </div>

              {/* Content */}
              <div className="space-y-3">
                <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-inter">
                  {treatment.subtitle}
                </p>
                <h3 className="text-2xl lg:text-3xl font-cormorant font-light text-foreground group-hover:text-primary transition-colors duration-300">
                  {treatment.title}
                </h3>
                <p className="text-muted-foreground font-inter font-light leading-relaxed text-sm">
                  {treatment.description}
                </p>
                
                {/* Learn More Link */}
                <div className="flex items-center gap-2 pt-2 text-primary font-inter text-sm">
                  <span className="elegant-underline">Learn More</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20 pt-16 border-t border-border">
          <p className="text-lg text-muted-foreground font-inter font-light mb-6">
            Not sure which treatment is right for you?
          </p>
          <button
            onClick={onOpenBooking}
            className="inline-flex items-center gap-2 text-primary font-inter text-sm tracking-wide hover:gap-3 transition-all duration-300"
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
