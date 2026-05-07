import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";

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
    const validRoles = ["admin", "staff", "business_admin"];
    for (const role of roles) {
      if (!validRoles.includes(role)) {
        throw new Error(`Invalid role: ${role}. Valid roles are: ${validRoles.join(", ")}`);
      }
    }

    // Create admin client
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check if user already exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    if (existingUser) {
      throw new Error("A user with this email already exists");
    }

    let createdUserId: string | undefined;

    if (mode === "create") {
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
      // Send invite email
      const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
        data: {
          full_name,
          invited_roles: roles,
        },
        redirectTo: `${req.headers.get("origin")}/provider/dashboard`,
      });

      if (inviteError) {
        console.error("Invite error:", inviteError);
        throw new Error(inviteError.message);
      }
      createdUserId = inviteData?.user?.id;
    }

    // Add all selected roles to user_roles table
    if (createdUserId) {
      for (const role of roles) {
        const { error: roleError } = await adminClient
          .from("user_roles")
          .insert({
            user_id: createdUserId,
            role: role,
          });

        if (roleError) {
          console.error(`Role assignment error for ${role}:`, roleError);
        }
      }
    }

    console.log(`Successfully ${mode === "create" ? "created" : "invited"} ${email} with roles: ${roles.join(", ")}`);

    return new Response(
      JSON.stringify({
        success: true,
        mode,
        message: mode === "create"
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
