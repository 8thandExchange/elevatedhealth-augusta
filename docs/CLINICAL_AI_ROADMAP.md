# Clinical & staff AI roadmap — Elevated Health Augusta

**Last updated:** 2026-06-05

Two lanes:

| Lane | Purpose | PHI? | Status |
|------|---------|------|--------|
| **A — Staff help** | Portal how-to (schedule, inventory, booking) | No patient data | **OpenAI** via `staff-help-ai` |
| **B — Clinical interpretation** | Lab patterns, panel recs, evidence citations | Yes — requires BAA posture | **Partial** (see below) |

---

## Lane A — Staff help (non-clinical) — LIVE

- **UI:** Help button on all `ProviderLayout` pages (`StaffHelpWidget.tsx`)
- **Backend:** `supabase/functions/staff-help-ai`
- **LLM:** OpenAI `gpt-4o-mini` (override with `OPENAI_MODEL` secret)
- **Auth:** JWT + `admin` / `staff` / `provider` / `business_admin`
- **Guardrails:** PII redaction in question text; system prompt blocks medical advice

### One-time setup (Supabase secrets)

1. [OpenAI API keys](https://platform.openai.com/api-keys) → create a project key for EHA
2. Supabase Dashboard → **Project Settings → Edge Functions → Secrets**
3. Add:
   - `OPENAI_API_KEY` = your key
   - (optional) `OPENAI_MODEL` = `gpt-4o-mini` or `gpt-4o`
4. Redeploy edge functions (GitHub Actions auto-deploys on push to `main`, or `supabase functions deploy staff-help-ai`)

Or use GitHub Actions **Set Supabase Secret (manual)** workflow with `OPENAI_API_KEY`.

---

## Lane B — Clinical interpretation — CURRENT STATE

### What IS live today (no OpenEvidence)

**Deterministic LabCorp engine** — rules-based, no external LLM:

- `src/lib/labcorpInterpretation.ts` — TRT/BHRT/GLP-1/thyroid patterns
- `src/lib/labcorpMedicationRecommendations.ts` — formulary hints
- `LabInterpretationPanel` on provider chart (`LabAnalysisCard`)
- Auto-persist on lab save/PDF: `src/lib/persistLabcorpInterpretation.ts` → `NewLabResultModal`

This is **physician decision support**, not autonomous diagnosis. Protocol suggestions are advisory.

### What still uses Lovable gateway (migrate next)

| Function | Purpose | Secret today |
|----------|---------|--------------|
| `recommend-lab-panel` | AI panel recommendation from patient context | `LOVABLE_API_KEY` |
| `parse-zrt-labs` | PDF lab extraction (LabCorp + legacy ZRT) | `LOVABLE_API_KEY` |

**Phase B1 (next engineering session):** Point both at `_shared/openai-chat.ts` + `OPENAI_API_KEY`. Same auth posture as today.

### What is NOT wired (OpenEvidence / evidence layer)

Per `docs/CLINIC_OPERATING_RUNBOOK.md`:

> AI evidence layer (OpenEvidence / BAA LLM + PubMed citations) not wired — deterministic rules only.

**Not built:**

- OpenEvidence API integration
- PubMed / literature citation retrieval on interpretations
- BAA-covered clinical LLM vendor selection and logging
- `clinical-lab-evidence` edge function (planned name)

**Dormant UI:** `LabInterpretationEngine.tsx` — Holgate-style manual entry; not mounted in app (use chart `LabInterpretationPanel` instead).

---

## Lane B — Planned phases

### Phase B1 — De-Lovable clinical helpers (no new vendors)

- [ ] Migrate `recommend-lab-panel` → OpenAI
- [ ] Migrate `parse-zrt-labs` → OpenAI (vision: `gpt-4o` for PDFs)
- [ ] Remove `LOVABLE_API_KEY` from all functions
- [ ] Update `.env.example` and runbook

### Phase B2 — Evidence-augmented interpretation (clinical)

- [ ] New edge function `clinical-lab-evidence` (staff/provider JWT only)
- [ ] Input: anonymized lab snapshot + program hint (no name/DOB in prompt)
- [ ] Output: narrative + **citations** (PubMed IDs or OpenEvidence refs when contracted)
- [ ] UI: optional “Evidence summary” tab on `LabInterpretationPanel` (physician-only)
- [ ] Audit log: who ran AI, model version, prompt hash (no raw PHI in logs)

### Phase B3 — Vendor & compliance

- [ ] Execute BAA with chosen vendor (OpenAI Enterprise, Anthropic, or OpenEvidence partner path)
- [ ] Clinical sign-off on disclaimer copy (“advisory only; physician approves all orders”)
- [ ] Retire or gate any non-BAA LLM calls that touch PHI

---

## Recommendation summary

| Use case | Vendor | Model | When |
|----------|--------|-------|------|
| Staff portal help | **OpenAI** | `gpt-4o-mini` | **Now** |
| Lab PDF parse | **OpenAI** | `gpt-4o` | Phase B1 |
| Panel recommender | **OpenAI** | `gpt-4o-mini` | Phase B1 |
| Evidence + citations | **TBD** (OpenEvidence and/or PubMed + BAA LLM) | TBD | Phase B2–B3 |

**Anthropic** is a valid alternative to OpenAI for all of the above; pick one vendor for ops simplicity unless compliance requires split vendors.

---

## Come back checklist (when ready for clinical evidence)

1. Confirm medical director wants citations on chart vs. internal-only
2. Choose BAA path (OpenAI Enterprise vs. Anthropic vs. OpenEvidence)
3. Implement Phase B1 (Lovable removal) — ~1 session
4. Implement Phase B2 scaffold — ~2 sessions with clinical review
