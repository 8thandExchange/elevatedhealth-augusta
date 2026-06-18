import { FunctionsHttpError } from "@supabase/supabase-js";

function isFunctionsHttpError(error: unknown): error is FunctionsHttpError {
  return (
    error instanceof FunctionsHttpError ||
    (error instanceof Error && error.name === "FunctionsHttpError")
  );
}

async function readResponseErrorBody(context: unknown): Promise<string | null> {
  if (!context || typeof context !== "object") return null;
  const response = context as Response;

  if (typeof response.json !== "function") return null;

  try {
    const body = await response.json();
    if (body && typeof body === "object") {
      if ("error" in body && body.error) return String(body.error);
      if ("message" in body && body.message) return String(body.message);
    }
  } catch {
    if (typeof response.text === "function") {
      try {
        const text = await response.text();
        if (!text) return null;
        try {
          const parsed = JSON.parse(text) as { error?: string; message?: string };
          if (parsed.error) return parsed.error;
          if (parsed.message) return parsed.message;
        } catch {
          if (text.length <= 240) return text;
        }
      } catch {
        // ignore
      }
    }
  }

  return null;
}

/** Extract a human-readable message from a failed supabase.functions.invoke call. */
export async function readEdgeFunctionError(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): Promise<string> {
  if (isFunctionsHttpError(error)) {
    const fromBody = await readResponseErrorBody(error.context);
    if (fromBody) return fromBody;
    if (error.message && !error.message.includes("non-2xx")) {
      return error.message;
    }
    return fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
