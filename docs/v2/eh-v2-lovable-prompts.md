# Lovable Prompts — V2 Architecture Build

This sequence builds the V2 architecture: bifurcated booking lanes (IV vs Hormone/Peptide), LabCorp workflow, superbill generation, membership system, and patient stage tracking.

**Run order:** these prompts run AFTER the V1 PMS prompts (Prompts 1-8 from `lovable-prompts-pms.md`) and AFTER the FCC integration prompts (FCC-1 through FCC-7). Don't skip ahead.

The V2 prompts are numbered V2-1 through V2-12. Prompts V2-1 through V2-9 are launch-critical. V2-10 through V2-12 are post-launch enhancements (ship within 4 weeks of opening doors).

---

## V2-1 — Apply schema additions

Upload `eh-v2-schema-additions.sql` to Lovable. Then paste:

```
I have uploaded eh-v2-schema-additions.sql. This adds membership,
labs, diagnosis codes, CPT codes, superbill, and patient stage
tracking on top of the existing schema.

1. Run the migration as pms_schema_v2.

2. After running, verify by querying:
   - SELECT count(*) FROM membership_tiers — should return 1
     (Elevated Membership at $199)
   - SELECT count(*) FROM lab_tests — should return ~30
   - SELECT count(*) FROM lab_panels — should return 5
   - SELECT count(*) FROM diagnosis_codes WHERE is_common = true
     — should return ~70
   - SELECT count(*) FROM cpt_codes — should return ~17
   - Spot-check the lab_panel_tests linkage: SELECT p.name,
     count(pt.test_id) FROM lab_panels p LEFT JOIN
     lab_panel_tests pt ON pt.panel_id = p.id GROUP BY p.name
     — Foundation should have 8, Hormone-Female 19, Hormone-Male 17,
     Weight 13, Sexual Wellness 7

3. Verify the patient stage column was added correctly. Try to
   update a test patient row with each valid stage value to
   confirm the CHECK constraint accepts them all.

4. Verify the triggers exist by checking pg_trigger for:
   appointment_stage_update, lab_order_stage_update,
   membership_stage_update, patient_stage_change_log

5. Generate updated TypeScript types for the new tables and add
   them to the existing types file.

Report row counts, any errors encountered, and confirmation that
all triggers were created successfully.
```

**Verify after:** the database has the new schema in place. No UI changes yet — that comes in subsequent prompts.

---

## V2-2 — Build the IV Hydration storefront and direct-book flow

```
Build the IV Hydration storefront and direct-book flow. This is
the open-booking lane (no consult required, no membership required).

ROUTES:
  /iv — public storefront page
  /iv/book — booking flow (5 steps)

STOREFRONT (/iv):
- Editorial header: large hero with the line "IV therapy, when you
  need it." (Playfair italic for "when you need it")
- Below hero: a 2-column grid (1-column on mobile) of 5 service cards
  pulled live from the services table where category IN ('iv','nad')
  AND online_bookable = true
- Each card: service name in Playfair (italic for flagship cards
  like Myers Cocktail, NAD+), one-line description from
  services.description, duration as "45 min", price as "$185"
- Cards have hairline border, no drop shadow, hover lifts to a
  1px camel border
- Below cards section header: "Add-Ons" (tracked uppercase Jost
  in --accent)
- Add-ons grid: pills for B12, Glutathione, Magnesium, Taurine,
  Zinc, Vitamin C, Amino Mix — each with name, dose, and price
  ($25-$45). Multi-select; selected pills show camel background.
- Bottom of page: large "Book Your Visit" CTA button (charcoal,
  bone text)

BOOKING FLOW (/iv/book):
Step 1 — Confirm service + add-ons
  - Carries selection from storefront
  - User can change service or add-ons here
  - Total price displayed prominently

Step 2 — Returning vs new patient
  - "I've been here before" → routes to login
  - "First visit" → minimal intake form (name, DOB, phone, email,
    consent checkbox for SMS) — full demographics happen at the
    visit itself, not here

Step 3 — Date and time
  - Calendar widget showing availability from
    get_available_slots(service_id, NULL, today, today+30)
  - Tap a day, see available time slots in 30-min increments
  - Show provider name with each slot (or "Any available")

Step 4 — Payment
  - Stripe Payment Element
  - Charge full price (no deposit needed for IV — cash and carry)
  - Save card on file for any add-ons added at the visit

Step 5 — Confirmation
  - "You're booked" headline (Playfair italic, large)
  - Appointment details + .ics download
  - Pre-visit instructions: "Eat something light beforehand,
    hydrate well, wear a short-sleeve shirt"
  - "Need to cancel? Reply to your confirmation text or call
    (706) 760-3470"

After successful booking:
- Create appointment row with patient_id, service_id, provider_id,
  start_at, end_at, status='scheduled', total_paid_cents=full_price
- Patient stage: if patient was 'new', set to 'iv_only'
- Send confirmation email + SMS
- Push event to provider's Google Calendar (if integration enabled)

DESIGN DETAILS (apply to both storefront and booking flow):
- Match the brand design tokens (charcoal #2A2826, camel #B8956A,
  bone #F2EBDC)
- Playfair Display for headlines (italic for emotional moments)
- Jost for body, tracked uppercase for section labels
- No drop shadows
- Hairline borders only
- Generous spacing
- Mobile-first

Test by booking a Myers Cocktail end-to-end as a new patient.
Verify the appointment shows up in /admin/calendar AND in the
provider's Google Calendar (if integrated). Verify patient stage
became 'iv_only'.
```

