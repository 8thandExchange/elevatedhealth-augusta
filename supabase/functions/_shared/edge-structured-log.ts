/** Single-line JSON logs for Supabase Edge Function log drains (no PHI payloads). */

export type EdgeLogLevel = "info" | "error";

export function edgeStructuredLog(
  functionName: string,
  fields: Record<string, unknown> & { success?: boolean; error_message?: string },
  level: EdgeLogLevel = "info",
): void {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    function: functionName,
    level,
    ...fields,
  });
  if (level === "error") console.error(line);
  else console.log(line);
}
