-- Resync IV prescription injectable add-on protocol drafts to schema-matched content.
-- Twelve-field body_structured (same shape as IV protocols) + legacy notes_for_reviewer.
-- Reverts is_active to false — not administrable until Dr. Akers resolves notes and signs.
-- Guard: only updates draft version 1 rows; will not clobber if already signed.

BEGIN;

UPDATE public.clinical_protocols
SET is_active = false,
    updated_at = now()
WHERE slug IN (
  'iv-addon-ketorolac-toradol',
  'iv-addon-ondansetron-zofran',
  'iv-addon-diphenhydramine-benadryl',
  'iv-addon-famotidine-pepcid'
);

-- 1. Ketorolac (Toradol)
UPDATE public.clinical_protocol_versions v
SET
  body_markdown = $ketorolac_md$Ketorolac is a single-dose NSAID for acute pain and inflammation in the IV lounge, used as an adjunct for headache, migraine, and musculoskeletal pain and in recovery infusions. Default 30 mg for healthy adults under 65 and over 50 kg. Reduce to 15 mg for age over 65, weight under 50 kg, or any renal impairment. IM into a large muscle, or IV push undiluted over at least 15 seconds. Maximum 120 mg per 24 hours, not more than 5 consecutive days, single-dose use expected here. Administered by RN under standing orders only after the screening gate, hold and contact provider for any contraindication or uncertainty.$ketorolac_md$,
  body_structured = $ketorolac_js${
    "indication": "Acute pain and inflammation in the IV-lounge setting; adjunct for headache, migraine, musculoskeletal pain; component of recovery infusions; single-dose use.",
    "contraindications": [
      "Hypersensitivity to ketorolac, aspirin, or other NSAIDs",
      "Aspirin-exacerbated respiratory disease",
      "Active or recent GI bleed, peptic ulcer, or perforation",
      "Suspected cerebrovascular bleeding",
      "Bleeding disorder or therapeutic anticoagulation",
      "Advanced renal impairment or volume depletion",
      "Pregnancy (especially third trimester), labor and delivery, breastfeeding",
      "Perioperative CABG"
    ],
    "exclusion_criteria": [
      "Age over 65 without dose reduction to 15 mg",
      "Weight under 50 kg without dose reduction to 15 mg",
      "Renal impairment without provider clearance",
      "Concurrent other NSAIDs",
      "More than one ketorolac dose in 24 hours without provider order"
    ],
    "pre_administration_checks": [
      "Verify identity and order",
      "BP and HR",
      "NSAID and aspirin allergy review",
      "GI bleed and ulcer history",
      "Anticoagulant and bleeding-disorder review",
      "Renal history",
      "Pregnancy and breastfeeding status",
      "Confirm age and weight for dose selection",
      "Patent IV access if IV route"
    ],
    "dosing": {
      "medication": "Ketorolac (Toradol)",
      "dose": "30 mg standard; 15 mg if age over 65, weight under 50 kg, or renal impairment",
      "route": "IM into large muscle, or IV push undiluted",
      "frequency": "Single dose; maximum 120 mg per 24 hours per provider order",
      "duration": "IV push over at least 15 seconds"
    },
    "administration": [
      "Confirm dose against order and completed screening",
      "Swab site and administer per route",
      "IV push undiluted over at least 15 seconds"
    ],
    "monitoring_during": [
      "Observe for allergic reaction",
      "Injection site",
      "Vitals per IV-lounge standard"
    ],
    "monitoring_post": [
      "Observe before discharge",
      "Discharge instructions including NSAID precautions",
      "Adverse-event reporting pathway"
    ],
    "patient_education": [
      "Single-dose NSAID; do not combine with other NSAIDs",
      "Report black or bloody stools, vomiting blood, or severe stomach pain",
      "Report decreased urination or new swelling",
      "Hydrate"
    ],
    "escalation_criteria": [
      "Signs of allergic reaction or anaphylaxis",
      "GI bleeding signs",
      "Signs of acute kidney injury"
    ],
    "documentation_required": [
      "Indication, dose, route, time",
      "Screening completed and negative",
      "Order or standing-order reference",
      "Lot and expiration",
      "Patient response"
    ],
    "adverse_event_response": {
      "mild": ["Injection-site discomfort: reassurance, observe"],
      "moderate": ["Urticaria or mild allergic symptoms: stop, antihistamine per order, contact provider, observe"],
      "severe": [
        "Anaphylaxis: stop, Emergency/Anaphylaxis protocol, epinephrine, EMS",
        "GI bleed (hematemesis, melena): hold NSAIDs, contact provider, evaluate, EMS if unstable"
      ]
    }
  }$ketorolac_js$::jsonb,
  notes_for_reviewer = $ketorolac_nt$[
    {"note": "Confirm 30 mg vs 15 mg as the default single dose for the IV-lounge population.", "resolved": false, "resolved_at": null, "resolved_by": null},
    {"note": "Confirm RN may administer under standing order vs requires individualized provider order per encounter, given the GCMB May 2026 standing-order statement.", "resolved": false, "resolved_at": null, "resolved_by": null},
    {"note": "Confirm renal screening: recent creatinine required, or history/symptom-based screening acceptable.", "resolved": false, "resolved_at": null, "resolved_by": null}
  ]$ketorolac_nt$::jsonb,
  updated_at = now()