**Verify after:** /iv loads the storefront with the brand styling. Booking flow completes end-to-end. Stage transition works.

---

## V2-3 — Build the Hormones + Peptides storefronts and consult-book flow

```
Build the Hormones storefront, Peptides storefront, and the
consult-book flow. This is the consult-gated lane.

ROUTES:
  /hormones — public storefront for hormone therapy
  /peptides — public storefront for peptide therapy
  /weight-loss — public storefront for GLP-1 weight loss
  /sexual-wellness — public storefront for sexual wellness
  /consult/book — consult booking flow (3 steps)

STOREFRONTS — common structure for all four:
- Hero section with brand-appropriate headline and subhead
  - /hormones hero: "Hormone replacement, done thoughtfully."
  - /peptides hero: "Peptide therapy. The science of optimization."
  - /weight-loss hero: "Sustainable weight loss with medical
    oversight."
  - /sexual-wellness hero: "Intimacy, performance, presence."
- 'How it works' section: 3-step visual
  1. Book a $79 consultation
  2. Lab draw at your visit (your physician selects the panel)
  3. Follow-up to review results and start your protocol
- 'What we offer' section: 4-6 service categories with brief
  descriptions specific to that storefront
  - /hormones: BHRT for women (Bi-Est, progesterone, T topical),
    TRT for men (Test cyp, gonadorelin, anastrozole)
  - /peptides: Recovery (PDA, Thymosin Beta-4), longevity (NAD+,
    SS-31, Sermorelin), cognitive (Selank), wellness (GHK-Cu)
  - /weight-loss: Compounded Semaglutide, compounded Tirzepatide,
    nutritional + lifestyle support
  - /sexual-wellness: PT-141 (women), TRT-related ED treatment
    (men), oxytocin protocols
- 'Why a consultation matters' section: brief copy explaining the
  cash-pay concierge model — superbill, lab draws on-site,
  membership for ongoing care
- Pricing section: shows membership price ($199/mo) with the
  benefits list pulled from membership_tiers.benefits jsonb
- Final CTA: "Book a $79 consultation" (charcoal button)

CONSULT BOOKING FLOW (/consult/book):
Step 1 — Why are you here?
  - Tile selection: "Hormone therapy" / "Peptide therapy" /
    "Weight loss (GLP-1)" / "Sexual wellness" / "Not sure yet"
  - This selection drives the form_type for the pre-visit intake form
  - Patient can pick more than one if interested in multiple

Step 2 — Patient info + payment
  - Name, DOB, phone, email, brief consent checkboxes
  - Stripe Payment Element, charge $79 (non-refundable on no-show)

Step 3 — Date and time
  - Calendar showing 60-minute consult slots only
  - Filter slots to providers who can do the selected consult type
    (physician for all; RN under standing orders for some)

After successful booking:
- Create appointment row with service_id matching the selected
  consult type, status='scheduled'
- Patient stage: 'consult_booked'
- Schedule the pre-visit intake form to be sent via SMS 24 hours
  before the appointment (creates a pre_visit_intake_forms row
  with sent_at = appointment.start_at - interval '24 hours' and
  form_type matching the selected categories)
- Send confirmation email + SMS
- Push event to provider's Google Calendar

CONFIRMATION SCREEN:
- "You're booked" headline (Playfair italic)
- Appointment details + .ics download
- "What to expect": "We'll text you a brief intake form 24 hours
  before your visit. Please complete it on your phone — it lets us
  use the entire consultation focused on you, not paperwork."
- "Need to cancel? Reply to your confirmation text or call us"

Match brand styling. Mobile-first. Test by booking each consult
type and verifying the appointment routes correctly.
```

