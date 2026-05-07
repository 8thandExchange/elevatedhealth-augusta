
# Elevated Health — End-to-End Patient Flow Build

A multi-phase build that turns the site into a complete funnel: marketing → self-serve IV booking → consultation booking with AI pre-screen → labs → patient enrollment with insurance → superbill. All scheduling runs against **provider availability the team controls**, so patients can only book real open slots.

---

## 1. Home Page — Stronger IV Call-Outs

The IV Therapy card already says "Book Direct" but it gets lost. We'll make IV the visual hero of the services section.

- New full-width **"Book IV Hydration in 60 seconds — no consultation required"** banner under the hero, with two buttons: **Browse Drips** and **Not sure? Chat with us**.
- Promote the IV card to span 2 columns with a gold-accented "Book Direct" treatment, drip thumbnails (Myers, NAD+, Immunity, Hydration, Beauty, Recovery), and a "From $X" price.
- The other 3 services (Hormones, Peptides, Weight Loss) move below as secondary cards labeled **"Requires consultation"**.
- Add a third entry point on the home page: **"Talk to our AI Care Assistant"** — opens the existing chatbot pre-seeded with a topic the visitor selects (Hormones / Peptides / Weight Loss / IV / Insurance).

---

## 2. IV Hydration — True Direct Booking with Real Availability

Today, after Stripe checkout the patient lands on a Google Calendar iframe — that's a public link, not our controlled schedule. We'll replace it with a **native availability system** owned by the clinic.

### What we build
- **`provider_schedules`** table — per-provider weekly availability (day-of-week, start, end, service lines they cover, location/room).
- **`schedule_blocks`** table — one-off time-off / vacation / lunch.
- **`appointment_slots`** view/function — derives bookable 15-min slots from schedules minus existing `appointments` and `schedule_blocks`.
- New edge function **`get-available-slots`** — public, takes `service_line` + date range + duration, returns open slots.
- New edge function **`book-iv-appointment`** — public, takes Stripe `session_id` + `slot_start`, creates a record in `appointments` (service_line=`iv`), links to the `iv_drip_bookings` row, sends confirmation email/SMS via existing `send-booking-confirmation`.

### Patient flow
1. Patient picks drip + add-ons → Stripe checkout (existing).
2. After payment, instead of the Google iframe, **`/iv-payment-success`** loads our own slot picker (calendar grid → time chips for the chosen day, only IV-credentialed RN slots shown).
3. Confirm slot → appointment created → confirmation email + SMS.

### Provider flow
- New tab in Provider Dashboard: **"My Schedule"**
  - Set weekly recurring availability per service line (IV, Hormone Consult, Follow-up, etc.).
  - Drop in time-off blocks.
  - View today/week schedule with check-in / check-out (existing `AppointmentPanel` patterns reused).
- New top-level **"Clinic Schedule"** page for admins/office manager — multi-provider agenda view, drag-to-reassign, color-coded by service line.

---

## 3. Hormones / Peptides / Weight Loss — Consultation Booking with AI Pre-Screen

The path stays: patient pays $79 RN Wellness Assessment, then books with Caroline. We're tightening it.

### AI Care Assistant (already exists — we extend it)
- Already wired: `ChatBot` + `chat` edge function + lead capture into `chat_leads` + GoHighLevel.
- We'll **expand the knowledge base** in `supabase/functions/chat/index.ts` so it can answer the most common pre-consult questions for Hormones, Peptides, Weight Loss, Insurance, Pricing, Lab process, and "What happens at my $79 visit".
- Add a **"Ready to book?"** in-chat CTA that deep-links to the $79 RN Assessment Stripe checkout, with the chat transcript saved to `chat_leads.chat_summary` so Caroline sees it before the appointment.
- After chat lead capture, an SMS goes to staff and a record is created with `interest = hormone | peptide | weight_loss`.

