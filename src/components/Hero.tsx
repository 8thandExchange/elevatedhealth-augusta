import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-therapy.jpg";
import { SITE_CONFIG } from "@/lib/siteConfig";
const Hero = () => {
  const navigate = useNavigate();
  
  const scrollToBooking = () => {
    const element = document.getElementById("booking");
    if (element) {
      element.scrollIntoView({
        behavior: "smooth"
      });
    }
  };
  
  const scrollToCompare = () => {
    const element = document.getElementById("compare");
    if (element) {
      element.scrollIntoView({
        behavior: "smooth"
      });
    }
  };
  
  const handleMilitaryClick = () => {
    navigate(SITE_CONFIG.routes.militaryVeteran);
  };
  return <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background with Fallback Image */}
      <div className="absolute inset-0 z-0">
        {/* Fallback image - replace with video element when video is ready */}
        <img src={heroImage} alt="Modern wellness clinic at Elevated Health Augusta" className="w-full h-full object-cover" />
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
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/50 to-foreground/40" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 relative z-10 pt-32 pb-20">
        <div className="max-w-6xl mx-auto text-left">
          {/* Clinic Name & Tagline */}
          <div className="mb-6 md:mb-8 animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 text-white leading-tight">
              Elevated Health Augusta
            </h1>
            <p className="text-2xl sm:text-3xl md:text-4xl text-accent font-semibold italic">
              Healing Elevated. Science-Driven, Patient-Focused.
            </p>
          </div>

          {/* Services Description */}
          <p style={{
          animationDelay: "0.2s"
        }} className="text-lg sm:text-xl md:text-2xl mb-8 md:mb-10 max-w-4xl animate-fade-in-up leading-relaxed text-white">
            Specializing in <span className="font-bold text-accent">IV Ketamine</span>, <span className="font-bold text-accent">SPRAVATO®</span>, <span className="font-bold text-accent">Hormone Replacement Therapy</span>, and <span className="font-bold text-accent">Weight Loss Programs</span> — modern, evidence-based solutions for lasting wellness.
          </p>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in-up" style={{
          animationDelay: "0.4s"
        }}>
            <Button 
              variant="cta" 
              size="xl" 
              asChild
              className="gap-2 text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 shadow-2xl hover:scale-105 transition-transform"
            >
              <a
                href="https://calendar.app.google/dmUqXpAwVspD7Nyi9"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book Your Free 30-Minute Consultation
                <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
          </div>

          {/* Secondary CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in-up" style={{
          animationDelay: "0.5s"
        }}>
            <Button variant="hero" size="lg" onClick={scrollToCompare} className="gap-2">
              Compare Treatments
            </Button>
            <Button variant="hero" size="lg" onClick={handleMilitaryClick} className="gap-2">
              Military/Veteran Benefits
            </Button>
          </div>

          {/* Clinic Location */}
          <div className="text-white/90 text-sm sm:text-base animate-fade-in-up max-w-3xl" style={{
          animationDelay: "0.6s"
        }}>
            <p className="leading-relaxed">
              {SITE_CONFIG.address.full} • {SITE_CONFIG.phone}
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
    </section>;
};
export default Hero;