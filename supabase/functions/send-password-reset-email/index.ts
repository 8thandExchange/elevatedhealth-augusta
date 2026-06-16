/**
 * Password reset via Resend + auth.admin.generateLink (recovery).
 * Public endpoint — returns generic success when no account exists (anti-enumeration).
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GENERIC_OK = {
  success: true,
  message: "If an account exists for that email, a password reset link has been sent.",
};

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 8;
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const bodySchema = z.object({
  email: z.string().trim().email().max(255),
  portal: z.enum(["staff", "patient"]).optional(),
});

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (record.count >= RATE_LIMIT_MAX) return false;
  record.count++;
  return true;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function passwordResetHtml(resetLink: string, portal: "staff" | "patient"): string {
  const portalLabel = portal === "staff" ? "clinical team portal" : "patient portal";
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F2EBDC;font-family:Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2EBDC;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:8px;overflow:hidden;">
        <tr><td style="background:#2A2826;padding:28px 32px;">
          <p style="margin:0;color:#B8956A;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Elevated Health Augusta</p>
          <h1 style="margin:8px 0 0;color:#F2EBDC;font-size:24px;font-weight:400;">Reset your password</h1>
        </td></tr>
        <tr><td style="padding:32px;color:#2A2826;font-size:15px;line-height:1.6;">
          <p>We received a request to reset the password for your ${portalLabel} account.</p>
          <p style="margin:24px 0;">
            <a href="${escapeHtml(resetLink)}" style="display:inline-block;background:#B8956A;color:#2A2826;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:600;">Set a new password</a>
          </p>
          <p style="font-size:13px;color:#666;">This link expires in 24 hours. If you did not request a reset, you can ignore this email.</p>
          <p style="font-size:12px;color:#999;word-break:break-all;">Or copy this link:<br>${escapeHtml(resetLink)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildResetLink(
  supabaseUrl: string,
  properties: Record<string, unknown> | undefined,
  redirectTo: string,
): string | null {
  if (!properties) return null;
  const actionLink = properties.action_link;
  if (typeof actionLink === "string" && actionLink.length > 0) {
    return actionLink;
  }
  const hashedToken = properties.hashed_token;
  if (typeof hashedToken === "string" && hashedToken.length > 0) {
    const base = supabaseUrl.replace(/\/$/, "");
    return `${base}/auth/v1/verify?token=${encodeURIComponent(hashedToken)}&type=recovery&redirect_to=${encodeURIComponent(redirectTo)}`;
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const functionName = "send-password-reset-email";

  try {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    if (!checkRateLimit(clientIp)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid email address." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, portal = "patient" } = parsed.data;
    const normalizedEmail = email.toLowerCase();
    const appBase = (Deno.env.get("APP_BASE_URL") || Deno.env.get("SITE_URL") || "https://elevatedhealthaugusta.com")
      .replace(/\/$/, "");
    const redirectTo = `${appBase}/reset-password?portal=${portal}`;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: linkData, error: genError } = await admin.auth.admin.generateLink({
      type: "recovery",
      email: normalizedEmail,
      options: { redirectTo },
    });

    const resetLink = buildResetLink(
      supabaseUrl,
      linkData?.properties as Record<string, unknown> | undefined,
      redirectTo,
    );

    if (genError || !resetLink) {
      console.log("[send-password-reset-email] generateLink skipped", {
        email_domain: normalizedEmail.split("@")[1] ?? null,
        portal,
        error: genError?.message ?? "no_reset_link",
      });
      edgeStructuredLog(functionName, {
        event: "reset_skipped",
        email_domain: normalizedEmail.split("@")[1] ?? null,
        portal,
        success: true,
        error_message: genError?.message ?? "no_reset_link",
      });
      return new Response(JSON.stringify(GENERIC_OK), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      edgeStructuredLog(functionName, {
        event: "resend_missing",
        success: false,
        error_message: "RESEND_API_KEY not configured",
      }, "error");
      return new Response(JSON.stringify({ error: "Email service is temporarily unavailable." }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(resendKey);
    const emailResponse = await resend.emails.send({
      from: "Elevated Health Augusta <noreply@elevatedhealthaugusta.com>",
      to: [normalizedEmail],
      subject: "Reset your Elevated Health Augusta password",
      html: passwordResetHtml(resetLink, portal),
    });

    if (emailResponse.error) {
      console.error("[send-password-reset-email] Resend error", emailResponse.error);
      edgeStructuredLog(functionName, {
        event: "resend_failed",
        email_domain: normalizedEmail.split("@")[1] ?? null,
        success: false,
        error_message: emailResponse.error.message,
      }, "error");
      return new Response(JSON.stringify({ error: "Failed to send reset email. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[send-password-reset-email] sent", {
      email_domain: normalizedEmail.split("@")[1] ?? null,
      portal,
      resend_id: emailResponse.data?.id ?? null,
    });

    edgeStructuredLog(functionName, {
      event: "reset_sent",
      email_domain: normalizedEmail.split("@")[1] ?? null,
      portal,
      success: true,
    });

    return new Response(JSON.stringify(GENERIC_OK), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[send-password-reset-email] unexpected", message);
    edgeStructuredLog(functionName, {
      event: "unexpected_error",
      success: false,
      error_message: message,
    }, "error");
    return new Response(JSON.stringify({ error: "Failed to send reset email. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