### Consult booking with availability
- The same **`get-available-slots`** function powers the consult flow. After `$79` Stripe payment succeeds, `/schedule-consult` loads our native slot picker (only Caroline's `service_line=consult` slots) — no more public Google Calendar.
- Confirmation email/SMS via existing `send-consultation-booking-reminder`.
- Pre-visit: AI assistant transcript + intake form auto-attached to the patient record so Caroline opens the chart already informed.

---

## 4. Lab Workflow — AI Picks the Panel, LabCorp Online Order

After the $79 consult, if the patient is going down the Hormone path, we need lab work.

### What we build
- New edge function **`recommend-lab-panel`** — uses Lovable AI (Gemini) with the patient's intake answers, gender, age, symptoms, current meds → returns a structured panel: `{ tests: [{ labcorp_code, name, reason }], priority, draw_type }`.
- New provider screen **"Suggested Panel"** on the patient chart — AI's recommendation with one-click approve/edit. Caroline can add/remove tests before sending.
- **LabCorp ordering.** LabCorp does not offer a public REST ordering API for clinics — their physician ordering is done through **LabCorp Link** (browser portal) or HL7/EMR integrations. The realistic options:
  - (a) **LabCorp Link deep-link + auto-filled requisition PDF** — we generate a pre-filled requisition from the AI panel, the provider clicks "Open in LabCorp Link" (existing pattern in `LabcorpOrderModal`), and the patient gets an email + SMS with their order number and nearest draw site.
  - (b) **Patient-portal handoff** — patient receives an emailed requisition + LabCorp draw site finder link.
- We'll go with (a)+(b) combined since there's no true API. If the user later signs up for an HL7 integration vendor (eg. Health Gorilla, Rupa, LifeOmic), we can swap in real ordering then.
- Results: existing `parse-zrt-labs` already handles AI parsing of lab PDFs; we'll route LabCorp PDFs through the same path so results auto-populate `lab_results` and trigger Caroline's review.

---

## 5. Patient Enrollment + Insurance + Superbill

The `patients` table already has `insurance_type`, `insurance_plan_name`, `insurance_member_id`, `insurance_group_number`. The intake form captures some of it; we'll harden it and tie it to the superbill flow.

### What we build
- **PatientIntake** form: required insurance section with carrier dropdown (BCBS / TRICARE / VA / Aetna / United / Cigna / Self-Pay / Other), member ID, group #, plan name, and an "Upload insurance card (front/back)" file upload to existing `patient-documents` bucket.
- After every billable encounter, the existing **`SuperbillGenerator`** auto-loads the patient's insurance + ICD-10 (provider selects from `icd10_codes`) + CPT codes (from `cpt_codes`) and emails a printable superbill via the existing `send-superbill-email` function.
- A new **"Insurance & Superbills"** tab in the patient portal so patients can re-download any superbill and view submission instructions specific to their carrier (TRICARE, VA, BCBS — leveraging the existing `InsuranceReimbursementHub`).

---

## Technical Details

### Database (migrations)
```text
provider_schedules  (provider_id, day_of_week, start_time, end_time,
                     service_lines text[], location, slot_minutes, is_active)
schedule_blocks     (provider_id, start_at, end_at, reason)
iv_drip_bookings    (id, stripe_session_id, therapy_id, addon_ids[],
                     customer_email, customer_phone, customer_name,
                     amount_paid, appointment_id nullable, created_at)
appointments        (extend with: stripe_session_id, lead_id, ai_chat_id,
                     pre_visit_summary)
patients            (already has insurance fields — add insurance_card_front_url,
                     insurance_card_back_url, lab_panel_recommendation jsonb)
```

### Edge functions (new)
- `get-available-slots` — public read, computes open slots from `provider_schedules` minus `appointments` minus `schedule_blocks`.
- `book-iv-appointment` — public, validated by Stripe `session_id`.
- `book-consult-appointment` — public, validated by `consultation_bookings.stripe_session_id`.
- `recommend-lab-panel` — auth required, uses `LOVABLE_API_KEY` → Gemini.
- `generate-labcorp-requisition` — produces a pre-filled PDF from the approved panel.

### Edge functions (extend)
- `chat` — expand `PUBLIC_KNOWLEDGE` with peptide / weight-loss / insurance / lab sections; persist `chat_summary` to `chat_leads`.
- `create-iv-drip-checkout` — change `success_url` to `/iv-payment-success?session_id=...` (already does), and ensure `iv_drip_bookings` row is written via Stripe webhook.

### Frontend (new screens)
- `/iv-payment-success` — replace Google iframe with `<SlotPicker serviceLine="iv" />`.
- `/schedule-consult` — replace Google iframe with `<SlotPicker serviceLine="consult" providerId={caroline.id} />`.
- Provider Dashboard → **"My Schedule"** tab.
- Admin → **"Clinic Schedule"** multi-provider view.
- Patient Portal → **"My Appointments"** + **"Insurance & Superbills"** tabs.

### What stays the same
- Stripe checkout, `chat_leads` capture, GoHighLevel sync, Resend/Sinch confirmations, ZRT parsing, existing `SuperbillGenerator`, existing `InsuranceReimbursementHub`, existing `LabcorpOrderModal`.

---

## Suggested Build Order

1. **Home-page IV hero + AI chat entry points** (visible win, no schema).
2. **Provider availability schema + `get-available-slots` + `<SlotPicker>` + `My Schedule` UI.**
3. **Wire IV success page + Consult success page to `<SlotPicker>`.** Removes Google Calendar dependency.
4. **AI chat knowledge expansion + transcript-to-chart handoff.**
5. **AI lab panel recommender + LabCorp requisition PDF + email/SMS to patient.**
6. **Insurance capture in intake + auto-attach to superbill + patient portal superbill tab.**

---

## Open Questions Before We Start Building

1. **Providers who actually take IV and consult bookings** — for now, IV slots = any RN, consults = Caroline only. Confirm or list other providers.
2. **LabCorp integration** — confirming we use the deep-link + PDF approach (no true API exists). If you have a Rupa Health or Health Gorilla account, we can plug that in instead for true online ordering.
3. **Slot length defaults** — IV = 60 min, Consult = 30 min, Follow-up = 20 min. OK?
4. **Patient portal access** — today it's invitation-only post-consult. After IV self-booking, do you want IV-only patients to also get a lightweight portal account (to see their appointments + superbills), or stay anonymous-checkout only?
