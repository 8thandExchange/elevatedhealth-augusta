-- PR 7: Charting core — SOAP encounters, vitals, attachments, audit log,
-- allergies, current medications, problem list; private storage bucket.

-- ---------------------------------------------------------------------------
-- patient_encounters
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patient_encounters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  encounter_date timestamptz NOT NULL DEFAULT now(),
  encounter_type text NOT NULL,
  chief_complaint text,
  subjective text,
  objective text,
  assessment text,
  plan text,
  medications_prescribed text,
  follow_up_plan text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'signed', 'amended')),
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  last_edited_by_user_id uuid REFERENCES auth.users(id),
  last_edited_at timestamptz,
  signed_by_user_id uuid REFERENCES auth.users(id),
  signed_at timestamptz,
  signed_ip_address text,
  amends_encounter_id uuid REFERENCES public.patient_encounters(id),
  internal_notes text
);

CREATE INDEX IF NOT EXISTS idx_patient_encounters_patient
  ON public.patient_encounters(patient_id, encounter_date DESC);
CREATE INDEX IF NOT EXISTS idx_patient_encounters_status
  ON public.patient_encounters(status)
  WHERE status = 'draft';
CREATE INDEX IF NOT EXISTS idx_patient_encounters_signed
  ON public.patient_encounters(signed_at)
  WHERE status = 'signed';

ALTER TABLE public.patient_encounters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patient_encounters_staff_select" ON public.patient_encounters;
CREATE POLICY "patient_encounters_staff_select" ON public.patient_encounters
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'staff'::public.app_role) OR
    public.has_role(auth.uid(), 'provider'::public.app_role) OR
    public.has_business_admin_role(auth.uid())
  );

DROP POLICY IF EXISTS "patient_encounters_staff_insert" ON public.patient_encounters;
CREATE POLICY "patient_encounters_staff_insert" ON public.patient_encounters
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'staff'::public.app_role) OR
    public.has_role(auth.uid(), 'provider'::public.app_role) OR
    public.has_business_admin_role(auth.uid())
  );

DROP POLICY IF EXISTS "patient_encounters_staff_update" ON public.patient_encounters;
CREATE POLICY "patient_encounters_staff_update" ON public.patient_encounters
  FOR UPDATE TO authenticated USING (
    (
      public.has_role(auth.uid(), 'admin'::public.app_role) OR
      public.has_role(auth.uid(), 'staff'::public.app_role) OR
      public.has_role(auth.uid(), 'provider'::public.app_role) OR
      public.has_business_admin_role(auth.uid())
    )
    AND status = 'draft'
  )
  WITH CHECK (
    (
      public.has_role(auth.uid(), 'admin'::public.app_role) OR
      public.has_role(auth.uid(), 'staff'::public.app_role) OR
      public.has_role(auth.uid(), 'provider'::public.app_role) OR
      public.has_business_admin_role(auth.uid())
    )
    AND status IN ('draft', 'signed')
  );

DROP POLICY IF EXISTS "patient_encounters_staff_supersede_signed" ON public.patient_encounters;
CREATE POLICY "patient_encounters_staff_supersede_signed" ON public.patient_encounters
  FOR UPDATE TO authenticated USING (
    (
      public.has_role(auth.uid(), 'admin'::public.app_role) OR
      public.has_role(auth.uid(), 'staff'::public.app_role) OR
      public.has_role(auth.uid(), 'provider'::public.app_role) OR
      public.has_business_admin_role(auth.uid())
    )
    AND status = 'signed'
  )
  WITH CHECK (
    (
      public.has_role(auth.uid(), 'admin'::public.app_role) OR
      public.has_role(auth.uid(), 'staff'::public.app_role) OR
      public.has_role(auth.uid(), 'provider'::public.app_role) OR
      public.has_business_admin_role(auth.uid())
    )
    AND status = 'amended'
  );

