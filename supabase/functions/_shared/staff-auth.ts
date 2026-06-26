import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export type StaffAuthResult =
  | { ok: true; user_id: string; roles: string[] }
  | { ok: false; status: number; error: string };

const CLINICAL_ROLES = new Set(["admin", "staff", "provider", "business_admin"]);

/** Require an authenticated user with a provider-portal role (admin/staff/provider/business_admin). */
export async function requireClinicalStaffRole(req: Request): Promise<StaffAuthResult> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return { ok: false, status: 401, error: "Missing Authorization header" };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabaseAuth = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await supabaseAuth.auth.getUser();
  if (userErr || !userData?.user) {
    return { ok: false, status: 401, error: "Invalid or expired session. Sign in again at /admin/login." };
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);
  const { data: rolesRows } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id);

  const roles = (rolesRows || []).map((r) => String(r.role));
  if (!roles.some((r) => CLINICAL_ROLES.has(r))) {
    return {
      ok: false,
      status: 403,
      error: "Staff access required. Use your clinic login (not a patient portal account).",
    };
  }

  return { ok: true, user_id: userData.user.id, roles };
}
