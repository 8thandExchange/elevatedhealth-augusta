import { useEffect, useState, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Session } from "@supabase/supabase-js";
import { clearAuthStorage, isSessionValid } from "@/lib/authUtils";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const LOADING_TIMEOUT_MS = 5000; // 5 second timeout

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  // Use undefined to distinguish "not loaded yet" from "no session" (null)
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const location = useLocation();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Timeout fallback - if loading takes too long, assume no valid session
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      if (isLoading || session === undefined) {
        console.warn("ProtectedRoute: Loading timeout reached, clearing auth");
        setLoadingTimedOut(true);
        clearAuthStorage();
        setSession(null);
        setIsLoading(false);
      }
    }, LOADING_TIMEOUT_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        setSession(session);
        if (session?.user) {
          // Defer role check to avoid deadlock
          setTimeout(() => {
            if (isMounted) checkRole(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    );

    // THEN validate the session with the server
    const validateSession = async () => {
      const valid = await isSessionValid();
      
      if (!isMounted) return;
      
      if (valid) {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session?.user) {
          checkRole(session.user.id);
        } else {
          setSession(null);
          setIsLoading(false);
        }
      } else {
        // Invalid session - clear any stale data
        clearAuthStorage();
        setSession(null);
        setIsLoading(false);
      }
    };

    validateSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
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
      // Clear timeout since we finished loading
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  };

  // Still loading - show spinner (with timeout protection)
  if ((isLoading || session === undefined) && !loadingTimedOut) {
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