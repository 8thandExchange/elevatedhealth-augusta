# EHA Injectable Protocol Drafts (4)

**Elevated Health Augusta (WILKERS GROUP LLC) | Clinical Protocols | DRAFT for physician signature**

These four protocols cover the prescription injectables currently sold or used as IV-lounge add-ons that had no protocol of record: ketorolac, ondansetron, diphenhydramine, famotidine. Dosing is standard-of-practice. **Every one is a draft pending Dr. Akers signature. None is active until signed.** Schema mirrors `clinical_protocols` + `clinical_protocol_versions` from `20260509140000_seed_clinical_protocol_drafts.sql`. The Cursor agent should probe the live schema and map these fields to the exact `body_structured` keys used by the existing IV protocols before writing the migration.

Common rule for all four: administered by RN under physician standing orders only after the pre-administration screening gate is complete and no contraindication exists. Any contraindication or uncertainty means hold and contact the provider. Acute anaphylaxis is governed by the Emergency / Anaphylaxis protocol, not these.

---

## 1. Ketorolac (Toradol) Add-On Administration

```yaml
slug: iv-addon-ketorolac-toradol
title: Ketorolac (Toradol) Add-On Administration
category: iv
service_type: [iv_lounge]
is_active: false
version_number: 1
status: draft
authored_by: system_draft_for_troy_signature
```

**body_markdown:**

Indication. Acute pain and inflammation in the IV-lounge setting. Adjunct for headache, migraine, and musculoskeletal pain, and a component of recovery infusions. Single-dose use.

Standing-order authorization. Administered by RN under physician standing orders after the screening gate below. Hold and contact provider for any contraindication or uncertainty.

Absolute contraindications. Known hypersensitivity to ketorolac, aspirin, or other NSAIDs. Aspirin-exacerbated respiratory disease. Active or recent GI bleed, peptic ulcer, or perforation. Suspected cerebrovascular bleeding. Bleeding disorder or therapeutic anticoagulation. Advanced renal impairment or volume depletion. Pregnancy, especially third trimester. Labor and delivery. Breastfeeding. Perioperative CABG.

Cautions (reduce dose or contact provider). Age over 65. Weight under 50 kg. Any renal impairment. History of GI ulcer. Heart failure or uncontrolled hypertension. Concurrent diuretics, ACE inhibitors, or ARBs. Concurrent other NSAIDs.

Dosing. 15 to 30 mg IV or IM, single dose. Default 30 mg for healthy adults under 65 and over 50 kg. Reduce to 15 mg if age over 65, weight under 50 kg, or any renal impairment. Maximum 120 mg per day. Not for more than 5 consecutive days. Single-dose use expected here.

Route and rate. IM into a large muscle, or IV push undiluted over at least 15 seconds.

Pre-administration checks. BP, HR, NSAID and aspirin allergy review, GI bleed history, anticoagulant and bleeding history, renal history, pregnancy and breastfeeding status, and age and weight for dose selection.

Monitoring. Observe for allergic reaction. Check injection site. Vitals per IV-lounge standard.

Adverse-event response. Allergic reaction or anaphylaxis means stop, go to the Emergency / Anaphylaxis protocol, epinephrine, EMS. GI bleeding signs (melena, hematemesis, severe abdominal pain) mean hold further NSAIDs, contact provider, evaluate.

**body_structured (JSON):**

