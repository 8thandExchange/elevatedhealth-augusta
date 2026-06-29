# EHA Medication and Infusion Cheat Sheet

**Elevated Health Augusta | Staff Clinical Reference | Nursing**

> **Two tiers of authority in this sheet. Read this first.**
>
> **Protocol-backed (IV drips).** The Myers, NAD+ 250, NAD+ 500, and Glutathione values come from EHA's signed protocols in the system (slugs noted in each section). These are the values of record. They still carry open physician reviewer notes, flagged inline where they exist. Resolve those with Dr. Akers before relying on them.
>
> **Draft, pending signature (prescription injectables).** Toradol, Zofran, Benadryl, and Pepcid now have standard-dosing protocol drafts (`iv-addon-*`), but they are drafts at status pending, not signed and not active. The dosing in Section 6 is built from those drafts. Do not administer these until Dr. Akers resolves the reviewer notes and signs each one.
>
> Source of truth is the `clinical_protocol_versions` rows, seeded by `20260509140000_seed_clinical_protocol_drafts.sql`. The final version of this sheet should be generated from those rows so it stays in sync. See the note at the end.
>
> Administer only after patient-specific screening: allergies, current medications, pregnancy or breastfeeding status, renal and cardiac history, and a valid provider order or executed protocol for the encounter.

---

## 1. IV Bases and Fluids

| Base | Common volume | Notes |
|---|---|---|
| Normal Saline 0.9% | 250 mL to 1 L | Default carrier for most drips |
| Lactated Ringers | 250 mL to 1 L | Electrolyte-balanced, hydration and recovery |
| D5W | 50 to 250 mL | Carrier for select pushes, dilution |

Check IV patency before starting. Watch the site for infiltration throughout. Document lot number and expiration of every compounded vial used.

---

## 2. Myers Cocktail (protocol of record: `iv-myers-cocktail`)

| Component | Amount |
|---|---|
| Magnesium chloride | 1 g |
| Calcium gluconate | 100 mg |
| B-complex | 1 mL |
| Vitamin B12 | 1 mg |
| Vitamin B5 (dexpanthenol) | 250 mg |
| Vitamin B6 (pyridoxine) | 100 mg |
| Vitamin C (ascorbic acid) | 5 g |
| Base | 250 mL normal saline |

- **Administration:** IV infusion over 30 to 45 minutes. Start slow, titrate to tolerance. Slower start for first-time patients.
- **Pre-administration checks:** BP, HR, allergy review, and G6PD status if previously documented.
- **Monitoring:** vitals at start and completion. Observe for flushing and nausea.

> **OPEN reviewer note (unresolved at signing):** the G6PD screening expectation for the 5 g vitamin C dose is not finalized. High-dose IV vitamin C is contraindicated in G6PD deficiency. Confirm the screening rule with Dr. Akers before the first high-C infusion.

**Mixing cautions:**
- Never co-administer calcium with anything containing bicarbonate or phosphate. They precipitate.
- Calcium and magnesium go in slowly. Rapid delivery can cause arrhythmia or hypotension.
- See Section 4 for how this is supplied and prepared. This table is what the finished product contains, not an instruction to combine seven vials at the chair.

---

## 3. IV Infusions (protocol of record)

### NAD+ 250 mg (`iv-nad-250mg`)
- NAD+ 250 mg in 500 mL normal saline
- Infusion 60 to 90 minutes for established patients, 90 to 120 minutes for first-time
- Pre-medicate with B-complex if the patient has had flushing previously
- Side effects: chest tightness, flushing, nausea. Slow the rate or pause if intolerable.
- Pre-administration checks: BP, HR, prior NAD tolerance review

### NAD+ 500 mg (`iv-nad-500mg`)
- NAD+ 500 mg in 500 mL normal saline
- Infusion 90 to 120 minutes
- Requires prior tolerance of the 250 mg dose before stepping up
- Same side-effect profile as 250 mg with higher likelihood

