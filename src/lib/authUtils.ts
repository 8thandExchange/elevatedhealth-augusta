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
 * Force hard refresh - clears all caches, unregisters service workers, and reloads
 * Useful for Firefox and other browsers with aggressive caching
 */
export const forceHardRefresh = async () => {
  // 1. Unregister all service workers
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
      console.log('[AuthUtils] Unregistered all service workers');
    } catch (e) {
      console.error('[AuthUtils] Error unregistering service workers:', e);
    }
  }

  // 2. Clear all caches
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('[AuthUtils] Cleared all caches');
    } catch (e) {
      console.error('[AuthUtils] Error clearing caches:', e);
    }
  }

  // 3. Clear localStorage cache markers
  localStorage.removeItem('app-cache-version');

  // 4. Force hard reload
  window.location.reload();
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

const SESSION_VALIDATION_TIMEOUT_MS = 8000; // 8 second timeout (increased for slow networks)

/**
 * Validates if the current session is actually valid by checking with the server
 * Returns true if session is valid, false otherwise
 * Includes a timeout to prevent hanging on slow/unresponsive network
 */
export const isSessionValid = async (): Promise<boolean> => {
  const timeoutPromise = new Promise<boolean>((resolve) => {
    setTimeout(() => {
      console.warn("[Auth] Session validation timed out");
      resolve(false);
    }, SESSION_VALIDATION_TIMEOUT_MS);
  });

  const validationPromise = (async (): Promise<boolean> => {
    try {
      // First check if we have a session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.log("[Auth] No session found or session error");
        return false;
      }
      
      // Verify the session is actually valid by checking with the server
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.log("[Auth] Session invalid - user verification failed");
        return false;
      }
      
      console.log("[Auth] Session validated successfully");
      return true;
    } catch (error) {
      console.error("[Auth] Session validation error:", error);
      return false;
    }
  })();

  return Promise.race([validationPromise, timeoutPromise]);
};
