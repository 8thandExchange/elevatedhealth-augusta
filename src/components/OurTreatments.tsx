import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";
import { SITE_CONFIG } from "@/lib/siteConfig";
import mentalWellness from "@/assets/treatment-mental-wellness.jpg";
import bodyTransformation from "@/assets/treatment-body-transformation.jpg";
import vitalityRestoration from "@/assets/treatment-vitality-restoration.jpg";

const treatments = [
  {
    id: "hormones",
    number: "01",
    title: "Hormone Optimization",
    tagline: "Physician-prescribed HRT and TRT for men and women",
    route: SITE_CONFIG.routes.hormones,
    image: mentalWellness,
  },
  {
    id: "weight-loss",
    number: "02",
    title: "Metabolic Reset",
    tagline: "GLP-1 protocols optimized by hormone testing for lasting results",
    route: SITE_CONFIG.routes.weightloss,
    image: bodyTransformation,
  },
  {
    id: "hormones",
    number: "03",
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
    <section id="treatments" className="storefront-section bg-background scroll-mt-20 relative overflow-hidden">
      {/* Decorative blob */}
      <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-peach opacity-20 blur-3xl" />
      
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm tracking-[0.3em] uppercase text-primary mb-4 font-inter font-semibold">
            02 — Our Pathways
          </p>
          <h2 className="font-inter font-bold text-foreground text-3xl md:text-4xl lg:text-5xl mb-6 leading-tight">
            Three Integrated <span className="text-primary">Resets</span>
          </h2>
          <p className="text-lg text-muted-foreground font-inter leading-relaxed">
            We test before we treat. Every protocol is architected around your unique biology.
          </p>
        </div>

        {/* Treatment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {treatments.map((treatment, index) => (
            <article 
              key={treatment.id}
              className="group cursor-pointer animate-fade-in-up"
              onClick={() => navigate(treatment.route)}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="relative rounded-2xl overflow-hidden bg-card border border-border/30 shadow-sm hover:shadow-lg transition-all duration-500 group-hover:-translate-y-1">
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
                  <span className="text-xs font-inter font-bold text-primary tracking-wider">{treatment.number}</span>
                  <h3 className="text-xl lg:text-2xl font-inter font-bold text-foreground mb-2 mt-1">
                    {treatment.title}
                  </h3>
                  <p className="text-muted-foreground font-inter text-sm leading-relaxed mb-4">
                    {treatment.tagline}
                  </p>
                  <div className="flex items-center gap-2 text-primary font-inter text-sm font-semibold group-hover:gap-3 transition-all duration-300">
                    <span>Learn More</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground font-inter mb-6">
            Not sure which reset is right for you?
          </p>
          <button
            onClick={openBooking}
            className="inline-flex items-center gap-2 text-primary font-inter text-sm font-semibold tracking-wide hover:gap-3 transition-all duration-300"
          >
            <span>Request a personalized consultation</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default OurTreatments;
