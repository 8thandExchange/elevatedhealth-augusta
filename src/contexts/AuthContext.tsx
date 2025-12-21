import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  isProvider: boolean;
  userName: string | null;
  userAvatar: string | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProvider, setIsProvider] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const fetchUserDetails = async (userId: string, userEmail: string | undefined) => {
    try {
      console.log('[AuthContext] Fetching user details for:', userId);
      
      // Check if user is a provider (admin or staff)
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      
      if (rolesError) {
        console.error('[AuthContext] Error fetching roles:', rolesError);
      }
      
      const hasProviderRole = roles?.some(r => r.role === "admin" || r.role === "staff" || r.role === "business_admin");
      setIsProvider(hasProviderRole || false);
      console.log('[AuthContext] Is provider:', hasProviderRole);
      
      if (!hasProviderRole) {
        // Try to get patient name and avatar
        const { data: patient, error: patientError } = await supabase
          .from("patients")
          .select("full_name, avatar_url")
          .eq("user_id", userId)
          .maybeSingle();
        
        if (patientError) {
          console.error('[AuthContext] Error fetching patient:', patientError);
        }
        
        setUserName(patient?.full_name || null);
        setUserAvatar(patient?.avatar_url || null);
        console.log('[AuthContext] Patient name:', patient?.full_name);
      } else {
        // For providers, use email as display name
        setUserName(userEmail?.split("@")[0] || "Provider");
        setUserAvatar(null);
      }
    } catch (error) {
      console.error('[AuthContext] Error in fetchUserDetails:', error);
      // Reset to safe defaults on error
      setIsProvider(false);
      setUserName(null);
      setUserAvatar(null);
    }
  };

  const clearAuthState = () => {
    setUser(null);
    setSession(null);
    setUserName(null);
    setUserAvatar(null);
    setIsProvider(false);
  };

  useEffect(() => {
    console.log('[AuthContext] Initializing auth state listener');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthContext] Auth state changed:', event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_OUT') {
        console.log('[AuthContext] User signed out');
        clearAuthState();
        return;
      }
      
      if (session?.user) {
        // Defer Supabase calls to avoid deadlock
        setTimeout(() => {
          fetchUserDetails(session.user.id, session.user.email);
        }, 0);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AuthContext] Initial session check:', session?.user?.email || 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserDetails(session.user.id, session.user.email).finally(() => {
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    clearAuthState();
    
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (error) {
      console.error("SignOut error:", error);
    }
    
    // Clear all auth-related storage
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('sb-') && key.includes('-auth-')) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();
      
      if ('serviceWorker' in navigator && 'caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
    } catch (e) {
      console.error("Storage clear error:", e);
    }
    
    toast.success("Logged out successfully");
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      isLoggedIn: !!user,
      isProvider,
      userName,
      userAvatar,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
