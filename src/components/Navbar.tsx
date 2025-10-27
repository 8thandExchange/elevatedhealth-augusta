import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone } from "lucide-react";
import logo from "@/assets/logo-transparent.png";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-card/95 backdrop-blur-md shadow-md" : "bg-card/90 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <img src={logo} alt="Elevated Health Augusta - Restore, Repair, Renew" className="h-8 md:h-10 object-contain" />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <button onClick={() => scrollToSection("about")} className="text-foreground hover:text-primary transition-colors">
              About
            </button>
            <button onClick={() => scrollToSection("ketra")} className="text-foreground hover:text-primary transition-colors">
              KETRA™ Therapy
            </button>
            <button onClick={() => scrollToSection("veterans")} className="text-foreground hover:text-primary transition-colors">
              Veterans
            </button>
            <button onClick={() => scrollToSection("insurance")} className="text-foreground hover:text-primary transition-colors">
              Insurance
            </button>
            <button onClick={() => scrollToSection("contact")} className="text-foreground hover:text-primary transition-colors">
              Contact
            </button>
            <a href="tel:7065509202">
              <Button variant="cta" size="lg" className="gap-2">
                <Phone className="h-4 w-4" />
                (706) 550-9202
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <button onClick={() => scrollToSection("about")} className="text-left py-2 text-foreground hover:text-primary transition-colors">
                About
              </button>
              <button onClick={() => scrollToSection("ketra")} className="text-left py-2 text-foreground hover:text-primary transition-colors">
                KETRA™ Therapy
              </button>
              <button onClick={() => scrollToSection("veterans")} className="text-left py-2 text-foreground hover:text-primary transition-colors">
                Veterans
              </button>
              <button onClick={() => scrollToSection("insurance")} className="text-left py-2 text-foreground hover:text-primary transition-colors">
                Insurance
              </button>
              <button onClick={() => scrollToSection("contact")} className="text-left py-2 text-foreground hover:text-primary transition-colors">
                Contact
              </button>
              <a href="tel:7065509202" className="w-full">
                <Button variant="cta" size="lg" className="w-full gap-2">
                  <Phone className="h-4 w-4" />
                  (706) 550-9202
                </Button>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
