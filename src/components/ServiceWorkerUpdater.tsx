import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CACHE_VERSION } from '@/lib/cacheVersion';

// Detect Firefox browser
const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('firefox');

// Clear all caches aggressively
const clearAllCaches = async () => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('[SW Updater] Cleared all caches:', cacheNames);
      return true;
    } catch (e) {
      console.error('[SW Updater] Error clearing caches:', e);
      return false;
    }
  }
  return false;
};

// Unregister all service workers
const unregisterAllServiceWorkers = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
      console.log('[SW Updater] Unregistered all service workers');
      return true;
    } catch (e) {
      console.error('[SW Updater] Error unregistering service workers:', e);
      return false;
    }
  }
  return false;
};

// Force hard refresh - exported for external use
export const forceHardRefresh = async () => {
  await clearAllCaches();
  await unregisterAllServiceWorkers();
  localStorage.removeItem('app-cache-version');
  window.location.reload();
};

export const ServiceWorkerUpdater = () => {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [showForceRefresh, setShowForceRefresh] = useState(false);

  // Version check on mount - clear caches if version mismatch
  useEffect(() => {
    const checkVersion = async () => {
      const storedVersion = localStorage.getItem('app-cache-version');
      
      if (storedVersion !== CACHE_VERSION) {
        console.log(`[SW Updater] Version mismatch: ${storedVersion} → ${CACHE_VERSION}`);
        
        console.log("[SW Updater] Clearing stale caches and service workers");
        await clearAllCaches();
        await unregisterAllServiceWorkers();
        localStorage.setItem("app-cache-version", CACHE_VERSION);

        if (storedVersion) {
          window.location.reload();
          return;
        }
      }
    };
    
    checkVersion();
  }, []);

  // Firefox-specific: Show force refresh option after 10 seconds if issues persist
  useEffect(() => {
    if (isFirefox) {
      const timer = setTimeout(() => {
        setShowForceRefresh(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Only run in production with service workers
    if (!('serviceWorker' in navigator)) return;

    const registerAndCheckUpdates = async () => {
      try {
        // For Firefox, clear caches before registering
        if (isFirefox) {
          await clearAllCaches();
        }
        
        const reg = await navigator.serviceWorker.ready;
        setRegistration(reg);

        // Check for updates every 60 seconds
        const interval = setInterval(() => {
          reg.update().catch(console.error);
        }, 60 * 1000);

        return () => clearInterval(interval);
      } catch (error) {
        console.error('SW registration error', error);
      }
    };

    registerAndCheckUpdates();

    // Listen for new service worker installations
    const handleControllerChange = () => {
      toast.info('App updated!', {
        description: 'Refreshing to load the latest version...',
        duration: 2000,
      });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  useEffect(() => {
    if (!registration) return;

    const handleUpdateFound = () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New version available, show toast
          toast.info('New version available', {
            description: 'Click to update now',
            duration: Infinity,
            action: {
              label: 'Update',
              onClick: () => {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              },
            },
          });
        }
      });
    };

    registration.addEventListener('updatefound', handleUpdateFound);
    return () => registration.removeEventListener('updatefound', handleUpdateFound);
  }, [registration]);

  // Show force refresh toast for Firefox users after delay
  useEffect(() => {
    if (showForceRefresh && isFirefox) {
      toast.info('Having display issues?', {
        description: 'Click to force refresh the app',
        duration: 15000,
        action: {
          label: 'Force Refresh',
          onClick: forceHardRefresh,
        },
      });
    }
  }, [showForceRefresh]);

  return null;
};
