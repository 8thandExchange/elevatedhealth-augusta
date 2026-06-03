import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getMarketingCookieConsent } from "@/components/CookieConsent";
import {
  getMetaPixelId,
  initMetaPixel,
  isMarketingPixelRoute,
  loadMetaPixelScript,
  MARKETING_CONSENT_EVENT,
  trackMetaPageView,
} from "@/lib/marketingPixel";

/**
 * Loads Meta Pixel only when VITE_META_PIXEL_ID is set, cookie consent is accepted,
 * and the current route is on the public marketing allowlist.
 */
export default function MarketingPixel() {
  const { pathname } = useLocation();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    const maybeLoad = () => {
      const pixelId = getMetaPixelId();
      if (!pixelId || !getMarketingCookieConsent()) return;
      if (!isMarketingPixelRoute(pathname)) return;

      loadMetaPixelScript();
      initMetaPixel(pixelId);

      if (lastTrackedPath.current !== pathname) {
        trackMetaPageView();
        lastTrackedPath.current = pathname;
      }
    };

    maybeLoad();

    const onConsent = () => maybeLoad();
    window.addEventListener(MARKETING_CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(MARKETING_CONSENT_EVENT, onConsent);
  }, [pathname]);

  return null;
}
