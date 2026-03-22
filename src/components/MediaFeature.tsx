import { ArrowRight } from "lucide-react";
import mediaImage from "@/assets/jennie-tv-feature.webp";

const MediaFeature = () => {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4 font-lato font-light">
            Press
          </p>
          <h2 className="text-3xl sm:text-4xl font-cormorant text-foreground">
            As Featured On
          </h2>
        </div>

        {/* Feature Card */}
        <div className="grid lg:grid-cols-2 gap-0 overflow-hidden bg-card border border-border/50">
          {/* Image */}
          <div className="relative aspect-[4/3] lg:aspect-auto">
            <img
              src={mediaImage}
              alt="Réveil featured on WJBF News"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4 font-lato">
              WJBF News Channel 6
            </p>
            <h3 className="text-2xl lg:text-3xl font-cormorant text-foreground mb-4">
              Area's First Longevity Clinic Opens in Evans
            </h3>
            <p className="text-muted-foreground font-lato font-light leading-relaxed mb-8">
              Réveil was featured on WJBF's "Jennie" show 
              to discuss how the clinic is providing cutting-edge longevity medicine 
              for patients with patients seeking optimal health.
            </p>

            <button
              onClick={() => window.open('https://www.wjbf.com/featured/jennie/jennie-areas-first-ketamine-clinic-opens-in-evans/', '_blank')}
              className="inline-flex items-center gap-2 text-primary font-lato text-sm tracking-wide hover:gap-3 transition-all duration-300 w-fit"
            >
              <span className="elegant-underline">Watch Full Interview</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Trust Line */}
        <p className="text-center text-sm text-muted-foreground font-lato font-light mt-12">
          Trusted by the Augusta community since 2024
        </p>
      </div>
    </section>
  );
};

export default MediaFeature;
