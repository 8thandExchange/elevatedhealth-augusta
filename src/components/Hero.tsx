import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-breakthrough.jpg";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { trackCTAClick } from "@/lib/analytics";

interface HeroProps {
  onOpenBooking: () => void;
}

const Hero = ({ onOpenBooking }: HeroProps) => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center">
      {/* Split Layout */}
      <div className="w-full min-h-screen flex flex-col lg:flex-row">
        {/* Left Content Side */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-8 sm:px-12 lg:px-20 py-32 lg:py-20 bg-background">
          <div className="max-w-xl">
            {/* Elegant Tagline */}
            <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6 animate-fade-in font-inter font-light">
              Augusta's Premier Wellness Destination
            </p>
            
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-cormorant font-light text-foreground leading-[1.1] mb-8 animate-fade-in-up">
              Restore.<br />
              Renew.<br />
              <span className="text-primary">Rebalance.</span>
            </h1>

            {/* Elegant Divider */}
            <div className="w-16 h-px bg-primary/30 mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }} />

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-muted-foreground font-inter font-light leading-relaxed mb-10 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              Experience transformative wellness through our curated treatments — 
              Ketamine Therapy, Medical Weight Loss, and Hormone Optimization.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <Button 
                size="lg" 
                onClick={() => {
                  trackCTAClick('hero_book_consultation', 'modal');
                  onOpenBooking();
                }}
                className="font-inter font-normal tracking-wide text-sm px-8 py-6 bg-primary hover:bg-primary-dark text-primary-foreground transition-all duration-300"
              >
                Book Your Consultation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                asChild
                className="font-inter font-normal tracking-wide text-sm px-8 py-6 border-primary/20 text-foreground hover:bg-secondary transition-all duration-300"
                onClick={() => trackCTAClick('hero_call', 'tel:+17067603470')}
              >
                <a href="tel:+17067603470">
                  (706) 760-3470
                </a>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 pt-8 border-t border-border animate-fade-in" style={{ animationDelay: "0.6s" }}>
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4 font-inter">
                Trusted by
              </p>
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground font-inter">
                <span>Board-Certified Providers</span>
                <span className="text-border">|</span>
                <span>Insurance Accepted</span>
                <span className="text-border">|</span>
                <span>Private Suites</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Image Side */}
        <div className="w-full lg:w-1/2 relative min-h-[50vh] lg:min-h-screen">
          <img 
            src={heroImage} 
            alt="Serene wellness environment at Elevated Health Augusta" 
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
          />
          {/* Subtle overlay for elegance */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent lg:bg-gradient-to-r lg:from-background/10 lg:via-transparent lg:to-transparent" />
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-subtle-float hidden lg:block">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-inter">Scroll</span>
          <div className="w-px h-8 bg-primary/30" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