```json
{
  "indication": "Acute pain and inflammation in the IV-lounge setting; adjunct for headache, migraine, musculoskeletal pain; single-dose use.",
  "standing_order_authorization": "RN under physician standing orders after screening gate; hold and contact provider for any contraindication or uncertainty.",
  "contraindications_absolute": [
    "Hypersensitivity to ketorolac, aspirin, or other NSAIDs",
    "Aspirin-exacerbated respiratory disease",
    "Active or recent GI bleed, ulcer, or perforation",
    "Suspected cerebrovascular bleeding",
    "Bleeding disorder or therapeutic anticoagulation",
    "Advanced renal impairment or volume depletion",
    "Pregnancy (especially third trimester), labor and delivery, breastfeeding",
    "Perioperative CABG"
  ],
  "cautions": [
    "Age over 65", "Weight under 50 kg", "Renal impairment", "GI ulcer history",
    "Heart failure or uncontrolled hypertension", "Concurrent diuretics, ACE inhibitors, or ARBs",
    "Concurrent other NSAIDs"
  ],
  "dosing": {
    "medication": "Ketorolac 15 to 30 mg, single dose",
    "default": "30 mg for healthy adults under 65 and over 50 kg",
    "reduced": "15 mg if age over 65, weight under 50 kg, or renal impairment",
    "max": "120 mg per day; not more than 5 consecutive days",
    "route": "IM into large muscle, or IV push undiluted",
    "rate": "IV push over at least 15 seconds"
  },
  "pre_administration_checks": "BP, HR, NSAID/aspirin allergy, GI bleed history, anticoagulant/bleeding history, renal history, pregnancy/breastfeeding, age and weight",
  "monitoring_during": "Observe for allergic reaction; injection site; vitals per IV-lounge standard",
  "adverse_event_response": "Allergic reaction or anaphylaxis: stop, Emergency/Anaphylaxis protocol, epinephrine, EMS. GI bleed signs: hold NSAIDs, contact provider, evaluate."
}
```

**notes_for_reviewer (JSON):**

```json
[
  {"field": "dosing.default", "current_value": "30 mg", "question": "Confirm 30 mg vs 15 mg as the default single dose for the IV-lounge population.", "confidence": "standard"},
  {"field": "standing_order_scope", "current_value": "RN under standing orders", "question": "Confirm RN may administer under standing order vs requires individualized provider order per encounter, given the GCMB May 2026 statement.", "confidence": "variable"},
  {"field": "renal_screening", "current_value": "history-based", "question": "Is a recent creatinine required, or is symptom/history-based renal screening acceptable?", "confidence": "variable"}
]
```

---

## 2. Ondansetron (Zofran) Add-On Administration

```yaml
slug: iv-addon-ondansetron-zofran
title: Ondansetron (Zofran) Add-On Administration
category: iv
service_type: [iv_lounge]
is_active: false
version_number: 1
status: draft
authored_by: system_draft_for_troy_signature
```

**body_markdown:**

Indication. Prevention and treatment of nausea in the IV lounge, including NAD+-associated nausea, migraine-associated nausea, and recovery infusions.

Standing-order authorization. RN under physician standing orders after the screening gate. Hold and contact provider for any contraindication or uncertainty.

Absolute contraindications. Known hypersensitivity to ondansetron or other 5-HT3 antagonists. Congenital long QT syndrome. Concurrent apomorphine (risk of profound hypotension).

Cautions. Personal or family history of QT prolongation or arrhythmia. Electrolyte abnormalities (hypokalemia, hypomagnesemia). Concurrent QT-prolonging drugs. Concurrent serotonergic drugs (SSRIs, SNRIs, triptans, MAOIs) due to serotonin-syndrome risk. Severe hepatic impairment (cap at 8 mg per day).

Dosing. 4 mg IV or IM, single dose. May repeat once per provider order. Maximum single IV dose 16 mg. Do not exceed.

Route and rate. IM, or IV over 2 to 5 minutes. Not faster, due to QT risk.

Pre-administration checks. BP, HR, allergy review, cardiac and long-QT history, and current-medication review for QT-prolonging and serotonergic agents.

Monitoring. Observe. For known cardiac risk, consider rhythm monitoring per provider.

Adverse-event response. Allergic reaction means Emergency protocol. Serotonin-syndrome signs (agitation, clonus, hyperthermia, autonomic instability) mean stop, contact provider, EMS as needed. Syncope or palpitations mean evaluate, ECG, provider.

**body_structured (JSON):**

