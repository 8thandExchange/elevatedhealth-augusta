# Elevated Health Augusta — V2 Architecture

This document supersedes the original `practice-management-architecture.md` for the **patient journey, booking flow, lab integration, superbill generation, and membership systems.** The underlying schema, scheduling backend, Google Calendar sync, inventory management, protocol library, and chart workflow from V1 remain valid and are referenced throughout.

Read this document end-to-end before running any of the V2 Lovable prompts. The changes from V1 are significant enough that running V1 prompts after V2 has been adopted will produce the wrong system.

---

## What changed from V1

Five things changed:

**1. Bifurcated booking, not unified.** V1 had a single patient booking flow with a "first visit? book a consultation first" branch. V2 has two distinct entry points on the website. The IV Hydration storefront is open booking — the patient picks a service, picks add-ons, picks a time, pays, and comes in. The Hormones + Peptides storefront is consult-gated — the only thing a new patient can book there is the $79 consultation. The journeys are genuinely different (walk-up cash transaction vs. concierge medicine onboarding) and trying to share one funnel makes both worse.

**2. LabCorp integration is now first-class.** V1 didn't model labs at all. V2 has a full lab orders → results → review pipeline with LabCorp as the reference lab partner. Five named panels, ~30 à la carte tests, lab order entry by physician, specimen collection by Caroline, daily LabCorp pickup, results inbound via portal/fax, results review by physician, results visible to patient in portal.

**3. Superbill generation on every visit.** V1 was cash-pay only with no insurance interaction. V2 still doesn't bill insurance — the clinic stays cash-pay — but generates a superbill on every completed visit so patients can submit to their own insurance for reimbursement. This requires diagnosis codes (ICD-10), service codes (CPT), and a PDF generator. Patient portal shows downloadable superbills for every visit.

**4. Membership is the post-consult conversion.** V1 had membership as an optional service. V2 makes membership the default conversion target after the consult-and-labs sequence for hormones/peptides patients. Single tier at $199/mo. Stripe subscription. Membership status drives pricing throughout the system.

**5. Patient stage is tracked explicitly.** A new column `stage` on the patient record tracks where each patient is in the journey: `new`, `iv_only`, `consult_booked`, `consult_completed`, `labs_drawn`, `labs_received`, `followup_completed`, `membership_active`, `membership_paused`, `membership_cancelled`. This drives UI affordances throughout — what they can book, what's recommended next, what shows up in the dashboard.

---

## The two booking lanes

### Lane A — IV Hydration (open booking)

**URL pattern:** `/iv` (storefront) → `/iv/book` (booking flow)

The IV Hydration storefront is the front door for the walk-up cash-pay business: someone Googles "IV therapy near Augusta," lands on `/iv`, sees the menu, books a Myers Cocktail or NAD+ infusion, comes in. No consult required. No membership required. No questions asked beyond standard intake.

**Storefront page (`/iv`):**
The page reads like an editorial menu, not a SaaS form. Five core IV services displayed as large cards in a 2-column grid: Myers Cocktail ($185), Glutathione IV Push ($95), NAD+ Infusion 250mg ($450), NAD+ Infusion 500mg ($750), Custom IV Build (from $145). Each card has the service name (Playfair italic for the flagship services), a one-line description, duration, and price. Below the cards: an "IV Add-Ons" section with pills for B12, Glutathione, Magnesium, Taurine, Zinc, Vitamin C, Amino Mix — each priced ($25-$45) and each with a checkbox to add to your booking.

