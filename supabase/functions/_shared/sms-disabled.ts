/** Transactional SMS is handled in GoHighLevel (calls/texts to the clinic number). */
export const SMS_DISABLED_MESSAGE =
  "Transactional SMS is handled via GoHighLevel; in-app Sinch SMS is disabled.";

export function logSmsSkipped(context: string): void {
  console.log(`[sms-disabled] ${context}: skipped`);
}

export function smsSkippedPayload() {
  return {
    success: false as const,
    skipped: true as const,
    reason: "sms_disabled_ghl" as const,
    message: SMS_DISABLED_MESSAGE,
  };
}