```json
{
  "indication": "Prevention and treatment of nausea in the IV lounge, including NAD+-associated, migraine-associated, and recovery infusions.",
  "standing_order_authorization": "RN under physician standing orders after screening gate; hold and contact provider for any contraindication or uncertainty.",
  "contraindications_absolute": [
    "Hypersensitivity to ondansetron or other 5-HT3 antagonists",
    "Congenital long QT syndrome",
    "Concurrent apomorphine"
  ],
  "cautions": [
    "History of QT prolongation or arrhythmia",
    "Electrolyte abnormalities (hypokalemia, hypomagnesemia)",
    "Concurrent QT-prolonging drugs",
    "Concurrent serotonergic drugs (SSRIs, SNRIs, triptans, MAOIs)",
    "Severe hepatic impairment (cap 8 mg/day)"
  ],
  "dosing": {
    "medication": "Ondansetron 4 mg, single dose; may repeat once per provider order",
    "max": "Single IV dose not to exceed 16 mg",
    "route": "IM, or IV",
    "rate": "IV over 2 to 5 minutes"
  },
  "pre_administration_checks": "BP, HR, allergy review, cardiac/long-QT history, medication review for QT-prolonging and serotonergic agents",
  "monitoring_during": "Observe; consider rhythm monitoring for known cardiac risk per provider",
  "adverse_event_response": "Allergic reaction: Emergency protocol. Serotonin syndrome signs: stop, provider, EMS. Syncope/palpitations: evaluate, ECG, provider."
}
```

**notes_for_reviewer (JSON):**

```json
[
  {"field": "dosing.repeat", "current_value": "4 mg, repeat once per provider order", "question": "Confirm default 4 mg and whether a repeat is permitted under standing order or requires provider contact.", "confidence": "standard"},
  {"field": "qt_screening", "current_value": "history-based", "question": "Require baseline ECG or electrolytes for patients on QT-prolonging meds, or is history-based screening acceptable?", "confidence": "variable"},
  {"field": "standing_order_scope", "current_value": "RN under standing orders", "question": "Confirm RN administration under standing order vs individualized order per encounter, given the GCMB May 2026 statement.", "confidence": "variable"}
]
```

---

## 3. Diphenhydramine (Benadryl) Add-On Administration

```yaml
slug: iv-addon-diphenhydramine-benadryl
title: Diphenhydramine (Benadryl) Add-On Administration
category: iv
service_type: [iv_lounge]
is_active: false
version_number: 1
status: draft
authored_by: system_draft_for_troy_signature
```

**body_markdown:**

Indication. Mild allergic symptoms, pre-medication, and adjunct H1 blockade in mild allergic or infusion reactions. Acute anaphylaxis is governed by the Emergency / Anaphylaxis protocol, not this one.

Standing-order authorization. RN under physician standing orders after the screening gate. In an acute reaction, the Emergency protocol governs.

Contraindications and cautions. Known hypersensitivity. Narrow-angle glaucoma. Symptomatic BPH or urinary retention. Sedation risk and any plan to drive (advise no driving). Elderly (anticholinergic burden, fall and confusion risk, use the lower dose). Concurrent MAOIs. Concurrent CNS depressants or alcohol.

Dosing. 25 to 50 mg IV or IM, single dose. Use 25 mg in elderly or sedation-sensitive patients.

Route and rate. IM, or IV slow push, diluted, over a few minutes. Rapid IV increases sedation and hypotension.

Pre-administration checks. Allergy review, glaucoma and urinary-retention history, age, transport and driving plan due to sedation, and current sedating medications.

Monitoring. Sedation level. Observe before discharge. Ensure safe transport.

Adverse-event response. Oversedation means monitor airway, supportive care, provider. Paradoxical excitation (especially children and elderly) means provider. Anticholinergic toxicity signs mean provider or EMS.

**body_structured (JSON):**

```json
{
  "indication": "Mild allergic symptoms, pre-medication, adjunct H1 blockade in mild reactions. Anaphylaxis governed by Emergency protocol.",
  "standing_order_authorization": "RN under physician standing orders after screening gate; Emergency protocol governs acute reactions.",
  "contraindications_cautions": [
    "Hypersensitivity",
    "Narrow-angle glaucoma",
    "Symptomatic BPH or urinary retention",
    "Sedation risk or plan to drive",
    "Elderly (use lower dose)",
    "Concurrent MAOIs",
    "Concurrent CNS depressants or alcohol"
  ],
  "dosing": {
    "medication": "Diphenhydramine 25 to 50 mg, single dose",
    "reduced": "25 mg in elderly or sedation-sensitive patients",
    "route": "IM, or IV slow push, diluted",
    "rate": "Slow IV over a few minutes"
  },
  "pre_administration_checks": "Allergy review, glaucoma/urinary-retention history, age, transport/driving plan, current sedating meds",
  "monitoring_during": "Sedation level; observe before discharge; ensure safe transport",
  "adverse_event_response": "Oversedation: airway, supportive, provider. Paradoxical excitation: provider. Anticholinergic toxicity: provider or EMS."
}
```

