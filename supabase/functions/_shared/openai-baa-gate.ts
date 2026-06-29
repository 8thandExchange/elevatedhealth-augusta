/** OpenAI BAA gate — single chokepoint for PHI-sensitive AI calls. */

export type OpenAiBaaOpts = {
  /** Caller asserts payload is de-identified / non-PHI (Safe Harbor or operational-only). */
  allowWithoutBaa?: boolean;
};

export type OpenAiBaaBlocked = {
  ok: false;
  status: 503;
  error: string;
};

const BAA_DISABLED_MESSAGE =
  "AI features are disabled pending OpenAI BAA confirmation. Set OPENAI_BAA_ACTIVE=true in Supabase secrets once the BAA and zero-retention configuration are in place.";

export function isOpenAiBaaActive(): boolean {
  return Deno.env.get("OPENAI_BAA_ACTIVE") === "true";
}

export function assertOpenAiBaaAllowed(
  opts?: OpenAiBaaOpts,
): OpenAiBaaBlocked | null {
  if (opts?.allowWithoutBaa === true) return null;
  if (isOpenAiBaaActive()) return null;
  return { ok: false, status: 503, error: BAA_DISABLED_MESSAGE };
}
