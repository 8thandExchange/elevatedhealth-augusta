-- ============================================================
-- Elevated Health Augusta — V2 Schema Additions
-- Migration: pms_schema_v2
--
-- Adds support for:
--   - Membership product + patient subscriptions
--   - Lab catalog (panels + à la carte tests)
--   - Lab orders, results, review workflow
--   - Diagnosis codes (ICD-10) with common-code seed
--   - CPT codes with service mapping
--   - Visit-level diagnosis and CPT assignment
--   - Superbill generation tracking
--   - Patient stage tracking
--
-- Apply AFTER pms_schema_v1 (the original schema.sql) is in place.
-- Safe to re-run; uses CREATE TABLE IF NOT EXISTS throughout.
-- ============================================================


-- ============================================================
-- 01: PATIENT STAGE TRACKING
-- ============================================================
-- The patients/profiles table already exists from the base codebase.
-- We add a stage column to drive UI affordances throughout the system.

DO $$ BEGIN
  ALTER TABLE public.patients
    ADD COLUMN IF NOT EXISTS stage text DEFAULT 'new'
      CHECK (stage IN (
        'new', 'iv_only', 'consult_booked', 'consult_completed',
        'labs_drawn', 'labs_received', 'followup_completed',
        'membership_active', 'membership_paused', 'membership_cancelled'
      )),
    ADD COLUMN IF NOT EXISTS stage_updated_at timestamptz DEFAULT now();
EXCEPTION WHEN undefined_table THEN
  -- patients table may be named differently; try profiles
  BEGIN
    ALTER TABLE public.profiles
      ADD COLUMN IF NOT EXISTS stage text DEFAULT 'new'
        CHECK (stage IN (
          'new', 'iv_only', 'consult_booked', 'consult_completed',
          'labs_drawn', 'labs_received', 'followup_completed',
          'membership_active', 'membership_paused', 'membership_cancelled'
        )),
      ADD COLUMN IF NOT EXISTS stage_updated_at timestamptz DEFAULT now();
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Neither patients nor profiles table exists; create it first';
  END;
END $$;

-- Patient stage history for audit trail
CREATE TABLE IF NOT EXISTS public.patient_stage_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  from_stage text,
  to_stage text NOT NULL,
  changed_at timestamptz DEFAULT now(),
  changed_by uuid,
  notes text
);

CREATE INDEX IF NOT EXISTS idx_patient_stage_history
  ON public.patient_stage_history(patient_id, changed_at DESC);


-- ============================================================
-- 02: MEMBERSHIP
-- ============================================================