FROM public.clinical_protocols p
WHERE v.protocol_id = p.id
  AND p.slug = 'iv-addon-ketorolac-toradol'
  AND v.version_number = 1
  AND v.status = 'draft';

-- 2. Ondansetron (Zofran)
UPDATE public.clinical_protocol_versions v
SET
  body_markdown = $ondansetron_md$Ondansetron is a single-dose 5-HT3 antagonist for nausea in the IV lounge, including NAD+-associated nausea, migraine-associated nausea, and recovery infusions. 4 mg IM or IV, may repeat once per provider order. Single IV dose must not exceed 16 mg. Give IV over 2 to 5 minutes, not faster, due to QT risk. Administered by RN under standing orders after the screening gate.$ondansetron_md$,
  body_structured = $ondansetron_js${
    "indication": "Prevention and treatment of nausea in the IV lounge, including NAD+-associated, migraine-associated, and recovery infusions; single-dose use.",
    "contraindications": [
      "Hypersensitivity to ondansetron or other 5-HT3 antagonists",
      "Congenital long QT syndrome",
      "Concurrent apomorphine"
    ],
    "exclusion_criteria": [
      "History of QT prolongation or arrhythmia without provider clearance",
      "Uncorrected hypokalemia or hypomagnesemia",
      "Concurrent QT-prolonging drugs without provider clearance",
      "Concurrent serotonergic drugs (SSRIs, SNRIs, triptans, MAOIs) without provider clearance",
      "Severe hepatic impairment beyond 8 mg in 24 hours"
    ],
    "pre_administration_checks": [
      "Verify identity and order",
      "BP and HR",
      "Allergy review",
      "Cardiac and long-QT history",
      "Medication review for QT-prolonging and serotonergic agents",
      "Patent IV access if IV route"
    ],
    "dosing": {
      "medication": "Ondansetron (Zofran)",
      "dose": "4 mg; may repeat once per provider order; single IV dose not to exceed 16 mg",
      "route": "IM, or IV",
      "frequency": "Single dose; repeat once per provider order",
      "duration": "IV over 2 to 5 minutes"
    },
    "administration": [
      "Confirm dose against order and completed screening",
      "Administer per route",
      "IV over 2 to 5 minutes, not faster"
    ],
    "monitoring_during": [
      "Observe",
      "Consider rhythm monitoring for known cardiac risk per provider",
      "Vitals per IV-lounge standard"
    ],
    "monitoring_post": [
      "Observe before discharge",
      "Adverse-event reporting pathway"
    ],
    "patient_education": [
      "Report palpitations, fainting, or irregular heartbeat",
      "Report agitation, tremor, or confusion (serotonin-syndrome signs) if on serotonergic meds"
    ],
    "escalation_criteria": [
      "Serotonin-syndrome signs (agitation, clonus, hyperthermia, autonomic instability)",
      "Syncope or palpitations",
      "Allergic reaction"
    ],
    "documentation_required": [
      "Indication, dose, route, time",
      "Screening completed and negative",
      "Order or standing-order reference",
      "Lot and expiration",
      "Patient response"
    ],
    "adverse_event_response": {
      "mild": ["Transient headache or constipation: reassurance"],
      "moderate": ["Urticaria or mild allergic symptoms: stop, antihistamine per order, contact provider"],
      "severe": [
        "Anaphylaxis: stop, Emergency/Anaphylaxis protocol, epinephrine, EMS",
        "Serotonin syndrome: stop, contact provider, EMS as needed",
        "Syncope or arrhythmia: evaluate, ECG, provider, EMS if unstable"
      ]
    }
  }$ondansetron_js$::jsonb,
  notes_for_reviewer = $ondansetron_nt$[
    {"note": "Confirm default 4 mg and whether a repeat is permitted under standing order or requires provider contact.", "resolved": false, "resolved_at": null, "resolved_by": null},
    {"note": "Require baseline ECG or electrolytes for patients on QT-prolonging meds, or is history-based screening acceptable?", "resolved": false, "resolved_at": null, "resolved_by": null},
    {"note": "Confirm RN administration under standing order vs individualized order per encounter, given the GCMB May 2026 statement.", "resolved": false, "resolved_at": null, "resolved_by": null}
  ]$ondansetron_nt$::jsonb,
  updated_at = now()
