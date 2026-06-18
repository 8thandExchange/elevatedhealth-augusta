/**
 * Create a confirmed patient auth user without Supabase built-in signup email.
 * Client signs in with password immediately after success.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";
import { AuthEmailRateLimiter, clientIpFromRequest } from "../_shared/auth-email-delivery.ts";

const STAFF_ROLES = new Set(["admin", "staff", "provider", "business_admin"]);

async function rolesForEmail(
  admin: ReturnType<typeof createClient>,
  normalizedEmail: string,
): Promise<string[]> {
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.trim().toLowerCase() === normalizedEmail);
    if (match?.id) {
      const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", match.id);
      return roles?.map((r) => String(r.role)) ?? [];
    }
    if (data.users.length < 200) break;
  }
  return [];
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const bodySchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(128),
  full_name: z.string().trim().min(1).max(200).optional(),
});

const limiter = new AuthEmailRateLimiter(15 * 60 * 1000, 15, 6);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const functionName = "create-patient-auth-account";

  try {
    const clientIp = clientIpFromRequest(req);
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid account details." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, password, full_name } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    if (!limiter.allowed(clientIp, normalizedEmail)) {
      return new Response(
        JSON.stringify({ error: "Too many account attempts. Please wait a few minutes and try again." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: full_name ? { full_name } : undefined,
    });

    if (createError) {
      const msg = createError.message ?? "Could not create account";
      const alreadyRegistered =
        msg.toLowerCase().includes("already") ||
        msg.toLowerCase().includes("registered") ||
        msg.toLowerCase().includes("exists");

      if (alreadyRegistered) {
        const roles = await rolesForEmail(admin, normalizedEmail);
        const isStaff = roles.some((r) => STAFF_ROLES.has(r));
        if (isStaff) {
          return new Response(
            JSON.stringify({
              error:
                "This email is used for a clinic staff login. For a test patient, use a different email address.",
              error_code: "staff_email_conflict",
            }),
            { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
      }

      edgeStructuredLog(functionName, {
        event: alreadyRegistered ? "already_registered" : "create_failed",
        success: false,
        error_message: msg,
      }, alreadyRegistered ? "info" : "error");

      return new Response(
        JSON.stringify({
          error: alreadyRegistered
            ? "An account with this email already exists. Please log in."
            : msg,
          error_code: alreadyRegistered ? "already_registered" : "create_failed",
        }),
        { status: alreadyRegistered ? 409 : 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!created.user?.id) {
      throw new Error("Account created without user id");
    }

    const { data: existingRole } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", created.user.id)
      .eq("role", "user")
      .maybeSingle();

    if (!existingRole) {
      await admin.from("user_roles").insert({ user_id: created.user.id, role: "user" });
    }

    edgeStructuredLog(functionName, {
      event: "account_created",
      email_domain: normalizedEmail.split("@")[1] ?? null,
      success: true,
    });

    return new Response(
      JSON.stringify({ success: true, user_id: created.user.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    edgeStructuredLog(functionName, { success: false, error_message: message }, "error");
    return new Response(JSON.stringify({ error: "Failed to create account. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
