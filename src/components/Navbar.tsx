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
        (isScrolled || isMobileMenuOpen)
          ? "bg-white shadow-md border-b border-border/30"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-center h-20 py-4">
          {/* Desktop Menu - Centered */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
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

            <Button 
              variant="outline"
              className={`font-medium px-6 py-2 transition-all duration-300 ${
                isScrolled 
                  ? "border-primary bg-primary text-white hover:bg-primary-dark" 
                  : "border-white bg-primary text-white hover:bg-primary-dark"
              }`}
              size="lg" 
              onClick={() => {
                if (onOpenBooking) {
                  onOpenBooking();
                }
                if (typeof window !== 'undefined' && (window as any).gtag) {
                  (window as any).gtag('event', 'consult_book', { location: 'navbar' });
                }
              }}
            >
              Book Consultation
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground absolute right-6"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <>
            {/* Semi-transparent backdrop */}
            <div 
              className="md:hidden fixed inset-0 top-20 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />
            
            {/* Mobile Menu */}
            <div className="md:hidden absolute left-0 right-0 top-20 bg-white shadow-lg border-t border-border animate-slide-in-right z-50">
              <div className="flex flex-col gap-4 px-6 py-6">
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
              
              <Button 
                variant="outline"
                className="w-full border-accent text-accent hover:bg-accent hover:text-white mt-4"
                size="lg" 
                onClick={() => {
                  if (onOpenBooking) {
                    onOpenBooking();
                  }
                  setIsMobileMenuOpen(false);
                  if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'consult_book', { location: 'mobile_menu' });
                  }
                }}
              >
                Book Consultation
              </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
