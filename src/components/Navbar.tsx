import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { SITE_CONFIG } from "@/lib/siteConfig";
import logo from "@/assets/logo-transparent.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [isScrolled, setIsScrolled] = useState(!isHomePage);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Always show solid navbar on non-home pages
    if (!isHomePage) {
      setIsScrolled(true);
      return;
    }
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  const scrollToSection = (id: string) => {
    // If not on home page, navigate to home first
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation, then scroll to section
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      // Scroll directly to section
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isScrolled 
          ? "bg-white backdrop-blur-lg shadow-sm border-b border-border/50" 
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20 py-4">
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10">
            <button 
              onClick={() => scrollToSection("hero")} 
              className={`text-sm font-medium transition-all duration-300 ${
                isScrolled ? "text-foreground hover:text-primary" : "text-white hover:text-gold"
              }`}
            >
              Home
            </button>
            
            <button 
              onClick={() => navigate(SITE_CONFIG.routes.ketamine)}
              className={`text-sm font-medium transition-all duration-300 ${
                isScrolled ? "text-foreground hover:text-primary" : "text-white hover:text-gold"
              }`}
            >
              Ketamine Therapy
            </button>

            <button 
              onClick={() => navigate(SITE_CONFIG.routes.weightloss)}
              className={`text-sm font-medium transition-all duration-300 ${
                isScrolled ? "text-foreground hover:text-primary" : "text-white hover:text-gold"
              }`}
            >
              Medical Weight Loss
            </button>

            <button 
              onClick={() => navigate(SITE_CONFIG.routes.hormones)}
              className={`text-sm font-medium transition-all duration-300 ${
                isScrolled ? "text-foreground hover:text-primary" : "text-white hover:text-gold"
              }`}
            >
              Hormone Replacement
            </button>

            <button 
              onClick={() => {
                if (window.location.pathname === '/what-to-expect') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  navigate('/what-to-expect');
                }
              }} 
              className={`text-sm font-medium transition-all duration-300 ${
                isScrolled ? "text-foreground hover:text-primary" : "text-white hover:text-gold"
              }`}
            >
              What to Expect
            </button>

            <button 
              onClick={() => scrollToSection("team")} 
              className={`text-sm font-medium transition-all duration-300 ${
                isScrolled ? "text-foreground hover:text-primary" : "text-white hover:text-gold"
              }`}
            >
              Our Team
            </button>
            <button 
              onClick={() => scrollToSection("veterans")} 
              className={`text-sm font-medium transition-all duration-300 ${
                isScrolled ? "text-foreground hover:text-primary" : "text-white hover:text-gold"
              }`}
            >
              Veterans
            </button>
            <button 
              onClick={() => scrollToSection("insurance")} 
              className={`text-sm font-medium transition-all duration-300 ${
                isScrolled ? "text-foreground hover:text-primary" : "text-white hover:text-gold"
              }`}
            >
              Insurance
            </button>
            <button 
              onClick={() => scrollToSection("testimonials")} 
              className={`text-sm font-medium transition-all duration-300 ${
                isScrolled ? "text-foreground hover:text-primary" : "text-white hover:text-gold"
              }`}
            >
              Testimonials
            </button>
            <button 
              onClick={() => scrollToSection("contact")} 
              className={`text-sm font-medium transition-all duration-300 ${
                isScrolled ? "text-foreground hover:text-primary" : "text-white hover:text-gold"
              }`}
            >
              Contact
            </button>
            <Button 
              variant="outline"
              className={`font-medium px-6 py-2 transition-all duration-300 ${
                isScrolled 
                  ? "border-primary text-primary hover:bg-primary hover:text-white" 
                  : "border-white text-white hover:bg-white hover:text-primary"
              }`}
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
                Book Consultation
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
              <button onClick={() => scrollToSection("hero")} className="text-left py-2 text-foreground hover:text-accent transition-colors">
                Home
              </button>
              
              <button 
                onClick={() => {
                  navigate(SITE_CONFIG.routes.ketamine);
                  setIsMobileMenuOpen(false);
                }}
                className="text-left py-2 text-foreground hover:text-accent transition-colors"
              >
                Ketamine Therapy
              </button>

              <button 
                onClick={() => {
                  navigate(SITE_CONFIG.routes.weightloss);
                  setIsMobileMenuOpen(false);
                }}
                className="text-left py-2 text-foreground hover:text-accent transition-colors"
              >
                Medical Weight Loss
              </button>

              <button 
                onClick={() => {
                  navigate(SITE_CONFIG.routes.hormones);
                  setIsMobileMenuOpen(false);
                }}
                className="text-left py-2 text-foreground hover:text-accent transition-colors"
              >
                Hormone Replacement
              </button>

              <button onClick={() => scrollToSection("testimonials")} className="text-left py-2 text-foreground hover:text-accent transition-colors">
                Testimonials
              </button>
              <button onClick={() => scrollToSection("contact")} className="text-left py-2 text-foreground hover:text-accent transition-colors">
                Contact
              </button>
              <Button 
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-white w-full" 
                size="lg" 
                asChild
              >
                <a
                  href="https://calendar.google.com/calendar/appointments/schedules/AcZssZ0XA11WP_5kIZjLuXt6N_cJq5cpLLRdm3T19lrV6w-gjh-VeN5JN0yybyGHXEP1Qo8rjBOpzMyW?gv=true"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Book Consultation
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