### Glutathione Push (`iv-glutathione-push`)
- Glutathione 1 to 2 g IV push over 5 to 10 minutes
- Can stand alone or follow NAD+ or Myers

> **OPEN reviewer notes (unresolved at signing):** standard glutathione dose (1 g versus 2 g) is not finalized, and the sulfa-allergy screening stance is not finalized. Confirm both with Dr. Akers.

### Other drips on the menu (build per signed protocol or provider order)
| Drip | Core contents | Typical run time |
|---|---|---|
| Hydration | NS or LR, 1 L, optional electrolytes | 30 to 60 min |
| Immune | Vitamin C, zinc, B-complex, optional glutathione | 30 to 60 min |
| Recovery / Hangover | NS or LR, B-complex, B12, magnesium | 30 to 60 min |
| Beauty / Glow | B12, B-complex, biotin, glutathione push, vitamin C | 30 to 60 min |

---

## 4. Preparation, Reconstitution, and Admixture

> **Read this section before preparing anything.** It defines the legal line between what Caroline does at the chair and what the pharmacy does. Staying on the right side of this line is a regulatory requirement, not a preference.

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

---

## 5. Nutrient Add-Ons (push or added to bag)

Doses below are reference. Where a signed protocol exists (glutathione, NAD+), use the Section 2 and 3 values.

| Add-on | Reference dose | Route and rate | Key notes |
|---|---|---|---|
| Glutathione | **1 to 2 g (per protocol)** | Slow IV push, 5 to 10 min, after the main infusion | Give separately from vitamin C. Bronchospasm risk in asthma. G6PD and sulfa screening per protocol notes. |
| Vitamin C (add-on) | 1 to 5 g | In bag or slow push | High-dose requires G6PD screening |
| B12 | 1 mg | IM or IV | Harmless temporary red urine is expected |
| B-complex | 1 mL | In bag | Energy and metabolism support |
| Biotin | per order | IM or in bag | Advise patient to hold before lab draws. Interferes with troponin and TSH assays. |
| Zinc | per vial | In bag, slow | Nausea if delivered fast |
| Magnesium | per order | In bag, slow | Hypotension if fast. Caution with antihypertensives. |
| MIC or Lipo-B | per order | IM | Weight-management adjunct |
| Amino acids (L-carnitine, arginine, taurine) | per order | In bag | Per drip recipe |
| NAD+ | **250 or 500 mg (per protocol)** | IV, slow per Section 3 | Take-home subQ NAD+ is sold but has no protocol. Do not dispense until one exists. |

---

## 6. Prescription Injectables (protocol drafts, pending Dr. Akers signature)

> **These four now have standard-dosing protocol drafts (`iv-addon-ketorolac-toradol`, `iv-addon-ondansetron-zofran`, `iv-addon-diphenhydramine-benadryl`, `iv-addon-famotidine-pepcid`).** They are drafts at status pending, not signed and not active. The dosing below is built from those drafts. Do not administer until Dr. Akers resolves the reviewer notes and signs each. Acute anaphylaxis is governed by the Emergency / Anaphylaxis protocol, not these.

### Toradol (ketorolac) — NSAID, pain and inflammation [DRAFT]
- **Dose:** 15 to 30 mg IV or IM, single dose. Default 30 mg.
- **Rate:** undiluted IV push over at least 15 seconds
- **Max:** 120 mg per day, do not exceed 5 consecutive days
- **Reduce to 15 mg** if age over 65, weight under 50 kg, or any renal impairment
- **Hold and flag provider for:** pregnancy (contraindicated, especially third trimester), active or recent GI bleed or ulcer, anticoagulant use or bleeding disorder, renal impairment, NSAID or aspirin allergy, asthma with NSAID sensitivity

