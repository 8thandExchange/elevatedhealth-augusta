import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogOut, Stethoscope, RefreshCw, Settings, Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
        <div className="min-w-0 flex-1">
          {subtitle && (
            <p className="text-xs uppercase tracking-widest text-gold truncate">{subtitle}</p>
          )}
          <h1 className="font-cormorant text-xl md:text-2xl text-foreground truncate">{title}</h1>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {!isOnProviderDashboard && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/provider/dashboard">
                <Stethoscope className="w-4 h-4 mr-2" />
                Provider Dashboard
              </Link>
            </Button>
          )}

          {!isOnSettings && (
            <Button variant="ghost" size="icon" asChild>
              <Link to="/admin/settings">
                <Settings className="w-5 h-5" />
              </Link>
            </Button>
          )}

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

          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-background border border-border shadow-lg z-[100]">
              {!isOnProviderDashboard && (
                <DropdownMenuItem asChild>
                  <Link to="/provider/dashboard" className="cursor-pointer gap-2">
                    <Stethoscope className="w-4 h-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
              )}
              
              {!isOnSettings && (
                <DropdownMenuItem asChild>
                  <Link to="/admin/settings" className="cursor-pointer gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
              )}
              
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
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
