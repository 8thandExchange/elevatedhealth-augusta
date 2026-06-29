-- Seed 4 IV prescription injectable add-on protocol drafts (Toradol, Zofran, Benadryl, Pepcid).
-- is_active = false, status = draft — not administrable until Dr. Akers signs.
-- Safe to re-run: ON CONFLICT(slug) on protocols; version 1 inserted only when current_version_id IS NULL.
-- body_structured uses the same keys as existing IV clinical protocols (ClinicalProtocolEditor).
-- Source: docs/clinical/EHA_Injectable_Protocol_Drafts.md

BEGIN;

    DO $toradol$
    DECLARE
      _protocol_id uuid;
      _version_id uuid;
    BEGIN
      INSERT INTO public.clinical_protocols (slug, title, category, service_type, is_active)
      VALUES (
        'iv-addon-ketorolac-toradol',
        'Ketorolac (Toradol) Add-On Administration',
        'iv',
        ARRAY['iv_lounge'::text]::text[],
        false
      )
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
          $toradol_md$# Ketorolac (Toradol) Add-On Administration
## Indication

Acute pain and inflammation in the IV-lounge setting. Adjunct for headache, migraine, and musculoskeletal pain, and a component of recovery infusions. Single-dose use.

## Standing-order authorization

Administered by RN under physician standing orders after the screening gate below. Hold and contact provider for any contraindication or uncertainty.

## Absolute contraindications

Known hypersensitivity to ketorolac, aspirin, or other NSAIDs. Aspirin-exacerbated respiratory disease. Active or recent GI bleed, peptic ulcer, or perforation. Suspected cerebrovascular bleeding. Bleeding disorder or therapeutic anticoagulation. Advanced renal impairment or volume depletion. Pregnancy, especially third trimester. Labor and delivery. Breastfeeding. Perioperative CABG.

## Cautions (reduce dose or contact provider)

Age over 65. Weight under 50 kg. Any renal impairment. History of GI ulcer. Heart failure or uncontrolled hypertension. Concurrent diuretics, ACE inhibitors, or ARBs. Concurrent other NSAIDs.

## Dosing

15 to 30 mg IV or IM, single dose. Default 30 mg for healthy adults under 65 and over 50 kg. Reduce to 15 mg if age over 65, weight under 50 kg, or any renal impairment. Maximum 120 mg per day. Not for more than 5 consecutive days.

## Route and rate

IM into a large muscle, or IV push undiluted over at least 15 seconds.

## Pre-administration checks

BP, HR, NSAID and aspirin allergy review, GI bleed history, anticoagulant and bleeding history, renal history, pregnancy and breastfeeding status, and age and weight for dose selection.

## Monitoring

Observe for allergic reaction. Check injection site. Vitals per IV-lounge standard.

## Adverse-event response

