import { Button } from "@/components/ui/button";
import { Calendar, Phone } from "lucide-react";
import heroImage from "@/assets/hero-therapy.jpg";

const Hero = () => {
  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
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
      <div className="container mx-auto px-4 relative z-10 pt-32 pb-20">
        <div className="max-w-5xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 text-secondary leading-tight animate-fade-in-up">
            Rediscover Balance, Clarity, and Hope with KETRA™.
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl md:text-3xl mb-12 text-secondary/90 max-w-3xl animate-fade-in-up leading-relaxed" style={{ animationDelay: "0.2s" }}>
            Experience physician-led ketamine therapy for rapid relief from depression, anxiety, and PTSD in Augusta, GA.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Button 
              variant="cta" 
              size="xl" 
              onClick={scrollToContact} 
              className="gap-2 text-lg px-8 py-6"
            >
              <Calendar className="h-5 w-5" />
              Book Consultation
            </Button>
            <a href="tel:7065509202" className="w-full sm:w-auto">
              <Button 
                variant="hero" 
                size="xl" 
                className="gap-2 text-lg px-8 py-6 w-full"
              >
                <Phone className="h-5 w-5" />
                Call Now: (706) 550-9202
              </Button>
            </a>
          </div>

          {/* Trust Indicator */}
          <div className="text-secondary/80 text-sm sm:text-base animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <p className="font-semibold mb-2">Proudly serving Augusta, GA and surrounding areas</p>
            <p>Specialized care for veterans and first responders</p>
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
