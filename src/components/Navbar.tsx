import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { SITE_CONFIG } from "@/lib/siteConfig";

interface NavbarProps {
  onOpenBooking?: () => void;
}

const Navbar = ({ onOpenBooking }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [isScrolled, setIsScrolled] = useState(!isHomePage);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isHomePage) {
      setIsScrolled(true);
      return;
    }
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  const scrollToSection = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        (isScrolled || isMobileMenuOpen)
          ? "bg-background/95 backdrop-blur-md border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Brand */}
          <button 
            onClick={() => scrollToSection("hero")}
            className="font-cormorant text-xl tracking-wide text-foreground hover:text-primary transition-colors"
          >
            Elevated Health
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => navigate(SITE_CONFIG.routes.ketamine)}
              className="text-sm font-inter font-light tracking-wide text-foreground/80 hover:text-foreground transition-colors elegant-underline"
            >
              Ketamine
            </button>

            <button 
              onClick={() => navigate(SITE_CONFIG.routes.weightloss)}
              className="text-sm font-inter font-light tracking-wide text-foreground/80 hover:text-foreground transition-colors elegant-underline"
            >
              Weight Loss
            </button>

            <button 
              onClick={() => navigate(SITE_CONFIG.routes.hormones)}
              className="text-sm font-inter font-light tracking-wide text-foreground/80 hover:text-foreground transition-colors elegant-underline"
            >
              Hormones
            </button>

            <button 
              onClick={() => scrollToSection("contact")}
              className="text-sm font-inter font-light tracking-wide text-foreground/80 hover:text-foreground transition-colors elegant-underline"
            >
              Contact
            </button>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Button 
              className="font-inter font-normal text-sm tracking-wide px-6 py-2 bg-primary hover:bg-primary-dark text-primary-foreground transition-all duration-300"
              onClick={() => {
                if (onOpenBooking) onOpenBooking();
              }}
            >
              Book Consultation
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <>
            <div 
              className="md:hidden fixed inset-0 top-20 bg-foreground/20 backdrop-blur-sm z-40 animate-fade-in"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            <div className="md:hidden fixed right-0 top-20 bottom-0 w-80 max-w-full bg-background shadow-lg border-l border-border animate-slide-in-right z-50">
              <div className="flex flex-col p-8">
                <nav className="flex flex-col gap-6">
                  <button 
                    onClick={() => scrollToSection("hero")} 
                    className="text-left font-cormorant text-2xl text-foreground hover:text-primary transition-colors"
                  >
                    Home
                  </button>
                  
                  <button 
                    onClick={() => {
                      navigate(SITE_CONFIG.routes.ketamine);
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left font-cormorant text-2xl text-foreground hover:text-primary transition-colors"
                  >
                    Ketamine Therapy
                  </button>

                  <button 
                    onClick={() => {
                      navigate(SITE_CONFIG.routes.weightloss);
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left font-cormorant text-2xl text-foreground hover:text-primary transition-colors"
                  >
                    Weight Loss
                  </button>

                  <button 
                    onClick={() => {
                      navigate(SITE_CONFIG.routes.hormones);
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left font-cormorant text-2xl text-foreground hover:text-primary transition-colors"
                  >
                    Hormones
                  </button>

                  <button 
                    onClick={() => {
                      scrollToSection("contact");
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left font-cormorant text-2xl text-foreground hover:text-primary transition-colors"
                  >
                    Contact
                  </button>
                </nav>

                <div className="mt-12 pt-8 border-t border-border">
                  <Button 
                    className="w-full font-inter text-sm tracking-wide py-6 bg-primary hover:bg-primary-dark text-primary-foreground"
                    onClick={() => {
                      if (onOpenBooking) onOpenBooking();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Book Consultation
                  </Button>
                  
                  <p className="mt-6 text-sm text-muted-foreground font-inter">
                    {SITE_CONFIG.phone}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
