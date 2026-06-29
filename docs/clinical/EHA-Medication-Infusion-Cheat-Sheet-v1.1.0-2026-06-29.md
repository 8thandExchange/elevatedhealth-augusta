# Elevated Health Augusta — Medication and Infusion Cheat Sheet

> Internal — clinical staff only (no patient pricing) · v1.1.0

Two tiers of authority in this sheet. Read this first.

Protocol-backed (IV drips). The Myers, NAD+ 250, NAD+ 500, and Glutathione values come from EHA's signed protocols in the system (slugs noted in each section). These are the values of record. They still carry open physician reviewer notes, flagged inline where they exist. Resolve those with Dr. Akers before relying on them.

Draft, pending signature (prescription injectables). Toradol, Zofran, Benadryl, and Pepcid now have standard-dosing protocol drafts (iv-addon-*), but they are drafts at status pending, not signed and not active. The dosing in Section 6 is built from those drafts. Do not administer these until Dr. Akers resolves the reviewer notes and signs each one.

Source of truth is the clinical_protocol_versions rows, seeded by 20260509140000_seed_clinical_protocol_drafts.sql. This sheet is generated from those rows so it stays in sync.

Administer only after patient-specific screening: allergies, current medications, pregnancy or breastfeeding status, renal and cardiac history, and a valid provider order or executed protocol for the encounter.

## 1. IV Bases and Fluids

| Normal Saline 0.9% | 250 mL to 1 L | Default carrier for most drips |
| Lactated Ringers | 250 mL to 1 L | Electrolyte-balanced, hydration and recovery |
| D5W | 50 to 250 mL | Carrier for select pushes, dilution |

Check IV patency before starting. Watch the site for infiltration throughout. Document lot number and expiration of every compounded vial used.

## 2–3. IV Protocols (from seed)

### IV Myers Cocktail Administration

- **Indication:** Adult IV wellness / nutrient repletion per standing orders.
- **Medication:** Myers cocktail components as listed
- **Dose:** Per formulation above
- **Base / diluent:** Magnesium chloride 1g, calcium gluconate 100mg, B-complex 1mL, B12 1mg, B5 250mg, B6 100mg, vitamin C 5g, in 250mL normal saline.
- **Route:** IV infusion
- **Frequency:** Per order / membership benefit
- **Duration:** 30–45 minutes
- **Pre-administration checks:** Verify identity · Two RN checks on bag labeling · Patent IV access
- **Monitoring (during):** VS q15min first 30min · Patient comfort
- **Monitoring (post):** Discharge instructions · Adverse event reporting pathway
- **Administration:** Prime line · Infuse per rate policy · Dispose sharps per clinic SOP

**OPEN reviewer notes:**
- Verify Myers formulation matches Henry Schein standard pre-mixed bag if you're using one, vs. compounded in-house
- Confirm 30-45 min infusion rate matches your preference; some clinicians push slower for first-time patients
- Vitamin C dose of 5g — verify G6PD screening expectation in your intake (high-dose IV C is contraindicated in G6PD deficiency)

### IV NAD+ 250mg Infusion

- **Indication:** NAD+ IV therapy 250mg session.
- **Medication:** NAD+
- **Dose:** 250mg
- **Base / diluent:** NAD+ 250mg in 500mL normal saline.
- **Route:** IV infusion
- **Frequency:** Per order
- **Duration:** 60–90 min
- **Pre-administration checks:** Baseline VS · Pregnancy status if applicable
- **Monitoring (during):** VS per IV lounge policy · Symptom assessment q15–30min
- **Monitoring (post):** Post-infusion check · Home instructions
- **Administration:** Dilute per pharmacy label · Gradual rate titration per tolerance

**OPEN reviewer notes:**
- Verify NAD source — FCC compounded vs. commercial. Affects concentration and dilution math
- Some clinicians use Glutathione push at end of NAD+ — confirm if you want this in standard protocol or as add-on
- First-time patient slower start (90-120 min) — confirm threshold for 'first-time'

### IV NAD+ 500mg Infusion

