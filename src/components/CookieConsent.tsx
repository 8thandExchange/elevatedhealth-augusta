import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { MARKETING_CONSENT_EVENT } from "@/lib/marketingPixel";

const CONSENT_KEY = "cookie_consent";
const CONSENT_EXPIRY_DAYS = 365;

type ConsentStatus = "accepted" | "declined" | null;

/** Used by marketing analytics loaders (Meta Pixel, GA4) — Task C. */
export function getMarketingCookieConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { status?: ConsentStatus; expiry?: string };
    if (parsed.status !== "accepted") return false;
    if (parsed.expiry && new Date(parsed.expiry).getTime() < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Longer delay - let users see the page first
      const timer = setTimeout(() => {
        setShowBanner(true);
        requestAnimationFrame(() => setIsVisible(true));
      }, 2500);
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

    if (status === "accepted") {
      window.dispatchEvent(new Event(MARKETING_CONSENT_EVENT));
    }

    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 200);
  }, []);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 200);
  }, []);

  if (!showBanner) return null;

  return (
    <div 
      className={`fixed bottom-3 left-3 z-50 transition-all duration-200 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
      }`}
      aria-hidden={!isVisible}
    >
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/70 backdrop-blur-sm shadow-md">
        <span className="text-xs text-background/80 font-lato">
          Cookies
        </span>
        <button
          type="button"
          onClick={() => handleConsent("accepted")}
          className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          OK
        </button>
        <a
          href="/privacy-policy#cookies"
          className="text-[10px] text-background/40 hover:text-background/60 transition-colors"
        >
          Info
        </a>
        <button
          type="button"
          onClick={handleDismiss}
          className="p-0.5 text-background/30 hover:text-background/50 transition-colors"
          aria-label="Close cookie banner"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
