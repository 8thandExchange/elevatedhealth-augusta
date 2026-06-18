/** Normalize to YYYY-MM-DD for comparison (handles ISO timestamps and date inputs). */
export function normalizeDateOnly(value: string): string {
  if (!value) return "";
  const trimmed = value.trim();
  const isoPrefix = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoPrefix) return isoPrefix[1];
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed.slice(0, 10);
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Format a stored DOB for HTML date inputs without timezone drift. */
export function formatDobForInput(value: string | null | undefined): string {
  if (!value) return "";
  return normalizeDateOnly(value);
}

export function dobMatches(expectedDob: string, enteredDob: string): boolean {
  return normalizeDateOnly(expectedDob) === normalizeDateOnly(enteredDob);
}

/** Last 4 digits of a phone string for kiosk staff verification. */
export function phoneLastFour(phone: string | null | undefined): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  return digits.slice(-4);
}
