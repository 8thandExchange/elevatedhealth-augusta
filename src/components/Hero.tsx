import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-breakthrough.jpg";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { trackCTAClick } from "@/lib/analytics";
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
      {/* Hero Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Mental health breakthrough - person walking up sunlit path emerging from fog" 
          className="w-full h-full object-cover"
          loading="eager"
          width="1920"
          height="1080"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-primary/30 to-primary/60" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 relative z-10 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Clinic Name & Tagline */}
          <div className="mb-8 md:mb-10 animate-fade-in-up">
            <h1 className="font-playfair text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 text-white leading-tight drop-shadow-lg">
              Break Free from Treatment-Resistant Depression
            </h1>
            <p className="font-inter text-xl sm:text-2xl md:text-3xl text-white font-normal leading-relaxed drop-shadow-md">
              Augusta's private-room ketamine clinic. Evidence-based care for PTSD, anxiety, OCD.
            </p>
          </div>

          {/* Tagline */}
          <p className="font-inter text-base sm:text-lg text-gold uppercase tracking-wider mb-10 animate-fade-in-up drop-shadow-md" style={{
            animationDelay: "0.2s"
          }}>
            Restore • Repair • Renew
          </p>

          {/* Primary CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6 animate-fade-in-up" style={{
            animationDelay: "0.4s"
          }}>
            <Button 
              size="lg" 
              asChild
              className="font-inter font-semibold uppercase text-base px-10 py-7 bg-accent hover:bg-accent-light text-white shadow-2xl hover:scale-105 transition-all"
            >
              <a
                href="https://calendar.app.google/SgGgATWunSGzz34s6"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book Free Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            
            <Button 
              size="lg"
              asChild
              className="font-inter font-semibold uppercase text-base px-10 py-7 bg-white/10 hover:bg-white/20 text-white border-2 border-white backdrop-blur-sm shadow-xl hover:scale-105 transition-all"
            >
              <a href={`tel:${SITE_CONFIG.phone.replace(/\D/g, '')}`}>
                <Phone className="mr-2 h-5 w-5" />
                Call Now
              </a>
            </Button>
          </div>

          {/* AI Voice Agent CTA */}
          <div className="flex flex-col items-center gap-3 mb-10 animate-fade-in-up" style={{
            animationDelay: "0.5s"
          }}>
            <Button
              size="lg"
              asChild
              className="font-inter font-semibold text-base px-8 py-6 bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white shadow-xl hover:translate-y-[-4px] transition-all w-full sm:w-auto"
              onClick={() => trackCTAClick('ai_voice_call', 'tel:+17067603470')}
            >
              <a href="tel:+17067603470">
                <Phone className="mr-2 h-5 w-5" />
                Or Call Us Now (706) 760-3470
              </a>
            </Button>
            <p className="text-white/80 text-xs font-inter">
              Secure, HIPAA-compliant calls powered by AI
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-8 items-center text-white/90 font-inter text-sm sm:text-base animate-fade-in-up mb-4" style={{
            animationDelay: "0.6s"
          }}>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-medium">Private Treatment Rooms</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Board-Certified Care</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Insurance Accepted</span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-white/80 text-sm sm:text-base animate-fade-in-up" style={{
            animationDelay: "0.7s"
          }}>
            <p>
              {SITE_CONFIG.address.full} • {SITE_CONFIG.phone}
            </p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/40 rounded-full animate-pulse" />
        </div>
      </div>
    </section>;
};
export default Hero;