- **Indication:** NAD+ IV therapy 500mg session.
- **Medication:** NAD+
- **Dose:** 500mg
- **Base / diluent:** NAD+ 500mg in 500mL normal saline.
- **Route:** IV infusion
- **Frequency:** Per order
- **Duration:** 90–120 min
- **Pre-administration checks:** Review prior NAD+ sessions · VS baseline
- **Monitoring (during):** VS q15min early · Symptom log
- **Monitoring (post):** Extended observation if symptoms
- **Administration:** Longer observation window · Gradual titration

**OPEN reviewer notes:**
- Confirm step-up requirement — should patients always do 250mg first, or is 500mg first-time acceptable for low-risk patients?
- Verify max dose ceiling — some clinicians cap at 500mg per session; others go to 750mg or 1g

### IV Glutathione Push

- **Indication:** IV glutathione push.
- **Medication:** Glutathione
- **Dose:** 1–2g per order
- **Base / diluent:** Glutathione 1–2g IV push.
- **Route:** IV push
- **Frequency:** Per order
- **Duration:** 5–10 min
- **Pre-administration checks:** Verify dose on order · Patent IV
- **Monitoring (during):** Continuous observation
- **Monitoring (post):** Post-push VS
- **Administration:** Slow push · RN at bedside

**OPEN reviewer notes:**
- Confirm dose preference — 1g standard, 2g for higher-need patients, or always 2g?
- Some clinicians require sulfa allergy screening (theoretical cross-reactivity, debated). Confirm your stance

## 4. Preparation / Reconstitution / Admixture (USP 797)

> Read this section before preparing anything. It defines the legal line between what Caroline does at the chair and what the pharmacy does. Staying on the right side of this line is a regulatory requirement, not a preference.

### 4.1 The scope line (USP 797)

- **Administration is out of USP 797 scope.** Drawing a dose from a finished product, or spiking a manufactured IV bag without further manipulation, is administration. This is the bulk of what happens at the chair.
- **Immediate-use admixture** is the only on-site mixing allowed, and only when all of these are true: no more than three different sterile products combined, one single patient, no hazardous drugs, full aseptic technique, no batching or advance preparation, and administration begins within four hours of the start of preparation.
- **Anything beyond that is sterile compounding** and must be done by the pharmacy in an ISO Class 5 environment. This includes combining more than three sterile products, batching, preparing in advance for storage, or preparing from any nonsterile or bulk ingredient.

### 4.2 EHA architecture (how products arrive and what staff may do)

- **Multi-component bases (Myers and any drip with more than three sterile additives) arrive pre-compounded as finished products** from Custom Pharmacy of Evans or the GC 503A/503B partner. Caroline does not build these from individual vials. She administers the finished product.
- **At the chair, staff may perform only immediate-use admixture:** adding up to three or fewer sterile add-ons to a base immediately before administration, for one patient, for immediate use.
- **No batching.** Do not pre-mix bags for later. Do not prepare for a patient who has not yet arrived and screened.
- **No bulk or nonsterile ingredients.** EHA does not compound from active pharmaceutical ingredient powder. That is the pharmacy's role.

> Confirm with Troy: does the pharmacy supply Myers and the other multi-component drips as finished single products? If yes, this section is correct as written. If staff are currently combining more than three vials at the chair, stop and call the provider. That practice needs to move to the pharmacy or into a compliant compounding setup before it continues.

### 4.3 Aseptic technique (every preparation, every time)

- Hand hygiene before gloving. Clean, uncluttered preparation surface.
- Swab every vial top and every bag port with alcohol and let it dry for the full dry time. Do not fan or blow.
- One sterile needle and syringe per draw. Never recap a used needle. Never reuse.
- Do not touch critical sites (needle, syringe tip, vial septum, port) with anything nonsterile.
- Inspect every product before use. Clear and particle-free only. Cloudy, discolored, or precipitated equals discard.

### 4.4 Reconstitution (powdered or lyophilized products)

Some products, such as NAD+ or glutathione, may be supplied as a powder that must be reconstituted.