Allergic reaction or anaphylaxis means stop, go to the Emergency / Anaphylaxis protocol, epinephrine, EMS. GI bleeding signs (melena, hematemesis, severe abdominal pain) mean hold further NSAIDs, contact provider, evaluate.$toradol_md$,
          $toradol_js${
            "indication": "Acute pain and inflammation in the IV-lounge setting; adjunct for headache, migraine, musculoskeletal pain; single-dose use.",
            "contraindications": [
              "Hypersensitivity to ketorolac, aspirin, or other NSAIDs",
              "Aspirin-exacerbated respiratory disease",
              "Active or recent GI bleed, ulcer, or perforation",
              "Suspected cerebrovascular bleeding",
              "Bleeding disorder or therapeutic anticoagulation",
              "Advanced renal impairment or volume depletion",
              "Pregnancy (especially third trimester), labor and delivery, breastfeeding",
              "Perioperative CABG"
            ],
            "exclusion_criteria": [
              "Age over 65",
              "Weight under 50 kg",
              "Renal impairment",
              "GI ulcer history",
              "Heart failure or uncontrolled hypertension",
              "Concurrent diuretics, ACE inhibitors, or ARBs",
              "Concurrent other NSAIDs"
            ],
            "pre_administration_checks": [
              "BP and HR",
              "NSAID and aspirin allergy review",
              "GI bleed history",
              "Anticoagulant and bleeding history",
              "Renal history",
              "Pregnancy and breastfeeding status",
              "Age and weight for dose selection"
            ],
            "dosing": {
              "medication": "Ketorolac",
              "dose": "15 to 30 mg single dose; default 30 mg (healthy adult under 65 and over 50 kg); reduce to 15 mg if age over 65, weight under 50 kg, or renal impairment; max 120 mg/day, not more than 5 consecutive days",
              "route": "IM into large muscle, or IV push undiluted",
              "frequency": "Single dose",
              "duration": "IV push over at least 15 seconds"
            },
            "administration": [
              "RN under physician standing orders after screening gate; hold and contact provider for any contraindication",
              "IV push undiluted over at least 15 seconds, or IM into large muscle"
            ],
            "monitoring_during": [
              "Observe for allergic reaction",
              "Check injection site",
              "Vitals per IV-lounge standard"
            ],
            "monitoring_post": ["Observe before discharge per IV-lounge policy"],
            "patient_education": ["NSAID bleeding and GI risk counseling as applicable"],
            "escalation_criteria": [
              "Allergic reaction or anaphylaxis",
              "GI bleeding signs (melena, hematemesis, severe abdominal pain)"
            ],
            "documentation_required": ["IV flowsheet", "Dose, route, and lot", "Screening checklist"],
            "adverse_event_response": {
              "mild": ["Hold if localized reaction", "Provider notification"],
              "moderate": ["Stop administration", "Hold further NSAIDs", "Provider eval"],
              "severe": ["Emergency/Anaphylaxis protocol", "Epinephrine per protocol", "911/EMS"]
            }
          }$toradol_js$::jsonb,
          $toradol_nt$[
            {
              "field": "dosing.default",
              "current_value": "30 mg",
              "rationale": "Confirm 30 mg vs 15 mg as the default single dose for the IV-lounge population.",
              "alternatives": "Default 15 mg for conservative IV-lounge population",
              "confidence": "standard",
              "resolved": false
            },
            {
              "field": "standing_order_scope",
              "current_value": "RN under standing orders",
              "rationale": "Confirm RN may administer under standing order vs requires individualized provider order per encounter, given the GCMB May 2026 statement.",
              "alternatives": "Individualized provider order required per encounter",
              "confidence": "variable",
              "resolved": false
            },
            {
              "field": "renal_screening",
              "current_value": "history-based",
              "rationale": "Is a recent creatinine required, or is symptom/history-based renal screening acceptable?",
              "alternatives": "Require recent creatinine before first ketorolac dose",
              "confidence": "variable",
              "resolved": false
            }
          ]$toradol_nt$::jsonb,
          NULL
        ) RETURNING id INTO _version_id;

        UPDATE public.clinical_protocols
          SET current_version_id = _version_id,
              updated_at = now()
          WHERE id = _protocol_id;
      END IF;
    END $toradol$;


    DO $zofran$
    DECLARE
      _protocol_id uuid;
      _version_id uuid;
    BEGIN
      INSERT INTO public.clinical_protocols (slug, title, category, service_type, is_active)
      VALUES (
        'iv-addon-ondansetron-zofran',
        'Ondansetron (Zofran) Add-On Administration',
        'iv',
        ARRAY['iv_lounge'::text]::text[],
        false
      )
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
          $zofran_md$# Ondansetron (Zofran) Add-On Administration
## Indication

Prevention and treatment of nausea in the IV lounge, including NAD+-associated nausea, migraine-associated nausea, and recovery infusions.

## Standing-order authorization

RN under physician standing orders after the screening gate. Hold and contact provider for any contraindication or uncertainty.

## Absolute contraindications

Known hypersensitivity to ondansetron or other 5-HT3 antagonists. Congenital long QT syndrome. Concurrent apomorphine (risk of profound hypotension).

## Cautions

Personal or family history of QT prolongation or arrhythmia. Electrolyte abnormalities (hypokalemia, hypomagnesemia). Concurrent QT-prolonging drugs. Concurrent serotonergic drugs (SSRIs, SNRIs, triptans, MAOIs) due to serotonin-syndrome risk. Severe hepatic impairment (cap at 8 mg per day).

## Dosing

4 mg IV or IM, single dose. May repeat once per provider order. Maximum single IV dose 16 mg. Do not exceed.

## Route and rate

IM, or IV over 2 to 5 minutes. Not faster, due to QT risk.

## Pre-administration checks

BP, HR, allergy review, cardiac and long-QT history, and current-medication review for QT-prolonging and serotonergic agents.

## Monitoring

Observe. For known cardiac risk, consider rhythm monitoring per provider.

