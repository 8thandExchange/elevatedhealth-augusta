import { useState, useEffect } from "react";
import { X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CACHE_VERSION } from "@/lib/cacheVersion";

const STORAGE_KEY = "elevated_cache_version_seen";

const CacheRefreshBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has seen this version's banner
    const seenVersion = localStorage.getItem(STORAGE_KEY);
    
    // Show banner if:
    // 1. They've visited before (have a stored version)
    // 2. The stored version is different from current
    if (seenVersion && seenVersion !== CACHE_VERSION) {
      setShowBanner(true);
    }
    
    // Always update stored version for future visits
    localStorage.setItem(STORAGE_KEY, CACHE_VERSION);
  }, []);

  const handleRefresh = async () => {
    // Unregister service workers
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    }
    
    // Clear caches
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    }
    
    // Hard reload
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gold text-white py-2 px-4 shadow-lg animate-fade-in">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <p className="text-sm font-medium flex-1 text-center">
          🎉 We've updated our site! Click refresh to see the latest version.
        </p>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            size="sm"
            variant="secondary"
            className="bg-white text-gold hover:bg-white/90 text-xs h-7 px-3"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh Now
          </Button>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CacheRefreshBanner;