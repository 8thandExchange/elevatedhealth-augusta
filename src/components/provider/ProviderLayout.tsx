import { useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import AdminNavbar from "@/components/admin/AdminNavbar";

interface ProviderLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
  onNavigateToMessages?: () => void;
  showNavbar?: boolean;
}

/**
 * ProviderLayout - A wrapper component for all provider/admin pages
 * 
 * This component ensures:
 * 1. User is authenticated
 * 2. User has provider role (admin, staff, or business_admin)
 * 3. Consistent navigation and layout across all provider pages
 * 4. Complete separation from patient portal
 */
const ProviderLayout = ({
  children,
  title,
  subtitle,
  onRefresh,
  isRefreshing,
  onNavigateToMessages,
  showNavbar = true,
}: ProviderLayoutProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkProviderAuth();
  }, []);

  const checkProviderAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/admin/login");
        return;
      }

      // Check if user has provider role (admin, staff, or business_admin)
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching user roles:", error);
        toast.error("Failed to verify access");
        navigate("/admin/login");
        return;
      }

      const hasProviderRole = roles?.some(r => 
        r.role === "admin" || r.role === "staff" || r.role === "business_admin"
      );

      if (!hasProviderRole) {
        toast.error("Access denied - Provider privileges required");
        navigate("/admin/login");
        return;
      }

      setIsAuthorized(true);
    } catch (error) {
      console.error("Provider auth check error:", error);
      toast.error("Authentication error");
      navigate("/admin/login");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {showNavbar && (
        <AdminNavbar 
          title={title}
          subtitle={subtitle}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          onNavigateToMessages={onNavigateToMessages}
        />
      )}
      {children}
    </div>
  );
};

export default ProviderLayout;
