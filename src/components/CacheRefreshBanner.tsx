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
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-md w-[calc(100%-2rem)] bg-foreground/95 text-background py-2.5 px-4 rounded-sm shadow-lg backdrop-blur-md animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-jost flex-1">
          Site updated — refresh for the latest version.
        </p>
        <div className="flex items-center gap-1">
          <Button
            onClick={handleRefresh}
            size="sm"
            variant="ghost"
            className="text-background hover:bg-background/10 hover:text-background text-xs h-7 px-2 rounded-sm"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-background/10 rounded-sm transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CacheRefreshBanner;