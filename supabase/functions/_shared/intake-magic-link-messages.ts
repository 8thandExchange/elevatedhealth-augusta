const CLINIC_ADDRESS = "7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809";
const CLINIC_PHONE = "(706) 760-3470";

/** Labels aligned with consent catalog types — edge-safe duplicates for messaging only */
export function intakeConsentTypeDisplayLabel(type: string): string {
  const labels: Record<string, string> = {
    terms_of_service: "Terms of Service",
    hipaa_acknowledgment: "HIPAA Acknowledgment",
    general_medical_treatment: "General Medical Treatment",
    telehealth: "Telehealth",
    communication: "Communication Preferences",
    hormone_therapy: "Hormone Therapy",
    glp1: "GLP-1 / Weight Management",
    off_label: "Off-Label Treatment",
    research_peptide: "Research Peptide",
    notice_of_privacy_practices: "Notice of Privacy Practices",
  };
  return labels[type] ?? type;
}

export type IntakeLinkContext =
  | "initial_booking"
  | "reminder_24h"
  | "staff_resend"
  | "tier2_consent_request"
  | "consent_expiration_reminder"
  | "reconsent_request"
  | "reconsent_reminder"
  | "substance_acknowledgment_request";

export function firstNameFromFullName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || "there";
}

export function buildIntakeLinkMessages(params: {
  context: IntakeLinkContext;
  firstName: string;
  magicLinkUrl: string;
  appointmentDate?: string;
  appointmentTime?: string;
  consentDocumentLabels?: string[];
  expirationReminder?: {
    consentLabel: string;
    expiryFormatted: string;
    daysRemaining: number;
  };
  /** Re-consent reminder batch — deadline-focused wording */
  reconsentReminder?: {
    consentLabel: string;
    deadlineFormatted: string;
    daysRemaining: number;
  };
  substanceLabel?: string;
}): { emailSubject: string; emailText: string; emailHtml: string; smsBody: string } {
  const {
    context,
    firstName,
    magicLinkUrl,
    appointmentDate,
    appointmentTime,
    consentDocumentLabels,
    expirationReminder,
    reconsentReminder,
    substanceLabel,
  } = params;

  if (context === "tier2_consent_request") {
    const bullets =
      (consentDocumentLabels && consentDocumentLabels.length > 0
        ? consentDocumentLabels.map((l) => `- ${l}`).join("\n")
        : "- Your clinician-listed consent documents");

    const emailSubject = "Action needed: sign your treatment consent at Elevated Health Augusta";
    const emailText = `Hi ${firstName},

Your clinician at Elevated Health Augusta is ready to prescribe your treatment, but we need your signed consent first.

Please review and sign the following consent(s):
${bullets}

This usually takes 5-10 minutes. Click below to start:
${magicLinkUrl}

Once you've signed, your clinician can complete your prescription.

Questions? Call us at ${CLINIC_PHONE}.

Elevated Health Augusta team`;

    const smsBody =
      `Elevated Health Augusta: Please sign your treatment consent so we can complete your prescription. ${magicLinkUrl} Reply STOP to opt out.`;

    return {
      emailSubject,
      emailText,
      emailHtml: textToHtml(emailText, magicLinkUrl),
      smsBody,
    };
  }

  if (context === "reconsent_request") {
    const label =
      (consentDocumentLabels && consentDocumentLabels.length > 0
        ? consentDocumentLabels[0]
        : "treatment");

    const emailSubject = "Updated consent required — Elevated Health Augusta";
    const emailText = `Hi ${firstName},

We've updated our ${label} consent document. To continue your treatment, please re-sign the updated version.

This usually takes 3-5 minutes. Click below to start:
${magicLinkUrl}

Your current treatment is not interrupted while you re-sign. However, your next prescription refill or new prescription will require the updated signature.

You have 30 days from today to complete this re-signature before any treatment activity is blocked.

Questions? Call us at ${CLINIC_PHONE}.

Elevated Health Augusta team`;

    const smsBody =
      `Elevated Health Augusta: We've updated your ${label} consent. Please re-sign so we can continue your care: ${magicLinkUrl} Reply STOP to opt out.`;

    return {
      emailSubject,
      emailText,
      emailHtml: textToHtml(emailText, magicLinkUrl),
      smsBody,
    };
  }

  if (context === "reconsent_reminder" && reconsentReminder) {
    const { consentLabel, deadlineFormatted, daysRemaining } = reconsentReminder;
    const emailSubject = `Reminder: updated ${consentLabel} consent — ${daysRemaining} days remaining`;
    const emailText = `Hi ${firstName},

This is a friendly reminder to sign our updated ${consentLabel} consent document.

Deadline: ${deadlineFormatted} (${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining).

Please complete your updated consent here:
${magicLinkUrl}

Your current prescriptions stay active while this is pending; the updated signature is required before your next prescription decision.

Questions? Call us at ${CLINIC_PHONE}.

Elevated Health Augusta team`;

    const smsBody =
      `Elevated Health Augusta: Reminder — updated ${consentLabel} consent due in ${daysRemaining} days. ${magicLinkUrl} Reply STOP to opt out.`;

    return {
      emailSubject,
      emailText,
      emailHtml: textToHtml(emailText, magicLinkUrl),
      smsBody,
    };
  }

  if (context === "substance_acknowledgment_request") {
    const label = substanceLabel ?? "a formulary substance";
    const emailSubject = "Acknowledgment needed — Elevated Health Augusta";
    const emailText = `Hi ${firstName},

Before we prescribe ${label}, please review and sign a brief formulary acknowledgment:
${magicLinkUrl}

This takes about two minutes.

Questions? Call us at ${CLINIC_PHONE}.

Elevated Health Augusta team`;

    const smsBody =
      `Elevated Health Augusta: Acknowledgment needed before prescribing ${label}. ${magicLinkUrl} Reply STOP to opt out.`;

    return {
      emailSubject,
      emailText,
      emailHtml: textToHtml(emailText, magicLinkUrl),
      smsBody,
    };
  }

  if (context === "consent_expiration_reminder" && expirationReminder) {
    const { consentLabel, expiryFormatted, daysRemaining } = expirationReminder;
    const emailSubject = `Reminder: your treatment consent expires in ${daysRemaining} days`;
    const emailText = `Hi ${firstName},

Your ${consentLabel} consent expires on ${expiryFormatted} (${daysRemaining} days from now).

To continue uninterrupted treatment, please re-sign before then:
${magicLinkUrl}

This usually takes 2-3 minutes.

Questions? Call us at ${CLINIC_PHONE}.

Elevated Health Augusta team`;

    const smsBody =
      `Elevated Health Augusta: Your treatment consent expires in ${daysRemaining} days. Re-sign: ${magicLinkUrl} Reply STOP to opt out.`;

    return {
      emailSubject,
      emailText,
      emailHtml: textToHtml(emailText, magicLinkUrl),
      smsBody,
    };
  }

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
      `Elevated Health Augusta reminder: please complete your intake before your appointment tomorrow. ${magicLinkUrl} Reply STOP to opt out.`;

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

    const smsBody =
      `Elevated Health Augusta: your intake link as requested. ${magicLinkUrl} Reply STOP to opt out.`;

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
  const { sendSms } = await import("./sms.ts");
  const r = await sendSms(to, body);
  return { ok: r.success, error: r.error };
}