- Reconstitute strictly per the pharmacy or manufacturer label: correct diluent, correct volume.
- Add diluent slowly down the vial wall. Swirl gently to dissolve. Do not shake.
- Wait for complete dissolution. Inspect for clarity.
- Label the reconstituted vial with contents, concentration, date, time, and your initials.
- Reconstitution is a form of preparation. Single patient, immediate use, four-hour window applies.

Pharmacy-specified diluent and volume per product:

| Product | Diluent | Volume | Final concentration |
|---|---|---|---|
| NAD+ | __________ | __________ | __________ |
| Glutathione | __________ | __________ | __________ |
| __________ | __________ | __________ | __________ |

### 4.5 Immediate-use add-on admixture (three products or fewer)

1. Confirm the order and the patient. Confirm screening is complete.
2. Draw the add-on. Swab the bag port and let dry.
3. Add to the base. Gently invert to mix. Do not shake.
4. Inspect for clarity and compatibility.
5. Label immediately (see 4.6). Begin administration within the four-hour window.

**Compatibility rules:**
- Calcium never with bicarbonate or phosphate. Precipitation risk.
- Glutathione goes in separately from vitamin C. Give glutathione as its own push after the main infusion, not mixed into the same syringe or simultaneous line.
- When unsure of a combination, do not mix. Call the provider.

### 4.6 Beyond-use dating and labeling

- **Immediate-use beyond-use date is the four-hour window** to begin administration, counted from the start of preparation. If administration has not begun by then, discard safely.
- **Finished compounded products from the pharmacy** carry their own pharmacy-assigned beyond-use date. Store per the pharmacy label, usually refrigerated. Never use past that date.
- **Label every prepared or reconstituted item with:** patient name and date of birth, contents and doses, preparation date and time, beyond-use date and time, preparer initials, and the words "Immediate-Use Only" where applicable.

### 4.7 Stop and call the provider if

- A drip would require combining more than three sterile products at the chair.
- Any request to pre-mix or batch bags in advance.
- Any product is cloudy, discolored, expired, or past its beyond-use date.
- Any uncertainty about a compatibility or a concentration.

> Georgia note: USP 797 is the national standard. The Georgia Board of Pharmacy and the Georgia Composite Medical Board may apply their own requirements on top of it. Confirm the on-site preparation model with counsel before relying on it.

## 6. Prescription Injectables (drafts — pending signature)

Standard-dosing protocol drafts now exist for Toradol, Zofran, Benadryl, and Pepcid (iv-addon-ketorolac-toradol, iv-addon-ondansetron-zofran, iv-addon-diphenhydramine-benadryl, iv-addon-famotidine-pepcid). Each is draft, pending signature — do not administer until signed. is_active is false; Caroline cannot administer against them until Dr. Akers resolves the reviewer notes and signs. Dosing below is derived from those drafts. RN administers under physician standing orders only after the pre-administration screening gate. Acute anaphylaxis is governed by the Emergency / Anaphylaxis protocol, not these.

### Toradol (ketorolac) [DRAFT · iv-addon-ketorolac-toradol]

- Indication: Acute pain and inflammation in the IV-lounge setting; adjunct for headache, migraine, musculoskeletal pain; component of recovery infusions; single-dose use.
- Dose: 30 mg standard; 15 mg if age over 65, weight under 50 kg, or renal impairment
- Route: IM into large muscle, or IV push undiluted
- Rate / duration: IV push over at least 15 seconds
- Frequency: Single dose; maximum 120 mg per 24 hours per provider order
- Pre-administration checks: Verify identity and order · BP and HR · NSAID and aspirin allergy review · GI bleed and ulcer history · Anticoagulant and bleeding-disorder review · Renal history · Pregnancy and breastfeeding status · Confirm age and weight for dose selection · Patent IV access if IV route
- Monitoring: Observe for allergic reaction · Injection site · Vitals per IV-lounge standard
- Administration: Confirm dose against order and completed screening · Swab site and administer per route · IV push undiluted over at least 15 seconds

