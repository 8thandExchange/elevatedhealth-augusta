import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Menu, X, User, LayoutDashboard, ClipboardList, LogOut, ChevronDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { useBooking } from "@/contexts/BookingContext";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { openBooking } = useBooking();
  const { isLoading: isCheckingAuth, isLoggedIn, isProvider, userName, userAvatar, logout } = useAuth();
  const isHomePage = location.pathname === '/';
  const [isScrolled, setIsScrolled] = useState(!isHomePage);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  useEffect(() => {
    if (!isHomePage) { setIsScrolled(true); return; }
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  const scrollToSection = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => { await logout(); };

  const navBg = isScrolled || !isHomePage
    ? "bg-white/95 backdrop-blur-md border-b border-border/30 shadow-sm"
    : "bg-transparent border-b border-transparent";

  return (
    <>
      {/* Announcement Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background text-muted-foreground text-xs py-2 text-center border-b border-border/20">
        <span className="font-inter">Serving Augusta & Evans, GA</span>
        <span className="mx-2 opacity-30">|</span>
        <a href="tel:7067603470" className="font-inter hover:text-primary transition-colors">(706) 760-3470</a>
      </div>
      
      {/* Main Navigation */}
      <nav className={`fixed top-[32px] left-0 right-0 z-50 transition-all duration-500 ${navBg}`}>
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <button 
              onClick={() => scrollToSection("hero")}
              className="font-inter text-xl font-bold tracking-tight text-foreground transition-colors hover:text-primary"
            >
              Elevated Health
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8 flex-shrink-0">
              {[
                { label: "Ketamine", action: () => navigate(SITE_CONFIG.routes.ketamine) },
                { label: "Weight Loss", action: () => navigate(SITE_CONFIG.routes.weightloss) },
                { label: "Hormones", action: () => navigate(SITE_CONFIG.routes.hormones) },
                { label: "Pricing", action: () => navigate("/pricing") },
                { label: "Contact", action: () => scrollToSection("contact") },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="text-sm font-inter font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
              {isCheckingAuth ? null : isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="font-inter text-sm px-3 py-2 gap-2 border-border/50 text-foreground">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={userAvatar || undefined} alt={userName || "User"} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {userName ? getInitials(userName) : <User className="w-3 h-3" />}
                        </AvatarFallback>
                      </Avatar>
                      {userName || "My Account"}
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-card border border-border shadow-lg z-[100]">
                    {isProvider ? (
                      <DropdownMenuItem onClick={() => navigate("/provider/dashboard")} className="cursor-pointer gap-2">
                        <LayoutDashboard className="w-4 h-4" /> Provider Dashboard
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuItem onClick={() => navigate("/patient/dashboard")} className="cursor-pointer gap-2">
                          <LayoutDashboard className="w-4 h-4" /> My Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/patient/intake")} className="cursor-pointer gap-2">
                          <ClipboardList className="w-4 h-4" /> Symptom Check-In
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                      <LogOut className="w-4 h-4" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
              <Button 
                className="font-inter font-semibold text-sm tracking-wide px-6 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-full"
                onClick={openBooking}
              >
                Book Consultation
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Fullscreen Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu-overlay">
            <div className="flex flex-col px-8 pb-8">
              <button onClick={() => setIsMobileMenuOpen(false)} className="mobile-menu-close absolute top-4 right-6 p-2 rounded-full">
                <X className="h-6 w-6" />
              </button>

              <nav className="flex flex-col gap-4 mt-4">
                {[
                  { label: "Home", action: () => scrollToSection("hero") },
                  { label: "Ketamine Therapy", action: () => { navigate(SITE_CONFIG.routes.ketamine); setIsMobileMenuOpen(false); } },
                  { label: "Weight Loss", action: () => { navigate(SITE_CONFIG.routes.weightloss); setIsMobileMenuOpen(false); } },
                  { label: "Hormones", action: () => { navigate(SITE_CONFIG.routes.hormones); setIsMobileMenuOpen(false); } },
                  { label: "Pricing", action: () => { navigate("/pricing"); setIsMobileMenuOpen(false); } },
                  { label: "Contact", action: () => { scrollToSection("contact"); setIsMobileMenuOpen(false); } },
                ].map((item) => (
                  <button key={item.label} onClick={item.action} className="mobile-menu-link">{item.label}</button>
                ))}
              </nav>

              <div className="mt-auto pt-8 space-y-3 border-t border-border">
                <Button 
                  className="w-full font-inter text-sm tracking-wide py-6 bg-primary hover:bg-primary-dark text-primary-foreground rounded-full"
                  onClick={() => { openBooking(); setIsMobileMenuOpen(false); }}
                >
                  Book Consultation
                </Button>
                
                {!isCheckingAuth && isLoggedIn && (
                  <>
                    <Button 
                      variant="outline"
                      className="w-full font-inter text-sm tracking-wide py-6 gap-2"
                      onClick={() => { navigate(isProvider ? "/provider/dashboard" : "/patient/dashboard"); setIsMobileMenuOpen(false); }}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      {isProvider ? "Provider Dashboard" : "My Dashboard"}
                    </Button>
                    <Button 
                      variant="ghost"
                      className="w-full font-inter text-sm tracking-wide py-6 gap-2 text-destructive"
                      onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </Button>
                  </>
                )}
                
                <p className="mt-6 text-sm font-inter text-center text-muted-foreground">
                  {SITE_CONFIG.phone}
                </p>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
