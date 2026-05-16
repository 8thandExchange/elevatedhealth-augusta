import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export function createServiceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Supabase service configuration missing");
  return createClient(url, key);
}

/** True when Authorization uses the service role key (edge-to-edge). */
export function isServiceRoleRequest(req: Request): boolean {
  const auth = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  return Boolean(serviceKey && auth === serviceKey);
}

export async function requireBusinessAdminJwt(
  supabase: SupabaseClient,
  req: Request,
): Promise<{ ok: true; userId: string } | { ok: false; status: number; message: string }> {
  if (isServiceRoleRequest(req)) {
    return { ok: false, status: 403, message: "Business administrator JWT required (not service role)" };
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }

  const token = authHeader.replace(/^Bearer\s+/i, "");
  const { data: userData, error } = await supabase.auth.getUser(token);
  if (error || !userData.user) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }

  const { data: isBiz, error: rpcErr } = await supabase.rpc("has_business_admin_role", {
    _user_id: userData.user.id,
  });

  if (rpcErr || !isBiz) {
    return { ok: false, status: 403, message: "Business admin access required" };
  }

  return { ok: true, userId: userData.user.id };
}

export async function requireStaffOrServiceRole(
  supabase: SupabaseClient,
  req: Request,
): Promise<{ ok: true; userId?: string } | { ok: false; status: number; message: string }> {
  if (isServiceRoleRequest(req)) {
    return { ok: true };
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }

  const token = authHeader.replace(/^Bearer\s+/i, "");
  const { data: userData, error } = await supabase.auth.getUser(token);
  if (error || !userData.user) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id);

  const allowed = (roles ?? []).some(
    (r) =>
      r.role === "admin" ||
      r.role === "staff" ||
      r.role === "provider" ||
      r.role === "business_admin",
  );

  if (!allowed) {
    return { ok: false, status: 403, message: "Staff access required" };
  }

  return { ok: true, userId: userData.user.id };
}

export function requireServiceRoleOnly(req: Request): { ok: true } | { ok: false; message: string } {
  if (!isServiceRoleRequest(req)) {
    return { ok: false, message: "Service role required" };
  }
  return { ok: true };
}
