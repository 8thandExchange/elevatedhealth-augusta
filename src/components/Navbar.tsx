import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, ChevronDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { SITE_CONFIG } from "@/lib/siteConfig";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTreatmentsOpen, setIsTreatmentsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    // If not on home page, navigate to home first
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation, scroll to top, then to section
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
        setTimeout(() => {
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 50);
      }, 100);
    } else {
      // Scroll to top first, then to section
      window.scrollTo({ top: 0, behavior: "instant" });
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 50);
    }
    setIsMobileMenuOpen(false);
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
            <h1 className="text-xl md:text-2xl font-bold text-primary">
              Elevated Health <span className="text-foreground">Augusta</span>
            </h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <button onClick={() => scrollToSection("hero")} className="text-foreground hover:text-primary transition-colors">
              Home
            </button>
            
            {/* Treatments Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-primary transition-colors focus:outline-none">
                Treatments
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card border-border z-50 shadow-lg">
                <DropdownMenuItem 
                  onClick={() => navigate(SITE_CONFIG.routes.ivKetamine)}
                  className="cursor-pointer hover:bg-muted focus:bg-muted"
                >
                  IV Ketamine
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate(SITE_CONFIG.routes.spravato)}
                  className="cursor-pointer hover:bg-muted focus:bg-muted"
                >
                  SPRAVATO® Nasal Spray
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button onClick={() => scrollToSection("about")} className="text-foreground hover:text-primary transition-colors">
              About
            </button>
            <button onClick={() => scrollToSection("veterans")} className="text-foreground hover:text-primary transition-colors">
              Veterans
            </button>
            <button onClick={() => scrollToSection("insurance")} className="text-foreground hover:text-primary transition-colors">
              Insurance
            </button>
            <button onClick={() => scrollToSection("testimonials")} className="text-foreground hover:text-primary transition-colors">
              Testimonials
            </button>
            <button onClick={() => scrollToSection("contact")} className="text-foreground hover:text-primary transition-colors">
              Contact
            </button>
            <Button variant="cta" size="lg" onClick={() => scrollToSection("booking")}>
              Book Consultation
            </Button>
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
              <button onClick={() => scrollToSection("hero")} className="text-left py-2 text-foreground hover:text-primary transition-colors">
                Home
              </button>
              
              {/* Treatments Mobile Submenu */}
              <div>
                <button 
                  onClick={() => setIsTreatmentsOpen(!isTreatmentsOpen)}
                  className="flex items-center justify-between w-full text-left py-2 text-foreground hover:text-primary transition-colors"
                >
                  Treatments
                  <ChevronDown className={`h-4 w-4 transition-transform ${isTreatmentsOpen ? 'rotate-180' : ''}`} />
                </button>
                {isTreatmentsOpen && (
                  <div className="pl-4 mt-2 space-y-2 animate-fade-in">
                    <button 
                      onClick={() => {
                        navigate(SITE_CONFIG.routes.ivKetamine);
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left py-2 text-sm text-foreground/80 hover:text-primary transition-colors"
                    >
                      IV Ketamine
                    </button>
                    <button 
                      onClick={() => {
                        navigate(SITE_CONFIG.routes.spravato);
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left py-2 text-sm text-foreground/80 hover:text-primary transition-colors"
                    >
                      SPRAVATO® Nasal Spray
                    </button>
                  </div>
                )}
              </div>

              <button onClick={() => scrollToSection("about")} className="text-left py-2 text-foreground hover:text-primary transition-colors">
                About
              </button>
              <button onClick={() => scrollToSection("veterans")} className="text-left py-2 text-foreground hover:text-primary transition-colors">
                Veterans
              </button>
              <button onClick={() => scrollToSection("insurance")} className="text-left py-2 text-foreground hover:text-primary transition-colors">
                Insurance
              </button>
              <button onClick={() => scrollToSection("testimonials")} className="text-left py-2 text-foreground hover:text-primary transition-colors">
                Testimonials
              </button>
              <button onClick={() => scrollToSection("contact")} className="text-left py-2 text-foreground hover:text-primary transition-colors">
                Contact
              </button>
              <Button variant="cta" size="lg" className="w-full" onClick={() => scrollToSection("booking")}>
                Book Consultation
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