DROP POLICY IF EXISTS "patient_encounters_staff_delete" ON public.patient_encounters;
CREATE POLICY "patient_encounters_staff_delete" ON public.patient_encounters
  FOR DELETE TO authenticated USING (
    (
      public.has_role(auth.uid(), 'admin'::public.app_role) OR
      public.has_role(auth.uid(), 'staff'::public.app_role) OR
      public.has_role(auth.uid(), 'provider'::public.app_role) OR
      public.has_business_admin_role(auth.uid())
    )
    AND status = 'draft'
  );

DROP POLICY IF EXISTS "patient_encounters_patient_read_own_signed" ON public.patient_encounters;
CREATE POLICY "patient_encounters_patient_read_own_signed" ON public.patient_encounters
  FOR SELECT TO authenticated USING (
    status = 'signed' AND
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- encounter_vitals
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.encounter_vitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id uuid NOT NULL REFERENCES public.patient_encounters(id) ON DELETE CASCADE,
  systolic_bp integer,
  diastolic_bp integer,
  heart_rate integer,
  respiratory_rate integer,
  temperature_f numeric(4,1),
  weight_lbs numeric(5,1),
  height_inches numeric(4,1),
  spo2_pct integer,
  bmi numeric(4,1) GENERATED ALWAYS AS (
    CASE
      WHEN height_inches IS NOT NULL AND height_inches > 0 AND weight_lbs IS NOT NULL AND weight_lbs > 0
      THEN round(((weight_lbs / (height_inches * height_inches)) * 703)::numeric, 1)
      ELSE NULL
    END
  ) STORED,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  recorded_by_user_id uuid NOT NULL REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_encounter_vitals_encounter
  ON public.encounter_vitals(encounter_id);
CREATE INDEX IF NOT EXISTS idx_encounter_vitals_encounter_recorded
  ON public.encounter_vitals(encounter_id, recorded_at DESC);

ALTER TABLE public.encounter_vitals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "encounter_vitals_staff_all" ON public.encounter_vitals;
CREATE POLICY "encounter_vitals_staff_all" ON public.encounter_vitals
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'staff'::public.app_role) OR
    public.has_role(auth.uid(), 'provider'::public.app_role) OR
    public.has_business_admin_role(auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'staff'::public.app_role) OR
    public.has_role(auth.uid(), 'provider'::public.app_role) OR
    public.has_business_admin_role(auth.uid())
  );

DROP POLICY IF EXISTS "encounter_vitals_patient_read_signed" ON public.encounter_vitals;
CREATE POLICY "encounter_vitals_patient_read_signed" ON public.encounter_vitals
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.patient_encounters e
      WHERE e.id = encounter_vitals.encounter_id
        AND e.status = 'signed'
        AND e.patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- encounter_attachments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.encounter_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id uuid REFERENCES public.patient_encounters(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  attachment_type text NOT NULL CHECK (attachment_type IN ('lab_result', 'imaging', 'external_record', 'photo', 'other')),
  file_name text NOT NULL,
  storage_path text NOT NULL,
  file_size_bytes bigint,
  mime_type text,
  uploaded_by_user_id uuid NOT NULL REFERENCES auth.users(id),
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  description text,
  lab_collection_date date,
  CONSTRAINT encounter_attachments_encounter_or_patient CHECK (
    encounter_id IS NOT NULL OR patient_id IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_encounter_attachments_patient
  ON public.encounter_attachments(patient_id, uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_encounter_attachments_encounter
  ON public.encounter_attachments(encounter_id);

ALTER TABLE public.encounter_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "encounter_attachments_staff_select" ON public.encounter_attachments;
CREATE POLICY "encounter_attachments_staff_select" ON public.encounter_attachments
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'staff'::public.app_role) OR
    public.has_role(auth.uid(), 'provider'::public.app_role) OR
    public.has_business_admin_role(auth.uid())
  );

DROP POLICY IF EXISTS "encounter_attachments_staff_insert" ON public.encounter_attachments;
CREATE POLICY "encounter_attachments_staff_insert" ON public.encounter_attachments
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'staff'::public.app_role) OR
    public.has_role(auth.uid(), 'provider'::public.app_role) OR
    public.has_business_admin_role(auth.uid())
  );

