import { MapPin, Phone, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { trackCTAClick } from "@/lib/analytics";
import { forceHardRefresh } from "@/lib/authUtils";
import { toast } from "sonner";

const Footer = () => {
  const navigate = useNavigate();

  const handleClearCache = async () => {
    toast.info("Clearing cache...", { duration: 2000 });
    await forceHardRefresh();
  };

  return (
    <footer className="bg-primary text-primary-foreground py-16 lg:py-24">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Centered Wordmark & Tagline */}
          <div className="text-center mb-16">
            <h3 className="font-playfair text-3xl text-primary-foreground mb-3">
              Réveil
            </h3>
            <p className="font-jost text-xs font-medium uppercase tracking-[2.5px] text-accent">
              Restore · Repair · Réveil
            </p>
          </div>

          {/* Info Grid */}
          <div className="grid md:grid-cols-3 gap-12 mb-16 text-center md:text-left">
            {/* Services */}
            <div>
              <h4 className="font-jost font-medium text-sm uppercase tracking-[2.5px] text-accent mb-6">Services</h4>
              <ul className="space-y-3 font-jost text-sm text-primary-foreground/80 font-light">
                {[
                  { label: "Women's Hormones", path: "/hormones-women" },
                  { label: "Men's Health", path: "/hormones-men" },
                  { label: "IV Therapy", path: "/iv-lounge" },
                  { label: "Peptide Protocols", path: "/peptides" },
                  { label: "Medical Weight Loss", path: "/weightloss" },
                  { label: "Membership", path: "/membership" },
                ].map(item => (
                  <li key={item.label}>
                    <button onClick={() => navigate(item.path)} className="hover:text-accent transition-colors">
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-jost font-medium text-sm uppercase tracking-[2.5px] text-accent mb-6">Contact</h4>
              <div className="space-y-4 font-jost text-sm text-primary-foreground/80 font-light">
                <div className="flex gap-3 justify-center md:justify-start">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-1 text-accent" />
                  <div>
                    <p>{SITE_CONFIG.address.line1}</p>
                    <p>{SITE_CONFIG.address.cityStateZip}</p>
                  </div>
                </div>
                <div className="flex gap-3 justify-center md:justify-start">
                  <Phone className="h-4 w-4 flex-shrink-0 text-accent" />
                  <a 
                    href={`tel:${SITE_CONFIG.phoneRaw}`} 
                    className="hover:text-accent transition-colors"
                    onClick={() => trackCTAClick('footer_call', `tel:${SITE_CONFIG.phoneRaw}`)}
                  >
                    {SITE_CONFIG.phone}
                  </a>
                </div>
                <p className="text-primary-foreground/60">@reveil · reveil.health</p>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-jost font-medium text-sm uppercase tracking-[2.5px] text-accent mb-6">Quick Links</h4>
              <ul className="space-y-3 font-jost text-sm text-primary-foreground/80 font-light">
                {[
                  { label: "About", path: "/about" },
                  { label: "Insurance & Reimbursement", path: "/insurance-reimbursement" },
                  { label: "Privacy Policy", path: "/privacy-policy" },
                  { label: "HIPAA Notice", path: "/hipaa-notice" },
                  { label: "Terms of Service", path: "/terms-of-service" },
                  { label: "Accessibility", path: "/accessibility" },
                ].map(item => (
                  <li key={item.label}>
                    <button onClick={() => navigate(item.path)} className="hover:text-accent transition-colors">
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="section-divider mb-8" />

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-primary-foreground/50 font-jost">
              © 2025 {SITE_CONFIG.clinicName}. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-primary-foreground/50 font-jost">
              <button onClick={() => navigate("/patient/login?redirect=consult")} className="hover:text-accent transition-colors">
                Returning Patient?
              </button>
              <button onClick={() => navigate("/admin/login")} className="hover:text-accent transition-colors">Provider Login</button>
              <button onClick={handleClearCache} className="hover:text-accent transition-colors flex items-center gap-1">
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