**Verify after:** all four storefronts load. Consult booking creates the appointment + the pre-visit intake form schedule. Stage transitions to `consult_booked`.

---

## V2-4 — Build the pre-visit SMS intake form

```
Build the pre-visit intake form system. This is the form that gets
SMS'd to patients 24 hours before their consult, which they
complete on their phone, and which pre-fills the chart at the visit.

INFRASTRUCTURE:
1. Add a scheduled function (pg_cron or similar) that runs every
   15 minutes:
   - Find pre_visit_intake_forms rows where sent_at <= now() AND
     completed_at IS NULL AND last_reminder_sent_at IS NULL
   - For each, send an SMS via Twilio with a magic link to the
     form: https://elevatedhealthaugusta.com/intake/{form_id}
   - Update sent_at, sent_via, increment reminders_sent

2. Add a reminder logic: 4 hours before appointment if still not
   completed, send a 2nd SMS reminder.

FORM PAGES (/intake/{form_id}):
The form is multi-step depending on form_type. Common steps for all:

Step 1 — Confirm identity
  - Form prompts: "Confirm your name and DOB"
  - Soft-confirm against the appointment record

Step 2 — Demographics
  - Address (street, city, state, zip)
  - Emergency contact name + phone + relationship
  - Marital status (optional)
  - Race/ethnicity (optional)

Step 3 — Insurance information
  - Heading: "Insurance for your superbill (we don't bill insurance
    directly — you'll get a superbill to submit yourself if you
    choose)"
  - Carrier name
  - Policy number
  - Group number
  - Member ID
  - Policyholder name (default to patient)
  - Policyholder DOB (default to patient)
  - Relationship (self/spouse/parent/other)
  - "Skip — I'll submit cash receipts" option

Step 4 — Allergies & medications
  - Allergies (text list, allow multiple)
  - Current medications (text list with dose + frequency)
  - "I take no medications" checkbox

Step 5 — Medical history
  - Past medical conditions (multi-select from common list +
    free-text "other")
  - Past surgeries (text)
  - Family history (specific to form_type — e.g., for hormones,
    ask about breast cancer, prostate cancer, blood clots)

Step 6 — Form-specific intake (varies by form_type)
  For consult_hormones_female:
    - Menstrual history (LMP, regularity, cycle length)
    - Menopause symptoms (hot flashes, sleep, mood, libido —
      severity scoring)
    - Prior HRT history
    - Current contraception
    - Goals for treatment (free-text)

  For consult_hormones_male:
    - Testosterone-related symptoms (energy, libido, mood, sleep,
      strength — severity scoring)
    - Sexual function questionnaire (IIEF-5)
    - Prior TRT history
    - Goals for treatment

  For consult_weight_loss:
    - Current weight, height, goal weight
    - Weight history (when did weight start being a concern)
    - Past diet/exercise interventions tried
    - Current eating patterns
    - Family history of diabetes, thyroid disease

  For consult_peptides:
    - Specific peptide interest (PDA, Sermorelin, Tesamorelin, etc.)
    - Goals (recovery, longevity, cognitive, etc.)
    - Current supplement regimen
    - Exercise/training schedule

  For consult_sexual_wellness:
    - Sexual function questionnaire (FSFI for women, IIEF for men)
    - Relationship status / partner concerns (sensitive — use care)
    - Current medications affecting sexual function

Step 7 — Consent
  - Compounded medication informed consent (form_type specific)
  - SMS communication consent
  - Receipt of HIPAA notice acknowledgment
  - Electronic signature (typed name + date)

On completion:
- Set completed_at on the pre_visit_intake_forms row
- Save all form data into the data jsonb column
- Update or create patient_insurance row from insurance step
- Update patient demographics (address, etc.)
- Send brief SMS confirmation to patient: "Thanks! Your visit is
  ready. We'll see you [date] at [time]."

CHART INTEGRATION:
- When Caroline opens the appointment in the chart, the pre-visit
  form data appears as a sidebar panel
- Form data is read-only in the chart (changes go through standard
  chart edit flow with audit trail)
- If the form was NOT completed, show a yellow warning at the top
  of the chart: "Pre-visit intake not completed. Take 5 minutes
  with the patient at start of visit to capture this manually."

Match brand styling. Form should feel calm and concierge — generous
white space, clear progress indicator, thoughtful copy explaining
why each question is asked.

Test by booking a fake hormones consult, manually advancing the
sent_at to past, triggering the SMS function, completing the form
on a phone, then opening the appointment in the admin to verify
data flows through.
```