DROP POLICY IF EXISTS "encounter_attachments_staff_update" ON public.encounter_attachments;
CREATE POLICY "encounter_attachments_staff_update" ON public.encounter_attachments
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'staff'::public.app_role) OR
    public.has_role(auth.uid(), 'provider'::public.app_role) OR
    public.has_business_admin_role(auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'staff'::public.app_role) OR
    public.has_role(auth.uid(), 'provider'::public.app_role) OR
    public.has_business_admin_role(auth.uid())
  );

DROP POLICY IF EXISTS "encounter_attachments_staff_delete" ON public.encounter_attachments;
CREATE POLICY "encounter_attachments_staff_delete" ON public.encounter_attachments
  FOR DELETE TO authenticated USING (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'provider'::public.app_role) OR
    public.has_business_admin_role(auth.uid())
  );

DROP POLICY IF EXISTS "encounter_attachments_patient_read" ON public.encounter_attachments;
CREATE POLICY "encounter_attachments_patient_read" ON public.encounter_attachments
  FOR SELECT TO authenticated USING (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
    AND (
      encounter_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.patient_encounters e
        WHERE e.id = encounter_attachments.encounter_id
          AND e.status = 'signed'
      )
    )
  );

-- ---------------------------------------------------------------------------
-- encounter_audit_log
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.encounter_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id uuid NOT NULL REFERENCES public.patient_encounters(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  action text NOT NULL CHECK (action IN ('viewed', 'created', 'edited', 'signed', 'amended', 'attachment_added', 'attachment_removed')),
  action_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_encounter_audit_encounter
  ON public.encounter_audit_log(encounter_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_encounter_audit_user
  ON public.encounter_audit_log(user_id, occurred_at DESC);

ALTER TABLE public.encounter_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "encounter_audit_log_staff_select" ON public.encounter_audit_log;
CREATE POLICY "encounter_audit_log_staff_select" ON public.encounter_audit_log
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'staff'::public.app_role) OR
    public.has_role(auth.uid(), 'provider'::public.app_role) OR
    public.has_business_admin_role(auth.uid())
  );

DROP POLICY IF EXISTS "encounter_audit_log_staff_insert" ON public.encounter_audit_log;
CREATE POLICY "encounter_audit_log_staff_insert" ON public.encounter_audit_log
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'staff'::public.app_role) OR
    public.has_role(auth.uid(), 'provider'::public.app_role) OR
    public.has_business_admin_role(auth.uid())
  );

-- ---------------------------------------------------------------------------
-- patient_allergies
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patient_allergies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  allergen text NOT NULL,
  reaction text,
  severity text CHECK (severity IN ('mild', 'moderate', 'severe', 'unknown')),
  noted_date date DEFAULT CURRENT_DATE,
  active boolean NOT NULL DEFAULT true,
  noted_by_user_id uuid NOT NULL REFERENCES auth.users(id),
  noted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_allergies_patient
  ON public.patient_allergies(patient_id)
  WHERE active = true;

ALTER TABLE public.patient_allergies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patient_allergies_staff_all" ON public.patient_allergies;
CREATE POLICY "patient_allergies_staff_all" ON public.patient_allergies
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'staff'::public.app_role) OR
    public.has_role(auth.uid(), 'provider'::public.app_role) OR
    public.has_business_admin_role(auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'staff'::public.app_role) OR
    public.has_role(auth.uid(), 'provider'::public.app_role) OR
    public.has_business_admin_role(auth.uid())
  );