### Zofran (ondansetron) — anti-nausea [DRAFT]
- **Dose:** 4 mg IV or IM, single dose, may repeat once per provider order
- **Rate:** IV over 2 to 5 minutes, not faster
- **Max single IV dose:** do not exceed 16 mg (QT prolongation risk)
- **Hold and flag provider for:** congenital long QT, current use of other QT-prolonging drugs, serotonergic drugs, known electrolyte abnormality

### Benadryl (diphenhydramine) — antihistamine [DRAFT]
- **Dose:** 25 to 50 mg IV or IM, single dose. Use 25 mg in elderly or sedation-sensitive patients.
- **Rate:** dilute and give slow IV push over a few minutes
- **Hold and flag provider for:** narrow-angle glaucoma, BPH or urinary retention, MAOI use
- **Notes:** causes sedation. Advise no driving. Confirm safe transport before discharge. Anaphylaxis is governed by the Emergency protocol.

### Pepcid (famotidine) — H2 blocker [DRAFT]
- **Dose:** 20 mg IV, single dose
- **Rate:** slow push or short infusion per pharmacy guidance, may dilute
- **Hold and flag provider for:** renal impairment (dose adjustment), H2-antagonist allergy
- **Notes:** often paired with Benadryl for allergic or flushing reactions (dual H1/H2 blockade)

---

## 7. Administration and Monitoring

- Baseline vitals before start. Recheck per patient status and after any Rx injectable.
- Confirm allergies, medication list, and pregnancy or breastfeeding status before any prescription drug.
- Confirm IV patency. Monitor the site for infiltration the entire infusion.
- **Push-rate quick reference:**
  - Calcium and magnesium: slow
  - Ketorolac: at least 15 seconds, undiluted
  - Ondansetron: over 2 to 5 minutes
  - Glutathione: slow push over 5 to 10 minutes
  - NAD+: slow infusion per Section 3, titrate to symptoms
- Post-infusion observation 10 to 15 minutes before discharge.
- Document everything: agent, dose, lot, expiration, rate, site, patient response, and the order or protocol it was given under.

---

## 8. Safety Flags, Contraindications, and Reactions

**Screen before these specifically:**
- **G6PD deficiency** before high-dose vitamin C and IV glutathione. Risk of hemolysis. (Myers G6PD rule is an open protocol note. Confirm with Dr. Akers.)
- **Renal impairment or CHF** before large fluid volumes and electrolyte loads. Fluid-overload risk.
- **Pregnancy or breastfeeding** before any prescription injectable. NSAIDs contraindicated.

**Drug-specific:**
- **Calcium:** never with ceftriaxone, bicarbonate, or phosphate. Arrhythmia if pushed fast.
- **Magnesium:** hypotension, caution with antihypertensives and any heart block.
- **Ketorolac:** bleeding, GI, renal, 5-day max, age and weight dose reduction.
- **Ondansetron:** QT prolongation.
- **NAD+:** too-fast infusion causes flushing, cramping, nausea, anxiety. Slow the drip, do not stop abruptly unless symptoms are severe.
- **Glutathione:** bronchospasm risk in asthma.
- **Biotin:** hold before lab draws, lab-assay interference.

**Reaction response — NOTE: there is no standalone Emergency / Anaphylaxis protocol in the system yet. This is a launch blocker. Confirm against the EHA emergency protocol once signed and the kit location.**
- **Anaphylaxis:** stop infusion immediately, call provider, epinephrine per protocol, diphenhydramine and famotidine, oxygen, activate EMS as indicated.
- **Vasovagal or lightheaded:** stop or slow, lay flat, legs up, recheck vitals.
- **Infiltration or extravasation:** stop infusion, follow site-care steps, document, notify provider.

> Emergency kit location: ____________________
> Epinephrine location and dose: ____________________
> On-call provider and number: ____________________

---

*Internal staff reference. Contains no patient pricing. Not for patient distribution. IV drip values are from signed protocols and may carry open reviewer notes. Prescription injectables are protocol drafts at standard dosing, pending Dr. Akers signature, and must not be administered until signed.*