---

## V2-5 — Build the labs catalog UI and lab order entry

```
Build the lab catalog management UI and the lab order entry workflow.

CATALOG MANAGEMENT (/admin/labs):
Three sub-pages:
  /admin/labs/panels — list and manage lab_panels
  /admin/labs/tests — list and manage lab_tests (à la carte)
  /admin/labs/orders — view and manage all lab_orders (next prompt)

Panels page:
- Table: name, included tests count, bundled price, member price,
  default for consult type, active toggle
- Click a panel → detail page showing the included tests,
  pricing, and a "Edit panel" button
- Create new panel button: opens form to define new panel +
  add tests via multi-select autocomplete

Tests page:
- Table: name, category, LabCorp test code, your cost, member
  price, non-member price, requires fasting, active toggle
- Filter by category, active status
- Edit test inline or via modal

LAB ORDER ENTRY (in chart workflow):
On any open appointment, in the chart UI, add a "Order Labs"
button (visible to provider role only).

Clicking opens a modal:
- Top: which panel? (dropdown, defaults to the panel matching the
  appointment's service form_type if applicable)
- Selecting a panel shows the included tests as a checklist
  (all checked by default; provider can uncheck individual tests
  to customize the panel)
- Below: "Add à la carte tests" — searchable autocomplete pulling
  from lab_tests; selected tests show below as removable pills
- Live calculation: total your-cost (for internal reference),
  total patient charge (member price if patient is member, else
  non-member). The "savings vs à la carte" line shows for panels.
- Notes field for the lab requisition (e.g., "draw fasting morning
  preferred")
- Submit button: "Order labs and charge $XXX"

On submit:
- Create lab_orders row with patient_id, appointment_id,
  ordered_by_provider_id, status='ordered', total_cost_cents,
  total_charged_cents
- Create lab_order_items rows for each panel and à la carte test
  (snapshot the cost and charge at order time)
- Charge the patient via Stripe (use saved card if available,
  otherwise prompt for card)
- On payment success, update lab_orders.payment_status='paid' and
  stripe_payment_intent_id

The chart now shows:
- "Lab order placed: [X] tests for $[total]" with a link to the
  lab order detail
- A printable requisition summary (lab_orders detail page) that
  Caroline uses when entering into LabCorp Link

REQUISITION SUMMARY PRINTABLE:
Open lab_orders/{id}/requisition → printable PDF with:
- Patient name, DOB, sex, address, phone
- Provider name, NPI, signature
- Date of order
- List of tests with LabCorp test codes, fasting requirements,
  tube color, specimen type
- Caroline takes this to LabCorp Link to enter the order

Caroline workflow next:
- Caroline pulls up the lab_orders/{id} page
- Clicks "Mark specimen collected" after drawing blood — this
  updates status to specimen_collected, sets
  specimen_collected_at, and changes patient stage to labs_drawn
- At end of day, Caroline clicks "Mark sent to LabCorp" once the
  pickup happens — sets specimen_picked_up_at and status
  to sent_to_lab

Match brand styling. The order entry should feel fast and
deliberate — no extra clicks, sane defaults.
```

---

## V2-6 — Build the lab results inbound and review workflow

