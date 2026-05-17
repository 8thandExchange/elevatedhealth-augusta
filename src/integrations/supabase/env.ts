/**
 * Validated Supabase env vars.
 *
 * This file is NOT auto-generated and will survive regeneration of
 * `client.ts`. It is the single source of truth for VITE_SUPABASE_URL
 * and VITE_SUPABASE_PUBLISHABLE_KEY: no fallbacks, no silent defaults.
 *
 * If either var is missing at build time we render a friendly in-DOM
 * maintenance message and then throw so nothing downstream silently
 * connects to the wrong project.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (!url || !key) {
  const msg =
    "Configuration error: backend connection is not available. " +
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY at build time. " +
    "Please re-publish the site so environment variables are baked into the bundle.";

  // eslint-disable-next-line no-console
  console.error("[supabase/env]", msg, {
    hasUrl: Boolean(url),
    hasKey: Boolean(key),
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

export const SUPABASE_URL: string = url;
export const SUPABASE_PUBLISHABLE_KEY: string = key;
