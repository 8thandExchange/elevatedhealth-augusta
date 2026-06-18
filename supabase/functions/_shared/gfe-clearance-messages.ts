export const CLINIC_PHONE = "(706) 760-3470";

export function buildGfeLinkMessages(params: {
  firstName: string;
  meetingUrl: string;
}): { emailSubject: string; emailText: string; emailHtml: string; smsBody: string } {
  const { firstName, meetingUrl } = params;
  const emailSubject = "Complete your medical clearance — Elevated Health Augusta";
  const emailText = `Hi ${firstName},

Thank you for completing your $79 wellness assessment with Elevated Health Augusta.

Your remote medical clearance (Good Faith Exam) is included with your visit. Please complete it before your appointment using the secure link below — it typically takes about 5–10 minutes:

${meetingUrl}

You'll connect with a licensed provider who will review your health history and clear you for treatment.

Questions? Call us at ${CLINIC_PHONE}.

Elevated Health Augusta
7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809`;

  const escaped = emailText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      meetingUrl,
      `<a href="${meetingUrl}" style="color:#B8956A;font-weight:600;">Complete medical clearance</a>`,
    )
    .replace(/\n/g, "<br/>");

  const emailHtml =
    `<!DOCTYPE html><html><body style="font-family:Helvetica,Arial,sans-serif;color:#2A2826;line-height:1.6;max-width:560px;">${escaped}</body></html>`;

  const smsBody =
    `Elevated Health Augusta: Complete your included medical clearance before your visit: ${meetingUrl} Questions? ${CLINIC_PHONE}`;

  return { emailSubject, emailText, emailHtml, smsBody };
}
