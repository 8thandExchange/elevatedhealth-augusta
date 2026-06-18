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
            <img
              src="/images/logo.png"
              alt="Elevated Health"
              className="h-14 md:h-16 w-auto mx-auto mb-4 brightness-0 invert opacity-95"
            />
            <p className="font-jost text-xs font-medium uppercase tracking-[3px] text-primary-foreground/70">
              Restore · Repair · Renew · Evans, Georgia
            </p>
          </div>

          {/* Info Grid */}
          <div className="grid md:grid-cols-3 gap-12 mb-16 text-center md:text-left">
            {/* Services */}
            <div>
              <h4 className="font-jost font-medium text-sm uppercase tracking-[2.5px] text-primary-foreground/60 mb-6">Services</h4>
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
                    <button onClick={() => navigate(item.path)} className="hover:text-primary-foreground transition-colors">
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-jost font-medium text-sm uppercase tracking-[2.5px] text-primary-foreground/60 mb-6">Contact</h4>
              <div className="space-y-4 font-jost text-sm text-primary-foreground/80 font-light">
                <div className="flex gap-3 justify-center md:justify-start">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-1 text-primary-foreground/60" />
                  <div>
                    <p>{SITE_CONFIG.address.line1}</p>
                    <p>{SITE_CONFIG.address.cityStateZip}</p>
                  </div>
                </div>
                <div className="flex gap-3 justify-center md:justify-start">
                  <Phone className="h-4 w-4 flex-shrink-0 text-primary-foreground/60" />
                  <a 
                    href={`tel:${SITE_CONFIG.phoneRaw}`} 
                    className="hover:text-primary-foreground transition-colors"
                    onClick={() => trackCTAClick('footer_call', `tel:${SITE_CONFIG.phoneRaw}`)}
                  >
                    {SITE_CONFIG.phone}
                  </a>
                </div>
                <p className="text-primary-foreground/60">elevatedhealthaugusta.com</p>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-jost font-medium text-sm uppercase tracking-[2.5px] text-primary-foreground/60 mb-6">Quick Links</h4>
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
                    <button onClick={() => navigate(item.path)} className="hover:text-primary-foreground transition-colors">
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
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-jost">
              <p className="text-primary-foreground/50">
                © 2025 {SITE_CONFIG.clinicName}. All rights reserved.
              </p>
              <button
                onClick={() => navigate("/patient/login?redirect=consult")}
                className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                Returning Patient? → Patient Portal
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-primary-foreground/40 font-jost">
              <button onClick={handleClearCache} className="hover:text-primary-foreground transition-colors flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Clear Cache
              </button>
              <button onClick={() => navigate("/admin/login")} className="hover:text-primary-foreground transition-colors">
                Staff Sign-In
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;