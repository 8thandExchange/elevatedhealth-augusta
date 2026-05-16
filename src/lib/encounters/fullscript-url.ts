/** Fullscript — opens dispensary in new tab from charting UI. */
export function getFullscriptUrl(): string {
  const fromEnv = import.meta.env.VITE_APP_FULLSCRIPT_URL as string | undefined;
  if (fromEnv && typeof fromEnv === "string" && fromEnv.trim().length > 0) {
    return fromEnv.trim();
  }
  return "https://us.fullscript.com";
}
