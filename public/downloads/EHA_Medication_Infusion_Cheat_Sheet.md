# Elevated Health Augusta — Medication & Infusion Cheat Sheet

> Internal — clinical staff only (no patient pricing) · v1.0.0 · 2026-06-29

Protocol source: `20260509140000_seed_clinical_protocol_drafts.sql` · `body_structured` + formulation from protocol markdown seed.

## IV protocols of record

### IV Myers Cocktail Administration

| Field | Value |
| --- | --- |
| Indication | Adult IV wellness / nutrient repletion per standing orders. |
| Medication | Myers cocktail components as listed |
| Dose | Per formulation above |
| Base / diluent | Magnesium chloride 1g, calcium gluconate 100mg, B-complex 1mL, B12 1mg, B5 250mg, B6 100mg, vitamin C 5g, in 250mL normal saline. |
| Route | IV infusion |
| Frequency | Per order / membership benefit |
| Duration | 30–45 minutes |
| Pre-administration checks | Verify identity · Two RN checks on bag labeling · Patent IV access |
| Monitoring (during) | VS q15min first 30min · Patient comfort |
| Monitoring (post) | Discharge instructions · Adverse event reporting pathway |
| Administration | Prime line · Infuse per rate policy · Dispose sharps per clinic SOP |

**OPEN reviewer notes:**
- Verify Myers formulation matches Henry Schein standard pre-mixed bag if you're using one, vs. compounded in-house
- Confirm 30-45 min infusion rate matches your preference; some clinicians push slower for first-time patients
- Vitamin C dose of 5g — verify G6PD screening expectation in your intake (high-dose IV C is contraindicated in G6PD deficiency)

### IV NAD+ 250mg Infusion

| Field | Value |
| --- | --- |
| Indication | NAD+ IV therapy 250mg session. |
| Medication | NAD+ |
| Dose | 250mg |
| Base / diluent | NAD+ 250mg in 500mL normal saline. |
| Route | IV infusion |
| Frequency | Per order |
| Duration | 60–90 min |
| Pre-administration checks | Baseline VS · Pregnancy status if applicable |
| Monitoring (during) | VS per IV lounge policy · Symptom assessment q15–30min |
| Monitoring (post) | Post-infusion check · Home instructions |
| Administration | Dilute per pharmacy label · Gradual rate titration per tolerance |

**OPEN reviewer notes:**
- Verify NAD source — FCC compounded vs. commercial. Affects concentration and dilution math
- Some clinicians use Glutathione push at end of NAD+ — confirm if you want this in standard protocol or as add-on
- First-time patient slower start (90-120 min) — confirm threshold for 'first-time'

### IV NAD+ 500mg Infusion

| Field | Value |
| --- | --- |
| Indication | NAD+ IV therapy 500mg session. |
| Medication | NAD+ |
| Dose | 500mg |
| Base / diluent | NAD+ 500mg in 500mL normal saline. |
| Route | IV infusion |
| Frequency | Per order |
| Duration | 90–120 min |
| Pre-administration checks | Review prior NAD+ sessions · VS baseline |
| Monitoring (during) | VS q15min early · Symptom log |
| Monitoring (post) | Extended observation if symptoms |
| Administration | Longer observation window · Gradual titration |

**OPEN reviewer notes:**
- Confirm step-up requirement — should patients always do 250mg first, or is 500mg first-time acceptable for low-risk patients?
- Verify max dose ceiling — some clinicians cap at 500mg per session; others go to 750mg or 1g

### IV Glutathione Push

| Field | Value |
| --- | --- |
| Indication | IV glutathione push. |
| Medication | Glutathione |
| Dose | 1–2g per order |
| Base / diluent | Glutathione 1–2g IV push. |
| Route | IV push |
| Frequency | Per order |
| Duration | 5–10 min |
| Pre-administration checks | Verify dose on order · Patent IV |
| Monitoring (during) | Continuous observation |
| Monitoring (post) | Post-push VS |
| Administration | Slow push · RN at bedside |

