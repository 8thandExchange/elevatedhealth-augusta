const QUALIPHY_API_BASE = Deno.env.get("QUALIPHY_API_BASE") ?? "https://api.qualiphy.me";

export interface QualiphyExamInvitePayload {
  api_key: string;
  exams: number[];
  first_name: string;
  last_name: string;
  email: string;
  dob: string;
  phone_number: string;
  state: string;
  tele_state: string;
  webhook_url: string;
  additional_data?: string;
  redirect_approve?: string;
  redirect_reject?: string;
}

export interface QualiphyExamInviteResponse {
  http_code?: number;
  meeting_url?: string;
  meeting_uuid?: string;
  patient_exams?: Array<{
    patient_exam_id: number;
    exam_title?: string;
    exam_id?: number;
  }>;
  error?: string;
  message?: string;
}

export function getQualiphyExamIds(): number[] {
  const multi = Deno.env.get("QUALIPHY_GFE_EXAM_IDS");
  if (multi) {
    return multi
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n) && n > 0);
  }
  const single = Deno.env.get("QUALIPHY_GFE_EXAM_ID");
  if (single) {
    const n = parseInt(single, 10);
    if (Number.isFinite(n) && n > 0) return [n];
  }
  return [];
}

export function qualiphyWebhookUrl(): string {
  const explicit = Deno.env.get("QUALIPHY_WEBHOOK_URL");
  if (explicit) return explicit;
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!supabaseUrl) throw new Error("SUPABASE_URL required for Qualiphy webhook URL");
  return `${supabaseUrl}/functions/v1/qualiphy-webhook`;
}

export async function createQualiphyExamInvite(
  payload: QualiphyExamInvitePayload,
): Promise<QualiphyExamInviteResponse> {
  const res = await fetch(`${QUALIPHY_API_BASE}/api/exam_invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as QualiphyExamInviteResponse;
  if (!res.ok) {
    throw new Error(data.message ?? data.error ?? `Qualiphy API error (${res.status})`);
  }
  if (!data.meeting_url) {
    throw new Error("Qualiphy did not return a meeting URL");
  }
  return data;
}
