-- Expand notes_for_reviewer on clinical protocol drafts to granular decision flags
-- for the medical director. Replaces prior checklist text; does not create new versions.
-- Distinct from legacy public.protocols (dispensing recipes).

BEGIN;

UPDATE public.clinical_protocol_versions v
SET notes_for_reviewer = (
  SELECT jsonb_build_array(
  jsonb_build_object(
    'field', 'dosing.medication',
    'current_value', 'Magnesium chloride 1g, calcium gluconate 100mg, B-complex 1mL, B12 1mg, B5 250mg, B6 100mg, vitamin C 5g, in 250mL normal saline',
    'rationale', 'Riordan-style Myers, mid-range vitamin C dose',
    'alternatives', 'Lower-C variants (2g) for first-time patients; pre-mixed bag from Henry Schein vs. compounded in-house',
    'confidence', 'standard',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'pre_administration_checks',
    'current_value', 'BP, HR, allergy review; G6PD status if previously documented',
    'rationale', 'G6PD screening is theoretically important for high-dose IV C but rarely tested in wellness practice',
    'alternatives', 'Add formal G6PD lab to baseline panel; or use symptom-based screening only; or document acceptance of risk in consent',
    'confidence', 'variable',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'dosing.duration',
    'current_value', '30-45 min infusion',
    'rationale', 'Standard rate balancing tolerance and efficiency',
    'alternatives', 'Slower (60 min) for first-time patients; some practices push faster (20-25 min) for established patients',
    'confidence', 'standard',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'monitoring_during',
    'current_value', 'Vitals at start and completion; observation for flushing, nausea',
    'rationale', 'Standard for low-risk infusion',
    'alternatives', 'Q15 min vitals (more cautious); continuous monitoring (overkill for Myers)',
    'confidence', 'standard',
    'resolved', false
  )
  )
),
updated_at = now()
FROM public.clinical_protocols p
WHERE p.slug = 'iv-myers-cocktail'
  AND p.current_version_id = v.id
  AND v.status = 'draft';

UPDATE public.clinical_protocol_versions v
SET notes_for_reviewer = (
  SELECT jsonb_build_array(
  jsonb_build_object(
    'field', 'dosing.medication',
    'current_value', 'NAD+ 250mg in 500mL normal saline',
    'rationale', 'Standard entry-level NAD dose',
    'alternatives', 'Some practices start lower (100-150mg) for first-timers',
    'confidence', 'standard',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'dosing.duration',
    'current_value', '60-90 min for established; 90-120 min for first-time patients',
    'rationale', 'Slower rate dramatically reduces flushing/chest tightness',
    'alternatives', 'Some practices use 60 min flat regardless of experience and pause/slow if symptomatic',
    'confidence', 'variable',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'pre_administration_checks',
    'current_value', 'BP, HR, prior NAD tolerance review',
    'rationale', 'NAD intolerance is subjective and self-reported',
    'alternatives', 'Baseline ECG for first-time patients (some practices); methylation panel',
    'confidence', 'variable',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'administration',
    'current_value', 'Standalone infusion; glutathione push at end available as add-on',
    'rationale', 'Glutathione synergy is anecdotal but commonly offered',
    'alternatives', 'Always-include glutathione; never-include; patient-choice',
    'confidence', 'standard',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'adverse_event_response.moderate',
    'current_value', 'Slow infusion rate; pause if intolerable; restart at slower rate after 5 min',
    'rationale', 'Most NAD reactions are rate-dependent',
    'alternatives', 'Discontinue and reschedule for next visit',
    'confidence', 'standard',
    'resolved', false
  )
  )
),
updated_at = now()
FROM public.clinical_protocols p
WHERE p.slug = 'iv-nad-250mg'
  AND p.current_version_id = v.id
  AND v.status = 'draft';

