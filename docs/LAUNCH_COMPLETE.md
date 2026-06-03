# Launch complete — consents & protocols (2026-06-05)

## Consents (patient-servable)

Migration: `supabase/migrations/20260605120000_launch_consents_and_protocols.sql`

- All v1 catalog rows (`2026-05-14-v1`, `2026-05-15-v1`) → `legal_review_status = approved`, `is_active = true`
- Competing active rows per `consent_type` deactivated
- App serves only `is_active` + `approved` (`src/lib/consents/consent-catalog.ts`)

**Verify in Supabase SQL:**

```sql
SELECT consent_type, version_label, is_active, legal_review_status
FROM consent_versions
WHERE is_active = true
ORDER BY consent_type;
```

Expect **10 rows**, all `approved`.

**Patient paths:** `/intake/consents` (Tier 1) → `/intake/treatment-consents` (Tier 2 when applicable) → Rx gate in provider portal.

## Clinical protocols

Same migration signs all **current** protocol versions for **active** protocols (requires one `admin` in `user_roles`).

Adds **thyroid-hypothyroid-management** and signs it for lab interpretation links.

**Verify:**

```sql
SELECT p.slug, v.status, v.signed_at IS NOT NULL AS signed
FROM clinical_protocols p
JOIN clinical_protocol_versions v ON v.id = p.current_version_id
WHERE p.is_active = true
ORDER BY p.slug;
```

Expect `status = signed` for launch set.

## Lab panels

Five named panels re-seeded idempotently in the same migration (`lab_panels`).

## Apply to production

1. Push migration file to `main`
2. **Actions → Run SQL (manual)** → `migration_file`: `supabase/migrations/20260605120000_launch_consents_and_protocols.sql`
3. Run verification SQL above

Frontend deploys via Vercel on git push; backend SQL is manual per `docs/RUN_SQL_WORKFLOW.md`.