**OPEN reviewer notes:**
- Confirm dose preference — 1g standard, 2g for higher-need patients, or always 2g?
- Some clinicians require sulfa allergy screening (theoretical cross-reactivity, debated). Confirm your stance

## Prescription Injectables — NO PROTOCOL OF RECORD

| Agent | Informal use | Status |
| --- | --- | --- |
| **Toradol** (ketorolac) | Anti-inflammatory IV push | ⛔ NO PROTOCOL — do not administer until signed |
| **Zofran** (ondansetron) | Antiemetic IV push | ⛔ NO PROTOCOL — do not administer until signed |
| **Benadryl** (diphenhydramine) | Antihistamine IV/IM | ⛔ NO PROTOCOL — do not administer until signed |
| **Pepcid** (famotidine) | H2 blocker IV | ⛔ NO PROTOCOL — do not administer until signed |

## Preparation / Reconstitution / Admixture (USP 797)

### Before you touch anything

1. Perform hand hygiene (soap + water or ABHR) before entering the prep area and after removing gloves.
2. Confirm **patient identity**, **signed order**, and **allergy status** against the chart and wristband.
3. Inspect every vial, bag, and ampule: correct drug, concentration, beyond-use date (BUD), intact seal, no particulate or discoloration. **Do not use** compromised containers.
4. Gather only the supplies needed for this single patient preparation (ISO 5 / PEC mindset even in a non-compounding primary suite — minimize traffic and clutter).

### Work surface & garbing

- Disinfect the prep counter with approved sporicidal/low-level disinfectant; allow full contact time per manufacturer label.
- Gloves required for all manipulations. Mask and hair cover when preparing multiple admixtures in one session or when pharmacy SOP requires.
- No food, drink, or personal phones on the prep surface.

### Reconstitution (peptides / lyophilized vials)

- Use **bacteriostatic water for injection (BWFI)** or diluent specified on the **pharmacy label** — never swap diluents without pharmacist or physician direction.
- Inject diluent slowly down the vial wall; gentle swirl only — **do not shake** unless label instructs.
- Document lot number, reconstitution date/time, and initials on the patient-specific label.
- Apply BUD from pharmacy label or USP 795/797 tables — when in doubt, use the **shorter** dating. Refrigerate if label requires.

### Admixture (IV bags & syringes)

- Use **closed-system transfer device (CSTD)** or needleless connectors when available.
- Add medications to the bag **in order listed on the protocol**; invert gently after each addition — do not shake protein/peptide-containing solutions unless protocol specifies.
- Label every final container with: patient name, drug(s), concentration, total volume, route, BUD date/time, preparer initials.
- **Two-RN verification** required for high-alert additions (electrolytes, insulin-class, chemotherapy-class, or per clinic policy) and for all bags leaving the prep area.

### Immediate-use vs. stored preparations

- **Immediate-use** (administer within 1 hour of prep, no BUD storage): permitted when no high-risk compounding and patient is on-site — still label and document.
- **Stored admixtures** (refrigerated or room temp per USP): only per written pharmacy policy with assigned BUD; log in compounding record.

### Administration handoff

- Compare the prepared product to the **signed clinical protocol** (or physician order if protocol not yet signed).
- Prime IV tubing per manufacturer; verify infusion rate against protocol duration.
- Remain at bedside for IV pushes and for the first 15 minutes of any new infusion per IV lounge policy.

### Waste & documentation

- Discard partial vials and sharps per clinic SOP and Georgia medical waste rules.
- Record lot numbers, prep time, administrator, and any adverse events in the IV flowsheet / EHR.

### When to stop and escalate

- Missing or unsigned protocol for the medication you are about to give → **hold** and notify physician.
- Patient fails pre-administration checks on the protocol → **do not administer**; notify RN lead or physician.
- Any break in aseptic technique → discard prepared product and start over.