UPDATE public.clinical_protocol_versions v
SET notes_for_reviewer = (
  SELECT jsonb_build_array(
  jsonb_build_object(
    'field', 'pre_administration_checks',
    'current_value', 'Patient must have tolerated 250mg NAD+ at a prior visit; BP/HR baseline',
    'rationale', 'Step-up requirement protects against unexpectedly severe reactions at higher dose',
    'alternatives', 'Allow 500mg as first dose for low-risk patients (younger, no cardiac history); require 250mg step always',
    'confidence', 'high_stakes',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'dosing.duration',
    'current_value', '90-120 min infusion',
    'rationale', 'Higher dose requires slower rate for tolerance',
    'alternatives', '60-90 min for patients who tolerated 250mg well',
    'confidence', 'standard',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'dosing.medication',
    'current_value', 'NAD+ 500mg in 500mL normal saline',
    'rationale', 'Standard high-dose NAD',
    'alternatives', 'Some practices cap at 500mg; others escalate to 750mg or 1g for select patients',
    'confidence', 'variable',
    'resolved', false
  )
  )
),
updated_at = now()
FROM public.clinical_protocols p
WHERE p.slug = 'iv-nad-500mg'
  AND p.current_version_id = v.id
  AND v.status = 'draft';

UPDATE public.clinical_protocol_versions v
SET notes_for_reviewer = (
  SELECT jsonb_build_array(
  jsonb_build_object(
    'field', 'dosing.dose',
    'current_value', '1-2g IV push',
    'rationale', 'Range covers standard (1g) to enhanced (2g) protocols',
    'alternatives', 'Always 1g; always 2g; 2g only for advanced patients',
    'confidence', 'standard',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'dosing.duration',
    'current_value', 'Push over 5-10 minutes',
    'rationale', 'Faster push increases stinging at IV site; slower push reduces tolerability issues',
    'alternatives', 'Always push slowly (10-15 min); always faster (3-5 min)',
    'confidence', 'standard',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'pre_administration_checks',
    'current_value', 'Allergy review including sulfa allergy screening',
    'rationale', 'Sulfa cross-reactivity is theoretical and debated but commonly screened',
    'alternatives', 'Skip sulfa screening (literature does not support cross-reactivity); document acceptance in consent',
    'confidence', 'variable',
    'resolved', false
  )
  )
),
updated_at = now()
FROM public.clinical_protocols p
WHERE p.slug = 'iv-glutathione-push'
  AND p.current_version_id = v.id
  AND v.status = 'draft';

UPDATE public.clinical_protocol_versions v
SET notes_for_reviewer = (
  SELECT jsonb_build_array(
  jsonb_build_object(
    'field', 'dosing.medication',
    'current_value', 'Bi-Est cream (E2/E3 80:20 ratio) 2mg/g, apply 1mL daily; Progesterone cream 100mg/g, apply 1mL nightly; Testosterone cream 1mg/g, apply 0.25mL daily (lab-guided)',
    'rationale', '80:20 E3:E2 ratio is the most common compounding default; conservative starting doses',
    'alternatives', '50:50 ratio (more E2 effect); 90:10 ratio (less E2 effect, lower endometrial concern); higher starting doses for severe symptoms',
    'confidence', 'high_stakes',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'dosing.medication',
    'current_value', 'Progesterone delivered as transdermal cream',
    'rationale', 'Cream delivery selected for consistency with transdermal protocol',
    'alternatives', 'Oral micronized progesterone 100-200mg nightly (better sleep effect, controversial absorption)',
    'confidence', 'variable',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'pre_administration_checks',
    'current_value', 'Hormone — Female panel reviewed; symptom assessment; mammogram current per age guidelines',
    'rationale', 'Standard pre-BHRT workup',
    'alternatives', 'Add DUTCH metabolite testing (more detailed but adds cost); endometrial thickness ultrasound for higher-risk patients',
    'confidence', 'standard',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'monitoring_post',
    'current_value', 'Recheck Hormone — Female panel at 8 weeks; symptom assessment at 4 weeks',
    'rationale', 'Transdermal steady state reached around 6-8 weeks',
    'alternatives', 'Recheck at 12 weeks (lower-risk patients); recheck at 6 weeks (faster titration practices)',
    'confidence', 'standard',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'dosing.medication',
    'current_value', 'Testosterone added at initiation if labs/symptoms support',
    'rationale', 'Some practices add T at start; others wait until E2/Progesterone optimization fails to resolve symptoms',
    'alternatives', 'Always start with E2/P only, add T at month 3 if needed; always include T at start',
    'confidence', 'variable',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'escalation_criteria',
    'current_value', 'Breast tenderness (mod-severe), abnormal bleeding, mood changes worsening, headache pattern change',
    'rationale', 'Standard BHRT adverse events warranting physician review',
    'alternatives', 'Add specific E2 ceiling threshold (>200 pg/mL = pause)',
    'confidence', 'standard',
    'resolved', false
  )
  )
),
updated_at = now()
FROM public.clinical_protocols p
WHERE p.slug = 'bhrt-female-initiation-transdermal'
  AND p.current_version_id = v.id
  AND v.status = 'draft';