FROM public.clinical_protocols p
WHERE v.protocol_id = p.id
  AND p.slug = 'iv-addon-ondansetron-zofran'
  AND v.version_number = 1
  AND v.status = 'draft';

-- 3. Diphenhydramine (Benadryl)
UPDATE public.clinical_protocol_versions v
SET
  body_markdown = $diphenhydramine_md$Diphenhydramine is a single-dose H1 antihistamine for mild allergic symptoms, pre-medication, and adjunct H1 blockade in mild allergic or infusion reactions. 25 to 50 mg IM or IV, 25 mg in elderly or sedation-sensitive patients. IV is a slow, diluted push over a few minutes. Causes sedation, advise no driving and confirm safe transport. Acute anaphylaxis is governed by the Emergency / Anaphylaxis protocol, not this one.$diphenhydramine_md$,
  body_structured = $diphenhydramine_js${
    "indication": "Mild allergic symptoms, pre-medication, and adjunct H1 blockade in mild allergic or infusion reactions; single-dose use. Anaphylaxis governed by the Emergency protocol.",
    "contraindications": [
      "Hypersensitivity to diphenhydramine",
      "Narrow-angle glaucoma",
      "Symptomatic BPH or urinary retention",
      "Concurrent MAOI use"
    ],
    "exclusion_criteria": [
      "Plan to drive after an IV dose",
      "Significant concurrent CNS depressant or alcohol use",
      "Elderly patient without dose reduction to 25 mg"
    ],
    "pre_administration_checks": [
      "Verify identity and order",
      "Allergy review",
      "Glaucoma and urinary-retention history",
      "Age",
      "Transport and driving plan due to sedation",
      "Current sedating medications",
      "Patent IV access if IV route"
    ],
    "dosing": {
      "medication": "Diphenhydramine (Benadryl)",
      "dose": "25 to 50 mg; 25 mg in elderly or sedation-sensitive patients",
      "route": "IM, or IV slow push, diluted",
      "frequency": "Single dose per order",
      "duration": "Slow IV over a few minutes"
    },
    "administration": [
      "Confirm dose against order and completed screening",
      "Dilute for IV and push slowly over a few minutes",
      "Rapid IV increases sedation and hypotension; avoid"
    ],
    "monitoring_during": [
      "Sedation level",
      "Vitals per IV-lounge standard"
    ],
    "monitoring_post": [
      "Observe before discharge",
      "Ensure safe transport",
      "Adverse-event reporting pathway"
    ],
    "patient_education": [
      "Will cause drowsiness; do not drive",
      "Avoid alcohol and other sedatives",
      "Arrange safe transport home"
    ],
    "escalation_criteria": [
      "Oversedation or airway compromise",
      "Paradoxical excitation",
      "Anticholinergic toxicity signs"
    ],
    "documentation_required": [
      "Indication, dose, route, time",
      "Screening completed and negative",
      "Order or standing-order reference",
      "Lot and expiration",
      "Sedation and transport status at discharge"
    ],
    "adverse_event_response": {
      "mild": ["Drowsiness: observe, ensure safe transport"],
      "moderate": ["Excessive sedation: monitor airway, supportive care, contact provider"],
      "severe": [
        "Airway compromise or anticholinergic toxicity: support airway, provider, EMS",
        "Anaphylaxis (to the drug itself): Emergency/Anaphylaxis protocol, epinephrine, EMS"
      ]
    }
  }$diphenhydramine_js$::jsonb,
  notes_for_reviewer = $diphenhydramine_nt$[
    {"note": "Confirm default 25 vs 50 mg and the elderly threshold for the lower dose.", "resolved": false, "resolved_at": null, "resolved_by": null},
    {"note": "Confirm discharge and driving policy after IV diphenhydramine.", "resolved": false, "resolved_at": null, "resolved_by": null},
    {"note": "Confirm cross-reference so staff know the Emergency protocol governs an acute reaction, not this protocol.", "resolved": false, "resolved_at": null, "resolved_by": null}
  ]$diphenhydramine_nt$::jsonb,
  updated_at = now()