```
Build the lab results inbound system and the physician review
workflow. Two inbound channels: portal download (manual) and
fax (semi-automated).

PORTAL DOWNLOAD WORKFLOW:
Caroline checks LabCorp Link at start of each shift, downloads
result PDFs.

Build /admin/labs/inbound page:
- "Upload result PDF" button at top
- Drag-and-drop area
- On upload:
  - File goes to Supabase storage in lab_inbound/ bucket
  - Create lab_inbound_documents row with source='portal_download',
    storage_url, status='pending_match', received_at=now()
  - Run OCR on the PDF (use a serverless function with
    Tesseract.js OR pdf-parse OR an external OCR API like
    AWS Textract). Extract: patient name (top of doc), DOB,
    test name(s), result values
  - Save extracted text to ocr_text and parsed fields
- After OCR, attempt auto-match to an open lab_orders row:
  - Match by patient name + DOB to find candidate lab_orders
  - If single open order matches → status='matched', set
    matched_to_lab_order_id, set matched_at
  - If multiple candidates or no match → leave status='pending_match'
    for Caroline to manually match

For each pending-match document, Caroline:
- Opens the document → side-by-side view with the PDF and a
  list of open lab_orders for matching
- Picks the right order, clicks Match
- This triggers result parsing: extract individual test results
  from the PDF, create lab_results rows linked to the
  lab_order_items, set lab_orders.status='results_received',
  results_received_at=now()
- Stage transition fires: patient stage moves to labs_received
- SMS sent to patient: "Your lab results are in. Book your
  follow-up consultation here: [link to follow-up booking
  filtered to patient's appropriate consult type]"

FAX INBOUND WORKFLOW:
Set up a dedicated efax number via Hellofax or eFax Corporate.
Configure inbound webhook to POST to a Supabase edge function:

POST /api/webhooks/inbound-fax
- Body: PDF file (or URL to download)
- Function downloads the PDF, uploads to Supabase storage
- Creates lab_inbound_documents row with source='fax'
- Same OCR + auto-match flow as portal download

PHYSICIAN REVIEW QUEUE (/provider/labs/review):
- Lists lab_orders where status='results_received' AND
  reviewed_at IS NULL
- Each row: patient name, ordered date, results received date,
  age in queue (red if >48 hours)
- Click → full results view:
  - Patient context (last visit, current chart, allergies,
    current meds)
  - Prior labs in time-series view (e.g., total T over last 4
    draws as a sparkline)
  - Current results in a table with reference ranges, flags
    color-coded (normal=charcoal, low=blue, high=amber,
    critical=red)
  - Notes/interpretation textarea
  - Actions: "Mark reviewed", "Mark reviewed + book follow-up",
    "Mark reviewed + send patient summary message"

On "Mark reviewed":
- Set lab_orders.reviewed_at, reviewed_by_provider_id
- If "+book follow-up", redirect to follow-up booking flow
  pre-filled for this patient
- If "+send patient summary", open a message editor with a
  starter template the physician can customize, then sends via
  patient portal + SMS

PATIENT PORTAL VIEW (/patient/labs):
- Lists all lab_orders for the patient
- Each shows: ordered date, status, tests included
- Click a results-received order → results display:
  - Plain-language summary if physician wrote one
  - Each test: name, value, unit, reference range, flag
  - Trend chart if patient has prior values for the same test
  - Download original LabCorp PDF button

Match brand styling. The patient view should be approachable —
medical jargon translated where possible, no terrifying red flags
without context.

Test by uploading a sample LabCorp PDF, watching auto-match,
manually matching if needed, viewing results in chart, marking
reviewed by physician, viewing in patient portal.
```

---

## V2-7 — Build the diagnosis code and CPT code assignment + superbill generator

