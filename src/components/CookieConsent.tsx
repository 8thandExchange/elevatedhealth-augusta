import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";

const CONSENT_KEY = "cookie_consent";
const CONSENT_EXPIRY_DAYS = 365;

type ConsentStatus = "accepted" | "declined" | null;

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
        // Trigger animation after mount
        requestAnimationFrame(() => setIsVisible(true));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = useCallback((status: ConsentStatus) => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + CONSENT_EXPIRY_DAYS);
    
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      status,
      expiry: expiryDate.toISOString()
    }));

    // If accepted, you could initialize analytics here
    if (status === "accepted") {
      console.log("Cookie consent accepted - analytics enabled");
    }

    // Animate out then remove from DOM
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  }, []);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  }, []);

  if (!showBanner) return null;

  return (
    <div 
      className={`fixed bottom-4 left-4 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
      aria-hidden={!isVisible}
    >
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-foreground/80 backdrop-blur-md border border-border/20 shadow-lg">
        <span className="text-sm text-background/90 font-lato">
          We use cookies
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleConsent("accepted")}
            className="px-3 py-1 text-xs font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Accept
          </button>
          <a
            href="/privacy-policy#cookies"
            className="text-xs text-background/50 hover:text-background/80 transition-colors"
          >
            Manage
          </a>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-0.5 text-background/40 hover:text-background/70 transition-colors"
            aria-label="Close cookie banner"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
