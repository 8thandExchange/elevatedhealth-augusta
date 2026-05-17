// Supabase browser client. Configured from Vite env vars at build time.
// If env vars are missing, the guard block below fails loudly with a
// user-facing error UI rather than silently connecting to a wrong/old
// project. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
// in .env.local (dev) and your hosting provider's env config (prod).
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  // Fail loudly in the UI instead of throwing inside createClient(),
  // which would abort the App import chain and leave a blank cream page.
  const msg =
    "Configuration error: backend connection is not available. " +
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY at build time. " +
    "Please re-publish the site so environment variables are baked into the bundle.";

  // eslint-disable-next-line no-console
  console.error("[supabase/client]", msg, {
    hasUrl: Boolean(SUPABASE_URL),
    hasKey: Boolean(SUPABASE_PUBLISHABLE_KEY),
  });

  if (typeof document !== "undefined") {
    const render = () => {
      const root = document.getElementById("root");
      if (!root) return;
      root.innerHTML = `
        <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui,-apple-system,sans-serif;background:#f7f4ef;color:#0f1f3d;">
          <div style="max-width:520px;text-align:center;">
            <h1 style="font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:28px;margin:0 0 12px;">We're updating the site</h1>
            <p style="font-size:15px;line-height:1.6;margin:0 0 16px;color:#4a4a4a;">
              Our booking system is briefly unavailable while we deploy a configuration update.
              Please try again in a few minutes.
            </p>
            <p style="font-size:14px;color:#4a4a4a;margin:0;">
              Need care now? Call <a href="tel:+17067603470" style="color:#0f1f3d;font-weight:600;">(706) 760-3470</a>.
            </p>
          </div>
        </div>
      `;
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", render);
    } else {
      render();
    }
  }
  throw new Error(msg);
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
