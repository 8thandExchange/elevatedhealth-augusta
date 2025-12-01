import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-dark-slate.jpg";
import { trackCTAClick } from "@/lib/analytics";
interface HeroProps {
  onOpenBooking: () => void;
}

const Hero = ({ onOpenBooking }: HeroProps) => {
  const handleRequestAccess = () => {
    trackCTAClick('hero_request_access', 'contact_section');
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center">
      {/* Full-screen Background Image */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Dark slate blue luxury texture"
          className="w-full h-full object-cover"
          loading="eager"
        />
        {/* Refined dark overlay - lighter for sophistication */}
        <div className="absolute inset-0 bg-black/25" />
      </div>

      {/* Centered Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Gold Tagline */}
        <p className="text-sm tracking-[0.4em] uppercase text-gold mb-8 font-lato font-medium animate-fade-in">
          Augusta's Premier Wellness Destination
        </p>

        {/* Main Headline - White */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-cormorant text-white leading-[1.1] mb-8 animate-fade-in-up">
          Medical Precision.<br />
          Holistic Restoration.
        </h1>

        {/* Sub-headline - White */}
        <p className="text-lg sm:text-xl text-white/90 font-lato font-light leading-relaxed mb-12 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          Academy-Certified Hormone Optimization, Ketamine Therapy, and Medical Weight Loss.
        </p>

        {/* Gold Button */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <Button 
            variant="outline"
            size="lg"
            onClick={handleRequestAccess}
            className="bg-gold border-gold text-white hover:bg-gold-dark hover:border-gold-dark font-lato font-normal tracking-[0.15em] uppercase text-sm px-12 py-6 rounded-none transition-all duration-300"
          >
            Request Access
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
