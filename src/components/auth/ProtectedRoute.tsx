import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Session } from "@supabase/supabase-js";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  // Use undefined to distinguish "not loaded yet" from "no session" (null)
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          // Defer role check to avoid deadlock
          setTimeout(() => checkRole(session.user.id), 0);
        } else {
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        checkRole(session.user.id);
      } else {
        setSession(null); // Explicitly set to null when no session
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkRole = async (userId: string) => {
    try {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      const hasAdminRole = roles?.some(r => r.role === "admin" || r.role === "staff") || false;
      setIsAdmin(hasAdminRole);
    } catch (error) {
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Still loading - show spinner
  if (isLoading || session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Session is explicitly null (no session after loading) - redirect to login
  if (session === null) {
    const redirectPath = requireAdmin ? "/admin/login" : "/patient/login";
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Has session but needs admin and isn't admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/patient/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;