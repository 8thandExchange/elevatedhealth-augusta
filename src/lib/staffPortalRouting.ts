/** Post-login destinations for staff portal (/admin/login). */
const OFFICE_MANAGER_EMAILS = ["kcovington@pmrehab.net"];

/** Clinical staff who primarily need the visual scheduler (not buried dashboard tabs). */
const SCHEDULE_FIRST_EMAILS = ["caroline@elevatedhealthaugusta.com"];

export function getStaffPortalLoginPath(email: string | undefined): string {
  const normalized = email?.toLowerCase() || "";
  if (OFFICE_MANAGER_EMAILS.includes(normalized)) return "/office/dashboard";
  if (SCHEDULE_FIRST_EMAILS.includes(normalized)) return "/provider/schedule";
  return "/provider/dashboard";
}
