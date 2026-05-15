const CLINIC_ADDRESS = "7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809";
const CLINIC_PHONE = "(706) 760-3470";

export type IntakeLinkContext = "initial_booking" | "reminder_24h" | "staff_resend";

export function firstNameFromFullName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || "there";
}

export function buildIntakeLinkMessages(params: {
  context: IntakeLinkContext;
  firstName: string;
  magicLinkUrl: string;
  appointmentDate?: string;
  appointmentTime?: string;
}): { emailSubject: string; emailText: string; emailHtml: string; smsBody: string } {
  const { context, firstName, magicLinkUrl, appointmentDate, appointmentTime } = params;

  if (context === "reminder_24h") {
    const when =
      appointmentDate && appointmentTime
        ? `${appointmentDate} at ${appointmentTime}`
        : appointmentDate || "your upcoming visit";
    const emailSubject = "Reminder: complete your intake before tomorrow's appointment";
    const emailText = `Hi ${firstName},

Your Wellness Assessment with Elevated Health Augusta is coming up on ${when}.

Your intake isn't complete yet. Please take a few minutes to finish it before your visit:
${magicLinkUrl}

If you've already completed your intake, you can ignore this message.

See you soon,
The Elevated Health Augusta team`;

    const smsBody =
      `Elevated Health Augusta reminder: please complete your intake before your appointment tomorrow. ${magicLinkUrl}`;

    return {
      emailSubject,
      emailText,
      emailHtml: textToHtml(emailText, magicLinkUrl),
      smsBody,
    };
  }

  if (context === "staff_resend") {
    const emailSubject = "Your Elevated Health Augusta intake link";
    const emailText = `Hi ${firstName},

As requested, here is your intake link:
${magicLinkUrl}

This link will let you complete your intake forms and consents.

Elevated Health Augusta team
${CLINIC_PHONE}`;

    const smsBody = `Elevated Health Augusta: your intake link as requested. ${magicLinkUrl}`;

    return {
      emailSubject,
      emailText,
      emailHtml: textToHtml(emailText, magicLinkUrl),
      smsBody,
    };
  }

  const emailSubject = "Your Elevated Health Augusta intake — start here";
  const emailText = `Hi ${firstName},

Thank you for booking your Wellness Assessment with Elevated Health Augusta.

Before your visit, please take a few minutes to complete your intake. This includes reviewing and signing required consent forms.

Click below to start:
${magicLinkUrl}

This link is unique to you and stays active through the day after your appointment.

See you soon,
The Elevated Health Augusta team
${CLINIC_PHONE}
${CLINIC_ADDRESS}`;

  const smsBody =
    `Elevated Health Augusta: Please complete your intake before your appointment. ${magicLinkUrl} Reply STOP to opt out of SMS.`;

  return {
    emailSubject,
    emailText,
    emailHtml: textToHtml(emailText, magicLinkUrl),
    smsBody,
  };
}

function textToHtml(text: string, linkUrl: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(linkUrl, `<a href="${linkUrl}" style="color:#B8956A;">${linkUrl}</a>`)
    .replace(/\n/g, "<br/>");

  return `<!DOCTYPE html><html><body style="font-family:Helvetica,Arial,sans-serif;color:#2A2826;line-height:1.6;">${escaped}</body></html>`;
}

export async function sendIntakeSms(to: string, body: string): Promise<{ ok: boolean; error?: string }> {
  const accessKey = Deno.env.get("SINCH_ACCESS_KEY");
  const secretKey = Deno.env.get("SINCH_SECRET_KEY");
  if (!accessKey || !secretKey) {
    return { ok: false, error: "Sinch not configured" };
  }

  const digits = to.replace(/\D/g, "");
  const formatted = digits.length === 10 ? `+1${digits}` : digits.length === 11 && digits.startsWith("1") ? `+${digits}` : `+${digits}`;

  const response = await fetch(`https://us.sms.api.sinch.com/xms/v1/${accessKey}/batches`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "ElevatedHealth",
      to: [formatted],
      body,
    }),
  });

  if (!response.ok) {
    return { ok: false, error: await response.text() };
  }
  return { ok: true };
}
