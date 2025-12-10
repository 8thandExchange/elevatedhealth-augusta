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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NavbarProps {
  onOpenBooking?: () => void;
}

const Navbar = ({ onOpenBooking }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [isScrolled, setIsScrolled] = useState(!isHomePage);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    // Check auth state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsLoggedIn(true);
        // Try to get patient name and avatar
        const { data: patient } = await supabase
          .from("patients")
          .select("full_name, avatar_url")
          .eq("user_id", session.user.id)
          .maybeSingle();
        setUserName(patient?.full_name || null);
        setUserAvatar(patient?.avatar_url || null);
      } else {
        setIsLoggedIn(false);
        setUserName(null);
        setUserAvatar(null);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        // Fetch patient name and avatar
        const { data: patient } = await supabase
          .from("patients")
          .select("full_name, avatar_url")
          .eq("user_id", session.user.id)
          .maybeSingle();
        setUserName(patient?.full_name || null);
        setUserAvatar(patient?.avatar_url || null);
      } else {
        setIsLoggedIn(false);
        setUserName(null);
        setUserAvatar(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        toast.error("Failed to log out. Please try again.");
        return;
      }
      setIsLoggedIn(false);
      setUserName(null);
      setUserAvatar(null);
      toast.success("Logged out successfully");
      navigate("/");
    } catch (err) {
      console.error("Logout exception:", err);
      toast.error("An error occurred during logout.");
    }
  };

  return (
    <>
      {/* Announcement Bar - Dark Navy */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#1a3a4a] text-white text-xs py-2 text-center">
        <span className="font-lato">Serving Augusta & Evans, GA</span>
        <span className="mx-2">|</span>
        <a href="tel:7067603470" className="font-lato hover:underline">(706) 760-3470</a>
      </div>
      
      {/* Main Navigation */}
      <nav
        className="fixed top-[32px] left-0 right-0 z-50 transition-all duration-500 border-b border-border/50 bg-white"
      >
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Brand */}
          <button 
            onClick={() => scrollToSection("hero")}
            className="font-playfair text-xl tracking-wide transition-colors hover:opacity-70"
            style={{ color: '#2C3E50' }}
          >
            Elevated Health
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => navigate(SITE_CONFIG.routes.ketamine)}
              className="text-sm font-lato font-normal tracking-wide transition-colors elegant-underline hover:opacity-70"
              style={{ color: '#2C3E50' }}
            >
              Ketamine
            </button>

            <button 
              onClick={() => navigate(SITE_CONFIG.routes.weightloss)}
              className="text-sm font-lato font-normal tracking-wide transition-colors elegant-underline hover:opacity-70"
              style={{ color: '#2C3E50' }}
            >
              Weight Loss
            </button>

            <button 
              onClick={() => navigate(SITE_CONFIG.routes.hormones)}
              className="text-sm font-lato font-normal tracking-wide transition-colors elegant-underline hover:opacity-70"
              style={{ color: '#2C3E50' }}
            >
              Hormones
            </button>

            <button 
              onClick={() => scrollToSection("contact")}
              className="text-sm font-lato font-normal tracking-wide transition-colors elegant-underline hover:opacity-70"
              style={{ color: '#2C3E50' }}
            >
              Contact
            </button>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline"
                    className="font-lato font-normal text-sm tracking-wide px-3 py-2 gap-2 border-primary/50 hover:bg-primary/5 bg-white"
                    style={{ color: '#2C3E50' }}
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={userAvatar || undefined} alt={userName || "User"} />
                      <AvatarFallback className="text-xs bg-primary/20 text-primary">
                        {userName ? getInitials(userName) : <User className="w-3 h-3" />}
                      </AvatarFallback>
                    </Avatar>
                    {userName || "My Account"}
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-48 bg-white border border-border shadow-lg z-[100]"
                >
                  <DropdownMenuItem 
                    onClick={() => navigate("/patient/dashboard")}
                    className="cursor-pointer gap-2"
                    style={{ color: '#2C3E50' }}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    My Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate("/patient/intake")}
                    className="cursor-pointer gap-2"
                    style={{ color: '#2C3E50' }}
                  >
                    <ClipboardList className="w-4 h-4" />
                    Symptom Check-In
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="cursor-pointer gap-2 text-red-600 focus:text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline"
                className="font-lato font-normal text-sm tracking-wide px-5 py-2 border-primary/50 hover:bg-primary/5 bg-white"
                style={{ color: '#2C3E50' }}
                onClick={() => navigate("/patient/login")}
              >
                Patient Portal
              </Button>
            )}
            <Button 
              className="font-lato font-normal text-sm tracking-wide px-6 py-2"
              onClick={() => {
                if (onOpenBooking) onOpenBooking();
              }}
            >
              Book Consultation
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            style={{ color: '#2C3E50' }}
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
            {/* Close button */}
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="mobile-menu-close absolute top-24 right-6 p-2 rounded-full"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-4">
              <button 
                onClick={() => scrollToSection("hero")} 
                className="mobile-menu-link"
              >
                Home
              </button>
              
              <button 
                onClick={() => {
                  navigate(SITE_CONFIG.routes.ketamine);
                  setIsMobileMenuOpen(false);
                }}
                className="mobile-menu-link"
              >
                Ketamine Therapy
              </button>

              <button 
                onClick={() => {
                  navigate(SITE_CONFIG.routes.weightloss);
                  setIsMobileMenuOpen(false);
                }}
                className="mobile-menu-link"
              >
                Weight Loss
              </button>

              <button 
                onClick={() => {
                  navigate(SITE_CONFIG.routes.hormones);
                  setIsMobileMenuOpen(false);
                }}
                className="mobile-menu-link"
              >
                Hormones
              </button>

              <button 
                onClick={() => {
                  scrollToSection("contact");
                  setIsMobileMenuOpen(false);
                }}
                className="mobile-menu-link"
              >
                Contact
              </button>
            </nav>

            {/* Action Buttons */}
            <div className="mt-auto pt-8 space-y-3 border-t border-gray-200">
              <Button 
                className="w-full font-lato text-sm tracking-wide py-6 bg-primary text-white"
                onClick={() => {
                  if (onOpenBooking) onOpenBooking();
                  setIsMobileMenuOpen(false);
                }}
              >
                Book Consultation
              </Button>
              
              {isLoggedIn ? (
                <>
                  <Button 
                    variant="outline"
                    className="w-full font-lato text-sm tracking-wide py-6 gap-2 bg-white border-gray-400"
                    style={{ color: '#2C3E50' }}
                    onClick={() => {
                      navigate("/patient/dashboard");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    My Dashboard
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full font-lato text-sm tracking-wide py-6 gap-2 bg-white border-gray-300"
                    style={{ color: '#475569' }}
                    onClick={() => {
                      navigate("/patient/intake");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <ClipboardList className="w-4 h-4" />
                    Symptom Check-In
                  </Button>
                  <Button 
                    variant="ghost"
                    className="w-full font-lato text-sm tracking-wide py-6 gap-2"
                    style={{ color: '#dc2626' }}
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline"
                  className="w-full font-lato text-sm tracking-wide py-6 bg-white border-gray-400"
                  style={{ color: '#2C3E50' }}
                  onClick={() => {
                    navigate("/patient/login");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Patient Portal
                </Button>
              )}
              
              <p className="mt-6 text-sm font-lato text-center" style={{ color: '#64748b' }}>
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