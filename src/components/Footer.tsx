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
      if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  const handleClearCache = async () => {
    toast.info("Clearing cache...", { duration: 2000 });
    await forceHardRefresh();
  };

  return (
    <footer className="bg-background text-foreground py-16 lg:py-24 border-t border-border/30">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Top Section */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="lg:col-span-2">
              <h3 className="font-inter text-2xl font-bold mb-4 text-foreground">
                {SITE_CONFIG.clinicName}
              </h3>
              <p className="text-sm tracking-[0.2em] uppercase text-primary mb-6 font-inter font-semibold">
                Restore · Renew · Rebalance
              </p>
              <p className="font-inter text-muted-foreground leading-relaxed max-w-md">
                Expert-led ketamine therapy, medical weight loss, and hormone optimization. 
                Serving Veterans, first responders, and the Augusta community.
              </p>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-inter font-bold text-lg mb-6 text-foreground">Services</h4>
              <ul className="space-y-3 font-inter text-sm text-muted-foreground">
                {[
                  { label: "Ketamine Therapy", action: () => navigate(SITE_CONFIG.routes.ketamine) },
                  { label: "Medical Weight Loss", action: () => navigate(SITE_CONFIG.routes.weightloss) },
                  { label: "Hormone Optimization", action: () => navigate(SITE_CONFIG.routes.hormones) },
                  { label: "Pricing", action: () => navigate("/pricing") },
                  { label: "Veterans Program", action: () => navigate(SITE_CONFIG.routes.militaryVeteran) },
                ].map(item => (
                  <li key={item.label}>
                    <button onClick={item.action} className="hover:text-primary transition-colors">
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-inter font-bold text-lg mb-6 text-foreground">Contact</h4>
              <div className="space-y-4 font-inter text-sm text-muted-foreground">
                <div className="flex gap-3">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-1 text-primary" />
                  <div>
                    <p>{SITE_CONFIG.address.line1}</p>
                    <p>{SITE_CONFIG.address.cityStateZip}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Phone className="h-4 w-4 flex-shrink-0 text-primary" />
                  <a 
                    href={`tel:${SITE_CONFIG.phoneRaw}`} 
                    className="hover:text-primary transition-colors"
                    onClick={() => trackCTAClick('footer_call', `tel:${SITE_CONFIG.phoneRaw}`)}
                  >
                    {SITE_CONFIG.phone}
                  </a>
                </div>
              </div>
              
              <div className="mt-8 flex gap-4">
                <a href="https://instagram.com/elevatedhealthaugusta" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors font-inter" aria-label="Instagram">Instagram</a>
                <a href="https://facebook.com/elevatedhealthaugusta" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors font-inter" aria-label="Facebook">Facebook</a>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-border/30 mb-12" />

          {/* Payment Methods */}
          <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground font-inter">Flexible Payment Options:</span>
              <PaymentMethodsBadge variant="light" showText={false} />
            </div>
            <p className="text-xs text-muted-foreground font-inter">
              HSA/FSA Accepted • Insurance for SPRAVATO®
            </p>
          </div>

          {/* Disclaimer */}
          <div className="mb-12">
            <p className="text-muted-foreground/60 text-xs font-inter leading-relaxed max-w-4xl">
              <strong className="text-muted-foreground/70">Disclaimer:</strong> Coverage and eligibility vary by plan, diagnosis, prior treatments, and medical-necessity review. IV ketamine for depression/anxiety is an off-label use. SPRAVATO® is FDA-approved for specific indications and administered only in-clinic under REMS with monitoring.
            </p>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground font-inter">
              © 2025 {SITE_CONFIG.clinicName}. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground font-inter">
              <button onClick={() => navigate("/patient/login?redirect=consult")} className="hover:text-primary transition-colors flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Returning Patient?
              </button>
              <button onClick={() => navigate("/admin/login")} className="hover:text-primary transition-colors">Provider Login</button>
              <button onClick={() => navigate("/privacy-policy")} className="hover:text-primary transition-colors">Privacy</button>
              <button onClick={() => navigate("/hipaa-notice")} className="hover:text-primary transition-colors">HIPAA</button>
              <button onClick={() => navigate("/terms-of-service")} className="hover:text-primary transition-colors">Terms</button>
              <button onClick={() => navigate("/accessibility")} className="hover:text-primary transition-colors">Accessibility</button>
              <button onClick={handleClearCache} className="hover:text-primary transition-colors flex items-center gap-1" title="Clear cache and refresh">
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