```
Build the diagnosis code assignment, CPT code assignment, and
superbill PDF generation.

DIAGNOSIS CODE ASSIGNMENT (in chart workflow):
At visit close in the chart UI, before the provider can sign and
complete, they must assign 1-3 diagnosis codes.

Add a "Diagnoses" section to the chart sidebar:
- Searchable autocomplete (single field) that searches
  diagnosis_codes by code OR description
- Default sort: is_common = true, then by category
- Selected diagnoses appear as pills below the search box
- One must be marked "Primary" (radio button on each pill)
- Up to 3 diagnoses
- "Add custom diagnosis" link if needed (creates a new
  diagnosis_codes row with is_common=false)

On selection, create visit_diagnoses rows linked to the appointment.

CPT CODE ASSIGNMENT (in chart workflow):
At visit close, the system pre-fills CPT codes from
service_cpt_mappings for the appointment's service.

Add a "Procedures (CPT)" section to the chart sidebar:
- Auto-populated table from service_cpt_mappings
- Each row: code, description, quantity (editable), charge
  (editable), modifier (text input, optional)
- "Add CPT code" button: opens autocomplete search of cpt_codes
- Provider can adjust quantities (e.g., NAD+ has 96365 + 96366
  for additional hours), remove inappropriate codes, or add others

On visit close, save visit_cpt_codes rows.

SUPERBILL GENERATION:
After visit close (status='completed'), auto-generate the
superbill PDF.

Build a generate_superbill RPC function:
1. Accepts appointment_id
2. Pulls: patient demographics, patient_insurance (most recent
   active), provider info (name, NPI, clinic info), visit_diagnoses
   (with primary flagged), visit_cpt_codes (with quantities and
   charges), payments made for this visit
3. Generates a clean PDF using a PDF library (jsPDF or pdf-lib).
   Layout based on a standard superbill template:

   ELEVATED HEALTH AUGUSTA — Statement / Superbill
   7013 Evans Town Center Blvd Suite 203 | Evans GA 30809
   Phone: (706) 760-3470 | NPI: [physician NPI]
   Tax ID: [clinic EIN]

   PATIENT INFORMATION
   Name, DOB, Address, Phone

   INSURANCE INFORMATION (if collected)
   Carrier, Policy #, Group #, Member ID, Policyholder

   ENCOUNTER
   Date of service, Place of service: 11 (Office)
   Provider: [name], NPI: [number]

   DIAGNOSES (ICD-10)
   1. [primary code] — [description] (PRIMARY)
   2. [secondary]
   3. [tertiary]

   PROCEDURES (CPT)
   Code | Description | Qty | Modifier | Charge
   [each row]

   TOTAL CHARGED: $XXX.XX
   PAID BY PATIENT: $XXX.XX
   BALANCE: $0.00

   This statement is provided for informational purposes. Patient
   has paid in full at time of service. Patient may submit this
   statement to their insurance carrier for possible reimbursement
   consideration.

4. Saves PDF to Supabase storage at superbills/{patient_id}/{appt_id}.pdf
5. Creates superbills row with appointment_id, patient_id,
   pdf_storage_url, generated_at, totals
6. Sends email to patient with PDF attached: "Your superbill is
   attached and also available in your patient portal."
7. Updates patient portal — visit shows "Download Superbill" button

REGENERATION:
If diagnoses or CPT codes are changed after initial generation,
admin can click "Regenerate superbill" — creates a new superbills
row, marks the old one is_current=false and superseded_by_id =
new id.

PATIENT PORTAL ("My Visits"):
- /patient/visits
- Lists all completed visits
- Each row: date, service, provider, total charged
- "Download Superbill" button on each (downloads from signed URL)
- "Help submitting to insurance?" link to a static help page

Match brand styling. The superbill PDF itself should be clean and
professional — use Playfair for the clinic name at top, Jost for
the rest, generous spacing.

Test by completing a fake visit, assigning diagnoses, assigning
CPT codes, signing the chart, and verifying the superbill
generates correctly.
```

---

## V2-8 — Build the membership enrollment + lifecycle

