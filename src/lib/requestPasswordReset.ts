import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";

export type PasswordResetPortal = "staff" | "patient";

async function readFunctionErrorMessage(error: FunctionsHttpError): Promise<string> {
  try {
    const body = await error.context.json();
    if (body && typeof body === "object" && "error" in body && body.error) {
      return String(body.error);
    }
  } catch {
    // ignore parse failures
  }
  return error.message || "Failed to send reset email. Please try again.";
}

/**
 * Sends password reset email via Resend edge function (not Supabase built-in mail).
 */
export async function requestPasswordReset(
  email: string,
  portal: PasswordResetPortal,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { data, error } = await supabase.functions.invoke("send-password-reset-email", {
    body: {
      email: email.trim(),
      portal,
    },
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      return { ok: false, message: await readFunctionErrorMessage(error) };
    }
    return { ok: false, message: error.message || "Failed to send reset email. Please try again." };
  }

  if (data && typeof data === "object" && "error" in data && data.error) {
    return { ok: false, message: String(data.error) };
  }

  return { ok: true };
}
