/**
 * Patient/staff magic-link sign-in via Resend + auth.admin.generateLink.
 * Replaces client signInWithOtp (Supabase built-in mail hits auth email rate limits).
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";
import {
  AUTH_EMAIL_FROM,
  brandedAuthEmailHtml,
  buildAuthActionLink,
  clientIpFromRequest,
  publicAuthEmailLimiter,
} from "../_shared/auth-email-delivery.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GENERIC_OK = {
  success: true,
  message: "If an account exists for that email, a sign-in link has been sent.",
};

const bodySchema = z.object({
  email: z.string().trim().email().max(255),
  redirect_to: z.string().url().optional(),
  portal: z.enum(["patient", "staff"]).optional(),
});

const limiter = publicAuthEmailLimiter;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const functionName = "send-magic-link-email";

  try {
    const clientIp = clientIpFromRequest(req);
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid email address." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, redirect_to, portal = "patient" } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    if (!limiter.allowed(clientIp, normalizedEmail)) {
      return new Response(
        JSON.stringify({ error: "Too many sign-in emails requested. Please wait a few minutes and try again." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const appBase = (Deno.env.get("APP_BASE_URL") || Deno.env.get("SITE_URL") || "https://elevatedhealthaugusta.com")
      .replace(/\/$/, "");
    const defaultRedirect = portal === "staff" ? `${appBase}/admin/login` : `${appBase}/patient/dashboard`;
    const redirectTo = redirect_to ?? defaultRedirect;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: linkData, error: genError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: normalizedEmail,
      options: { redirectTo },
    });

    const magicLink = buildAuthActionLink(
      supabaseUrl,
      linkData?.properties as Record<string, unknown> | undefined,
      redirectTo,
      "magiclink",
    );

    if (genError || !magicLink) {
      edgeStructuredLog(functionName, {
        event: "magiclink_skipped",
        email_domain: normalizedEmail.split("@")[1] ?? null,
        portal,
        success: true,
        error_message: genError?.message ?? "no_link",
      });
      return new Response(JSON.stringify(GENERIC_OK), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return new Response(JSON.stringify({ error: "Email service is temporarily unavailable." }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const portalLabel = portal === "staff" ? "clinical team portal" : "patient portal";
    const resend = new Resend(resendKey);
    const emailResponse = await resend.emails.send({
      from: AUTH_EMAIL_FROM,
      to: [normalizedEmail],
      subject: "Your Elevated Health Augusta sign-in link",
      html: brandedAuthEmailHtml({
        headline: "Sign in securely",
        bodyHtml: `<p>Use the button below to sign in to your ${portalLabel}. No password needed for this link.</p>`,
        ctaLabel: "Sign in",
        actionLink: magicLink,
      }),
    });

    if (emailResponse.error) {
      edgeStructuredLog(functionName, {
        event: "resend_failed",
        success: false,
        error_message: emailResponse.error.message,
      }, "error");
      return new Response(JSON.stringify({ error: "Failed to send sign-in email. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    edgeStructuredLog(functionName, {
      event: "magiclink_sent",
      email_domain: normalizedEmail.split("@")[1] ?? null,
      portal,
      success: true,
    });

    return new Response(JSON.stringify(GENERIC_OK), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    edgeStructuredLog(functionName, { success: false, error_message: message }, "error");
    return new Response(JSON.stringify({ error: "Failed to send sign-in email. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