```
Build the membership enrollment flow, Stripe subscription handling,
and member benefits application throughout the system.

STRIPE SETUP (one-time, manual):
1. In Stripe dashboard, create a Product "Elevated Membership"
2. Add a recurring Price: $199.00 USD monthly
3. Note the price_id, paste into membership_tiers.stripe_price_id
   for the elevated tier (UPDATE membership_tiers SET
   stripe_price_id = 'price_XXX' WHERE slug = 'elevated';)

ENROLLMENT FLOW (in patient portal at /patient/membership):
- Page shows: membership benefits (pull from membership_tiers.benefits
  jsonb), price ($199/month), brief explanation of what membership
  enables
- "Become a Member" button → Stripe Checkout flow:
  - Mode: subscription
  - Line item: the elevated tier price_id
  - Success URL: /patient/membership/welcome
  - Cancel URL: /patient/membership
- On successful checkout, Stripe webhook fires
  customer.subscription.created
- Webhook handler creates patient_memberships row:
  - patient_id (from session metadata)
  - tier_id (Elevated)
  - status='active'
  - stripe_subscription_id, stripe_customer_id
  - started_at = now()
  - current_period_start, current_period_end from Stripe data
- Trigger fires, patient stage transitions to membership_active
- Welcome email sent: "Welcome to Elevated. Here's what's included:
  [benefits]. Book your first weekly visit here: [link]"

ALSO build the same enrollment flow as a button on the
followup-completed flow: after a follow-up visit reviewing labs
ends, the chart UI shows a prominent "Offer Membership to Patient"
button. Clicking generates a Stripe Checkout link via SMS sent
to the patient with copy: "[Patient name], here's the membership
link Dr. [Name] mentioned: [link]. $199/mo, cancel anytime."

WEBHOOK HANDLERS (/api/webhooks/stripe):
Build a handler that processes:
- customer.subscription.created → create or activate
  patient_memberships
- customer.subscription.updated → sync status
- customer.subscription.paused → status='paused', set paused_at
- customer.subscription.resumed → status='active', clear paused_at
- customer.subscription.deleted → status='cancelled', set ended_at
- invoice.payment_failed → status='past_due', send admin alert SMS

All webhook events log to stripe_webhook_log table for audit/debug.

CUSTOMER PORTAL INTEGRATION:
For all membership management (update payment method, pause,
cancel), use Stripe Customer Portal — no custom UI needed.
- Add a "Manage membership" button in /patient/membership that
  opens Stripe Customer Portal in a new tab via a server-generated
  portal session URL.

MEMBER PRICING APPLICATION (apply throughout):
- Lab order entry: when calculating patient charge, check if
  patient.stage = 'membership_active'. If yes, use
  member_price_cents instead of nonmember_price_cents
- Lab panel checkout: same; use bundled_member_price_cents for
  members
- IV add-ons: apply 15% discount for members
- Weekly admin visit booking: zero charge for members, full charge
  for non-members
- Quarterly physician check-in: included for members, $150 for
  non-members

UI INDICATORS:
- Throughout the chart and admin UI, show a small "Member" pill
  badge next to the patient name when patient.stage =
  'membership_active'
- In the patient portal header, show "Member" status with member
  number (UUID prefix or similar)
- In the booking flows, show "Member price: $X" when patient is
  logged in as a member

Test by enrolling a fake patient, verifying webhook fires,
verifying patient stage transitions, verifying member pricing
applies on a subsequent lab order.
```

---

## V2-9 — Build the member dashboard and weekly admin visit booking

```
Build the member dashboard (the central concierge experience for
active members) and the weekly admin visit booking flow.

MEMBER DASHBOARD (/patient/dashboard, gated on
patient.stage = 'membership_active'):

Layout (3 sections, top to bottom):

Section 1 — At a glance
- Big card top: "Welcome back, [first name]"
- Sub-card: next upcoming appointment (date, time, service, "Get
  directions" button)
- Sub-card: "Your membership is active. Member since [date].
  Next billing: [date]."

Section 2 — Active programs
- Card per active medication/protocol
- Each card: medication name, dosing instructions, last admin
  date, next admin scheduled, refill status (if Rx is running low,
  show "Refill ordered" or "Need to reorder")
- "Book your weekly admin" button → goes to weekly visit booking
  flow

Section 3 — Recent activity
- Lab results in last 90 days with summary
- Recent visits with "Download Superbill" buttons
- Recent messages from Caroline

Right sidebar:
- "Message Caroline" button → opens patient portal messaging
- "Refill request" button → opens form to request a refill
  (goes to admin queue)
- "Update payment method" button → opens Stripe Customer Portal
- "Pause membership" button → opens Stripe Customer Portal

WEEKLY ADMIN VISIT BOOKING FLOW (/patient/book-admin):
Streamlined for members (member-only flow):
- Top: "Member visits — booked for $0"
- Pick which protocol you're here for (radio: Hormones / Peptides /
  GLP-1 / Multiple)
- Pick date and time from calendar (15-min slots only — these are
  short admin visits, not consults)
- Provider auto-assigned (Caroline by default unless physician
  required)
- Confirm booking — no payment step (covered by membership)
- On submit: create appointment, status='scheduled',
  total_invoice_cents=0, total_paid_cents=0

Caroline's calendar shows these as 15-min slots in a different
color (camel), and the chart workflow for these visits is
simplified — just verify identity, vitals, do the injection,
sign chart. No consultation overhead.

Match brand styling. The dashboard should feel calming and
purposeful — not data-dense, but information-rich where it matters.
Big typography, generous spacing, clear next-actions.

Test by enrolling a fake patient as a member, opening the
dashboard, booking a weekly admin visit, verifying it shows up
in Caroline's calendar at $0 charge.
```

