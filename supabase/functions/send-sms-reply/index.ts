/**
 * Staff-authored SMS reply from the Office Dashboard inbox.
 * Auth: JWT + staff/admin role.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { formatPhoneE164, sendSms } from "../_shared/sms.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function requireStaffOrAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return { ok: false as const, status: 401, error: "Missing Authorization header" };
  }

  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const authClient = createClient(url, anon, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await authClient.auth.getUser();
  if (userErr || !userData?.user) {
    return { ok: false as const, status: 401, error: "Invalid or expired session" };
  }

  const service = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: roles } = await service
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id);
  const allowed = (roles || []).some((r) => r.role === "staff" || r.role === "admin");
  if (!allowed) {
    return { ok: false as const, status: 403, error: "Staff or admin role required" };
  }

  return { ok: true as const, user_id: userData.user.id };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const gate = await requireStaffOrAdmin(req);
    if (!gate.ok) {
      return new Response(JSON.stringify({ error: gate.error }), {
        status: gate.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { to_phone, body, patient_id } = await req.json();
    if (!to_phone || !body?.trim()) {
      return new Response(
        JSON.stringify({ error: "to_phone and body are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const formatted = formatPhoneE164(to_phone);
    const result = await sendSms(formatted, body.trim(), {
      patientId: patient_id ?? undefined,
      sentBy: gate.user_id,
      sourceFunction: "send-sms-reply",
    });

    if (!result.success) {
      throw new Error(result.error || "SMS send failed");
    }

    // Mark prior inbound messages from this number as read
    if (patient_id) {
      const service = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      await service
        .from("sms_messages")
        .update({ is_read: true })
        .eq("patient_id", patient_id)
        .eq("direction", "inbound")
        .eq("is_read", false);
    }

    return new Response(
      JSON.stringify({ success: true, messageId: result.messageId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
