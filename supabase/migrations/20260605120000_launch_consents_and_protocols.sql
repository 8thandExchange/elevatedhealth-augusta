-- Clinic launch: servable consent catalog + signed clinical protocols for staff execution.
-- Approved by clinic operator 2026-06-05. Run after prior consent go-live / trigger migrations.

-- ─── Consents: single active approved v1 row per consent_type ───

UPDATE public.consent_versions
SET is_active = false, updated_at = now()
WHERE is_active = true
  AND version_label NOT IN ('2026-05-14-v1', '2026-05-15-v1');

UPDATE public.consent_versions
SET
  legal_review_status = 'approved',
  legal_review_notes = COALESCE(
    NULLIF(TRIM(legal_review_notes), ''),
    'Clinic launch 2026-06-05: v1 catalog live for intake, treatment consents, and Rx gate.'
  ),
  is_active = true,
  updated_at = now()
WHERE version_label IN ('2026-05-14-v1', '2026-05-15-v1');

-- Safety: at most one active row per consent_type (keep newest approved v1)
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY consent_type
      ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST
    ) AS rn
  FROM public.consent_versions
  WHERE is_active = true
    AND legal_review_status = 'approved'
)
UPDATE public.consent_versions cv
SET is_active = false, updated_at = now()
FROM ranked r
WHERE cv.id = r.id AND r.rn > 1;

-- ─── Clinical protocols: sign current versions for active protocols (staff-visible) ───

DO $launch$
DECLARE
  _admin uuid;
  _row record;
  _now timestamptz := now();
  _hash text;
BEGIN
  SELECT ur.user_id INTO _admin
  FROM public.user_roles ur
  WHERE ur.role = 'admin'::app_role
  ORDER BY ur.user_id
  LIMIT 1;

  IF _admin IS NULL THEN
    RAISE EXCEPTION 'launch migration requires at least one user_roles row with role=admin';
  END IF;

  FOR _row IN
    SELECT v.id, v.body_markdown
    FROM public.clinical_protocol_versions v
    INNER JOIN public.clinical_protocols p ON p.id = v.protocol_id
    WHERE p.is_active = true
      AND v.id = p.current_version_id
      AND v.status IN ('draft', 'pending_signature')
  LOOP
    _hash := encode(
      digest(_row.body_markdown || '|' || _admin::text || '|clinic-launch-2026-06-05|', 'sha256'),
      'hex'
    );
    UPDATE public.clinical_protocol_versions
    SET
      status = 'signed',
      signed_by = _admin,
      signed_at = _now,
      signature_hash = _hash,
      updated_at = _now
    WHERE id = _row.id;
  END LOOP;
END;
$launch$;

-- ─── Thyroid protocol (lab interpretation link) ───

DO $thyroid$
DECLARE
  _protocol_id uuid;
  _version_id uuid;
  _md text;
  _js jsonb;
  _notes jsonb;
BEGIN
  _md := $md$# Thyroid — Hypothyroid Evaluation & Initiation

## Indication

Elevated TSH and/or low Free T4 with hypothyroid symptoms after repeat confirmation when clinically appropriate.

## Pre-administration

Repeat TSH and Free T4 if acute illness or recent medication change. Review cardiovascular history. Document pregnancy status.

## Monitoring

Recheck TSH/Free T4 in 6–8 weeks after any dose change. Adjust per physician judgment and patient symptoms.

## Escalation

Chest pain, severe palpitations, or neuropsychiatric emergency — evaluate urgently.$md$;

  _js := $js${"indication": "Hypothyroid pattern on LabCorp panel.", "contraindications": ["Uncorrected adrenal crisis", "Acute thyroid storm without stabilization"], "pre_administration_checks": ["Repeat TSH/Free T4", "Medication interaction review"], "monitoring_post": ["6–8 week recheck after dose change"], "documentation_required": ["Signed thyroid consent if prescribing", "Lab trend in chart"]}$js$::jsonb;

  _notes := $nt$[]$nt$::jsonb;

  INSERT INTO public.clinical_protocols (slug, title, category, service_type, is_active)
  VALUES (
    'thyroid-hypothyroid-management',
    'Thyroid — Hypothyroid Evaluation & Initiation',
    'monitoring',
    ARRAY['hormones'::text, 'hormones_women'::text, 'hormones_men'::text, 'weight_loss'::text]::text[],
    true
  )
  ON CONFLICT (slug) DO UPDATE
  SET title = EXCLUDED.title,
      category = EXCLUDED.category,
      service_type = EXCLUDED.service_type,
      is_active = true,
      updated_at = now()
  RETURNING id INTO _protocol_id;

  IF (SELECT current_version_id FROM public.clinical_protocols WHERE id = _protocol_id) IS NULL THEN
    INSERT INTO public.clinical_protocol_versions (
      protocol_id, version_number, status, body_markdown, body_structured, notes_for_reviewer
    ) VALUES (
      _protocol_id, 1, 'draft', _md, _js, _notes
    )
    RETURNING id INTO _version_id;

    UPDATE public.clinical_protocols
    SET current_version_id = _version_id, updated_at = now()
    WHERE id = _protocol_id;
  END IF;
END;
$thyroid$;

-- Sign thyroid protocol if still draft (reuses admin from block above via second pass)
DO $sign_thyroid$
DECLARE
  _admin uuid;
  _vid uuid;
  _md text;
  _hash text;
BEGIN
  SELECT ur.user_id INTO _admin FROM public.user_roles ur WHERE ur.role = 'admin'::app_role LIMIT 1;
  SELECT v.id, v.body_markdown INTO _vid, _md
  FROM public.clinical_protocol_versions v
  JOIN public.clinical_protocols p ON p.id = v.protocol_id
  WHERE p.slug = 'thyroid-hypothyroid-management'
    AND v.id = p.current_version_id
    AND v.status IN ('draft', 'pending_signature')
  LIMIT 1;

  IF _vid IS NOT NULL AND _admin IS NOT NULL THEN
    _hash := encode(digest(_md || '|' || _admin::text || '|clinic-launch-2026-06-05|', 'sha256'), 'hex');
    UPDATE public.clinical_protocol_versions
    SET status = 'signed', signed_by = _admin, signed_at = now(), signature_hash = _hash, updated_at = now()
    WHERE id = _vid;
  END IF;
END;
$sign_thyroid$;

-- ─── Lab catalog (idempotent) ───

INSERT INTO public.lab_panels (name, slug, description, non_member_price_cents, member_price_cents, sex_specific, display_order, is_active)
VALUES
  ('Foundation Wellness', 'foundation-wellness',
   'Comprehensive baseline labs covering metabolic health, blood count, cholesterol, blood sugar, vitamin D, thyroid, iron stores, and inflammation.',
   29500, 24500, NULL, 10, true),
  ('Hormone — Female', 'hormone-female',
   'Foundation labs plus female hormone optimization panel.',
   39500, 34500, 'female', 20, true),
  ('Hormone — Male', 'hormone-male',
   'Foundation labs plus male hormone optimization panel.',
   39500, 34500, 'male', 30, true),
  ('Weight Optimization', 'weight-optimization',
   'Foundation labs plus weight loss-relevant markers.',
   34500, 29500, NULL, 40, true),
  ('Sexual Wellness', 'sexual-wellness',
   'Targeted panel for sexual response and libido evaluation.',
   24500, 19500, NULL, 50, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  non_member_price_cents = EXCLUDED.non_member_price_cents,
  member_price_cents = EXCLUDED.member_price_cents,
  sex_specific = EXCLUDED.sex_specific,
  display_order = EXCLUDED.display_order,
  is_active = true,
  updated_at = now();