UPDATE public.clinical_protocol_versions v
SET notes_for_reviewer = (
  SELECT jsonb_build_array(
  jsonb_build_object(
    'field', 'dosing.medication',
    'current_value', 'Testosterone cypionate 100-150mg weekly',
    'rationale', 'Conservative starting dose, conventional weekly schedule',
    'alternatives', '200mg weekly start (some practices); E3.5D split dosing for tighter levels (50-75mg twice weekly)',
    'confidence', 'high_stakes',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'dosing.route',
    'current_value', 'Subcutaneous or intramuscular, weekly',
    'rationale', 'SubQ increasingly preferred for steady levels; IM for patients who prefer it',
    'alternatives', 'IM-only default; SubQ-only default',
    'confidence', 'variable',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'pre_administration_checks',
    'current_value', 'Hormone — Male panel; CBC; PSA if ≥40; hematocrit baseline',
    'rationale', 'Standard pre-TRT workup',
    'alternatives', 'Add baseline ECG; add baseline lipid panel specifically for TRT (lipid changes possible)',
    'confidence', 'standard',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'dosing.medication',
    'current_value', 'Anastrozole NOT prescribed prophylactically',
    'rationale', 'Most modern TRT guidance discourages prophylactic AI use; reserved for symptomatic high E2',
    'alternatives', 'Prophylactic anastrozole 0.5mg twice weekly from start (older practice pattern)',
    'confidence', 'high_stakes',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'dosing.medication',
    'current_value', 'Gonadorelin/HCG NOT included at initiation; offered as separate fertility-preservation protocol',
    'rationale', 'Most patients don''t need fertility preservation; separating reduces complexity',
    'alternatives', 'Always include gonadorelin from start (testicular atrophy prevention); offer at initiation as patient choice',
    'confidence', 'variable',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'monitoring_post',
    'current_value', 'Hormone — Male panel + CBC at 6 weeks (trough timing)',
    'rationale', '6-week trough is standard for cypionate half-life',
    'alternatives', '8 weeks (some practices); 4 weeks (faster titration)',
    'confidence', 'standard',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'escalation_criteria',
    'current_value', 'Hematocrit >54% (pause); PSA increase >1.0 ng/mL/year or >1.4 ng/mL absolute; symptomatic E2 elevation',
    'rationale', 'Standard TRT safety thresholds',
    'alternatives', 'Hematocrit 52% as pause threshold (more conservative)',
    'confidence', 'high_stakes',
    'resolved', false
  )
  )
),
updated_at = now()
FROM public.clinical_protocols p
WHERE p.slug = 'male-trt-initiation-compounded-cypionate'
  AND p.current_version_id = v.id
  AND v.status = 'draft';