CREATE TABLE IF NOT EXISTS public.membership_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  price_cents integer NOT NULL,
  billing_period text NOT NULL DEFAULT 'monthly'
    CHECK (billing_period IN ('monthly', 'quarterly', 'annual')),
  description text,
  benefits jsonb DEFAULT '[]'::jsonb,
  -- Example benefits structure:
  -- [
  --   {"label": "Unlimited weekly admin visits", "highlight": true},
  --   {"label": "All in-office supplies included", "highlight": false},
  --   {"label": "Member-rate labs (~40% off)", "highlight": true},
  --   ...
  -- ]
  stripe_product_id text,
  stripe_price_id text,
  display_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.patient_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  tier_id uuid NOT NULL REFERENCES public.membership_tiers(id),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('pending', 'active', 'past_due', 'paused', 'cancelled', 'expired')),
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  started_at timestamptz NOT NULL DEFAULT now(),
  current_period_start timestamptz,
  current_period_end timestamptz,
  paused_at timestamptz,
  paused_until timestamptz,
  pause_reason text,
  cancelled_at timestamptz,
  cancellation_reason text,
  cancellation_notes text,
  ended_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_memberships_active
  ON public.patient_memberships(patient_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_patient_memberships_stripe
  ON public.patient_memberships(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- Stripe webhook event log for debugging
CREATE TABLE IF NOT EXISTS public.stripe_webhook_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed_at timestamptz,
  processing_error text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_unprocessed
  ON public.stripe_webhook_log(created_at)
  WHERE processed_at IS NULL;


-- ============================================================
-- 03: LAB CATALOG (panels + tests)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.lab_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  display_name text,
  labcorp_test_code text,
  category text CHECK (category IN (
    'cbc', 'metabolic', 'lipid', 'glycemic', 'hormone_male',
    'hormone_female', 'thyroid', 'vitamin', 'inflammatory',
    'cardiovascular', 'tumor_marker', 'liver', 'renal',
    'sexual_health', 'metabolic_advanced', 'other'
  )),
  description text,
  labcorp_cost_cents integer,           -- our cost from LabCorp client billing
  member_price_cents integer NOT NULL,  -- what we charge members
  nonmember_price_cents integer NOT NULL, -- what we charge non-members
  requires_fasting boolean DEFAULT false,
  fasting_hours integer,                -- typical 8 or 12
  typical_turnaround_days integer DEFAULT 2,
  specimen_type text DEFAULT 'serum' CHECK (specimen_type IN (
    'serum', 'plasma', 'whole_blood', 'urine', 'saliva', 'stool', 'other'
  )),
  tube_color text,                      -- 'red', 'gold', 'lavender', 'blue', 'green'
  active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lab_tests_active
  ON public.lab_tests(category, display_order)
  WHERE active = true;

CREATE TABLE IF NOT EXISTS public.lab_panels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  bundled_price_cents integer NOT NULL,         -- non-member bundled price
  bundled_member_price_cents integer NOT NULL,  -- member bundled price
  category text CHECK (category IN (
    'foundation', 'hormone_female', 'hormone_male',
    'weight', 'sexual_wellness', 'cardiovascular',
    'comprehensive', 'other'
  )),
  active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  default_for_consult_type text,  -- e.g., 'hormones_female', 'hormones_male', 'weight_loss'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lab_panel_tests (
  panel_id uuid NOT NULL REFERENCES public.lab_panels(id) ON DELETE CASCADE,
  test_id uuid NOT NULL REFERENCES public.lab_tests(id),
  display_order integer DEFAULT 0,
  PRIMARY KEY (panel_id, test_id)
);


-- ============================================================
-- 04: LAB ORDERS + RESULTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.lab_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  appointment_id uuid,
  ordered_by_provider_id uuid NOT NULL,
  ordered_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'ordered' CHECK (status IN (
    'ordered',           -- physician created the order
    'specimen_collected', -- Caroline drew the blood
    'sent_to_lab',       -- LabCorp courier picked up
    'results_received',  -- results in our system
    'reviewed',          -- physician reviewed
    'cancelled'
  )),
  labcorp_requisition_number text,  -- generated when entered into LabCorp Link
  specimen_collected_at timestamptz,
  specimen_collected_by_id uuid,
  specimen_picked_up_at timestamptz,
  results_received_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by_provider_id uuid,
  total_cost_cents integer,         -- what we owe LabCorp (sum of test costs)
  total_charged_cents integer,      -- what patient paid (sum of test charges)
  payment_status text DEFAULT 'unpaid' CHECK (payment_status IN (
    'unpaid', 'paid', 'comp', 'pending_member_billing'
  )),
  stripe_payment_intent_id text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lab_orders_patient
  ON public.lab_orders(patient_id, ordered_at DESC);

CREATE INDEX IF NOT EXISTS idx_lab_orders_review_queue
  ON public.lab_orders(results_received_at)
  WHERE status = 'results_received';

CREATE TABLE IF NOT EXISTS public.lab_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_order_id uuid NOT NULL REFERENCES public.lab_orders(id) ON DELETE CASCADE,
  test_id uuid REFERENCES public.lab_tests(id),
  panel_id uuid REFERENCES public.lab_panels(id),
  -- Either test_id or panel_id is set; if panel_id is set, this represents
  -- the panel as a line item, and individual test results are linked back via the panel
  cost_cents integer,        -- snapshot of cost at order time
  charged_cents integer,     -- snapshot of charge at order time
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lab_order_items_order
  ON public.lab_order_items(lab_order_id);

CREATE TABLE IF NOT EXISTS public.lab_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_order_id uuid NOT NULL REFERENCES public.lab_orders(id),
  lab_order_item_id uuid REFERENCES public.lab_order_items(id),
  test_id uuid REFERENCES public.lab_tests(id),
  test_name text NOT NULL,             -- denormalized for display
  result_value text,                   -- can be numeric or text (e.g., "Negative")
  result_value_numeric numeric,        -- parsed numeric value if applicable
  result_unit text,
  reference_range text,                -- e.g., "300-1000 ng/dL"
  reference_low_numeric numeric,       -- parsed low end
  reference_high_numeric numeric,      -- parsed high end
  flag text CHECK (flag IN ('normal', 'low', 'high', 'critical_low', 'critical_high', 'abnormal', 'unknown')),
  result_received_at timestamptz DEFAULT now(),
  raw_pdf_url text,                    -- supabase storage URL for the raw lab PDF
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lab_results_order
  ON public.lab_results(lab_order_id, result_received_at DESC);

CREATE INDEX IF NOT EXISTS idx_lab_results_patient_test
  ON public.lab_results(test_id, result_received_at DESC);

-- Inbound document handler (for fax-routed lab results that haven't yet been matched)
CREATE TABLE IF NOT EXISTS public.lab_inbound_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL CHECK (source IN ('fax', 'portal_download', 'manual_upload')),
  received_at timestamptz DEFAULT now(),
  storage_url text NOT NULL,
  status text DEFAULT 'pending_match' CHECK (status IN (
    'pending_match', 'matched', 'duplicate', 'irrelevant', 'rejected'
  )),
  matched_to_lab_order_id uuid REFERENCES public.lab_orders(id),
  matched_at timestamptz,
  matched_by uuid,
  ocr_text text,                       -- extracted text from OCR
  ocr_extracted_patient_name text,     -- extracted by OCR for matching
  ocr_extracted_dob text,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lab_inbound_pending
  ON public.lab_inbound_documents(received_at DESC)
  WHERE status = 'pending_match';


-- ============================================================
-- 05: DIAGNOSIS CODES (ICD-10) + CPT CODES + SUPERBILL
-- ============================================================

CREATE TABLE IF NOT EXISTS public.diagnosis_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,        -- e.g., 'E29.1'
  description text NOT NULL,
  category text,                    -- e.g., 'endocrine', 'metabolic', 'mental_health'
  is_common boolean DEFAULT false,  -- true if pre-loaded as common-use
  display_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_diagnosis_codes_common
  ON public.diagnosis_codes(category, display_order)
  WHERE is_common = true AND active = true;

CREATE INDEX IF NOT EXISTS idx_diagnosis_codes_search
  ON public.diagnosis_codes USING gin(to_tsvector('english', code || ' ' || description))
  WHERE active = true;

CREATE TABLE IF NOT EXISTS public.cpt_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,        -- e.g., '96365'
  description text NOT NULL,
  typical_charge_cents integer,
  category text,                    -- e.g., 'em_office', 'iv_infusion', 'injection'
  active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Service-to-default-CPT mapping (one service can have multiple CPT codes)
CREATE TABLE IF NOT EXISTS public.service_cpt_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  cpt_code_id uuid NOT NULL REFERENCES public.cpt_codes(id),
  is_primary boolean DEFAULT false,
  default_quantity integer DEFAULT 1,
  override_charge_cents integer,    -- if not set, uses cpt_codes.typical_charge_cents
  notes text,
  UNIQUE(service_id, cpt_code_id)
);

-- Visit-level diagnosis assignment
CREATE TABLE IF NOT EXISTS public.visit_diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  diagnosis_code_id uuid NOT NULL REFERENCES public.diagnosis_codes(id),
  is_primary boolean DEFAULT false,
  assigned_by_provider_id uuid,
  assigned_at timestamptz DEFAULT now(),
  notes text,
  UNIQUE(appointment_id, diagnosis_code_id)
);

CREATE INDEX IF NOT EXISTS idx_visit_diagnoses_appt
  ON public.visit_diagnoses(appointment_id);

-- Visit-level CPT code assignment
CREATE TABLE IF NOT EXISTS public.visit_cpt_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  cpt_code_id uuid NOT NULL REFERENCES public.cpt_codes(id),
  quantity integer DEFAULT 1,
  charged_cents integer NOT NULL,   -- snapshot of charge at visit close
  modifier text,                    -- CPT modifier if applicable
  notes text,
  UNIQUE(appointment_id, cpt_code_id, modifier)
);

