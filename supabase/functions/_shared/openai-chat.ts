/**
 * Shared OpenAI chat helper for Supabase Edge Functions.
 * Set OPENAI_API_KEY in Supabase → Edge Functions → Secrets.
 * Optional: OPENAI_MODEL (default gpt-4o-mini).
 * PHI paths require OPENAI_BAA_ACTIVE=true unless caller sets allowWithoutBaa.
 */

import { assertOpenAiBaaAllowed, type OpenAiBaaOpts } from "./openai-baa-gate.ts";

export type { OpenAiBaaOpts };

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type ChatResult =
  | { ok: true; content: string }
  | { ok: false; status: number; error: string };

export function getOpenAIConfig() {
  const apiKey = Deno.env.get("OPENAI_API_KEY")?.trim();
  const model = Deno.env.get("OPENAI_MODEL")?.trim() || "gpt-4o-mini";
  return { apiKey, model };
}

export async function openaiChat(
  messages: ChatMessage[],
  opts?: { temperature?: number; max_tokens?: number } & OpenAiBaaOpts,
): Promise<ChatResult> {
  const baaBlock = assertOpenAiBaaAllowed(opts);
  if (baaBlock) return baaBlock;

  const { apiKey, model } = getOpenAIConfig();
  if (!apiKey) {
    return { ok: false, status: 503, error: "OPENAI_API_KEY is not configured in Supabase secrets." };
  }

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: opts?.temperature ?? 0.2,
      max_tokens: opts?.max_tokens ?? 600,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error("openai-chat error", resp.status, text);
    if (resp.status === 429) {
      return { ok: false, status: 429, error: "Rate limit. Try again in a moment." };
    }
    if (resp.status === 401) {
      return { ok: false, status: 503, error: "OpenAI API key invalid. Check OPENAI_API_KEY secret." };
    }
    return { ok: false, status: 500, error: "AI service error." };
  }

  const json = await resp.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) return { ok: false, status: 500, error: "No AI response." };
  return { ok: true, content: String(content) };
}

export type VisionContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export async function openaiVisionChat(
  prompt: string,
  mimeType: string,
  base64Data: string,
  opts?: { model?: string; max_tokens?: number } & OpenAiBaaOpts,
): Promise<ChatResult> {
  const baaBlock = assertOpenAiBaaAllowed(opts);
  if (baaBlock) return baaBlock;

  const { apiKey } = getOpenAIConfig();
  const model = opts?.model?.trim() || Deno.env.get("OPENAI_VISION_MODEL")?.trim() || "gpt-4o";
  if (!apiKey) {
    return { ok: false, status: 503, error: "OPENAI_API_KEY is not configured in Supabase secrets." };
  }

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } },
        ],
      }],
      temperature: 0,
      max_tokens: opts?.max_tokens ?? 800,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error("openai-vision error", resp.status, text);
    if (resp.status === 429) return { ok: false, status: 429, error: "Rate limit. Try again in a moment." };
    return { ok: false, status: 500, error: "AI vision service error." };
  }

  const json = await resp.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) return { ok: false, status: 500, error: "No AI response." };
  return { ok: true, content: String(content) };
}

/** Extract assistant text from OpenAI Responses API payload. */
function extractResponsesApiText(json: Record<string, unknown>): string | null {
  if (typeof json.output_text === "string" && json.output_text.trim()) {
    return json.output_text;
  }
  const output = json.output;
  if (!Array.isArray(output)) return null;
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const block = item as Record<string, unknown>;
    if (block.type !== "message" || !Array.isArray(block.content)) continue;
    for (const part of block.content) {
      if (!part || typeof part !== "object") continue;
      const piece = part as Record<string, unknown>;
      if (piece.type === "output_text" && typeof piece.text === "string" && piece.text.trim()) {
        return piece.text;
      }
    }
  }
  return null;
}

/**
 * Parse a PDF with GPT-4o via the Responses API (native PDF input).
 * Vision image_url does NOT accept application/pdf — use this for LabCorp PDFs.
 */
export async function openaiPdfChat(
  prompt: string,
  base64Data: string,
  opts?: { model?: string; filename?: string } & OpenAiBaaOpts,
): Promise<ChatResult> {
  const baaBlock = assertOpenAiBaaAllowed(opts);
  if (baaBlock) return baaBlock;

  const { apiKey } = getOpenAIConfig();
  const model = opts?.model?.trim() || Deno.env.get("OPENAI_VISION_MODEL")?.trim() || "gpt-4o";
  if (!apiKey) {
    return { ok: false, status: 503, error: "OPENAI_API_KEY is not configured in Supabase secrets." };
  }

  const fileData = `data:application/pdf;base64,${base64Data}`;
  const resp = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_output_tokens: 800,
      input: [{
        role: "user",
        content: [
          { type: "input_text", text: prompt },
          {
            type: "input_file",
            filename: opts?.filename?.trim() || "lab-report.pdf",
            file_data: fileData,
          },
        ],
      }],
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error("openai-pdf error", resp.status, text.slice(0, 500));
    if (resp.status === 429) return { ok: false, status: 429, error: "Rate limit. Try again in a moment." };
    if (resp.status === 401) {
      return { ok: false, status: 503, error: "OpenAI API key invalid. Check OPENAI_API_KEY secret." };
    }
    return { ok: false, status: 500, error: "AI could not read this PDF. Try a photo/screenshot or enter values manually." };
  }

  const json = await resp.json() as Record<string, unknown>;
  const content = extractResponsesApiText(json);
  if (!content) return { ok: false, status: 500, error: "No AI response from PDF parser." };
  return { ok: true, content };
}

export async function openaiChatWithTools(
  messages: ChatMessage[],
  tools: unknown[],
  toolChoice: unknown,
  opts?: { model?: string; temperature?: number } & OpenAiBaaOpts,
): Promise<
  | { ok: true; toolName: string; arguments: string }
  | { ok: false; status: number; error: string }
> {
  const baaBlock = assertOpenAiBaaAllowed(opts);
  if (baaBlock) return baaBlock;

  const { apiKey } = getOpenAIConfig();
  const model = opts?.model?.trim() || Deno.env.get("OPENAI_MODEL")?.trim() || "gpt-4o-mini";
  if (!apiKey) {
    return { ok: false, status: 503, error: "OPENAI_API_KEY is not configured in Supabase secrets." };
  }

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      tools,
      tool_choice: toolChoice,
      temperature: opts?.temperature ?? 0.2,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error("openai-tools error", resp.status, text);
    if (resp.status === 429) return { ok: false, status: 429, error: "Rate limit — try again in a minute." };
    return { ok: false, status: 500, error: "AI service error." };
  }

  const json = await resp.json();
  const toolCall = json?.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall?.function?.arguments) {
    return { ok: false, status: 500, error: "No tool call returned by AI." };
  }
  return {
    ok: true,
    toolName: toolCall.function.name,
    arguments: toolCall.function.arguments,
  };
}
