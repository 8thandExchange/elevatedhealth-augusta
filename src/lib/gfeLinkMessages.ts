/** Keep in sync with supabase/functions/_shared/gfe-clearance-messages.ts */

const CLINIC_PHONE = "(706) 760-3470";

export const GFE_LINK_PLACEHOLDER =
  "https://elevatedhealthaugusta.com/… (Qualiphy secure link generated at send time)";

export function buildGfeLinkMessages(params: {
  firstName: string;
  meetingUrl: string;
}): { emailSubject: string; emailText: string; smsBody: string } {
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

  const smsBody = `Elevated Health Augusta: Complete your included medical clearance before your visit: ${meetingUrl} Questions? ${CLINIC_PHONE}`;

  return { emailSubject, emailText, smsBody };
}
