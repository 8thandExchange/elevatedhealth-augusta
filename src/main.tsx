import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { assertPricingInvariants } from "./lib/pricing";

if (import.meta.env.DEV) {
  assertPricingInvariants();
}

// Remove legacy PWA caches that pinned old Lovable UI bundles (IV menu icons, etc.).
if (import.meta.env.PROD && typeof window !== "undefined") {
  void (async () => {
    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((reg) => reg.unregister()));
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
    } catch {
      // Non-fatal — page should still load
    }
  })();
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
