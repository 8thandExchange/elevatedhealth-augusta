/** Transactional SMS is handled via Twilio. */
export const SMS_DISABLED_MESSAGE =
  "Transactional SMS requires Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and a Messaging Service or from-number).";

export function logSmsSkipped(context: string): void {
  console.log(`[sms-disabled] ${context}: skipped`);
}

export function smsSkippedPayload() {
  return {
    success: false as const,
    skipped: true as const,
    reason: "sms_not_configured" as const,
    message: SMS_DISABLED_MESSAGE,
  };
}