## Adverse-event response

Allergic reaction means Emergency protocol. Serotonin-syndrome signs (agitation, clonus, hyperthermia, autonomic instability) mean stop, contact provider, EMS as needed. Syncope or palpitations mean evaluate, ECG, provider.$zofran_md$,
          $zofran_js${
            "indication": "Prevention and treatment of nausea in the IV lounge, including NAD+-associated, migraine-associated, and recovery infusions.",
            "contraindications": [
              "Hypersensitivity to ondansetron or other 5-HT3 antagonists",
              "Congenital long QT syndrome",
              "Concurrent apomorphine"
            ],
            "exclusion_criteria": [
              "History of QT prolongation or arrhythmia",
              "Electrolyte abnormalities (hypokalemia, hypomagnesemia)",
              "Concurrent QT-prolonging drugs",
              "Concurrent serotonergic drugs (SSRIs, SNRIs, triptans, MAOIs)",
              "Severe hepatic impairment (cap 8 mg/day)"
            ],
            "pre_administration_checks": [
              "BP and HR",
              "Allergy review",
              "Cardiac and long-QT history",
              "Medication review for QT-prolonging and serotonergic agents"
            ],
            "dosing": {
              "medication": "Ondansetron",
              "dose": "4 mg single dose; may repeat once per provider order; single IV dose not to exceed 16 mg",
              "route": "IM, or IV",
              "frequency": "Single dose (repeat per provider order only)",
              "duration": "IV over 2 to 5 minutes"
            },
            "administration": [
              "RN under physician standing orders after screening gate",
              "IV over 2 to 5 minutes — not faster (QT risk)"
            ],
            "monitoring_during": [
              "Observe",
              "Consider rhythm monitoring for known cardiac risk per provider"
            ],
            "monitoring_post": ["Observe before discharge"],
            "patient_education": ["Report palpitations, syncope, or agitation immediately"],
            "escalation_criteria": [
              "Serotonin-syndrome signs",
              "Syncope or palpitations",
              "Allergic reaction"
            ],
            "documentation_required": ["IV flowsheet", "Dose and route", "Cardiac risk note if applicable"],
            "adverse_event_response": {
              "mild": ["Slow rate if tolerated", "Provider notification"],
              "moderate": ["Stop administration", "Provider eval", "ECG if indicated"],
              "severe": ["Emergency protocol", "911/EMS if indicated"]
            }
          }$zofran_js$::jsonb,
          $zofran_nt$[
            {
              "field": "dosing.repeat",
              "current_value": "4 mg, repeat once per provider order",
              "rationale": "Confirm default 4 mg and whether a repeat is permitted under standing order or requires provider contact.",
              "alternatives": "No repeat without provider contact",
              "confidence": "standard",
              "resolved": false
            },
            {
              "field": "qt_screening",
              "current_value": "history-based",
              "rationale": "Require baseline ECG or electrolytes for patients on QT-prolonging meds, or is history-based screening acceptable?",
              "alternatives": "Baseline ECG for patients on QT-prolonging medications",
              "confidence": "variable",
              "resolved": false
            },
            {
              "field": "standing_order_scope",
              "current_value": "RN under standing orders",
              "rationale": "Confirm RN administration under standing order vs individualized order per encounter, given the GCMB May 2026 statement.",
              "alternatives": "Individualized provider order required per encounter",
              "confidence": "variable",
              "resolved": false
            }
          ]$zofran_nt$::jsonb,
          NULL
        ) RETURNING id INTO _version_id;

        UPDATE public.clinical_protocols
          SET current_version_id = _version_id,
              updated_at = now()
          WHERE id = _protocol_id;
      END IF;
    END $zofran$;


    DO $benadryl$
    DECLARE
      _protocol_id uuid;
      _version_id uuid;
    BEGIN
      INSERT INTO public.clinical_protocols (slug, title, category, service_type, is_active)
      VALUES (
        'iv-addon-diphenhydramine-benadryl',
        'Diphenhydramine (Benadryl) Add-On Administration',
        'iv',
        ARRAY['iv_lounge'::text]::text[],
        false
      )
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
          $benadryl_md$# Diphenhydramine (Benadryl) Add-On Administration
## Indication

Mild allergic symptoms, pre-medication, and adjunct H1 blockade in mild allergic or infusion reactions. Acute anaphylaxis is governed by the Emergency / Anaphylaxis protocol, not this one.

