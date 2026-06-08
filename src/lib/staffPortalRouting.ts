/** Post-login destinations for staff portal (/admin/login). */
const OFFICE_MANAGER_EMAILS = ["kcovington@pmrehab.net"];

/** Business partner — revenue/ops home, not clinical chart. */
const BUSINESS_ADMIN_EMAILS = ["drdwmd@pmrehab.net"];

/** Clinical staff who primarily need the visual scheduler (not buried dashboard tabs). */
const SCHEDULE_FIRST_EMAILS = ["caroline@elevatedhealthaugusta.com"];

const SAFE_REDIRECT_PREFIXES = [
  "/office/",
  "/admin/",
  "/provider/",
  "/schedule",
  "/inventory",
  "/formulary",
  "/clinical-protocols",
];

/** Validate ?next= redirect targets (staff-only internal paths). */
export function getSafeStaffRedirect(path: string | null | undefined): string | null {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return null;
  if (SAFE_REDIRECT_PREFIXES.some((p) => path === p || path.startsWith(p))) return path;
  return null;
}

export function getStaffPortalLoginPath(email: string | undefined): string {
  const normalized = email?.toLowerCase() || "";
  if (BUSINESS_ADMIN_EMAILS.includes(normalized)) return "/admin/business";
  if (OFFICE_MANAGER_EMAILS.includes(normalized)) return "/office/dashboard";
  if (SCHEDULE_FIRST_EMAILS.includes(normalized)) return "/office/schedule";
  return "/provider/dashboard";
}

/** Label for the primary “back” button in staff nav. */
export function getStaffHomeLabel(email: string | undefined): string {
  const normalized = email?.toLowerCase() || "";
  if (BUSINESS_ADMIN_EMAILS.includes(normalized)) return "Business Dashboard";
  if (OFFICE_MANAGER_EMAILS.includes(normalized)) return "Office Dashboard";
  if (SCHEDULE_FIRST_EMAILS.includes(normalized)) return "My Dashboard";
  return "Provider Dashboard";
}
