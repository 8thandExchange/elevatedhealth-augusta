# Voice Session Edge Function — Investigation (2026-05-13)

## Summary

`supabase/functions/voice-session/index.ts` creates an **OpenAI Realtime API** session (`POST https://api.openai.com/v1/realtime/sessions`) with model `gpt-4o-realtime-preview-2024-12-17`, voice `sage`, server VAD, and a long `instructions` string that embeds legacy `PUBLIC_KNOWLEDGE` plus administrative-only rules. It returns the JSON body from OpenAI to the client (ephemeral session credentials). **No database writes** in this function.

## 1. What the function does

- Handles `OPTIONS` with CORS headers.
- Requires `OPENAI_API_KEY`.
- Calls OpenAI Realtime `sessions` to mint a **browser/WebRTC-oriented** realtime session with custom `instructions` and a `capture_lead` tool definition (`ketamine`, `hormone`, etc. in the enum).
- Returns `JSON.stringify(data)` on success or `{ error }` on failure.

## 2. Frontend references

- Grep `src/` for `voice-session` / `invoke("voice-session")`: **no matches** found in a prior audit of this repo (no patient or staff UI calling it by name).

## 3. `supabase/config.toml`

- Present: `[functions.voice-session]` with `verify_jwt = false` (publicly invokable if deployed).

## 4. Database side effects

- **None** in this file (no Supabase client usage).

## 5. Other edge functions

- **No** references from other `supabase/functions/*` callers found in routine greps for `voice-session`.

## 6. Telephony (Twilio, Vapi, etc.)

- **No** Twilio or third-party telephony SDK. Only **OpenAI Realtime** HTTP API. Any phone integration would have to be elsewhere (not in this file).

## 7. Environment variables / secrets

- **`OPENAI_API_KEY`** — required; missing key throws before the fetch.

## 8. Assessment: dormant vs production

| Signal | Finding |
|--------|---------|
| Frontend `invoke("voice-session")` | **None** in `src/` |
| DB writes | **None** |
| Config | **Deployed route** exists (`verify_jwt = false`) |
| Instructions content | **Legacy** (ketamine/SPRAVATO, $99/$149 consult copy, ZRT kit narrative) — misaligned with current public SOT |

**Best guess:** **Experimental or dormant** — wired for a future in-browser voice assistant using OpenAI Realtime, but **not integrated** with the current React app. If the route is still deployed in Supabase, it is a **low-traffic / unused** surface unless an external client calls it.

**Recommendation:** Do **not** delete in this PR. Follow-up: either remove the deployed function + config entry if product confirms no use, or refactor instructions to match `chat` SOT and add an explicit authenticated/allowlisted caller if voice is revived.
