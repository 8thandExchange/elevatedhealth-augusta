# Launch patient flow — Elevated Health Augusta (LabCorp only)

**Last updated:** 2026-06-03  
**Full runbook (marketing → Rx):** see [CLINIC_OPERATING_RUNBOOK.md](./CLINIC_OPERATING_RUNBOOK.md)  
**Legacy:** ZRT saliva kits and `hormone_mapping_payments` are retired from UI. Historical DB rows may remain.

**Consents:** v1 catalog rows must be `legal_review_status = approved` (migration `20260603180000_consent_v1_go_live.sql`). Intake only serves approved + active versions.

## Lane A — IV (walk-in)

1. Patient books at **/iv-lounge** → Stripe → confirmation.
2. Caroline administers IV; inventory dispense optional.
3. No portal required unless they later enroll in a program.

## Lane B — Consult-gated (hormones, peptides, weight loss)

### Patient-facing steps

| Step | Status (typical) | Who | System |
|------|------------------|-----|--------|
| 1. Pay $79 consult | `consultation_paid` | Patient | Stripe `create-consultation-checkout` |
| 2. Book visit | `consultation_scheduled` | Patient | `book-consult-appointment` |
| 3. Create portal account | `account_created` | Patient | `/patient/create-account` |
| 4. Complete intake + consents | `intake_complete` | Patient | `/patient/intake`, consent routes |
| 5. In-office LabCorp draw | `awaiting_blood_work` → `labs_in_progress` | Kristen/Caroline | Provider chart → **Lab orders (LabCorp)** |
| 6. Results entered / reviewed | `results_ready` → `labs_reviewed` | Provider | **Add lab result**, **Lab results queue** |
| 7. Protocol + membership | `protocol_approved` → `treatment_active` | Provider + patient | Membership Stripe, Rx via FCC |

### Staff checklist (first real patients)

- [ ] Kristen: confirm **Formulary & pricing** and inventory SKUs match what you stock.
- [ ] After consult paid: patient booked on **Office Schedule**.
- [ ] After intake: `lab_path` = **labcorp** on patient row.
- [ ] Provider dashboard → patient → **Lab orders** → pick panel → email requisition (if template) or PDF upload.
- [ ] Advance lab order status through draw → results in → **Mark reviewed**.
- [ ] Enter LabCorp values in **Add lab result** (do not use legacy ZRT parse).
- [ ] Mark labs reviewed → offer **$199 ELEVATED membership** + program Rx.

## Roles & URLs

| Role | Login | Primary surfaces |
|------|-------|------------------|
| Kristen | `/admin/login` | `/office/dashboard`, `/formulary`, `/inventory`, `/office/schedule` |
| Caroline | `/admin/login` | **`/provider/schedule`** (scheduler), `/provider/dashboard`, `/inventory`. Needs `staff` + `provider` in `user_roles` (migration `20260603150000_caroline_portal_roles.sql`). |
| Provider MD | `/admin/login` | `/provider/dashboard` |
| Patient | `/patient/login` | `/patient/dashboard` |

## Known gaps (post-ZRT cleanup)

- Auto-email requisition only for **Hormone — Male** template today; other catalog panels use PDF upload until templates are extended.
- Patient portal shows **hormone + weight** services only (peptides/IV cards still hidden).
- `parse-zrt-labs` edge function name is legacy; it accepts LabCorp PDFs when AI key is configured.
