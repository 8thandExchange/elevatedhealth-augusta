import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";
import { SITE_CONFIG } from "@/lib/siteConfig";
import mentalWellness from "@/assets/treatment-mental-wellness.jpg";
import bodyTransformation from "@/assets/treatment-body-transformation.jpg";
import vitalityRestoration from "@/assets/treatment-vitality-restoration.jpg";

const treatments = [
  {
    id: "ketamine",
    title: "Neural Restoration",
    tagline: "Reset neural pathways altered by chronic stress, anxiety, and depression",
    route: SITE_CONFIG.routes.ketamine,
    image: mentalWellness,
  },
  {
    id: "weight-loss",
    title: "Metabolic Reset",
    tagline: "GLP-1 protocols optimized by hormone testing for lasting results",
    route: SITE_CONFIG.routes.weightloss,
    image: bodyTransformation,
  },
  {
    id: "hormones",
    title: "Biological Reset",
    tagline: "Precision bio-identical protocols tailored to your unique biology",
    route: SITE_CONFIG.routes.hormones,
    image: vitalityRestoration,
  },
];

const OurTreatments = () => {
  const navigate = useNavigate();
  const { openBooking } = useBooking();

  return (
    <section id="treatments" className="py-20 md:py-28 bg-[hsl(40_20%_97%)] scroll-mt-20">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm tracking-[0.3em] uppercase text-accent mb-4 font-lato font-light">
            Our Pathways
          </p>
          <h2 className="font-cormorant text-foreground mb-6">
            Three Integrated Resets
          </h2>
          <p className="text-lg text-muted-foreground font-lato font-light leading-relaxed">
            We test before we treat. Every protocol is architected around your unique biology.
          </p>
        </div>

        {/* Treatment Cards with Images */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {treatments.map((treatment, index) => (
            <article 
              key={treatment.id}
              className="group cursor-pointer animate-fade-in-up"
              onClick={() => navigate(treatment.route)}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="relative rounded-2xl overflow-hidden bg-card border border-border/50 shadow-sm hover:shadow-lg transition-all duration-500 group-hover:scale-[1.02]">
                {/* Image */}
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={treatment.image}
                    alt={treatment.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Content */}
                <div className="p-6 lg:p-8">
                  <h3 className="text-xl lg:text-2xl font-cormorant text-foreground mb-2">
                    {treatment.title}
                  </h3>
                  <p className="text-muted-foreground font-lato font-light text-sm leading-relaxed mb-4">
                    {treatment.tagline}
                  </p>
                  <div className="flex items-center gap-2 text-accent font-lato text-sm font-medium group-hover:gap-3 transition-all duration-300">
                    <span>Learn More</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 pt-10 border-t border-border">
          <p className="text-lg text-muted-foreground font-lato font-light mb-6">
            Not sure which reset is right for you?
          </p>
          <button
            onClick={openBooking}
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
