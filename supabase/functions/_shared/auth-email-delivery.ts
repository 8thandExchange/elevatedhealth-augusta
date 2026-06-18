/** Deliver Supabase auth links via Resend (avoids Supabase built-in email rate limits). */

export const AUTH_EMAIL_FROM = "Elevated Health Augusta <noreply@elevatedhealthaugusta.com>";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildAuthActionLink(
  supabaseUrl: string,
  properties: Record<string, unknown> | undefined,
  redirectTo: string,
  fallbackType: "magiclink" | "recovery" | "invite",
): string | null {
  if (!properties) return null;
  const actionLink = properties.action_link;
  if (typeof actionLink === "string" && actionLink.length > 0) {
    return actionLink;
  }
  const hashedToken = properties.hashed_token;
  if (typeof hashedToken === "string" && hashedToken.length > 0) {
    const base = supabaseUrl.replace(/\/$/, "");
    return `${base}/auth/v1/verify?token=${encodeURIComponent(hashedToken)}&type=${fallbackType}&redirect_to=${encodeURIComponent(redirectTo)}`;
  }
  return null;
}

type RateBucket = { count: number; resetTime: number };

export class AuthEmailRateLimiter {
  private ipMap = new Map<string, RateBucket>();
  private emailMap = new Map<string, RateBucket>();

  constructor(
    private windowMs: number,
    private maxPerIp: number,
    private maxPerEmail: number,
  ) {}

  private check(map: Map<string, RateBucket>, key: string, max: number): boolean {
    const now = Date.now();
    if (map.size > 2000) {
      for (const [k, v] of map.entries()) {
        if (now > v.resetTime) map.delete(k);
      }
    }
    const record = map.get(key);
    if (!record || now > record.resetTime) {
      map.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    if (record.count >= max) return false;
    record.count++;
    return true;
  }

  allowed(clientIp: string, email: string): boolean {
    const ipOk = this.check(this.ipMap, clientIp, this.maxPerIp);
    const emailOk = this.check(this.emailMap, email.toLowerCase(), this.maxPerEmail);
    return ipOk && emailOk;
  }
}

export const publicAuthEmailLimiter = new AuthEmailRateLimiter(
  15 * 60 * 1000,
  12,
  5,
);

export function brandedAuthEmailHtml(args: {
  headline: string;
  bodyHtml: string;
  ctaLabel: string;
  actionLink: string;
}): string {
  const { headline, bodyHtml, ctaLabel, actionLink } = args;
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F2EBDC;font-family:Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2EBDC;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:8px;overflow:hidden;">
        <tr><td style="background:#2A2826;padding:28px 32px;">
          <p style="margin:0;color:#B8956A;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Elevated Health Augusta</p>
          <h1 style="margin:8px 0 0;color:#F2EBDC;font-size:24px;font-weight:400;">${escapeHtml(headline)}</h1>
        </td></tr>
        <tr><td style="padding:32px;color:#2A2826;font-size:15px;line-height:1.6;">
          ${bodyHtml}
          <p style="margin:24px 0;">
            <a href="${escapeHtml(actionLink)}" style="display:inline-block;background:#B8956A;color:#2A2826;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:600;">${escapeHtml(ctaLabel)}</a>
          </p>
          <p style="font-size:13px;color:#666;">This link expires in 24 hours. If you did not request it, you can ignore this email.</p>
          <p style="font-size:12px;color:#999;word-break:break-all;">Or copy this link:<br>${escapeHtml(actionLink)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function clientIpFromRequest(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}
