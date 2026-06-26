-- Launch readiness: TRT cream-only protocol alignment + retire injectable cypionate draft.

BEGIN;

UPDATE public.clinical_protocols
SET
  is_active = false,
  title = 'Male TRT Initiation (Compounded Testosterone Cypionate) — RETIRED',
  updated_at = timezone('utc', now())
WHERE slug = 'male-trt-initiation-compounded-cypionate'
  AND is_active = true;

UPDATE public.clinical_protocol_versions v
SET
  status = 'retired',
  retired_at = COALESCE(v.retired_at, timezone('utc', now())),
  notes_for_reviewer = COALESCE(v.notes_for_reviewer, '[]'::jsonb) ||
    '["DISCONTINUED 2026-06-26 — men''s TRT is transdermal cream only (HORM-TEST-CREAM-MEN)."]'::jsonb
FROM public.clinical_protocols p
WHERE v.protocol_id = p.id
  AND p.slug = 'male-trt-initiation-compounded-cypionate'
  AND v.status IN ('draft', 'pending_signature', 'signed');

COMMIT;