**Status:** draft, pending signature — do not administer until signed

**OPEN reviewer notes:**
- Confirm 30 mg vs 15 mg as the default single dose for the IV-lounge population.
- Confirm RN may administer under standing order vs requires individualized provider order per encounter, given the GCMB May 2026 standing-order statement.
- Confirm renal screening: recent creatinine required, or history/symptom-based screening acceptable.

### Zofran (ondansetron) [DRAFT · iv-addon-ondansetron-zofran]

- Indication: Prevention and treatment of nausea in the IV lounge, including NAD+-associated, migraine-associated, and recovery infusions; single-dose use.
- Dose: 4 mg; may repeat once per provider order; single IV dose not to exceed 16 mg
- Route: IM, or IV
- Rate / duration: IV over 2 to 5 minutes
- Frequency: Single dose; repeat once per provider order
- Pre-administration checks: Verify identity and order · BP and HR · Allergy review · Cardiac and long-QT history · Medication review for QT-prolonging and serotonergic agents · Patent IV access if IV route
- Monitoring: Observe · Consider rhythm monitoring for known cardiac risk per provider · Vitals per IV-lounge standard
- Administration: Confirm dose against order and completed screening · Administer per route · IV over 2 to 5 minutes, not faster

**Status:** draft, pending signature — do not administer until signed

**OPEN reviewer notes:**
- Confirm default 4 mg and whether a repeat is permitted under standing order or requires provider contact.
- Require baseline ECG or electrolytes for patients on QT-prolonging meds, or is history-based screening acceptable?
- Confirm RN administration under standing order vs individualized order per encounter, given the GCMB May 2026 statement.

### Benadryl (diphenhydramine) [DRAFT · iv-addon-diphenhydramine-benadryl]

- Indication: Mild allergic symptoms, pre-medication, and adjunct H1 blockade in mild allergic or infusion reactions; single-dose use. Anaphylaxis governed by the Emergency protocol.
- Dose: 25 to 50 mg; 25 mg in elderly or sedation-sensitive patients
- Route: IM, or IV slow push, diluted
- Rate / duration: Slow IV over a few minutes
- Frequency: Single dose per order
- Pre-administration checks: Verify identity and order · Allergy review · Glaucoma and urinary-retention history · Age · Transport and driving plan due to sedation · Current sedating medications · Patent IV access if IV route
- Monitoring: Sedation level · Vitals per IV-lounge standard
- Administration: Confirm dose against order and completed screening · Dilute for IV and push slowly over a few minutes · Rapid IV increases sedation and hypotension; avoid

**Status:** draft, pending signature — do not administer until signed

**OPEN reviewer notes:**
- Confirm default 25 vs 50 mg and the elderly threshold for the lower dose.
- Confirm discharge and driving policy after IV diphenhydramine.
- Confirm cross-reference so staff know the Emergency protocol governs an acute reaction, not this protocol.

### Pepcid (famotidine) [DRAFT · iv-addon-famotidine-pepcid]

- Indication: H2 blockade for histamine-mediated symptoms and flushing; dual H1/H2 blockade with diphenhydramine in mild reactions; dyspepsia; single-dose use.
- Dose: 20 mg
- Route: IV
- Rate / duration: Slow push or short infusion per pharmacy guidance, may dilute
- Frequency: Single dose per order
- Pre-administration checks: Verify identity and order · Allergy review · Renal history · Patent IV access
- Monitoring: Observe · Vitals per IV-lounge standard
- Administration: Confirm dose against order and completed screening · Dilute per pharmacy guidance and give slow push or short infusion

**Status:** draft, pending signature — do not administer until signed

**OPEN reviewer notes:**
- Confirm IV push vs short infusion and dilution per your product.
- Confirm renal dose-adjustment threshold.
- Confirm pairing convention with diphenhydramine for allergic and flushing reactions.

Internal staff reference. Contains no patient pricing. Not for patient distribution. IV drip values are from signed protocols and may carry open reviewer notes. Prescription injectables are draft, pending signature — do not administer until signed.
