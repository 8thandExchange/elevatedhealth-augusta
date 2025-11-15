import { MapPin, Phone, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { trackCTAClick } from "@/lib/analytics";

const Footer = () => {
  const navigate = useNavigate();
  
  const scrollToSection = (id: string) => {
    // Check if we're on the homepage
    if (window.location.pathname === "/" || window.location.pathname === "/index") {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // Navigate to homepage first, then scroll
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  return (
    <footer className="bg-primary text-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <h3 className="font-playfair text-2xl font-bold mb-2">
                {SITE_CONFIG.clinicName}
              </h3>
              <p className="text-gold uppercase tracking-wider text-sm font-semibold mb-4">
                RESTORE • REPAIR • RENEW
              </p>
              <p className="font-inter text-white/80 mb-4">
                Expert-led ketamine therapy for treatment-resistant depression, anxiety, and PTSD. 
                Proudly serving Veterans, first responders, and the Augusta community.
              </p>
              <div className="space-y-3 font-inter text-white/80">
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 flex-shrink-0 mt-1" />
                  <div>
                    <p>{SITE_CONFIG.address.line1}</p>
                    <p>{SITE_CONFIG.address.cityStateZip}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Phone className="h-5 w-5 flex-shrink-0" />
                  <a href={`tel:${SITE_CONFIG.phoneRaw}`} className="hover:text-gold transition-colors">
                    {SITE_CONFIG.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-inter font-semibold mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-2 font-inter text-white/80">
                <li>
                  <button onClick={() => scrollToSection("about")} className="hover:text-gold transition-colors">
                    About Us
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate(SITE_CONFIG.routes.ivKetamine)} 
                    className="hover:text-gold transition-colors"
                  >
                    IV Ketamine
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate(SITE_CONFIG.routes.spravato)} 
                    className="hover:text-gold transition-colors"
                  >
                    SPRAVATO®
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate(SITE_CONFIG.routes.militaryVeteran)} 
                    className="hover:text-gold transition-colors"
                  >
                    Benefits & Advocacy
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("insurance")} className="hover:text-gold transition-colors">
                    Insurance
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("contact")} className="hover:text-gold transition-colors">
                    Contact
                  </button>
                </li>
              </ul>
            </div>

            {/* Social & Legal */}
            <div>
              <h4 className="font-inter font-semibold mb-4 text-lg">Connect With Us</h4>
              <div className="flex gap-4 mb-6">
                <a 
                  href="https://instagram.com/elevatedhealthaugusta" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-gold flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <span className="text-lg font-bold">IG</span>
                </a>
                <a 
                  href="https://facebook.com/elevatedhealthaugusta" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-gold flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <span className="text-lg font-bold">FB</span>
                </a>
                <a 
                  href="https://x.com/Dr_Troy_Akers" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-gold flex items-center justify-center transition-colors"
                  aria-label="X (Twitter)"
                >
                  <span className="text-lg font-bold">X</span>
                </a>
              </div>
              
              {/* AI Voice Agent Link */}
              <div className="mb-6">
                <p className="text-white/60 text-sm font-inter mb-2">24/7 AI Support:</p>
                <a 
                  href="tel:+17067603470" 
                  className="text-gold hover:text-gold/80 transition-colors font-inter font-semibold"
                  onClick={() => trackCTAClick('ai_voice_call_footer', 'tel:+17067603470')}
                >
                  (706) 760-3470
                </a>
              </div>
              
              <div className="space-y-2 font-inter text-sm">
                <a href="/privacy-policy" className="hover:text-gold transition-colors block">
                  Privacy Policy
                </a>
                <a href="/hipaa-notice" className="hover:text-gold transition-colors block">
                  HIPAA Notice
                </a>
                <a href="/terms-of-service" className="hover:text-gold transition-colors block">
                  Terms of Use
                </a>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="border-t border-background/20 pt-8 pb-6">
            <div className="bg-background/10 rounded-lg p-4 md:p-6">
              <p className="text-background/70 text-sm leading-relaxed">
                <strong className="text-background/90">Important Disclaimer:</strong> Coverage and eligibility vary by plan, diagnosis, prior treatments, and medical-necessity review. Elevated Health Augusta will help you verify benefits and request referrals. IV ketamine for depression/anxiety is an off-label use. SPRAVATO® is FDA-approved for specific indications and administered only in-clinic under REMS with monitoring.
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-background/20 pt-8">
            <p className="text-center text-xs text-background/60">
              © 2025 {SITE_CONFIG.clinicName} | {" "}
              <button 
                onClick={() => navigate("/privacy-policy")} 
                className="text-secondary hover:underline"
              >
                Privacy Policy
              </button> | {" "}
              <button 
                onClick={() => navigate("/hipaa-notice")} 
                className="text-secondary hover:underline"
              >
                HIPAA Notice
              </button> | {" "}
              <button 
                onClick={() => navigate("/terms-of-service")} 
                className="text-secondary hover:underline"
              >
                Terms of Use
              </button>
            </p>
            <p className="text-center mt-4 text-background/40 text-xs">
              Individual results may vary. Consult with a physician to determine if treatment is appropriate for you.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
