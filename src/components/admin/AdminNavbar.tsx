import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogOut, Stethoscope, RefreshCw, Settings } from "lucide-react";

interface AdminNavbarProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

const AdminNavbar = ({ title, subtitle, onRefresh, isRefreshing }: AdminNavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isOnProviderDashboard = location.pathname === "/provider/dashboard";
  const isOnSettings = location.pathname === "/admin/settings";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  return (
    <header className="border-b border-border/50 bg-card sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          {subtitle && (
            <p className="text-xs uppercase tracking-widest text-gold">{subtitle}</p>
          )}
          <h1 className="font-cormorant text-2xl text-foreground">{title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Navigation Links */}
          {!isOnProviderDashboard && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/provider/dashboard">
                <Stethoscope className="w-4 h-4 mr-2" />
                Provider Dashboard
              </Link>
            </Button>
          )}

          {/* Settings Link */}
          {!isOnSettings && (
            <Button variant="ghost" size="icon" asChild>
              <Link to="/admin/settings">
                <Settings className="w-5 h-5" />
              </Link>
            </Button>
          )}

          {/* Refresh Button */}
          {onRefresh && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}

          {/* Logout Button */}
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
