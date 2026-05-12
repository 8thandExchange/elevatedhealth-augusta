import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LogOut, Stethoscope, RefreshCw, Settings, Menu, MessageCircle, FileText, Mail, UserPlus, BookOpen, Boxes, CalendarDays } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddPatientModal from "@/components/provider/AddPatientModal";

interface AdminNavbarProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
  onNavigateToMessages?: () => void;
  onPatientAdded?: () => void;
}

const AdminNavbar = ({ title, subtitle, onRefresh, isRefreshing, onNavigateToMessages, onPatientAdded }: AdminNavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [inventoryAlertCount, setInventoryAlertCount] = useState(0);

  const isOnProviderDashboard = location.pathname === "/provider/dashboard";
  const isOnSettings = location.pathname === "/admin/settings";

  // Fetch unread message count
  const fetchUnreadCount = async () => {
    try {
      const { count, error } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("sender_role", "patient")
        .eq("is_read", false);

      if (!error && count !== null) {
        setUnreadCount(count);
      }
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  // Inventory alert badge: total of (reorder_now SKUs) + (lots expiring within 30d)
  const fetchInventoryAlertCount = async () => {
    try {
      const [{ data: skuRows }, { data: lotRows }] = await Promise.all([
        supabase.from("inventory_skus").select("id, reorder_threshold").eq("is_active", true),
        supabase.from("inventory_lots").select("sku_id, status, quantity_remaining, expiration_date").eq("status", "active"),
      ]);
      if (!skuRows || !lotRows) return;
      const totals = new Map<string, number>();
      for (const lot of lotRows) {
        const remaining = Number(lot.quantity_remaining ?? 0);
        if (remaining <= 0) continue;
        totals.set(lot.sku_id, (totals.get(lot.sku_id) ?? 0) + remaining);
      }
      let reorderCount = 0;
      for (const sku of skuRows) {
        const total = totals.get(sku.id) ?? 0;
        if (total <= sku.reorder_threshold) reorderCount += 1;
      }
      const today = Date.now();
      const cutoff = today + 30 * 24 * 60 * 60 * 1000;
      const expiringCount = lotRows.filter((l) => {
        if (Number(l.quantity_remaining ?? 0) <= 0) return false;
        const exp = new Date(l.expiration_date).getTime();
        return exp <= cutoff;
      }).length;
      setInventoryAlertCount(reorderCount + expiringCount);
    } catch (err) {
      console.error("Error fetching inventory alert count:", err);
    }
  };

  useEffect(() => {
    fetchInventoryAlertCount();
    const interval = window.setInterval(fetchInventoryAlertCount, 5 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel("navbar-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: "sender_role=eq.patient",
        },
        () => {
          // Increment count on new patient message
          setUnreadCount((prev) => prev + 1);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        () => {
          // Refetch on any update (e.g., marking as read)
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  const handleMessagesClick = () => {
    if (onNavigateToMessages) {
      onNavigateToMessages();
    } else if (!isOnProviderDashboard) {
      navigate("/provider/dashboard?tab=messages");
    }
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
          {/* Add Patient Button */}
          {isOnProviderDashboard && (
            <AddPatientModal
              onPatientAdded={onPatientAdded}
              trigger={
                <Button size="sm" className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add Patient
                </Button>
              }
            />
          )}
          
          {!isOnProviderDashboard && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/provider/dashboard">
                <Stethoscope className="w-4 h-4 mr-2" />
                Provider Dashboard
              </Link>
            </Button>
          )}

          {/* Inventory Button with Badge */}
          <Button variant="ghost" size="icon" className="relative" asChild title="Inventory">
            <Link to="/inventory">
              <Boxes className="w-5 h-5" />
              {inventoryAlertCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 min-w-[20px] p-0 flex items-center justify-center text-xs"
                >
                  {inventoryAlertCount > 99 ? "99+" : inventoryAlertCount}
                </Badge>
              )}
            </Link>
          </Button>

          {/* Messages Button with Badge */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={handleMessagesClick}
          >
            <MessageCircle className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 min-w-[20px] p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" title="Staff Resources">
                <FileText className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-background border border-border shadow-lg z-[100]">
              <DropdownMenuItem asChild>
                <Link to="/clinical-protocols" className="cursor-pointer gap-2">
                  <BookOpen className="w-4 h-4" />
                  Clinical Protocols
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/inventory" className="cursor-pointer gap-2">
                  <Boxes className="w-4 h-4" />
                  Inventory
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin/email-templates" className="cursor-pointer gap-2">
                  <Mail className="w-4 h-4" />
                  Email Templates
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin/scheduling" className="cursor-pointer gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Scheduling Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/staff-pricing-cheatsheet" target="_blank" className="cursor-pointer">
                  Full Pricing Cheatsheet
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/staff-quick-card" target="_blank" className="cursor-pointer">
                  Quick Reference Card
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
          {/* Messages Button with Badge - Mobile */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={handleMessagesClick}
          >
            <MessageCircle className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 min-w-[16px] p-0 flex items-center justify-center text-[10px]"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>

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
              
              <DropdownMenuItem asChild>
                <Link to="/clinical-protocols" className="cursor-pointer gap-2">
                  <BookOpen className="w-4 h-4" />
                  Clinical Protocols
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/inventory" className="cursor-pointer gap-2">
                  <Boxes className="w-4 h-4" />
                  Inventory
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin/email-templates" className="cursor-pointer gap-2">
                  <Mail className="w-4 h-4" />
                  Email Templates
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin/scheduling" className="cursor-pointer gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Scheduling Settings
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link to="/staff-pricing-cheatsheet" target="_blank" className="cursor-pointer gap-2">
                  <FileText className="w-4 h-4" />
                  Pricing Cheatsheet
                </Link>
              </DropdownMenuItem>

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