CREATE INDEX IF NOT EXISTS idx_visit_cpt_appt
  ON public.visit_cpt_codes(appointment_id);

-- Generated superbill PDFs
CREATE TABLE IF NOT EXISTS public.superbills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES public.appointments(id),
  patient_id uuid NOT NULL,
  generated_at timestamptz DEFAULT now(),
  generated_by uuid,
  pdf_storage_url text NOT NULL,
  pdf_signed_url_expires_at timestamptz,
  total_diagnosis_count integer,
  total_cpt_count integer,
  total_charged_cents integer,
  total_paid_cents integer,
  superseded_by_id uuid REFERENCES public.superbills(id),
  is_current boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_superbills_patient
  ON public.superbills(patient_id, generated_at DESC)
  WHERE is_current = true;

CREATE INDEX IF NOT EXISTS idx_superbills_appt
  ON public.superbills(appointment_id)
  WHERE is_current = true;


-- ============================================================
-- 06: PATIENT INSURANCE INFO (for superbill, NOT for clinic billing)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.patient_insurance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  carrier_name text NOT NULL,
  policy_number text,
  group_number text,
  member_id text,
  policyholder_name text,             -- if patient is dependent
  policyholder_dob date,
  policyholder_relationship text CHECK (policyholder_relationship IN (
    'self', 'spouse', 'parent', 'other'
  )) DEFAULT 'self',
  is_primary boolean DEFAULT true,
  active boolean DEFAULT true,
  collected_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_insurance_active
  ON public.patient_insurance(patient_id)
  WHERE active = true;


-- ============================================================
-- 07: PRE-VISIT INTAKE FORMS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.pre_visit_intake_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES public.appointments(id),
  patient_id uuid NOT NULL,
  form_type text NOT NULL CHECK (form_type IN (
    'iv_quick', 'consult_hormones_female', 'consult_hormones_male',
    'consult_peptides', 'consult_weight_loss', 'consult_sexual_wellness',
    'general'
  )),
  sent_at timestamptz,
  sent_via text CHECK (sent_via IN ('sms', 'email', 'both')),
  completed_at timestamptz,
  data jsonb DEFAULT '{}'::jsonb,
  -- Form data structure varies by form_type; common fields:
  -- {
  --   "demographics": {...},
  --   "insurance": {...},
  --   "allergies": [...],
  --   "current_medications": [...],
  --   "medical_history": {...},
  --   "program_specific": {...},
  --   "consent_given": true,
  --   "consent_signed_at": "..."
  -- }
  reminders_sent integer DEFAULT 0,
  last_reminder_sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_intake_forms_pending
  ON public.pre_visit_intake_forms(appointment_id)
  WHERE completed_at IS NULL;


-- ============================================================
-- 08: SEED — MEMBERSHIP TIER
-- ============================================================

INSERT INTO public.membership_tiers (slug, name, price_cents, billing_period, description, benefits, display_order, active)
VALUES (
  'elevated',
  'Elevated Membership',
  19900,
  'monthly',
  'The all-access membership for patients on hormone replacement, peptide therapy, weight management, or any ongoing program at Elevated Health. Designed for patients who want concierge-level care without surprises.',
  '[
    {"label": "Unlimited weekly clinic visits for therapy administration", "highlight": true},
    {"label": "All in-office supplies included (syringes, alcohol pads, sharps)", "highlight": false},
    {"label": "Member-rate labs (~40% off non-member pricing)", "highlight": true},
    {"label": "Dedicated SMS line to Caroline (business hours response)", "highlight": false},
    {"label": "Full patient portal access (chart, labs, superbills, refill requests)", "highlight": false},
    {"label": "15% off all à la carte IV add-ons", "highlight": false},
    {"label": "Priority booking (24-hour advance access to new slots)", "highlight": false},
    {"label": "Quarterly 15-minute physician check-in (telehealth or in-person)", "highlight": true}
  ]'::jsonb,
  1,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  price_cents = EXCLUDED.price_cents,
  description = EXCLUDED.description,
  benefits = EXCLUDED.benefits,
  updated_at = now();


-- ============================================================
-- 09: SEED — LAB PANELS + TESTS
-- ============================================================

