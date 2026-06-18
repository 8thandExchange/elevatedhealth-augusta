# Launch patient flow — Elevated Health Augusta (LabCorp only)

**Last updated:** 2026-06-21  
**Full runbook (marketing → Rx):** see [CLINIC_OPERATING_RUNBOOK.md](./CLINIC_OPERATING_RUNBOOK.md)

## Lane A — IV (walk-in)

1. Patient books at **/iv-lounge** → screening → Stripe → confirmation.
2. Caroline administers IV; inventory dispense optional.
3. No portal required unless they later enroll in a program.

## Lane B — Consult-gated (hormones, peptides, weight loss)

### Patient-facing steps (canonical order)

| Step | Status (typical) | Who | System |
|------|------------------|-----|--------|
| 1. Browse storefront | — | Patient | Public pages + FAQ |
| 2. Safety screening | `prequal_screening_passed` | Patient | `/consult/start` → `evaluate-consult-prequal` |
| 3. Tier 1 consents | `prequal_consents_complete` | Patient | `/consult/start` → `complete-consult-prequal-consents` |
| 4. Pay $79 consult | `consultation_paid` | Patient | Stripe `create-consultation-checkout` (requires prequal token) |
| 5. Good Faith Exam | `gfe_pending` → `gfe_cleared` | Patient + staff | Auto Qualiphy invite post-payment; `qualiphy-webhook` on approval |
| 6. Book in-person visit | `consultation_scheduled` | Patient | `/schedule-consult` — **GFE gate enforced** in `book-consult-appointment` |
| 7. Create portal account | `account_created` | Patient | `/patient/create-account` |
| 8. Complete intake | `intake_complete` | Patient | `/patient/intake` |
| 9. In-office LabCorp draw | `awaiting_blood_work` → `labs_in_progress` | Staff | Provider chart → Lab orders |
| 10. Results + protocol | `results_ready` → `treatment_active` | Provider + patient | Membership Stripe, Rx via FCC |

### Staff visibility

- **Provider Dashboard** → patient chart: `GfeClearanceCard`, onboarding status, lab orders
- **ConsultationTracker**: paid consult rows awaiting GFE / schedule
- **PatientPipeline**: “Paid — GFE / schedule” bucket (legacy kit labels retired)
- **Eligibility Review Queue**: pre-payment screening blocks

### Staff checklist (first real patients)

- [ ] After consult paid: confirm Qualiphy GFE link delivered (or send manually from chart)
- [ ] After GFE cleared: patient can self-schedule; confirm on **Office Schedule**
- [ ] After intake: `lab_path` = **labcorp** on patient row
- [ ] Provider dashboard → patient → **Lab orders** → panel → draw → results → reviewed
