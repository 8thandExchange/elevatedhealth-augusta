import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  email: string;
  full_name: string;
  role: "admin" | "staff";
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
    const { data: roles } = await userClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isAdmin = roles?.some(r => r.role === "admin");
    if (!isAdmin) {
      throw new Error("Only admins can invite providers");
    }

    const { email, full_name, role }: InviteRequest = await req.json();

    if (!email || !full_name || !role) {
      throw new Error("Missing required fields: email, full_name, role");
    }

    // Create admin client for invite
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check if user already exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    if (existingUser) {
      throw new Error("A user with this email already exists");
    }

    // Send invite email - this creates the user and sends a password setup email
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name,
        invited_role: role,
      },
      redirectTo: `${req.headers.get("origin")}/provider/dashboard`,
    });

    if (inviteError) {
      console.error("Invite error:", inviteError);
      throw new Error(inviteError.message);
    }

    // Add the role to user_roles table
    if (inviteData?.user) {
      const { error: roleError } = await adminClient
        .from("user_roles")
        .insert({
          user_id: inviteData.user.id,
          role: role,
        });

      if (roleError) {
        console.error("Role assignment error:", roleError);
        // Don't fail the whole operation, the user can still set up their account
      }
    }

    console.log(`Successfully invited ${email} as ${role}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Invitation sent to ${email}`,
        user_id: inviteData?.user?.id 
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
