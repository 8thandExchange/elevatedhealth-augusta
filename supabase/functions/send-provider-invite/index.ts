import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import {
  AUTH_EMAIL_FROM,
  brandedAuthEmailHtml,
  buildAuthActionLink,
  escapeHtml,
} from "../_shared/auth-email-delivery.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  email: string;
  full_name: string;
  roles: string[];
  // "invite" (default) sends magic-link email; "create" provisions account directly with provided password
  mode?: "invite" | "create";
  password?: string;
  // Legacy support
  role?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user has admin role
    const { data: existingRoles } = await userClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isAdmin = existingRoles?.some(r => r.role === "admin");
    if (!isAdmin) {
      throw new Error("Only admins can invite providers");
    }

    const body: InviteRequest = await req.json();
    const { email, full_name } = body;
    const mode = body.mode === "create" ? "create" : "invite";
    const password = body.password;

    // Support both new 'roles' array and legacy 'role' string
    let roles: string[] = body.roles || [];
    if (roles.length === 0 && body.role) {
      roles = [body.role];
    }

    if (!email || !full_name || roles.length === 0) {
      throw new Error("Missing required fields: email, full_name, roles");
    }

    if (mode === "create") {
      if (!password || password.length < 8) {
        throw new Error("Password must be at least 8 characters when creating an account directly");
      }
    }

    // Validate roles
    const validRoles = ["admin", "staff", "business_admin", "provider"];
    for (const role of roles) {
      if (!validRoles.includes(role)) {
        throw new Error(`Invalid role: ${role}. Valid roles are: ${validRoles.join(", ")}`);
      }
    }
    if (roles.includes("provider") && !isAdmin) {
      throw new Error("Only admins can assign provider role");
    }

    // Create admin client
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check if user already exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );

    let createdUserId: string | undefined;

    if (existingUser) {
      if (mode === "create") {
        throw new Error(
          "A user with this email already exists. Use invite mode or Team management to add roles.",
        );
      }
      createdUserId = existingUser.id;
    } else if (mode === "create") {
      // Provision account directly — no email sent, password set by admin, email auto-confirmed
      const { data: createdData, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
          invited_roles: roles,
          provisioned_by_admin: true,
        },
      });

      if (createError) {
        console.error("Create user error:", createError);
        throw new Error(createError.message);
      }
      createdUserId = createdData?.user?.id;
    } else {
      const redirectTo = `${req.headers.get("origin") || "https://elevatedhealthaugusta.com"}/admin/login`;
      const { data: inviteData, error: inviteError } = await adminClient.auth.admin.generateLink({
        type: "invite",
        email,
        options: {
          redirectTo,
          data: {
            full_name,
            invited_roles: roles,
          },
        },
      });

      if (inviteError) {
        console.error("Invite link error:", inviteError);
        throw new Error(inviteError.message);
      }

      createdUserId = inviteData?.user?.id;

      const inviteLink = buildAuthActionLink(
        supabaseUrl,
        inviteData?.properties as Record<string, unknown> | undefined,
        redirectTo,
        "invite",
      );

      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (!inviteLink) {
        throw new Error("Could not generate invite link");
      }
      if (!resendKey) {
        throw new Error("Email service is not configured");
      }

      const resend = new Resend(resendKey);
      const roleLabels = roles.join(", ");
      const emailResponse = await resend.emails.send({
        from: AUTH_EMAIL_FROM,
        to: [email],
        subject: "You're invited to Elevated Health Augusta",
        html: brandedAuthEmailHtml({
          headline: "Clinical team invitation",
          bodyHtml: `<p>Hi ${escapeHtml(full_name)},</p><p>You've been invited to the Elevated Health Augusta clinical portal as <strong>${escapeHtml(roleLabels)}</strong>.</p><p>Click below to set your password and sign in.</p>`,
          ctaLabel: "Accept invitation",
          actionLink: inviteLink,
        }),
      });

      if (emailResponse.error) {
        console.error("Resend invite error:", emailResponse.error);
        throw new Error(emailResponse.error.message || "Failed to send invite email");
      }
    }

    // Add all selected roles to user_roles table
    if (createdUserId) {
      const auditRows: Array<{
        actor_user_id: string;
        target_user_id: string;
        action: string;
        old_role: string | null;
        new_role: string | null;
      }> = [];

      for (const role of roles) {
        const { data: existingRole } = await adminClient
          .from("user_roles")
          .select("id")
          .eq("user_id", createdUserId)
          .eq("role", role)
          .maybeSingle();

        if (existingRole) continue;

        const { error: roleError } = await adminClient
          .from("user_roles")
          .insert({
            user_id: createdUserId,
            role: role,
          });

        if (roleError) {
          console.error(`Role assignment error for ${role}:`, roleError);
          continue;
        }

        auditRows.push({
          actor_user_id: user.id,
          target_user_id: createdUserId,
          action: "INSERT",
          old_role: null,
          new_role: role,
        });
      }

      if (auditRows.length > 0) {
        const { error: auditError } = await adminClient
          .from("audit_log")
          .insert(auditRows);
        if (auditError) {
          console.error("Audit log write error:", auditError);
          throw new Error("Failed to write role assignment audit log");
        }
      }
    }

    const actionLabel = existingUser
      ? "updated roles for"
      : mode === "create"
        ? "created"
        : "invited";
    console.log(`Successfully ${actionLabel} ${email} with roles: ${roles.join(", ")}`);

    return new Response(
      JSON.stringify({
        success: true,
        mode,
        existing_user: !!existingUser,
        message: existingUser
          ? `Roles updated for ${email}.`
          : mode === "create"
            ? `Account created for ${email}. They can sign in immediately.`
            : `Invitation sent to ${email}`,
        user_id: createdUserId,
        roles: roles,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-provider-invite:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
