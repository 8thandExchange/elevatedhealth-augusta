import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { edgeStructuredLog } from "../_shared/edge-structured-log.ts";
import {
  computeGfeExpiresAtIso,
  mapQualiphyExamStatus,
} from "../_shared/gfe-clearance.ts";
import { corsHeaders, createServiceClient } from "../_shared/intake-magic-link-auth.ts";

interface QualiphyWebhookPayload {
  event?: number;
  exam_status?: string;
  exam_id?: string | number;
  exam_name?: string;
  exam_url?: string | null;
  patient_exam_id?: string | number;
  provider_name?: string | null;
  additional_data?: string;
  reason?: string;
}

function idempotencyKey(payload: QualiphyWebhookPayload): string {
  const examId = payload.patient_exam_id ?? "unknown";
  const event = payload.event ?? 0;
  const status = payload.exam_status ?? "unknown";
  return `${event}:${examId}:${status}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const functionName = "qualiphy-webhook";

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const webhookSecret = Deno.env.get("QUALIPHY_WEBHOOK_SECRET");
  if (webhookSecret) {
    const headerSecret =
      req.headers.get("x-qualiphy-webhook-secret") ??
      req.headers.get("x-webhook-secret");
    if (headerSecret !== webhookSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  let payload: QualiphyWebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Respond immediately — Qualiphy retries on slow handlers.
  const ack = new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

  // Event 2/3 are Rx tracking — EHA uses Qualiphy for GFE clearance only.
  if (payload.event !== 1) {
    edgeStructuredLog(functionName, {
      skipped: true,
      event: payload.event,
      patient_exam_id: payload.patient_exam_id,
    });
    return ack;
  }

  const supabase = createServiceClient();
  const key = idempotencyKey(payload);

  const { error: idempotencyError } = await supabase.from("qualiphy_webhook_events").insert({
    idempotency_key: key,
    event_type: payload.event ?? null,
    patient_exam_id: payload.patient_exam_id?.toString() ?? null,
    payload,
  });

  if (idempotencyError) {
    const pgCode = (idempotencyError as { code?: string }).code;
    if (pgCode === "23505") {
      return ack;
    }
    edgeStructuredLog(functionName, {
      success: false,
      error_message: idempotencyError.message,
      stage: "idempotency_insert",
    });
    return ack;
  }

  try {
    let clearanceId: string | null = null;
    let patientId: string | null = null;

    if (payload.additional_data) {
      try {
        const parsed = JSON.parse(payload.additional_data) as {
          clearance_id?: string;
          patient_id?: string;
        };
        clearanceId = parsed.clearance_id ?? null;
        patientId = parsed.patient_id ?? null;
      } catch {
        /* ignore malformed additional_data */
      }
    }

    const patientExamId = payload.patient_exam_id?.toString();
    const mappedStatus = mapQualiphyExamStatus(payload.exam_status ?? "");

    let clearanceQuery = supabase.from("gfe_clearances").select("*");

    if (clearanceId) {
      clearanceQuery = clearanceQuery.eq("id", clearanceId);
    } else if (patientExamId) {
      clearanceQuery = clearanceQuery.eq("qualiphy_patient_exam_id", patientExamId);
    } else if (patientId) {
      clearanceQuery = clearanceQuery
        .eq("patient_id", patientId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1);
    } else {
      edgeStructuredLog(functionName, { success: false, error_message: "No clearance match keys" });
      return ack;
    }

    const { data: clearance, error: lookupError } = await clearanceQuery.maybeSingle();
    if (lookupError) throw lookupError;
    if (!clearance) {
      edgeStructuredLog(functionName, {
        success: false,
        error_message: "Clearance row not found",
        patient_exam_id: patientExamId,
      });
      return ack;
    }

    const approvedAt = new Date();
    const patch: Record<string, unknown> = {
      status: mappedStatus,
      exam_name: payload.exam_name ?? clearance.exam_name,
      provider_name: payload.provider_name ?? null,
      webhook_payload: payload,
      qualiphy_patient_exam_id: patientExamId ?? clearance.qualiphy_patient_exam_id,
    };

    if (mappedStatus === "approved") {
      patch.approved_at = approvedAt.toISOString();
      patch.expires_at = computeGfeExpiresAtIso(approvedAt);

      if (payload.exam_url) {
        try {
          const pdfRes = await fetch(payload.exam_url);
          if (pdfRes.ok) {
            const bytes = new Uint8Array(await pdfRes.arrayBuffer());
            const storagePath = `gfe/${clearance.patient_id}/${clearance.id}.pdf`;
            const { error: uploadError } = await supabase.storage
              .from("signed-consents")
              .upload(storagePath, bytes, {
                contentType: "application/pdf",
                upsert: true,
              });
            if (!uploadError) {
              patch.pdf_storage_path = storagePath;
            }
          }
        } catch (pdfErr) {
          edgeStructuredLog(functionName, {
            success: false,
            stage: "pdf_mirror",
            error_message: pdfErr instanceof Error ? pdfErr.message : String(pdfErr),
          });
        }
      }
    }

    const { error: updateError } = await supabase
      .from("gfe_clearances")
      .update(patch)
      .eq("id", clearance.id);

    if (updateError) throw updateError;

    edgeStructuredLog(functionName, {
      success: true,
      clearance_id: clearance.id,
      patient_id: clearance.patient_id,
      exam_status: payload.exam_status,
      mapped_status: mappedStatus,
    });
  } catch (error) {
    edgeStructuredLog(functionName, {
      success: false,
      error_message: error instanceof Error ? error.message : String(error),
    });
  }

  return ack;
});