**Booking flow (`/iv/book`):**
Five-step wizard. Step 1: confirm service + selected add-ons (carries over from storefront if pre-selected). Step 2: returning vs new patient (returning logs in; new patient gets minimal intake — name, DOB, phone, email, basic consent only — full demographics happen at the visit). Step 3: date and time (calendar of available slots from `provider_availability` minus existing appointments minus `provider_time_off`). Step 4: payment via Stripe (full price charged at booking, no deposit needed for IV — it's cash-and-carry). Step 5: confirmation.

The IV lane has no mandatory consult gate. A first-time IV patient can book Myers Cocktail at 10am Tuesday and walk in at 10am Tuesday. Caroline takes care of the brief intake (allergies, current meds, screening for contraindications) at the visit itself. If anything raises a red flag, Caroline pauses and pulls in the physician.

Patient stage after booking on this lane: `iv_only`. After their first visit: stays `iv_only` unless they upgrade.

### Lane B — Hormones + Peptides (consult-gated)

**URL pattern:** `/hormones` and `/peptides` (storefronts) → `/consult/book` (consult booking flow)

The Hormones + Peptides storefronts are the brand-building front doors. Each is a substantial page that explains the philosophy, the science, the doctor's approach, what membership unlocks. The storefront's primary CTA is not "Book Now" — it's "Book a $79 Consultation."

**Storefront pages:**
`/hormones` covers BHRT for women, TRT for men, the consult-labs-membership journey, what's possible. `/peptides` covers PDA, Sermorelin, Tesamorelin, the longevity stacks, the Wolverine recovery protocol, what's possible. Both pages end with: "The first step is a $79 consultation. Book one below."

**Consult booking flow (`/consult/book`):**
Three steps. Step 1: which storefront brought you here (hormones/peptides/weight loss/sexual wellness — drives the consult intake form). Step 2: minimal info (name, DOB, phone, email) + payment ($79 charged at booking, non-refundable on no-show). Step 3: date/time selection (60-minute consult slots only, with the physician or the RN under standing orders depending on the program).

Patient stage after consult booking: `consult_booked`.

**24 hours before consult: pre-visit intake form sent via SMS.**
The pre-visit form is the heavy intake. It collects: full demographics (street address, emergency contact), insurance information (carrier, policy number, group number, member ID — for superbill generation, NOT for clinic billing), comprehensive medical history (allergies, current medications, surgical history, family history relevant to hormones/peptides), program-specific intake (e.g., for hormones: menopause symptoms, menstrual history, libido/energy/mood scoring), informed consent for compounded medications.

Patient completes this on their phone. Submits before the visit. At the visit, Caroline pulls them up — everything is pre-filled. No clipboard.

**At the consult:**
RN intake: vitals, brief chief complaint review, additional history. Physician (or RN executing under standing orders) does the consult. If the patient is interested in proceeding:

1. Provider opens the lab order screen, picks the appropriate panel (defaulted based on consult type) plus any à la carte additions
2. System calculates the lab cost (your cost from LabCorp catalog) and the patient charge
3. Patient pays the lab markup at checkout (added to the $79 they already paid; the receipt itemizes both)
4. Caroline pulls labels from the lab orders system, draws blood right there
5. Specimen goes into the LabCorp pickup bin in the clinic
6. Provider documents the visit, adds 1-3 ICD-10 codes from a searchable dropdown
7. System assigns CPT codes from the visit type (consult = 99203 new patient or 99213 established)
8. Superbill PDF auto-generates and lands in the patient portal + email

Patient stage after consult: `consult_completed`. After labs are drawn: `labs_drawn`.

**1-3 days later: results come back.**
LabCorp delivers results via portal (downloaded as PDF/HL7 by Caroline at start of each shift) or via fax (auto-OCR'd into the chart by an inbound document handler). When results land in the patient's chart, system status moves to `labs_received` and patient gets an SMS: "Your lab results are in. Book your follow-up consultation here: [link]." The follow-up booking flow shows only follow-up appointment slots ($150 if not yet a member, free if already a member but at this stage they shouldn't be yet).

**At the follow-up:**
Physician reviews labs with patient, recommends a protocol, and presents the membership offer. If the patient enrolls, Stripe sets up the recurring $199/mo subscription, patient stage becomes `membership_active`, and the protocol is initiated. The first medication order goes to FCC (or backup compounder) tied to the patient's name (503A compliance), and Caroline scheduling the patient's first weekly admin visit.

Patient stage after follow-up + membership: `membership_active`. From here forward they book weekly admin visits via the member portal at zero charge per visit.

---

## LabCorp integration architecture

### The launch path: LabCorp Link portal + manual workflow + result inbound automation

This is the realistic 1-week build. Three pieces:

**1. Lab order entry in the clinic system (built):**
- Provider clicks "Order labs" on a visit
- Picks a panel from the dropdown OR adds individual à la carte tests
- System shows the patient's price (member or non-member)
- Patient pays at checkout
- A `lab_orders` row is created with status `ordered`
- The system prints a requisition summary for Caroline (what to draw, what tubes, fasting required, etc.)

**2. LabCorp Link external workflow (manual but standardized):**
- Caroline logs into LabCorp Link separately at the start of each shift (or end of day)
- Enters each ordered lab into LabCorp's system, copying patient demographics + tests from our system
- LabCorp Link generates the requisition and the barcoded specimen labels
- Caroline prints labels, draws specimens at the consult, attaches labels, places in pickup bin
- LabCorp courier picks up daily (typically 4-6pm in this region)

**3. Results inbound (semi-automated):**
- LabCorp delivers results via two channels:
  - **Portal download** — Caroline checks LabCorp Link portal at start of each shift, downloads new result PDFs
  - **Fax delivery** — set up a dedicated efax number (e.g., via Hellofax or eFax Corporate) that auto-routes to a Supabase storage bucket; an edge function OCRs incoming PDFs and creates `lab_results` rows
- Either way, Caroline matches the result PDF to the open `lab_orders` row and clicks "Attach"
- System parses the structured fields (test name, value, unit, reference range, flag) into `lab_results` rows
- Status moves to `results_received`
- Notification fires: physician review queue gets the result, patient gets SMS

**The dual-entry burden:** Caroline enters every lab order twice — once in our system, once in LabCorp Link. For 10-30 labs/day this is 30-60 minutes of admin time, manageable. At higher volume this becomes painful, which is the trigger for upgrading to middleware.

### Month 4 upgrade: Health Gorilla or Particle Health middleware

Once you have steady lab volume (~15+ orders/day), the middleware integration pays for itself. Estimated cost: $300-500/month base + $0.50-2.00 per order. Saves 30-60 minutes/day of Caroline's time and eliminates the dual-entry error rate.

The middleware sits between our system and LabCorp:
- Our `lab_orders` row triggers an API call to the middleware
- Middleware translates to LabCorp's HL7 order format
- Middleware returns a requisition number and PDF
- LabCorp processes normally
- Results flow back via middleware as structured HL7
- Middleware translates to our `lab_results` schema and pushes via webhook

This is a separate workstream that should NOT happen at launch. Wire it up in month 4 once you've validated lab volume.

### Lab pricing model — the catalog

The lab catalog has two parts: **panels** (named bundles with fixed prices) and **tests** (individual à la carte items with member/non-member pricing).

**Panels (fixed prices):**

| Panel | Price | Member price | Tests included | Your cost |
|---|---|---|---|---|
| Foundation Wellness | $295 | $245 | CBC w/diff, CMP, Lipid, HbA1c, Vitamin D 25-OH, TSH, Ferritin, hs-CRP | ~$80 |
| Hormone Optimization — Female | $395 | $345 | Foundation + Estradiol sensitive, Progesterone, Total T, Free T, DHEA-S, FSH, LH, SHBG, fT3, fT4, TPO | ~$165 |
| Hormone Optimization — Male | $395 | $345 | Foundation + Total T, Free T, Estradiol sensitive, DHEA-S, SHBG, PSA (if ≥40), LH, fT3, fT4 | ~$155 |
| Weight Optimization | $345 | $295 | Foundation + Fasting Insulin, Leptin, AM Cortisol, fT3, fT4 | ~$140 |
| Sexual Wellness | $245 | $195 | CBC, CMP-lite, Total T, Free T, Estradiol, Prolactin, SHBG | ~$95 |

**À la carte (member / non-member):**

| Test | Member | Non-Member |
|---|---|---|
| CBC w/Diff | $25 | $45 |
| Comprehensive Metabolic Panel | $35 | $65 |
| Lipid Panel | $35 | $65 |
| HbA1c | $25 | $45 |
| Vitamin D 25-OH | $35 | $65 |
| TSH | $25 | $45 |
| Ferritin | $25 | $45 |
| hs-CRP | $25 | $45 |
| Total Testosterone | $35 | $65 |
| Free Testosterone | $55 | $95 |
| Estradiol Sensitive | $45 | $85 |
| Progesterone | $35 | $65 |
| DHEA-S | $35 | $65 |
| SHBG | $35 | $65 |
| FSH | $25 | $45 |
| LH | $25 | $45 |
| AM Cortisol | $35 | $65 |
| Prolactin | $30 | $55 |
| PSA Total | $35 | $65 |
| PSA Free | $55 | $95 |
| Full Thyroid (TSH/fT3/fT4/TPO/Tg) | $145 | $245 |
| Free T3 | $35 | $65 |
| Free T4 | $35 | $65 |
| TPO Antibodies | $45 | $85 |
| Thyroglobulin Antibodies | $45 | $85 |
| IGF-1 | $85 | $145 |
| NMR LipoProfile | $145 | $245 |
| ApoB | $45 | $85 |
| Lp(a) | $45 | $85 |
| Homocysteine | $35 | $65 |
| Insulin (fasting) | $35 | $65 |
| Leptin | $45 | $85 |
| Comprehensive Cardiovascular (NMR + ApoB + Lp(a) + Homocysteine + hs-CRP) | $345 | $545 |

These prices are seeded into the database via `eh-v2-schema-additions.sql` and the labs catalog UI lets the admin adjust them as LabCorp's client rates change.

### LabCorp account setup (critical)

To launch labs, you need:
- **LabCorp client account** with a contracted pricing schedule. Apply at labcorp.com/healthcare-providers/start-with-labcorp. Approval typically takes 2-3 weeks. Provide: clinic NPI, physician NPI, business credentials, expected volume estimate.
- **LabCorp Link credentials** for Caroline + the physician
- **Specimen pickup arrangement** (typically daily 4-6pm — confirm route with local LabCorp office)
- **Specimen collection supplies** (vacutainer tubes — red, gold, lavender, blue depending on tests; tube transport bags; biohazard pouches). LabCorp typically supplies these free with an active client account.
- **Phlebotomy capability on-site** — Caroline as RN is qualified; verify her scope of practice in Georgia includes blood draws (it does)
- **Refrigerator for specimen short-term storage** (2-8°C) until pickup
- **Dedicated efax number** for inbound results (~$20-40/mo via Hellofax or eFax Corporate)

---

## Superbill generation architecture

### The problem we're solving
Patient pays cash. Patient wants to submit to their insurance for possible reimbursement. Clinic doesn't bill insurance directly (no clearinghouse, no claim submission, no AR follow-up — that's a different business). Clinic's job is to hand the patient a complete, properly-coded document they can submit themselves.

### What a superbill needs

Per CMS-1500 / standard insurance submission requirements, a superbill needs:

- **Patient info:** name, DOB, address, phone, insurance carrier, policy number, group number, member ID
- **Provider info:** physician name, physician NPI, clinic name, clinic address, clinic phone, clinic Tax ID (EIN)
- **Encounter info:** date of service, place of service code (11 = office)
- **Diagnosis codes:** 1-3 ICD-10 codes, marked which is primary
- **Service codes:** CPT codes with modifier (if applicable), units, charged amount
- **Total charged + total paid by patient**
- **Statement that patient paid in full and is requesting reimbursement consideration from their insurance**

### How it's built

**1. Diagnosis code library (`diagnosis_codes` table):**
A database of ICD-10 codes with a "common" flag for the codes that come up frequently in this clinic's workflow. The physician sees a searchable autocomplete; the dropdown defaults to common codes. Common codes are pre-seeded for the launch (see `eh-v2-schema-additions.sql` for the seed list — covers male hypogonadism, female menopause, weight management, sexual dysfunction, vitamin deficiencies, fatigue, peptide-relevant codes).

**2. CPT code library (`cpt_codes` table):**
Database of CPT codes with descriptions and typical charges. Pre-seeded with the codes this clinic uses: 99202-99205 (new patient), 99211-99215 (established patient), 96365 (IV infusion initial), 96366 (IV infusion additional hour), 96374 (IV push), 96375 (IV push additional substance), 96372 (IM/SC injection), 11900 (intralesional injection), 36415 (venipuncture for lab draw).

**3. Service-to-CPT default mapping (`service_cpt_mappings` table):**
Each `services` row gets a default CPT code mapping. When a visit is documented, the CPT codes pre-fill from the service mapping; physician can adjust if needed.

**4. Visit diagnosis assignment (`visit_diagnoses` table):**
At visit close, physician picks 1-3 ICD-10 codes from the dropdown. One must be marked primary.

**5. Visit CPT assignment (`visit_cpt_codes` table):**
Auto-populated from the service mapping at visit start; physician can adjust at visit close.

**6. Superbill PDF generator:**
At visit close, the system generates a PDF superbill from the data. PDF includes everything listed above. Stored in Supabase storage with a signed URL. Patient gets it via email immediately and via portal anytime.

The patient portal "Visits" tab shows every completed visit with a "Download Superbill" button next to each.

### Diagnosis codes pre-seeded for common use

The seed includes ~40 diagnosis codes that cover the clinic's likely service mix (full list in the SQL file). Examples:

- **Male hypogonadism / TRT:** E29.1 (Testicular hypofunction), E23.0 (Hypopituitarism), E22.1 (Hyperprolactinemia)
- **Female menopause / HRT:** N95.1 (Menopausal and female climacteric states), E28.39 (Other primary ovarian failure), N95.0 (Postmenopausal bleeding)
- **Weight management:** E66.9 (Obesity unspecified), E66.01 (Morbid obesity due to excess calories), E66.3 (Overweight), R63.5 (Abnormal weight gain)
- **Sexual dysfunction:** N52.9 (Male erectile dysfunction unspecified), F52.22 (Female sexual arousal disorder), F52.21 (Male erectile disorder)
- **Fatigue / wellness:** R53.83 (Other fatigue), R53.82 (Chronic fatigue unspecified), R53.81 (Other malaise)
- **Vitamin deficiencies:** E55.9 (Vitamin D deficiency), E53.8 (Other specified B-vitamin deficiencies), D51.0 (B12 deficiency anemia)
- **Sleep / mental health:** G47.00 (Insomnia unspecified), G47.9 (Sleep disorder unspecified), F41.1 (Generalized anxiety disorder), F32.9 (Major depressive disorder unspecified)
- **Hair loss:** L65.9 (Nonscarring hair loss unspecified), L64.9 (Androgenic alopecia unspecified)
- **General preventive:** Z00.00 (General adult medical exam without abnormal findings), Z79.890 (Long-term hormone replacement therapy)

Physician can search and add others as needed; the autocomplete pulls from the full ICD-10 library (~70,000 codes).

---

## Membership architecture

### The single tier — Elevated Membership at $199/month

What's included:
- Unlimited weekly clinic visits for therapy administration
- All in-office supplies (syringes, alcohol pads, tegaderm, sharps disposal, gauze)
- Member-rate labs (~40% off non-member pricing on à la carte; $50 off on each panel)
- Dedicated SMS line to Caroline (response within business hours)
- Full patient portal access (chart, labs, superbills, refill requests, messaging)
- 15% off all à la carte IV add-ons
- Priority booking (24-hour advance access to new appointment slots before non-members)
- Quarterly 15-minute physician check-in (telehealth via Doxy.me or in-person)

What's NOT included:
- The medication itself (billed separately at member-cost-plus pricing per Rx — typically 30-50% margin to the clinic)
- Major IV protocols (Myers Cocktail, NAD+ infusions) — these are still billed at full menu price, but member discount applies
- Specialty procedures or ancillary services added later

Cancellation policy: monthly subscription, cancellable anytime with 30-day notice. No proration. Pause option (30-90 days) available with admin approval.

### Membership lifecycle

**Enrollment** happens at the follow-up visit after consult + labs. Patient signs up through the portal (Stripe Payment Element); system creates a `patient_memberships` row with status `active`, captures the Stripe subscription ID, sets the patient's stage to `membership_active`.

**Active state:** patient can book weekly admin visits at zero charge per visit. The Caroline visit calendar treats member visits differently — they're 15-minute slots, not 45-minute slots, and no payment is collected at the visit (it's covered by membership). Member status flag shows on every chart so Caroline knows.

**Pause state:** patient can pause membership for 30-90 days (vacation, surgery recovery, financial reasons). Stripe subscription is paused (no charges); patient cannot book member-rate appointments during pause; all benefits reactivate when membership unpauses.

**Cancellation:** patient or admin can cancel via portal. 30-day notice; final charge processes; subscription ends; patient stage moves to `membership_cancelled` but their chart, history, and records remain accessible. They can re-enroll anytime.

### Membership compatibility with multiple programs

A single Elevated Membership covers a patient across all programs. A member can be on hormones AND a GLP-1 AND doing peptide recovery — one $199/month, all weekly visits and supplies covered. The medications are billed separately per program.

This is a deliberate design choice. If you tier by program, the all-in patient (your highest-value patient) ends up paying for three memberships. That's bad UX and bad retention. Single membership, multiple medication line items. The medication is where the variable economics live.

### Stripe subscription mechanics

A single Stripe `Product` called "Elevated Membership" with a monthly recurring `Price` of $19900 cents. Patient enrollment creates a Stripe `Subscription` linked to the patient's `Customer` ID. Webhooks update the `patient_memberships.status` and Stripe Customer Portal handles billing/payment-method updates without custom UI work.

Webhooks to handle:
- `customer.subscription.created` — set status `active`, set `started_at`
- `customer.subscription.updated` (status change) — sync status
- `customer.subscription.paused` — set status `paused`
- `customer.subscription.resumed` — set status `active`
- `customer.subscription.deleted` — set status `cancelled`, set `ended_at`
- `invoice.payment_failed` — set status `past_due`, send admin alert

---

## Patient stage tracking

A new `stage` column on the patient record drives UI affordances throughout the system.

| Stage | What it means | What patient can do |
|---|---|---|
| `new` | Has booked something but not yet visited | Cannot book hormone/peptide services; can cancel |
| `iv_only` | Has done IV only, no consult | Can book any IV service; cannot book hormone/peptide admin |
| `consult_booked` | Has paid for $79 consult, not yet visited | See consult prep info; complete pre-visit form |
| `consult_completed` | Consult done, no labs ordered | Can book follow-up if appropriate; can become iv_only customer |
| `labs_drawn` | Labs ordered + drawn, awaiting results | Sees "Results pending — typically 1-3 days" in portal |
| `labs_received` | Results in chart, awaiting follow-up | Prompted to book follow-up appointment |
| `followup_completed` | Follow-up done, hasn't joined membership | Membership offer prominent in portal; can return for any service |
| `membership_active` | Active member | Full access; books weekly admin visits free; sees member pricing |
| `membership_paused` | Paused | Sees pause expiration date; can unpause; cannot book member visits |
| `membership_cancelled` | Cancelled | Full chart history visible; can re-enroll; treated as `iv_only` for booking |

Stage transitions are mostly automatic (booking → `consult_booked`, payment confirmation on labs → `labs_drawn`, etc.) with manual override available for the admin (e.g., to set someone to `iv_only` after they've explicitly declined hormones).

---

## Vendor list update

The compounding vendor strategy from V1 stands with one addition. Elevated Health should open accounts with:

**Compounding pharmacies (for hormones, peptides, GLP-1s):**
- **FCC (Formulation Compounding Center)** — Lewisville TX — primary, already covered in `eha-fcc-integration/`
- **Empower Pharmacy** — Houston TX — backup; offers BOTH 503A and 503B (the 503B side allows office-stock without patient names, which is operationally simpler for things like Testosterone Cypionate that you stock for in-office injection)
- **Olympia Pharmacy** — Orlando FL — second backup; well-regarded for BHRT
- **Belmar Pharmacy** — Lakewood CO — BHRT specialist (consider as third backup if Empower or Olympia have supply issues)
- **Tailor Made Compounding** — Lexington KY — peptide specialist (use if FCC peptide supply runs short)

**Reference lab:**
- **LabCorp** — primary (you've already chosen this)
- Quest Diagnostics is the alternative if a patient specifically requests it; not a primary integration target

**Medical-surgical (IV bags, syringes, needles, alcohol pads, PPE, sharps containers):**
- **Henry Schein Medical** — primary
- **McKesson Medical-Surgical** — backup
- **Cardinal Health** — third option

**Specialty supplies:**
- **McGuff Medical Distributing** — high-dose vitamin C (FCC doesn't carry this), specialty vitamins
- **Mylan / Pfizer direct** — standard pharma at wholesale (requires pharmacy license, not recommended for launch)

**Equipment (one-time purchases for clinic setup):**
- **Brother QL-820NWB** label printer (for specimen labels and inventory labels) — ~$200
- **Pharmacy refrigerator with continuous temperature monitoring** (Frigidaire FFPS3133UM medical or equivalent) — ~$1,200
- **Stericycle** sharps disposal contract — ~$30-60/mo
- **Blood draw chair** + phlebotomy supplies — ~$400-800

**Honest recommendation for launch:**
- FCC + Empower + LabCorp + Henry Schein + Stericycle + the equipment list
- Three vendors for compounded medications (FCC primary, Empower backup, one specialist at Tailor Made for peptides if needed) is enough at launch
- Adding more vendors before you have volume just creates more accounts to manage

---

## Updated build sequence

Adding the V2 features to the existing PMS build adds ~1.5-2 weeks. The revised sequence:

**Week 1: Schema + booking lanes**
- Apply schema additions (`eh-v2-schema-additions.sql`)
- Build IV Hydration storefront (`/iv`) and direct-book flow
- Build Hormones + Peptides storefronts (`/hormones`, `/peptides`) and consult-book flow
- Pre-visit demographics SMS form

**Week 2: Lab workflow**
- Lab orders entry UI for physician (panel + à la carte)
- Specimen labels printable from order
- LabCorp pickup logging
- Results inbound (portal download workflow + efax handler)
- Lab results display in chart and patient portal

**Week 3: Superbill + patient stages + membership enrollment**
- Diagnosis code library + visit assignment UI
- CPT code library + service mapping
- Superbill PDF generator
- Patient stage tracking (column + transitions + UI affordances)
- Stripe membership product + subscription enrollment flow + webhook handlers

**Week 4: Member experience**
- Member dashboard (visits, upcoming, labs, superbills, messaging)
- Member-rate appointment booking flow (zero-charge weekly admin visits)
- Member-rate lab pricing (auto-applied)
- Quarterly physician check-in scheduling

**Week 5: Polish + dry runs**
- End-to-end dry run: fake IV-only patient, fake consult-to-membership patient
- Edge case handling (membership pause/cancel, partial lab results, no-show on consult, etc.)
- Admin training docs
- Caroline's chart workflow refinement based on dry-run feedback

This is the realistic path to opening doors with the V2 system. Five weeks of Lovable work on top of the existing brand and PMS foundation. If you parallelize physician-side work (protocol signoff, lab account setup, vendor accounts) with the development work, the critical path is ~5 weeks.

The previous ~5-6 week estimate from V1 grows to ~7 weeks total because of the LabCorp + superbill + membership additions. That's the honest number. There's no shortcut that doesn't compromise the concierge experience you're building toward.
