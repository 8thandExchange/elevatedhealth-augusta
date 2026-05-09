-- Seed 13 clinical protocol drafts (system-authored).
-- Safe to re-run: uses ON CONFLICT(slug) on protocols and only inserts
-- version 1 when current_version_id is still NULL (preserves edits if
-- a version was already linked).

BEGIN;


    DO $p1$
    DECLARE
      _protocol_id uuid;
      _version_id uuid;
    BEGIN
      INSERT INTO public.clinical_protocols (slug, title, category, service_type, is_active)
      VALUES ('iv-myers-cocktail', 'IV Myers Cocktail Administration', 'iv', ARRAY['iv_lounge'::text]::text[], true)
      ON CONFLICT (slug) DO UPDATE
        SET title = EXCLUDED.title,
            category = EXCLUDED.category,
            service_type = EXCLUDED.service_type,
            is_active = EXCLUDED.is_active,
            updated_at = now()
      RETURNING id INTO _protocol_id;

      IF (SELECT current_version_id FROM public.clinical_protocols WHERE id = _protocol_id) IS NULL THEN
        INSERT INTO public.clinical_protocol_versions (
          protocol_id,
          version_number,
          status,
          body_markdown,
          body_structured,
          notes_for_reviewer,
          authored_by
        ) VALUES (
          _protocol_id,
          1,
          'draft',
          $p1_md$# IV Myers Cocktail Administration
## Indication

Electrolyte repletion, vitamin supplementation, and general wellness support in appropriate adult patients per clinic criteria.

## Formulation & administration

Magnesium chloride 1g, calcium gluconate 100mg, B-complex 1mL, B12 1mg, B5 250mg, B6 100mg, vitamin C 5g, in 250mL normal saline. Infuse over 30–45 minutes.

## Monitoring

Vital signs per IV lounge policy; observe for flushing, warmth, or phlebitis. Slow or pause infusion for chest tightness, nausea, or patient discomfort.$p1_md$,
          $p1_js${"indication": "Adult IV wellness / nutrient repletion per standing orders.", "contraindications": ["Known allergy to any component", "G6PD deficiency (high-dose IV vitamin C)", "Renal failure without nephrology clearance"], "exclusion_criteria": ["Unstable cardiovascular disease", "Active infection with fever"], "pre_administration_checks": ["Verify identity", "Two RN checks on bag labeling", "Patent IV access"], "dosing": {"medication": "Myers cocktail components as listed", "dose": "Per formulation above", "route": "IV infusion", "frequency": "Per order / membership benefit", "duration": "30–45 minutes"}, "administration": ["Prime line", "Infuse per rate policy", "Dispose sharps per clinic SOP"], "monitoring_during": ["VS q15min first 30min", "Patient comfort"], "monitoring_post": ["Discharge instructions", "Adverse event reporting pathway"], "patient_education": ["Expected warmth/flush", "When to call clinic"], "escalation_criteria": ["Chest pain", "Severe nausea/vomiting", "Urticaria"], "documentation_required": ["IV flowsheet", "Lot numbers if applicable"], "adverse_event_response": {"mild": ["Slow infusion", "Cool compress"], "moderate": ["Provider notification", "Extended observation"], "severe": ["911", "Stop infusion", "Emergency protocol"]}}$p1_js$::jsonb,
          $p1_nt$[{"note": "Verify Myers formulation matches Henry Schein standard pre-mixed bag if you're using one, vs. compounded in-house", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "Confirm 30-45 min infusion rate matches your preference; some clinicians push slower for first-time patients", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "Vitamin C dose of 5g \u2014 verify G6PD screening expectation in your intake (high-dose IV C is contraindicated in G6PD deficiency)", "resolved": false, "resolved_at": null, "resolved_by": null}]$p1_nt$::jsonb,
          NULL
        ) RETURNING id INTO _version_id;

        UPDATE public.clinical_protocols
          SET current_version_id = _version_id,
              updated_at = now()
          WHERE id = _protocol_id;
      END IF;
    END $p1$;


    DO $p2$
    DECLARE
      _protocol_id uuid;
      _version_id uuid;
    BEGIN
      INSERT INTO public.clinical_protocols (slug, title, category, service_type, is_active)
      VALUES ('iv-nad-250mg', 'IV NAD+ 250mg Infusion', 'iv', ARRAY['iv_lounge'::text]::text[], true)
      ON CONFLICT (slug) DO UPDATE
        SET title = EXCLUDED.title,
            category = EXCLUDED.category,
            service_type = EXCLUDED.service_type,
            is_active = EXCLUDED.is_active,
            updated_at = now()
      RETURNING id INTO _protocol_id;

      IF (SELECT current_version_id FROM public.clinical_protocols WHERE id = _protocol_id) IS NULL THEN
        INSERT INTO public.clinical_protocol_versions (
          protocol_id,
          version_number,
          status,
          body_markdown,
          body_structured,
          notes_for_reviewer,
          authored_by
        ) VALUES (
          _protocol_id,
          1,
          'draft',
          $p2_md$# IV NAD+ 250mg Infusion
## Indication

NAD+ repletion in appropriate candidates per clinic policy.

## Dose & dilution

NAD+ 250mg in 500mL normal saline. Infusion 60–90 minutes.

## Side effects

Chest tightness, flushing, nausea — slow rate or pause if intolerable. Consider B-complex pre-medication if prior flushing.$p2_md$,
          $p2_js${"indication": "NAD+ IV therapy 250mg session.", "contraindications": ["Pregnancy/lactation unless cleared", "Unstable angina"], "exclusion_criteria": ["Recent MI without clearance"], "pre_administration_checks": ["Baseline VS", "Pregnancy status if applicable"], "dosing": {"medication": "NAD+", "dose": "250mg", "route": "IV infusion", "frequency": "Per order", "duration": "60–90 min"}, "administration": ["Dilute per pharmacy label", "Gradual rate titration per tolerance"], "monitoring_during": ["VS per IV lounge policy", "Symptom assessment q15–30min"], "monitoring_post": ["Post-infusion check", "Home instructions"], "patient_education": ["Flush/warmth common", "Report chest tightness immediately"], "escalation_criteria": ["Persistent chest pain", "Severe nausea"], "documentation_required": ["Infusion record", "Compound lot if applicable"], "adverse_event_response": {"mild": ["Pause infusion", "Slow rate"], "moderate": ["Provider eval"], "severe": ["911", "Stop infusion"]}}$p2_js$::jsonb,
          $p2_nt$[{"note": "Verify NAD source \u2014 FCC compounded vs. commercial. Affects concentration and dilution math", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "Some clinicians use Glutathione push at end of NAD+ \u2014 confirm if you want this in standard protocol or as add-on", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "First-time patient slower start (90-120 min) \u2014 confirm threshold for 'first-time'", "resolved": false, "resolved_at": null, "resolved_by": null}]$p2_nt$::jsonb,
          NULL
        ) RETURNING id INTO _version_id;

        UPDATE public.clinical_protocols
          SET current_version_id = _version_id,
              updated_at = now()
          WHERE id = _protocol_id;
      END IF;
    END $p2$;


    DO $p3$
    DECLARE
      _protocol_id uuid;
      _version_id uuid;
    BEGIN
      INSERT INTO public.clinical_protocols (slug, title, category, service_type, is_active)
      VALUES ('iv-nad-500mg', 'IV NAD+ 500mg Infusion', 'iv', ARRAY['iv_lounge'::text]::text[], true)
      ON CONFLICT (slug) DO UPDATE
        SET title = EXCLUDED.title,
            category = EXCLUDED.category,
            service_type = EXCLUDED.service_type,
            is_active = EXCLUDED.is_active,
            updated_at = now()
      RETURNING id INTO _protocol_id;

      IF (SELECT current_version_id FROM public.clinical_protocols WHERE id = _protocol_id) IS NULL THEN
        INSERT INTO public.clinical_protocol_versions (
          protocol_id,
          version_number,
          status,
          body_markdown,
          body_structured,
          notes_for_reviewer,
          authored_by
        ) VALUES (
          _protocol_id,
          1,
          'draft',
          $p3_md$# IV NAD+ 500mg Infusion
## Indication

Higher-dose NAD+ session for patients who have tolerated lower doses per clinic criteria.

## Dose & duration

NAD+ 500mg in 500mL normal saline. Infusion 90–120 minutes. Higher likelihood of infusion-related sensations than 250mg.

## Prerequisite

Prior tolerance of 250mg dose recommended before stepping up (physician to confirm exception policy).$p3_md$,
          $p3_js${"indication": "NAD+ IV therapy 500mg session.", "contraindications": ["Same as 250mg pathway"], "exclusion_criteria": ["No prior NAD+ tolerance unless physician-approved exception"], "pre_administration_checks": ["Review prior NAD+ sessions", "VS baseline"], "dosing": {"medication": "NAD+", "dose": "500mg", "route": "IV infusion", "frequency": "Per order", "duration": "90–120 min"}, "administration": ["Longer observation window", "Gradual titration"], "monitoring_during": ["VS q15min early", "Symptom log"], "monitoring_post": ["Extended observation if symptoms"], "patient_education": ["Expect stronger sensations vs 250mg"], "escalation_criteria": ["Chest pain", "Severe nausea", "Hypertensive response"], "documentation_required": ["Session note", "Titration details"], "adverse_event_response": {"mild": ["Pause/slow"], "moderate": ["Provider at bedside"], "severe": ["911"]}}$p3_js$::jsonb,
          $p3_nt$[{"note": "Confirm step-up requirement \u2014 should patients always do 250mg first, or is 500mg first-time acceptable for low-risk patients?", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "Verify max dose ceiling \u2014 some clinicians cap at 500mg per session; others go to 750mg or 1g", "resolved": false, "resolved_at": null, "resolved_by": null}]$p3_nt$::jsonb,
          NULL
        ) RETURNING id INTO _version_id;

        UPDATE public.clinical_protocols
          SET current_version_id = _version_id,
              updated_at = now()
          WHERE id = _protocol_id;
      END IF;
    END $p3$;


    DO $p4$
    DECLARE
      _protocol_id uuid;
      _version_id uuid;
    BEGIN
      INSERT INTO public.clinical_protocols (slug, title, category, service_type, is_active)
      VALUES ('iv-glutathione-push', 'IV Glutathione Push', 'iv', ARRAY['iv_lounge'::text]::text[], true)
      ON CONFLICT (slug) DO UPDATE
        SET title = EXCLUDED.title,
            category = EXCLUDED.category,
            service_type = EXCLUDED.service_type,
            is_active = EXCLUDED.is_active,
            updated_at = now()
      RETURNING id INTO _protocol_id;

      IF (SELECT current_version_id FROM public.clinical_protocols WHERE id = _protocol_id) IS NULL THEN
        INSERT INTO public.clinical_protocol_versions (
          protocol_id,
          version_number,
          status,
          body_markdown,
          body_structured,
          notes_for_reviewer,
          authored_by
        ) VALUES (
          _protocol_id,
          1,
          'draft',
          $p4_md$# IV Glutathione Push
## Indication

Antioxidant support per clinic formulary.

## Administration

Glutathione 1–2g IV push over 5–10 minutes. May stand alone or follow NAD+/Myers per order.

## Monitoring

Observe for nausea, flushing, or injection-site discomfort.$p4_md$,
          $p4_js${"indication": "IV glutathione push.", "contraindications": ["Known hypersensitivity to glutathione product"], "exclusion_criteria": [], "pre_administration_checks": ["Verify dose on order", "Patent IV"], "dosing": {"medication": "Glutathione", "dose": "1–2g per order", "route": "IV push", "frequency": "Per order", "duration": "5–10 min"}, "administration": ["Slow push", "RN at bedside"], "monitoring_during": ["Continuous observation"], "monitoring_post": ["Post-push VS"], "patient_education": ["Metallic taste possible"], "escalation_criteria": ["Bronchospasm", "Anaphylaxis signs"], "documentation_required": ["Push time", "Dose"], "adverse_event_response": {"mild": ["Pause"], "moderate": ["Provider"], "severe": ["911", "epinephrine per ACLS if anaphylaxis"]}}$p4_js$::jsonb,
          $p4_nt$[{"note": "Confirm dose preference \u2014 1g standard, 2g for higher-need patients, or always 2g?", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "Some clinicians require sulfa allergy screening (theoretical cross-reactivity, debated). Confirm your stance", "resolved": false, "resolved_at": null, "resolved_by": null}]$p4_nt$::jsonb,
          NULL
        ) RETURNING id INTO _version_id;

        UPDATE public.clinical_protocols
          SET current_version_id = _version_id,
              updated_at = now()
          WHERE id = _protocol_id;
      END IF;
    END $p4$;


    DO $p5$
    DECLARE
      _protocol_id uuid;
      _version_id uuid;
    BEGIN
      INSERT INTO public.clinical_protocols (slug, title, category, service_type, is_active)
      VALUES ('bhrt-female-initiation-transdermal', 'Female BHRT Initiation (Compounded Transdermal)', 'hormone', ARRAY['hormones'::text,'hormones_women'::text]::text[], true)
      ON CONFLICT (slug) DO UPDATE
        SET title = EXCLUDED.title,
            category = EXCLUDED.category,
            service_type = EXCLUDED.service_type,
            is_active = EXCLUDED.is_active,
            updated_at = now()
      RETURNING id INTO _protocol_id;

      IF (SELECT current_version_id FROM public.clinical_protocols WHERE id = _protocol_id) IS NULL THEN
        INSERT INTO public.clinical_protocol_versions (
          protocol_id,
          version_number,
          status,
          body_markdown,
          body_structured,
          notes_for_reviewer,
          authored_by
        ) VALUES (
          _protocol_id,
          1,
          'draft',
          $p5_md$# Female BHRT Initiation (Compounded Transdermal)
## Indication

Initiate based on labs and symptoms per consult-gated pathway.

## Starting regimen (draft)

Bi-Est (E2/E3) cream 2mg/g — apply 1mL daily. Progesterone cream 100mg/g — apply 1mL nightly (luteal-only if perimenopausal cycling; daily if postmenopausal). Testosterone cream 1mg/g — apply 0.25mL daily optional, lab-guided.

## Follow-up

Recheck labs at 6–8 weeks; adjust toward optimal range.$p5_md$,
          $p5_js${"indication": "Female BHRT initiation with compounded transdermal creams.", "contraindications": ["Undiagnosed vaginal bleeding", "Active estrogen-sensitive malignancy", "Known or suspected pregnancy"], "exclusion_criteria": ["Severe uncontrolled hypertension", "Active thromboembolic disease"], "pre_administration_checks": ["Review hormone panel", "Document symptom scores", "Contraception status if premenopausal"], "dosing": {"medication": "Bi-Est / Progesterone / Testosterone (optional)", "dose": "Per starting regimen above", "route": "Transdermal", "frequency": "Daily / luteal per cycling status", "duration": "Until follow-up"}, "administration": ["Patient counseling on application sites", "Wash hands", "Rotate sites"], "monitoring_during": ["First-month symptom check-in per clinic"], "monitoring_post": ["6–8 week labs", "Dose titration per targets"], "patient_education": ["Transfer precautions", "When to call (clots, breast changes, mood)"], "escalation_criteria": ["New neurologic deficit", "Severe headache", "Chest pain"], "documentation_required": ["Signed order", "Consent", "Lab review note"], "adverse_event_response": {"mild": ["Local irritation"], "moderate": ["Dose adjustment"], "severe": ["Stop therapy", "ED referral"]}}$p5_js$::jsonb,
          $p5_nt$[{"note": "Bi-Est ratio \u2014 most common is 80:20 E3:E2, some prefer 50:50 or 90:10. Confirm your default", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "Starting doses are conservative; some practices start higher based on symptom severity. Confirm your initiation strategy", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "Progesterone \u2014 oral micronized vs. transdermal cream debate; this protocol uses cream. Confirm preference", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "Testosterone for women \u2014 confirm whether this is added at initiation or only after E2/Progesterone optimization fails to resolve symptoms", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "Verify lab-recheck cadence \u2014 6-8 weeks is standard but some practices go 8-12 weeks for transdermal cream steady-state", "resolved": false, "resolved_at": null, "resolved_by": null}]$p5_nt$::jsonb,
          NULL
        ) RETURNING id INTO _version_id;

        UPDATE public.clinical_protocols
          SET current_version_id = _version_id,
              updated_at = now()
          WHERE id = _protocol_id;
      END IF;
    END $p5$;


    DO $p6$
    DECLARE
      _protocol_id uuid;
      _version_id uuid;
    BEGIN
      INSERT INTO public.clinical_protocols (slug, title, category, service_type, is_active)
      VALUES ('male-trt-initiation-compounded-cypionate', 'Male TRT Initiation (Compounded Testosterone Cypionate)', 'hormone', ARRAY['hormones'::text,'hormones_men'::text]::text[], true)
      ON CONFLICT (slug) DO UPDATE
        SET title = EXCLUDED.title,
            category = EXCLUDED.category,
            service_type = EXCLUDED.service_type,
            is_active = EXCLUDED.is_active,
            updated_at = now()
      RETURNING id INTO _protocol_id;

      IF (SELECT current_version_id FROM public.clinical_protocols WHERE id = _protocol_id) IS NULL THEN
        INSERT INTO public.clinical_protocol_versions (
          protocol_id,
          version_number,
          status,
          body_markdown,
          body_structured,
          notes_for_reviewer,
          authored_by
        ) VALUES (
          _protocol_id,
          1,
          'draft',
          $p6_md$# Male TRT Initiation (Compounded Testosterone Cypionate)
## Eligibility (draft)

Total T <300 ng/dL or symptomatic with low free T; hematocrit <50%; PSA appropriate for age; estradiol baseline documented.

## Initiation

Testosterone cypionate 100–150mg weekly IM or subQ per physician order.

## Adjuncts

Anastrozole only if estradiol elevated symptomatically — do not start prophylactically.

## Monitoring

Recheck labs at 6 weeks (trough); adjust dosing.$p6_md$,
          $p6_js${"indication": "Male testosterone replacement initiation.", "contraindications": ["Breast cancer", "Known or suspected prostate cancer", "Desire for fertility without fertility-sparing plan"], "exclusion_criteria": ["Hematocrit ≥50% at baseline", "Severe OSA untreated", "Uncontrolled HF"], "pre_administration_checks": ["PSA age-appropriate", "Hematocrit", "Exam including DRE per policy"], "dosing": {"medication": "Testosterone cypionate (compounded)", "dose": "100–150mg weekly initial (draft)", "route": "IM or subQ per policy", "frequency": "Weekly (or divided per policy)", "duration": "Ongoing with monitoring"}, "administration": ["Injection teaching", "Sharps disposal"], "monitoring_during": ["Symptom response", "Polycythemia surveillance"], "monitoring_post": ["Trough labs at 6 weeks", "Hematocrit trend"], "patient_education": ["Acne/mood changes", "Fertility impact"], "escalation_criteria": ["Hct >54%", "Severe lower urinary symptoms", "Chest pain"], "documentation_required": ["Rx", "Monitoring plan", "Controlled substance log if applicable"], "adverse_event_response": {"mild": ["Acne management"], "moderate": ["Adjust AI if used"], "severe": ["Stop TRT", "Emergency care"]}}$p6_js$::jsonb,
          $p6_nt$[{"note": "Starting dose 100-150mg weekly is conservative; some practices start at 200mg. Confirm your default", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "IM vs. subQ \u2014 subQ is increasingly favored for steady levels but some patients prefer IM. Confirm default route", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "Frequency \u2014 weekly is most common but some prescribe twice-weekly (50-75mg E3.5D) for tighter levels. Confirm", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "Anastrozole \u2014 protocol explicitly says NOT prophylactic. Confirm this aligns with your approach (some clinicians disagree)", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "Gonadorelin/HCG for fertility preservation \u2014 protocol does not include this at initiation. Confirm whether you offer fertility-sparing protocol as separate option or part of standard initiation", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "Recheck cadence \u2014 6 weeks for trough is standard. Confirm", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "Hematocrit ceiling \u2014 protocol uses <50% as starting threshold and >54% as treatment-pause threshold. Confirm", "resolved": false, "resolved_at": null, "resolved_by": null}]$p6_nt$::jsonb,
          NULL
        ) RETURNING id INTO _version_id;

        UPDATE public.clinical_protocols
          SET current_version_id = _version_id,
              updated_at = now()
          WHERE id = _protocol_id;
      END IF;
    END $p6$;


    DO $p7$
    DECLARE
      _protocol_id uuid;
      _version_id uuid;
    BEGIN
      INSERT INTO public.clinical_protocols (slug, title, category, service_type, is_active)
      VALUES ('quarterly-hormone-monitoring-female', 'Quarterly Hormone Monitoring (Female)', 'monitoring', ARRAY['hormones_women'::text]::text[], true)
      ON CONFLICT (slug) DO UPDATE
        SET title = EXCLUDED.title,
            category = EXCLUDED.category,
            service_type = EXCLUDED.service_type,
            is_active = EXCLUDED.is_active,
            updated_at = now()
      RETURNING id INTO _protocol_id;

      IF (SELECT current_version_id FROM public.clinical_protocols WHERE id = _protocol_id) IS NULL THEN
        INSERT INTO public.clinical_protocol_versions (
          protocol_id,
          version_number,
          status,
          body_markdown,
          body_structured,
          notes_for_reviewer,
          authored_by
        ) VALUES (
          _protocol_id,
          1,
          'draft',
          $p7_md$# Quarterly Hormone Monitoring (Female)
## Cadence

Every 3 months: Hormone — Female panel.

## Review

Review symptom score; align dosing with labs and targets.$p7_md$,
          $p7_js${"indication": "Ongoing monitoring for female BHRT patients.", "contraindications": [], "exclusion_criteria": [], "pre_administration_checks": ["Order correct lab panel", "Patient fasting if required by lab"], "dosing": {"medication": "N/A", "dose": "N/A", "route": "N/A", "frequency": "Quarterly", "duration": "Ongoing"}, "administration": ["Phlebotomy per standing order"], "monitoring_during": ["N/A"], "monitoring_post": ["Provider review within defined SLA"], "patient_education": ["Bring medication list"], "escalation_criteria": ["Critical lab values per lab policy"], "documentation_required": ["Lab results filed", "Provider note"], "adverse_event_response": {"mild": [], "moderate": [], "severe": []}}$p7_js$::jsonb,
          $p7_nt$[{"note": "Quarterly is standard; some practices stretch to every 6 months once stable. Confirm cadence", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "Verify symptom-tracking instrument \u2014 Greene Climacteric Scale, Menopause-Specific QoL, custom EHA tool, or informal review?", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "Target ranges for E2, P4, T \u2014 confirm your preferred optimization ranges (these vary by practice)", "resolved": false, "resolved_at": null, "resolved_by": null}]$p7_nt$::jsonb,
          NULL
        ) RETURNING id INTO _version_id;

        UPDATE public.clinical_protocols
          SET current_version_id = _version_id,
              updated_at = now()
          WHERE id = _protocol_id;
      END IF;
    END $p7$;


    DO $p8$
    DECLARE
      _protocol_id uuid;
      _version_id uuid;
    BEGIN
      INSERT INTO public.clinical_protocols (slug, title, category, service_type, is_active)
      VALUES ('quarterly-hormone-monitoring-male', 'Quarterly Hormone Monitoring (Male)', 'monitoring', ARRAY['hormones_men'::text]::text[], true)
      ON CONFLICT (slug) DO UPDATE
        SET title = EXCLUDED.title,
            category = EXCLUDED.category,
            service_type = EXCLUDED.service_type,
            is_active = EXCLUDED.is_active,
            updated_at = now()
      RETURNING id INTO _protocol_id;

      IF (SELECT current_version_id FROM public.clinical_protocols WHERE id = _protocol_id) IS NULL THEN
        INSERT INTO public.clinical_protocol_versions (
          protocol_id,
          version_number,
          status,
          body_markdown,
          body_structured,
          notes_for_reviewer,
          authored_by
        ) VALUES (
          _protocol_id,
          1,
          'draft',
          $p8_md$# Quarterly Hormone Monitoring (Male)
## Cadence

Every 3 months: Hormone — Male panel + CBC.

## Annual

PSA (40+), full thyroid per physician preference.$p8_md$,
          $p8_js${"indication": "Ongoing monitoring for male TRT patients.", "contraindications": [], "exclusion_criteria": [], "pre_administration_checks": ["Order panels", "Identify bleeding risk"], "dosing": {"medication": "N/A", "dose": "N/A", "route": "N/A", "frequency": "Quarterly + annual add-ons", "duration": "Ongoing"}, "administration": ["Phlebotomy"], "monitoring_during": [], "monitoring_post": ["Trough interpretation", "Hematocrit/PSA review"], "patient_education": ["Hydration before draw"], "escalation_criteria": ["Rapid Hct rise", "PSA velocity concern"], "documentation_required": ["Trend graphs in chart"], "adverse_event_response": {"mild": [], "moderate": [], "severe": []}}$p8_js$::jsonb,
          $p8_nt$[{"note": "Confirm target Total T range (most practices target 700-1000 ng/dL trough, some go 800-1200)", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "Free T target \u2014 is calculated free T sufficient or do you require equilibrium dialysis?", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "Estradiol management threshold \u2014 what symptomatic E2 level triggers anastrozole consideration?", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "PSA monitoring frequency for under-40 patients \u2014 confirm your stance", "resolved": false, "resolved_at": null, "resolved_by": null}]$p8_nt$::jsonb,
          NULL
        ) RETURNING id INTO _version_id;

        UPDATE public.clinical_protocols
          SET current_version_id = _version_id,
              updated_at = now()
          WHERE id = _protocol_id;
      END IF;
    END $p8$;


    DO $p9$
    DECLARE
      _protocol_id uuid;
      _version_id uuid;
    BEGIN
      INSERT INTO public.clinical_protocols (slug, title, category, service_type, is_active)
      VALUES ('pt141-bremelanotide-initiation', 'PT-141 (Bremelanotide) Initiation', 'peptide', ARRAY['peptides'::text]::text[], true)
      ON CONFLICT (slug) DO UPDATE
        SET title = EXCLUDED.title,
            category = EXCLUDED.category,
            service_type = EXCLUDED.service_type,
            is_active = EXCLUDED.is_active,
            updated_at = now()
      RETURNING id INTO _protocol_id;

      IF (SELECT current_version_id FROM public.clinical_protocols WHERE id = _protocol_id) IS NULL THEN
        INSERT INTO public.clinical_protocol_versions (
          protocol_id,
          version_number,
          status,
          body_markdown,
          body_structured,
          notes_for_reviewer,
          authored_by
        ) VALUES (
          _protocol_id,
          1,
          'draft',
          $p9_md$# PT-141 (Bremelanotide) Initiation
## Dosing (draft)

1.75mg subQ as needed 30–45 minutes before intimacy. Max 1 dose per 24h; max 8 doses per month.

## Counseling

Nausea (~40%), flushing, headache. Contraindicated in uncontrolled HTN and significant CV disease per policy.$p9_md$,
          $p9_js${"indication": "PT-141 initiation for appropriate peptide-program patients.", "contraindications": ["Uncontrolled hypertension", "Significant cardiovascular disease", "Pregnancy"], "exclusion_criteria": ["BP ≥140/90 at visit"], "pre_administration_checks": ["BP", "Medication review (nitrates, etc.)"], "dosing": {"medication": "Bremelanotide (PT-141)", "dose": "1.75mg", "route": "SubQ", "frequency": "PRN per limits", "duration": "Per package education"}, "administration": ["Injection training", "Storage handling"], "monitoring_during": ["First-dose monitoring if in-clinic policy"], "monitoring_post": ["Follow-up symptom survey"], "patient_education": ["Nausea precautions", "When not to use"], "escalation_criteria": ["Severe hypertension after dose", "Syncope"], "documentation_required": ["Consent", "BP log"], "adverse_event_response": {"mild": ["Antiemetic PRN if policy"], "moderate": ["Provider call"], "severe": ["911"]}}$p9_js$::jsonb,
          $p9_nt$[{"note": "Starting dose 1.75mg matches FDA-approved Vyleesi. Some compounded protocols start at 0.5-1mg to assess tolerance. Confirm preference", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "BP screening threshold \u2014 protocol requires SBP <140/DBP <90 at baseline. Confirm", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "Nausea pre-medication \u2014 some practices offer ondansetron PRN. Confirm if you want this in standard protocol", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "First-dose-in-clinic policy \u2014 some require initial dose administered in clinic for monitoring. Confirm whether you want this for all patients, only those with risk factors, or never required", "resolved": false, "resolved_at": null, "resolved_by": null}]$p9_nt$::jsonb,
          NULL
        ) RETURNING id INTO _version_id;

        UPDATE public.clinical_protocols
          SET current_version_id = _version_id,
              updated_at = now()
          WHERE id = _protocol_id;
      END IF;
    END $p9$;


    DO $p10$
    DECLARE
      _protocol_id uuid;
      _version_id uuid;
    BEGIN
      INSERT INTO public.clinical_protocols (slug, title, category, service_type, is_active)
      VALUES ('sermorelin-initiation', 'Sermorelin Initiation', 'peptide', ARRAY['peptides'::text]::text[], true)
      ON CONFLICT (slug) DO UPDATE
        SET title = EXCLUDED.title,
            category = EXCLUDED.category,
            service_type = EXCLUDED.service_type,
            is_active = EXCLUDED.is_active,
            updated_at = now()
      RETURNING id INTO _protocol_id;

      IF (SELECT current_version_id FROM public.clinical_protocols WHERE id = _protocol_id) IS NULL THEN
        INSERT INTO public.clinical_protocol_versions (
          protocol_id,
          version_number,
          status,
          body_markdown,
          body_structured,
          notes_for_reviewer,
          authored_by
        ) VALUES (
          _protocol_id,
          1,
          'draft',
          $p10_md$# Sermorelin Initiation
## Dosing (draft)

200–300mcg subQ nightly at bedtime, 5 nights per week (off weekends) to preserve pulsatile response.

## Labs

Baseline IGF-1 required; recheck 8–12 weeks; target upper-quartile age-adjusted range, never above lab ULN.$p10_md$,
          $p10_js${"indication": "Sermorelin initiation in peptide program.", "contraindications": ["Active malignancy", "Pregnancy", "IGF-1 above ULN"], "exclusion_criteria": ["Diabetic retinopathy progression concern per endocrine"], "pre_administration_checks": ["Baseline IGF-1", "Sleep apnea symptoms screen"], "dosing": {"medication": "Sermorelin", "dose": "200–300mcg", "route": "SubQ", "frequency": "5 nights/week (draft)", "duration": "Through reassessment"}, "administration": ["Rotate sites", "Reconstitution per pharmacy sheet"], "monitoring_during": ["Sleep quality symptoms"], "monitoring_post": ["IGF-1 at 8–12 weeks"], "patient_education": ["Injection technique video"], "escalation_criteria": ["Joint swelling", "Persistent headache"], "documentation_required": ["IGF trends", "Consent"], "adverse_event_response": {"mild": ["Transient flushing"], "moderate": ["Hold dose", "Provider"], "severe": ["Stop", "ED if neuro signs"]}}$p10_js$::jsonb,
          $p10_nt$[{"note": "Dose 200-300mcg nightly is common; some clinicians start at 100mcg for tolerance. Confirm", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "5-on/2-off vs. daily dosing \u2014 pulsatility argument supports 5-on; convenience supports daily. Confirm preference", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "IGF-1 target range \u2014 confirm your upper bound. Never going above age-adjusted normal is conservative; some target upper quartile, others mid-range", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "Discontinuation criteria \u2014 IGF-1 above range, no symptomatic improvement at 12 weeks, or other? Confirm", "resolved": false, "resolved_at": null, "resolved_by": null}]$p10_nt$::jsonb,
          NULL
        ) RETURNING id INTO _version_id;

        UPDATE public.clinical_protocols
          SET current_version_id = _version_id,
              updated_at = now()
          WHERE id = _protocol_id;
      END IF;
    END $p10$;


    DO $p11$
    DECLARE
      _protocol_id uuid;
      _version_id uuid;
    BEGIN
      INSERT INTO public.clinical_protocols (slug, title, category, service_type, is_active)
      VALUES ('healing-stack-pda-tb500-initiation', 'Healing Stack Initiation (PDA + TB-500)', 'peptide', ARRAY['peptides'::text]::text[], true)
      ON CONFLICT (slug) DO UPDATE
        SET title = EXCLUDED.title,
            category = EXCLUDED.category,
            service_type = EXCLUDED.service_type,
            is_active = EXCLUDED.is_active,
            updated_at = now()
      RETURNING id INTO _protocol_id;

      IF (SELECT current_version_id FROM public.clinical_protocols WHERE id = _protocol_id) IS NULL THEN
        INSERT INTO public.clinical_protocol_versions (
          protocol_id,
          version_number,
          status,
          body_markdown,
          body_structured,
          notes_for_reviewer,
          authored_by
        ) VALUES (
          _protocol_id,
          1,
          'draft',
          $p11_md$# Healing Stack Initiation (PDA + TB-500)
## Indication (draft)

Tendon/ligament injury, post-surgical recovery, inflammatory tissue conditions per physician selection.

## Regimen

PDA (Pentadeca Arginate) 500mcg PO daily ongoing. TB-500 (Thymosin Beta-4) 2.5mg subQ once weekly for 4–8 week course.

## Reassessment

At 8 weeks; extend or discontinue based on response.$p11_md$,
          $p11_js${"indication": "Healing stack for soft-tissue recovery (draft).", "contraindications": ["Pregnancy", "Active malignancy", "TB-500 unavailable per pharmacy/legal"], "exclusion_criteria": ["Anticoagulation instability (physician judgment)"], "pre_administration_checks": ["Imaging/clinical documentation", "FCC formulary verification"], "dosing": {"medication": "PDA + TB-500", "dose": "500mcg daily PO + 2.5mg weekly subQ (draft)", "route": "PO + subQ", "frequency": "Per regimen", "duration": "4–8 weeks TB-500 course"}, "administration": ["Teach subQ injection", "Oral adherence counseling"], "monitoring_during": ["Pain/function scores"], "monitoring_post": ["Week-4 and week-8 review"], "patient_education": ["Injection hygiene", "When to stop"], "escalation_criteria": ["New neurologic deficit", "Signs of infection"], "documentation_required": ["Consent", "Pharmacy release"], "adverse_event_response": {"mild": ["Injection site erythema"], "moderate": ["Hold TB-500"], "severe": ["Allergic reaction protocol"]}}$p11_js$::jsonb,
          $p11_nt$[{"note": "TB-500 IS ON FDA CATEGORY 2 LIST \u2014 verify FCC's current compliance position before this protocol is signed and executed against. If FCC pulls TB-500, this protocol becomes PDA-only", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "PDA dose 500mcg PO daily is conservative; some practices start at 1mg. Confirm", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "TB-500 dose 2.5mg weekly matches FCC's available vial size. Confirm", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "Course length 4-8 weeks \u2014 confirm your default", "resolved": false, "resolved_at": null, "resolved_by": null}]$p11_nt$::jsonb,
          NULL
        ) RETURNING id INTO _version_id;

        UPDATE public.clinical_protocols
          SET current_version_id = _version_id,
              updated_at = now()
          WHERE id = _protocol_id;
      END IF;
    END $p11$;


    DO $p12$
    DECLARE
      _protocol_id uuid;
      _version_id uuid;
    BEGIN
      INSERT INTO public.clinical_protocols (slug, title, category, service_type, is_active)
      VALUES ('compounded-semaglutide-initiation', 'Compounded Semaglutide Initiation', 'weight_loss', ARRAY['weight_loss'::text]::text[], true)
      ON CONFLICT (slug) DO UPDATE
        SET title = EXCLUDED.title,
            category = EXCLUDED.category,
            service_type = EXCLUDED.service_type,
            is_active = EXCLUDED.is_active,
            updated_at = now()
      RETURNING id INTO _protocol_id;

      IF (SELECT current_version_id FROM public.clinical_protocols WHERE id = _protocol_id) IS NULL THEN
        INSERT INTO public.clinical_protocol_versions (
          protocol_id,
          version_number,
          status,
          body_markdown,
          body_structured,
          notes_for_reviewer,
          authored_by
        ) VALUES (
          _protocol_id,
          1,
          'draft',
          $p12_md$# Compounded Semaglutide Initiation
## Titration (draft)

0.25mg subQ weekly ×4 weeks → 0.5mg weekly weeks 5–8 → escalate toward 1mg+ if inadequate response and tolerated. Max 2.4mg weekly.

## Pre-administration labs

Comprehensive metabolic panel, fasting insulin, HbA1c, weight optimization panel per clinic.

## Contraindications

MEN2, personal/family history of medullary thyroid carcinoma — GLP-1 contraindicated.$p12_md$,
          $p12_js${"indication": "Medical weight loss with compounded semaglutide.", "contraindications": ["MTC or MEN2", "Pregnancy", "Personal/family history of MTC"], "exclusion_criteria": ["Type 1 diabetes", "Acute pancreatitis history"], "pre_administration_checks": ["BMI documentation", "Metabolic labs", "Contraception counseling"], "dosing": {"medication": "Semaglutide (compounded)", "dose": "Start 0.25mg weekly (draft titration)", "route": "SubQ", "frequency": "Weekly titration per table", "duration": "Ongoing"}, "administration": ["Injection teaching", "GI side effect anticipatory guidance"], "monitoring_during": ["Weight", "BP", "GI symptoms"], "monitoring_post": ["Monthly check-ins per program"], "patient_education": ["Gallbladder symptoms", "Pancreatitis warning signs"], "escalation_criteria": ["Severe abdominal pain", "Persistent vomiting"], "documentation_required": ["Program consent", "Lab trends"], "adverse_event_response": {"mild": ["OTC antiemetics PRN"], "moderate": ["Hold dose", "Provider"], "severe": ["ED evaluation"]}}$p12_js$::jsonb,
          $p12_nt$[{"note": "Escalation cadence (4-week intervals) matches FDA labeling for branded Wegovy. Some practices use 2-week or 3-week intervals. Confirm", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "Max dose 2.4mg matches branded labeling. Some compounded protocols cap at 2mg. Confirm", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "BMI threshold for initiation \u2014 protocol assumes BMI \u226527 with comorbidity or BMI \u226530. Confirm", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "Mounjaro/Zepbound transition policy \u2014 what's your approach if patient wants to switch from compounded to brand or vice versa?", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "Discontinuation criteria \u2014 typical practice continues indefinitely if tolerated and effective. Confirm or specify pause/cycling protocol", "resolved": false, "resolved_at": null, "resolved_by": null}]$p12_nt$::jsonb,
          NULL
        ) RETURNING id INTO _version_id;

        UPDATE public.clinical_protocols
          SET current_version_id = _version_id,
              updated_at = now()
          WHERE id = _protocol_id;
      END IF;
    END $p12$;


    DO $p13$
    DECLARE
      _protocol_id uuid;
      _version_id uuid;
    BEGIN
      INSERT INTO public.clinical_protocols (slug, title, category, service_type, is_active)
      VALUES ('compounded-tirzepatide-initiation', 'Compounded Tirzepatide Initiation', 'weight_loss', ARRAY['weight_loss'::text]::text[], true)
      ON CONFLICT (slug) DO UPDATE
        SET title = EXCLUDED.title,
            category = EXCLUDED.category,
            service_type = EXCLUDED.service_type,
            is_active = EXCLUDED.is_active,
            updated_at = now()
      RETURNING id INTO _protocol_id;

      IF (SELECT current_version_id FROM public.clinical_protocols WHERE id = _protocol_id) IS NULL THEN
        INSERT INTO public.clinical_protocol_versions (
          protocol_id,
          version_number,
          status,
          body_markdown,
          body_structured,
          notes_for_reviewer,
          authored_by
        ) VALUES (
          _protocol_id,
          1,
          'draft',
          $p13_md$# Compounded Tirzepatide Initiation
## Titration (draft)

2.5mg subQ weekly ×4 weeks → 5mg weeks 5–8 → escalate in 2.5mg increments every 4 weeks if tolerated. Max 15mg weekly.

## Labs

Same pre-administration labs as semaglutide pathway.

## Counseling

GI side effects more common than semaglutide for some patients; hydration and meal-timing strategies.$p13_md$,
          $p13_js${"indication": "Medical weight loss with compounded tirzepatide.", "contraindications": ["MTC or MEN2", "Pregnancy"], "exclusion_criteria": ["Type 1 DM without endocrine co-management"], "pre_administration_checks": ["Diabetes medication inventory", "Renal function", "BMI documentation"], "dosing": {"medication": "Tirzepatide (compounded)", "dose": "Start 2.5mg weekly (draft)", "route": "SubQ", "frequency": "Weekly step-ups per table", "duration": "Ongoing"}, "administration": ["Confirm concentration on vial label each fill"], "monitoring_during": ["Capillary glucose if on secretagogues/insulin"], "monitoring_post": ["Weight trends", "GI tolerability"], "patient_education": ["Hypoglycemia symptoms if on concurrent DM meds"], "escalation_criteria": ["Severe dehydration", "Pancreatitis suspicion"], "documentation_required": ["Pharmacy coordination note"], "adverse_event_response": {"mild": ["Antiemetic PRN"], "moderate": ["Dose hold"], "severe": ["911 if altered mental status with hypoglycemia"]}}$p13_js$::jsonb,
          $p13_nt$[{"note": "Escalation cadence and max dose match Mounjaro/Zepbound labeling. Confirm", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "Anti-emetic prophylaxis during first 2 weeks at each dose step \u2014 some practices offer ondansetron PRN. Confirm", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "Compounded tirzepatide concentration varies by pharmacy; confirm FCC's current concentration and update dosing instructions accordingly", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "Same brand-vs-compounded transition questions as semaglutide protocol", "resolved": false, "resolved_at": null, "resolved_by": null}, {"note": "Hypoglycemia risk \u2014 patients on other diabetes medications need closer monitoring. Confirm screening for concurrent diabetic medications", "resolved": false, "resolved_at": null, "resolved_by": null}]$p13_nt$::jsonb,
          NULL
        ) RETURNING id INTO _version_id;

        UPDATE public.clinical_protocols
          SET current_version_id = _version_id,
              updated_at = now()
          WHERE id = _protocol_id;
      END IF;
    END $p13$;


COMMIT;