**notes_for_reviewer (JSON):**

```json
[
  {"field": "dosing.default", "current_value": "25 to 50 mg", "question": "Confirm default 25 vs 50 mg and the elderly threshold for the lower dose.", "confidence": "standard"},
  {"field": "discharge_policy", "current_value": "no driving", "question": "Confirm discharge and driving policy after IV diphenhydramine.", "confidence": "variable"},
  {"field": "emergency_overlap", "current_value": "Emergency protocol governs anaphylaxis", "question": "Confirm cross-reference so staff know which protocol governs in an acute reaction.", "confidence": "standard"}
]
```

---

## 4. Famotidine (Pepcid) Add-On Administration

```yaml
slug: iv-addon-famotidine-pepcid
title: Famotidine (Pepcid) Add-On Administration
category: iv
service_type: [iv_lounge]
is_active: false
version_number: 1
status: draft
authored_by: system_draft_for_troy_signature
```

**body_markdown:**

Indication. H2 blockade for histamine-mediated symptoms and flushing, dual H1/H2 blockade alongside diphenhydramine in mild allergic or infusion reactions, and dyspepsia symptoms.

Standing-order authorization. RN under physician standing orders after the screening gate. Acute anaphylaxis is governed by the Emergency protocol.

Contraindications and cautions. Known hypersensitivity to famotidine or other H2 antagonists. Renal impairment (reduce dose or extend interval per provider). Caution with QT prolongation in severe renal impairment.

Dosing. 20 mg IV, single dose.

Route and rate. IV. May be diluted and given as a slow push or short infusion per pharmacy guidance.

Pre-administration checks. Allergy review and renal history.

Monitoring. Minimal. Observe per IV-lounge standard.

Adverse-event response. Allergic reaction means Emergency protocol.

**body_structured (JSON):**

```json
{
  "indication": "H2 blockade for histamine-mediated symptoms and flushing; dual H1/H2 blockade with diphenhydramine in mild reactions; dyspepsia.",
  "standing_order_authorization": "RN under physician standing orders after screening gate; Emergency protocol governs anaphylaxis.",
  "contraindications_cautions": [
    "Hypersensitivity to famotidine or other H2 antagonists",
    "Renal impairment (reduce dose or extend interval per provider)",
    "QT caution in severe renal impairment"
  ],
  "dosing": {
    "medication": "Famotidine 20 mg, single dose",
    "route": "IV",
    "rate": "Slow push or short infusion per pharmacy guidance, may dilute"
  },
  "pre_administration_checks": "Allergy review, renal history",
  "monitoring_during": "Minimal; observe per IV-lounge standard",
  "adverse_event_response": "Allergic reaction: Emergency protocol."
}
```

**notes_for_reviewer (JSON):**

```json
[
  {"field": "dosing.route", "current_value": "IV push or short infusion", "question": "Confirm IV push vs short infusion and dilution per your product.", "confidence": "standard"},
  {"field": "renal_adjustment", "current_value": "per provider", "question": "Confirm renal dose-adjustment threshold.", "confidence": "variable"},
  {"field": "pairing", "current_value": "with diphenhydramine for reactions", "question": "Confirm pairing convention with diphenhydramine for allergic/flushing reactions.", "confidence": "standard"}
]
```

---

## Migration handling

All four insert with `is_active = false` and `status = 'draft'`. They do not appear as active protocols and Caroline cannot administer against them until Dr. Akers resolves the reviewer notes and signs, identical to the gate on the existing 13 and the emergency draft. The cheat sheet reflects the same: standard dosing shown, marked draft pending signature, do not administer until signed.
