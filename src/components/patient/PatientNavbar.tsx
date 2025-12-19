import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Home, 
  BookOpen, 
  MessageCircle, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PatientNavbarProps {
  patientName: string;
  avatarUrl?: string | null;
  onEditProfile?: () => void;
}

const PatientNavbar = ({ patientName, avatarUrl, onEditProfile }: PatientNavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        toast.error("Failed to logout. Please try again.");
        return;
      }
      toast.success("Logged out successfully");
      // Use replace to prevent back navigation to protected pages
      navigate("/patient/login", { replace: true });
    } catch (error) {
      console.error("Logout exception:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  const navItems = [
    { icon: Home, label: "My Services", path: "/patient/dashboard" },
    { icon: BookOpen, label: "Resources", path: "/patient-resources" },
    { icon: MessageCircle, label: "Contact", path: "/consult" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b border-border/50 bg-card sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Patient Info */}
          <div className="flex items-center gap-3 min-w-0">
            <Avatar 
              className="w-10 h-10 border border-border cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all flex-shrink-0 active:scale-95"
              onClick={onEditProfile}
            >
              <AvatarImage src={avatarUrl || undefined} alt={patientName} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {getInitials(patientName)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block min-w-0">
              <p className="text-xs uppercase tracking-widest text-gold">Patient Portal</p>
              <h1 className="font-cormorant text-lg text-foreground truncate">
                {patientName}
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => navigate(item.path)}
                className={cn(
                  "gap-2 min-h-[44px]",
                  isActive(item.path) && "bg-primary/10 text-primary"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onEditProfile}
              className="min-h-[44px] min-w-[44px]"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/10 min-h-[44px]"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden min-h-[44px] min-w-[44px]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation - Slide in animation */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-out",
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <nav className="mt-4 pb-2 space-y-1 border-t border-border/50 pt-4">
            {/* Mobile header with avatar */}
            <div className="flex items-center gap-3 px-2 pb-3 mb-2 border-b border-border/30 sm:hidden">
              <Avatar className="w-8 h-8 border border-border">
                <AvatarImage src={avatarUrl || undefined} alt={patientName} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(patientName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs text-gold">Patient Portal</p>
                <p className="font-medium text-sm truncate">{patientName}</p>
              </div>
            </div>

            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 min-h-[48px] active:scale-[0.98] transition-transform",
                  isActive(item.path) && "bg-primary/10 text-primary"
                )}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Button>
            ))}
            <div className="border-t border-border/50 pt-2 mt-2 space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 min-h-[48px] active:scale-[0.98] transition-transform"
                onClick={() => {
                  onEditProfile?.();
                  setIsMobileMenuOpen(false);
                }}
              >
                <Settings className="w-5 h-5" />
                Settings
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-destructive hover:text-destructive min-h-[48px] active:scale-[0.98] transition-transform"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default PatientNavbar;