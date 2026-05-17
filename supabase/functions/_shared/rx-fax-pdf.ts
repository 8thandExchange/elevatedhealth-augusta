import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/** Convert prescription HTML to a short-lived signed URL Telnyx can fetch as media_url. */
export async function prescriptionHtmlToSignedPdfUrl(
  supabase: SupabaseClient,
  html: string,
  storagePath: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const pdfApiKey = Deno.env.get("PDFSHIFT_API_KEY");
  if (!pdfApiKey) {
    throw new Error("PDFSHIFT_API_KEY not configured");
  }

  const pdfRes = await fetch("https://api.pdfshift.io/v3/convert/pdf", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`api:${pdfApiKey}`)}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source: html,
      landscape: false,
      use_print: false,
      is_hipaa: true,
    }),
  });

  if (!pdfRes.ok) {
    const errText = await pdfRes.text();
    throw new Error(`PDFShift error ${pdfRes.status}: ${errText.slice(0, 200)}`);
  }

  const pdfBytes = new Uint8Array(await pdfRes.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from("encounter-attachments")
    .upload(storagePath, pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data: signed, error: signErr } = await supabase.storage
    .from("encounter-attachments")
    .createSignedUrl(storagePath, expiresInSeconds);

  if (signErr || !signed?.signedUrl) {
    throw new Error(signErr?.message ?? "Could not create signed URL for fax PDF");
  }

  return signed.signedUrl;
}
