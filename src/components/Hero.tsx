import { Button } from "@/components/ui/button";
import { trackCTAClick } from "@/lib/analytics";
import { useBooking } from "@/contexts/BookingContext";
import { ArrowRight, Phone } from "lucide-react";
import heroImage from "@/assets/hero-wellness-abstract.jpg";

const Hero = () => {
  const { openBooking } = useBooking();
  
  return (
    <section id="hero" className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="" 
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
      </div>

      {/* Centered Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-32 pb-20">
        {/* Gold Tagline */}
        <p className="text-xs sm:text-sm tracking-[0.4em] uppercase text-gold-light mb-6 font-lato font-medium animate-fade-in">
          Augusta's Premier Wellness Destination
        </p>

        {/* Main Headline - White on dark */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-cormorant text-white leading-[1.08] mb-6 animate-fade-in-up">
          Medical Precision.
          <br />
          Holistic Restoration.
        </h1>

        {/* Sub-headline */}
        <p className="text-base sm:text-lg md:text-xl text-white/80 font-lato font-light leading-relaxed mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          Hormone Optimization, Ketamine Therapy, and Medical Weight Loss.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <Button 
            size="lg"
            onClick={openBooking}
            className="bg-gold hover:bg-gold-dark text-primary font-lato font-semibold tracking-[0.1em] uppercase text-sm px-10 py-6 rounded-full transition-all duration-300 shadow-glow w-full sm:w-auto"
          >
            Book Consultation
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <a
            href="tel:7067603470"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white font-lato text-sm tracking-wide transition-colors duration-300"
          >
            <Phone className="h-4 w-4" />
            (706) 760-3470
          </a>
        </div>

        {/* Trust Indicators */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-white/50 text-xs font-lato tracking-wider uppercase animate-fade-in" style={{ animationDelay: "0.8s" }}>
          <span>BCBS Accepted</span>
          <span className="hidden sm:inline">·</span>
          <span>TRICARE Accepted</span>
          <span className="hidden sm:inline">·</span>
          <span>Veteran Friendly</span>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
};

export default Hero;
