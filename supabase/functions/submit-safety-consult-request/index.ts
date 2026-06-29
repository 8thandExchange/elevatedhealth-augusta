import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { MAIL_FROM } from "../_shared/mail-config.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type SubmitRequestBody = {
  intake_id?: string;
  best_time?: string;
  drawing_to_iv?: string;
  additional_notes?: string;
};

const BEST_TIME_OPTIONS = new Set([
  "morning_8_12",
  "afternoon_12_5",
  "evening_5_7",
  "anytime",
]);

const DRAWING_TO_IV_OPTIONS = new Set([
  "Energy",
  "Recovery",
  "Immune support",
  "Hydration",
  "Hangover relief",
  "Wellness routine",
  "Other",
]);

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

function prettyBestTime(value: string): string {
  switch (value) {
    case "morning_8_12":
      return "Morning (8am-12pm)";
    case "afternoon_12_5":
      return "Afternoon (12pm-5pm)";
    case "evening_5_7":
      return "Evening (5pm-7pm)";
    case "anytime":
      return "Anytime is fine";
    default:
      return value;
  }
}

function staffEmailHtml(input: {
  intakeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dob: string | null;
  blockSeverity: "hard" | "service_specific" | null;
  blockReasons: string[];
  bestTime: string;
  drawingToIv: string;
  additionalNotes: string;
}) {
  const adminUrl = `https://elevatedhealthaugusta.com/admin/intake-follow-ups/${encodeURIComponent(input.intakeId)}`;
  const severityLabel = input.blockSeverity === "hard"
    ? "Hard block"
    : input.blockSeverity === "service_specific"
      ? "Service-specific block"
      : "Not set";
  return `
  <div style="font-family: Arial, sans-serif; color:#2A2826; max-width:720px; margin:0 auto; padding:24px;">
    <h3 style="margin:0 0 16px;">Patient has requested a safety consult callback.</h3>
    <p><strong>Patient:</strong> ${input.firstName} ${input.lastName}</p>
    <p><strong>Email:</strong> ${input.email}</p>
    <p><strong>Phone:</strong> ${input.phone || "—"}</p>
    <p><strong>DOB:</strong> ${input.dob || "—"}</p>
    <p><strong>Block severity:</strong> ${severityLabel}</p>
    <p><strong>Block reasons:</strong></p>
    <ul>${input.blockReasons.map((r) => `<li>${r}</li>`).join("")}</ul>
    <p><strong>Best time to call:</strong> ${input.bestTime}</p>
    <p><strong>What they hoped to get from IV therapy:</strong> ${input.drawingToIv}</p>
    <p><strong>Additional notes:</strong> ${input.additionalNotes || "—"}</p>
    <p><a href="${adminUrl}">Open intake follow-up record</a></p>
  </div>`;
}

function patientEmailHtml(input: { firstName: string; phone: string | null }) {
  return `
  <div style="font-family: Arial, sans-serif; color:#2A2826; max-width:640px; margin:0 auto; padding:24px;">
    <h2 style="font-family: Georgia, serif; font-style: italic; margin:0 0 16px;">Elevated Health Augusta</h2>
    <p>Hi ${input.firstName},</p>
    <p>Thanks for letting us know. Our team will reach out at ${input.phone || "your phone number on file"} within 1 business day to schedule a complimentary consultation.</p>
    <p>If you need anything urgent in the meantime, call <a href="tel:+17067603470">(706) 760-3470</a>.</p>
  </div>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const body = (await req.json().catch(() => ({}))) as SubmitRequestBody;
    const intakeId = typeof body.intake_id === "string" ? body.intake_id.trim() : "";
    const bestTime = typeof body.best_time === "string" ? body.best_time.trim() : "";
    const drawingToIv = typeof body.drawing_to_iv === "string" ? body.drawing_to_iv.trim() : "";
    const additionalNotes = typeof body.additional_notes === "string" ? body.additional_notes.trim() : "";

    if (!intakeId) {
      return new Response(JSON.stringify({ error: "Missing required field: intake_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!bestTime || !BEST_TIME_OPTIONS.has(bestTime)) {
      return new Response(JSON.stringify({ error: "Missing required field: best_time" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!drawingToIv || !DRAWING_TO_IV_OPTIONS.has(drawingToIv)) {
      return new Response(JSON.stringify({ error: "Missing required field: drawing_to_iv" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: intake, error: intakeErr } = await supabase
      .from("iv_intake_responses")
      .select("id, first_name, last_name, email, phone, date_of_birth, screening_result, block_reasons, block_severity, follow_up_status, follow_up_notes")
      .eq("id", intakeId)
      .maybeSingle();

    if (intakeErr || !intake) {
      return new Response(JSON.stringify({ error: "Intake not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (intake.screening_result !== "blocked") {
      return new Response(JSON.stringify({ error: "Only blocked intakes can request consults" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const terminalStatuses = new Set([
      "consult_requested",
      "consult_scheduled",
      "converted",
      "declined",
      "closed",
    ]);
    if (terminalStatuses.has(intake.follow_up_status || "")) {
      return new Response(JSON.stringify({ ok: true, already_requested: true, intake_id: intakeId }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const timelineLine =
      `[${new Date().toISOString()}] Patient requested consult. Best time: ${prettyBestTime(bestTime)}. ` +
      `Drawing to IV: ${drawingToIv}. Notes: ${additionalNotes || "None."}`;
    const nextNotes = intake.follow_up_notes
      ? `${intake.follow_up_notes}\n${timelineLine}`
      : timelineLine;

    const { error: updateErr } = await supabase
      .from("iv_intake_responses")
      .update({
        follow_up_status: "consult_requested",
        follow_up_notes: nextNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", intakeId);
    if (updateErr) {
      return new Response(JSON.stringify({ error: "Failed to update follow-up status" }), {
        status: 500,
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

    const from = MAIL_FROM;
    const staffTo = "appointments@elevatedhealthaugusta.com";

    await sendResendEmail({
      apiKey: resendApiKey,
      from,
      to: staffTo,
      subject:
        `🚩 Safety consult REQUESTED — ${intake.first_name || ""} ${intake.last_name || ""} — patient is waiting for callback`,
      html: staffEmailHtml({
        intakeId,
        firstName: intake.first_name || "",
        lastName: intake.last_name || "",
        email: intake.email,
        phone: intake.phone || null,
        dob: intake.date_of_birth || null,
        blockSeverity: intake.block_severity || null,
        blockReasons: intake.block_reasons || [],
        bestTime: prettyBestTime(bestTime),
        drawingToIv,
        additionalNotes,
      }),
    });

    await sendResendEmail({
      apiKey: resendApiKey,
      from,
      to: intake.email,
      subject: "We've got your request — we'll be in touch",
      html: patientEmailHtml({
        firstName: intake.first_name || "there",
        phone: intake.phone || null,
      }),
    });

    return new Response(JSON.stringify({ ok: true, intake_id: intakeId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[submit-safety-consult-request] unexpected error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});