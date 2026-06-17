/** Dedicated clinic calendar portal — separate from the clinical admin site. */

export {
  CALENDAR_SUBDOMAIN_HOST,
  CALENDAR_KIOSK_USERNAME,
  CALENDAR_KIOSK_EMAIL,
  MAIN_SITE_ORIGIN,
  isCalendarSubdomain,
  getSchedulePortalHome,
  getSchedulePortalLogin,
  resolveCalendarLoginEmail,
  mainSiteUrl,
} from "@/lib/schedulePortalHost";

/** @deprecated Use getSchedulePortalHome() */
export const SCHEDULE_PORTAL_HOME = "/calendar";
/** @deprecated Use getSchedulePortalLogin() */
export const SCHEDULE_PORTAL_LOGIN = "/calendar/login";

export const SCHEDULE_PORTAL_LEGACY_PATHS = ["/schedule", "/office/schedule", "/provider/schedule"] as const;