-- Tests first (panels reference them)
INSERT INTO public.lab_tests (
  name, display_name, labcorp_test_code, category, description,
  labcorp_cost_cents, member_price_cents, nonmember_price_cents,
  requires_fasting, fasting_hours, typical_turnaround_days,
  specimen_type, tube_color, display_order, active
) VALUES
  ('CBC w/Diff', 'Complete Blood Count with Differential', '005009', 'cbc',
    'Red and white blood cell counts; immune system + anemia screen', 800, 2500, 4500,
    false, NULL, 1, 'whole_blood', 'lavender', 1, true),
  ('Comprehensive Metabolic Panel', 'CMP (kidney + liver + electrolytes + glucose)', '322000', 'metabolic',
    'Kidney function, liver function, electrolytes, fasting glucose', 1200, 3500, 6500,
    true, 8, 1, 'serum', 'gold', 2, true),
  ('Lipid Panel', 'Lipid Panel (cholesterol + triglycerides)', '303756', 'lipid',
    'Total cholesterol, LDL, HDL, triglycerides', 1000, 3500, 6500,
    true, 9, 1, 'serum', 'gold', 3, true),
  ('Hemoglobin A1c', 'HbA1c (3-month glucose average)', '001453', 'glycemic',
    '3-month average blood sugar; diabetes screen', 1500, 2500, 4500,
    false, NULL, 1, 'whole_blood', 'lavender', 4, true),
  ('Vitamin D 25-OH', 'Vitamin D, 25-Hydroxy', '081950', 'vitamin',
    'Vitamin D status; deficiency is very common', 2500, 3500, 6500,
    false, NULL, 2, 'serum', 'gold', 5, true),
  ('TSH', 'Thyroid-Stimulating Hormone', '004259', 'thyroid',
    'Primary thyroid function screen', 800, 2500, 4500,
    false, NULL, 1, 'serum', 'gold', 6, true),
  ('Ferritin', 'Ferritin (iron storage)', '004598', 'metabolic',
    'Iron storage protein; fatigue and energy work-up', 1200, 2500, 4500,
    false, NULL, 1, 'serum', 'gold', 7, true),
  ('hs-CRP', 'High-Sensitivity C-Reactive Protein', '120766', 'inflammatory',
    'Systemic inflammation marker; cardiovascular risk', 1800, 2500, 4500,
    false, NULL, 1, 'serum', 'gold', 8, true),

  -- Hormone tests
  ('Total Testosterone', 'Total Testosterone, MS', '070076', 'hormone_male',
    'Total circulating testosterone; primary TRT marker', 1500, 3500, 6500,
    false, NULL, 2, 'serum', 'gold', 10, true),
  ('Free Testosterone', 'Free Testosterone, Direct', '143818', 'hormone_male',
    'Bioavailable testosterone; pairs with total T', 2500, 5500, 9500,
    false, NULL, 2, 'serum', 'gold', 11, true),
  ('Estradiol Sensitive', 'Estradiol, Sensitive (LC/MS-MS)', '140244', 'hormone_male',
    'Sensitive E2 measurement; required for TRT monitoring (regular E2 is unreliable in men)', 3000, 4500, 8500,
    false, NULL, 3, 'serum', 'gold', 12, true),
  ('Progesterone', 'Progesterone', '004317', 'hormone_female',
    'Female cycle assessment; corpus luteum function', 1200, 3500, 6500,
    false, NULL, 2, 'serum', 'gold', 13, true),
  ('DHEA-S', 'DHEA-Sulfate', '004020', 'hormone_male',
    'Adrenal androgen precursor', 1500, 3500, 6500,
    false, NULL, 2, 'serum', 'gold', 14, true),
  ('SHBG', 'Sex Hormone Binding Globulin', '082016', 'hormone_male',
    'Carrier protein; affects free hormone calculations', 1500, 3500, 6500,
    false, NULL, 2, 'serum', 'gold', 15, true),
  ('FSH', 'Follicle-Stimulating Hormone', '004309', 'hormone_female',
    'Pituitary hormone; menopause + male fertility', 800, 2500, 4500,
    false, NULL, 1, 'serum', 'gold', 16, true),
  ('LH', 'Luteinizing Hormone', '004317', 'hormone_female',
    'Pituitary hormone; ovulation + male testicular function', 800, 2500, 4500,
    false, NULL, 1, 'serum', 'gold', 17, true),
  ('AM Cortisol', 'Cortisol, Total (AM draw)', '004051', 'hormone_male',
    'Morning cortisol; HPA axis assessment', 1200, 3500, 6500,
    false, NULL, 2, 'serum', 'gold', 18, true),
  ('Prolactin', 'Prolactin', '004317', 'hormone_male',
    'Pituitary hormone; pituitary tumor screen + libido', 1000, 3000, 5500,
    false, NULL, 2, 'serum', 'gold', 19, true),
  ('PSA Total', 'Prostate-Specific Antigen, Total', '010322', 'tumor_marker',
    'Prostate cancer screen; required before male TRT in patients ≥40', 1200, 3500, 6500,
    false, NULL, 2, 'serum', 'gold', 20, true),

  -- Thyroid expanded
  ('Free T3', 'Free Triiodothyronine', '010389', 'thyroid',
    'Active thyroid hormone', 1500, 3500, 6500,
    false, NULL, 2, 'serum', 'gold', 30, true),
  ('Free T4', 'Free Thyroxine', '001974', 'thyroid',
    'Free T4 (storage hormone, converts to T3)', 1500, 3500, 6500,
    false, NULL, 2, 'serum', 'gold', 31, true),
  ('TPO Antibodies', 'Thyroid Peroxidase Antibodies', '006676', 'thyroid',
    'Hashimoto thyroiditis screen', 2000, 4500, 8500,
    false, NULL, 3, 'serum', 'gold', 32, true),
  ('Thyroglobulin Antibodies', 'Thyroglobulin Antibodies', '006684', 'thyroid',
    'Autoimmune thyroid evaluation', 2000, 4500, 8500,
    false, NULL, 3, 'serum', 'gold', 33, true),
  ('Full Thyroid Panel', 'TSH + Free T3 + Free T4 + TPO + Tg Antibodies', NULL, 'thyroid',
    'Complete thyroid evaluation (all 5 tests bundled at à la carte rate)', 6800, 14500, 24500,
    false, NULL, 3, 'serum', 'gold', 34, true),

  -- Peptide / longevity monitoring
  ('IGF-1', 'Insulin-Like Growth Factor 1', '010363', 'hormone_male',
    'GH axis monitoring; required for sermorelin/tesamorelin patients', 4500, 8500, 14500,
    false, NULL, 3, 'serum', 'gold', 40, true),

  -- Advanced cardiovascular
  ('NMR LipoProfile', 'NMR Lipoprotein Profile', '123456', 'cardiovascular',
    'Particle-size lipid analysis; better than standard lipid for risk', 8500, 14500, 24500,
    true, 9, 3, 'serum', 'gold', 50, true),
  ('ApoB', 'Apolipoprotein B', '167015', 'cardiovascular',
    'Atherogenic particle count; CV risk', 2500, 4500, 8500,
    true, 9, 2, 'serum', 'gold', 51, true),
  ('Lp(a)', 'Lipoprotein (a)', '120295', 'cardiovascular',
    'Genetic CV risk marker', 2500, 4500, 8500,
    false, NULL, 3, 'serum', 'gold', 52, true),
  ('Homocysteine', 'Homocysteine, Plasma', '706994', 'cardiovascular',
    'CV + cognitive risk; B-vitamin status', 2000, 3500, 6500,
    false, NULL, 2, 'plasma', 'lavender', 53, true),

  -- Metabolic advanced
  ('Insulin (fasting)', 'Insulin, Fasting', '004333', 'metabolic_advanced',
    'Insulin resistance screen', 2000, 3500, 6500,
    true, 8, 2, 'serum', 'gold', 60, true),
  ('Leptin', 'Leptin', '146712', 'metabolic_advanced',
    'Satiety hormone; weight management', 3500, 4500, 8500,
    false, NULL, 3, 'serum', 'gold', 61, true)
