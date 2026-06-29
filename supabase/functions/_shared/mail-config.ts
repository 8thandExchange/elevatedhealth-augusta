/** Single source of truth for Resend sender address (override via Supabase secret). */
export const MAIL_FROM =
  Deno.env.get("RESEND_FROM_EMAIL")?.trim() ||
  "Elevated Health Augusta <noreply@elevatedhealthaugusta.com>";

/** Back-compat alias for auth email importers. */
export const AUTH_EMAIL_FROM = MAIL_FROM;
