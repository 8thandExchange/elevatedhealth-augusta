-- Merge provider dosing algorithms into clinical_protocol_versions.body_structured (framework v2).
-- Safe to re-run: merges provider_algorithm key without overwriting other structured fields.

BEGIN;

DO $merge$
DECLARE
  _rec record;
BEGIN
  FOR _rec IN
    SELECT * FROM (VALUES
      ('compounded-semaglutide-initiation', '{"provider_algorithm":{"start_dose":"0.25 mg subQ weekly × 4 weeks","escalation_schedule":"Increase 0.25 mg q4 weeks per tolerance","frequency":"Weekly","route":"Subcutaneous","hold_rules":["Persistent vomiting","eGFR <30 without clearance"],"stop_rules":["Pancreatitis suspected","Pregnancy"],"monitoring_labs":["Expanded baseline","Quarterly CMP","A1C"],"adverse_effect_monitoring":["Nausea","Constipation"],"refill_rules":"Monthly program fill","follow_up_interval":"Monthly RN","documentation_required":["GLP-1 consent"]}}'::jsonb),
      ('compounded-tirzepatide-initiation', '{"provider_algorithm":{"start_dose":"2.5 mg subQ weekly × 4 weeks","escalation_schedule":"Increase 2.5 mg q4 weeks","frequency":"Weekly","route":"Subcutaneous","monitoring_labs":["Expanded baseline","Quarterly CMP"],"refill_rules":"Monthly after tolerance documented","follow_up_interval":"Monthly RN","documentation_required":["GLP-1 consent"]}}'::jsonb),
      ('sermorelin-initiation', '{"provider_algorithm":{"start_dose":"100–200 mcg subQ nightly","escalation_schedule":"To 300 mcg over 2–4 weeks","frequency":"Nightly","route":"Subcutaneous","monitoring_labs":["IGF-1 baseline q12w"],"follow_up_interval":"Monthly RN ×3","documentation_required":["Injection teaching"]}}'::jsonb),
      ('pt141-bremelanotide-initiation', '{"provider_algorithm":{"start_dose":"1 mg subQ PRN","frequency":"PRN max 2/24h","route":"Subcutaneous","monitoring_labs":["Sexual wellness panel when indicated"],"documentation_required":["Sexual wellness consent"]}}'::jsonb),
      ('healing-stack-pda-tb500-initiation', '{"provider_algorithm":{"start_dose":"PDA oral daily; TB-500 weekly if policy-active","route":"Oral/subQ","hold_rules":["TB-500 hold if active infection"],"documentation_required":["Research peptide consent","PDA default vs BPC policy"]}}'::jsonb),
      ('male-trt-initiation-compounded-cypionate', '{"provider_algorithm":{"start_dose":"80–120 mg weekly IM/subQ","escalation_schedule":"Adjust q6–8w per labs","frequency":"Weekly","route":"IM/subQ","monitoring_labs":["Male hormone panel q6–12w"],"documentation_required":["Hormone therapy consent"]}}'::jsonb),
      ('bhrt-female-initiation-transdermal', '{"provider_algorithm":{"start_dose":"Bi-Est 0.5–1.5 mg daily transdermal","frequency":"Daily","route":"Transdermal","monitoring_labs":["Female hormone panel"],"documentation_required":["Hormone therapy consent"]}}'::jsonb)
    ) AS t(slug, algo)
  LOOP
    UPDATE public.clinical_protocol_versions v
    SET body_structured = COALESCE(v.body_structured, '{}'::jsonb) || _rec.algo,
        updated_at = now()
    FROM public.clinical_protocols p
    WHERE p.id = v.protocol_id
      AND p.slug = _rec.slug
      AND v.id = p.current_version_id;
  END LOOP;
END $merge$;

-- Insert metabolic recomposition protocol if missing (program-only retatrutide stack).
INSERT INTO public.clinical_protocols (slug, title, category, service_type, is_active)
VALUES (
  'metabolic-recomposition-stack',
  'ELEVATED Metabolic Recomposition Stack',
  'weight_loss',
  ARRAY['weight_loss', 'metabolic_recomposition']::text[],
  true
)
ON CONFLICT (slug) DO UPDATE
  SET title = EXCLUDED.title,
      category = EXCLUDED.category,
      service_type = EXCLUDED.service_type,
      is_active = EXCLUDED.is_active,
      updated_at = now();

DO $metabolic$
DECLARE
  _pid uuid;
  _vid uuid;
BEGIN
  SELECT id INTO _pid FROM public.clinical_protocols WHERE slug = 'metabolic-recomposition-stack';
  IF _pid IS NULL THEN RETURN; END IF;

  IF (SELECT current_version_id FROM public.clinical_protocols WHERE id = _pid) IS NULL THEN
    INSERT INTO public.clinical_protocol_versions (
      protocol_id, version_number, status, body_markdown, body_structured, notes_for_reviewer
    ) VALUES (
      _pid,
      1,
      'draft',
      '# ELEVATED Metabolic Recomposition
## Indication
Advanced 90-day provider-directed metabolic recomposition — program enrollment only.

## Policy
Retatrutide anchor per policy override 2026-06-14 (Dr. Akers). Not offered as casual à la carte.

## Phases
See metabolicStackConfig.ts for phased SS-31, NAD+, GH-axis layers.',
      '{"provider_algorithm":{"start_dose":"Retatrutide 0.5 mg weekly phase 1","escalation_schedule":"90-day phased stack — physician only","program_only":true,"monitoring_labs":["Expanded panel","Quarterly metabolic","IGF-1 when GH active"],"documentation_required":["GLP-1 consent","Program enrollment"]}}'::jsonb,
      '[]'::jsonb
    ) RETURNING id INTO _vid;

    UPDATE public.clinical_protocols SET current_version_id = _vid, updated_at = now() WHERE id = _pid;
  ELSE
    UPDATE public.clinical_protocol_versions v
    SET body_structured = COALESCE(v.body_structured, '{}'::jsonb) || '{"provider_algorithm":{"program_only":true,"start_dose":"Retatrutide 0.5 mg weekly phase 1","documentation_required":["GLP-1 consent","Program enrollment"]}}'::jsonb,
        updated_at = now()
    FROM public.clinical_protocols p
    WHERE p.id = v.protocol_id AND p.slug = 'metabolic-recomposition-stack' AND v.id = p.current_version_id;
  END IF;
END $metabolic$;

COMMIT;
