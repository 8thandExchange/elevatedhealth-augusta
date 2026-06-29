# Elevated Health Augusta — Launch Checklist

**Last updated:** 2026-06-28 (derived from repo state)  
**Brand palette (live tokens in `src/index.css`):** Navy `#00477E` · Steel blue accent `#0A6AA1` · White `#FFFFFF` · Logo gray `#A7A9AC`  
**Typography (live):** Playfair Display + Jost (`tailwind.config.ts`)  
**Frontend:** React + Vite + Tailwind → **Vercel** (`vercel.json`, auto-deploy on push to `main`)  
**Backend:** Supabase (Postgres, Auth, Edge Functions — deploy via Supabase CLI, not Git push)

Canonical pricing: [`docs/pricing/pricing_source_of_truth.md`](docs/pricing/pricing_source_of_truth.md)

---

## Phase 1 — Public storefront

### Brand & design system
- [x] Navy / steel-blue / white tokens in `src/index.css`
- [x] Playfair Display + Jost in `tailwind.config.ts`
- [x] Semantic Tailwind tokens (`primary`, `accent`, `surface`, etc.)
- [ ] TODO: Audit remaining Réveil-era hardcoded hex in edge-function email HTML templates (separate from this checklist)

### Active public service routes (`src/App.tsx`)
- [x] IV Therapy — `/iv-lounge`, `/book/iv/*`
- [x] Hormone Optimization — `/hormones`, `/hormones-women`, `/hormones-men`
- [x] Medical Weight Loss — `/weightloss`, `/weight-loss`
- [x] Peptide Therapy — `/peptides`
- [x] Membership — `/membership`
- [x] Ketamine / Spravato legacy routes redirect home (not offered)
- [x] Sexual wellness & hair restoration routes → `NotFound` (launch-hidden)

### Pricing surfaces (see pricing source of truth — do not duplicate here)
- [x] Wellness Assessment — $79 (documented)
- [x] Lab panels — Comprehensive $199 · Expanded $299 (documented)
- [x] ELEVATED programs — TRT $249 · HRT $229 · GLP-1 sema $349 / tirz $449 · IV $199/mo (documented)
- [x] ELEVATED Metabolic — **retired** (documented)
- [ ] TODO: Pre-launch Stripe **live mode** cutover (test keys still possible in dev — verify secrets before go-live)

### SEO & legal pages
- [x] Privacy, HIPAA notice, Terms, Accessibility routes exist
- [x] `/pricing`, `/faq`, `/how-it-works`
- [ ] TODO: Confirm production meta/OG tags and sitemap on live Vercel deploy

---

## Phase 2 — Booking lanes

### Lane A — IV Lounge (walk-in)
- [x] Public IV booking flow (`/book/iv/*`, screening, slots)
- [x] Stripe IV checkout edge functions present
- [ ] TODO: End-to-end dry run with live Stripe + schedule slots

### Lane B — Consult-gated (hormones, peptides, weight loss)
- [x] Consult prequal + schedule (`/consult`, `/schedule-consult`, `/book/consult`)
- [x] Public intake + consent routes (`/intake`, `/intake/consents`)
- [x] $79 consultation checkout edge function
- [ ] TODO: LabCorp client billing approval + live draw workflow

---

## Phase 3 — Staff / provider portal

- [x] Provider dashboard, schedules (`/provider/*`, `/office/schedule`)
- [x] Formulary, inventory, lab catalog (staff routes)
- [x] Staff reference PDFs in `public/downloads/` (Complete Reference v2.3.0, Quick Card v1.0.4)
- [x] Staff help AI + lab panel recommender edge functions (BAA-gated where PHI may be sent)
- [ ] TODO: Provider DEA / Schedule III onboarding workflow (per `.cursorrules` remaining work)

---

## Phase 4 — Communications

- [x] Resend email — sender consolidated via `supabase/functions/_shared/mail-config.ts` (`RESEND_FROM_EMAIL` secret)
- [x] Twilio SMS (patient/staff notifications)
- [x] Telnyx fax (Rx to compounding pharmacy)
- [ ] TODO: Verify `RESEND_FROM_EMAIL` and domain DNS (SPF/DKIM) in production Resend dashboard

---

## Phase 5 — AI / PHI compliance (pre-launch)

- [x] OpenAI BAA gate — `OPENAI_BAA_ACTIVE` secret required for PHI paths (`_shared/openai-baa-gate.ts`)
- [x] `recommend-lab-panel` — Safe Harbor de-identified payload (`allowWithoutBaa: true`)
- [x] `staff-help-ai` — free-form staff input; **BAA-gated** (PHI possible in questions)
- [x] `parse-zrt-labs` — deterministic text-layer parse first; AI fallback BAA-gated
- [ ] TODO: Execute OpenAI BAA + zero-retention configuration; set `OPENAI_BAA_ACTIVE=true`

---

## Phase 6 — Launch blockers (explicit TODOs)

- [ ] Stripe live mode + webhook endpoint verification
- [ ] Supabase edge functions + migrations deployed to prod (`jiiparpfkjytdcuelcns`)
- [ ] Lab panel catalog seeded in `lab_panels` table
- [ ] Real clinic photography (replace placeholders if any remain)
- [ ] LabCorp account live for client billing
- [ ] Replace synthetic lab PDF text fixtures with real TEST PDFs in `parse-zrt-labs/fixtures/` for parser validation

---

## Operational contact

**Phone (canonical):** (706) 760-3470  
**Address:** 7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809  
**Domain:** elevatedhealthaugusta.com

---

## Deprecated / do not resurrect

- Réveil / ketamine / Spravato storefront
- Bone / camel / charcoal as primary brand (superseded by navy palette in `src/index.css`)
- Legacy single-tier “Elevated Membership $199” as headline offer — use ELEVATED program tiers from pricing doc
- ELEVATED Metabolic bundled program ($599/mo) — retired 2026-06-24
- “Lovable Cloud” as backend — backend is Supabase; frontend on Vercel
