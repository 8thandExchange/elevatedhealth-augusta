import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { MAIL_FROM } from "../_shared/mail-config.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendResendEmail(args: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
}) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${args.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: args.from,
      to: [args.to],
      subject: args.subject,
      html: args.html,
    }),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload?.message || `Resend failed with status ${res.status}`);
  }
  return payload;
}

function staffEmailHtml(input: {
  intakeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dob: string | null;
  therapyName: string;
  blockSeverity: "hard" | "service_specific" | null;
  blockReasons: string[];
}) {
  const adminUrl = `https://elevatedhealthaugusta.com/admin/intake-follow-ups/${encodeURIComponent(input.intakeId)}`;
  const severityLabel = input.blockSeverity === "hard"
    ? "Hard block"
    : input.blockSeverity === "service_specific"
      ? "Service-specific block"
      : "Not set";
  return `
  <div style="font-family: Arial, sans-serif; color:#2A2826; max-width:720px; margin:0 auto; padding:24px;">
    <h3 style="margin:0 0 16px;">A new IV intake was blocked at screening.</h3>
    <p><strong>Patient:</strong> ${input.firstName} ${input.lastName}</p>
    <p><strong>Email:</strong> ${input.email}</p>
    <p><strong>Phone:</strong> ${input.phone || "—"}</p>
    <p><strong>DOB:</strong> ${input.dob || "—"}</p>
    <p><strong>Therapy requested:</strong> ${input.therapyName}</p>
    <p><strong>Block severity:</strong> ${severityLabel}</p>
    <p><strong>Block reasons:</strong></p>
    <ul>${input.blockReasons.map((r) => `<li>${r}</li>`).join("")}</ul>
    <p>Patient has <strong>not yet requested follow-up</strong>.</p>
    <p><strong>Follow-up status:</strong> new</p>
    <p><a href="${adminUrl}">View intake in admin dashboard</a></p>
  </div>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const body = await req.json().catch(() => ({}));
    const intakeId = typeof body?.intake_id === "string" ? body.intake_id : null;
    if (!intakeId) {
      return new Response(JSON.stringify({ error: "intake_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: intake, error: intakeErr } = await supabase
      .from("iv_intake_responses")
      .select("id, screening_result, first_name, last_name, email, phone, date_of_birth, block_reasons, selected_therapy_id, block_severity")
      .eq("id", intakeId)
      .maybeSingle();
    if (intakeErr || !intake) {
      return new Response(JSON.stringify({ error: "Intake not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (intake.screening_result !== "blocked") {
      return new Response(JSON.stringify({ error: "Notifications only apply to blocked intake rows" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let therapyName = "IV therapy";
    if (intake.selected_therapy_id) {
      const { data: therapy } = await supabase
        .from("iv_therapies")
        .select("name")
        .eq("id", intake.selected_therapy_id)
        .maybeSingle();
      if (therapy?.name) therapyName = therapy.name;
    }

    const staffTo = "appointments@elevatedhealthaugusta.com";
    const from = MAIL_FROM;

    let staffSent = false;
    const failLogs: Array<{ email_type: string; error_message: string }> = [];

    try {
      await sendResendEmail({
        apiKey: resendApiKey,
        from,
        to: staffTo,
        subject:
          `🚩 Blocked IV intake — ${intake.first_name || ""} ${intake.last_name || ""} — patient hasn't requested follow-up yet`,
        html: staffEmailHtml({
          intakeId,
          firstName: intake.first_name || "",
          lastName: intake.last_name || "",
          email: intake.email,
          phone: intake.phone || null,
          dob: intake.date_of_birth || null,
          therapyName,
          blockSeverity: intake.block_severity || null,
          blockReasons: intake.block_reasons || [],
        }),
      });
      staffSent = true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[send-blocked-intake-notifications] staff email failed:", msg);
      failLogs.push({ email_type: "staff", error_message: msg });
    }

    if (failLogs.length > 0) {
      for (const row of failLogs) {
        await supabase.from("notification_failures").insert({
          intake_id: intakeId,
          email_type: row.email_type,
          error_message: row.error_message,
        });
      }
    }

    const patch: Record<string, string> = {};
    if (staffSent) patch.staff_notified_email_sent_at = new Date().toISOString();
    if (Object.keys(patch).length > 0) {
      await supabase.from("iv_intake_responses").update(patch).eq("id", intakeId);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        intake_id: intakeId,
        staff_email_sent: staffSent,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[send-blocked-intake-notifications] unexpected error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});