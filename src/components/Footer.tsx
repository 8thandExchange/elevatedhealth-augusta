import { MapPin, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { trackCTAClick } from "@/lib/analytics";

const Footer = () => {
  const navigate = useNavigate();
  
  const scrollToSection = (id: string) => {
    if (window.location.pathname === "/" || window.location.pathname === "/index") {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

  return (
    <footer className="bg-foreground text-background py-16 lg:py-24">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Top Section */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="lg:col-span-2">
              <h3 className="font-playfair text-3xl font-light mb-4 text-background">
                {SITE_CONFIG.clinicName}
              </h3>
              <p className="text-sm tracking-[0.2em] uppercase text-background/50 mb-6 font-lato">
                Restore · Renew · Rebalance
              </p>
              <p className="font-lato font-light text-background/70 leading-relaxed max-w-md">
                Expert-led ketamine therapy, medical weight loss, and hormone optimization. 
                Serving Veterans, first responders, and the Augusta community.
              </p>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-playfair text-xl mb-6 text-background">Services</h4>
              <ul className="space-y-3 font-lato font-light text-sm text-background/60">
                <li>
                  <button 
                    onClick={() => navigate(SITE_CONFIG.routes.ketamine)} 
                    className="hover:text-background transition-colors"
                  >
                    Ketamine Therapy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate(SITE_CONFIG.routes.weightloss)} 
                    className="hover:text-background transition-colors"
                  >
                    Medical Weight Loss
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate(SITE_CONFIG.routes.hormones)} 
                    className="hover:text-background transition-colors"
                  >
                    Hormone Optimization
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate(SITE_CONFIG.routes.militaryVeteran)} 
                    className="hover:text-background transition-colors"
                  >
                    Veterans Program
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-playfair text-xl mb-6 text-background">Contact</h4>
              <div className="space-y-4 font-lato font-light text-sm text-background/60">
                <div className="flex gap-3">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-1" />
                  <div>
                    <p>{SITE_CONFIG.address.line1}</p>
                    <p>{SITE_CONFIG.address.cityStateZip}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <a 
                    href={`tel:${SITE_CONFIG.phoneRaw}`} 
                    className="hover:text-background transition-colors"
                    onClick={() => trackCTAClick('footer_call', `tel:${SITE_CONFIG.phoneRaw}`)}
                  >
                    {SITE_CONFIG.phone}
                  </a>
                </div>
              </div>
              
              <div className="mt-8 flex gap-4">
                <a 
                  href="https://instagram.com/elevatedhealthaugusta" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-background/50 hover:text-background transition-colors font-lato"
                  aria-label="Instagram"
                >
                  Instagram
                </a>
                <a 
                  href="https://facebook.com/elevatedhealthaugusta" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-background/50 hover:text-background transition-colors font-lato"
                  aria-label="Facebook"
                >
                  Facebook
                </a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-background/10 mb-12" />

          {/* Disclaimer */}
          <div className="mb-12">
            <p className="text-background/40 text-xs font-lato font-light leading-relaxed max-w-4xl">
              <strong className="text-background/50">Disclaimer:</strong> Coverage and eligibility vary by plan, diagnosis, prior treatments, and medical-necessity review. IV ketamine for depression/anxiety is an off-label use. SPRAVATO® is FDA-approved for specific indications and administered only in-clinic under REMS with monitoring.
            </p>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-background/30 font-lato">
              © 2025 {SITE_CONFIG.clinicName}. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs text-background/30 font-lato">
              <button 
                onClick={() => navigate("/privacy-policy")} 
                className="hover:text-background/60 transition-colors"
              >
                Privacy
              </button>
              <button 
                onClick={() => navigate("/hipaa-notice")} 
                className="hover:text-background/60 transition-colors"
              >
                HIPAA
              </button>
              <button 
                onClick={() => navigate("/terms-of-service")} 
                className="hover:text-background/60 transition-colors"
              >
                Terms
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
