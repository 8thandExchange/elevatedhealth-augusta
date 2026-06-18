/**
 * Patient-facing intake link copy — keep in sync with
 * supabase/functions/_shared/intake-magic-link-messages.ts
 */

const CLINIC_ADDRESS = "7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809";
const CLINIC_PHONE = "(706) 760-3470";

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

export function buildIntakeMagicLinkUrl(token: string): string {
  const base =
    import.meta.env.VITE_APP_BASE_URL?.replace(/\/$/, "") ||
    (typeof window !== "undefined" ? window.location.origin : "https://elevatedhealthaugusta.com");
  return `${base}/intake/start?t=${encodeURIComponent(token)}`;
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
  reconsentReminder?: {
    consentLabel: string;
    deadlineFormatted: string;
    daysRemaining: number;
  };
  substanceLabel?: string;
}): { emailSubject: string; emailText: string; smsBody: string } {
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
      consentDocumentLabels && consentDocumentLabels.length > 0
        ? consentDocumentLabels.map((l) => `- ${l}`).join("\n")
        : "- Your clinician-listed consent documents";

    return {
      emailSubject: "Action needed: sign your treatment consent at Elevated Health Augusta",
      emailText: `Hi ${firstName},

Your clinician at Elevated Health Augusta is ready to prescribe your treatment, but we need your signed consent first.

Please review and sign the following consent(s):
${bullets}

This usually takes 5-10 minutes. Click below to start:
${magicLinkUrl}

Once you've signed, your clinician can complete your prescription.

Questions? Call us at ${CLINIC_PHONE}.

Elevated Health Augusta team`,
      smsBody: `Elevated Health Augusta: Please sign your treatment consent so we can complete your prescription. ${magicLinkUrl} Reply STOP to opt out.`,
    };
  }

  if (context === "staff_resend") {
    return {
      emailSubject: "Your Elevated Health Augusta intake link",
      emailText: `Hi ${firstName},

As requested, here is your intake link:
${magicLinkUrl}

This link will let you complete your intake forms and consents.

Elevated Health Augusta team
${CLINIC_PHONE}`,
      smsBody: `Elevated Health Augusta: your intake link as requested. ${magicLinkUrl} Reply STOP to opt out.`,
    };
  }

  if (context === "reminder_24h") {
    const when =
      appointmentDate && appointmentTime
        ? `${appointmentDate} at ${appointmentTime}`
        : appointmentDate || "your upcoming visit";
    return {
      emailSubject: "Reminder: complete your intake before tomorrow's appointment",
      emailText: `Hi ${firstName},

Your Wellness Assessment with Elevated Health Augusta is coming up on ${when}.

Your intake isn't complete yet. Please take a few minutes to finish it before your visit:
${magicLinkUrl}

If you've already completed your intake, you can ignore this message.

See you soon,
The Elevated Health Augusta team`,
      smsBody: `Elevated Health Augusta reminder: please complete your intake before your appointment tomorrow. ${magicLinkUrl} Reply STOP to opt out.`,
    };
  }

  return {
    emailSubject: "Your Elevated Health Augusta intake — start here",
    emailText: `Hi ${firstName},

Thank you for booking your Wellness Assessment with Elevated Health Augusta.

Before your visit, please take a few minutes to complete your intake. This includes reviewing and signing required consent forms.

Click below to start:
${magicLinkUrl}

This link is unique to you and stays active through the day after your appointment.

See you soon,
The Elevated Health Augusta team
${CLINIC_PHONE}
${CLINIC_ADDRESS}`,
    smsBody: `Elevated Health Augusta: Please complete your intake before your appointment. ${magicLinkUrl} Reply STOP to opt out of SMS.`,
  };
}
