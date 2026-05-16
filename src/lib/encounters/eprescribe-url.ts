/** iPrescribe (or DrFirst) — opens in new tab from charting UI. */
export function getEprescribeUrl(): string {
  const fromEnv = import.meta.env.VITE_APP_EPRESCRIBE_URL as string | undefined;
  if (fromEnv && typeof fromEnv === "string" && fromEnv.trim().length > 0) {
    return fromEnv.trim();
  }
  return "https://www.iprescribe.com";
}