## Standing-order authorization

RN under physician standing orders after the screening gate. In an acute reaction, the Emergency protocol governs.

## Contraindications and cautions

Known hypersensitivity. Narrow-angle glaucoma. Symptomatic BPH or urinary retention. Sedation risk and any plan to drive (advise no driving). Elderly (anticholinergic burden, fall and confusion risk, use the lower dose). Concurrent MAOIs. Concurrent CNS depressants or alcohol.

## Dosing

25 to 50 mg IV or IM, single dose. Use 25 mg in elderly or sedation-sensitive patients.

## Route and rate

IM, or IV slow push, diluted, over a few minutes. Rapid IV increases sedation and hypotension.

## Pre-administration checks

Allergy review, glaucoma and urinary-retention history, age, transport and driving plan due to sedation, and current sedating medications.

## Monitoring

Sedation level. Observe before discharge. Ensure safe transport.

## Adverse-event response

Oversedation means monitor airway, supportive care, provider. Paradoxical excitation (especially children and elderly) means provider. Anticholinergic toxicity signs mean provider or EMS.$benadryl_md$,
          $benadryl_js${
            "indication": "Mild allergic symptoms, pre-medication, adjunct H1 blockade in mild reactions. Anaphylaxis governed by Emergency protocol.",
            "contraindications": [
              "Known hypersensitivity",
              "Narrow-angle glaucoma",
              "Symptomatic BPH or urinary retention"
            ],
            "exclusion_criteria": [
              "Sedation risk or plan to drive",
              "Elderly (use lower dose)",
              "Concurrent MAOIs",
              "Concurrent CNS depressants or alcohol"
            ],
            "pre_administration_checks": [
              "Allergy review",
              "Glaucoma and urinary-retention history",
              "Age",
              "Transport and driving plan due to sedation",
              "Current sedating medications"
            ],
            "dosing": {
              "medication": "Diphenhydramine",
              "dose": "25 to 50 mg single dose; use 25 mg in elderly or sedation-sensitive patients",
              "route": "IM, or IV slow push diluted",
              "frequency": "Single dose",
              "duration": "Slow IV over a few minutes"
            },
            "administration": [
              "RN under physician standing orders after screening gate; Emergency protocol governs acute reactions",
              "IV slow push diluted over a few minutes — rapid IV increases sedation and hypotension"
            ],
            "monitoring_during": [
              "Sedation level",
              "Observe before discharge",
              "Ensure safe transport"
            ],
            "monitoring_post": ["Confirm no driving before discharge"],
            "patient_education": ["No driving after dose", "Sedation expected"],
            "escalation_criteria": [
              "Oversedation or airway concern",
              "Paradoxical excitation",
              "Anticholinergic toxicity signs"
            ],
            "documentation_required": ["IV flowsheet", "Dose and route", "Transport plan documented"],
            "adverse_event_response": {
              "mild": ["Supportive care", "Provider notification"],
              "moderate": ["Monitor airway", "Provider eval"],
              "severe": ["Provider or EMS", "Emergency protocol if anaphylaxis"]
            }
          }$benadryl_js$::jsonb,
          $benadryl_nt$[
            {
              "field": "dosing.default",
              "current_value": "25 to 50 mg",
              "rationale": "Confirm default 25 vs 50 mg and the elderly threshold for the lower dose.",
              "alternatives": "Default 25 mg for all IV-lounge patients",
              "confidence": "standard",
              "resolved": false
            },
            {
              "field": "discharge_policy",
              "current_value": "no driving",
              "rationale": "Confirm discharge and driving policy after IV diphenhydramine.",
              "alternatives": "Require confirmed ride before administration",
              "confidence": "variable",
              "resolved": false
            },
            {
              "field": "emergency_overlap",
              "current_value": "Emergency protocol governs anaphylaxis",
              "rationale": "Confirm cross-reference so staff know which protocol governs in an acute reaction.",
              "alternatives": "",
              "confidence": "standard",
              "resolved": false
            }
          ]$benadryl_nt$::jsonb,
          NULL
        ) RETURNING id INTO _version_id;

        UPDATE public.clinical_protocols
          SET current_version_id = _version_id,
              updated_at = now()
          WHERE id = _protocol_id;
      END IF;
    END $benadryl$;


    DO $pepcid$
    DECLARE
      _protocol_id uuid;
      _version_id uuid;
    BEGIN
      INSERT INTO public.clinical_protocols (slug, title, category, service_type, is_active)
      VALUES (
        'iv-addon-famotidine-pepcid',
        'Famotidine (Pepcid) Add-On Administration',
        'iv',
        ARRAY['iv_lounge'::text]::text[],
        false
      )
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
          $pepcid_md$# Famotidine (Pepcid) Add-On Administration
