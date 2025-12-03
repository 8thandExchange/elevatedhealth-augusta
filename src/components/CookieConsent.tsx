import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const CONSENT_KEY = "cookie_consent";
const CONSENT_EXPIRY_DAYS = 365;

type ConsentStatus = "accepted" | "declined" | null;

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (status: ConsentStatus) => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + CONSENT_EXPIRY_DAYS);
    
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      status,
      expiry: expiryDate.toISOString()
    }));

    // If accepted, you could initialize analytics here
    if (status === "accepted") {
      // Analytics initialization would go here
      console.log("Cookie consent accepted - analytics enabled");
    }

    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5 duration-500">
      <div className="max-w-4xl mx-auto bg-foreground text-background rounded-lg shadow-2xl border border-background/10">
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-playfair text-lg font-medium mb-2">
                We Value Your Privacy
              </h3>
              <p className="text-sm text-background/70 font-lato leading-relaxed">
                We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                By clicking "Accept All," you consent to our use of cookies. You can manage your preferences or 
                decline non-essential cookies.{" "}
                <a 
                  href="/privacy-policy" 
                  className="text-primary-light hover:underline"
                >
                  Learn more
                </a>
              </p>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="text-background/50 hover:text-background transition-colors p-1"
              aria-label="Close cookie banner"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button
              onClick={() => handleConsent("accepted")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-lato"
            >
              Accept All
            </Button>
            <Button
              onClick={() => handleConsent("declined")}
              variant="ghost"
              className="border border-white/40 text-white bg-transparent hover:bg-white/10 font-lato"
            >
              Decline Non-Essential
            </Button>
            <a
              href="/privacy-policy#cookies"
              className="inline-flex items-center justify-center text-sm text-background/60 hover:text-background transition-colors font-lato underline-offset-4 hover:underline px-4 py-2"
            >
              Cookie Settings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
