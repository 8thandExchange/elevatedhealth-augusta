# Run SQL (manual) — GitHub Actions

Workflow: **Actions → Run SQL (manual)** on `8thandExchange/elevatedhealth-augusta`.

Applies SQL to production Supabase (`jiiparpfkjytdcuelcns`) via the Management API and `SUPABASE_ACCESS_TOKEN` repo secret.

## Critical rule (avoids false failure emails)

**When using `migration_file`:** the path must already exist on the **`main` branch** at the commit GitHub checks out.

1. Commit and push the `.sql` file under `supabase/migrations/`.
2. Wait for the push to finish on GitHub.
3. Then dispatch the workflow with `migration_file` = that path.

If you run the workflow **before** the file is on `main`, the job fails with:

```text
Migration file not found: supabase/migrations/....sql
```

That failure does **not** mean the database is broken — only that the runner could not read the file.

## Inputs

| Input | Use when |
|-------|----------|
| `migration_file` | Full migration file in the repo (preferred) |
| `sql` | One-off statement; no file needed (good for verification `SELECT`s) |

`migration_file` takes precedence over `sql`.

## Examples

**After push:**

```text
migration_file: supabase/migrations/20260604100000_enforce_approved_before_active.sql
```

**Verification only (no file on main required):**

```text
sql: SELECT consent_type, legal_review_status FROM consent_versions WHERE is_active = true;
```

## Local alternative

If the CLI is linked: `supabase db push` against project `jiiparpfkjytdcuelcns`.

Git push alone does **not** run this workflow — dispatch it explicitly when you need production SQL applied.
