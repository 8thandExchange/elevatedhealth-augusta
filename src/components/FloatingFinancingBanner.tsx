import { useState, useEffect } from "react";
import { CreditCard, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { isCalendarSubdomain } from "@/lib/schedulePortalHost";

const FloatingFinancingBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const location = useLocation();

  // Pages where the banner should NOT appear
  const excludedPaths = [
    "/patient",
    "/provider",
    "/admin",
    "/office",
    "/calendar",
    "/auth",
    "/login"
  ];

  const shouldShowOnPage = !isCalendarSubdomain()
    && !excludedPaths.some(path => location.pathname.startsWith(path));

  useEffect(() => {
    // Check if user dismissed in this session
    const dismissed = sessionStorage.getItem("financing-banner-dismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    const handleScroll = () => {
      // Show after scrolling 400px
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("financing-banner-dismissed", "true");
  };

  if (!shouldShowOnPage || isDismissed || !isVisible) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div className="bg-foreground/95 backdrop-blur-md text-background px-4 py-2.5 rounded-full shadow-lg flex items-center gap-3 border border-primary-foreground/20">
        <CreditCard className="w-4 h-4 text-accent-light shrink-0" />
        
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Pay in 4</span>
          <span className="text-background/60">with</span>
          <span className="font-bold text-[#E91E8A]">Klarna</span>
          <span className="text-background/40">or</span>
          <span className="font-bold text-[#0FA0EA]">Affirm</span>
        </div>

        <button
          onClick={handleDismiss}
          className="ml-1 p-1 hover:bg-background/10 rounded-full transition-colors"
          aria-label="Dismiss financing banner"
        >
          <X className="w-3.5 h-3.5 text-background/60" />
        </button>
      </div>
    </div>
  );
};

export default FloatingFinancingBanner;
