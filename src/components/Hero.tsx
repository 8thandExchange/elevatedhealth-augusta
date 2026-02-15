import { Button } from "@/components/ui/button";
import { useBooking } from "@/contexts/BookingContext";
import { ArrowRight, Phone } from "lucide-react";
import heroImage from "@/assets/hero-holly-heath.jpg";

const Hero = () => {
  const { openBooking } = useBooking();
  
  return (
    <section id="hero" className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="" 
          className="w-full h-full object-cover opacity-40"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/80" />
      </div>

      {/* Decorative Peach Blobs */}
      <div className="absolute top-20 -right-20 w-80 h-80 rounded-full bg-peach opacity-40 blur-3xl" />
      <div className="absolute -bottom-10 -left-20 w-96 h-96 rounded-full bg-peach opacity-30 blur-3xl" />
      <div className="absolute top-1/3 left-1/4 w-40 h-40 rounded-full bg-peach-light opacity-25 blur-2xl" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-32 pb-20">
        {/* Tagline */}
        <p className="text-xs sm:text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6 font-inter font-medium animate-fade-in">
          Augusta's Premier Wellness Destination
        </p>

        {/* Main Headline — Bold dark charcoal with orange accent */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-inter font-bold text-foreground leading-[1.08] mb-2 animate-fade-in-up">
          Create a healthier life
        </h1>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-inter font-bold text-primary leading-[1.08] mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          you're excited for
        </h1>

        {/* Sub-headline */}
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-inter font-normal leading-relaxed mb-12 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          Hormone Optimization · Ketamine Therapy · Medical Weight Loss
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <Button 
            size="lg"
            onClick={openBooking}
            className="bg-primary hover:bg-primary-dark text-primary-foreground font-inter font-semibold tracking-wide text-sm px-10 py-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto"
          >
            Book Consultation
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <a
            href="tel:7067603470"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-inter text-sm tracking-wide transition-colors duration-300"
          >
            <Phone className="h-4 w-4" />
            (706) 760-3470
          </a>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-muted-foreground/60 text-xs font-inter tracking-wider uppercase animate-fade-in" style={{ animationDelay: "0.8s" }}>
          <span>BCBS Accepted</span>
          <span className="hidden sm:inline text-primary/40">·</span>
          <span>TRICARE Accepted</span>
          <span className="hidden sm:inline text-primary/40">·</span>
          <span>Veteran Friendly</span>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