DROP POLICY IF EXISTS "patient_allergies_patient_read" ON public.patient_allergies;
CREATE POLICY "patient_allergies_patient_read" ON public.patient_allergies
  FOR SELECT TO authenticated USING (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- patient_current_medications
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patient_current_medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  medication_name text NOT NULL,
  dose text,
  frequency text,
  route text,
  prescribed_by text,
  is_eha_prescribed boolean NOT NULL DEFAULT false,
  start_date date,
  end_date date,
  active boolean NOT NULL DEFAULT true,
  notes text,
  added_by_user_id uuid NOT NULL REFERENCES auth.users(id),
  added_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_current_medications_patient
  ON public.patient_current_medications(patient_id)
  WHERE active = true;

ALTER TABLE public.patient_current_medications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patient_current_medications_staff_all" ON public.patient_current_medications;
CREATE POLICY "patient_current_medications_staff_all" ON public.patient_current_medications
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'staff'::public.app_role) OR
    public.has_role(auth.uid(), 'provider'::public.app_role) OR
    public.has_business_admin_role(auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'staff'::public.app_role) OR
    public.has_role(auth.uid(), 'provider'::public.app_role) OR
    public.has_business_admin_role(auth.uid())
  );

DROP POLICY IF EXISTS "patient_current_medications_patient_read" ON public.patient_current_medications;
CREATE POLICY "patient_current_medications_patient_read" ON public.patient_current_medications
  FOR SELECT TO authenticated USING (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- patient_problem_list
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patient_problem_list (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  problem text NOT NULL,
  icd10_code text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'inactive')),
  onset_date date,
  resolved_date date,
  noted_by_user_id uuid NOT NULL REFERENCES auth.users(id),
  noted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_problem_list_patient
  ON public.patient_problem_list(patient_id)
  WHERE status = 'active';

ALTER TABLE public.patient_problem_list ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patient_problem_list_staff_all" ON public.patient_problem_list;
CREATE POLICY "patient_problem_list_staff_all" ON public.patient_problem_list
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'staff'::public.app_role) OR
    public.has_role(auth.uid(), 'provider'::public.app_role) OR
    public.has_business_admin_role(auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'staff'::public.app_role) OR
    public.has_role(auth.uid(), 'provider'::public.app_role) OR
    public.has_business_admin_role(auth.uid())
  );

DROP POLICY IF EXISTS "patient_problem_list_patient_read" ON public.patient_problem_list;
CREATE POLICY "patient_problem_list_patient_read" ON public.patient_problem_list
  FOR SELECT TO authenticated USING (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- Storage bucket: encounter-attachments (private)
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'encounter-attachments',
  'encounter-attachments',
  false,
  52428800,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "encounter_attachments_staff_upload" ON storage.objects;
CREATE POLICY "encounter_attachments_staff_upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'encounter-attachments' AND
    (
      public.has_role(auth.uid(), 'admin'::public.app_role) OR
      public.has_role(auth.uid(), 'staff'::public.app_role) OR
      public.has_role(auth.uid(), 'provider'::public.app_role) OR
      public.has_business_admin_role(auth.uid())
    )
  );

DROP POLICY IF EXISTS "encounter_attachments_staff_read" ON storage.objects;
CREATE POLICY "encounter_attachments_staff_read"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'encounter-attachments' AND
    (
      public.has_role(auth.uid(), 'admin'::public.app_role) OR
      public.has_role(auth.uid(), 'staff'::public.app_role) OR
      public.has_role(auth.uid(), 'provider'::public.app_role) OR
      public.has_business_admin_role(auth.uid())
    )
  );

DROP POLICY IF EXISTS "encounter_attachments_staff_update" ON storage.objects;
CREATE POLICY "encounter_attachments_staff_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'encounter-attachments' AND
    (
      public.has_role(auth.uid(), 'admin'::public.app_role) OR
      public.has_role(auth.uid(), 'staff'::public.app_role) OR
      public.has_role(auth.uid(), 'provider'::public.app_role) OR
      public.has_business_admin_role(auth.uid())
    )
  );

DROP POLICY IF EXISTS "encounter_attachments_staff_delete" ON storage.objects;
CREATE POLICY "encounter_attachments_staff_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'encounter-attachments' AND
    (
      public.has_role(auth.uid(), 'admin'::public.app_role) OR
      public.has_role(auth.uid(), 'provider'::public.app_role) OR
      public.has_business_admin_role(auth.uid())
    )
  );
