import { MapPin, Phone, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { trackCTAClick } from "@/lib/analytics";
import PaymentMethodsBadge from "./PaymentMethodsBadge";
import { forceHardRefresh } from "@/lib/authUtils";
import { toast } from "sonner";

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

  const handleClearCache = async () => {
    toast.info("Clearing cache...", { duration: 2000 });
    await forceHardRefresh();
  };

  return (
    <footer className="bg-[hsl(210_15%_96%)] text-foreground py-16 lg:py-24 border-t border-border">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Top Section */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="lg:col-span-2">
              <h3 className="font-playfair text-3xl font-light mb-4 text-foreground">
                {SITE_CONFIG.clinicName}
              </h3>
              <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-6 font-lato">
                Restore · Renew · Rebalance
              </p>
              <p className="font-lato font-light text-muted-foreground leading-relaxed max-w-md">
                Expert-led ketamine therapy, medical weight loss, and hormone optimization. 
                Serving Veterans, first responders, and the Augusta community.
              </p>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-playfair text-xl mb-6 text-foreground">Services</h4>
              <ul className="space-y-3 font-lato font-light text-sm text-muted-foreground">
                <li>
                  <button 
                    onClick={() => navigate(SITE_CONFIG.routes.ketamine)} 
                    className="hover:text-foreground transition-colors"
                  >
                    Ketamine Therapy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate(SITE_CONFIG.routes.weightloss)} 
                    className="hover:text-foreground transition-colors"
                  >
                    Medical Weight Loss
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate(SITE_CONFIG.routes.hormones)} 
                    className="hover:text-foreground transition-colors"
                  >
                    Hormone Optimization
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate("/pricing")} 
                    className="hover:text-foreground transition-colors"
                  >
                    Pricing
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate(SITE_CONFIG.routes.militaryVeteran)} 
                    className="hover:text-foreground transition-colors"
                  >
                    Veterans Program
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-playfair text-xl mb-6 text-foreground">Contact</h4>
              <div className="space-y-4 font-lato font-light text-sm text-muted-foreground">
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
                    className="hover:text-foreground transition-colors"
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
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors font-lato"
                  aria-label="Instagram"
                >
                  Instagram
                </a>
                <a 
                  href="https://facebook.com/elevatedhealthaugusta" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors font-lato"
                  aria-label="Facebook"
                >
                  Facebook
                </a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-border mb-12" />

          {/* Payment Methods */}
          <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground font-lato">Flexible Payment Options:</span>
              <PaymentMethodsBadge variant="light" showText={false} />
            </div>
            <p className="text-xs text-muted-foreground font-lato">
              HSA/FSA Accepted • Insurance for SPRAVATO®
            </p>
          </div>

          {/* Disclaimer */}
          <div className="mb-12">
            <p className="text-background/60 text-xs font-lato font-light leading-relaxed max-w-4xl">
              <strong className="text-background/70">Disclaimer:</strong> Coverage and eligibility vary by plan, diagnosis, prior treatments, and medical-necessity review. IV ketamine for depression/anxiety is an off-label use. SPRAVATO® is FDA-approved for specific indications and administered only in-clinic under REMS with monitoring.
            </p>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground font-lato">
              © 2025 {SITE_CONFIG.clinicName}. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground font-lato">
              <button 
                onClick={() => navigate("/patient/login?redirect=consult")} 
                className="hover:text-foreground transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Returning Patient?
              </button>
              <button 
                onClick={() => navigate("/admin/login")} 
                className="hover:text-foreground transition-colors"
              >
                Provider Login
              </button>
              <button 
                onClick={() => navigate("/privacy-policy")} 
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </button>
              <button 
                onClick={() => navigate("/hipaa-notice")} 
                className="hover:text-foreground transition-colors"
              >
                HIPAA
              </button>
              <button 
                onClick={() => navigate("/terms-of-service")} 
                className="hover:text-foreground transition-colors"
              >
                Terms
              </button>
              <button 
                onClick={() => navigate("/accessibility")} 
                className="hover:text-foreground transition-colors"
              >
                Accessibility
              </button>
              <button 
                onClick={handleClearCache}
                className="hover:text-foreground transition-colors flex items-center gap-1"
                title="Clear cache and refresh"
              >
                <RefreshCw className="h-3 w-3" />
                Clear Cache
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