UPDATE public.clinical_protocol_versions v
SET notes_for_reviewer = (
  SELECT jsonb_build_array(
  jsonb_build_object(
    'field', 'dosing.frequency',
    'current_value', 'Every 3 months until stable, then every 6 months',
    'rationale', 'Quarterly during titration; stretching after stable to reduce cost',
    'alternatives', 'Quarterly indefinitely; every 6 months from start for stable patients',
    'confidence', 'standard',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'pre_administration_checks',
    'current_value', 'Hormone — Female panel; symptom questionnaire (Greene Climacteric Scale or equivalent)',
    'rationale', 'Standard tracking instrument',
    'alternatives', 'Menopause-Specific QoL; informal symptom review only',
    'confidence', 'variable',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'dosing.medication',
    'current_value', 'Adjust dosing per labs and symptoms; target ranges: E2 60-100 pg/mL, P4 5-15 ng/mL, T 30-70 ng/dL',
    'rationale', 'Conservative target ranges',
    'alternatives', 'Higher E2 target (80-150 pg/mL) for symptomatic patients; symptom-driven adjustment without strict lab targets',
    'confidence', 'variable',
    'resolved', false
  )
  )
),
updated_at = now()
FROM public.clinical_protocols p
WHERE p.slug = 'quarterly-hormone-monitoring-female'
  AND p.current_version_id = v.id
  AND v.status = 'draft';

UPDATE public.clinical_protocol_versions v
SET notes_for_reviewer = (
  SELECT jsonb_build_array(
  jsonb_build_object(
    'field', 'dosing.frequency',
    'current_value', 'Every 3 months for first year; every 6 months thereafter if stable; PSA annually for ≥40',
    'rationale', 'More frequent first year captures titration window',
    'alternatives', 'Quarterly indefinitely; every 6 months from start for stable patients',
    'confidence', 'standard',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'dosing.medication',
    'current_value', 'Target Total T 700-1000 ng/dL trough; Free T mid-upper normal range',
    'rationale', 'Standard mid-range optimization target',
    'alternatives', 'Higher target 800-1200 ng/dL (some practices); symptom-driven adjustment without strict lab targets',
    'confidence', 'high_stakes',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'pre_administration_checks',
    'current_value', 'Calculated free T acceptable; equilibrium dialysis if SHBG abnormal',
    'rationale', 'Calculated FT is sufficient for most patients',
    'alternatives', 'Always use equilibrium dialysis (more accurate, higher cost)',
    'confidence', 'variable',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'escalation_criteria',
    'current_value', 'E2 elevation triggers consideration only if symptomatic (gynecomastia, water retention, mood changes)',
    'rationale', 'Asymptomatic high E2 typically does not require treatment',
    'alternatives', 'Treat any E2 >40 pg/mL regardless of symptoms (older practice)',
    'confidence', 'high_stakes',
    'resolved', false
  )
  )
),
updated_at = now()
FROM public.clinical_protocols p
WHERE p.slug = 'quarterly-hormone-monitoring-male'
  AND p.current_version_id = v.id
  AND v.status = 'draft';

UPDATE public.clinical_protocol_versions v
SET notes_for_reviewer = (
  SELECT jsonb_build_array(
  jsonb_build_object(
    'field', 'dosing.dose',
    'current_value', '1.75mg subQ as needed, 30-45 min before intimacy',
    'rationale', 'Matches FDA-approved Vyleesi dose',
    'alternatives', 'Start lower (0.5-1mg) to assess tolerance; titrate up to 1.75mg if needed',
    'confidence', 'variable',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'dosing.frequency',
    'current_value', 'Max 1 dose per 24h; max 8 doses per month',
    'rationale', 'Matches FDA labeling',
    'alternatives', 'More liberal use for stable patients (no strict monthly cap)',
    'confidence', 'standard',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'pre_administration_checks',
    'current_value', 'BP screening: SBP <140, DBP <90 baseline; cardiovascular history review',
    'rationale', 'PT-141 raises BP modestly; uncontrolled HTN is contraindication',
    'alternatives', 'Stricter BP threshold (SBP <135); always require ECG for ≥45',
    'confidence', 'high_stakes',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'pre_administration_checks',
    'current_value', 'First dose can be self-administered at home',
    'rationale', 'Most patients tolerate without clinic monitoring',
    'alternatives', 'Require first dose in clinic for all patients; require first dose in clinic only for higher-risk patients',
    'confidence', 'variable',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'patient_education',
    'current_value', 'Counsel on nausea (40% incidence), facial flushing, headache; ondansetron PRN available',
    'rationale', 'Nausea is the most common dropout reason',
    'alternatives', 'Always co-prescribe ondansetron with first fill; do not offer ondansetron',
    'confidence', 'variable',
    'resolved', false
  )
  )
),
updated_at = now()
FROM public.clinical_protocols p
WHERE p.slug = 'pt141-bremelanotide-initiation'
  AND p.current_version_id = v.id
  AND v.status = 'draft';

