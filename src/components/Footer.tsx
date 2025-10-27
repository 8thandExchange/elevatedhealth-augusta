import { MapPin, Phone, Mail } from "lucide-react";
import logo from "@/assets/logo-transparent.png";

const Footer = () => {
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
              <img src={logo} alt="Elevated Health Augusta - Restore, Repair, Renew" className="h-16 mb-4 brightness-0 invert" />
              <p className="text-background/80 mb-4">
                Physician-led mental health care specializing in KETRA™ ketamine therapy 
                for depression, anxiety, and PTSD. Proudly serving Augusta, GA and our veterans.
              </p>
              <div className="flex gap-4 text-background/80">
                <MapPin className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p>7013 Evans Town Center Blvd</p>
                  <p>Suite 203, Evans, GA 30809</p>
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
                  <button onClick={() => scrollToSection("ketra")} className="hover:text-secondary transition-colors">
                    KETRA™ Therapy
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("veterans")} className="hover:text-secondary transition-colors">
                    Veterans Program
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
                  <a href="tel:7065509202" className="flex items-center gap-2 hover:text-secondary transition-colors">
                    <Phone className="h-4 w-4" />
                    (706) 550-9202
                  </a>
                </li>
                <li>
                  <a href="mailto:info@elevatedhealthaugusta.com" className="flex items-center gap-2 hover:text-secondary transition-colors">
                    <Mail className="h-4 w-4" />
                    info@elevatedhealthaugusta.com
                  </a>
                </li>
              </ul>
              <div className="mt-4 text-background/80">
                <p className="text-sm">Mon-Fri: 8AM - 6PM</p>
                <p className="text-sm">Sat: 9AM - 2PM</p>
                <p className="text-sm">Sun: Closed</p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-background/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-background/60 text-sm">
              <p>© 2025 Elevated Health Augusta. All rights reserved.</p>
              <div className="flex gap-6">
                <button className="hover:text-secondary transition-colors">Privacy Policy</button>
                <button className="hover:text-secondary transition-colors">Terms of Service</button>
                <button className="hover:text-secondary transition-colors">HIPAA Notice</button>
              </div>
            </div>
            <p className="text-center mt-4 text-background/40 text-xs">
              KETRA™ is a proprietary therapy protocol. Individual results may vary. 
              Consult with a physician to determine if treatment is appropriate for you.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
