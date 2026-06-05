# Clinic operating runbook — Elevated Health Augusta

**Purpose:** End-to-end flow from marketing click → booking → visit → labs → Rx → ongoing care.  
**Audience:** Dennis, Kristen, Caroline, provider MD, and the dev agent maintaining the repo.  
**Last updated:** 2026-06-03

---

## The story in one paragraph

A prospect lands on a beautiful storefront, books (IV immediately or $79 consult for programs), pays via Stripe, gets seen in Evans, completes intake and consents in the portal, Kristen/Caroline run LabCorp blood work, the physician reviews results and approves a protocol, membership and compounded meds ship from FCC via fax Rx — patient feels better and stays on $199/mo Elevated Membership.

---

## Revenue lanes (what to promote)

| Lane | URL | Who pays | Staff owner |
|------|-----|----------|-------------|
| **IV walk-in** | [/iv-lounge](https://elevatedhealthaugusta.com/iv-lounge) | Cash at booking | Caroline |
| **Consult-gated programs** | [/hormones](https://elevatedhealthaugusta.com/hormones), [/peptides](https://elevatedhealthaugusta.com/peptides), [/weight-loss](https://elevatedhealthaugusta.com/weight-loss) | $79 consult → labs → program + optional $199/mo membership | Kristen schedules, provider MD orders |
| **Membership** | [/membership](https://elevatedhealthaugusta.com/membership) | $199/mo recurring | Kristen + Stripe portal |

**Hidden until launch:** hair restoration, sexual wellness (`ACTIVE_SERVICES` off).  
**Not offered:** ketamine/Spravato, retatrutide.

---

## Phase 0 — Go-live checklist (do once)

### A. Consents (required before first program patient signs)

1. **Apply DB migration** `20260603180000_consent_v1_go_live.sql` (marks all v1 rows `legal_review_status = approved`).
2. **Verify in Supabase SQL:**

```sql
SELECT consent_type, version_label, legal_review_status, is_active
FROM consent_versions
WHERE is_active = true
ORDER BY consent_type;
```

Every active row must show `approved`. If any show `pending_review`, intake will block with no document to sign.

3. **Frontend** already enforces: only `is_active` + `approved` versions load in Tier 1/2 intake.
4. **Physician/counsel:** Keep PDF copies of the ten v1 documents on file; use `/admin` consent admin only when publishing *new* versions (requires re-consent plan).

### B. Stripe (real money)

- [ ] Switch Stripe to **live mode**; update Price IDs in `src/lib/stripeConfig.ts` if test IDs were used.
- [ ] Webhook endpoint live: `stripe-webhook` edge function on project `jiiparpfkjytdcuelcns`.
- [ ] Test: $79 consult, $199 membership, one IV booking, one GLP fill (test mode first).

### C. LabCorp

- [ ] Client billing account active.
- [ ] Kristen trained on **Lab orders** tab on provider chart (not legacy ZRT kits).

### D. FCC compounding

- [ ] Fax number and credentials in `send-rx-fax` secrets.
- [ ] Dry-run fax with test patient before first real TRT/GLP script.

### E. Team logins

| Person | Role in app | Login |
|--------|-------------|-------|
| Kristen | `staff` or `admin` | https://elevatedhealthaugusta.com/admin/login |
| Caroline | `staff` | Same |
| Dennis | `business_admin` or `admin` | Same + `/formulary` |
| Provider MD | `provider` | Same → `/provider/dashboard` |

---

## Phase 1 — Marketing (get the click)

**Home** `/` — hero, pillars, contact form → `send-contact-email` (Supabase only, no Meta PII).

**Storefronts** (Pattern A–G, consult + membership CTAs):

- Hormones: `/hormones`, `/hormones-women`, `/hormones-men`
- Peptides: `/peptides`
- Weight: `/weight-loss`
- IV: `/iv-lounge`
- Pricing: `/pricing`

**Booking widget** opens from CTAs → consult Stripe checkout or IV flow.

**Meta Pixel (optional):** Set `VITE_META_PIXEL_ID` in Vercel env; loads via `MarketingPixel` on allowlisted public routes after cookie accept. See `.env.example`.

---

## Phase 2A — IV patient journey (Lane A)

```
Prospect → /iv-lounge → pick drip → Stripe pay → confirmation email
    → walk-in Evans → Caroline administers → (optional) membership upsell at desk
```

**Staff:** Office Schedule shows IV bookings. Inventory dispense optional from `/inventory`.

**No** Tier 2 consents required for IV-only unless they later enroll in a program.

---

## Phase 2B — Program patient journey (Lane B)

### Step 1 — Pay consult ($79)

- Patient: booking modal or `/consult` / `/schedule-consult`
- Stripe: `create-consultation-checkout`
- Status: `consultation_paid`

### Step 2 — Book visit

- Patient picks slot (`book-consult-appointment` / `get-available-slots`)
- Status: `consultation_scheduled`
- **Kristen:** confirm on **Office Schedule** `/office/schedule`

### Step 3 — Portal account + Tier 1 consents

- Patient: `/patient/create-account` then `/patient/intake`
- Signs Tier 1: Terms, HIPAA, General Medical, Telehealth, Communication
- Magic link email if they didn’t finish: `create-intake-magic-link`
- Status moves toward `intake_complete` when intake forms + consents done

### Step 4 — In-office visit (Day 1)

- Caroline/MD: wellness assessment, history, vitals
- **LabCorp draw** same day or scheduled — provider chart → **Lab orders (LabCorp)**
- Set patient `lab_path` = `labcorp` (migration default for new patients)

### Step 5 — Tier 2 consents (before Rx)

When prescribing hormones, GLP-1, or research peptides, patient must sign applicable Tier 2 docs:

- `hormone_therapy` + `off_label` (HRT/TRT)
- `glp1` (weight program)
- `research_peptide` (Cat 2 peptides, Wolverine/PDA stack, etc.)

Routes: `/intake/treatment-consents` or in-clinic kiosk mode on staff tablet.

### Step 6 — Labs in flight

| Action | Who | Where |
|--------|-----|-------|
| Create lab order | Provider | Provider dashboard → patient → **Lab orders** |
| Requisition email/PDF | Provider/Kristen | Auto template for **Hormone — Male**; other panels → upload PDF until templates extended |
| Mark drawn / in progress | Staff | Lab order workflow statuses |
| Enter results | Provider | **Add lab result** (manual LabCorp values; do not rely on ZRT parse) |
| Mark reviewed | Provider | Lab results queue |

Statuses: `awaiting_blood_work` → `labs_in_progress` → `results_ready` → `labs_reviewed`

### Step 7 — Protocol + membership

- Provider approves protocol in chart
- Offer **Elevated Membership** $199/mo (`create-membership-checkout`)
- Patient status: `protocol_approved` → `treatment_active`

### Step 8 — Prescribe (FCC fax)

- Provider: **Prescription portal** / send Rx flow
- **Consent gate** runs: `checkConsentGate` blocks if Tier 2 missing/expired/re-consent overdue
- `send-rx-fax` → FCC (compounded TRT, GLP-1, peptides per formulary)

### Step 9 — Ongoing

- Refills, follow-up labs, re-consent when legal text version changes
- Kristen: membership billing issues via Stripe customer portal
- **Formulary** `/formulary` for pricing/cost Kristen quotes patients

---

## Consent system reference

| Tier | Types | When |
|------|-------|------|
| 1 | terms, HIPAA, general medical, telehealth, communication | Account / intake |
| 2 | hormone_therapy, glp1, off_label, research_peptide | Before program Rx |
| NPP | notice_of_privacy_practices | Available; often bundled in intake |

**Admin:** Consent version publishing (business_admin) — new rows publish as `approved` + `active`; old row deactivated.

**Patient re-sign:** `/intake/reconsent` + email magic links via `trigger-reconsent-requests`.

---

## Internal ops URLs (bookmark these)

| Tool | URL |
|------|-----|
| Office dashboard | `/office/dashboard` |
| Office schedule | `/office/schedule` |
| Provider dashboard | `/provider/dashboard` |
| Formulary & pricing | `/formulary` |
| Inventory | `/inventory` |
| Patient portal | `/patient/dashboard` |

---

## Deploy commands (when code/SQL changes)

**Frontend:** `git push origin main` → Vercel auto-deploy.

**Backend (agent or Dennis):**

```bash
supabase db push   # if CLI linked to jiiparpfkjytdcuelcns
# OR GitHub Actions → "Run SQL (manual)" → migration_file: supabase/migrations/20260603180000_consent_v1_go_live.sql

supabase functions deploy trigger-reconsent-requests --project-ref jiiparpfkjytdcuelcns
```

---

## Lab interpretation (Phase B — provider chart)

On **Provider dashboard → patient → Lab Analysis**, after labs are entered:

1. **LabCorp interpretation** runs automatically (TRT/BHRT/GLP-1/thyroid patterns, ng/dL testosterone).
2. **Protocol suggestions** are advisory; physician must approve.
3. **Save to record** writes `clinical_story` + `treatment_plan` snapshot on `lab_results`.
4. **Apply to order card** pre-selects cream formulary lines (GLP-1 → use Rx portal / FCC).

Logic: `src/lib/labcorpInterpretation.ts`, `src/lib/labcorpMedicationRecommendations.ts`.

---

## Known gaps (honest)

- Lab requisition auto-email: only male hormone template; other panels need PDF upload.
- AI evidence layer (OpenEvidence / BAA LLM + PubMed citations) not wired — deterministic LabCorp rules only. Staff help uses OpenAI (`staff-help-ai`). See `docs/CLINICAL_AI_ROADMAP.md` for Phase B1–B3.
- Patient portal services card: hormones + weight visible; peptides/IV upsell mainly via public site.
- Meta/GA analytics disabled in `index.html` until real IDs + PHI-safe allowlist.
- Stripe **test vs live** must be confirmed before first real charge.

---

## First real patient dry-run (90 minutes)

1. [ ] Book yourself through site (consult + IV separately if possible).
2. [ ] Pay consult in Stripe (test or live).
3. [ ] Complete intake + all Tier 1 consents on phone.
4. [ ] Kristen: see booking on office schedule.
5. [ ] Provider: create lab order, advance status, enter fake/normal labs, mark reviewed.
6. [ ] Sign Tier 2 consents for intended program.
7. [ ] Run consent gate → send test fax (or sandbox) for one medication.
8. [ ] Enroll membership in test mode.

If any step fails, note URL + error — fix before marketing spend.
