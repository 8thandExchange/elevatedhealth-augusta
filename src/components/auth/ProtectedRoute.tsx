import { useEffect, useState, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { clearAuthStorage, isSessionValid } from "@/lib/authUtils";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const LOADING_TIMEOUT_MS = 10000; // 10 second timeout (increased for slow networks)

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { isLoading: authLoading, isLoggedIn, isProvider, session } = useAuth();
  const [isValidating, setIsValidating] = useState(true);
  const [isSessionValidated, setIsSessionValidated] = useState(false);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const location = useLocation();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Timeout fallback - if loading takes too long, assume no valid session
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      if (isValidating && !isSessionValidated) {
        console.warn("ProtectedRoute: Loading timeout reached, clearing auth");
        setLoadingTimedOut(true);
        clearAuthStorage();
        setIsValidating(false);
      }
    }, LOADING_TIMEOUT_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Validate session with server when auth context is ready
  useEffect(() => {
    if (authLoading) return;
    
    const validateSession = async () => {
      if (!isLoggedIn) {
        setIsValidating(false);
        setIsSessionValidated(false);
        return;
      }
      
      const valid = await isSessionValid();
      
      if (!valid) {
        clearAuthStorage();
        setIsSessionValidated(false);
      } else {
        setIsSessionValidated(true);
      }
      
      setIsValidating(false);
      
      // Clear timeout since we finished loading
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    validateSession();
  }, [authLoading, isLoggedIn]);

  // Still loading - show spinner (with timeout protection)
  if ((authLoading || isValidating) && !loadingTimedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // No valid session - redirect to login
  if (!isLoggedIn || !isSessionValidated) {
    const redirectPath = requireAdmin ? "/admin/login" : "/patient/login";
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Has session but needs admin and isn't admin/provider
  if (requireAdmin && !isProvider) {
    return <Navigate to="/patient/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;