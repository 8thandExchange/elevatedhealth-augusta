/** Host + path helpers for calendar.elevatedhealthaugusta.com vs /calendar on main site. */

export const CALENDAR_SUBDOMAIN_HOST = "calendar.elevatedhealthaugusta.com";
export const MAIN_SITE_ORIGIN =
  (import.meta.env.VITE_APP_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "https://elevatedhealthaugusta.com";

/** Internal auth email for shared front-desk login (username: calendar). */
export const CALENDAR_KIOSK_USERNAME = "calendar";
export const CALENDAR_KIOSK_EMAIL = "calendar@elevatedhealthaugusta.com";

export function isCalendarSubdomain(hostname?: string): boolean {
  const host =
    hostname ?? (typeof window !== "undefined" ? window.location.hostname : "");
  if (host === CALENDAR_SUBDOMAIN_HOST) return true;
  if (import.meta.env.DEV && import.meta.env.VITE_CALENDAR_SUBDOMAIN_DEV === "true") {
    return true;
  }
  return false;
}

export function getSchedulePortalHome(): string {
  return isCalendarSubdomain() ? "/" : "/calendar";
}

export function getSchedulePortalLogin(): string {
  return isCalendarSubdomain() ? "/login" : "/calendar/login";
}

/** Map kiosk username or staff email to Supabase auth email. */
export function resolveCalendarLoginEmail(usernameOrEmail: string): string {
  const raw = usernameOrEmail.trim().toLowerCase();
  if (raw === CALENDAR_KIOSK_USERNAME || raw === CALENDAR_KIOSK_EMAIL) {
    return CALENDAR_KIOSK_EMAIL;
  }
  if (raw.includes("@")) return raw;
  throw new Error("Use your staff email, or calendar for the front-desk login.");
}

export function mainSiteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${MAIN_SITE_ORIGIN}${normalized}`;
}
