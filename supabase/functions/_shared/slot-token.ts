import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

export const SLOT_SIGNING_KEY_ENV = "SLOT_SIGNING_KEY";
// IV lane picks a slot before Stripe checkout; allow time for payment + redirect.
export const SLOT_TOKEN_TTL_SECONDS = 90 * 60; // 90 minutes

type SlotTokenPayloadV1 = {
  v: 1;
  pid: string;
  start: string;
  end: string;
  sl: string;
  jti: string;
  iat: number;
  exp: number;
};

export type VerifiedSlotToken = {
  providerId: string;
  startIso: string;
  endIso: string;
  serviceLine: string;
  jti: string;
  issuedAtUnix: number;
  expiresAtUnix: number;
};

const te = new TextEncoder();
const td = new TextDecoder();
const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UUID_ANY_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function b64UrlEncode(input: Uint8Array): string {
  let raw = "";
  for (let i = 0; i < input.length; i++) raw += String.fromCharCode(input[i]);
  return btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64UrlDecode(input: string): Uint8Array {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const raw = atob(normalized + padding);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

async function hmacSha256(secret: string, message: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    te.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, te.encode(message));
  return new Uint8Array(sig);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a[i] ^ b[i];
  return mismatch === 0;
}

function assertIsoDate(value: string, field: string): void {
  if (!value || Number.isNaN(Date.parse(value))) {
    throw new Error(`invalid_slot_token:${field}`);
  }
}

function parsePayload(payload: unknown): SlotTokenPayloadV1 {
  if (!payload || typeof payload !== "object") {
    throw new Error("invalid_slot_token:payload");
  }
  const p = payload as Partial<SlotTokenPayloadV1>;
  if (p.v !== 1) throw new Error("invalid_slot_token:version");
  if (!p.pid || !UUID_ANY_RE.test(p.pid)) throw new Error("invalid_slot_token:pid");
  if (!p.jti || !UUID_V4_RE.test(p.jti)) throw new Error("invalid_slot_token:jti");
  if (!p.sl || typeof p.sl !== "string") throw new Error("invalid_slot_token:sl");
  if (typeof p.iat !== "number" || typeof p.exp !== "number") throw new Error("invalid_slot_token:times");
  if (p.exp <= p.iat) throw new Error("invalid_slot_token:ttl");
  if (!p.start || !p.end) throw new Error("invalid_slot_token:window");
  assertIsoDate(p.start, "start");
  assertIsoDate(p.end, "end");
  return p as SlotTokenPayloadV1;
}

export function getSlotSigningKey(): string | null {
  const key = Deno.env.get(SLOT_SIGNING_KEY_ENV);
  return key && key.trim().length > 0 ? key.trim() : null;
}

export async function issueSlotToken(args: {
  signingKey: string;
  providerId: string;
  slotStartIso: string;
  slotEndIso: string;
  serviceLine: string;
  now?: Date;
}): Promise<{ token: string; jti: string; expUnix: number }> {
  const now = args.now ?? new Date();
  const iat = Math.floor(now.getTime() / 1000);
  const exp = iat + SLOT_TOKEN_TTL_SECONDS;
  const jti = crypto.randomUUID();

  const payload: SlotTokenPayloadV1 = {
    v: 1,
    pid: args.providerId,
    start: args.slotStartIso,
    end: args.slotEndIso,
    sl: args.serviceLine,
    jti,
    iat,
    exp,
  };

  const payloadB64 = b64UrlEncode(te.encode(JSON.stringify(payload)));
  const sig = await hmacSha256(args.signingKey, payloadB64);
  const sigB64 = b64UrlEncode(sig);
  return { token: `v1.${payloadB64}.${sigB64}`, jti, expUnix: exp };
}

export async function verifySlotToken(args: {
  token: string;
  signingKey: string;
  now?: Date;
}): Promise<VerifiedSlotToken> {
  const nowUnix = Math.floor((args.now ?? new Date()).getTime() / 1000);
  const parts = args.token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") {
    throw new Error("invalid_slot_token:format");
  }
  const payloadB64 = parts[1];
  const sigB64 = parts[2];

  const expectedSig = await hmacSha256(args.signingKey, payloadB64);
  const actualSig = b64UrlDecode(sigB64);
  if (!timingSafeEqual(expectedSig, actualSig)) {
    throw new Error("invalid_slot_token:signature");
  }

  const payloadRaw = td.decode(b64UrlDecode(payloadB64));
  const payload = parsePayload(JSON.parse(payloadRaw));

  if (payload.exp < nowUnix) {
    throw new Error("expired_slot_token");
  }

  return {
    providerId: payload.pid,
    startIso: payload.start,
    endIso: payload.end,
    serviceLine: payload.sl,
    jti: payload.jti,
    issuedAtUnix: payload.iat,
    expiresAtUnix: payload.exp,
  };
}

export async function redeemSlotTokenJtiOnce(args: {
  supabaseAdmin: SupabaseClient;
  jti: string;
  tokenExpUnix: number;
  bookingFunction: "book-iv-appointment" | "book-consult-appointment";
  bookingRef?: string | null;
}): Promise<{ ok: true } | { ok: false; code: "slot_token_replayed" }> {
  const nowIso = new Date().toISOString();
  // Best-effort bounded-table cleanup for expired redemption records.
  await args.supabaseAdmin.from("slot_token_redemptions").delete().lt("token_exp", nowIso);

  const tokenExpIso = new Date(args.tokenExpUnix * 1000).toISOString();
  const { error } = await args.supabaseAdmin.from("slot_token_redemptions").insert({
    jti: args.jti,
    token_exp: tokenExpIso,
    booking_function: args.bookingFunction,
    booking_ref: args.bookingRef ?? null,
  });

  if (!error) return { ok: true };
  if (error.code === "23505") {
    return { ok: false, code: "slot_token_replayed" };
  }
  throw error;
}
