import { MapPin, Phone, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SITE_CONFIG } from "@/lib/siteConfig";

const Footer = () => {
  const navigate = useNavigate();
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">
                {SITE_CONFIG.clinicName}
              </h3>
              <p className="text-background/80 mb-4">
                Expert-led ketamine therapy for treatment-resistant depression, anxiety, and PTSD. 
                Proudly serving Veterans, first responders, and the Augusta community.
              </p>
              <div className="space-y-3 text-background/80">
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 flex-shrink-0 mt-1" />
                  <div>
                    <p>{SITE_CONFIG.address.line1}</p>
                    <p>{SITE_CONFIG.address.cityStateZip}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Phone className="h-5 w-5 flex-shrink-0" />
                  <a href={`tel:${SITE_CONFIG.phoneRaw}`} className="hover:text-secondary transition-colors">
                    {SITE_CONFIG.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-2 text-background/80">
                <li>
                  <button onClick={() => scrollToSection("about")} className="hover:text-secondary transition-colors">
                    About Us
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate(SITE_CONFIG.routes.ivKetamine)} 
                    className="hover:text-secondary transition-colors"
                  >
                    IV Ketamine
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate(SITE_CONFIG.routes.spravato)} 
                    className="hover:text-secondary transition-colors"
                  >
                    SPRAVATO®
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate(SITE_CONFIG.routes.militaryVeteran)} 
                    className="hover:text-secondary transition-colors"
                  >
                    Benefits & Advocacy
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("insurance")} className="hover:text-secondary transition-colors">
                    Insurance
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("contact")} className="hover:text-secondary transition-colors">
                    Contact
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4 text-lg">Contact</h4>
              <ul className="space-y-3 text-background/80">
                <li>
                  <a href={`tel:${SITE_CONFIG.phoneRaw}`} className="flex items-center gap-2 hover:text-secondary transition-colors">
                    <Phone className="h-4 w-4" />
                    {SITE_CONFIG.phone}
                  </a>
                </li>
                <li>
                  <a href="mailto:care@elevatedhealthaugusta.com" className="flex items-start gap-2 hover:text-secondary transition-colors">
                    <Mail className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span className="break-all">care@elevatedhealthaugusta.com</span>
                  </a>
                </li>
              </ul>
              <div className="mt-4 text-background/80">
                <p className="text-sm">Mon-Fri: 8AM - 6PM</p>
                <p className="text-sm">Sat-Sun: By Appointment</p>
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
