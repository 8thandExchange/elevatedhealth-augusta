import { Button } from "@/components/ui/button";
import { useBooking } from "@/contexts/BookingContext";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  const { openBooking } = useBooking();
  
  return (
    <section id="hero" className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-32 pb-20">
        {/* Main Headline */}
        <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground leading-[1.08] mb-8 animate-fade-in-up">
          You remember what it felt like
          <br />
          <span className="italic">to wake up ready.</span>
        </h1>

        {/* Sub-headline */}
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-jost font-light leading-relaxed mb-12 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          Réveil is Evans' first physician-owned longevity clinic — combining hormone optimization, 
          IV therapy, and peptide medicine under the direct supervision of a board-certified physician. 
          This isn't a spa. This isn't an app. This is medicine done right.
        </p>

        {/* CTA Button */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <Button 
            size="lg"
            onClick={openBooking}
            className="bg-primary text-accent font-jost font-medium tracking-wide text-sm px-10 py-6 rounded-sm transition-all duration-300 hover:bg-primary-light"
          >
            Begin your awakening
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Credibility Bar */}
        <div className="mt-20 flex flex-wrap items-center justify-center gap-6 text-muted-foreground text-xs font-jost font-medium tracking-[2.5px] uppercase animate-fade-in" style={{ animationDelay: "0.8s" }}>
          <span>Board-Certified Physician Direction</span>
          <span className="hidden sm:inline text-accent/40">·</span>
          <span>Evans Town Center</span>
          <span className="hidden sm:inline text-accent/40">·</span>
          <span>BCBS · TRICARE · VA Accepted</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;