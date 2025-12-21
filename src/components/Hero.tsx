import { Button } from "@/components/ui/button";
import { trackCTAClick } from "@/lib/analytics";
import { useBooking } from "@/contexts/BookingContext";

const Hero = () => {
  const { openBooking } = useBooking();
  
  const handleRequestAccess = () => {
    trackCTAClick('hero_request_access', 'contact_section');
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section id="hero" className="relative min-h-[70vh] flex items-center justify-center pt-32 pb-16 bg-[#F9F9F7]">
      {/* Centered Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Teal Tagline */}
        <p className="text-sm tracking-[0.4em] uppercase text-[#1a8a9a] mb-4 font-lato font-medium animate-fade-in">
          Augusta's Premier Wellness Destination
        </p>

        {/* Main Headline - Dark Navy */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-cormorant text-[#2C3E50] leading-[1.1] mb-4 animate-fade-in-up">
          Medical Precision.<br />
          Holistic Restoration.
        </h1>

        {/* Sub-headline - Dark Grey */}
        <p className="text-lg sm:text-xl text-[#4a5568] font-lato font-light leading-relaxed mb-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          Hormone Optimization, Ketamine Therapy, and Medical Weight Loss.
        </p>

        {/* Teal Pill Button */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <Button 
            size="lg"
            onClick={openBooking}
            className="bg-[#1a8a9a] hover:bg-[#158080] text-white font-lato font-normal tracking-[0.15em] uppercase text-sm px-12 py-6 rounded-full transition-all duration-300"
          >
            Book Consultation
          </Button>
        </div>

      </div>
    </section>
  );
};

export default Hero;