UPDATE public.clinical_protocol_versions v
SET notes_for_reviewer = (
  SELECT jsonb_build_array(
  jsonb_build_object(
    'field', 'dosing.dose',
    'current_value', '200-300mcg subQ nightly at bedtime',
    'rationale', 'Standard mid-range starting dose',
    'alternatives', 'Start at 100mcg for tolerance assessment; start at 500mcg for aggressive practices',
    'confidence', 'variable',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'dosing.frequency',
    'current_value', '5 nights per week (off weekends to maintain pulsatile response)',
    'rationale', 'Pulsatility argument: continuous dosing desensitizes GHRH receptor',
    'alternatives', 'Daily dosing (convenience-driven); 5-on/2-off cycle vs. continuous evaluation needed',
    'confidence', 'variable',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'pre_administration_checks',
    'current_value', 'Baseline IGF-1; symptom assessment; sleep quality baseline',
    'rationale', 'IGF-1 is the standard marker',
    'alternatives', 'Add baseline IGFBP-3; add overnight GH sampling (research setting only)',
    'confidence', 'standard',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'monitoring_post',
    'current_value', 'Recheck IGF-1 at 8-12 weeks; target upper-quartile age-adjusted range; never above range',
    'rationale', 'Conservative IGF-1 target reduces theoretical cancer risk',
    'alternatives', 'Target mid-range (more conservative); allow slight overshoot for symptomatic effect',
    'confidence', 'high_stakes',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'escalation_criteria',
    'current_value', 'Discontinue if IGF-1 above age-adjusted range; if no symptomatic improvement at 12 weeks; if hyperglycemia develops',
    'rationale', 'Standard discontinuation criteria',
    'alternatives', 'Allow brief overshoot if symptomatic benefit',
    'confidence', 'standard',
    'resolved', false
  )
  )
),
updated_at = now()
FROM public.clinical_protocols p
WHERE p.slug = 'sermorelin-initiation'
  AND p.current_version_id = v.id
  AND v.status = 'draft';

UPDATE public.clinical_protocol_versions v
SET notes_for_reviewer = (
  SELECT jsonb_build_array(
  jsonb_build_object(
    'field', 'dosing.medication',
    'current_value', 'PDA (Pentadeca Arginate) 500mcg PO daily',
    'rationale', 'Conservative starting dose; PDA is the regulatory-cleared BPC-157 successor',
    'alternatives', '1mg daily (more aggressive); 250mcg twice daily (split dosing)',
    'confidence', 'variable',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'dosing.medication',
    'current_value', 'TB-500 (Thymosin Beta-4) 2.5mg subQ once weekly, 4-8 week course',
    'rationale', 'Matches FCC vial size; standard healing-stack dosing',
    'alternatives', 'Twice-weekly dosing (1.25mg) for steadier levels; 8-week course default vs. 4-week',
    'confidence', 'variable',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'pre_administration_checks',
    'current_value', 'Confirm FCC TB-500 availability and current compliance position before each new patient initiation',
    'rationale', 'TB-500 is on FDA Cat 2 list; FCC compliance position must be verified before sign and before each new patient',
    'alternatives', 'None — this is a regulatory requirement, not a clinical preference',
    'confidence', 'high_stakes',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'monitoring_post',
    'current_value', 'Reassess at 8 weeks; clinical response drives extension or discontinuation',
    'rationale', 'No standard objective marker for healing stack',
    'alternatives', 'Imaging (MRI/ultrasound) for tendon/ligament cases; functional outcome scales',
    'confidence', 'standard',
    'resolved', false
  )
  )
),
updated_at = now()
FROM public.clinical_protocols p
WHERE p.slug = 'healing-stack-pda-tb500-initiation'
  AND p.current_version_id = v.id
  AND v.status = 'draft';

