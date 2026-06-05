/**
 * Shared OpenAI chat helper for Supabase Edge Functions.
 * Set OPENAI_API_KEY in Supabase → Edge Functions → Secrets.
 * Optional: OPENAI_MODEL (default gpt-4o-mini).
 */

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
  opts?: { temperature?: number; max_tokens?: number },
): Promise<ChatResult> {
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
