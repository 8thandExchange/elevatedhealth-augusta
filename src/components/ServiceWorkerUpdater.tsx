import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export const ServiceWorkerUpdater = () => {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Only run in production with service workers
    if (!('serviceWorker' in navigator)) return;

    const registerAndCheckUpdates = async () => {
      try {
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

  return null;
};
