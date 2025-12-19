import { supabase } from "@/integrations/supabase/client";

/**
 * Clears all Supabase auth-related data from localStorage and sessionStorage
 */
export const clearAuthStorage = () => {
  try {
    // Clear Supabase auth tokens from localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('sb-') && key.includes('-auth-')) {
        localStorage.removeItem(key);
      }
    });
    // Clear sessionStorage
    sessionStorage.clear();
  } catch (e) {
    console.error("Error clearing auth storage:", e);
  }
};

/**
 * Clears service worker caches to prevent stale auth state
 */
export const clearServiceWorkerCache = async () => {
  if ('serviceWorker' in navigator && 'caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    } catch (e) {
      console.error("Error clearing service worker cache:", e);
    }
  }
};

/**
 * Force logout - clears all session data and redirects to login
 */
export const forceLogout = async (redirectPath = '/patient/login') => {
  try {
    // Attempt signOut with local scope
    await supabase.auth.signOut({ scope: 'local' });
  } catch (error) {
    console.error("SignOut error:", error);
  }
  
  // Clear all storage
  clearAuthStorage();
  
  // Clear service worker cache
  await clearServiceWorkerCache();
  
  // Force hard navigation
  window.location.href = redirectPath;
};

/**
 * Validates if the current session is actually valid by checking with the server
 * Returns true if session is valid, false otherwise
 */
export const isSessionValid = async (): Promise<boolean> => {
  try {
    // First check if we have a session token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return false;
    }
    
    // Verify the session is actually valid by checking with the server
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Session validation error:", error);
    return false;
  }
};
