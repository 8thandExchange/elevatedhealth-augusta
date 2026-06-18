import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";

export type MagicLinkPortal = "patient" | "staff";

async function readFunctionErrorMessage(error: FunctionsHttpError): Promise<string> {
  try {
    const body = await error.context.json();
    if (body && typeof body === "object" && "error" in body && body.error) {
      return String(body.error);
    }
  } catch {
    // ignore parse failures
  }
  return error.message || "Failed to send sign-in email. Please try again.";
}

/**
 * Sends magic-link sign-in email via Resend (not Supabase built-in mail).
 */
export async function requestMagicLink(
  email: string,
  portal: MagicLinkPortal = "patient",
  redirectTo?: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { data, error } = await supabase.functions.invoke("send-magic-link-email", {
    body: {
      email: email.trim(),
      portal,
      ...(redirectTo ? { redirect_to: redirectTo } : {}),
    },
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      return { ok: false, message: await readFunctionErrorMessage(error) };
    }
    const msg = error.message || "Failed to send sign-in email. Please try again.";
    if (msg.toLowerCase().includes("rate limit")) {
      return { ok: false, message: "Too many emails sent recently. Please wait a few minutes and try again." };
    }
    return { ok: false, message: msg };
  }

  if (data && typeof data === "object" && "error" in data && data.error) {
    return { ok: false, message: String(data.error) };
  }

  return { ok: true };
}
