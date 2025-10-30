import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-therapy.jpg";
import { SITE_CONFIG } from "@/lib/siteConfig";

const Hero = () => {
  const navigate = useNavigate();

  const scrollToCompare = () => {
    const element = document.getElementById("compare");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleMilitaryClick = () => {
    navigate(SITE_CONFIG.routes.militaryVeteran);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background with Fallback Image */}
      <div className="absolute inset-0 z-0">
        {/* Fallback image - replace with video element when video is ready */}
        <img
          src={heroImage}
          alt="Calming therapy environment at Elevated Health Augusta"
          className="w-full h-full object-cover"
        />
        {/* Video element - uncomment when video is available
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/path-to-your-video.mp4" type="video/mp4" />
        </video>
        */}
        <div className="absolute inset-0 bg-foreground/40" />
      </div>

      {/* Content - MindBloom inspired layout */}
      <div className="container mx-auto px-4 sm:px-6 relative z-10 pt-32 pb-20">
        <div className="max-w-6xl mx-auto text-left">
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 text-secondary leading-tight animate-fade-in-up max-w-4xl">
            Expert-led ketamine care in Evans, GA
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl md:text-2xl mb-10 md:mb-12 text-secondary/90 max-w-3xl animate-fade-in-up leading-relaxed" style={{ animationDelay: "0.2s" }}>
            We offer IV Ketamine infusions and SPRAVATO® (esketamine) nasal spray for adults who haven't found relief with standard treatments.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Button 
              variant="cta" 
              size="xl" 
              onClick={scrollToCompare} 
              className="gap-2 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6"
            >
              Compare IV Ketamine vs SPRAVATO®
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button 
              variant="hero" 
              size="xl" 
              onClick={handleMilitaryClick}
              className="gap-2 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6"
            >
              Military/Veteran Benefits
            </Button>
          </div>

          {/* Clinic Location */}
          <div className="text-secondary/80 text-sm sm:text-base animate-fade-in-up max-w-3xl" style={{ animationDelay: "0.6s" }}>
            <p className="leading-relaxed">
              {SITE_CONFIG.clinicName} — {SITE_CONFIG.address.full} • {SITE_CONFIG.phone}
            </p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-70">
        <div className="w-6 h-10 border-2 border-secondary/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-secondary/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
