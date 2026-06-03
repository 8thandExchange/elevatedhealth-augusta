/**
 * Meta Pixel loader — public marketing routes only, after cookie consent.
 * Set VITE_META_PIXEL_ID in .env (leave empty to disable).
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

/** Routes where PageView is allowed (no PHI / portal surfaces). */
export const MARKETING_PIXEL_ALLOWLIST = new Set([
  "/",
  "/services",
  "/weight-loss",
  "/weightloss",
  "/hormones",
  "/hormones-women",
  "/hormones-men",
  "/hormone-replacement",
  "/iv-lounge",
  "/peptides",
  "/membership",
  "/about",
  "/pricing",
  "/pricing-comparison",
  "/affordability",
  "/consult",
  "/faq",
  "/privacy-policy",
  "/hipaa-notice",
  "/terms-of-service",
  "/accessibility",
]);

const BLOCKED_PREFIXES = [
  "/patient",
  "/provider",
  "/admin",
  "/office",
  "/intake",
  "/book",
  "/clinical-protocols",
  "/formulary",
  "/staff-",
  "/auth",
  "/symptom-checker",
  "/medication-confirmed",
  "/consultation-confirmed",
  "/payment-success",
  "/reset-password",
  "/_dev",
];

export function isMarketingPixelRoute(pathname: string): boolean {
  const path = pathname.split("?")[0].replace(/\/$/, "") || "/";
  if (BLOCKED_PREFIXES.some((p) => path.startsWith(p))) return false;
  return MARKETING_PIXEL_ALLOWLIST.has(path);
}

export function getMetaPixelId(): string | null {
  const id = import.meta.env.VITE_META_PIXEL_ID?.trim();
  return id && id !== "XXXXXXXXXXXXXXX" ? id : null;
}

let scriptInjected = false;
let initializedPixelId: string | null = null;

type FbqStub = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: FbqStub;
  loaded?: boolean;
  version?: string;
};

export const MARKETING_CONSENT_EVENT = "marketing-cookie-consent";

export function loadMetaPixelScript(): void {
  if (typeof window === "undefined" || scriptInjected) return;
  if (window.fbq) {
    scriptInjected = true;
    return;
  }
  scriptInjected = true;

  const n = function (this: FbqStub, ...args: unknown[]) {
    if (n.callMethod) {
      n.callMethod.apply(n, args);
    } else {
      n.queue.push(args);
    }
  } as FbqStub;

  window.fbq = n;
  if (!window._fbq) window._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];

  const t = document.createElement("script");
  t.async = true;
  t.src = "https://connect.facebook.net/en_US/fbevents.js";
  const s = document.getElementsByTagName("script")[0];
  s?.parentNode?.insertBefore(t, s);
}

export function initMetaPixel(pixelId: string): void {
  if (typeof window === "undefined" || !window.fbq) return;
  if (initializedPixelId === pixelId) return;
  window.fbq("init", pixelId);
  initializedPixelId = pixelId;
}

export function trackMetaPageView(): void {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", "PageView");
}
