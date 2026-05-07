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
    ? "bg-background/95 backdrop-blur-md border-b border-border/30"
    : "bg-transparent border-b border-transparent";

  const navLinks = [
    { label: "Home", action: () => { navigate("/"); scrollToSection("hero"); } },
    { label: "Women's Hormones", action: () => navigate("/hormones-women") },
    { label: "Men's Health", action: () => navigate("/hormones-men") },
    { label: "IV Therapy", action: () => navigate("/iv-lounge") },
    { label: "Peptides", action: () => navigate("/peptides") },
    { label: "Membership", action: () => navigate("/membership") },
    { label: "About", action: () => navigate("/about") },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg}`}>
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Wordmark */}
            <button 
              onClick={() => { navigate("/"); scrollToSection("hero"); }}
              className="flex flex-col items-start"
            >
              <span className="font-playfair italic text-2xl text-foreground tracking-tight leading-none">elevated</span>
              <span className="font-jost text-[9px] font-medium uppercase tracking-[3px] text-foreground hidden sm:block mt-0.5">
                Health · Augusta
              </span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6 flex-shrink-0">
              {navLinks.map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="text-sm font-jost font-medium text-muted-foreground hover:text-foreground transition-colors"
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
                    <Button variant="outline" className="font-jost text-sm px-3 py-2 gap-2 border-border/50 text-foreground">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={userAvatar || undefined} alt={userName || "User"} />
                        <AvatarFallback className="text-xs bg-accent/10 text-accent">
                          {userName ? getInitials(userName) : <User className="w-3 h-3" />}
                        </AvatarFallback>
                      </Avatar>
                      {userName || "My Account"}
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-card border border-border z-[100]">
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
                className="font-jost font-medium text-sm tracking-wide px-6 py-2 bg-primary text-accent rounded-sm hover:bg-primary-light"
                onClick={openBooking}
              >
                Book Now
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
      </nav>

      {/* Fullscreen Mobile Menu (rendered outside nav to escape backdrop-filter containing block) */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay">
            <div className="flex flex-col px-8 pb-8">
              <button onClick={() => setIsMobileMenuOpen(false)} className="mobile-menu-close absolute top-4 right-6 p-2">
                <X className="h-6 w-6" />
              </button>

              <nav className="flex flex-col gap-4 mt-4">
                {navLinks.map((item) => (
                  <button key={item.label} onClick={() => { item.action(); setIsMobileMenuOpen(false); }} className="mobile-menu-link">{item.label}</button>
                ))}
              </nav>

              <div className="mt-auto pt-8 space-y-3 border-t border-border">
                <Button 
                  className="w-full font-jost font-medium text-sm tracking-wide py-6 bg-primary text-accent rounded-sm hover:bg-primary-light"
                  onClick={() => { openBooking(); setIsMobileMenuOpen(false); }}
                >
                  Book Now
                </Button>
                
                {!isCheckingAuth && isLoggedIn && (
                  <>
                    <Button 
                      variant="outline"
                      className="w-full font-jost text-sm tracking-wide py-6 gap-2"
                      onClick={() => { navigate(isProvider ? "/provider/dashboard" : "/patient/dashboard"); setIsMobileMenuOpen(false); }}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      {isProvider ? "Provider Dashboard" : "My Dashboard"}
                    </Button>
                    <Button 
                      variant="ghost"
                      className="w-full font-jost text-sm tracking-wide py-6 gap-2 text-destructive"
                      onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </Button>
                  </>
                )}
                
                <p className="mt-6 text-sm font-jost text-center text-muted-foreground">
                  {SITE_CONFIG.phone}
                </p>
              </div>
            </div>
        </div>
      )}
    </>
  );
};

export default Navbar;