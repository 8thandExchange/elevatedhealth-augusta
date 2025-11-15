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
import logo from "@/assets/logo-transparent.png";

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
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 50);
      }, 100);
    } else {
      // Scroll to top first, then to section
      window.scrollTo({ top: 0, behavior: "instant" });
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 50);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isScrolled 
          ? "bg-white/95 backdrop-blur-md shadow-[0_2px_20px_rgba(0,0,0,0.08)]" 
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <button 
              onClick={() => scrollToSection("hero")} 
              className="focus:outline-none transition-all duration-300 hover:scale-105"
            >
              <img 
                src={logo} 
                alt="Elevated Health Augusta" 
                className="h-10 md:h-14 w-auto transition-all duration-300"
              />
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <button 
              onClick={() => scrollToSection("hero")} 
              className={`font-medium transition-all duration-300 ${
                isScrolled ? "text-primary hover:text-hope" : "text-white hover:text-gold"
              }`}
            >
              Home
            </button>
            
            {/* Treatments Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className={`flex items-center gap-1 font-medium transition-all duration-300 focus:outline-none ${
                isScrolled ? "text-primary hover:text-hope" : "text-white hover:text-gold"
              }`}>
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

            <button 
              onClick={() => {
                if (window.location.pathname === '/what-to-expect') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  navigate('/what-to-expect');
                }
              }} 
              className={`font-medium transition-all duration-300 ${
                isScrolled ? "text-primary hover:text-hope" : "text-white hover:text-gold"
              }`}
            >
              What to Expect
            </button>

            <button 
              onClick={() => scrollToSection("team")} 
              className={`font-medium transition-all duration-300 ${
                isScrolled ? "text-primary hover:text-hope" : "text-white hover:text-gold"
              }`}
            >
              Our Team
            </button>
            <button 
              onClick={() => scrollToSection("veterans")} 
              className={`font-medium transition-all duration-300 ${
                isScrolled ? "text-primary hover:text-hope" : "text-white hover:text-gold"
              }`}
            >
              Veterans
            </button>
            <button 
              onClick={() => scrollToSection("insurance")} 
              className={`font-medium transition-all duration-300 ${
                isScrolled ? "text-primary hover:text-hope" : "text-white hover:text-gold"
              }`}
            >
              Insurance
            </button>
            <button 
              onClick={() => scrollToSection("testimonials")} 
              className={`font-medium transition-all duration-300 ${
                isScrolled ? "text-primary hover:text-hope" : "text-white hover:text-gold"
              }`}
            >
              Testimonials
            </button>
            <button 
              onClick={() => scrollToSection("contact")} 
              className={`font-medium transition-all duration-300 ${
                isScrolled ? "text-primary hover:text-hope" : "text-white hover:text-gold"
              }`}
            >
              Contact
            </button>
            <Button 
              className="bg-hope hover:bg-hope-light text-white font-semibold px-6 py-2.5 rounded-md transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
              size="lg" 
              asChild
            >
              <a
                href="https://calendar.google.com/calendar/appointments/schedules/AcZssZ0XA11WP_5kIZjLuXt6N_cJq5cpLLRdm3T19lrV6w-gjh-VeN5JN0yybyGHXEP1Qo8rjBOpzMyW?gv=true"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'consult_book', { location: 'navbar' });
                  }
                }}
              >
                Book Free Consult
              </a>
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
              <button onClick={() => scrollToSection("hero")} className="text-left py-2 text-foreground hover:text-hope transition-colors">
                Home
              </button>
              
              {/* Treatments Mobile Submenu */}
              <div>
                <button 
                  onClick={() => setIsTreatmentsOpen(!isTreatmentsOpen)}
                  className="flex items-center justify-between w-full text-left py-2 text-foreground hover:text-hope transition-colors"
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
                      className="block w-full text-left py-2 text-sm text-muted-foreground hover:text-hope transition-colors"
                    >
                      IV Ketamine
                    </button>
                    <button 
                      onClick={() => {
                        navigate(SITE_CONFIG.routes.spravato);
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left py-2 text-sm text-muted-foreground hover:text-hope transition-colors"
                    >
                      SPRAVATO® Nasal Spray
                    </button>
                  </div>
                )}
              </div>

              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (window.location.pathname === '/what-to-expect') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    navigate('/what-to-expect');
                  }
                }} 
                className="text-left py-2 text-foreground hover:text-hope transition-colors"
              >
                What to Expect
              </button>

              <button onClick={() => scrollToSection("team")} className="text-left py-2 text-foreground hover:text-hope transition-colors">
                Our Team
              </button>
              <button onClick={() => scrollToSection("veterans")} className="text-left py-2 text-foreground hover:text-hope transition-colors">
                Veterans
              </button>
              <button onClick={() => scrollToSection("insurance")} className="text-left py-2 text-foreground hover:text-hope transition-colors">
                Insurance
              </button>
              <button onClick={() => scrollToSection("testimonials")} className="text-left py-2 text-foreground hover:text-hope transition-colors">
                Testimonials
              </button>
              <button onClick={() => scrollToSection("contact")} className="text-left py-2 text-foreground hover:text-hope transition-colors">
                Contact
              </button>
              <Button className="bg-hope hover:bg-hope-light text-white w-full" size="lg" asChild>
                <a
                  href="https://calendar.google.com/calendar/appointments/schedules/AcZssZ0XA11WP_5kIZjLuXt6N_cJq5cpLLRdm3T19lrV6w-gjh-VeN5JN0yybyGHXEP1Qo8rjBOpzMyW?gv=true"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Book Free Consult
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