UPDATE public.clinical_protocol_versions v
SET notes_for_reviewer = (
  SELECT jsonb_build_array(
  jsonb_build_object(
    'field', 'dosing.dose',
    'current_value', '0.25mg subQ weekly x4 weeks; escalate to 0.5mg weeks 5-8; then 1mg if tolerated and weight loss inadequate; max 2.4mg',
    'rationale', 'Matches FDA-approved Wegovy escalation schedule',
    'alternatives', '2-week escalation intervals (faster titration, more side effects); 6-week intervals (slower titration); cap at 2mg (more conservative)',
    'confidence', 'high_stakes',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'pre_administration_checks',
    'current_value', 'Weight Optimization panel; CMP, fasting insulin, HbA1c; thyroid; pregnancy test if applicable; MEN2/MTC family history screen',
    'rationale', 'Standard GLP-1 baseline',
    'alternatives', 'Add gallbladder ultrasound (gallstone risk); add pancreatic enzymes baseline',
    'confidence', 'standard',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'pre_administration_checks',
    'current_value', 'BMI threshold ≥27 with comorbidity OR ≥30',
    'rationale', 'Matches FDA-approved indication',
    'alternatives', 'Lower BMI threshold for metabolic indication (insulin resistance, prediabetes); no BMI requirement (cosmetic-driven practices)',
    'confidence', 'high_stakes',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'escalation_criteria',
    'current_value', 'Severe nausea/vomiting unresponsive to ondansetron; signs of pancreatitis; gallbladder symptoms; severe injection-site reactions',
    'rationale', 'Standard GLP-1 adverse events',
    'alternatives', 'Dose reduction strategy before discontinuation (most cases)',
    'confidence', 'standard',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'dosing.duration',
    'current_value', 'Indefinite if tolerated and effective',
    'rationale', 'GLP-1s are increasingly viewed as chronic therapy',
    'alternatives', 'Cycle off after weight loss goals reached (older practice; typically results in regain)',
    'confidence', 'variable',
    'resolved', false
  )
  )
),
updated_at = now()
FROM public.clinical_protocols p
WHERE p.slug = 'compounded-semaglutide-initiation'
  AND p.current_version_id = v.id
  AND v.status = 'draft';

UPDATE public.clinical_protocol_versions v
SET notes_for_reviewer = (
  SELECT jsonb_build_array(
  jsonb_build_object(
    'field', 'dosing.dose',
    'current_value', '2.5mg subQ weekly x4 weeks; escalate to 5mg weeks 5-8; continue 2.5mg increments q4 weeks if tolerated; max 15mg',
    'rationale', 'Matches FDA-approved Mounjaro/Zepbound escalation',
    'alternatives', 'Faster 2-week escalation (more side effects); cap at 10mg (more conservative)',
    'confidence', 'high_stakes',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'dosing.medication',
    'current_value', 'FCC compounded tirzepatide; verify current concentration with each batch',
    'rationale', 'Compounded concentrations vary by pharmacy',
    'alternatives', 'None — concentration verification is required for safety',
    'confidence', 'high_stakes',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'pre_administration_checks',
    'current_value', 'Same as semaglutide protocol; additional hypoglycemia risk screening if patient on other diabetes medications',
    'rationale', 'Tirzepatide has slightly higher hypoglycemia risk than semaglutide due to GIP effect',
    'alternatives', 'Same screening as semaglutide (no additional requirements)',
    'confidence', 'variable',
    'resolved', false
  ),
  jsonb_build_object(
    'field', 'patient_education',
    'current_value', 'GI side effects more common than semaglutide especially weeks 1-4; ondansetron PRN; dietary modifications',
    'rationale', 'Tirzepatide has higher GI side-effect incidence in trials',
    'alternatives', 'Routine ondansetron co-prescription for first month',
    'confidence', 'variable',
    'resolved', false
  )
  )
),
updated_at = now()
FROM public.clinical_protocols p
WHERE p.slug = 'compounded-tirzepatide-initiation'
  AND p.current_version_id = v.id
  AND v.status = 'draft';

COMMIT;