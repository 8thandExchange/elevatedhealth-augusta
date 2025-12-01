import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  useEffect(() => {
    // Check auth state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsLoggedIn(true);
        // Try to get patient name
        const { data: patient } = await supabase
          .from("patients")
          .select("full_name")
          .eq("user_id", session.user.id)
          .maybeSingle();
        setUserName(patient?.full_name || null);
      } else {
        setIsLoggedIn(false);
        setUserName(null);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        // Fetch patient name
        const { data: patient } = await supabase
          .from("patients")
          .select("full_name")
          .eq("user_id", session.user.id)
          .maybeSingle();
        setUserName(patient?.full_name || null);
      } else {
        setIsLoggedIn(false);
        setUserName(null);
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
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserName(null);
    toast.success("Logged out successfully");
    navigate("/");
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
            className="font-playfair text-xl tracking-wide text-foreground hover:text-primary transition-colors"
          >
            Elevated Health
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => navigate(SITE_CONFIG.routes.ketamine)}
              className="text-sm font-lato font-normal tracking-wide text-muted-foreground hover:text-foreground transition-colors elegant-underline"
            >
              Ketamine
            </button>

            <button 
              onClick={() => navigate(SITE_CONFIG.routes.weightloss)}
              className="text-sm font-lato font-normal tracking-wide text-muted-foreground hover:text-foreground transition-colors elegant-underline"
            >
              Weight Loss
            </button>

            <button 
              onClick={() => navigate(SITE_CONFIG.routes.hormones)}
              className="text-sm font-lato font-normal tracking-wide text-muted-foreground hover:text-foreground transition-colors elegant-underline"
            >
              Hormones
            </button>

            <button 
              onClick={() => scrollToSection("contact")}
              className="text-sm font-lato font-normal tracking-wide text-muted-foreground hover:text-foreground transition-colors elegant-underline"
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
                    className="font-lato font-normal text-sm tracking-wide px-4 py-2 border-primary/50 text-primary hover:bg-primary/5 hover:text-primary gap-2"
                  >
                    <User className="w-4 h-4" />
                    {userName || "My Account"}
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-48 bg-background border border-border shadow-lg z-[100]"
                >
                  <DropdownMenuItem 
                    onClick={() => navigate("/patient/dashboard")}
                    className="cursor-pointer gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    My Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate("/patient/intake")}
                    className="cursor-pointer gap-2"
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
                className="font-lato font-normal text-sm tracking-wide px-5 py-2 border-primary/50 text-primary hover:bg-primary/5 hover:text-primary"
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
                    className="text-left font-playfair text-2xl text-foreground hover:text-primary transition-colors"
                  >
                    Home
                  </button>
                  
                  <button 
                    onClick={() => {
                      navigate(SITE_CONFIG.routes.ketamine);
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left font-playfair text-2xl text-foreground hover:text-primary transition-colors"
                  >
                    Ketamine Therapy
                  </button>

                  <button 
                    onClick={() => {
                      navigate(SITE_CONFIG.routes.weightloss);
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left font-playfair text-2xl text-foreground hover:text-primary transition-colors"
                  >
                    Weight Loss
                  </button>

                  <button 
                    onClick={() => {
                      navigate(SITE_CONFIG.routes.hormones);
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left font-playfair text-2xl text-foreground hover:text-primary transition-colors"
                  >
                    Hormones
                  </button>

                  <button 
                    onClick={() => {
                      scrollToSection("contact");
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left font-playfair text-2xl text-foreground hover:text-primary transition-colors"
                  >
                    Contact
                  </button>
                </nav>

                <div className="mt-12 pt-8 border-t border-border space-y-3">
                  <Button 
                    className="w-full font-lato text-sm tracking-wide py-6"
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
                        className="w-full font-lato text-sm tracking-wide py-6 border-primary/50 text-primary gap-2"
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
                        className="w-full font-lato text-sm tracking-wide py-6 border-border text-muted-foreground gap-2"
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
                        className="w-full font-lato text-sm tracking-wide py-6 text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
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
                      className="w-full font-lato text-sm tracking-wide py-6 border-primary/50 text-primary"
                      onClick={() => {
                        navigate("/patient/login");
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Patient Portal
                    </Button>
                  )}
                  
                  <p className="mt-6 text-sm text-muted-foreground font-lato">
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