## Indication

H2 blockade for histamine-mediated symptoms and flushing, dual H1/H2 blockade alongside diphenhydramine in mild allergic or infusion reactions, and dyspepsia symptoms.

## Standing-order authorization

RN under physician standing orders after the screening gate. Acute anaphylaxis is governed by the Emergency protocol.

## Contraindications and cautions

Known hypersensitivity to famotidine or other H2 antagonists. Renal impairment (reduce dose or extend interval per provider). Caution with QT prolongation in severe renal impairment.

## Dosing

20 mg IV, single dose.

## Route and rate

IV. May be diluted and given as a slow push or short infusion per pharmacy guidance.

## Pre-administration checks

Allergy review and renal history.

## Monitoring

Minimal. Observe per IV-lounge standard.

## Adverse-event response

Allergic reaction means Emergency protocol.$pepcid_md$,
          $pepcid_js${
            "indication": "H2 blockade for histamine-mediated symptoms and flushing; dual H1/H2 blockade with diphenhydramine in mild reactions; dyspepsia.",
            "contraindications": [
              "Hypersensitivity to famotidine or other H2 antagonists"
            ],
            "exclusion_criteria": [
              "Renal impairment (reduce dose or extend interval per provider)",
              "QT caution in severe renal impairment"
            ],
            "pre_administration_checks": [
              "Allergy review",
              "Renal history"
            ],
            "dosing": {
              "medication": "Famotidine",
              "dose": "20 mg single dose",
              "route": "IV",
              "frequency": "Single dose",
              "duration": "Slow push or short infusion per pharmacy guidance, may dilute"
            },
            "administration": [
              "RN under physician standing orders after screening gate; Emergency protocol governs anaphylaxis",
              "Slow push or short infusion per pharmacy guidance, may dilute"
            ],
            "monitoring_during": [
              "Minimal observation per IV-lounge standard"
            ],
            "monitoring_post": ["Observe before discharge"],
            "patient_education": ["Often paired with diphenhydramine for allergic or flushing reactions"],
            "escalation_criteria": ["Allergic reaction"],
            "documentation_required": ["IV flowsheet", "Dose and route"],
            "adverse_event_response": {
              "mild": ["Supportive care"],
              "moderate": ["Provider notification"],
              "severe": ["Emergency protocol", "911/EMS if anaphylaxis"]
            }
          }$pepcid_js$::jsonb,
          $pepcid_nt$[
            {
              "field": "dosing.route",
              "current_value": "IV push or short infusion",
              "rationale": "Confirm IV push vs short infusion and dilution per your product.",
              "alternatives": "Short infusion only",
              "confidence": "standard",
              "resolved": false
            },
            {
              "field": "renal_adjustment",
              "current_value": "per provider",
              "rationale": "Confirm renal dose-adjustment threshold.",
              "alternatives": "Reduce dose below eGFR threshold per pharmacy table",
              "confidence": "variable",
              "resolved": false
            },
            {
              "field": "pairing",
              "current_value": "with diphenhydramine for reactions",
              "rationale": "Confirm pairing convention with diphenhydramine for allergic/flushing reactions.",
              "alternatives": "Famotidine standalone only unless provider orders dual blockade",
              "confidence": "standard",
              "resolved": false
            }
          ]$pepcid_nt$::jsonb,
          NULL
        ) RETURNING id INTO _version_id;

        UPDATE public.clinical_protocols
          SET current_version_id = _version_id,
              updated_at = now()
          WHERE id = _protocol_id;
      END IF;
    END $pepcid$;

COMMIT;

-- ============================================================================
-- VERIFICATION (run in Supabase SQL Editor)
-- ============================================================================
-- SELECT p.slug, p.title, p.is_active, v.status, v.version_number
-- FROM public.clinical_protocols p
-- JOIN public.clinical_protocol_versions v ON v.id = p.current_version_id
-- WHERE p.slug LIKE 'iv-addon-%'
-- ORDER BY p.slug;
-- expect 4 rows, is_active = false, status = draft
