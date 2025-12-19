import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { IdleWarningModal } from "@/components/auth/IdleWarningModal";
import { clearAuthStorage, clearServiceWorkerCache } from "@/lib/authUtils";

interface SessionSecurityContextType {
  resetIdleTimer: () => void;
  isIdle: boolean;
  remainingTime: number;
}

const SessionSecurityContext = createContext<SessionSecurityContextType | null>(null);

// Configuration
const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_DURATION_MS = 60 * 1000; // 60 seconds warning

interface SessionSecurityProviderProps {
  children: ReactNode;
}

export const SessionSecurityProvider = ({ children }: SessionSecurityProviderProps) => {
  const [isIdle, setIsIdle] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(WARNING_DURATION_MS / 1000);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Force clear storage
      clearAuthStorage();
      
      // Clear service worker cache
      await clearServiceWorkerCache();
      
      window.location.href = '/patient/login';
    }
  }, []);

  const resetIdleTimer = useCallback(() => {
    setLastActivity(Date.now());
    setIsIdle(false);
    setShowWarning(false);
    setRemainingTime(WARNING_DURATION_MS / 1000);
  }, []);

  const handleStayLoggedIn = useCallback(() => {
    resetIdleTimer();
  }, [resetIdleTimer]);

  // Activity detection
  useEffect(() => {
    const activityEvents = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    
    const handleActivity = () => {
      if (!showWarning) {
        setLastActivity(Date.now());
      }
    };

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [showWarning]);

  // Idle detection timer
  useEffect(() => {
    const checkIdleInterval = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivity;
      
      if (timeSinceActivity >= IDLE_TIMEOUT_MS && !showWarning) {
        setIsIdle(true);
        setShowWarning(true);
        setRemainingTime(WARNING_DURATION_MS / 1000);
      }
    }, 1000);

    return () => clearInterval(checkIdleInterval);
  }, [lastActivity, showWarning]);

  // Warning countdown
  useEffect(() => {
    if (!showWarning) return;

    const countdownInterval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [showWarning, handleLogout]);

  // Tab visibility detection - only check session validity when returning
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !showWarning) {
        // User returned to tab - check if session is still valid
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session) {
            window.location.href = '/patient/login';
          }
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [showWarning]);

  return (
    <SessionSecurityContext.Provider value={{ resetIdleTimer, isIdle, remainingTime }}>
      {children}
      <IdleWarningModal
        isOpen={showWarning}
        remainingTime={remainingTime}
        onStayLoggedIn={handleStayLoggedIn}
        onLogout={handleLogout}
      />
    </SessionSecurityContext.Provider>
  );
};

export const useSessionSecurity = () => {
  const context = useContext(SessionSecurityContext);
  if (!context) {
    throw new Error("useSessionSecurity must be used within a SessionSecurityProvider");
  }
  return context;
};