---

## END OF LAUNCH PHASE V2

After Prompts V2-1 through V2-9 ship, the V2 system is operationally complete. You can open doors and run the full intended customer journey for both lanes.

---

## V2-10 — Quarterly physician check-in scheduling

```
Implement the quarterly physician check-in feature for members.

When a patient enrolls in membership, schedule the first physician
check-in for 90 days from enrollment.

Build:
1. A scheduled function that runs daily and finds members whose
   last_physician_checkin_at is null OR < now() - 90 days
2. For each, sends an SMS: "Hi [name], it's been ~3 months since
   your last physician visit. Book your quarterly check-in (15 min,
   included with membership): [link]"
3. The booking link goes to a special flow where the patient picks
   a 15-min slot with the physician at $0 charge
4. The physician check-in is essentially a wellness review — go
   over labs, current protocol, any new concerns, adjust as needed

Add a last_physician_checkin_at column to patient_memberships and
update it whenever a physician check-in completes.
```

---

## V2-11 — Refill request workflow

```
Implement the refill request workflow.

Member clicks "Refill request" in dashboard → form:
- Select medication from active prescriptions list
- Confirm dose (default to current)
- Notes (optional)
- Submit

Submission creates a refill_requests row. Admin queue at
/admin/refill-requests shows all pending requests.

Admin actions per request:
- "Refill approved as-is" → creates new lab_order/medication_order
  to FCC, status moves to ordered
- "Discuss with physician" → flags for physician review
- "Decline — patient needs visit" → sends patient SMS asking to
  book follow-up
- "Decline — labs needed" → triggers lab order workflow

This automates the most common admin task once the membership base
is established.
```

---

## V2-12 — LabCorp middleware integration (Health Gorilla or Particle Health)

```
This prompt is for month 4+, after lab volume justifies the cost.

Replace the manual LabCorp Link workflow with API-based integration
via Health Gorilla or Particle Health middleware.

This is a substantial integration (3-4 weeks of work) and requires:
1. Vendor selection and contract (Health Gorilla recommended for
   smaller clinics; Particle Health for larger)
2. API credentials and OAuth setup
3. Order submission via the middleware API (replacing the manual
   LabCorp Link entry)
4. Result inbound via webhook (replacing the portal download +
   fax + OCR workflow)
5. Migration of historic orders/results

When you're ready for this, write a fresh prompt with the specific
vendor chosen and the integration scope. Don't try to ship this in
the launch phase.
```

---

## After all V2 prompts ship

You will have:
- ✅ Two distinct booking lanes (IV direct, Hormone/Peptide consult-gated)
- ✅ Pre-visit SMS demographics + insurance + medical history form
- ✅ Lab catalog (5 panels + ~30 à la carte tests) with member/non-member pricing
- ✅ Lab order entry, specimen tracking, results inbound (manual workflow)
- ✅ Physician review queue for lab results
- ✅ Diagnosis code assignment + CPT code assignment at visit close
- ✅ Superbill PDF auto-generated for every visit, downloadable from patient portal
- ✅ Membership enrollment via Stripe with full lifecycle handling
- ✅ Member dashboard with at-a-glance status, programs, recent activity
- ✅ Weekly admin visit booking flow for members
- ✅ Patient stage tracking driving UI affordances throughout
- ✅ Member pricing applied automatically on labs and add-ons

What's still on the human side:
- Physician fills protocol placeholders + signs every protocol (from FCC integration)
- Open LabCorp client account (~2-3 weeks for approval)
- Open FCC + Empower + Henry Schein accounts
- Set up dedicated efax number for LabCorp results
- Refrigerator with temperature monitor
- Stericycle sharps disposal contract
- DrFirst Rcopia EPCS for Schedule III prescribing
- Caroline trained on LabCorp Link workflow
- Stripe Product + Price set up + price_id added to membership_tiers
- Marketing the four storefronts (separate workstream)
- Trademark filing for "Elevated Health Augusta"

Once those are in place, do a full dry-run for both lanes — IV-only patient walking in for Myers Cocktail, and a hormones patient going through consult → labs → membership enrollment → first weekly visit. That's the final verification.
