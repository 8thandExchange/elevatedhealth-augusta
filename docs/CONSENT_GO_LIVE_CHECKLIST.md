# Consent go-live smoke test (Task A4)

Run after: v1 rows `approved` + active, trigger `trg_enforce_approved_before_active` applied, frontend deployed.

- [ ] Tier 1 intake (`/patient/intake` → `/intake/consents`) — five docs render, `consent_records` created
- [ ] Tier 2 (`/intake/treatment-consents`) — four treatment docs when applicable
- [ ] Magic link: create → consume once; expired link rejected
- [ ] Re-consent fan-out + `/intake/reconsent`
- [ ] Rx gate: `PrescriptionPortalModal` blocks missing/expired; passes with valid records
- [ ] Substance acknowledgment path
- [ ] Admin: cannot publish without legal ack; DB trigger blocks `is_active=true` without `approved`
- [ ] NPP lists Privacy Officer: Troy Akers, DO
