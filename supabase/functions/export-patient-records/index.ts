/**
 * export-patient-records — compile signed encounters + chart context into one PDF.
 * Uses PDFShift (same as consent PDF). Requires PDFSHIFT_API_KEY.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function authorizeStaffForPatient(
  req: Request,
  supabaseAdmin: ReturnType<typeof createClient>,
  patientId: string,
): Promise<{ ok: true; userId: string } | { ok: false; status: number; error: string }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return { ok: false, status: 401, error: "Missing Authorization header" };

  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const authClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
  const { data: userData, error: userErr } = await authClient.auth.getUser();
  if (userErr || !userData?.user) return { ok: false, status: 401, error: "Invalid or expired session" };
  const userId = userData.user.id;

  const { data: roles } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
  const privileged = (roles || []).some((r: { role: string }) =>
    r.role === "staff" || r.role === "admin" || r.role === "provider"
  );
  if (privileged) return { ok: true, userId };

  const { data: biz, error: bErr } = await supabaseAdmin.rpc("has_business_admin_role", { _user_id: userId });
  if (!bErr && biz) return { ok: true, userId };

  return { ok: false, status: 403, error: "Not authorized for chart export" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const patient_id = body.patient_id as string | undefined;
    const date_range_start = body.date_range_start as string | undefined;
    const date_range_end = body.date_range_end as string | undefined;

    if (!patient_id || typeof patient_id !== "string") {
      return new Response(JSON.stringify({ error: "patient_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, serviceKey);

    const auth = await authorizeStaffForPatient(req, admin, patient_id);
    if (!auth.ok) {
      return new Response(JSON.stringify({ error: auth.error }), {
        status: auth.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: patient, error: pErr } = await admin.from("patients").select("*").eq("id", patient_id).single();
    if (pErr || !patient) {
      return new Response(JSON.stringify({ error: "Patient not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let encQuery = admin
      .from("patient_encounters")
      .select("*")
      .eq("patient_id", patient_id)
      .in("status", ["signed", "amended"])
      .order("encounter_date", { ascending: true });
    if (date_range_start) encQuery = encQuery.gte("encounter_date", date_range_start);
    if (date_range_end) encQuery = encQuery.lte("encounter_date", date_range_end);
    const { data: encounters, error: eErr } = await encQuery;
    if (eErr) throw eErr;

    const { data: allergies } = await admin
      .from("patient_allergies")
      .select("*")
      .eq("patient_id", patient_id)
      .eq("active", true);
    const { data: meds } = await admin
      .from("patient_current_medications")
      .select("*")
      .eq("patient_id", patient_id)
      .eq("active", true);
    const { data: problems } = await admin
      .from("patient_problem_list")
      .select("*")
      .eq("patient_id", patient_id)
      .eq("status", "active");

    const { data: attachments } = await admin
      .from("encounter_attachments")
      .select("file_name, attachment_type, uploaded_at, encounter_id")
      .eq("patient_id", patient_id);

    const encPages = (encounters ?? [])
      .map((enc: Record<string, unknown>) => {
        const id = enc.id as string;
        return `<div class="page"><h2>Encounter ${esc(String(enc.encounter_date ?? ""))}</h2>
        <p><strong>Type:</strong> ${esc(String(enc.encounter_type ?? ""))} &nbsp; <strong>Status:</strong> ${esc(String(enc.status ?? ""))}</p>
        <p><strong>Chief complaint:</strong> ${esc(String(enc.chief_complaint ?? ""))}</p>
        <h3>SOAP</h3>
        <p><strong>S:</strong><br/>${esc(String(enc.subjective ?? "")).replace(/\n/g, "<br/>")}</p>
        <p><strong>O:</strong><br/>${esc(String(enc.objective ?? "")).replace(/\n/g, "<br/>")}</p>
        <p><strong>A:</strong><br/>${esc(String(enc.assessment ?? "")).replace(/\n/g, "<br/>")}</p>
        <p><strong>P:</strong><br/>${esc(String(enc.plan ?? "")).replace(/\n/g, "<br/>")}</p>
        <p><strong>Medications prescribed (chart text):</strong><br/>${esc(String(enc.medications_prescribed ?? "")).replace(/\n/g, "<br/>")}</p>
        <p><strong>Follow-up:</strong><br/>${esc(String(enc.follow_up_plan ?? "")).replace(/\n/g, "<br/>")}</p>
        <p class="small">Encounter id: ${esc(id)}</p></div>`;
      })
      .join("");

    const attRows = (attachments ?? [])
      .map(
        (a: Record<string, unknown>) =>
          `<tr><td>${esc(String(a.file_name ?? ""))}</td><td>${esc(String(a.attachment_type ?? ""))}</td><td>${esc(String(a.uploaded_at ?? ""))}</td></tr>`,
      )
      .join("");

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>
      body { font-family: Georgia, serif; font-size: 11pt; color: #222; margin: 32px; }
      h1,h2,h3 { color: #2A2826; }
      .meta { background: #f5f0e8; padding: 12px; border-radius: 6px; margin-bottom: 20px; }
      .page { page-break-after: always; margin-bottom: 24px; }
      .small { font-size: 9pt; color: #666; }
      table { border-collapse: collapse; width: 100%; margin-top: 8px; }
      th, td { border: 1px solid #ccc; padding: 6px; text-align: left; font-size: 10pt; }
    </style></head><body>
    <div class="meta">
      <h1>Elevated Health Augusta — Clinical record export</h1>
      <p><strong>Patient:</strong> ${esc(String((patient as Record<string, unknown>).full_name ?? ""))}</p>
      <p><strong>DOB:</strong> ${esc(String((patient as Record<string, unknown>).dob ?? ""))} &nbsp;
      <strong>Generated:</strong> ${esc(new Date().toISOString())}</p>
    </div>
    <h2>Active allergies</h2><ul>${(allergies ?? [])
      .map(
        (a: Record<string, unknown>) =>
          `<li>${esc(String(a.allergen ?? ""))} — ${esc(String(a.reaction ?? ""))} (${esc(String(a.severity ?? ""))})</li>`,
      )
      .join("")}</ul>
    <h2>Current medications</h2><ul>${(meds ?? [])
      .map(
        (m: Record<string, unknown>) =>
          `<li>${esc(String(m.medication_name ?? ""))} ${esc(String(m.dose ?? ""))} ${esc(String(m.frequency ?? ""))} (EHA: ${m.is_eha_prescribed ? "yes" : "no"})</li>`,
      )
      .join("")}</ul>
    <h2>Problem list (active)</h2><ul>${(problems ?? [])
      .map((p: Record<string, unknown>) => `<li>${esc(String(p.problem ?? ""))} ${esc(String(p.icd10_code ?? ""))}</li>`)
      .join("")}</ul>
    <h2>Signed / amended encounters</h2>
    ${encPages || "<p>No signed encounters in range.</p>"}
    <h2>Attachments index</h2>
    <p class="small">Binary files remain in the secure chart; this export lists metadata only.</p>
    <table><tr><th>File</th><th>Type</th><th>Uploaded</th></tr>${attRows || "<tr><td colspan='3'>None</td></tr>"}</table>
    </body></html>`;

    const pdfApiKey = Deno.env.get("PDFSHIFT_API_KEY");
    if (!pdfApiKey) {
      return new Response(
        JSON.stringify({
          ok: false,
          code: "PDF_GENERATION_NOT_CONFIGURED",
          message: "PDF generation service not configured. Set PDFSHIFT_API_KEY in Supabase secrets.",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const pdfRes = await fetch("https://api.pdfshift.io/v3/convert/pdf", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`api:${pdfApiKey}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ source: html, landscape: false, use_print: false }),
    });
    if (!pdfRes.ok) {
      const errText = await pdfRes.text();
      throw new Error(`PDFShift error ${pdfRes.status}: ${errText.slice(0, 200)}`);
    }
    const pdfBytes = new Uint8Array(await pdfRes.arrayBuffer());
    const path = `exports/${patient_id}/${Date.now()}_chart_export.pdf`;
    const { error: upErr } = await admin.storage.from("encounter-attachments").upload(path, pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    });
    if (upErr) throw upErr;

    const { data: signed, error: signErr } = await admin.storage
      .from("encounter-attachments")
      .createSignedUrl(path, 3600);
    if (signErr || !signed?.signedUrl) throw new Error(signErr?.message ?? "Could not sign URL");

    return new Response(
      JSON.stringify({ ok: true, signed_url: signed.signedUrl, storage_path: path }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