FROM public.clinical_protocols p
WHERE v.protocol_id = p.id
  AND p.slug = 'iv-addon-diphenhydramine-benadryl'
  AND v.version_number = 1
  AND v.status = 'draft';

-- 4. Famotidine (Pepcid)
UPDATE public.clinical_protocol_versions v
SET
  body_markdown = $famotidine_md$Famotidine is a single-dose H2 blocker for histamine-mediated symptoms and flushing, for dual H1/H2 blockade alongside diphenhydramine in mild allergic or infusion reactions, and for dyspepsia. 20 mg IV, slow push or short infusion per pharmacy guidance, may dilute. Reduce dose or extend interval in renal impairment per provider. Acute anaphylaxis is governed by the Emergency protocol.$famotidine_md$,
  body_structured = $famotidine_js${
    "indication": "H2 blockade for histamine-mediated symptoms and flushing; dual H1/H2 blockade with diphenhydramine in mild reactions; dyspepsia; single-dose use.",
    "contraindications": [
      "Hypersensitivity to famotidine or other H2 antagonists"
    ],
    "exclusion_criteria": [
      "Renal impairment without dose adjustment per provider"
    ],
    "pre_administration_checks": [
      "Verify identity and order",
      "Allergy review",
      "Renal history",
      "Patent IV access"
    ],
    "dosing": {
      "medication": "Famotidine (Pepcid)",
      "dose": "20 mg",
      "route": "IV",
      "frequency": "Single dose per order",
      "duration": "Slow push or short infusion per pharmacy guidance, may dilute"
    },
    "administration": [
      "Confirm dose against order and completed screening",
      "Dilute per pharmacy guidance and give slow push or short infusion"
    ],
    "monitoring_during": [
      "Observe",
      "Vitals per IV-lounge standard"
    ],
    "monitoring_post": [
      "Observe before discharge",
      "Adverse-event reporting pathway"
    ],
    "patient_education": [
      "Report rash, swelling, or trouble breathing",
      "Report persistent headache or dizziness"
    ],
    "escalation_criteria": [
      "Allergic reaction",
      "Severe dizziness or hypotension"
    ],
    "documentation_required": [
      "Indication, dose, route, time",
      "Screening completed and negative",
      "Order or standing-order reference",
      "Lot and expiration",
      "Patient response"
    ],
    "adverse_event_response": {
      "mild": ["Headache or dizziness: reassurance, observe"],
      "moderate": ["Mild allergic symptoms: stop, antihistamine per order, contact provider"],
      "severe": ["Anaphylaxis: stop, Emergency/Anaphylaxis protocol, epinephrine, EMS"]
    }
  }$famotidine_js$::jsonb,
  notes_for_reviewer = $famotidine_nt$[
    {"note": "Confirm IV push vs short infusion and dilution per your product.", "resolved": false, "resolved_at": null, "resolved_by": null},
    {"note": "Confirm renal dose-adjustment threshold.", "resolved": false, "resolved_at": null, "resolved_by": null},
    {"note": "Confirm pairing convention with diphenhydramine for allergic and flushing reactions.", "resolved": false, "resolved_at": null, "resolved_by": null}
  ]$famotidine_nt$::jsonb,
  updated_at = now()
FROM public.clinical_protocols p
WHERE v.protocol_id = p.id
  AND p.slug = 'iv-addon-famotidine-pepcid'
  AND v.version_number = 1
  AND v.status = 'draft';

COMMIT;
