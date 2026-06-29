/**
 * send-guide-email — delivers the hormone lead-magnet guide PDF (by link) to a
 * visitor who requested it. Mirrors send-quiz-result / send-contact-email.
 * Sender: MAIL_FROM (reads RESEND_FROM_EMAIL secret). Guide URL: GUIDE_HORMONE_URL secret.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { MAIL_FROM } from "../_shared/mail-config.ts";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const GUIDE_HORMONE_URL = Deno.env.get("GUIDE_HORMONE_URL");
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  guide: z.enum(["hormone"]).default("hormone"),
  _fax: z.string().optional(),
});
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
const GUIDE_MAP: Record<string, { url?: string; title: string; subject: string }> = {
  hormone: {
    url: GUIDE_HORMONE_URL,
    title: "Is Hormone Therapy Right for Me?",
    subject: "Your guide: Is hormone therapy right for you?",
  },
};
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const data = schema.parse(body);
    if (data._fax && data._fax.trim().length > 0) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
      });
    }
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured.");
    const guide = GUIDE_MAP[data.guide];
    if (!guide?.url) throw new Error("Guide URL not configured. Set the GUIDE_HORMONE_URL secret.");
    const firstName = escapeHtml(data.name.split(" ")[0] || data.name);
    const guideUrl = guide.url;
    const html = `
      <div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#13202B;">
        <div style="border-left:4px solid #00477E;padding:4px 0 4px 16px;margin-bottom:24px;">
          <div style="font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#086F9F;font-weight:600;">Elevated Health Augusta</div>
        </div>
        <h1 style="font-family:Georgia,serif;font-size:24px;color:#00477E;font-weight:normal;margin:0 0 16px;">Here's your guide, ${firstName}.</h1>
        <p style="font-size:15px;line-height:1.6;">Thanks for requesting <strong>${escapeHtml(guide.title)}</strong>. It's an honest, no-pressure read to help you decide whether hormone therapy is worth looking into — written by our physician-owned clinic, not a sales team.</p>
        <p style="text-align:center;margin:28px 0;"><a href="${escapeHtml(guideUrl)}" style="background:#00477E;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 30px;border-radius:6px;display:inline-block;">Read your guide →</a></p>
        <p style="font-size:15px;line-height:1.6;color:#5C6975;">When you're ready for a real answer, the next step is our $79 Wellness Assessment — in-person, physician-led, with an honest recommendation even if that's "you don't need this."</p>
        <p style="text-align:center;margin:20px 0;"><a href="https://elevatedhealthaugusta.com" style="color:#00477E;font-weight:600;text-decoration:none;">Book your assessment at elevatedhealthaugusta.com</a></p>
        <hr style="border:none;border-top:1px solid #D8E2EA;margin:28px 0;">
        <p style="font-size:12px;color:#9AA7B2;line-height:1.5;">Elevated Health Augusta · Physician-owned · Evans, GA · (706) 760-3470<br>This guide is educational and not medical advice. It does not diagnose any condition or establish a patient relationship.</p>
      </div>`;
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: MAIL_FROM, to: [data.email], subject: guide.subject, html }),
    });
    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`Resend API error (${emailResponse.status}): ${errorText}`);
    }
    return new Response(JSON.stringify({ success: true, message: "Guide sent" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("send-guide-email error:", msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
    });
  }
});