ON CONFLICT DO NOTHING;

-- Panels
INSERT INTO public.lab_panels (
  slug, name, description, bundled_price_cents, bundled_member_price_cents,
  category, display_order, default_for_consult_type, active
) VALUES
  ('foundation-wellness', 'Foundation Wellness Panel',
    'Comprehensive baseline panel: blood counts, kidney + liver + electrolytes + glucose, lipids, 3-month glucose average, vitamin D, thyroid, iron, inflammation. Recommended for any patient as a starting point.',
    29500, 24500, 'foundation', 1, NULL, true),
  ('hormone-female', 'Hormone Optimization Panel — Female',
    'Foundation panel + female-specific hormone evaluation: estradiol (sensitive), progesterone, total + free testosterone, DHEA-S, FSH, LH, SHBG, full thyroid (fT3, fT4, TPO antibodies).',
    39500, 34500, 'hormone_female', 2, 'consult_hormones_female', true),
  ('hormone-male', 'Hormone Optimization Panel — Male',
    'Foundation panel + male-specific hormone evaluation: total + free testosterone, estradiol sensitive, DHEA-S, SHBG, full thyroid (fT3, fT4). PSA included for patients age 40+.',
    39500, 34500, 'hormone_male', 3, 'consult_hormones_male', true),
  ('weight-optimization', 'Weight Optimization Panel',
    'Foundation panel + metabolic-specific markers: fasting insulin, leptin, AM cortisol, full thyroid (fT3, fT4). Provides the metabolic context for GLP-1 therapy and weight management.',
    34500, 29500, 'weight', 4, 'consult_weight_loss', true),
  ('sexual-wellness', 'Sexual Wellness Panel',
    'Focused panel for sexual health evaluation: CBC, CMP-lite, total + free testosterone, estradiol, prolactin, SHBG. Foundation for TRT, female sexual wellness, or PT-141 candidacy.',
    24500, 19500, 'sexual_wellness', 5, 'consult_sexual_wellness', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  bundled_price_cents = EXCLUDED.bundled_price_cents,
  bundled_member_price_cents = EXCLUDED.bundled_member_price_cents,
  default_for_consult_type = EXCLUDED.default_for_consult_type,
  updated_at = now();

-- Map tests to panels
-- Foundation Wellness Panel
INSERT INTO public.lab_panel_tests (panel_id, test_id, display_order)
SELECT
  (SELECT id FROM public.lab_panels WHERE slug = 'foundation-wellness'),
  t.id,
  ROW_NUMBER() OVER (ORDER BY t.display_order)
FROM public.lab_tests t
WHERE t.name IN ('CBC w/Diff', 'Comprehensive Metabolic Panel', 'Lipid Panel',
                  'Hemoglobin A1c', 'Vitamin D 25-OH', 'TSH', 'Ferritin', 'hs-CRP')
ON CONFLICT DO NOTHING;

-- Hormone Optimization — Female (Foundation + female-specific)
INSERT INTO public.lab_panel_tests (panel_id, test_id, display_order)
SELECT
  (SELECT id FROM public.lab_panels WHERE slug = 'hormone-female'),
  t.id,
  ROW_NUMBER() OVER (ORDER BY t.display_order)
FROM public.lab_tests t
WHERE t.name IN (
  -- Foundation
  'CBC w/Diff', 'Comprehensive Metabolic Panel', 'Lipid Panel',
  'Hemoglobin A1c', 'Vitamin D 25-OH', 'TSH', 'Ferritin', 'hs-CRP',
  -- Female-specific
  'Estradiol Sensitive', 'Progesterone', 'Total Testosterone', 'Free Testosterone',
  'DHEA-S', 'FSH', 'LH', 'SHBG', 'Free T3', 'Free T4', 'TPO Antibodies'
)
ON CONFLICT DO NOTHING;

-- Hormone Optimization — Male (Foundation + male-specific)
INSERT INTO public.lab_panel_tests (panel_id, test_id, display_order)
SELECT
  (SELECT id FROM public.lab_panels WHERE slug = 'hormone-male'),
  t.id,
  ROW_NUMBER() OVER (ORDER BY t.display_order)
FROM public.lab_tests t
WHERE t.name IN (
  -- Foundation
  'CBC w/Diff', 'Comprehensive Metabolic Panel', 'Lipid Panel',
  'Hemoglobin A1c', 'Vitamin D 25-OH', 'TSH', 'Ferritin', 'hs-CRP',
  -- Male-specific
  'Total Testosterone', 'Free Testosterone', 'Estradiol Sensitive',
  'DHEA-S', 'SHBG', 'PSA Total', 'LH', 'Free T3', 'Free T4'
)
ON CONFLICT DO NOTHING;

-- Weight Optimization (Foundation + metabolic)
INSERT INTO public.lab_panel_tests (panel_id, test_id, display_order)
SELECT
  (SELECT id FROM public.lab_panels WHERE slug = 'weight-optimization'),
  t.id,
  ROW_NUMBER() OVER (ORDER BY t.display_order)
FROM public.lab_tests t
WHERE t.name IN (
  'CBC w/Diff', 'Comprehensive Metabolic Panel', 'Lipid Panel',
  'Hemoglobin A1c', 'Vitamin D 25-OH', 'TSH', 'Ferritin', 'hs-CRP',
  'Insulin (fasting)', 'Leptin', 'AM Cortisol', 'Free T3', 'Free T4'
)
ON CONFLICT DO NOTHING;

-- Sexual Wellness
INSERT INTO public.lab_panel_tests (panel_id, test_id, display_order)
SELECT
  (SELECT id FROM public.lab_panels WHERE slug = 'sexual-wellness'),
  t.id,
  ROW_NUMBER() OVER (ORDER BY t.display_order)
FROM public.lab_tests t
WHERE t.name IN (
  'CBC w/Diff', 'Comprehensive Metabolic Panel',
  'Total Testosterone', 'Free Testosterone', 'Estradiol Sensitive',
  'Prolactin', 'SHBG'
)
ON CONFLICT DO NOTHING;


-- ============================================================
-- 10: SEED — DIAGNOSIS CODES (ICD-10) — common-use seed
-- ============================================================

INSERT INTO public.diagnosis_codes (code, description, category, is_common, display_order, active) VALUES
  -- Endocrine — male
  ('E29.1', 'Testicular hypofunction', 'endocrine_male', true, 10, true),
  ('E29.0', 'Testicular hyperfunction', 'endocrine_male', true, 11, true),
  ('E29.8', 'Other testicular dysfunction', 'endocrine_male', true, 12, true),
  ('E29.9', 'Testicular dysfunction, unspecified', 'endocrine_male', true, 13, true),
  ('E23.0', 'Hypopituitarism', 'endocrine_male', true, 14, true),
  ('E22.1', 'Hyperprolactinemia', 'endocrine_male', true, 15, true),

  -- Endocrine — female
  ('N95.1', 'Menopausal and female climacteric states', 'endocrine_female', true, 20, true),
  ('N95.0', 'Postmenopausal bleeding', 'endocrine_female', true, 21, true),
  ('N95.2', 'Postmenopausal atrophic vaginitis', 'endocrine_female', true, 22, true),
  ('N95.8', 'Other specified menopausal and perimenopausal disorders', 'endocrine_female', true, 23, true),
  ('N95.9', 'Unspecified menopausal and perimenopausal disorder', 'endocrine_female', true, 24, true),
  ('E28.39', 'Other primary ovarian failure', 'endocrine_female', true, 25, true),
  ('E28.310', 'Symptomatic premature menopause', 'endocrine_female', true, 26, true),
  ('E28.319', 'Asymptomatic premature menopause', 'endocrine_female', true, 27, true),

  -- Thyroid
  ('E03.9', 'Hypothyroidism, unspecified', 'thyroid', true, 30, true),
  ('E06.3', 'Autoimmune thyroiditis (Hashimoto)', 'thyroid', true, 31, true),
  ('E04.9', 'Nontoxic goiter, unspecified', 'thyroid', true, 32, true),
  ('E07.9', 'Disorder of thyroid, unspecified', 'thyroid', true, 33, true),

  -- Adrenal
  ('E27.49', 'Other adrenocortical insufficiency', 'adrenal', true, 40, true),
  ('E27.40', 'Unspecified adrenocortical insufficiency', 'adrenal', true, 41, true),

  -- Weight management
  ('E66.9', 'Obesity, unspecified', 'weight', true, 50, true),
  ('E66.01', 'Morbid (severe) obesity due to excess calories', 'weight', true, 51, true),
  ('E66.09', 'Other obesity due to excess calories', 'weight', true, 52, true),
  ('E66.3', 'Overweight', 'weight', true, 53, true),
  ('R63.5', 'Abnormal weight gain', 'weight', true, 54, true),
  ('R63.4', 'Abnormal weight loss', 'weight', true, 55, true),
  ('Z71.3', 'Dietary counseling and surveillance', 'weight', true, 56, true),

  -- Metabolic
  ('E11.9', 'Type 2 diabetes mellitus without complications', 'metabolic', true, 60, true),
  ('E11.65', 'Type 2 diabetes with hyperglycemia', 'metabolic', true, 61, true),
  ('R73.03', 'Prediabetes', 'metabolic', true, 62, true),
  ('R73.09', 'Other abnormal glucose', 'metabolic', true, 63, true),
  ('E78.5', 'Hyperlipidemia, unspecified', 'metabolic', true, 64, true),
  ('E78.00', 'Pure hypercholesterolemia, unspecified', 'metabolic', true, 65, true),
  ('I10', 'Essential (primary) hypertension', 'metabolic', true, 66, true),

  -- Sexual dysfunction
  ('N52.9', 'Male erectile dysfunction, unspecified', 'sexual_health', true, 70, true),
  ('N52.31', 'Erectile dysfunction following radical prostatectomy', 'sexual_health', true, 71, true),
  ('F52.21', 'Male erectile disorder', 'sexual_health', true, 72, true),
  ('F52.22', 'Female sexual arousal disorder', 'sexual_health', true, 73, true),
  ('F52.31', 'Female orgasmic disorder', 'sexual_health', true, 74, true),
  ('F52.0', 'Hypoactive sexual desire disorder', 'sexual_health', true, 75, true),
  ('N91.2', 'Amenorrhea, unspecified', 'sexual_health', true, 76, true),

  -- Fatigue / wellness
  ('R53.83', 'Other fatigue', 'general_wellness', true, 80, true),
  ('R53.82', 'Chronic fatigue, unspecified', 'general_wellness', true, 81, true),
  ('R53.81', 'Other malaise', 'general_wellness', true, 82, true),
  ('R53.1', 'Weakness', 'general_wellness', true, 83, true),

  -- Vitamin / nutritional
  ('E55.9', 'Vitamin D deficiency, unspecified', 'nutritional', true, 90, true),
  ('E53.8', 'Other specified B-vitamin deficiencies', 'nutritional', true, 91, true),
  ('D51.0', 'B12 deficiency anemia due to intrinsic factor deficiency', 'nutritional', true, 92, true),
  ('D51.9', 'Vitamin B12 deficiency anemia, unspecified', 'nutritional', true, 93, true),
  ('E61.1', 'Iron deficiency', 'nutritional', true, 94, true),
  ('E63.9', 'Nutritional deficiency, unspecified', 'nutritional', true, 95, true),

  -- Sleep
  ('G47.00', 'Insomnia, unspecified', 'sleep', true, 100, true),
  ('G47.01', 'Insomnia due to medical condition', 'sleep', true, 101, true),
  ('G47.9', 'Sleep disorder, unspecified', 'sleep', true, 102, true),
  ('G47.30', 'Sleep apnea, unspecified', 'sleep', true, 103, true),

  -- Mental health
  ('F41.1', 'Generalized anxiety disorder', 'mental_health', true, 110, true),
  ('F41.9', 'Anxiety disorder, unspecified', 'mental_health', true, 111, true),
  ('F32.9', 'Major depressive disorder, single episode, unspecified', 'mental_health', true, 112, true),
  ('F33.9', 'Major depressive disorder, recurrent, unspecified', 'mental_health', true, 113, true),
  ('F39', 'Unspecified mood disorder', 'mental_health', true, 114, true),

  -- Hair / skin
  ('L65.9', 'Nonscarring hair loss, unspecified', 'dermatology', true, 120, true),
  ('L64.9', 'Androgenic alopecia, unspecified', 'dermatology', true, 121, true),
  ('L64.8', 'Other androgenic alopecia', 'dermatology', true, 122, true),
  ('L70.0', 'Acne vulgaris', 'dermatology', true, 123, true),
  ('L71.9', 'Rosacea, unspecified', 'dermatology', true, 124, true),
  ('L81.4', 'Other melanin hyperpigmentation', 'dermatology', true, 125, true),

  -- Long-term therapy / wellness
  ('Z79.890', 'Other long term (current) drug therapy', 'long_term_care', true, 130, true),
  ('Z79.818', 'Other long term (current) use of medications', 'long_term_care', true, 131, true),
  ('Z00.00', 'Encounter for general adult medical exam without abnormal findings', 'preventive', true, 132, true),
  ('Z00.01', 'Encounter for general adult medical exam with abnormal findings', 'preventive', true, 133, true),
  ('Z71.89', 'Other specified counseling', 'preventive', true, 134, true)
ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  is_common = EXCLUDED.is_common;


-- ============================================================
-- 11: SEED — CPT CODES
-- ============================================================

INSERT INTO public.cpt_codes (code, description, typical_charge_cents, category, display_order, active, notes) VALUES
  -- Evaluation & Management — New patient
  ('99202', 'New patient office visit, 15-29 min, straightforward', 15000, 'em_office', 10, true,
    'Brief new patient visit'),
  ('99203', 'New patient office visit, 30-44 min, low complexity', 22000, 'em_office', 11, true,
    'Standard new patient consult — most $79 consult visits'),
  ('99204', 'New patient office visit, 45-59 min, moderate complexity', 30000, 'em_office', 12, true,
    'Extended new patient — most hormone/peptide consults'),
  ('99205', 'New patient office visit, 60-74 min, high complexity', 40000, 'em_office', 13, true,
    'Complex new patient'),

  -- Evaluation & Management — Established patient
  ('99211', 'Established patient, minimal, may not require physician', 7500, 'em_office', 20, true,
    'Brief follow-up; nurse visit'),
  ('99212', 'Established patient, 10-19 min, straightforward', 12000, 'em_office', 21, true,
    'Brief follow-up'),
  ('99213', 'Established patient, 20-29 min, low complexity', 15000, 'em_office', 22, true,
    'Standard follow-up — most lab review visits'),
  ('99214', 'Established patient, 30-39 min, moderate complexity', 22000, 'em_office', 23, true,
    'Extended follow-up'),
  ('99215', 'Established patient, 40-54 min, high complexity', 30000, 'em_office', 24, true,
    'Complex follow-up'),

  -- IV infusion
  ('96365', 'IV infusion, therapeutic/diagnostic, initial up to 1 hour', 18500, 'iv_infusion', 30, true,
    'Standard IV infusion — Myers, NAD initial hour'),
  ('96366', 'IV infusion, each additional hour', 9500, 'iv_infusion', 31, true,
    'Additional hours for NAD+ extended infusions'),
  ('96367', 'IV infusion, additional sequential infusion', 7500, 'iv_infusion', 32, true,
    'Sequential additive in same session'),

  -- IV push
  ('96374', 'IV push, single substance', 9500, 'iv_push', 40, true,
    'Glutathione push, single-substance push'),
  ('96375', 'IV push, additional substance', 4500, 'iv_push', 41, true,
    'Each additional push substance'),

  -- Injections
  ('96372', 'Therapeutic, prophylactic, or diagnostic injection (IM/SC)', 4500, 'injection', 50, true,
    'B12 IM, lipotropic IM, hormone IM, peptide SC'),
  ('11900', 'Injection of intralesional, up to and including 7 lesions', 9500, 'injection', 51, true,
    'Less common; specific procedures'),

  -- Phlebotomy / specimen
  ('36415', 'Collection of venous blood by venipuncture', 2500, 'phlebotomy', 60, true,
    'Lab draw at consult; bills with lab order'),
  ('99000', 'Handling/conveyance of specimen for transfer', 1500, 'phlebotomy', 61, true,
    'Specimen handling fee')
ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  typical_charge_cents = EXCLUDED.typical_charge_cents,
  category = EXCLUDED.category,
  notes = EXCLUDED.notes;


-- ============================================================
-- 12: SERVICE-TO-CPT DEFAULT MAPPINGS
-- ============================================================
-- These mappings auto-assign CPT codes when a visit is documented.
-- Physician can adjust at visit close.

-- Note: services table is from the V1 schema. These INSERTs assume
-- services have been seeded with the slugs from FCC integration.
-- Skip with ON CONFLICT DO NOTHING if a mapping already exists.

INSERT INTO public.service_cpt_mappings (service_id, cpt_code_id, is_primary, default_quantity, override_charge_cents)
SELECT
  s.id,
  c.id,
  true,
  1,
  s.price_cents
FROM public.services s
CROSS JOIN public.cpt_codes c
WHERE
  -- Map IV services to 96365
  (s.slug IN ('myers-cocktail-iv', 'glutathione-iv-push', 'custom-iv-build') AND c.code = '96365')
  OR
  -- Map NAD to 96365 + 96366 (handled per visit)
  (s.slug IN ('nad-250mg', 'nad-500mg') AND c.code = '96365')
  OR
  -- Map IM injections to 96372
  (s.slug IN ('lipotropic-im', 'b12-methylcobalamin-im') AND c.code = '96372')
  OR
  -- Map new patient consults to 99204
  (s.slug IN ('hrt-female-initial', 'trt-male-initial', 'glp1-initial',
              'sermorelin-consult', 'pda-recovery-consult',
              'sexual-wellness-consult', 'hair-restoration-consult')
   AND c.code = '99204')
  OR
  -- Map established follow-ups to 99213
  (s.slug IN ('hrt-female-followup', 'trt-male-followup', 'glp1-monthly') AND c.code = '99213')
ON CONFLICT (service_id, cpt_code_id) DO NOTHING;

-- For NAD infusions, also add 96366 (additional hours) as non-primary
INSERT INTO public.service_cpt_mappings (service_id, cpt_code_id, is_primary, default_quantity, override_charge_cents)
SELECT
  s.id,
  (SELECT id FROM public.cpt_codes WHERE code = '96366'),
  false,
  CASE WHEN s.slug = 'nad-250mg' THEN 3 WHEN s.slug = 'nad-500mg' THEN 5 END,
  9500
FROM public.services s
WHERE s.slug IN ('nad-250mg', 'nad-500mg')
ON CONFLICT (service_id, cpt_code_id) DO NOTHING;


-- ============================================================
-- 13: TRIGGER — auto-update patient stage based on appointment status
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_patient_stage_from_appointment()
RETURNS TRIGGER AS $$
DECLARE
  service_category text;
BEGIN
  SELECT category INTO service_category FROM public.services WHERE id = NEW.service_id;

  -- Booking transitions
  IF NEW.status = 'scheduled' AND OLD.status IS NULL THEN
    IF service_category = 'consult' THEN
      UPDATE public.patients SET stage = 'consult_booked', stage_updated_at = now()
        WHERE id = NEW.patient_id AND stage IN ('new', 'iv_only');
    ELSIF service_category = 'iv' AND
          (SELECT stage FROM public.patients WHERE id = NEW.patient_id) = 'new' THEN
      UPDATE public.patients SET stage = 'iv_only', stage_updated_at = now()
        WHERE id = NEW.patient_id;
    END IF;
  END IF;

  -- Completion transitions
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    IF service_category = 'consult' THEN
      UPDATE public.patients SET stage = 'consult_completed', stage_updated_at = now()
        WHERE id = NEW.patient_id AND stage = 'consult_booked';
    END IF;
  END IF;

  RETURN NEW;
EXCEPTION WHEN undefined_table THEN
  -- patients table may be named differently; trigger silently no-ops
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS appointment_stage_update ON public.appointments;
CREATE TRIGGER appointment_stage_update
  AFTER INSERT OR UPDATE OF status ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_patient_stage_from_appointment();


-- ============================================================
-- 14: TRIGGER — auto-update patient stage from lab order status
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_patient_stage_from_lab_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'specimen_collected' AND
     (OLD.status IS NULL OR OLD.status != 'specimen_collected') THEN
    UPDATE public.patients SET stage = 'labs_drawn', stage_updated_at = now()
      WHERE id = NEW.patient_id AND stage IN ('consult_completed', 'consult_booked');
  END IF;

  IF NEW.status = 'results_received' AND OLD.status != 'results_received' THEN
    UPDATE public.patients SET stage = 'labs_received', stage_updated_at = now()
      WHERE id = NEW.patient_id AND stage = 'labs_drawn';
  END IF;

  RETURN NEW;
EXCEPTION WHEN undefined_table THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lab_order_stage_update ON public.lab_orders;
CREATE TRIGGER lab_order_stage_update
  AFTER INSERT OR UPDATE OF status ON public.lab_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_patient_stage_from_lab_order();


-- ============================================================
-- 15: TRIGGER — auto-update patient stage from membership status
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_patient_stage_from_membership()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
    UPDATE public.patients SET stage = 'membership_active', stage_updated_at = now()
      WHERE id = NEW.patient_id;
  ELSIF NEW.status = 'paused' AND OLD.status != 'paused' THEN
    UPDATE public.patients SET stage = 'membership_paused', stage_updated_at = now()
      WHERE id = NEW.patient_id;
  ELSIF NEW.status IN ('cancelled', 'expired') AND OLD.status NOT IN ('cancelled', 'expired') THEN
    UPDATE public.patients SET stage = 'membership_cancelled', stage_updated_at = now()
      WHERE id = NEW.patient_id;
  END IF;

  RETURN NEW;
EXCEPTION WHEN undefined_table THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS membership_stage_update ON public.patient_memberships;
CREATE TRIGGER membership_stage_update
  AFTER INSERT OR UPDATE OF status ON public.patient_memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_patient_stage_from_membership();


-- ============================================================
-- 16: TRIGGER — log all stage changes to history
-- ============================================================

CREATE OR REPLACE FUNCTION public.log_patient_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stage IS DISTINCT FROM OLD.stage THEN
    INSERT INTO public.patient_stage_history (patient_id, from_stage, to_stage, changed_at)
    VALUES (NEW.id, OLD.stage, NEW.stage, now());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS patient_stage_change_log ON public.patients;
  CREATE TRIGGER patient_stage_change_log
    AFTER UPDATE OF stage ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION public.log_patient_stage_change();
EXCEPTION WHEN undefined_table THEN
  NULL;
END $$;


-- ============================================================
-- DONE — pms_schema_v2 applied
-- ============================================================
