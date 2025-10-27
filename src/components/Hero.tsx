import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Phone } from "lucide-react";
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
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Calming therapy session at Elevated Health Augusta"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-overlay" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white animate-fade-in-up">
            Transform Your Mental Health at{" "}
            <span className="text-secondary">Elevated Health</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Physician-led ketamine treatment for depression, anxiety, and PTSD in Augusta, GA
          </p>
          <p className="text-lg md:text-xl mb-12 text-white/80 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            Serving our community and honoring our veterans with compassionate, science-driven care
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Button variant="hero" size="xl" onClick={scrollToContact} className="gap-2">
              <Calendar className="h-5 w-5" />
              Book Consultation
              <ArrowRight className="h-5 w-5" />
            </Button>
            <a href="tel:7065509202">
              <Button variant="cta" size="xl" className="gap-2">
                <Phone className="h-5 w-5" />
                Call Now
              </Button>
            </a>
          </div>

          {/* Quick Info */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 animate-scale-in" style={{ animationDelay: "0.5s" }}>
              <div className="text-3xl font-bold text-secondary mb-2">Physician-Led</div>
              <p className="text-white/90">Expert medical supervision</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 animate-scale-in" style={{ animationDelay: "0.6s" }}>
              <div className="text-3xl font-bold text-secondary mb-2">KETRA™</div>
              <p className="text-white/90">Proprietary ketamine therapy</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 animate-scale-in" style={{ animationDelay: "0.7s" }}>
              <div className="text-3xl font-bold text-secondary mb-2">Veterans</div>
              <p className="text-white/90">Specialized care for heroes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
