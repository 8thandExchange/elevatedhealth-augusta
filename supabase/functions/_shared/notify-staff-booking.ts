import { Resend } from "https://esm.sh/resend@2.0.0";
import { MAIL_FROM } from "./mail-config.ts";

const STAFF_NOTIFICATION_EMAIL =
  Deno.env.get("STAFF_NOTIFICATION_EMAIL") || "appointments@elevatedhealthaugusta.com";

function formatScheduledAt(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  });
  return `${date} at ${time}`;
}

/** Staff alert when a patient confirms a calendar slot (consult or IV). */
export async function notifyStaffNewAppointment(
  resend: Resend,
  opts: {
    patientName: string;
    patientEmail: string | null;
    patientPhone?: string | null;
    serviceLabel: string;
    scheduledAt: string;
    heardAboutUs: string;
    confirmationNumber?: string | null;
  },
): Promise<void> {
  const when = formatScheduledAt(opts.scheduledAt);
  const phoneRow = opts.patientPhone
    ? `<tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#6b7280;">Phone</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#111;">${opts.patientPhone}</td></tr>`
    : "";

  const html = `
<!DOCTYPE html>
<html><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8f9fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
        <tr><td style="background:linear-gradient(135deg,#2C3E50 0%,#34495e 100%);padding:24px 32px;">
          <h1 style="color:#fff;margin:0;font-size:22px;">📅 New appointment booked</h1>
          <p style="color:#C5A059;margin:6px 0 0;font-size:13px;">Elevated Health Augusta</p>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#6b7280;width:160px;">Patient</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#111;font-weight:600;">${opts.patientName}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#6b7280;">Email</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#111;">${opts.patientEmail ?? "—"}</td></tr>
            ${phoneRow}
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#6b7280;">Service</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#111;">${opts.serviceLabel}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#6b7280;">When</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#111;font-weight:600;">${when}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#6b7280;">Heard about us</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#111;">${opts.heardAboutUs}</td></tr>
            ${opts.confirmationNumber ? `<tr><td style="padding:10px 0;color:#6b7280;">Confirmation</td><td style="padding:10px 0;color:#111;">#${opts.confirmationNumber}</td></tr>` : ""}
          </table>
          <div style="margin-top:24px;">
            <a href="https://elevatedhealthaugusta.com/office/schedule" style="display:inline-block;background:#C5A059;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">Open Office Schedule →</a>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  await resend.emails.send({
    from: MAIL_FROM,
    to: [STAFF_NOTIFICATION_EMAIL],
    subject: `📅 Booked: ${opts.patientName} — ${opts.serviceLabel} · ${when}`,
    html,
  });
}
